import {gql, OperationVariables, QueryTuple, useLazyQuery} from "@apollo/client";

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
      paid_in_office
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
      possibility_open
      encapsulation
      recipient_loction
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
      
      client {
        id
        person {
          id
          first_name
          last_name
          email
          phone01
          phone02
          address
          city
          deleted
          createdAt
          updatedAt
        }
      }
    }
  }
`;

interface Props {}

const useGetOneShipments = (): QueryTuple<any, OperationVariables> => {
  return useLazyQuery(ONE_BOXE);
};

export default useGetOneShipments;
