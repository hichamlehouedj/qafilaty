import {ApolloCache, DefaultContext, gql, MutationTuple, useMutation} from "@apollo/client";

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

const useAuthenticateClient = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
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
