import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";

export const DELETE_STOCK = gql`
    mutation deleteStock($id: ID!) {
        deleteStock(id: $id) {
            status
        }
    }
`;

interface VariableProps {
    id?: string;
}

const useDeleteStock = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(DELETE_STOCK, {
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useDeleteStock;
