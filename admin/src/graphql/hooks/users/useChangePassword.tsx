import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationTuple,
  OperationVariables,
  useMutation,
  useQuery,
} from "@apollo/client";

export const CHANGE_PW = gql`
  mutation ChangePassword($content: contentPassword) {
    changePassword(content: $content) {
      status
    }
  }
`;

interface VariableProps {
  content: {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };
}

const useChangePassword = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let ChangePassword = useMutation<any, VariableProps>(CHANGE_PW, {
    // refetchQueries: [ALL_BRANDS],
    // update: (cache, { data /* : { editBox } */ }) => {
    //   // console.log("🚀 ~ file: useChangePassword.tsx ~ line 79 ~ cache", cache);
    //   // cache.modify({
    //   //   fields: {
    //   //     allProduct(existedProducts = [], { readField }) {
    //   //       return [...existedProducts, editBox];
    //   //     },
    //   //   },
    //   // });
    // },
  });
  return ChangePassword;
};

export default useChangePassword;
