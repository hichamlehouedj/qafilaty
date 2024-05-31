import { gql, useQuery } from "@apollo/client";

export const ALL_STOCK = gql`
    query AllStock($idCompany: ID!) {
        allStock(idCompany: $idCompany) {
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

interface Props {}

const useGetAllStocks = ({ company_id }: { company_id: string }) => {
    let { data } = useQuery(ALL_STOCK, {
        variables: {
            idCompany: company_id,
        }
    });
    return data?.allStock || [];
};

export default useGetAllStocks;
