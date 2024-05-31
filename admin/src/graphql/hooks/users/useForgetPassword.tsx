import {
  ApolloCache,
  DefaultContext,
  gql,
  MutationTuple,
  OperationVariables,
  useMutation,
  useQuery,
} from "@apollo/client";

export const FORGET_PW = gql`
  mutation ForgetPassword($email: String) {
    forgetPassword(email: $email) {
      status
    }
  }
`;

interface VariableProps {
  email?: string;
}

const useForgetPassword = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let ForgetPassword = useMutation<any, VariableProps>(FORGET_PW, {
    // refetchQueries: [ALL_BRANDS],
    // update: (cache, { data /* : { editBox } */ }) => {
    //   // console.log("🚀 ~ file: useForgetPassword.tsx ~ line 79 ~ cache", cache);
    //   // cache.modify({
    //   //   fields: {
    //   //     allProduct(existedProducts = [], { readField }) {
    //   //       return [...existedProducts, editBox];
    //   //     },
    //   //   },
    //   // });
    // },
  });
  return ForgetPassword;
};

export default useForgetPassword;
