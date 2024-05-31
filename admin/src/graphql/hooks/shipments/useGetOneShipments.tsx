import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from "@apollo/client";

export const ONE_BOXE = gql`
  query Box($boxId: ID) {
    box(id: $boxId) {
      # general details
      id
      lastTrace {
        status
      }
      code_box
      # content_box
      price_box
      price_delivery
      createdAt

      # recipient details

      recipient_name
      recipient_phone1
      recipient_city
      recipient_address

      # shipment details

      payment_type
      delivery_type
      height_box
      width_box
      weight_box
      length_box
      note
      fragile
      categorie
      command_number
      traceBox {
        id
        note
        status
        createdAt
        person {
          first_name
          last_name
        }
        stock {
          name
        }
      }
      archived
    }
  }
`;

interface Props {}

const useGetOneShipments = (): QueryTuple<any, OperationVariables> => {
  let oneShipmentResult = useLazyQuery(ONE_BOXE);
  return oneShipmentResult;
};

export default useGetOneShipments;
