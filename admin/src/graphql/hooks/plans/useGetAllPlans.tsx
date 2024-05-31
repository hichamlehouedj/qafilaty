import { gql, useQuery } from "@apollo/client";

export const ALL_PLANS = gql`
    query AllPlans($idCompany: ID!) {
        allPlans(idCompany: $idCompany) {
            id
            title
            description
            discount_return
            discount_delivery
            status
            createdAt
        }
    }
`;

interface Props {}

const useGetAllPlans = ({ id_company }: { id_company: string }) => {
    let { data } = useQuery(ALL_PLANS, {
        variables: {
            idCompany: id_company,
        }
    });
    return data?.allPlans || [];
};

export default useGetAllPlans;
