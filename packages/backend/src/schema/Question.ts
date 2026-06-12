import gql from 'graphql-tag';
import { Context } from '../context';
import { Question } from '../models';
import { IResolvers } from './types';

export const typeDefs = gql`
  enum QuestionStatus {
    UNSCORED
    WRONG
    PARTIAL
    CORRECT
  }

  enum QuestionCategory {
    MATCHES
    KNOCKOUT
    AWARDS
    NORWAY
    OTHER
  }

  type Question {
    question: String!
    answer: String!
    blueprint: String
    points: Int
    max_points: Int
    status: QuestionStatus!
    category: QuestionCategory!
  }
`;

export type IQuestion = Question;

export const resolvers: IResolvers<IQuestion, Context> = {
  Question: {
    question: (question): string => {
      return question.question;
    },
    answer: (question): string => {
      return question.answer;
    },
    blueprint: (question): string | undefined => {
      return question.blueprint;
    },
    points: (question): number | undefined => {
      return question.points;
    },
    max_points: (question): number | undefined => {
      return question.maxPoints;
    },
    status: (question): IQuestion['status'] => {
      return question.status;
    },
    category: (question): IQuestion['category'] => {
      return question.category;
    },
  },
};
