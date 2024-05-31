import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationTuple,
  OperationVariables,
  useMutation,
  useQuery,
} from "@apollo/client";
import produce from "immer";
import { Box } from "react-feather";

export const AUTH_USER = gql`
  mutation authenticateUser($content: userInfo) {
    authenticateUser(content: $content) {
      token
    }
  }
`;

interface VariableProps {
  content: {
    email?: "string";
    password?: "string";
  };
}

const useAuthenticateClient = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let authenticateClientResult = useMutation<any, VariableProps>(AUTH_USER, {
    //   update: (cache, { data: { createBoxTrace } }) => {
    //     cache.modify({
    //       fields: {
    //         allBox(existedBoxes = [], { readField }) {
    //           let index = existedBoxes.findIndex(
    //             (item: any) => item.id === createBoxTrace.box.id
    //           );
    //           return produce((existedBoxes, draft: any) => {
    //             draft[index].lastTrace.status = createBoxTrace.status;
    //           });
    //         },
    //       },
    //     });
    //   },
  });
  return authenticateClientResult;
};

export default useAuthenticateClient;
