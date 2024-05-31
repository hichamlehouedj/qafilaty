import { gql, useQuery } from "@apollo/client";

export const ALL_DRIVER_BOXES_DELIVERED = gql`
    query deliveredDriverBox($idDriver: ID) {
        deliveredDriverBox(idDriver: $idDriver) {
            id
            recipient_name
            recipient_city
            recipient_phone1
            code_box
            TVA
            price_box
            price_delivery
            paid_in_office
            payment_type

            recipient_loction
            categorie
            code_driver_commission
            lastTrace {
                status
                stock {
                    id
                }
            }
            client {
                person {
                    first_name
                    last_name
                    address
                    phone01
                    list_stock_accesses {
                        stock {
                            id
                        }
                    }
                }
            }
            code_invoice
            createdAt
            archived
        }
    }
`;

interface Props {}

const useDeliveredDriverBox = ({ idDriver }: { idDriver: string }) => {
    let { data, loading } = useQuery(ALL_DRIVER_BOXES_DELIVERED, {
        variables: {
            idDriver: idDriver,
        }
    });
    return [data?.deliveredDriverBox || [], loading];
};

export default useDeliveredDriverBox;