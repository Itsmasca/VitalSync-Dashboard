'use client'

import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { getAccessToken } from './auth';

// URLs base - GraphQL está en /graphql directamente
const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || BASE_URL.replace('http', 'ws') + '/graphql';

// HTTP Link para queries y mutations
const httpLink = createHttpLink({
  uri: `${BASE_URL}/graphql`,
});

// Auth Link - agrega el token JWT a cada request
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// WebSocket Link para subscriptions (solo en cliente)
let wsLink = null;
if (typeof window !== 'undefined') {
  wsLink = new GraphQLWsLink(
    createClient({
      url: WS_URL,
      connectionParams: () => {
        const token = getAccessToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
      shouldRetry: () => true,
      retryAttempts: 5,
    })
  );
}

// Split Link - usa WebSocket para subscriptions, HTTP para el resto
const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

// Cliente Apollo
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Merge de vitals por member
          vitals: {
            keyArgs: ['memberId'],
            merge(existing = [], incoming) {
              return [...incoming];
            },
          },
          // Merge de alerts
          alertsByMember: {
            keyArgs: ['memberId'],
            merge(existing = [], incoming) {
              return [...incoming];
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default apolloClient;
