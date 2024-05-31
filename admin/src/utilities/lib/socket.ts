import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import { IOType } from "child_process";
import produce from "immer";
import { io, Socket } from "socket.io-client";
import { ALL_CLIENT_BOXES } from "../../graphql/hooks/shipments/useGetAllClientShipments";
import useStore from "../../store/useStore";
import { sortByRecentTime } from "../helpers/filters";
// const events = require('events');

export default class SocketClient {
  static io?: Socket;
  id?: string;

  constructor({ user_id, user_username, stock_id, client_id }: any) {
    try {
      const token = (useStore.getState() as any).token;
      // let url = "wss://rrkpgd2a7f.qafilaty.com";
      let url = "wss://api.qafilaty.com";

      SocketClient.io = io(url, {
        path: "/socket.io",
        autoConnect: true,
        transports: ["websocket"],
        query: {
          user_id: user_id,
          user_username: user_username,
          stock_id: stock_id,
          client_id: client_id,
        },
        auth: {
          token: token ? `${token}` : ""
        }
      });
    } catch (error) {
      alert(`Something went wrong; Can't connect to socket server`);
    }
  }

  disconnect() {
    SocketClient.io?.disconnect();
  }

  connect(client: ApolloClient<NormalizedCacheObject> | undefined) {
    SocketClient.io?.on("connect", async () => {
      this.id = SocketClient.io?.id;
      console.log("connection successfully! your id is: ", SocketClient.io?.id);
    });

    SocketClient.io?.on("changePoints", (data) => {
      console.table("changePoints => ", data);
      const numPoints = (useStore.getState() as any)?.numPoints;


      useStore.setState({
        numPoints: data.points
      });
    });
  }
}
