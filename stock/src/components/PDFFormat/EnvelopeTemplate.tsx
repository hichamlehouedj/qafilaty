import React, {useEffect, useState} from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import { alpha } from "@mui/material";
import { grey } from "@mui/material/colors";
import JsBarcode from "jsbarcode";
import {useGetAllShipmentsEnvelope} from "../../graphql/hooks/shipments";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import path from "path";

interface Props {
    codeEnvelope?: any;
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
        paddingTop: 25,
        paddingBottom: 100,
        paddingHorizontal: 30,
        fontFamily: "Montserrat-Arabic",
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        bottom: 65,
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
        // paddingHorizontal: 30,
        margin: "0 auto",
    },
});

const EnvelopeTemplate = ({ codeEnvelope, userData }: Props) => {
    forceUpdate = useForceUpdate();
    const [totalPrice, setTotalPrice] = useState(0)

    const [client, setClient] = useState({
        city: "",
    })

    let getShipmentsData = useGetAllShipmentsEnvelope({codeEnvelope: codeEnvelope || ""});

    console.log("getShipmentsData ", {codeEnvelope: codeEnvelope, getShipmentsData})

    // codebar generator
    let canvas = document.createElement("canvas");
    JsBarcode(canvas, codeEnvelope, {
        displayValue: false,
        background: "#FFF",
        margin: 12,
        marginLeft: 16,
        marginRight: 16,
        height: 58,
    });
    const barcode = canvas.toDataURL();

    useEffect(() => {
        if (getShipmentsData.length > 0) {
            setClient({
                city: getShipmentsData[0].client.person.city
            })
        }
    }, [getShipmentsData])

    useEffect(() => {
        let PriceBox = 0;

        if (getShipmentsData.length > 0) {
            getShipmentsData.map((box: any) => {
                PriceBox += parseFloat(box?.price_box) + parseFloat(box?.price_delivery)
            })
        }

        setTotalPrice(PriceBox)
    }, [getShipmentsData])

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

                                 {/*right section */}
                                <View style={{ flex: 1 }}>
                                    <View style={{display: "flex"}}>
                                        <View style={{ display: "flex" }}>
                                            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end"}}>
                                                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", margin: -4}}>
                                                    <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>
                                                        {dayjs().format("DD/MM/YYYY HH:mm:ss")}
                                                    </Text>
                                                    <Text style={{fontSize: 12, color: "#909090", margin: 2,}}>حررت بتاريخ:</Text>
                                                </View>
                                                <Text style={{ fontSize: 23, color: "#575757" }}>ظرف مالي</Text>
                                            </View>
                                            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* section 1 */}

                            <View>
                                {/* brand info */}
                                <View style={{minHeight: "90px", padding: 14, marginTop: "32px", border: "1px solid #ddd"}}>
                                    <View style={{flexDirection: "row-reverse", justifyContent: "space-between",}}>
                                        <View style={{justifyContent: "center", flexDirection: "column-reverse",}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{getShipmentsData?.[0]?.updatedAt}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>تاريخ الإنشاء:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4, marginBottom: "5px"}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{algerian_provinces?.[client?.city as any - 1]?.wilaya_name}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>الولاية:</Text>
                                            </View>
                                        </View>

                                        <View style={{display: "flex", alignItems: "center", justifyContent: "center", height: "90px",}}>
                                            {/*total payment*/}
                                            <View style={{width: 180, height: 70, backgroundColor: "#FFF", borderRadius: 2,}}>
                                                <View style={{color: "#FFF", backgroundColor: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", height: 70, borderRadius: 2}}>
                                                    <Image src={barcode} style={{height: "100%",}}/>
                                                </View>
                                            </View>
                                            <Text style={{fontSize: 12, color: "#707070", margin: 4,}}>{codeEnvelope}</Text>
                                        </View>
                                    </View>
                                </View>
                                {/* section 2 */}

                                {/* product table */}

                                <View style={{border: `0.5 solid ${grey[300]}`, marginTop: "32px",}}>
                                    {/* table header */}
                                    <View style={{display: "flex", flexDirection: "row"}}>
                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>مجموع المبلغ</Text>
                                        </View>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>كود الطرد</Text>
                                        </View>

                                        <View style={{flex: "0.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11,/* height: '32px',*/}}>
                                                #
                                            </Text>
                                        </View>
                                    </View>

                                    {/* table content */}
                                    {getShipmentsData.map((box: any, index: number) => (
                                        <View key={index} style={{display: "flex", flexDirection: "row",}}>
                                            <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>
                                                    <Text style={{ fontSize: 9 }}>د.ج</Text>
                                                    {parseFloat(box?.price_box) + parseFloat(box?.price_delivery)}
                                                </Text>
                                            </View>

                                            <View style={{flex: "2", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>{box?.code_box}</Text>
                                            </View>

                                            <View style={{flex: "0.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>{index + 1}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Total */}

                                <View style={{marginTop: "20px"}}>
                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto"}}>
                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 12}}>
                                                <Text style={{ fontSize: 9 }}> د.ج </Text>
                                                {totalPrice}
                                            </Text>
                                        </View>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>مجموع المبلغ في الظرف</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/*<View style={styles.companyInfofooter} fixed>
                        <View style={{display: "flex", position: "absolute", width: "100%", bottom: 0,}}>
                            <View style={{ display: "flex" }}>
                                <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>

                                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "8px 0",}}>
                                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                        <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{`${userData?.person?.company?.phone01} / ${userData?.person?.company?.phone02}`}</Text>
                                    </View>

                                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                        <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{userData?.person?.company?.email}</Text>
                                    </View>

                                    <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
                                        <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{algerian_provinces?.[userData?.person?.company?.city as any - 1]?.wilaya_name}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>*/}

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed/>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default EnvelopeTemplate;