import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_USER = gql`
    mutation createUser($content: contentUser) {
        createUser(content: $content) {
            token
        }
    }
`;

interface VariableProps {
    content: {
        user_name?: string;
        password?: string;
        role?: string;
        id_person?: string;
    };
}

const useCreateUser = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    let createUserResult = useMutation<any, VariableProps>(CREATE_USER, {
        update: (cache, { data: { createUser } }) => {
            console.log("🚀 ~ file: useCreateUser.tsx ~ line 79 ~ cache", cache);
            // cache.modify({
            //     fields: {
            //         allClients(existedClients = [], { readField }) {
            //             return [...existedClients, ];
            //         },
            //     },
            // });
        },
        onCompleted: data => {
            console.log(data)
        }
    });
    return createUserResult;
};

export default useCreateUser;
