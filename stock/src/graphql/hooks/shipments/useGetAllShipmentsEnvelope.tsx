import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES_ENVELOPE = gql`
    query AllBox($codeEnvelope: ID!) {
        boxEnvelope(codeEnvelope: $codeEnvelope) {
            id
            code_box
            price_box
            price_delivery
            TVA
            recipient_city
            recipient_loction
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

const useGetAllShipmentsEnvelope = ({ codeEnvelope }: { codeEnvelope: string }) => {
    let { data } = useQuery(ALL_BOXES_ENVELOPE, {
        variables: {codeEnvelope}
    });
    return data?.boxEnvelope || [];
};

export default useGetAllShipmentsEnvelope;
