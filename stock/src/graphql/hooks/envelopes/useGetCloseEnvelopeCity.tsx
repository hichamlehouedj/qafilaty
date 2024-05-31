import { gql, useQuery } from "@apollo/client";

export const ALL_CLOSE_ENVELOPE_CITY = gql`
    query CloseEnvelopeCity($idStock: ID) {
        closeEnvelopeCity(idStock: $idStock) {
            city
            totalMouny
            numberBox
            codeEnvelope
        }
    }
`;

interface Props {}

const useGetCloseEnvelopeCity = ({ idStock }: { idStock: string }) => {
    let { data, loading } = useQuery(ALL_CLOSE_ENVELOPE_CITY, {
        variables: {
            idStock: idStock
        }
    });
    return [data?.closeEnvelopeCity || [], loading];
};

export default useGetCloseEnvelopeCity;