import { gql, IResolvers } from 'apollo-server-lambda';
import { Context } from '../context';

export const Query = gql`
  type Query {
    getUsers: String!
  }
`;

export const resolvers: IResolvers<undefined, Context> = {
  Query: {
    getUsers: (): string => {
      return 'Hello World';
    },
  },
};
