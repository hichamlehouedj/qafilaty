import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_MULTI_TRACE = gql`
    mutation CreateMultiTrace($content: multiTraceContent) {
        createMultiTrace(content: $content) {
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

interface TraceBox {
    id_box: string;
    status: number;
}

interface VariableProps {
    content: {
        boxTrace:   TraceBox[];
        note:       string;
        id_stock:   string;
        id_person:  string;
        id_company:  string;
    }
}

const useCreateMultiTrace = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_MULTI_TRACE, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useCreateMultiTrace;
