import {gql, MutationTuple, useMutation} from "@apollo/client";

export const DRIVER_COMMISSION = gql`
    mutation DriverCommission($idBoxes: [ID!]!) {
        driverCommission(idBoxes: $idBoxes) {
            status
        }
    }
`;

interface VariableProps {
    idBoxes: string[];
}

const useDriverCommission = (): MutationTuple<any, VariableProps> => {
    return useMutation<any, VariableProps>(DRIVER_COMMISSION);
};

export default useDriverCommission;