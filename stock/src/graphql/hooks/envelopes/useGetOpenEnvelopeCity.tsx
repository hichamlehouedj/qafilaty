import { gql, useQuery } from "@apollo/client";

export const ALL_ENVELOPE_CITY = gql`
    query openEnvelopeCity($idStock: ID) {
        openEnvelopeCity(idStock: $idStock) {
            city
            totalMouny
            numberBox
            codeEnvelope
        }
    }
`;

interface Props {}

const useGetOpenEnvelopeCity = ({ idStock }: { idStock: string }) => {
    let { data, loading } = useQuery(ALL_ENVELOPE_CITY, {
        variables: {
            idStock: idStock
        }
    });
    return [data?.openEnvelopeCity || [], loading];
};

export default useGetOpenEnvelopeCity;