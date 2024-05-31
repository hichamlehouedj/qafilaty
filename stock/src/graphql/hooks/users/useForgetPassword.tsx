import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";

export const FORGET_PASSWORD = gql`
    mutation forgetPassword($email: String) {
        forgetPassword(email: $email) {
            status
        }
    }
`;

interface VariableProps {
    email: string;
}

const useForgetPassword = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(FORGET_PASSWORD, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useForgetPassword;
