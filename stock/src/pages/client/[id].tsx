import {Box, Container, Grid, Stack, Tabs, Typography, IconButton, ListItemIcon, MenuItem, Chip as ChipM, Skeleton, Collapse} from "@mui/material";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import Tab from "../../components/Tabs/Tab";
import { Minus, MoreHorizontal, Printer,  FileText, Sheet } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import useStore from "../../store/useStore";
import {default as RAvatar} from "react-avatar";
import {grey} from "@mui/material/colors";
import Chip from "../../components/Chip/Chip";
import {X, User,  Plus, Slash, XOctagon, Repeat, CornerUpLeft, Check } from "react-feather";
import {useGetAllClientShipments, useGetOneShipments} from "../../graphql/hooks/shipments";
import { useGetOneClient } from "../../graphql/hooks/clients";
import {ContentRefContext} from "../../components/generated/Content";
import {searchHelper, sortByRecentTime} from "../../utilities/helpers/filters";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../../styles/theme";
import DeliveryCard from "../../components/generated/DeliveryCard";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import EmptyStat from "../../components/generated/EmptyStat";
import DetailsDrawer from "../../components/Drawer/DetailsDrawer";
import Button from "../../components/Button";
import MoneyCard from "../../components/generated/MoneyCard";
import StatisticsClient from "../../components/generated/StatisticsClient";
import { useRouter } from "next/router";
import TraceModal from "../../components/Modal/TraceModal";
import ReturnModal from "../../components/Modal/ReturnModal";
import {useDebouncedCallback} from "use-debounce";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import Menu from "../../components/Menu/Menu";
import RequestModal from "../../components/Modal/RequestModal";
import RequestWithRadioModal from "../../components/Modal/RequestWithRadioModal";

interface Props {}

interface Client {
    id: string;
    person: {
        first_name: string;
        last_name: string;
        email: string;
        phone01: string;
        city: string;
        address: string;
    }
    user: {
        user_name: string;
        activation: string;
    }
}

