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

export const CREATE_MESSAGE = gql`
  mutation CreateMessage($content: messagesContent!) {
    createMessage(content: $content) {
      id
      type
      message
      createdAt
      updatedAt
    }
  }
`;

interface VariableProps {
  content: {
    type?: string;
    message?: string;
    id_company?: string;
  };
}

const useCreateStaticMessage = (): MutationTuple<
  any,
  VariableProps,
  DefaultContext,
  ApolloCache<any>
> => {
  let res = useMutation<any, VariableProps>(CREATE_MESSAGE, {
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

export default useCreateStaticMessage;
