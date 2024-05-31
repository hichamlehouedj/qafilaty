import { gql, useQuery } from "@apollo/client";

export const ALL_FACTORS = gql`
    query allFactors($IdStock: ID!) {
        allFactors(idStock: $IdStock) {
            id
            department
            person {
                id
                first_name
                last_name
                email
                phone01
                phone02
                address
            }
            user {
                id
                user_name
                activation
                lastConnection
                lastDisconnection
            }
        }
    }
`;

interface Props {}

const useGetAllEmployees = ({ stock_id }: { stock_id: string }) => {
    let { data, loading } = useQuery(ALL_FACTORS, {
        variables: {
            IdStock: stock_id,
        },
        onCompleted: data => {
            console.log(data)
        }
    });
    return [data?.allFactors || [], loading];
};

export default useGetAllEmployees;
