import { gql, useQuery } from "@apollo/client";

export const ALL_CLIENT_BOXES = gql`
    query BoxClient($idClient: ID) {
        boxClient(idClient: $idClient) {
            id
            recipient_name
            recipient_city
            recipient_loction
            code_box
            TVA
            price_box
            price_delivery
            paid_in_office
            payment_type
            lastTrace {
                status
                stock {
                    id
                }
            }
            code_invoice
            createdAt
            archived
        }
    }
`;

interface Props {}

const useGetAllClientShipments = ({ client_id }: { client_id: string }) => {
    let { data, loading } = useQuery(ALL_CLIENT_BOXES, {
        variables: {
            idClient: client_id,
        },
        // fetchPolicy: "cache-first",
        // nextFetchPolicy: "cache-first",
    });
    return [data?.boxClient || [], loading];
};

export default useGetAllClientShipments;