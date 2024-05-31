import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation} from "@apollo/client";

export const UPDATE_PLAN = gql`
    mutation updatePlan($id: ID!, $content: planContent) {
        updatePlan(id: $id, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id?: string;
    content: {
        title: string;
        description: string;
        discount_return: number;
        discount_delivery: number;
        status: string;
        id_company?: string;
    }
}

const useUpdatePlan = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_PLAN);
};

export default useUpdatePlan;
