import { gql, useQuery } from "@apollo/client";

export const ALL_CLIENTS = gql`
  query allClients($IdStock: ID!) {
    allClients(idStock: $IdStock) {
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

const useGetAllClients = ({ stock_id }: { stock_id: string }) => {
    let { data, loading } = useQuery(ALL_CLIENTS, {
        variables: {
            IdStock: stock_id,
        },
    });
    return [data?.allClients || [], loading];
};

export default useGetAllClients;
