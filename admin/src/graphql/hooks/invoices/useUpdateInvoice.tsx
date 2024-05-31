import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";
import {ALL_INVOICES} from "./useGetAllInvoice";

export const UPDATE_INVOICES = gql`
    mutation updateInvoice($id: ID!, $content: contentInvoice!) {
        updateInvoice(id: $id, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id: string;
    content: {
        id_company: string;
        points: number;
    }
}

const useUpdateInvoice = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_INVOICES);
};

export default useUpdateInvoice;