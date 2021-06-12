import { gql, IResolvers } from 'apollo-server-lambda';
import { Context } from '../context';
import { User } from '../models';
import {
  IQuestion,
  resolvers as QuestionResolvers,
  typeDefs as QuestionTypeDefs,
} from './Question';

export const typeDefs = gql`
  ${QuestionTypeDefs}

  type User {
    id: ID!
    name: String!
    points: Int!
    questions: [Question!]
  }
`;

export type IUser = User;

export const resolvers: IResolvers<IUser, Context> = {
  ...QuestionResolvers,

  User: {
    id: (user): string => {
      return user.id;
    },
    name: (user): string => {
      return user.name;
    },
    points: (user): number => {
      return user.points;
    },
    questions: (user): IQuestion[] | undefined => {
      return user.questions;
    },
  },
};
