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

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany($updateCompanyId: ID!, $content: contentUpdateCompany) {
    updateCompany(id: $updateCompanyId, content: $content) {
      status
    }
  }
`;

interface VariableProps {
  content: {
    name?: string;
    logo?: string;
    phone01?: string;
    phone02?: string;
    email?: string;
    url_site?: string;
    city?: string;
    address?: string;
    TVA?: number;
    plus_size?: number;
    plus_tail?: number;
    value_plus_size?: number;
    value_plus_tail?: number;
    return_price?: number;
    change_price?: number;
    defult_weight?: number;
    defult_length?: number;
    activation?: string;
    encapsulation_price?: number;
    encapsulation?: boolean;
    pickup_price?: number;
    pickup: boolean;
    price_in_state: number;
    pickUpPlanContent: {
      price: number;
      number_box: number;
    }[];
  };
  updateCompanyId: string;
}

const useUpdateCompanyInfo = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let res = useMutation<any, VariableProps>(UPDATE_COMPANY, {
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

export default useUpdateCompanyInfo;
