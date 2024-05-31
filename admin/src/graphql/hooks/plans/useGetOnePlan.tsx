import { gql, OperationVariables, QueryTuple, useLazyQuery, } from "@apollo/client";

export const ONE_PLAN = gql`
    query Plan($id: ID!) {
        plan(id: $id) {
            id
            title
            description
            discount_return
            discount_delivery
            status
            createdAt
        }
    }
`;

interface Props {}

const useGetOnePlans = (): QueryTuple<any, OperationVariables> => {
    return useLazyQuery(ONE_PLAN);
};

export default useGetOnePlans;
