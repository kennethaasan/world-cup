import {
  DateResolver,
  DateTypeDefinition,
  DateTimeResolver,
  DateTimeTypeDefinition,
} from 'graphql-scalars';
import gql from 'graphql-tag';

import { Query, resolvers as QueryResolvers } from './Query';
import { IResolvers } from './types';

export const typeDefs = gql`
  ${DateTypeDefinition}
  ${DateTimeTypeDefinition}

  ${Query}
`;

export const resolvers: IResolvers = {
  Date: DateResolver,
  DateTime: DateTimeResolver,
  ...QueryResolvers,
};
