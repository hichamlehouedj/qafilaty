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

export const DELETE_ZONE = gql`
  mutation DeleteZone($deleteZoneId: ID!) {
    deleteZone(id: $deleteZoneId) {
      status
    }
  }
`;

interface VariableProps {
  deleteZoneId: string;
}

const useDeleteZone = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
  let res = useMutation<any, VariableProps>(DELETE_ZONE, {
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

export default useDeleteZone;
