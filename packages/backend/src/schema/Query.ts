import { gql } from 'apollo-server-lambda';
import { Context } from '../context';
import { GoogleAPI } from '../data-sources/google';
import { IResolvers } from './types';
import {
  IUser,
  resolvers as UserResolvers,
  typeDefs as UserTypeDefs,
} from './User';

export const Query = gql`
  ${UserTypeDefs}

  type Query {
    getUsers: [User!]
    getUser(userId: ID!): User
  }
`;

export const resolvers: IResolvers<undefined, Context> = {
  ...UserResolvers,

  Query: {
    getUsers: (): Promise<IUser[] | undefined> => {
      return new GoogleAPI().getUsers();
    },
    getUser: (
      _: undefined,
      args: { userId: string }
    ): Promise<IUser | undefined> => {
      return new GoogleAPI().getUser(args);
    },
  },
};
