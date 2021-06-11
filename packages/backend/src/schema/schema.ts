import { gql, IResolvers } from 'apollo-server-lambda';
import { GraphQLScalarType } from 'graphql';
import { GraphQLDate, GraphQLDateTime, GraphQLTime } from 'graphql-iso-date';
import { Context } from '../context';
import { Query, resolvers as QueryResolvers } from './Query';

export const typeDefs = gql`
  scalar Date
  scalar Time
  scalar DateTime

  ${Query}
`;

export const resolvers: IResolvers<undefined, Context> = {
  Date: GraphQLDate as GraphQLScalarType,
  Time: GraphQLTime as GraphQLScalarType,
  DateTime: GraphQLDateTime as GraphQLScalarType,

  ...QueryResolvers,
};
