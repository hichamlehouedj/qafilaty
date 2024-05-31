import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";

export const UPDATE_ACCESSES_STOCK = gql`
    mutation UpdateAccessesStock($idPerson: ID!, $idStock: ID!) {
        updateAccessesStock(idPerson: $idPerson, idStock: $idStock) {
            status
        }
    }
`;

interface VariableProps {
    idPerson?: string;
    idStock?: string;
}

const useUpdateAccessesStock = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_ACCESSES_STOCK, {
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useUpdateAccessesStock;
