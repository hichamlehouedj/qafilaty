import { gql, OperationVariables, QueryTuple, useLazyQuery, useQuery } from "@apollo/client";

export const ALL_PRICING = gql`
  query AllPricing($idZone: ID) {
    allPricing(idZone: $idZone) {
      id
      default_price_office
      default_price_house
      createdAt
      zone_begin {
        name
      }
      zone_end {
        name
      }
    }
  }
`;

interface Props {}

const useGetZoneTransaction = (): QueryTuple<any, OperationVariables> => {
  let res = useLazyQuery(ALL_PRICING, { fetchPolicy: "network-only" });
  return res;
};

export default useGetZoneTransaction;
