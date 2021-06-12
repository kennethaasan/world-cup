import { gql, IResolvers } from 'apollo-server-lambda';
import { Context } from '../context';
import { Question } from '../models';

export const typeDefs = gql`
  type Question {
    question: String!
    answer: String!
    blueprint: String
    points: Int
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
  },
};
