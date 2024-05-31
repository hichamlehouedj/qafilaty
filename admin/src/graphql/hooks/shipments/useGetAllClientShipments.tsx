import { gql, useQuery } from "@apollo/client";

export const ALL_CLIENT_BOXES = gql`
  query BoxDriver($idDriver: ID) {
    boxDriver(idDriver: $idDriver) {
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

const useGetAllClientShipments = ({ client_id }: { client_id: string }) => {
  let { data } = useQuery(ALL_CLIENT_BOXES, {
    variables: {
      idDriver: client_id,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  // return data?.boxDriver || [{}];
  return data?.boxDriver.length ? data?.boxDriver : [{}];
};

export default useGetAllClientShipments;