export function Client({}: Props): ReactElement {
    const popupState = usePopupState({ variant: "popover", popupId: "multiSelectMenu" });
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openShowDetailDrawer, setOpenShowDetailDrawer] = React.useState(false);
    const [openAddOrderModal, setOpenAddOrderModal] = React.useState(false);
    const [openRequestModal, setOpenRequestModal] = React.useState(false);
    const [openRequestWithRadioModal, setOpenRequestWithRadioModal] = React.useState(false);
    const [openTraceModal, setOpenTraceModal] = React.useState(false);
    const [openReturnModal, setOpenReturnModal] = React.useState(false);
    const [oneShipmentInfo, setOneShipmentInfo] = React.useState<any>({});
    const [requestStatus, setRequestStatus] = React.useState<number | undefined>(undefined);
    const [tabValue, setTabValue] = React.useState(0);
    const [allShipmentsData, setAllShipmentsData] = React.useState<object[]>([]);
    const [renderedShipmentsData, setRenderedShipmentsData] = React.useState<object[]>([]);
    const [clientData, setClientData] = React.useState<Client>({
        id: "",
        person: {
            first_name: "",
            last_name: "",
            email: "",
            phone01: "",
            city: "",
            address: ""
        },
        user: {
            user_name: "",
            activation: ""
        }
    });
    const [multiSelectionSelectedShipments, setMultiSelectionSelectedShipments] = React.useState<any>([]);
    const [isReceiptFormatCollapsed, setIsReceiptFormatCollapsed] = React.useState(false);

    const { query, push } = useRouter()

    const [GetOneClient, {data: oneClientData}] = useGetOneClient();

    // context
    const contentRef = useContext(ContentRefContext);

    // handlers
    const handleCloseShowDetailDrawer = () => setOpenShowDetailDrawer(false);
    const tabsHandler = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue as any);
    };

    // get all shipments
    let [getShipmentsData, getShipmentsLoading] = useGetAllClientShipments({
        client_id: query?.id?.toString() || ""
    });


    const [loadingPage, setLoadingPage] = React.useState<boolean>(getShipmentsLoading);

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // get one shipments (drawer use)
    let [GetOneShipment, { data: oneShipmentdata }] = useGetOneShipments();
    oneShipmentdata = oneShipmentdata?.box;

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], allShipmentsData);
    filteredData = searchHelper(searchValue, filteredData);

    let allShipments = filteredData.filter( (v: any) => v.lastTrace[0]?.status < 10 || v.lastTrace[0]?.status > 13 && v.lastTrace[0]?.status != 15 );
    let amountsUnderCollection = filteredData.filter((v: any) => v.lastTrace[0]?.status == 10 ||  v.lastTrace[0]?.status == 11 );
    let amountsCollected = filteredData.filter((v: any) => v.lastTrace[0]?.status == 12);
    let payments = filteredData.filter((v: any) => v.lastTrace[0]?.status == 13 || v.lastTrace[0]?.status == 18);
    let returned = filteredData.filter((v: any) => v.lastTrace[0]?.status == 15 && v.lastTrace[0]?.stock?.id == userData?.person?.list_stock_accesses?.stock?.id);

    function groupByKey(array: object[], key: string) {
        return array.reduce((hash: object, obj: object) => {
            // @ts-ignore
            if(obj[key] === undefined) return hash;
            return Object.assign(hash, {
                // @ts-ignore
                [obj[key]]: ( hash[obj[key]] || [] ).concat(obj)
            })
        }, {})
    }

    let groupedData = groupByKey(payments, "code_invoice");

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(40);
    const [shipmentDataEnqueued, setShipmentDataEnqueued] = useState<object[]>([]);

    useEffect(() => {
        setShipmentDataEnqueued(() => [...renderedShipmentsData.slice(0, loadingDataSize)]);
        if (renderedShipmentsData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedShipmentsData, searchValue]);

    const moreDataHendler = () => {
        let currentChunk = renderedShipmentsData.slice(0, shipmentDataEnqueued.length + loadingDataSize);
        setTimeout(() => {
            setShipmentDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedShipmentsData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // watchers
    useEffect(() => {
        setAllShipmentsData(() => [...getShipmentsData]);
    }, [getShipmentsData]);

    useEffect(() => {
        if (tabValue == 0) {
            setRenderedShipmentsData(() => [...allShipments]);
        } else if (tabValue == 1) {
            setRenderedShipmentsData(() => [...returned]);
        } else if (tabValue == 2) {
            setRenderedShipmentsData(() => [...amountsUnderCollection]);
        } else if (tabValue == 3) {
            setRenderedShipmentsData(() => [...amountsCollected]);
        } else if (tabValue == 4) {
            setRenderedShipmentsData(() => [...payments]);
        }
    }, [allShipmentsData, searchValue]);

    useEffect(() => {
        GetOneClient({
            variables: {
                clientId: query?.id?.toString() || ""
            }
        })
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    useEffect(() => {
        setClientData(oneClientData?.client)
    }, [oneClientData])

    const onCollectedAmounts = () => {
        setOpenTraceModal(true);
    }

    const onReturnedBox = () => {
        setOpenReturnModal(true);
    }
    
    const netCustomerReceivables = (data: object[]) => {
        let amounts = 0
        for (let i = 0; i < data.length; i++) {
            // @ts-ignore
            if (data[i]?.paid_in_office) {
                // @ts-ignore
                amounts += data[i]?.price_box - (data[i]?.price_box * (data[i]?.TVA / 100))
                // @ts-ignore
            }  else if (data[i]?.payment_type == "free") {
                // @ts-ignore
                amounts += data[i]?.price_box - (data[i]?.price_box * (data[i]?.TVA / 100)) - data[i]?.price_delivery
            } else {
                // @ts-ignore
                amounts += (data[i]?.price_box + data[i]?.price_delivery) - (data[i]?.price_box * (data[i]?.TVA / 100)) - data[i]?.price_delivery
            }
        }
        return amounts
    }

    const netCustomerCompany = (data: object[]) => {
        let amounts = 0
        for (let i = 0; i < data.length; i++) {
            // @ts-ignore
            if (data[i]?.paid_in_office) {
                // @ts-ignore
                amounts += data[i]?.price_box * (data[i]?.TVA / 100)
            } else {
                // @ts-ignore
                amounts += data[i]?.price_box * (data[i]?.TVA / 100) + data[i]?.price_delivery
            }
        }
        return amounts
    }

    if (loadingPage) {
        setLoadingPageDebounced(getShipmentsLoading)
    }
    // @ts-ignore
    return (
        <>
            <Head><title>العميل | قافلي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 24px", xl: "0 48px" }, height: "100%" }} >
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={"100%"}>
                        <Grid item xs={12} height={"170px"} style={{background: "#fff", paddingRight: "40px", width: "calc(100% - 72px)", position: "fixed", zIndex: "100", top: "64px", right: "72px"}}
                        >
                            <Grid container flexDirection={"row"} justifyContent="flex-start" >
                                <Grid item xs={12} sm="auto">
                                    <Grid item xs={12} height={"100px"}>
                                        <Grid item>
                                            <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                                {clientData ? (<>
                                                    <RAvatar size="60px" name={`${clientData?.person?.first_name || ""} ${clientData?.person?.last_name || ""}`} style={{ fontFamily: "Montserrat-Arabic"}} round={"5px"} maxInitials={1}></RAvatar>
                                                    <Stack rowGap={"5px"}>
                                                        <Typography variant="sm" color={grey[700]}>{`${clientData?.person?.first_name || ""} ${clientData?.person?.last_name || ""}`}</Typography>
                                                        {/* @ts-ignore */}
                                                        <Typography variant="2xs" color={grey[400]}>{`${algerian_provinces?.[clientData?.person?.city - 1 || 0]?.wilaya_name || ""} ${clientData?.person?.address || ""}`}</Typography>
                                                        <Typography variant="2xs" color={grey[400]}>
                                                            {`${clientData?.person?.email || ""}, ${clientData?.person?.phone01 || ""}`}
                                                            {clientData?.user != null && (<>
                                                                <Chip size={"small"} variant="filled" label={<>{clientData?.user?.user_name || ""} <User size={14}/></>} color="info" rounded={"false"} style={{margin: "0 5px"}}/>
                                                                <Chip size={"small"} variant="filled" label={clientData?.user?.activation || ""} color="success" rounded={"false"} dir="rtl" />
                                                            </>)}
                                                        </Typography>
                                                    </Stack></>)
                                                    : (<>
                                                        <Skeleton variant="rectangular" width={60} height={60} style={{ borderRadius: "5px"}} />
                                                        <Stack rowGap={"5px"}>
                                                            <Skeleton variant="text" width={120} height={18} />
                                                            <Skeleton variant="text" width={150} height={16} />
                                                            <Skeleton variant="text" width={200} height={16} />
                                                        </Stack>
                                                    </>)
                                                }
                                            </Stack>
                                        </Grid>
                                    </Grid>

                                    {multiSelectionSelectedShipments.length > 0 && (
                                        <Grid item xs={12} sm="auto"
                                            sx={{
                                                position: "fixed",
                                                top: "80px",
                                                right: "10px",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: "256px",
                                                    height: "44px",
                                                    backgroundColor: "#FFF",
                                                    borderRadius: "6px",
                                                    boxShadow: (theme as any).shadows[25].shadow3,
                                                    padding: "0 14px",
                                                }}
                                            >
                                                <Stack direction={"row"} height="100%" alignItems="center" justifyContent={"space-between"}>
                                                    <Stack direction={"row"} gap="8px" alignItems={"center"}>
                                                        <Box
                                                            onClick={() => {
                                                                setMultiSelectionSelectedShipments([]);
                                                            }}
                                                            sx={{
                                                                backgroundColor: theme.palette.primary.main,
                                                                width: "17px",
                                                                height: "17px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                borderRadius: "2px",
                                                                cursor: "pointer",
                                                            }}
                                                        >
                                                            <Minus size="13" strokeWidth={"3"} color="#FFF" />
                                                        </Box>
                                                        <Typography variant="xs" color={"#9790B1"}>
                                                            تم تحديد{" "}
                                                            <Typography variant="xs" color={theme.palette.primary.main}>
                                                                {multiSelectionSelectedShipments.length}
                                                            </Typography>{" "}
                                                            طرد
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction={"row"} gap="0px" alignItems={"center"}>
                                                        <Link
                                                            href={{
                                                                pathname: "/printer",
                                                                query: {
                                                                    shipmentID: multiSelectionSelectedShipments.map(
                                                                        (v: any) => v.id
                                                                    ),
                                                                    bordereau: true,
                                                                    format: "pdf",
                                                                    extract: false
                                                                },
                                                            }}
                                                            passHref
                                                        >
                                                            <a target="_blank">
                                                                <IconButton size={"small"}>
                                                                    <Printer color={grey[600]} size={17} />
                                                                </IconButton>
                                                            </a>
                                                        </Link>
                                                        <Box sx={{ padding: "12px 0" }} {...bindTrigger(popupState)}>
                                                            <IconButton size={"small"} sx={{ "&:hover svg": { stroke: grey[500] } }}>
                                                                <MoreHorizontal color={grey[600]} size={17} />
                                                            </IconButton>
                                                        </Box>
                                                    </Stack>
                                                </Stack>
                                            </Box>
                                        </Grid>
                                    )}

                                    {/* @ts-ignore */}
                                    <Tabs value={tabValue} onChange={tabsHandler}>
                                        <Tab label="طرود" onClick={() => setRenderedShipmentsData(allShipments)} />
                                        <Tab label="طرود راجعة" onClick={() => setRenderedShipmentsData(returned)}/>
                                        <Tab label="مبالغ قيد التحصيل" onClick={() => setRenderedShipmentsData(amountsUnderCollection)} />
                                        <Tab label="مبالغ جاهزة للدفع" onClick={() => setRenderedShipmentsData(amountsCollected)} />
                                        <Tab label="مدفوعات" onClick={() => setRenderedShipmentsData(payments)}/>
                                        <Tab label="احصائيات" />
                                    </Tabs>
                                </Grid>
                            </Grid>
                        </Grid>

                        {loadingPage && (
                            <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%", marginTop: "180px"}}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={3}>
                                            {Array(8).fill(null).map((_, i: number) => (
                                                <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                                                    <Skeleton variant="rectangular" sx={{width: "100%", height: "152px", borderRadius: "4px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Container>
                        )}

                        {/* content window */}
                        <Grid item xs={12} paddingBottom="32px" style={{marginTop: "160px"}} >
                            {tabValue == 3 && amountsCollected.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>صافي مستحقات العميل <ChipM label={`${netCustomerReceivables(amountsCollected)} دج`} size="small" variant={'filled'}/></Typography>
                                        <Typography variant="2xs" color={grey[700]}>صافي مستحقات الشركة <ChipM label={`${netCustomerCompany(amountsCollected)} دج`} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={onCollectedAmounts} >دفع للعميل</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue == 1 && returned.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>صافي مستحقات الشركة <ChipM  label={`${(returned.length * userData?.person?.company?.return_price)} دج`} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={onReturnedBox}>تسليم الراجع</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue != 5 && (<InfiniteScroll
                                pageStart={0}
                                loadMore={moreDataHendler}
                                hasMore={hasMore}
                                useWindow={false}
                                initialLoad={false}
                                getScrollParent={() => contentRef?.current}
                                // @ts-ignore
                                loader={
                                    shipmentDataEnqueued.length && (
                                        <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0"}}>
                                            <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                                        </Box>
                                    )
                                }
                            >
                                <Grid container spacing={3}>
                                    {tabValue !== 4 && (
                                        shipmentDataEnqueued.length != 0 ? (
                                            shipmentDataEnqueued?.map((shipment: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        {tabValue !== 4 && (
                                                            <DeliveryCard
                                                                shipment_id={shipment.id}
                                                                name={`${shipment?.recipient_name}`}
                                                                city={algerian_provinces?.[shipment?.recipient_city - 1]?.wilaya_name}
                                                                shipment_code={shipment?.code_box}
                                                                status={shipment?.lastTrace[0]?.status}
                                                                shipmentRestInfo={shipment}
                                                                setOpenShowDetailDrawer={setOpenShowDetailDrawer}
                                                                onshowDetailsClick={() => GetOneShipment({ variables: {boxId: shipment.id} })}
                                                                setRequestStatus={setRequestStatus}
                                                                onRequestClick={setOpenRequestModal}
                                                                onRequestWithRadioClick={setOpenRequestWithRadioModal}
                                                                setOneShipmentInfo={setOneShipmentInfo}
                                                                isSelecting={multiSelectionSelectedShipments.length > 0}
                                                                isSelected={
                                                                    multiSelectionSelectedShipments.findIndex(
                                                                        (v: any) => v.id == shipment.id
                                                                    ) > -1
                                                                }
                                                                setMultiSelectionSelectedShipments={setMultiSelectionSelectedShipments}
                                                            />
                                                        )}
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد بيانات"></EmptyStat>
                                            </Grid>
                                        )
                                    )}

                                    {tabValue == 4 && (
                                        groupedData != undefined && Object.keys(groupedData).length > 0 ? (
                                            Object.keys(groupedData).map((key: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        <MoneyCard code_invoice={key} dataInvoice={
                                                            // @ts-ignore
                                                            groupedData[key]
                                                        }/>
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد بيانات"></EmptyStat>
                                            </Grid>
                                        )
                                    )}
                                </Grid>
                            </InfiniteScroll>)}

                            {tabValue == 5 && (<StatisticsClient  idClient={clientData.id}/>)}
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Show Details */}
            {/* @ts-ignore */}
            {oneShipmentdata && (
                <DetailsDrawer width={"470px"} anchor="right"
                               fullname={oneShipmentdata?.recipient_name}
                               city={algerian_provinces?.[oneShipmentdata?.recipient_city - 1]?.wilaya_name}
                               open={openShowDetailDrawer}
                               onClose={handleCloseShowDetailDrawer}
                               onCloseInside={handleCloseShowDetailDrawer}
                               detailsData={oneShipmentdata}
                ></DetailsDrawer>
            )}


            {/* Show Details */}
            {/* @ts-ignore */}
            <RequestModal width="640px"
                  oneShipmentInfo={oneShipmentInfo}
                  requestStatus={requestStatus}
                  open={openRequestModal}
                  onClose={(resetModalFn: any) => {
                      setOpenRequestModal(false);
                      typeof resetModalFn == "function" && resetModalFn();
                  }}
                  title={
                      (requestStatus == 15 && "تاكيد طلب الارجاع") ||
                      (requestStatus == 20 && "تاكيد طلب الاستبدال") ||
                      (requestStatus == 27 && "تاكيد طلب التاجيل") ||
                      (requestStatus == 25 && "تاكيد طلب الالغاء") ||
                      (requestStatus == 29 && "فشل التوصيل") ||
                      (requestStatus == 8 && "تم التوصيل")

                  }
                  iconTitle={
                      (requestStatus == 15 && <CornerUpLeft />) ||
                      (requestStatus == 20 && <Repeat />) ||
                      (requestStatus == 27 && <Slash />) ||
                      (requestStatus == 25 && <XOctagon />) ||
                      (requestStatus == 29 && <Repeat />) ||
                      (requestStatus == 8 && <Check />)
                  }
            />

            {/* @ts-ignore */}
            <RequestWithRadioModal
                oneShipmentInfo={oneShipmentInfo}
                requestStatus={requestStatus}
                open={openRequestWithRadioModal}
                width="640px"
                onClose={(resetModalFn: any) => {
                    setOpenRequestWithRadioModal(false);
                    typeof resetModalFn == "function" && resetModalFn();
                }}
                title={requestStatus == 28 && "إجراء فشل التوصيل"}
                iconTitle={requestStatus == 28 && <Slash />}
            />

            <TraceModal title={"دفع مستحقات العميل"} idClient={query?.id?.toString() || ""} open={openTraceModal} onClose={() => setOpenTraceModal(false)} amountsCollected={amountsCollected} />
            <ReturnModal title={"إرجاع طرود العميل"} idClient={query?.id?.toString() || ""} open={openReturnModal} onClose={() => setOpenReturnModal(false)} returnedBox={returned} />


            <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{vertical: "bottom", horizontal: "center",}}
                transformOrigin={{vertical: "top", horizontal: "center",}}
            >
                <Link
                    href={{
                        pathname: "/printer",
                        query: {
                            shipmentID: multiSelectionSelectedShipments.map((v: any) => v.id),
                            receipt: true
                        },
                    }}
                    passHref
                >
                    <a target="_blank">
                        <MenuItem onClick={() => setIsReceiptFormatCollapsed(!isReceiptFormatCollapsed)}>
                            <ListItemIcon>
                                <img src="/receipt.svg" width={17} height={17} />
                            </ListItemIcon>
                            <Box marginLeft={"-8px"}>إنشاء وصل إستلام</Box>
                        </MenuItem>
                    </a>
                </Link>


                <Collapse in={isReceiptFormatCollapsed} timeout="auto" unmountOnExit>
                    {/* <Menu> */}
                    <Link
                        href={{
                            pathname: "/printer",
                            query: {shipmentID: multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "pdf", extract: false},
                        }}
                        passHref
                    >
                        <a target="_blank">
                            <MenuItem sx={{ backgroundColor: "#F2F1F5" }} onClick={() => popupState.close()}>
                                <ListItemIcon sx={{ marginLeft: "2px" }}>
                                    <FileText size={15} strokeWidth={2} />
                                </ListItemIcon>
                                <Box marginLeft={"-8px"} fontSize="12px">بصيغة PDF</Box>
                            </MenuItem>
                        </a>
                    </Link>
                    <Link
                        href={{
                            pathname: "/printer",
                            query: {shipmentID: multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "excel", extract: false},
                        }}
                        passHref
                    >
                        <a target="_blank">
                            <MenuItem sx={{ backgroundColor: "#F2F1F5" }} onClick={() => popupState.close()}>
                                <ListItemIcon sx={{ marginLeft: "2px" }}>
                                    <Sheet size={15} strokeWidth={2} />
                                </ListItemIcon>
                                <Box marginLeft={"-8px"} fontSize="12px">بصيغة Excel</Box>
                            </MenuItem>
                        </a>
                    </Link>
                    {/* </Menu> */}
                </Collapse>
            </Menu>
        </>
    );
}

export default Client;