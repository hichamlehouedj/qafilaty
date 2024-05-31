import React, { useCallback, useEffect, useState } from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer,} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import { alpha } from "@mui/material";
import { grey } from "@mui/material/colors";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";

interface Props {
    shipmentDataList?: any;
    userData?: any;
}

Font.register({
    family: "Montserrat-Arabic",

    // src: path.join(__dirname, "/fonts/Montserrat-Arabic-Regular.ttf"),
    src: "/fonts/Montserrat-Arabic-Regular.ttf",
    fontStyle: "normal",
    fontWeight: 400,
});

let fontsLoaded: any = false;
let forceUpdate: any = null;

// Force loading and wait for loading to finish
Promise.all([Font.load({ fontFamily: "Montserrat-Arabic", fontWeight: 400 })]).then(() => {
    fontsLoaded = true;
    if (forceUpdate) forceUpdate();
});

// Helper to trigger an update in a functional component
function useForceUpdate() {
    const [value, setValue] = useState(0);
    return () => setValue((value) => value + 1);
}

const styles = StyleSheet.create({
    body: {
        paddingTop: 25,
        paddingBottom: 100,
        paddingHorizontal: 30,
        fontFamily: "Montserrat-Arabic",
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        // bottom: 65,
        bottom: 25,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "grey",
    },

    companyInfofooter: {
        position: "absolute",
        fontSize: 12,
        bottom: 20,
        left: 30,
        right: 30,
        textAlign: "center",
        color: "grey",
        margin: "0 auto",
    },
});

