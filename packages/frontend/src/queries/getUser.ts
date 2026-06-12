import { gql } from '@apollo/client';

export const GET_OVERVIEW = gql`
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
