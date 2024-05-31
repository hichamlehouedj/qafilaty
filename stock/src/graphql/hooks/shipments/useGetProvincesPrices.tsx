import { gql, useQuery } from "@apollo/client";

export const ALL_BOXES = gql`
  query CityZone($idCompany: ID!, $city: String!) {
    cityZone(idCompany: $idCompany, city: $city) {
      id
      cities
      createdAt
      id_company
      listPrice {
        default_price_office
        default_price_house
        zone_begin {
          id
          name
          cities
        }
        zone_end {
          id
          name
          cities
        }
      }
    }
  }
`;

interface Props {}

const useGetProvincesPrices = ({ idCompany, city }: { idCompany: string; city: string }) => {
  let { data } = useQuery(ALL_BOXES, {
    variables: {
      idCompany: idCompany,
      city: city,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  return data?.cityZone || [];
};

export default useGetProvincesPrices;
