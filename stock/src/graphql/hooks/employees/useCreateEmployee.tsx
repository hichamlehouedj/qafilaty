import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const CREATE_FACTOR = gql`
    mutation createFactor($content: contentFactor!) {
        createFactor(content: $content) {
            id
            department
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
        department: string;
        salary_type: string;
        salary: number;
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

const useCreateEmployee = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_FACTOR, {
        update: (cache, { data: { createFactor } }) => {
            cache.modify({
                fields: {
                    allFactors(existedFactors = [], { readField }) {
                        return [...existedFactors, createFactor];
                    },
                },
            });
        },
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useCreateEmployee;
