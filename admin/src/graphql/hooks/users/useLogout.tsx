import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationTuple,
  OperationVariables,
  QueryTuple,
  useLazyQuery,
  useMutation,
  useQuery,
} from "@apollo/client";

export const LOG_OUT = gql`
  mutation LogOut {
    logOut {
      status
    }
  }
`;

interface Props {}

const useLogout = (): MutationTuple<
  any,
  OperationVariables,
  DefaultContext,
  ApolloCache<any>
> => {
  let UseLogoutRestul = useMutation(LOG_OUT);
  return UseLogoutRestul;
};

export default useLogout;
