import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const UPDATE_CLIENT = gql`
    mutation updateClient($id_person: ID!, $content: contentClient!) {
        updateClient(id_person: $id_person, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id_person: string;
    content: {
        person: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone01?: string;
            phone02: string;
            address?: string;
            city?: string;
        }
    };
}

const useUpdateClient = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_CLIENT, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useUpdateClient;
