import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES_INVOICE_DRIVER_PICKUP = gql`
    query BoxInvoiceDriverPickUp($codeInvoice: ID!) {
        boxInvoiceDriverPickUp(codeInvoice: $codeInvoice) {
            id
            code_box
            price_box
            price_delivery
            TVA
            recipient_loction
            payment_type
            price_pick_up
            code_pick_up
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

const useGetAllInvoiceDriverPickUp = ({ codeInvoice }: { codeInvoice: string }) => {
    let { data } = useQuery(ALL_BOXES_INVOICE_DRIVER_PICKUP, {
        variables: {codeInvoice}
    });
    return data?.boxInvoiceDriverPickUp || [];
};

export default useGetAllInvoiceDriverPickUp;
