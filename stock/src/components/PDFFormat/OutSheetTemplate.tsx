import React, {useEffect, useState} from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import { alpha } from "@mui/material";
import { grey } from "@mui/material/colors";
import JsBarcode from "jsbarcode";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import {useGetOneEmployee} from "../../graphql/hooks/employees";
import useStore from "../../store/useStore";
import path from "path";

interface Props {
    data: any;
    idDriver?: any;
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
        paddingTop: "1cm",
        paddingBottom: "1.7cm",
        paddingHorizontal: "1cm",
        fontFamily: "Montserrat-Arabic",
    },
    pageNumber: {
        position: "absolute",
        fontSize: 12,
        bottom: "1cm",
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

const OutSheetTemplate = ({ data, idDriver }: Props) => {
    const userData = useStore((state: any) => state.userData);
    forceUpdate = useForceUpdate();
    const [totalPriceBox, setTotalPriceBox] = useState(0)

    const [client, setClient] = useState({
        first_name: "",
        last_name: "",
        city: "",
        address: "",
        phone01: "",
        email: "",
    })

    const [GetOneDriver, {data: oneDriverData}] = useGetOneEmployee();

    useEffect(() => {
        GetOneDriver({
            variables: {
                factorId: idDriver?.toString() || ""
            }
        })
    }, []);

    console.log("OutSheetTemplate data ", data);

    useEffect(() => {
        if (oneDriverData != undefined) {
            setClient({
                first_name: oneDriverData?.factor?.person?.first_name,
                last_name: oneDriverData?.factor?.person?.last_name,
                city: oneDriverData?.factor?.person?.city,
                address: oneDriverData?.factor?.person?.address,
                phone01: oneDriverData?.factor?.person?.phone01,
                email: oneDriverData?.factor?.person?.email
            })
        }
    }, [oneDriverData])

    useEffect(() => {
        let PriceBox = 0;

        if (data.length > 0) {
            data.map((box: any) => {
                if (box?.paid_in_office || box?.payment_type == "free") {
                    PriceBox += parseFloat(box?.price_box)
                } else {
                    PriceBox += parseFloat(box?.price_box) + parseFloat(box?.price_delivery)
                }
            })
        }

        setTotalPriceBox(PriceBox)
    }, [data])


    const genCodeBar = (code: string) => {
        // codebar generator
        let canvas = document.createElement("canvas");
        JsBarcode(canvas, code, {
            displayValue: false,
            background: "#FFF",
            margin: 12,
            marginLeft: 5,
            marginRight: 5,
            height: 48,
        });
        return  canvas.toDataURL();
    }

    console.log("totalPriceBox ", totalPriceBox)

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
                            <View style={{display: "flex", width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: "2cm"}}>
                                {/* left section */}
                                <Image style={{ width: 46, marginRight: 20 }}
                                    src={userData?.person?.company?.logo === "Default" ? "/logo.png" : userData?.person?.company?.logo} />
                                {/* right section */}

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
                                                <Text style={{ fontSize: 23, color: "#575757" }}>خريطة الطريق</Text>
                                            </View>
                                            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* section 1 */}

                            <View>
                                {/* brand info */}
                                <View style={{minHeight: 40, padding: "0.25cm 0.25cm", marginTop: "1cm", border: "1px solid #ddd", height: "2.4cm"}}>
                                    <View style={{flexDirection: "row-reverse", justifyContent: "space-between", height: "2.4cm"}}>
                                        <View style={{justifyContent: "space-between", flexDirection: "column-reverse"}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{client?.phone01}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>رقم الهاتف:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{`${client?.first_name} ${client?.last_name}`}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>إسم السائق:</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>


                                {/* section 2 */}
                                {/* product table */}
                                <View style={{border: `0.05cm solid ${grey[300]}`, marginTop: "0.3cm",}}>
                                     {/*table header*/}
                                    <View style={{display: "flex", flexDirection: "row", height: "1cm"}}>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>الكود بار</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>السعر الكل</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>الولاية</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>هاتف المستلم</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>هاتف المرسل</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>كود الطرد</Text>
                                        </View>

                                        <View style={{flex: "0.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1cm", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 9}}>#</Text>
                                        </View>
                                    </View>

                                     {/*table content*/}
                                    {data != undefined && data.length > 0 ?
                                        data.map((box: any, index: any) => (
                                            <View key={index} style={{display: "flex", flexDirection: "row", maxHeight: "1.35cm", height: "1.35cm", borderTop: `0.03cm solid ${grey[300]}`}}>
                                                    <View style={{flex: "2", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "center", padding: "0 6px", }}>
                                                        {/*<Image src={genCodeBar(box?.code_box)} style={{height: "100%",}}/>*/}
                                                        <Text style={{color: "#707070", fontSize: 9}}>{box?.categorie}</Text>
                                                    </View>

                                                    <View style={{flex: "1.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "center", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>
                                                            <Text style={{ fontSize: 9 }}>د.ج</Text>
                                                            {box?.paid_in_office || box?.payment_type == "free"
                                                                ? parseFloat(box?.price_box)
                                                                : parseFloat(box?.price_delivery) + parseFloat(box?.price_box)
                                                            }
                                                        </Text>
                                                    </View>

                                                    <View style={{flex: "1.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "flex-end", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>{algerian_provinces?.[box?.recipient_city as any - 1]?.wilaya_name || ""}</Text>
                                                    </View>

                                                    <View style={{flex: "1.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "flex-end", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>{box?.recipient_phone1}</Text>
                                                    </View>

                                                    <View style={{flex: "1.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "flex-end", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>{box?.client?.person?.phone01}</Text>
                                                    </View>

                                                    <View style={{flex: "1.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "flex-end", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>{box?.code_box}</Text>
                                                    </View>

                                                    <View style={{flex: "0.5", flexShrink: 0, height: "1.35cm", justifyContent: "center", alignItems: "center", borderLeft: `0.05cm solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 9}}>{index + 1}</Text>
                                                    </View>
                                                </View>
                                        ))
                                        : null
                                    }
                                </View>

                                {/* Total */}
                                <View style={{height: "1.35cm", marginTop: "1.35cm"}}>
                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto"}}>
                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1.35cm", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 12}}>
                                                <Text style={{ fontSize: 9 }}> د.ج </Text>
                                                {totalPriceBox}
                                            </Text>
                                        </View>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "1.35cm", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>مجموع المبالغ</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/*<View style={styles.companyInfofooter} fixed>*/}
                    {/*    <View style={{display: "flex", position: "absolute", width: "100%", bottom: 0,}}>*/}
                    {/*        <View style={{ display: "flex" }}>*/}
                    {/*            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>*/}

                    {/*            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "8px 0",}}>*/}
                    {/*                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>*/}
                    {/*                    <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{`${userData?.person?.company?.phone01} / ${userData?.person?.company?.phone02}`}</Text>*/}
                    {/*                </View>*/}

                    {/*                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>*/}
                    {/*                    <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{userData?.person?.company?.email}</Text>*/}
                    {/*                </View>*/}
                    {/*                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>*/}
                    {/*                    <Text style={{fontSize: 11, color: "#707070", margin: 2,}}>{algerian_provinces?.[userData?.person?.company?.city as any - 1]?.wilaya_name || ""}</Text>*/}
                    {/*                </View>*/}
                    {/*            </View>*/}
                    {/*        </View>*/}
                    {/*    </View>*/}
                    {/*</View>*/}

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed/>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default OutSheetTemplate;