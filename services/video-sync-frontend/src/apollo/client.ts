import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { typeDefs } from './typeDefs';
import { resolvers } from './resolvers';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000/graphql',
  options: {
    reconnect: true,
  },
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  typeDefs,
  resolvers,
});

// Initialize local state
client.writeQuery({
  query: gql`
    query GetTimeSyncState {
      timeSyncState @client {
        connectionStatus
        serverTime
        offset
        roundTripDelay
      }
    }
  `,
  data: {
    timeSyncState: {
      connectionStatus: 'Disconnected',
      serverTime: null,
      offset: 0,
      roundTripDelay: 0,
      __typename: 'TimeSyncState',
    },
  },
});
