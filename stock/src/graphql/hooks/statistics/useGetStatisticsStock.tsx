import { useQuery, gql } from "@apollo/client";

export const statistics = gql`
    query StatisticsStock($idStock: ID) {
        statisticsStock(idStock: $idStock) {
            totalPrepaid
            totalAmountTax
            totalAmountDelivered
            totalAmountCancelled
            totalCommissions
            totalAmountPickUp
            numberCommercialBoxNotArchived
            numberCommercialBoxArchived
            numberCommercialBox
            numberClassicBoxNotArchived
            numberClassicBoxArchived
            numberClassicBox
            numberAllBoxNotArchived
            numberAllBoxArchived
            numberAllBox
            moneyReceived
            moneyReadyReceive
            moneyDriver
            allStatus {
                numberClassic
                numberCommercial
                status
            }
            
            chartMoney {
                week
                total
            }
            
            chartAmount {
                week
                total
            }
        }
    }
`;

const useGetStatisticsStock = ({ idStock }: { idStock: string }) => {
    let { data } = useQuery(statistics, {
        fetchPolicy: "network-only",
        variables: {
            idStock: idStock,
        },
    });

    console.log(data)

    return data?.statisticsStock;
};

export default useGetStatisticsStock;
