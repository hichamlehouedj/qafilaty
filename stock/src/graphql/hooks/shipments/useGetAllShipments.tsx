import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES = gql`
  query AllBox($allBoxIdStock: ID!) {
    allBox(idStock: $allBoxIdStock) {
      id
      recipient_name
      recipient_city
      recipient_loction
      code_box
      price_box
      lastTrace {
        status
        stock {
          id
        }
      }
      client {
        id
        person {
          first_name
          last_name
          address
          phone01
          list_stock_accesses {
            stock {
              id
            }
          }
        }
      }
      createdAt
      archived
    }
  }
`;

interface Props {}

const useGetAllShipments = ({ stock_id }: { stock_id: string }) => {
  let { data, loading } = useQuery(ALL_BOXES, {
    variables: {
      allBoxIdStock: stock_id,
    },
  });
  return [data?.allBox || [], loading];
};

export default useGetAllShipments;
