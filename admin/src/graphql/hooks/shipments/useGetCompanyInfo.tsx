import { gql, useQuery } from "@apollo/client";

export const COMPANY = gql`
  query Company($companyId: ID!) {
    company(id: $companyId) {
      id
      name
      logo
      phone01
      phone02
      email
      url_site
      city
      address

      TVA
      return_price
      change_price
      plus_size
      plus_tail
      value_plus_size
      value_plus_tail
      defult_weight
      defult_length

      createdAt
      updatedAt

      encapsulation_price
      encapsulation
      pickup_price
      pickup
      price_in_state

      points
      activation
      numberArchivedBoxes
      numberNotArchivedBoxes

      listPickUpPlan {
        id
        price
        number_box
        createdAt
        updatedAt
      }
    }
  }
`;

interface Props {}

const useGetCompanyInfo = ({ companyID }: { companyID: string }) => {
  let { data } = useQuery(COMPANY, {
    variables: {
      companyId: companyID,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  return data?.company || [];
};

export default useGetCompanyInfo;
