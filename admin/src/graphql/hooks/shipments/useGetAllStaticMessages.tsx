import { gql, useQuery } from "@apollo/client";

export const ALL_MESSAGES = gql`
  query AllMessages($idCompany: ID!) {
    allMessages(idCompany: $idCompany) {
      id
      type
      createdAt
      message
    }
  }
`;

interface Props {}

const useGetAllStaticMessages = ({ companyID }: { companyID: string }) => {
  let { data } = useQuery(ALL_MESSAGES, {
    variables: {
      idCompany: companyID,
    },
    // fetchPolicy: "cache-first",
    // nextFetchPolicy: "cache-first",
  });
  return data?.allMessages || [];
};

export default useGetAllStaticMessages;