const ReceiptTemplate = ({ shipmentDataList, userData }: Props) => {
    const [client, setClient] = useState({
        first_name: "",
        last_name: "",
        city: 0,
        address: "",
        phone01: "",
        email: "",
    })
    forceUpdate = useForceUpdate();

    console.log("shipmentDataList ", shipmentDataList)

    useEffect(() => {
        if (shipmentDataList != undefined && shipmentDataList.length > 0) {
            setClient({
                first_name: shipmentDataList?.[0]?.client?.person?.first_name,
                last_name: shipmentDataList?.[0]?.client?.person?.last_name,
                city: shipmentDataList?.[0]?.client?.person?.city,
                address: shipmentDataList?.[0]?.client?.person?.address,
                phone01: shipmentDataList?.[0]?.client?.person?.phone01,
                email: shipmentDataList?.[0]?.client?.person?.email
            })
        }
    }, [shipmentDataList])

    if (!fontsLoaded) {
        return <div />;
    }

    return (
        <PDFViewer width={"100%"} style={{ minHeight: "100vh" }}>
            <Document>
                <Page style={styles.body}>
                    {/* header */}
                    <View style={{width: "100%", height: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between"}}>
                        <View style={{}}>
                            <View style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center",}}>
                                {/* left section */}
                                <Image style={{ width: 46, marginRight: 20 }}
                                       src={userData?.person?.company?.logo === "Default" ? "/logo.png" : userData?.person?.company?.logo}
                                />
                                {/* right section */}

                                <View style={{ flex: 1 }}>
                                    <View style={{display: "flex",}}>
                                        <View style={{ display: "flex" }}>
                                            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",}}>
                                                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: -4,}}>
                                                    <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{dayjs().format("DD/MM/YYYY HH:mm:ss")}</Text>
                                                    <Text style={{fontSize: 12, color: "#909090", margin: 2,}}>حررت بتاريخ:</Text>
                                                </View>
                                                <Text style={{ fontSize: 23, color: "#575757" }}>وصل إستلام</Text>
                                            </View>
                                            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* section 1 */}

                            <View>
                                {/* brand info */}
                                <View style={{backgroundColor: alpha(theme.palette.primary.main, 0.1), padding: 14, marginTop: "32px",}}>
                                    <View style={{flexDirection: "row-reverse", justifyContent: "space-between",}}>
                                        <View style={{justifyContent: "flex-end", flexDirection: "column-reverse", flexBasis: "49.5%"}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4, textAlign: "left",}}>{client.address}</Text>
                                                <Text style={{fontSize: 11, color: "#909090", margin: 4,}}>عنوان العميل:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4, paddingBottom: 8,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4, textAlign: "left",}}>
                                                    {algerian_provinces?.[client.city - 1]?.wilaya_name}
                                                </Text>
                                                <Text style={{fontSize: 11, color: "#909090", margin: 4,}}>ولاية العميل:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4, paddingBottom: 8,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>
                                                    {`${client?.first_name} ${client?.last_name}`}
                                                </Text>
                                                <Text style={{fontSize: 11, color: "#909090", margin: 4,}}>إسم العميل:</Text>
                                            </View>
                                        </View>
                                        <View style={{justifyContent: "flex-end", flexDirection: "column-reverse", flexBasis: "49.5%",}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{client?.phone01}</Text>
                                                <Text style={{fontSize: 11, color: "#909090", margin: 4,}}>رقم الهاتف:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4, paddingBottom: 8,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{client?.email}</Text>
                                                <Text style={{fontSize: 11, color: "#909090", margin: 4,}}>البريد الالكتروني:</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* section 2 */}
                                {/* product table */}

                                <View style={{border: `0.5 solid ${grey[300]}`, marginTop: "32px",}}>
                                    {/* table header */}
                                    <View style={{display: "flex", flexDirection: "row",}}>
                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,/* height: '32px',*/}}>سعر التوصيل</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,}}>سعر الطرد</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>الوجهة</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,}}>رقم المستلم</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,}}>إسم المستلم</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "flex-end", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,}}>كود الطرد</Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "0.3", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "center", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#9E9E9E", fontSize: 9,}}>#</Text>
                                        </View>
                                    </View>
                                    {/* table content */}
                                    {shipmentDataList?.map((shipment: any, index: any) => (
                                        <View key={index} style={{display: "flex", flexDirection: "row",}}>
                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>
                                                    <Text style={{ fontSize: 7 }}>د.ج</Text>
                                                    {shipment?.paid_in_office || shipment?.payment_type == "free" ? 0 : shipment?.price_delivery}
                                                </Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>
                                                    <Text style={{ fontSize: 7 }}>د.ج</Text>
                                                    {shipment?.price_box}
                                                </Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>
                                                    {algerian_provinces[shipment?.recipient_city - 1].wilaya_name}
                                                </Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>{shipment?.recipient_phone1}</Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9}}>{shipment?.recipient_name}</Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>{shipment?.code_box}</Text>
                                            </View>

                                            <View
                                                style={{
                                                    flex: "0.3", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                    border: `0.5 solid ${grey[300]}`, padding: 6,
                                                }}
                                            >
                                                <Text style={{color: "#707070", fontSize: 9,}}>{index + 1}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Total */}

                                <View>
                                    <View style={{display: "flex", flexDirection: "row", marginTop: "32px", width: "50%", marginLeft: "auto",}}>
                                        <View
                                            style={{
                                                flex: "1.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                border: `0.5 solid ${grey[300]}`, padding: 6,
                                            }}
                                        >
                                            <Text style={{color: "#707070", fontSize: 10,}}>
                                                <Text style={{ fontSize: 8 }}>د.ج</Text>
                                                {shipmentDataList?.reduce((prev: any, shipment: any) => prev + shipment.price_box, 0)}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "flex-end", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: grey[500], fontSize: 10,}}>م. سعر الطرود</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto",}}>
                                        <View
                                            style={{
                                                flex: "1.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                border: `0.5 solid ${grey[300]}`, padding: 6,
                                            }}
                                        >
                                            <Text style={{color: "#707070", fontSize: 10,}}>
                                                <Text style={{ fontSize: 8 }}>د.ج</Text>
                                                {shipmentDataList?.reduce((prev: any, shipment: any) => prev + (shipment?.paid_in_office ? 0 : shipment?.price_delivery), 0)}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                height: "32px", justifyContent: "center", alignItems: "flex-end", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: grey[500], fontSize: 10,}}>م. س.التوصيل</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto",}}>
                                        <View
                                            style={{
                                                flex: "1.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center",
                                                border: `0.5 solid ${grey[300]}`, padding: 6,
                                            }}
                                        >
                                            <Text style={{color: "#707070", fontSize: 11,}}>
                                                <Text style={{ fontSize: 8 }}>د.ج</Text>
                                                {shipmentDataList?.reduce((prev: any, shipment: any) => prev + (
                                                    (shipment?.paid_in_office ? 0 : shipment?.price_delivery) + shipment.price_box), 0
                                                )}
                                            </Text>
                                        </View>

                                        <View
                                            style={{
                                                flex: "1", flexShrink: 0, backgroundColor: theme.palette.primary.main,
                                                height: "32px", justifyContent: "center", alignItems: "flex-end", padding: 6,
                                                border: `0.5 solid ${grey[300]}`,
                                            }}
                                        >
                                            <Text style={{color: "#FFF", fontSize: 10,}}>المبلغ الاجمالي</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed/>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default ReceiptTemplate;