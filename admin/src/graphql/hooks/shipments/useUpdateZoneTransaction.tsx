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

export const UPDATE_PRICING = gql`
  mutation UpdatePricing($content: pricingContent!, $updatePricingId: ID!) {
    updatePricing(content: $content, id: $updatePricingId) {
      status
    }
  }
`;

interface VariableProps {
  content: {
    default_price_office: number;
    default_price_house: number;
  };
  updatePricingId: string;
}

const useUpdateZoneTransaction = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let res = useMutation<any, VariableProps>(UPDATE_PRICING, {
    // update: (cache, { data: { createBoxTrace } }) => {
    //   cache.modify({
    //     fields: {
    //       boxDriver(existedBoxes = [], { readField }) {
    //         let index = existedBoxes.findIndex((item: any) => item.id === createBoxTrace.box.id);
    //         return produce((existedBoxes, draft: any) => {
    //           draft[index].lastTrace.status = createBoxTrace.status;
    //         });
    //       },
    //     },
    //   });
    // },
  });
  return res;
};

export default useUpdateZoneTransaction;
