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

export const CREATE_ZONE = gql`
  mutation CreateZone($content: zoneContent!) {
    createZone(content: $content) {
      id
      name
      cities
      createdAt
    }
  }
`;

interface VariableProps {
  content: {
    name: string;
    cities: string[];
    id_company: string;
  };
}

const useCreateZone = (): MutationTuple<any, VariableProps, DefaultContext, ApolloCache<any>> => {
  let res = useMutation<any, VariableProps>(CREATE_ZONE, {
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

export default useCreateZone;
