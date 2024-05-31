import {ApolloCache, DefaultContext, gql, MutationTuple, useLazyQuery, useMutation} from "@apollo/client";

export const CREATE_STOCK = gql`
    mutation createStock($content: stockContent) {
        createStock(content: $content) {
            id
            name
            city
            address
            activation
            phone01
            phone02

            createdAt
            numberArchivedBoxes
            numberNotArchivedBoxes
        }
    }
`;

interface VariableProps {
    content: {
        name: string;
        city: string;
        address: string;
        phone01: string;
        phone02: string;
        id_company?: string;
    }
}

const useCreateStock = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(CREATE_STOCK, {
        update: (cache, { data: { createStock } }) => {
            console.log("🚀 ~ file: useCreateStock.tsx ~ line 79 ~ cache", cache);
            cache.modify({
                fields: {
                    allStock(existedStocks = [], { readField }) {
                        return [...existedStocks, createStock];
                    },
                },
            });
        },
        onCompleted: (data: any) => {
            console.log("data", data)
        }
    });
};

export default useCreateStock;
