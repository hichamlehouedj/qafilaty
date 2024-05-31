import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";
import {ALL_INVOICES} from "./useGetAllInvoice";

export const CREATE_INVOICES = gql`
    mutation createInvoice($content: contentInvoice!) {
        createInvoice(content: $content) {
            id
            code_invoice
            points
            price
            status
            createdAt
            updatedAt
        }
    }
`;

interface VariableProps {
    content: {
        id_company: string;
        points: number;
    }
}

const useCreateInvoice = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_INVOICES, {
        update: (cache, { data: { createInvoice } }) => {
            cache.modify({
                fields: {
                    allInvoices(existedInvoices = [], { readField }) {
                        return [...existedInvoices, createInvoice];
                    },
                },
            });
        },
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useCreateInvoice;
