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
  mutation ResendVerificationEmail($email: String) {
    resendVerificationEmail(email: $email) {
      status
    }
  }
`;

interface VariableProps {
  email?: string;
}

const useResendEmailVerification = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
  let res = useMutation<any, VariableProps>(FORGET_PW, {
    // refetchQueries: [ALL_BRANDS],
    // update: (cache, { data /* : { editBox } */ }) => {
    //   // cache.modify({
    //   //   fields: {
    //   //     allProduct(existedProducts = [], { readField }) {
    //   //       return [...existedProducts, editBox];
    //   //     },
    //   //   },
    //   // });
    // },
  });
  return res;
};

export default useResendEmailVerification;
