import React, {useEffect, useState} from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import { alpha } from "@mui/material";
import { grey } from "@mui/material/colors";
import JsBarcode from "jsbarcode";
import path from "path";
import {Check, Printer} from "react-feather";
import useGetAllShipmentsInvoice from "../../graphql/hooks/shipments/useGetAllShipmentsInvoice";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
interface Props {
    codeInvoice?: any;
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

const InvoiceTemplate = ({ codeInvoice, userData }: Props) => {
    forceUpdate = useForceUpdate();
    const [totalPriceBox, setTotalPriceBox] = useState(0)
    const [totalPriceDelivery, setTotalPriceDelivery] = useState(0)
    const [totalPriceDeliveryFree, setTotalPriceDeliveryFree] = useState(0)
    const [totalTVA, setTotalTVA] = useState(0)
    const [priceBoxAndPriceDelivery, setPriceBoxAndPriceDelivery] = useState(0)

    const [client, setClient] = useState({
        first_name: "",
        last_name: "",
        city: "",
        address: "",
        phone01: "",
        email: "",
    })

    let getShipmentsData = useGetAllShipmentsInvoice({codeInvoice: codeInvoice || ""});

    console.log("getShipmentsData ", getShipmentsData);

    // codebar generator
    let canvas = document.createElement("canvas");
    JsBarcode(canvas, codeInvoice, {
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
                first_name: getShipmentsData[0].client.person.first_name,
                last_name: getShipmentsData[0].client.person.last_name,
                city: getShipmentsData[0].client.person.city,
                address: getShipmentsData[0].client.person.address,
                phone01: getShipmentsData[0].client.person.phone01,
                email: getShipmentsData[0].client.person.email
            })
        }
    }, [getShipmentsData])

    useEffect(() => {
        let PriceBox = 0;
        let PriceBoxAndPriceDelivery = 0;
        let PriceDelivery = 0;
        let PriceDeliveryFree = 0;
        let TVA = 0;

        if (getShipmentsData.length > 0) {
            getShipmentsData.map((box: any) => {
                PriceDelivery += box?.payment_type == "free" ? 0 : box?.price_delivery
                PriceDeliveryFree += box?.payment_type == "free" ? box?.price_delivery : 0

                PriceBoxAndPriceDelivery += box?.payment_type == "free"
                    ? box?.price_box - (box?.price_box * (box?.TVA / 100)) - box?.price_delivery
                    : box?.price_box - (box?.price_box * (box?.TVA / 100))

                PriceBox      += box?.price_box
                TVA           += (box?.price_box * (box?.TVA / 100))
            })
        }
        setPriceBoxAndPriceDelivery(PriceBoxAndPriceDelivery)
        setTotalPriceBox(PriceBox)
        setTotalPriceDelivery(PriceDelivery)
        setTotalPriceDeliveryFree(PriceDeliveryFree)
        setTotalTVA(TVA )
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
                                 {/*left section*/}
                                <Image style={{ width: 46, marginRight: 20 }} src={userData?.person?.company?.logo === "Default" ? "/logo.png" : userData?.person?.company?.logo}/>
                                 {/*right section*/}

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
                                                <Text style={{ fontSize: 23, color: "#575757" }}>فاتورة العميل</Text>
                                            </View>
                                            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* section 1 */}

                            <View>
                                {/* brand info */}
                                <View style={{minHeight: 156, padding: 14, marginTop: "32px", border: "1px solid #ddd"}}>
                                    <View style={{flexDirection: "row-reverse", justifyContent: "space-between",}}>
                                        <View style={{justifyContent: "space-between", flexDirection: "column-reverse",}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{getShipmentsData?.[0]?.updatedAt}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>تاريخ الإنشاء:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{client?.phone01}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>رقم الهاتف:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{client?.email}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4}}>البريد الالكتروني:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4, textAlign: "left",}}>{client?.address}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>عنوان العميل:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{`${client?.first_name} ${client?.last_name}`}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>إسم العميل:</Text>
                                            </View>
                                        </View>
                                        <View style={{display: "flex", alignItems: "center", justifyContent: "center", height: "128px",}}>
                                            {/*total payment*/}
                                            <View style={{width: 180, height: 70, backgroundColor: "#FFF", borderRadius: 2,}}>
                                                <View style={{color: "#FFF", backgroundColor: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", height: 70, borderRadius: 2}}>
                                                    <Image src={barcode} style={{height: "100%",}}/>
                                                </View>
                                            </View>
                                            <Text style={{fontSize: 12, color: "#707070", margin: 4,}}>{codeInvoice}</Text>
                                        </View>
                                    </View>
                                </View>
                                {/* section 2 */}

                                {/* product table */}

                                <View style={{border: `0.5 solid ${grey[300]}`, marginTop: "32px",}}>
                                    {/* table header */}
                                    <View style={{display: "flex", flexDirection: "row"}}>
                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>قيمة الضريبة</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>سعر التوصيل</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>التوصيل مجاني</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>سعر الطرد</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>كود الطرد</Text>
                                        </View>

                                        <View style={{flex: "0.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11,/* height: '32px',*/}}>
                                                #
                                            </Text>
                                        </View>
                                    </View>

                                    {/* table content */}
                                    {getShipmentsData.map((box: any, index: any) => (
                                        <View key={index} style={{display: "flex", flexDirection: "row",}}>
                                            <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>
                                                    <Text style={{ fontSize: 9 }}>د.ج</Text>
                                                     {(parseFloat(box?.TVA) / 100) * parseFloat(box?.price_box)}
                                                </Text>
                                            </View>

                                            <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>
                                                    <Text style={{ fontSize: 9 }}>د.ج</Text>
                                                    {parseFloat(box?.price_delivery)}
                                                </Text>
                                            </View>

                                            <View style={{flex: "1.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>
                                                    {box?.payment_type == "free" ? <Image src={"/done.png"} style={{width: "20px"}} /> : ""}
                                                </Text>
                                            </View>

                                            <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>
                                                    <Text style={{ fontSize: 9 }}>د.ج</Text>
                                                    {parseFloat(box?.price_box)}
                                                </Text>
                                            </View>

                                            <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>{box?.code_box}</Text>
                                            </View>

                                            <View style={{flex: "0.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                <Text style={{color: "#707070", fontSize: 11}}>{index + 1}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>

                                {/* Total */}

                                <View>
                                    <View style={{display: "flex", flexDirection: "row", marginTop: "32px", width: "60%", marginLeft: "auto"}}>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}><Text style={{ fontSize: 9 }}> د.ج </Text>{totalPriceBox}</Text>
                                        </View>


                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: grey[500], fontSize: 11}}>م. سعر الطرد</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "60%", marginLeft: "auto"}}>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}><Text style={{ fontSize: 9 }}> د.ج </Text>{totalPriceDelivery}</Text>
                                        </View>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: grey[500], fontSize: 11}}>م. س.التوصيل على المستلم</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "60%", marginLeft: "auto"}}>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}><Text style={{ fontSize: 9 }}> د.ج </Text>{totalPriceDeliveryFree}</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: grey[500], fontSize: 11}}>م. س.التوصيل على التاجر</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "60%", marginLeft: "auto"}}>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}><Text style={{ fontSize: 9 }}> د.ج </Text>{totalTVA}</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: grey[500], fontSize: 11}}>م. قيمة الضريبة</Text>
                                        </View>
                                    </View>

                                    <View style={{display: "flex", flexDirection: "row", width: "60%", marginLeft: "auto"}}>
                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 12}}>
                                                <Text style={{ fontSize: 9 }}> د.ج </Text>
                                                {priceBoxAndPriceDelivery  < 0 ? 0 : priceBoxAndPriceDelivery}
                                            </Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>المبلغ المستحق</Text>
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

export default InvoiceTemplate;