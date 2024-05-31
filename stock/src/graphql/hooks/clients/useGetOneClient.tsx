import {gql, OperationVariables, QueryTuple, useLazyQuery, useQuery,} from "@apollo/client";

export const ONE_CLIENT = gql`
  query Client($clientId: ID!) {
    client(id: $clientId) {
      id
      person {
        id
        first_name
        last_name
        email
        phone01
        phone02
        city
        address
        deleted
        createdAt
        updatedAt
      }
      user {
        id
        user_name
        activation
        lastConnection
        lastDisconnection
      }
    }
  }
`;

interface Props {}

const useGetOneClient = (): QueryTuple<any, OperationVariables> => {
  let oneClientResult = useLazyQuery(ONE_CLIENT);
  return oneClientResult;
};

export default useGetOneClient;
