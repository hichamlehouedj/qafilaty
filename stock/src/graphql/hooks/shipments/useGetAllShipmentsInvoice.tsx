import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES_INVOICE = gql`
    query AllBox($codeInvoice: ID!) {
        boxInvoice(codeInvoice: $codeInvoice) {
            id
            code_box
            price_box
            price_delivery
            TVA
            recipient_loction
            payment_type
            client {
                person {
                    first_name
                    last_name
                    city
                    address
                    phone01
                    email
                }
            }
            createdAt
            updatedAt
            archived
        }
    }
`;

interface Props {}

const useGetAllShipmentsInvoice = ({ codeInvoice }: { codeInvoice: string }) => {
    let { data } = useQuery(ALL_BOXES_INVOICE, {
        variables: {codeInvoice}
    });
    return data?.boxInvoice || [];
};

export default useGetAllShipmentsInvoice;
