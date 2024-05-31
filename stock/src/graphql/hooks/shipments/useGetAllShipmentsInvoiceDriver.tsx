import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES_INVOICE_DRIVER = gql`
    query AllBox($codeInvoice: ID!) {
        boxInvoiceDriver(codeInvoice: $codeInvoice) {
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

const useGetAllShipmentsInvoiceDriver = ({ codeInvoice }: { codeInvoice: string }) => {
    let { data } = useQuery(ALL_BOXES_INVOICE_DRIVER, {
        variables: {codeInvoice}
    });
    return data?.boxInvoiceDriver || [];
};

export default useGetAllShipmentsInvoiceDriver;
