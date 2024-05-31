import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const DELETE_ENVELOPE = gql`
    mutation deleteEnvelopeCode($codeEnvelope: String) {
        deleteEnvelopeCode(codeEnvelope: $codeEnvelope) {
            codeEnvelope
        }
    }
`;

interface VariableProps {
    codeEnvelope: string;
}

const useRemoveEnvelope = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(DELETE_ENVELOPE, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useRemoveEnvelope;