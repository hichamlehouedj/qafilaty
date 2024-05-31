import {
  gql,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
  useQuery,
} from "@apollo/client";

export const REFRESH_TOKEN = gql`
  query RefreshToken {
    refreshToken {
      token
    }
  }
`;

interface Props {}

const UseGetNewToken = (): QueryTuple<any, OperationVariables> => {
  let useGetNewTokenResult = useLazyQuery(REFRESH_TOKEN);
  return useGetNewTokenResult;
};

export default UseGetNewToken;
