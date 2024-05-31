import React, {useEffect, useState} from "react";
import {Page, Text, Image, Document, StyleSheet, View, Font, PDFViewer} from "@react-pdf/renderer";
import dayjs from "dayjs";
import theme from "../../styles/theme";
import {alpha, Divider, Grid, Stack, Typography} from "@mui/material";
import { grey } from "@mui/material/colors";
import JsBarcode from "jsbarcode";
import {useGetAllInvoiceDriverPickUp} from "../../graphql/hooks/shipments";
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
    const [totalPrice, setTotalPrice] = useState(0)
    const [groupedPaidPickedUp, setGroupedPaidPickedUp] = useState<object>({})

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
    let getShipmentsData = useGetAllInvoiceDriverPickUp({codeInvoice: codeInvoice || ""});

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
        let TotalPrice = 0;
        setTotalBox(getShipmentsData.length)
        getShipmentsData.map((box: any, index: number) => {
            TotalPrice += box?.price_pick_up
        })
        setTotalPrice(TotalPrice)

        setGroupedPaidPickedUp(groupByKey(getShipmentsData, "code_pick_up"))
    }, [getShipmentsData])


    const groupByKey = (array: object[], key: string) => {
        return array.reduce((hash: object, obj: object) => {
            // @ts-ignore
            if(obj[key] === undefined) return hash;
            return Object.assign(hash, {
                // @ts-ignore
                [obj[key]]: ( hash[obj[key]] || [] ).concat(obj)
            })
        }, {})
    }

    const pricePickUp = (list: object[]) => {
        let price = 0
        list.map((box: any, index: number) => {
            price += box?.price_pick_up
        })
        return price
    }

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
                                                <Text style={{ fontSize: 23, color: "#575757" }}>فاتورة الالتقاط</Text>
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
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{driver?.phone01}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>رقم الهاتف:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{driver?.email}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4}}>البريد الالكتروني:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4, textAlign: "left",}}>{driver?.address}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>عنوان السائق:</Text>
                                            </View>

                                            <View style={{flexDirection: "row", justifyContent: "flex-end", margin: -4,}}>
                                                <Text style={{fontSize: 11, color: "#707070", margin: 4,}}>{`${driver?.first_name} ${driver?.last_name}`}</Text>
                                                <Text style={{fontSize: 12, color: "#909090", margin: 4,}}>إسم السائق:</Text>
                                            </View>
                                        </View>
                                        <View style={{display: "flex", alignItems: "center", justifyContent: "center", height: "128px",}} />
                                    </View>
                                </View>
                                {/* section 2 */}

                                {/* product table */}

                                <View style={{border: `0.5 solid ${grey[300]}`, marginTop: "32px",}}>
                                    {/* table header */}
                                    <View style={{display: "flex", flexDirection: "row"}}>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>تكلفة الرحلة</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>عدد الطرود</Text>
                                        </View>

                                        <View style={{flex: "1", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#9E9E9E", fontSize: 11}}>كود الرحلة</Text>
                                        </View>
                                    </View>

                                    {/* table content */}
                                    {groupedPaidPickedUp != undefined && Object.keys(groupedPaidPickedUp).length > 0 && (
                                        Object.keys(groupedPaidPickedUp).map((key: any, index: any) => {
                                            return (
                                                <View style={{display: "flex", flexDirection: "row",}}  key={index}>
                                                    <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 11}}>
                                                            <Text style={{ fontSize: 9 }}>د.ج</Text>{" "}
                                                            {
                                                                // @ts-ignore
                                                                pricePickUp(groupedPaidPickedUp[key])
                                                            }
                                                        </Text>
                                                    </View>

                                                    <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 11}}>{
                                                            // @ts-ignore
                                                            groupedPaidPickedUp?.[key].length
                                                        }</Text>
                                                    </View>

                                                    <View style={{flex: "1", flexShrink: 0, height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                                        <Text style={{color: "#707070", fontSize: 11}}>{key}</Text>
                                                    </View>
                                                </View>
                                            );
                                        })
                                    )}
                                </View>

                                {/* Total */}

                                <View style={{marginTop: "20px"}}>
                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto"}}>
                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 12}}>{totalBox}</Text>
                                        </View>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>عدد الطرود</Text>
                                        </View>
                                    </View>
                                    <View style={{display: "flex", flexDirection: "row", width: "50%", marginLeft: "auto"}}>
                                        <View style={{flex: "1.5", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "center", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 12}}>
                                                <Text style={{ fontSize: 9 }}> د.ج </Text>
                                                {totalPrice}
                                            </Text>
                                        </View>

                                        <View style={{flex: "2", flexShrink: 0, backgroundColor: alpha(theme.palette.primary.main, 0.1), height: "32px", justifyContent: "center", alignItems: "flex-end", border: `0.5 solid ${grey[300]}`, padding: 6,}}>
                                            <Text style={{color: "#707070", fontSize: 11}}>مجموع المبلغ</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} fixed />
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default InvoiceTemplate;