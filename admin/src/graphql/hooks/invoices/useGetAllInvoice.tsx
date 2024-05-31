import { gql, useQuery } from "@apollo/client";

export const ALL_INVOICES = gql`
    query allInvoices($idCompany: ID) {
        allInvoicesCompany(id_company: $idCompany) {
            id
            code_invoice
            points
            price
            status
            createdAt
            updatedAt
        }
    }
`;

interface Props {}

const useGetAllInvoice = ({ company_id }: { company_id: string }) => {
    let { data } = useQuery(ALL_INVOICES, {
        variables: {
            idCompany: company_id
        }
    });
    return data?.allInvoicesCompany || [];
};

export default useGetAllInvoice;
