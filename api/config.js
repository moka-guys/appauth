module.exports = {
  REDIRECT_URL: process.env.REDIRECT_URL || 'https://www.google.com',
  APP_PORT: process.env.APP_PORT || 5005,
  ROOT_URL: process.env.ROOT_URL || 'http://127.0.0.1:3000/appauth',
  MAILER_URL: process.env.MAILER_URL, // || 'smtp://relay.gstt.local:25',
  MAILER_FROM: process.env.MAILER_FROM || `"Moka Alerts" <moka.alerts@gstt.nhs.uk>`,
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/appauth?replicaSet=rs0&retryWrites=true&w=majority',
  SECRET_KEY: process.env.SECRET_KEY || 'validatethis',
  TOKEN_VALIDITY: process.env.TOKEN_VALIDITY || '5d',
  ALLOWED_DOMAINS: (process.env.ALLOWED_DOMAINS || 'nhs.net,gstt.nhs.uk,viapath.co.uk,viapath.org').split(',')
};
