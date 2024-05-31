import { ApolloClient, gql, NormalizedCacheObject } from "@apollo/client";
import produce from "immer";
import { io, Socket } from "socket.io-client";
import { ALL_BOXES } from "../../graphql/hooks/shipments/useGetAllShipments";
import useStore from "../../store/useStore";
import {ALL_CLOSE_ENVELOPE_CITY} from "../../graphql/hooks/envelopes/useGetCloseEnvelopeCity";
import {ALL_ENVELOPE_DELIVERY} from "../../graphql/hooks/envelopes/useGetDeliveryEnvelopeCity";
import {ALL_READY_ENVELOPE_CITY} from "../../graphql/hooks/envelopes/useGetReadyEnvelopeCity";

export default class SocketClient {
    static io?: Socket;
    id?: string;
    snd = new Audio('/notification.wav');

    constructor({ user_id, user_username, stock_id, client_id }: any) {
        try {
            const token = (useStore.getState() as any).token;
            let url = "wss://rrkpgd2a7f.qafilaty.com";
            // let url = "wss://api.qafilaty.com";

            SocketClient.io = io(url, {
                path: "/socket.io",
                autoConnect: true,
                transports: ["websocket"],
                withCredentials: true,
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

    connect(client: ApolloClient<NormalizedCacheObject>) {
        SocketClient.io?.on("connect", async () => {
            this.id = SocketClient.io?.id;

            // console.log("SocketClient", SocketClient.io?.id)
        });

        SocketClient.io?.on("connect_error", (err) => {
            console.log("connect_error =>", new Error(err.toString()).message)
        });

        SocketClient.io?.on("createBox", (data) => {
            this.snd.play();
            const notifyCount = (useStore.getState() as any)?.notifyCount;
            const notificationData = (useStore.getState() as any)?.notificationData;
            let newData = {};

            client.cache.modify({
                fields: {
                    allBox(existedBoxes = [], { readField }) {
                        let cdata = produce(data, (draft: any) => {
                            draft["__typename"] = "Box";
                            draft.lastTrace[0] = {
                                "__typename": "BoxTrace",
                                ...draft.lastTrace[0],
                            };
                            draft.client = {
                                ["__typename"]: "Client",
                                ...draft.client[0],
                            };
                            draft.client.person = {
                                ["__typename"]: "Person",
                                ...draft.client.person
                            };
                        });

                        newData = cdata;

                        let newBoxRef = client.cache.writeFragment({
                            fragment: gql`
                                fragment newBoxRef on Box {
                                    id
                                    recipient_name
                                    recipient_city
                                    code_box
                                    lastTrace {
                                        status
                                        stock {
                                            id
                                        }
                                    }
                                    client {
                                        person {
                                            first_name
                                            last_name
                                            address
                                        }
                                    }
                                    createdAt
                                    archived
                                }
                            `,
                            data: cdata,
                        });

                        return [newBoxRef, ...existedBoxes];
                    },
                },
            });

            useStore.setState({
                notificationData: [{
                    ...data.lastTrace[0],
                    box: {
                        code_box: data.code_box,
                        client: data.client[0]
                    }
                }, ...notificationData],
                notifyCount: notifyCount + 1,
            });
        });

        SocketClient.io?.on("notifications", (data) => {
            //console.table("notifications yaaay!!! => ", data);
            const notifyCount = (useStore.getState() as any)?.notifyCount;

            // let { newBoxes, newTrace } = data;

            if (!(notifyCount === null)) {
                if (data.newActions) {
                    client.refetchQueries({
                        include: [ALL_BOXES],
                    });
                }
            }

            useStore.setState({
                notificationData: [...data.newTrace],
                notifyCount: data.newActions
            });
        });

        SocketClient.io?.on("newTrace", async (data) => {
            this.snd.play();
            const notifyCount = (useStore.getState() as any)?.notifyCount;
            const notificationData = (useStore.getState() as any)?.notificationData;
            //console.table("new trace update => ", data);

            let newBoxStatusUpdatedFragment = gql`
                fragment newBoxStatusUpdated on Box {
                    id
                    lastTrace {
                        status
                    }
                }
            `;

            if([4, 6, 15, 20, 29, 32].includes(data?.status)) {
                await client.refetchQueries({
                    include: [ALL_BOXES],
                });
            } else if([10, 11, 12].includes(data?.status)) {
                await client.refetchQueries({
                    include: [ALL_CLOSE_ENVELOPE_CITY, ALL_ENVELOPE_DELIVERY, ALL_READY_ENVELOPE_CITY]
                })
            } else {
                client.cache.modify({
                    fields: {
                        allBox(existedBoxes = [], { readField }) {
                            let newBoxRef = client.cache.readFragment({
                                id: `Box:${data.id_box}`,
                                fragment: newBoxStatusUpdatedFragment,
                            });

                            console.log("newBoxRef ", newBoxRef, !newBoxRef)
                            if (!newBoxRef) {
                                client.refetchQueries({
                                    include: [ALL_BOXES],
                                });
                            } else {
                                let newBox = produce(newBoxRef, (draft: any) => {
                                    draft.lastTrace[0].status = data.status;
                                });

                                client.cache.writeFragment({
                                    id: `Box:${data.id_box}`,
                                    fragment: newBoxStatusUpdatedFragment,
                                    data: newBox,
                                });
                            }
                        },
                    },
                });
            }

            useStore.setState({
                notificationData: [data, ...notificationData],
                notifyCount: notifyCount + 1,
            });
        });

        SocketClient.io?.on("statusBox", (data) => {
            // console.log("🚀 ~ file: socket.ts ~ line 166 ~ SocketClient ~ statusBox", data);
            // scanShipmentResult
            useStore.setState({
                scanShipmentResult: data,
            });
        });

        SocketClient.io?.on("error", (error) => {
            console.log("Socket Client error", error)
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

/*
qafilaty-dev
qafilaty-dev
jPfEPdiAwbw2YpRS
* */