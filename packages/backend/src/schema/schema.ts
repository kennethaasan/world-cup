import { gql } from 'apollo-server-lambda';
import {
  DateResolver,
  DateTypeDefinition,
  DateTimeResolver,
  DateTimeTypeDefinition,
} from 'graphql-scalars';

import { Query, resolvers as QueryResolvers } from './Query';
import { IResolvers } from './types';

export const typeDefs = gql`
  ${DateTypeDefinition}
  ${DateTimeTypeDefinition}

  ${Query}
`;

export const resolvers: IResolvers<undefined> = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  ...QueryResolvers,
};
