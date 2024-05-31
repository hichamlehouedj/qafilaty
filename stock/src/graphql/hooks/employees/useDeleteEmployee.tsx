import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const DELETE_FACTOR = gql`
    mutation deleteFactor($id_person: ID!) {
        deleteFactor(id_person: $id_person) {
            status
        }
    }
`;

interface VariableProps {
    id_person: string;
}

const useDeleteEmployee = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(DELETE_FACTOR, {
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

export default useDeleteEmployee;