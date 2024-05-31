import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_ENVELOPE = gql`
    mutation addEnvelopeCode($idStock: ID!, $city: String) {
        addEnvelopeCode(idStock: $idStock, city: $city) {
            codeEnvelope
        }
    }
`;

interface VariableProps {
    idStock: string;
    city: string;
}

const useAddEnvelope = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_ENVELOPE, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useAddEnvelope;
