import { ApolloServer } from 'apollo-server';
import responseCachePlugin from 'apollo-server-plugin-response-cache';
import { getContext } from '../context';
import { getDataSources } from '../data-sources';
import { resolvers, typeDefs } from '../schema';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [responseCachePlugin()],
  dataSources: () => {
    return getDataSources();
  },
  context: () => {
    return getContext();
  },
});

server
  .listen()
  .then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  })
  .catch((err) => {
    console.log('Server error', err);
  });
