import { gql } from "@apollo/client";

export const statistics = gql`
  query StatisticsClient($idClient: ID) {
    statisticsClient(idClient: $idClient) {
      totalPrepaid
      totalAmountTax
      totalAmountDelivered
      totalAmountCancelled
      numberCommercialBoxNotArchived
      numberCommercialBoxArchived
      numberCommercialBox
      numberClassicBoxNotArchived
      numberClassicBoxArchived
      numberClassicBox
      numberAllBoxNotArchived
      numberAllBoxArchived
      numberAllBox
      moneyStock
      moneyReceived
      moneyReadyReceive
      moneyDriver
      allStatus {
        numberClassic
        numberCommercial
        status
      }
    }
  }
`;
