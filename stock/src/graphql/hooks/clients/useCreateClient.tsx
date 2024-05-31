import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_CLIENT = gql`
    mutation createClient($content: contentClient) {
        createClient(content: $content) {
            id
            person {
                id
                first_name
                last_name
                email
                phone01
                phone02
                city
                address
                deleted
                createdAt
                updatedAt
            }
            user {
                id
                user_name
                password
                role
                activation
                lastConnection
                lastDisconnection
            }
        }
    }
`;

interface VariableProps {
    content: {
        person: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone01?: string;
            phone02: string;
            city?: string;
            address?: string;
            id_stock?: string;
        }
    };
}

const useCreateClient = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    let createClientResult = useMutation<any, VariableProps>(CREATE_CLIENT, {
        update: (cache, { data: { createClient } }) => {
            console.log("🚀 ~ file: useCreateClient.tsx ~ line 79 ~ cache", cache);
            cache.modify({
                fields: {
                    allClients(existedClients = [], { readField }) {
                        return [...existedClients, createClient];
                    },
                },
            });
        },
        onCompleted: data => {
            console.log(data)
        }
    });
    return createClientResult;
};

export default useCreateClient;
