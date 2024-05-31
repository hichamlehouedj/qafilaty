import { gql, useQuery } from "@apollo/client";

export const ALL_DRIVER_BOXES_PICKEDUP = gql`
    query pickedUpBox($idDriver: ID) {
        pickedUpBox(idDriver: $idDriver) {
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
            code_driver_commission
            cd_commission_pickup
            code_pick_up
            price_pick_up
            categorie
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

const usePickedUpDriverBox = ({ idDriver }: { idDriver: string }) => {
    let { data, loading } = useQuery(ALL_DRIVER_BOXES_PICKEDUP, {
        variables: {
            idDriver: idDriver,
        }
    });

    return data?.pickedUpBox || [];
};

export default usePickedUpDriverBox;