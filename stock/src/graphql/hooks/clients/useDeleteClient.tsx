import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const DELETE_CLIENT = gql`
    mutation deleteClient($id_person: ID!) {
        deleteClient(id_person: $id_person) {
            status
        }
    }
`;

interface VariableProps {
    id_person: string;
}

const useDeleteClient = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(DELETE_CLIENT, {
        // update: (cache, { data: { createClient } }) => {
        //     console.log("🚀 ~ file: useCreateEmploye.tsx ~ line 79 ~ cache", cache);
        //     // cache.modify({
        //     //     fields: {
        //     //         allClients(existedClients = [], { readField }) {
        //     //             return [...existedClients, createClient];
        //     //         },
        //     //     },
        //     // });
        // },
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useDeleteClient;