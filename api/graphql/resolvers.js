const graphql = require('graphql');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server-express');
const checkAuth = require('../util/check-auth');
const { validateEmailDomain } = require('../util/validators');
const { sendLoginToken, checkLoginToken, sendApprovalTokens, checkApprovalToken } = require('../util/email-validation');
const { SECRET_KEY, TOKEN_VALIDITY, REDIRECT_URL } = require('../config');
const User = require('../models/User');

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      redirect: REDIRECT_URL,
    },
    SECRET_KEY,
    { expiresIn: TOKEN_VALIDITY }
  );
}

module.exports = {
  Date: new graphql.GraphQLScalarType({
    name: 'Date',
    description: 'ISODateTime custom scalar',
    parseValue(value,a,b,c) {
      return new Date(value); // value from client
    },
    serialize(value) {
      return value;  // value sent to client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);  // AST value always in string format
      }
      if (ast.kind === Kind.STRING) {
        return new Date(ast.value)
      }
      return null;
    },
  }),
  User: {
    id: ({ _id, id }) => _id || id,
  },
  Query: {
    async user(root, args, context) {
      const user = checkAuth(context);
      return await User.findOne({ _id: user.id });
    }
  },
  Mutation: {
    async login(_, { token }) {
      const user = await checkLoginToken(token);
      if (!user) throw new UserInputError('Invalid Token/Not Found');


      // resend token if it has expired
      if (user.login_token.expires < Date.now()) {
        await sendLoginToken(user);
        throw new UserInputError('Token expired. A new one has been sent to your email.');
      }
      
      // invalidate login token
      user.login_token = null;
      await user.save();
      
      // generate JWT token
      const jwtoken = generateToken(user);

      // return token with user
      return {
        ...user._doc,
        id: user._id,
        token: jwtoken
      };
    },
    async requestLogin(_, { email }) {
      // validate email
      const validation = validateEmailDomain(email);
      if (!validation.valid) throw new UserInputError(Object.values(validation.errors)[0]);
      
      // check user
      let user = await User.findOne({ email });
      
      // create new one if needed
      if (!user) {
        user = new User({ email: email.toLowerCase(), validation_token: null});
        await user.save();
      }

      // if not approved, send email to approvers
      if (!user.approvedAt) {
        const pending_tokens = user.approval_tokens && user.approval_tokens.tokens && user.approval_tokens.tokens.length; 
        const pending_current = user.approval_tokens && user.approval_tokens.expires && user.approval_tokens.expires > Date.now();
        console.log({pending_tokens,pending_current});
        if (pending_tokens && pending_current) {
          throw new UserInputError('Approval still pending.');
        } else {
          // send approval email (no approval set or has expired)
          const approval_level = sendApprovalTokens(user);
          console.log({approval_level});
          throw new UserInputError('Approval requested. You will receive an email when your account is approved.');
        }
      }
      
      if (user.approvedLevel) {
        const pending_token = user.login_token && user.login_token.token; 
        const pending_current = user.login_token && user.login_token.expires && user.login_token.expires > Date.now();
        console.log({pending_token,pending_current});
        if (pending_token && pending_current) {
          const validMinutes = Math.floor((user.login_token.expires - Date.now()) / (1000*60));
          throw new UserInputError(`Check your email or wait ${validMinutes} minutes before requesting a new login.`);
        } else {
          sendLoginToken(user);
        }
      } else {
        throw new UserInputError('You have not been granted access to this app.');
      }
      return true;
    },
    async approveUser(_, { token }, context) {
      // check if validation token exists
      let user = await User.findOne({ "approval_tokens.tokens": token });
      if (!user) throw new UserInputError('Unknown approval token');

      // if yes, validate user and notify
      return checkApprovalToken(token);
    },
  },
};
