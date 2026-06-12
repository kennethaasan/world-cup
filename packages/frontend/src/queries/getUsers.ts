import { gql } from '@apollo/client';

export const GET_OVERVIEW = gql`
  query getUsers {
    getUsers {
      id
      name
      rank
      points
      max_points
      remaining_possible_points
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
