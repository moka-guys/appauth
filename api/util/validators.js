const { ALLOWED_DOMAINS } = require('../config.js');

module.exports.validateEmailDomain = (email) => {
  const errors = {};
  if (email.trim() === '') {
    errors.email = 'Email must not be empty';
  } else {
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@((?:[0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9}))$/;
    const match = email.match(regEx);
    if (!match) {
      errors.email = 'Email must be a valid email address';
    } else {
      const domain = match[3]
      if (!ALLOWED_DOMAINS.includes(domain)) {  
        errors.email = `Invalid email domain (use one of ${ALLOWED_DOMAINS.join(', ')})`;
      }
    }
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1
  };
};