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

export const CREATE_MULTI_STATUS = gql`
  mutation CreateMultiTrace($content: multiTraceContent) {
    createMultiTrace(content: $content) {
      id
      status
      note
      validation
      createdAt
    }
  }
`;

interface VariableProps {
  content: {
    boxTrace: {
      id_box: string;
      status: string;
    };
    id_stock: string;
    id_person: string;
    note: string;
  };
}

let content = {
  boxTrace: [
    {
      id_box: "null",
      status: "null",
    },
  ],
  id_stock: "null",
  id_person: "null",
  note: "null",
};

const useCreateChangeMultiStatus = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let Result = useMutation<any, VariableProps>(CREATE_MULTI_STATUS, {
    // update: (cache, { data: { createBoxTrace } }) => {
    //   cache.modify({
    //     fields: {
    //       allBox(existedBoxes = [], { readField }) {
    //         let index = existedBoxes.findIndex((item: any) => item.id === createBoxTrace.box.id);
    //         return produce((existedBoxes, draft: any) => {
    //           draft[index].lastTrace.status = createBoxTrace.status;
    //         });
    //       },
    //     },
    //   });
    // },
  });
  return Result;
};

export default useCreateChangeMultiStatus;
