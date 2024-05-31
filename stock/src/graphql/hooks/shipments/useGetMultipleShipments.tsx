import { gql, OperationVariables, QueryTuple, useLazyQuery, useQuery } from "@apollo/client";

export const MULTIPLE_BOXES = gql`
  query GetBoxs($ids: [ID!]) {
    getBoxs(ids: $ids) {
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
      paid_in_office

      # recipient details

      recipient_name
      recipient_phone1
      recipient_city
      recipient_address
      recipient_loction
      # shipment details

      possibility_open
      encapsulation

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
      archived
    }
  }
`;

interface Props {}

interface VartiableProps {
  ids?: string[];
}

const useGetMultipleShipments = (): QueryTuple<any, VartiableProps> => {
  let oneShipmentResult = useLazyQuery<any, VartiableProps>(MULTIPLE_BOXES);
  return oneShipmentResult;
};

export default useGetMultipleShipments;
