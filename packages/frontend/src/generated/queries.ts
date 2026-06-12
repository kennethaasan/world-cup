/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  Date: { input: string; output: string };
  DateTime: { input: string; output: string };
};

export type Query = {
  __typename?: 'Query';
  getUser?: Maybe<User>;
  getUsers?: Maybe<Array<User>>;
};

export type QueryGetUserArgs = {
  userId: Scalars['ID']['input'];
};

export type Question = {
  __typename?: 'Question';
  answer: Scalars['String']['output'];
  blueprint?: Maybe<Scalars['String']['output']>;
  category: QuestionCategory;
  max_points?: Maybe<Scalars['Int']['output']>;
  points?: Maybe<Scalars['Int']['output']>;
  question: Scalars['String']['output'];
  status: QuestionStatus;
};

export type QuestionCategory =
  | 'AWARDS'
  | 'KNOCKOUT'
  | 'MATCHES'
  | 'NORWAY'
  | 'OTHER';

export type QuestionStatus = 'CORRECT' | 'PARTIAL' | 'UNSCORED' | 'WRONG';

export type User = {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  maxPoints: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  points: Scalars['Int']['output'];
  questions?: Maybe<Array<Question>>;
  rank: Scalars['Int']['output'];
  remainingPossiblePoints: Scalars['Int']['output'];
};

export type GetUserQueryVariables = Exact<{
  userId: string | number;
}>;

export type GetUserQuery = {
  getUser: {
    id: string;
    name: string;
    rank: number;
    points: number;
    maxPoints: number;
    remainingPossiblePoints: number;
    questions: Array<{
      question: string;
      answer: string;
      blueprint: string | null;
      points: number | null;
      max_points: number | null;
      status: QuestionStatus;
      category: QuestionCategory;
    }> | null;
  } | null;
};

export type GetUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
  getUsers: Array<{
    id: string;
    name: string;
    rank: number;
    points: number;
    maxPoints: number;
    remainingPossiblePoints: number;
    questions: Array<{
      question: string;
      answer: string;
      blueprint: string | null;
      points: number | null;
      max_points: number | null;
      status: QuestionStatus;
      category: QuestionCategory;
    }> | null;
  }> | null;
};

export const GetUserDocument = gql`
  query getUser($userId: ID!) {
    getUser(userId: $userId) {
      id
      name
      rank
      points
      maxPoints
      remainingPossiblePoints
      questions {
        question
        answer
        blueprint
        points
        max_points
        status
        category
      }
    }
  }
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions: ApolloReactHooks.QueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  > &
    ({ variables: GetUserQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export function useGetUserLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options
  );
}
export type GetUserQueryResult = ApolloReactCommon.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const GetUsersDocument = gql`
  query getUsers {
    getUsers {
      id
      name
      rank
      points
      maxPoints
      remainingPossiblePoints
      questions {
        question
        answer
        blueprint
        points
        max_points
        status
        category
      }
    }
  }
`;

/**
 * __useGetUsersQuery__
 *
 * To run a query within a React component, call `useGetUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUsersQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<
    GetUsersQuery,
    GetUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useQuery<GetUsersQuery, GetUsersQueryVariables>(
    GetUsersDocument,
    options
  );
}
export function useGetUsersLazyQuery(
  baseOptions?: ApolloReactHooks.LazyQueryHookOptions<
    GetUsersQuery,
    GetUsersQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return ApolloReactHooks.useLazyQuery<GetUsersQuery, GetUsersQueryVariables>(
    GetUsersDocument,
    options
  );
}
export type GetUsersQueryResult = ApolloReactCommon.QueryResult<
  GetUsersQuery,
  GetUsersQueryVariables
>;
