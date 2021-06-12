import { gql } from '@apollo/client';

export const GET_OVERVIEW = gql`
  query getUsers {
    getUsers {
      id
      name
      points
      questions {
        question
        answer
        blueprint
        points
      }
    }
  }
`;
