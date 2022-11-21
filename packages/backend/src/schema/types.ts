import type {
  IResolvers as IGraphQLToolsResolvers,
} from '@graphql-tools/utils';
import { Context } from '../context';

export type IResolvers<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TSource = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs = Record<string, any>
> = IGraphQLToolsResolvers<TSource, Context, TArgs>;
