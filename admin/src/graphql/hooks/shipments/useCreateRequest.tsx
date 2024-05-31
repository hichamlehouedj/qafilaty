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

export const CREATE_TRACE_BOX = gql`
  mutation CreateBoxTrace($content: boxTraceContent!) {
    createBoxTrace(content: $content) {
      id
      status
      box {
        id
      }
    }
  }
`;

interface VariableProps {
  content: {
    status?: number;
    note?: string;
    id_stock?: string;
    id_person?: string;
    id_box?: string;
  };
}

const useCreateRequest = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let createRequestResult = useMutation<any, VariableProps>(CREATE_TRACE_BOX, {
    update: (cache, { data: { createBoxTrace } }) => {
      cache.modify({
        fields: {
          boxDriver(existedBoxes = [], { readField }) {
            let index = existedBoxes.findIndex((item: any) => item.id === createBoxTrace.box.id);
            return produce((existedBoxes, draft: any) => {
              draft[index].lastTrace.status = createBoxTrace.status;
            });
          },
        },
      });
    },
  });
  return createRequestResult;
};

export default useCreateRequest;
