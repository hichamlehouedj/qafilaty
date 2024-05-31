import {gql, MutationTuple, useMutation} from "@apollo/client";

export const DRIVER_COMMISSION_PICKUP = gql`
    mutation DriverCommission($idBoxes: [ID!]!) {
        driverCommissionPickUp(idBoxes: $idBoxes) {
            status
        }
    }
`;

interface VariableProps {
    idBoxes: string[];
}

const useDriverCommissionPickUp = (): MutationTuple<any, VariableProps> => {
    return useMutation<any, VariableProps>(DRIVER_COMMISSION_PICKUP);
};

export default useDriverCommissionPickUp;