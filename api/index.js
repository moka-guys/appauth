const url = require('url');
const path = require('path');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGO_URL, APP_PORT, ROOT_URL } = require('./config.js');

// apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req })
});

// define URL and App bundle path
const root_url = new url.URL(ROOT_URL);
const app_path = 'app';

// use express to serve static files (the app bundle)
const app = express();
app.use(root_url.pathname, express.static(path.join(__dirname, app_path)));

// ensure routes are managed by react-router
app.get(path.join(root_url.pathname, '*'), function(req, res) {
  res.sendFile(path.join(__dirname, app_path, 'index.html'));
});

// apply apollo server middleware
server.applyMiddleware({
  app,
  path: path.join(root_url.pathname,'api'),
});

mongoose
  .connect(MONGO_URL, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('MongoDB Connected');
    return app.listen({ port: APP_PORT });
  })
  .then((res) => {
    console.log(`Server running at ${server.graphqlPath}...`);
  })
  .catch(err => {
    console.error(err)
  })
