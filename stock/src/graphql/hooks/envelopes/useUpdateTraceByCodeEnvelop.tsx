import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const UPDATE_TRACE_BY_CODE_ENVELOPE = gql`
    mutation updateTraceByCodeEnvelop($codeEnvelop: String, $content: envelopTraceContent!) {
        updateTraceByCodeEnvelop(codeEnvelop: $codeEnvelop, content: $content) {
            id
            status
        }
    }
`;

interface VariableProps {
    codeEnvelop:    string;
    content: {
        status:     string;
        note:       string;
        id_stock:   string;
        id_person:  string;
    }
}

const useUpdateTraceByCodeEnvelop = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_TRACE_BY_CODE_ENVELOPE, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useUpdateTraceByCodeEnvelop;
