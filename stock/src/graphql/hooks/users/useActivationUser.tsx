import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const ACTIVE_USER = gql`
    mutation activeUser($id_person: ID!, $activation: String) {
        activeUser(id_person: $id_person, activation: $activation) {
            status
        }
    }
`;

interface VariableProps {
    id_person: string;
    activation: string;
}

const useActivationUser = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(ACTIVE_USER, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useActivationUser;
