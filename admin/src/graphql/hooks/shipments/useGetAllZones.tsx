import { gql, useQuery } from "@apollo/client";

export const ALL_ZONES = gql`
  query AllZone($idCompany: ID) {
    allZone(idCompany: $idCompany) {
      id
      createdAt
      updatedAt
      cities
      name
    }
  }
`;

interface Props {}

const useGetAllZones = ({ companyID }: { companyID: string }) => {
  let { data } = useQuery(ALL_ZONES, {
    variables: {
      idCompany: companyID,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  return data?.allZone || [];
};

export default useGetAllZones;
