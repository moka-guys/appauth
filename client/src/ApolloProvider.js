import React from 'react';
import App from './App';
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  InMemoryCache,
  HttpLink,
  from
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const uri = process.env.NODE_ENV === 'development' ? 'http://localhost:5555/appauth/api' : '/appauth/api';
const httpLink = new HttpLink({ uri });

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`,
      )
    });
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authLink = new ApolloLink((operation, forward) => {
  operation.setContext(context => {
    const token = localStorage.getItem('jwtToken');
    return {
      ...context,
      headers: {
        ...context.headers,
        Authorization: token ? `Bearer ${token}` : ''
      },
    }
  });
  return forward(operation);
});


const client = new ApolloClient({
  link: from([authLink, errorLink, httpLink]),
  cache: new InMemoryCache()
});

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);
