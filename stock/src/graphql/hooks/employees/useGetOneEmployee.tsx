import {gql, OperationVariables, QueryTuple, useLazyQuery} from "@apollo/client";

    export const ONE_FACTOR = gql`
        query Factor($factorId: ID!) {
            factor(id: $factorId) {
                id
                department
                salary_type
                salary
                person {
                    id
                    first_name
                    last_name
                    email
                    phone01
                    phone02
                    address
                }
                user {
                    id
                    user_name
                    activation
                    lastConnection
                    lastDisconnection
                }
            }
        }
    `;

interface Props {}

const useGetOneEmployee = (): QueryTuple<any, OperationVariables> => {
    return useLazyQuery(ONE_FACTOR);
};

export default useGetOneEmployee;
