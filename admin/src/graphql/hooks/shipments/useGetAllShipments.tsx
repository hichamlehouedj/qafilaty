import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES = gql`
  query AllBox($allBoxIdStock: ID!) {
    allBox(idStock: $allBoxIdStock) {
      id
      recipient_name
      recipient_city
      code_box
      lastTrace {
        status
        stock {
          id
        }
      }
      createdAt
      archived
    }
  }
`;

interface Props {}

const useGetAllShipments = ({ stock_id }: { stock_id: string }) => {
  let { data } = useQuery(ALL_BOXES, {
    variables: {
      allBoxIdStock: stock_id,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  return data?.allBox || [];
};

export default useGetAllShipments;
