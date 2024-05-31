import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation } from "@apollo/client";
import {ALL_FACTORS} from "./useGetAllEmployees"
import useStore from "../../../store/useStore";

export const UPDATE_FACTOR = gql`
    mutation updateFactor($id_person: ID!, $content: contentFactor!) {
        updateFactor(id_person: $id_person, content: $content) {
            status
        }
    }
`;

interface VariableProps {
    id_person: string;
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
            address?: string;
        }
    };
}

const useUpdateEmployee = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
    return useMutation<any, VariableProps>(UPDATE_FACTOR, {
        onCompleted: data => {
            console.log(data)
        }
    });
};

export default useUpdateEmployee;
