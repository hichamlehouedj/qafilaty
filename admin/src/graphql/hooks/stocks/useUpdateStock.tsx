import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";

export const UPDATE_STOCK = gql`
    mutation updateStock($id: ID!, $content: stockContent) {
        updateStock(id: $id, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id?: string;
    content: {
        name: string;
        city: string;
        address: string;
        phone01: string;
        phone02: string;
        id_company?: string;
    }
}

const useUpdateStock = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_STOCK, {
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useUpdateStock;
