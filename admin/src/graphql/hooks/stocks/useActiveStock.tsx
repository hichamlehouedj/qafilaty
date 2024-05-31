import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";

export const ACTIVE_STOCK = gql`
    mutation activeStock($id: ID!, $activation: String) {
        activeStock(id: $id, activation: $activation) {
            status
        }
    }
`;

interface VariableProps {
    id?: string;
    activation: string;
}

const useActiveStock = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(ACTIVE_STOCK, {
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useActiveStock;
