import gql from 'graphql-tag';
import { User } from '../models';
import {
  IQuestion,
  resolvers as QuestionResolvers,
  typeDefs as QuestionTypeDefs,
} from './Question';
import { IResolvers } from './types';

export const typeDefs = gql`
  ${QuestionTypeDefs}

  type User {
    id: ID!
    name: String!
    rank: Int!
    points: Int!
    maxPoints: Int!
    remainingPossiblePoints: Int!
    questions: [Question!]
  }
`;

export type IUser = User;

export const resolvers: IResolvers<IUser> = {
  ...QuestionResolvers,

  User: {
    id: (user): string => {
      return user.id;
    },
    name: (user): string => {
      return user.name;
    },
    rank: (user): number => {
      return user.rank;
    },
    points: (user): number => {
      return user.points;
    },
    maxPoints: (user): number => {
      return user.maxPoints;
    },
    remainingPossiblePoints: (user): number => {
      return user.remainingPossiblePoints;
    },
    questions: (user): IQuestion[] | undefined => {
      return user.questions;
    },
  },
};
