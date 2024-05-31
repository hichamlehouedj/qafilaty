import { gql, useQuery } from "@apollo/client";

export const ALL_READY_ENVELOPE_CITY = gql`
    query ReadyEnvelopeCity($idStock: ID) {
        readyEnvelopeCity(idStock: $idStock) {
            city
            totalMouny
            numberBox
            codeEnvelope
        }
    }
`;

interface Props {}

const useGetReadyEnvelopeCity = ({ idStock }: { idStock: string }) => {
    let { data, loading } = useQuery(ALL_READY_ENVELOPE_CITY, {
        variables: {
            idStock: idStock
        }
    });
    return [data?.readyEnvelopeCity || [], loading];
};

export default useGetReadyEnvelopeCity;