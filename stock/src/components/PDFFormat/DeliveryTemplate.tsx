import React, { useState } from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer,} from "@react-pdf/renderer";
import { grey, red } from "@mui/material/colors";
import algeria_provinces from "../../utilities/data/api/algeria_provinces.json";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

interface Props {
    shipmentDataList?: any;
    userData?: any;
}

Font.register({
    family: "Montserrat-Arabic",

    // src: path.join(__dirname, "../../../public/fonts/Montserrat-Arabic-Regular.ttf"),
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
        fontFamily: "Montserrat-Arabic",
        backgroundColor: grey[50],
        fontSize: 12,
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        bottom: 25,
        left: 0,
        right: 0,
        textAlign: "center",
        color: "grey",
    },
    smFont: {
        fontSize: "9",
        color: grey[800],
    },

    horizontalDivider: {
        position: "absolute",
        top: 0,
        left: "50%",
        height: "100%",
        textAlign: "center",
        borderLeft: `2px dashed ${grey[300]}`,
    },
    verticalDivider: {
        position: "absolute",
        top: "50%",
        left: 0,
        width: "100%",
        textAlign: "center",
        borderTop: `2px dashed ${grey[300]}`,
    },
});

const DeliveryTemplate = ({ shipmentDataList, userData }: Props) => {
    forceUpdate = useForceUpdate();

    if (!fontsLoaded) {
        return <div />;
    }

    let canvas = null;
    // qrcode generator
    let qrCodeGenerator = (qrcode: any) => {
        canvas = document.createElement("canvas");
        QRCode.toCanvas(canvas, qrcode(), {
            margin: 2,
        });
        return canvas.toDataURL();
    };

    // codebar generator
    let codebarGenerator = (codeBox: string) => {
        canvas = document.createElement("canvas");
        JsBarcode(canvas, codeBox, {
            displayValue: false,
            margin: 10,
            // width: 1000,
            height: 58,
        });
        return canvas.toDataURL();
    };

    return (
        <PDFViewer width={"100%"} style={{ minHeight: "100vh" }}>
            <Document>
                <Page size={"A4"} style={styles.body}>
                    <View style={{display: "flex", flexDirection: "row-reverse", flexWrap: "wrap", minHeight: "100%",}}>
                        {shipmentDataList?.map((shipmentData: any, i: number) => (
                            <View key={i} style={{width: "50%", height: "148.5mm", flexShrink: 0, padding: 4,}}>
                                <View style={{flexShrink: 0, flexGrow: 0, backgroundColor: grey[100], height: "100%", maxHeight: "100%", minHeight: "100%", padding: 8,}}>
                                     {/*header*/}
                                    <View style={{display: "flex", flex: 1, flexBasis: "20%", flexDirection: "row", margin: -4,}}>
                                         {/*logo*/}
                                        <View style={{flexBasis: "25%", display: "flex", padding: 4, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center"}}>
                                            <Image src={userData?.person?.company?.logo === "Default" ? "/logo.png" : userData?.person?.company?.logo} style={{ width: 34 }} />
                                        </View>
                                         {/*seller info*/}
                                        <View style={{flexBasis: "75%", display: "flex", padding: 4, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", flexDirection: "row",}}>
                                            <View style={{flex: 1, flexBasis: "100%", flexDirection: "row",}}>
                                                 {/*left section*/}
                                                <View style={{flex: 1, flexBasis: "70%", minHeight: "100%", display: "flex", margin: 2, justifyContent: "center", alignItems: "center",}}>
                                                    <Text style={{ ...styles.smFont, marginBottom: 4 }}>{`${shipmentData?.client?.person?.first_name} ${shipmentData?.client?.person?.last_name}`}</Text>
                                                    <Text style={{ ...styles.smFont, marginBottom: 4 }}>{shipmentData?.client?.person?.phone01}</Text>
                                                    <Text style={styles.smFont}>{`${algeria_provinces?.[shipmentData?.client?.person?.city - 1]?.wilaya_name } / ${shipmentData?.client?.person?.address}`}</Text>
                                                </View>
                                                 {/*right section*/}
                                                <View style={{flex: 1, flexBasis: "30%", minHeight: "100%", display: "flex", margin: 2, backgroundColor: "#ccc", justifyContent: "center", alignItems: "center",}}>
                                                    <Image src={qrCodeGenerator(() => {
                                                        let { first_name, last_name } = shipmentData?.client?.person;
                                                        return JSON.stringify({
                                                            first_name,
                                                        });
                                                    })}/>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                     {/*center*/}
                                    <View style={{display: "flex", flex: 4, flexBasis: "52%", marginTop: 8,}}>
                                         {/*center - section 1*/}
                                        <View style={{display: "flex", flex: 1, flexDirection: "row",}}>
                                            <View style={{display: "flex", flex: 1, flexDirection: "row", margin: -4,}}>
                                                 {/*left section*/}
                                                <View style={{flexBasis: "75%", display: "flex", padding: 4, margin: 4,}}>
                                                    <View style={{display: "flex", flex: 1, margin: -6,}}>
                                                        <View style={{flex: 1, margin: 2, justifyContent: "center",}}>
                                                            <View style={{flex: 1, flexBasis: "100%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF",}}>
                                                                <Text style={{...styles.smFont, flex: 1, fontSize: 8, textAlign: "left",}}>{shipmentData?.recipient_name}</Text>
                                                                <Text style={{...styles.smFont, fontSize: 8, color: grey[700], textAlign: "right",}}>إسم المستلم:</Text>
                                                            </View>
                                                        </View>

                                                        <View style={{flex: 1, margin: 2, justifyContent: "center",}}>
                                                            <View style={{flex: 1, flexBasis: "100%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF",}}>
                                                                <Text style={{...styles.smFont, flex: 1, fontSize: 8, textAlign: "left",}}>{shipmentData?.recipient_address}</Text>
                                                                <Text style={{...styles.smFont, fontSize: 8, color: grey[700], textAlign: "right",}}>العنوان:</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                 {/*right section*/}
                                                <View style={{flexBasis: "25%", display: "flex", padding: 4, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",}}>
                                                    <Text style={{...styles.smFont, fontSize: 20,}}>{shipmentData?.recipient_city}</Text>
                                                    <Text style={styles.smFont}>{JSON.parse(JSON.stringify(algeria_provinces))?.[shipmentData?.recipient_city - 1]?.wilaya_name}</Text>
                                                </View>
                                            </View>
                                        </View>
                                         {/*center - section 2*/}
                                        <View style={{display: "flex", flex: 1, flexDirection: "row", marginTop: 8,}}>
                                            <View style={{display: "flex", flex: 1, flexDirection: "row", margin: -4,}}>
                                                 {/*left section*/}
                                                <View style={{flexBasis: "75%", display: "flex", padding: 4, margin: 4,}}>
                                                    <View style={{display: "flex", flex: 1, margin: -6,}}>
                                                        <View style={{flex: 1, margin: 2, justifyContent: "center",}}>
                                                            <View style={{flex: 1, flexBasis: "100%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF",}}>
                                                                <Text style={{...styles.smFont, flex: 1, fontSize: 8, textAlign: "left",}}>{shipmentData?.recipient_phone1}</Text>
                                                                <Text style={{...styles.smFont, fontSize: 8, color: grey[700], textAlign: "right",}}>رقم الهاتف:</Text>
                                                            </View>
                                                        </View>

                                                        <View style={{flex: 1, margin: 2, justifyContent: "center",}}>
                                                            <View style={{flex: 1, flexBasis: "100%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF",}}>
                                                                <Text style={{...styles.smFont, flex: 1, fontSize: 8, textAlign: "left",}}>{shipmentData?.command_number || "-"}</Text>
                                                                <Text style={{...styles.smFont, fontSize: 8, color: grey[700], textAlign: "right",}}>رقم الطلب:</Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                 {/*right section*/}
                                                <View style={{flexBasis: "25%", display: "flex", padding: 4, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center",}}>
                                                    <Text style={{...styles.smFont, textAlign: "center", fontSize: 20,}}>{shipmentData?.delivery_type == "house" ? "D" : "SD"}</Text>
                                                    <Text style={{ ...styles.smFont, textAlign: "center" }}>{shipmentData?.delivery_type == "house" ? "ت.للمنزل" : "ت.للمكتب"}</Text>
                                                </View>
                                            </View>
                                        </View>
                                         {/*center - section 3*/}
                                        <View style={{display: "flex", flex: 1, flexDirection: "row", marginTop: 8,}}>
                                            <View style={{display: "flex", flex: 1, flexDirection: "row", margin: -4,}}>
                                                 {/*left section*/}
                                                <View style={{flexBasis: "75%", display: "flex", padding: 4, margin: 4,}}>
                                                    <View style={{display: "flex", flex: 1, margin: -6,}}>
                                                        <View style={{flex: 1, margin: -2, flexDirection: "row", height: "100%", justifyContent: "space-between",}}>
                                                            <View style={{flex: 1, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center"}}>
                                                                {[20, 21, 22, 23].includes(shipmentData?.lastTrace?.[0]?.status)
                                                                    ? <>
                                                                        <Image src="/exchange_box.png" style={{height: "30px", marginBottom: 2}} />
                                                                        <Text style={{ ...styles.smFont, textAlign: "center", marginBottom: 4 }}>إستبدال</Text>
                                                                    </>
                                                                    : <>
                                                                        <Text style={{...styles.smFont, textAlign: "center", fontSize: 11, marginBottom: 6,}}>
                                                                            {
                                                                                shipmentData?.paid_in_office || shipmentData?.payment_type == "free"
                                                                                    ? shipmentData?.price_box
                                                                                    : shipmentData?.price_delivery + shipmentData?.price_box
                                                                            } DA
                                                                        </Text>
                                                                        <Text style={{ ...styles.smFont, textAlign: "center", marginBottom: -4 }}>المجموع</Text>
                                                                    </>
                                                                }
                                                            </View>
                                                            <View style={{flex: 1, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center",}}>
                                                                <Text style={{...styles.smFont, textAlign: "center", fontSize: 11, marginBottom: 2,}}>
                                                                    {(shipmentData?.possibility_open && (<Image src="/openable-box-on.png" style={{ width: 22, height: 22 }}/>)) || (<Image src="/openable-box-off.png" style={{ width: 25, height: 25 }}/>)}
                                                                </Text>
                                                                {(shipmentData?.possibility_open && (
                                                                    <Text style={{...styles.smFont, textAlign: "center", marginBottom: 4,}}>يمكن فتح الطرد</Text>
                                                                )) || (
                                                                    <Text style={{...styles.smFont, textAlign: "center", marginBottom: 4, color: red[500],}}>ممنوع فتح الطرد</Text>
                                                                )}
                                                            </View>
                                                        </View>
                                                    </View>
                                                </View>
                                                 {/*right section*/}
                                                <View style={{flexBasis: "25%", display: "flex", padding: 4, margin: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center"}}>
                                                    <Text style={{...styles.smFont, textAlign: "center", fontSize: 20,}}>{shipmentData?.price_box > 0 ? "E" : "C"}</Text>
                                                    <Text style={{ ...styles.smFont, textAlign: "center" }}>{shipmentData?.price_box > 0 ? "ت.تجاري" : "ت.كلاسيكي"}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>

                                     {/*footer*/}
                                    <View style={{display: "flex", flexBasis: "28%", justifyContent: "space-between",}}>
                                        <View style={{flexBasis: "70%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4,}}>
                                            <View style={{display: "flex", flexBasis: "60%", margin: "0 auto",}}>
                                                <Image src={codebarGenerator(shipmentData?.code_box)}/>
                                            </View>
                                        </View>
                                        <View style={{display: "flex", flexBasis: "30%", margin: "0 auto",}}>
                                            <Text style={{ color: grey[800] }}>{shipmentData?.code_box}</Text>
                                        </View>
                                        {shipmentData?.fragile && (
                                            <View style={{flexBasis: "30%", flexDirection: "row", textAlign: "right", alignItems: "center", padding: 4, border: `1px solid ${grey[200]}`, backgroundColor: "#FFF",}}>
                                                <Text style={{...styles.smFont, flex: 1, fontSize: 12, textAlign: "center", color: red[500],}}>قابل للكسر</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View fixed style={styles.horizontalDivider}></View>
                    <View fixed style={styles.verticalDivider}></View>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default DeliveryTemplate;