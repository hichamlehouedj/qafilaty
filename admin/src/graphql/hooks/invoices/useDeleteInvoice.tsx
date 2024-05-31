import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";
import {ALL_INVOICES} from "./useGetAllInvoice";

export const DELETE_INVOICES = gql`
    mutation deleteInvoice($id: ID!) {
        deleteInvoice(id: $id) {
            status
        }
    }
`;

interface VariableProps {
    id: string;
}

const useDeleteInvoice = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(DELETE_INVOICES);
};

export default useDeleteInvoice;
