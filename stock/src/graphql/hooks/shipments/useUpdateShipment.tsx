import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation} from "@apollo/client";

export const UPDATE_BOX = gql`
    mutation UpdateBox($id: ID!, $content: boxContent!) {
        updateBox(id: $id, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id: string;
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
        id_client?: string;
        id_person?: string;
        command_number: string;
        payment_type?: string;
        // extra
        recipient_phone2?: string;
        number_box?: string;
        content_box?: string;
        number_of_pieces_inside_the_box?: number;
        paid_in_office: boolean;

        recipient_loction: string;
        possibility_open: boolean;
        encapsulation: boolean;
    };
}

const useUpdateShipment = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    let updateShipmentResult = useMutation<any, VariableProps>(UPDATE_BOX);
    return updateShipmentResult;
};

export default useUpdateShipment;