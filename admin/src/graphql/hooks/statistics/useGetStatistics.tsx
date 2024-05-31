import { useQuery } from "@apollo/client";
import { statistics } from "../../queries/statistics";

interface Props {}

const useGetStatistics = ({ id_client }: { id_client: string }) => {
  let { data } = useQuery(statistics, {
    variables: {
      idClient: id_client,
    },
  });

  return data?.statisticsClient;
};

export default useGetStatistics;
