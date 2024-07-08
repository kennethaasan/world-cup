import { gql } from '@apollo/client';

export const GET_OVERVIEW = gql`
  query getUser($userId: ID!) {
    getUser(userId: $userId) {
      id
      name
      points
      questions {
        question
        answer
        blueprint
        points
        max_points
      }
    }
  }
`;
