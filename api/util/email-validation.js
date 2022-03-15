const nodemailer = require("nodemailer");
const { sampleSize } = require('lodash');
const crypto = require("crypto");
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { MAILER_URL, MAILER_FROM, ROOT_URL, SECRET_KEY } = require('../config');

// mailer function
const createMailer = (url) => {
  if (url) {
    const smtp = new URL(url);
    return nodemailer.createTransport({
      host: smtp.hostname,
      port: smtp.port,
      secure: false,
      tls: {
        maxVersion: 'TLSv1.3',
        minVersion: 'TLSv1',
        rejectUnauthorized: false
      }
    });
  }
  // just print to console if no MAILER_URL is set
  return {
    sendMail: async (options) => { console.log(options) }
  };
}; 

// create mailer function
const mailer = createMailer(MAILER_URL);

const LEVELS = [
  "Block",
  "Approve access",
  "Approve and grant approval rights"
];

const APPROVALS = [
  "You have been blocked from accessing the application.",
  "You have been granted access to the application.",
  "You have been granted approval rights to the application.",
];

// generates and send signed approval tokens
module.exports.sendApprovalTokens = async (user) => {
  console.log({user})
  let tokens = [];
  // send email to max 3 admins
  const admins = await User.find({ "approvedLevel": 2 });
  console.log({admins});
  if (admins && admins.length) {
    sampleSize(admins, 3).forEach(async (admin) => {
      const adminTokens = LEVELS.map((level,i) => {
        return jwt.sign(
          {
            email: user.email,
            level: i,
            approver: admin.email,
          },
          SECRET_KEY,
          { expiresIn: '1d' }
        );
      });
      // store generated Tokens (in case we have to prove who was sent a token)
      tokens = [ ...tokens, ...adminTokens ];
      // create email for admin approval
      const mailOptions = {
        from: MAILER_FROM, // sender address
        to: `"AuthApp Approver" <${admin.email}>`,
        subject: "[AUTHAPP] User Access request", // Subject line
        html: `<h5>AppAuth</h5>
        <p>A new user requested access approval. Click on the corresponding link to deny or approve the request:</p>
        ${adminTokens.map((t,i) => {
          const tokenlink = `${ROOT_URL}/approve?token=${t}`;
          return `<a href="${tokenlink}">${LEVELS[i]}</a><br/>`;
        })}
        <p>If you are not an admin, please ignore this email.</p>
        `
      };
      // email tokens (or just print if not in production)
      await mailer.sendMail(mailOptions);
    });
    // save the tokens (to prevent requesting approval multiple times)
    user.approval_tokens = {
      tokens, 
      expires: Date.now() + (23 * 60 * 60 * 1000), // check only if less old than one day (well, 23h)
    };
  } else {
    // no approvers available, set as first approver
    user.approvedAt = Date.now();
    user.approvedBy = user.email;
    user.approvedLevel = 2;
    user.approval_token = null;
  }
  // save user
  await user.save();
  return await user.approvedLevel;
};

// send login token (not readable)
module.exports.sendLoginToken = async (user) => {
  user.login_token = {
    token: crypto.randomBytes(16).toString("hex"),
    expires: Date.now() + (60 * 60 * 1000), // login valid for one hour
  }
  await user.save();
  
  // send email
  const tokenlink = `${ROOT_URL}/login?token=${user.login_token.token}`;
  const mailOptions = {
    from: MAILER_FROM, // sender address
    to: user.email, // receiver
    subject: "[AUTHAPP] Login", // Subject line
    text: `To login please open the following link:
    ${tokenlink}
    `, // plain text body
    html: `<p>To login please open the following link:</p>
    <a href="${tokenlink}">Login</a>
    `, // html body
  };
  await mailer.sendMail(mailOptions);
};

module.exports.checkApprovalToken = async (token) => {
  // decode and verify expiry and signature of supplied token 
  const { email, level, approver, ...rest } = jwt.verify(token, SECRET_KEY);

  // check if user exists and email has not been changed since
  const user = await User.findOne({ email, "approval_tokens.tokens": token }); // find user by token
  if (!user) return;

  // update user approval
  user.approvedAt = Date.now();
  user.approvedBy = approver;
  user.approvedLevel = level;
  user.approval_tokens = null;

  // notify user
  const loginlink = `${ROOT_URL}/login`;
  const mailOptions = {
    from: MAILER_FROM, // sender address
    to: user.email,
    subject: "[AUTHAPP] User Approval Response", // Subject line
    text: level ? `${APPROVALS[level]} To login please open the following link ${loginlink}` :
      `${APPROVALS[level]} Please contact the approver ${approver}`, // plain text body
    html: level ? `<p>${APPROVALS[level]} To login please open the following link:</p>
    <a href="${loginlink}">Login</a>` : 
      `<p>${APPROVALS[level]}<br/>
      Please contact <a href="mailto:${approver}">${approver}</a></p>`, // html body
  };
  await mailer.sendMail(mailOptions);
  await user.save();
  return user._doc;
};

module.exports.checkLoginToken = async (token) => {
  return await User.findOne({ "login_token.token": token }); // find user by token
};
