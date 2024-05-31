import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_INVOICE_TRACE = gql`
    mutation createInvoiceTrace($content: invoiceTraceContent) {
        createInvoiceTrace(content: $content) {
            id
            status
            box {
                id
                code_invoice
            }
            stock {
                id
            }
        }
    }
`;

interface VariableProps {
    content: {
        idS:        string[]
        status:     number;
        id_stock:    string;
        id_person:   string;
        note:       string;
    }
}

const useCollectedAmounts = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_INVOICE_TRACE, {
        onCompleted: data => {
            // console.log(data)
        }
    });
};

export default useCollectedAmounts;
