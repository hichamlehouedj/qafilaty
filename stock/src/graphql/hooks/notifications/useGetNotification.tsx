import {
  gql,
  QueryResult,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from "@apollo/client";

export const GET_NOTIFICATIONS = gql`
  query getNotifications($lastDisconnection: String, $idClient: ID) {
    getNotifications(
      lastDisconnection: $lastDisconnection
      idClient: $idClient
    ) {
      id
      status
      createdAt
    }
  }
`;

interface VartiableProps {
  lastDisconnection?: string;
  idClient?: string;
}

const useGetNotification = (): QueryTuple<any, VartiableProps> => {
  let useGetNotificationResult = useLazyQuery<any, VartiableProps>(
    GET_NOTIFICATIONS
  );
  return useGetNotificationResult;
};

export default useGetNotification;
