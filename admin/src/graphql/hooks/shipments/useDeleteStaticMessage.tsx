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
import { ALL_MESSAGES } from "./useGetAllStaticMessages";

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($deleteMessageId: ID!) {
    deleteMessage(id: $deleteMessageId) {
      status
    }
  }
`;

interface VariableProps {
  // content: {
  deleteMessageId?: string;
  // };
}

const useDeleteStaticMessage = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let res = useMutation<any, VariableProps>(DELETE_MESSAGE, {
    refetchQueries: [ALL_MESSAGES],
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

export default useDeleteStaticMessage;
