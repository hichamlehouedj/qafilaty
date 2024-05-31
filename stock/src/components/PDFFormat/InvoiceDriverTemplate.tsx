import React, {useEffect, useState} from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import { alpha } from "@mui/material";
import { grey } from "@mui/material/colors";
import JsBarcode from "jsbarcode";
import {useGetAllShipmentsInvoiceDriver} from "../../graphql/hooks/shipments";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import useStore from "../../store/useStore";
import {useGetOneEmployee} from "../../graphql/hooks/employees";
interface Props {
    codeInvoice?: any;
    userData?: any;
    idDriver: string;
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

const InvoiceTemplate = ({ idDriver, codeInvoice, userData }: Props) => {
    forceUpdate = useForceUpdate();
    const [totalBox, setTotalBox] = useState(0)

    const [driver, setDriver] = useState({
        first_name: "",
        last_name: "",
        city: "",
        address: "",
        phone01: "",
        email: "",
        salary: 0
    })

    let [GetOneDriver, {data: oneDriverData}] = useGetOneEmployee();
    let getShipmentsData = useGetAllShipmentsInvoiceDriver({codeInvoice: codeInvoice || ""});


    useEffect(() => {
        GetOneDriver({
            variables: {
                factorId: idDriver || ""
            }
        })
    }, []);

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
        if (oneDriverData !== undefined) {
            setDriver({
                first_name: oneDriverData?.factor?.person?.first_name,
                last_name: oneDriverData?.factor?.person?.last_name,
                city: oneDriverData?.factor?.person?.city,
                address: oneDriverData?.factor?.person?.address,
                phone01: oneDriverData?.factor?.person?.phone01,
                email: oneDriverData?.factor?.person?.email,
                salary: parseFloat(oneDriverData?.factor?.salary || "0")
            })
        }
    }, [oneDriverData])

    useEffect(() => {
        setTotalBox(getShipmentsData.length)
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
                                                <Text style={{ fontSize: 23, color: "#575757" }}>فاتورة التوصيل</Text>
                                            </View>
                                            <View style={{flex: "1 1 1", padding: "1px", marginTop: 6, backgroundColor: theme.palette.primary.main, borderRadius: "2px"}}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            {/* section 1 */}

                            <View>
                                {/* brand info */}
                                <View style={{padding: 14, marginTop: "32px", border: "1px solid #ddd"}}>
                                    <View style={{flexDirection: "row-reverse", justifyContent: "space-between",}}>
                                        <View style={{display: "flex", alignItems: "flex-end", justifyContent: "center", flexDirection: "column-reverse",}}>
                                            <View style={{flexDirection: "row", justifyContent: "flex-start", margin: 0,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{driver?.email}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4}}>البريد الالكتروني:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-start", margin: 0,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4, textAlign: "left",}}>{driver?.address}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>عنوان السائق:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-start", margin: 0,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{`${driver?.first_name} ${driver?.last_name}`}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>إسم السائق:</Text>
                                            </View>
                                        </View>
                                        <View style={{display: "flex", alignItems: "flex-end", justifyContent: "center", flexDirection: "column-reverse"}} >
                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: 0,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{getShipmentsData?.[0]?.updatedAt}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>تاريخ الإنشاء:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: 0,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{driver?.phone01}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>رقم الهاتف:</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {/* section 2 */}

                                {/* product table */}

                                <View style={{border: `0.5 solid ${grey[300]}`, marginTop: "32px",}}>
                                    {/* table header */}
                                    <View style={{display: "flex", flexDirection: "row"}}>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>مجموع العمولة</Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>عمولة التوصيل</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>عدد الطرود</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>كود الفاتورة</Text>
                                        </View>
                                    </View>

                                    {/* table content */}
                                    <View style={{display: "flex", flexDirection: "row",}}>
                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>
                                                <Text style={{ fontSize: 9 }}>د.ج</Text>{" "}
                                                {driver?.salary * totalBox}
                                            </Text>
                                        </View>

                                        <View style={{flex: "1.5", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>
                                                <Text style={{ fontSize: 9 }}>د.ج</Text>{" "}
                                                {driver?.salary}
                                            </Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>{totalBox}</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>{codeInvoice}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Total */}
                            </View>
                        </View>
                    </View>

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed/>
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default InvoiceTemplate;