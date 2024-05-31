import { gql, useQuery } from "@apollo/client";

export const ALL_ENVELOPE_DELIVERY = gql`
    query deliveryEnvelopeCity($idStock: ID) {
        deliveryEnvelopeCity(idStock: $idStock) {
            city
            totalMouny
            numberBox
            codeEnvelope
        }
    }
`;

interface Props {}

const useGetDeliveryEnvelopeCity = ({ idStock }: { idStock: string }) => {
    let { data, loading } = useQuery(ALL_ENVELOPE_DELIVERY, {
        variables: {
            idStock: idStock
        }
    });
    return [data?.deliveryEnvelopeCity || [], loading];
};

export default useGetDeliveryEnvelopeCity;
