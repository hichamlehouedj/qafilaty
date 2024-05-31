import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationTuple,
  OperationVariables,
  useMutation,
  useQuery,
} from "@apollo/client";
import { Box } from "react-feather";

export const CREATE_BOXE = gql`
  mutation CreateBox($content: boxContent!) {
    createBox(content: $content) {
      id
      code_box
      recipient_name
      recipient_phone1
      recipient_phone2
      recipient_address
      recipient_city
      categorie
      delivery_type
      fragile
      price_box
      price_delivery
      weight_box
      length_box
      width_box
      height_box
      note
      lastTrace {
        status
      }
    }
  }
`;

interface VariableProps {
  content: {
    recipient_name?: string;
    recipient_phone1?: string;
    recipient_city?: string;
    recipient_address?: string;
    categorie?: string;
    delivery_type?: string;
    fragile?: boolean;
    price_box?: number;
    price_delivery?: number;
    height_box?: string;
    width_box?: string;
    length_box?: string;
    weight_box?: string;
    note?: string;
    id_stock?: string;
    id_client?: string;
    id_person?: string;
    status_box?: number;
    command_number: string;
    TVA?: number;
    payment_type?: string;
    // extra
    recipient_phone2?: string;
    number_box?: string;
    content_box?: string;
    number_of_pieces_inside_the_box?: number;
  };
}

const useCreateShipment = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let createShipmentResult = useMutation<any, VariableProps>(CREATE_BOXE, {
    update: (cache, { data: { createBox } }) => {
      cache.modify({
        fields: {
          boxDriver(existedBoxes = [], { readField }) {
            return [...existedBoxes, createBox];
          },
        },
      });
    },
  });
  return createShipmentResult;
};

export default useCreateShipment;
