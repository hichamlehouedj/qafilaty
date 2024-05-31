import {Box, Container, Grid, Stack, Tabs, Typography, Chip as ChipM, Skeleton, Badge} from "@mui/material";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import Tab from "../../components/Tabs/Tab";
import Head from "next/head";
import useStore from "../../store/useStore";
import {default as RAvatar} from "react-avatar";
import {grey, red} from "@mui/material/colors";
import Chip from "../../components/Chip/Chip";
import {User} from "react-feather";
import {useGetAllDriverShipments, useGetOneShipments, useDeliveredDriverBox, usePickedUpDriverBox} from "../../graphql/hooks/shipments";
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
import {useRouter} from "next/router";
import AccountingModal from "../../components/Modal/AccountingModal";
import {useGetOneEmployee} from "../../graphql/hooks/employees";
import FailedModal from "../../components/Modal/FailedModal";
import Link from "next/link";
import {useDebouncedCallback} from "use-debounce";
import DriverCommissionModal from "../../components/Modal/DriverCommissionModal";
import DriverCommissionPickUpModal from "../../components/Modal/DriverCommissionPickUpModal";
import MoneyDriverCard from "../../components/generated/MoneyDriverCard";
import MoneyDriverPickUpCard from "../../components/generated/MoneyDriverPickUpCard";

interface Props {}

interface Driver {
    id: string;
    person: {
        id: string;
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

export function Driver({}: Props): ReactElement {
    // Object of Router for get id driver
    const { query, push } = useRouter()

    // Hook for get keys input in Field Search
    const searchValue = useStore((state: any) => state.searchValue);

    // useContext Hook
    const contentRef = useContext(ContentRefContext);

    // Status of PopUp Modals
    const [openShowDetailDrawer, setOpenShowDetailDrawer] = React.useState(false);
    const [openTraceModal, setOpenTraceModal] = React.useState(false);
    const [openAccountingModal, setOpenAccountingModal] = React.useState(false);
    const [openDriverCommissionModal, setOpenDriverCommissionModal] = React.useState(false);
    const [openDriverCommissionPickUpModal, setOpenDriverCommissionPickUpModal] = React.useState(false);
    const [openRequestModal, setOpenRequestModal] = React.useState(false);

    // Save All info Box for showing in Drawer
    const [oneShipmentInfo, setOneShipmentInfo] = React.useState<any>({});
    const [oneShipmentdata, setOneShipmentData] = React.useState<any>({});

    const [requestStatus, setRequestStatus] = React.useState<number | undefined>(undefined);

    // Save Number tab
    const [tabValue, setTabValue] = React.useState(0);

    // Save all box driver
    const [allShipmentsData, setAllShipmentsData] = React.useState<object[]>([]);

    // Save all box rendered
    const [renderedShipmentsData, setRenderedShipmentsData] = React.useState<object[]>([]);

    // Save all box filtered
    const [filteredShipments, setFilteredShipments] = React.useState<object[]>([]);
    const [failedShipments, setFailedShipments] = React.useState<object[]>([]);
    const [deliveredShipments, setDeliveredShipments] = React.useState<object[]>([]);
    const [paidDeliveredShipments, setPaidDeliveredShipments] = React.useState<object[]>([]);
    const [unpaidDeliveredShipments, setUnpaidDeliveredShipments] = React.useState<object[]>([]);

    const [unpaidPickedUpShipments, setUnpaidPickedUpShipments] = React.useState<object[]>([]);
    const [paidPickedUpShipments, setPaidPickedUpShipments] = React.useState<object[]>([]);

    const [groupedPaidDelivered, setGroupedPaidDelivered] = React.useState<object>([]);
    const [groupedPaidPickedUp, setGroupedPaidPickedUp] = React.useState<object>([]);



    // Save info driver
    const [driverData, setDriverData] = React.useState<Driver>({
        id: "",
        person: {
            id:     "",
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

    // Save status of loading data
    const [loadingPage, setLoadingPage] = useState<boolean>(true);

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [shipmentDataEnqueued, setShipmentDataEnqueued] = useState<object[]>([]);
    const loadingDataSize = 40;

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // Hook for get Driver info by id using "GetOneDriver" function
    const [GetOneDriver, {data: oneDriverData}] = useGetOneEmployee();

    // get all shipments
    let [getShipmentsData, getShipmentsLoading] = useGetAllDriverShipments({
        idDriver: query?.id?.toString() || ""
    });

    // Hook for get Box info by id using "GetOneShipment" function
    let [GetOneShipment, { data: dataOneShipment }] = useGetOneShipments();

    // Function for Handle tabs change
    const tabsHandler = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue as any);
    };

    // filtering

    // get all shipments Delivered
    const [getBoxDelivered] = useDeliveredDriverBox({
        idDriver: query?.id?.toString() || ""
    });


    // get all shipments Picked Up
    const getBoxPickedUp = usePickedUpDriverBox({
        idDriver: query?.id?.toString() || ""
    });



    const moreDataHendler = () => {
        let currentChunk = renderedShipmentsData.slice(
            0,
            shipmentDataEnqueued.length + loadingDataSize
        );
        setTimeout(() => {
            setShipmentDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedShipmentsData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // Get All Info Driver
    useEffect(() => {
        GetOneDriver({
            variables: {
                factorId: query?.id?.toString() || ""
            }
        })
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    // watchers

    useEffect(() => {
        setFilteredShipments(() => [...searchHelper(searchValue, allShipmentsData)])
    }, [searchValue, allShipmentsData]);

    useEffect(() => {
        setFailedShipments(() => [...filteredShipments.filter((v: any) => [28, 31, 34].includes(v.lastTrace[0]?.status))])
        setDeliveredShipments(() => [...filteredShipments.filter((v: any) => (v.price_box > 0 && v.lastTrace[0]?.status == 10) || (v.price_box == 0 && v.lastTrace[0]?.status == 8))])
        console.log("filteredShipments ", filteredShipments)
        console.log("DeliveredShipments ", filteredShipments.filter((v: any) => (v.price_box > 0 && v.lastTrace[0]?.status == 10) || (v.price_box == 0 && v.lastTrace[0]?.status == 8)))
    }, [filteredShipments]);

    useEffect(() => {
        setShipmentDataEnqueued(() => [...renderedShipmentsData.slice(0, loadingDataSize)]);
        if (renderedShipmentsData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedShipmentsData, searchValue]);

    useEffect(() => {
        setAllShipmentsData(() => [...sortByRecentTime(["createdAt"], getShipmentsData)]);
    }, [getShipmentsData]);

    useEffect(() => {
        if (tabValue == 0) {
            setRenderedShipmentsData(() => [...filteredShipments]);
        } else if (tabValue == 1) {
            setRenderedShipmentsData(() => [...failedShipments]);
        } else if (tabValue == 2) {
            setRenderedShipmentsData(() => [...unpaidDeliveredShipments]);
        } else if (tabValue == 3) {
            setRenderedShipmentsData(() => [...unpaidPickedUpShipments]);
        } else if (tabValue == 4) {
            setRenderedShipmentsData(() => [...deliveredShipments]);
        } else if (tabValue == 5) {
            setRenderedShipmentsData(() => [...paidDeliveredShipments])
        }
    }, [allShipmentsData, filteredShipments]);

    useEffect(() => {
        if (getBoxDelivered && getBoxDelivered?.length > 0) {
            setPaidDeliveredShipments(() => [...getBoxDelivered?.filter((v: any) => v.code_driver_commission != "" && v.code_driver_commission != null)])
            setUnpaidDeliveredShipments(() => [...getBoxDelivered?.filter((v: any) => v.code_driver_commission == "" || v.code_driver_commission == null)])
        } else {
            setPaidDeliveredShipments(() =>[])
            setUnpaidDeliveredShipments(() =>[])
        }
    }, [getBoxDelivered]);

    useEffect(() => {
        if (getBoxDelivered && getBoxDelivered?.length > 0) {
            setPaidPickedUpShipments(() => [...getBoxPickedUp?.filter((v: any) => v.cd_commission_pickup != "" && v.cd_commission_pickup != null)])
            setUnpaidPickedUpShipments(() => [...getBoxPickedUp?.filter((v: any) => v.cd_commission_pickup == "" || v.cd_commission_pickup == null)])
        } else {
            setPaidPickedUpShipments(() =>[])
            setUnpaidPickedUpShipments(() =>[])
        }
    }, [getBoxPickedUp]);

    useEffect(() => {
        setGroupedPaidDelivered(() => groupByKey(paidDeliveredShipments, "code_driver_commission"))
    }, [paidDeliveredShipments]);

    useEffect(() => {
        if (tabValue == 2) {
            setRenderedShipmentsData(() => [...unpaidDeliveredShipments]);
        }
    }, [unpaidDeliveredShipments]);

    useEffect(() => {
        setGroupedPaidPickedUp(() => groupByKey(paidPickedUpShipments, "cd_commission_pickup"))
    }, [paidPickedUpShipments]);

    useEffect(() => {
        if (tabValue == 3) {
            setRenderedShipmentsData(() => [...unpaidPickedUpShipments]);
        }
    }, [unpaidPickedUpShipments]);

    useEffect(() => {
        setDriverData(oneDriverData?.factor)
        useStore.setState({ factorSalary: oneDriverData?.factor?.salary });
    }, [oneDriverData])

    useEffect(() => {
        setLoadingPage(getShipmentsLoading)
    }, [getShipmentsLoading]);

    useEffect(() => {
        setOneShipmentData(dataOneShipment?.box)
    }, [dataOneShipment]);

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

    const onCollectedBoxs = () => {
        setOpenTraceModal(true);
    }

    const onAccountingDriver = () => {
        setOpenAccountingModal(true);
    }

    if (loadingPage) {
        setLoadingPageDebounced(getShipmentsLoading)
    }

    return (
        <>
            <Head><title>السائق | قافلي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 24px", xl: "0 48px" }, height: "100%" }} >
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={"100%"}>
                        <Grid item xs={12} height={"170px"} style={{background: "#fff", paddingRight: "40px", width: "calc(100% - 73px)", position: "fixed", zIndex: "100", top: "64px", right: "72px"}} >
                            <Grid container flexDirection={"row"} justifyContent="flex-start"  >
                                <Grid item xs={12} sm="auto" style={{width: "100%"}}>
                                    <Grid item xs={12} height={"100px"}>
                                        <Grid item>
                                            <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                                {driverData ? (<>
                                                        <RAvatar size="60px" name={`${driverData?.person?.first_name || ""} ${driverData?.person?.last_name || ""}`} style={{ fontFamily: "Montserrat-Arabic"}} round={"5px"} maxInitials={1}></RAvatar>
                                                        <Stack rowGap={"5px"}>
                                                            <Typography variant="sm" color={grey[700]}>{`${driverData?.person?.first_name || ""} ${driverData?.person?.last_name || ""}`}</Typography>
                                                            <Typography variant="2xs" color={grey[400]}>{`${driverData?.person?.city || ""} ${driverData?.person?.address || ""}`}</Typography>
                                                            <Typography variant="2xs" color={grey[400]}>
                                                                {`${driverData?.person?.email || ""}, ${driverData?.person?.phone01 || ""}`}
                                                                {driverData?.user != null && (<>
                                                                    <Chip size={"small"} variant="filled" label={<>{driverData?.user?.user_name || ""} <User size={14}/></>} color="info" rounded={"false"} style={{margin: "0 5px"}}/>
                                                                    <Chip size={"small"} variant="filled" label={driverData?.user?.activation || ""} color="success" rounded={"false"} dir="rtl" />
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

                                    {/* @ts-ignore */}
                                    <Tabs value={tabValue} onChange={tabsHandler} variant="scrollable" scrollButtons="auto"  >
                                        <Tab label="طرود" onClick={() => setRenderedShipmentsData(filteredShipments)} new={false} />
                                        <Tab label="طرود فشل توصيلها" onClick={() => setRenderedShipmentsData(failedShipments)} />
                                        <Tab label="طرود نجح توصيلها" onClick={() => setRenderedShipmentsData(unpaidDeliveredShipments)} new={true} />
                                        <Tab label="طرود تم التقاطها" onClick={() => setRenderedShipmentsData(unpaidPickedUpShipments)} new={true} />
                                        <Tab label="مبالغ عند السائق" onClick={() => setRenderedShipmentsData(deliveredShipments)} new={false} />
                                        <Tab label="مدفوعة الواصل" onClick={() => setRenderedShipmentsData([])} new={true} />
                                        <Tab label="مدفوعة الالتقاط" onClick={() => setRenderedShipmentsData([])} new={true} />

                                    </Tabs>
                                </Grid>
                            </Grid>
                        </Grid>

                        {loadingPage && !shipmentDataEnqueued && (
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
                            {tabValue == 0 && filteredShipments.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>عدد الطرود <ChipM label={filteredShipments.length} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Link href={{pathname: '/driver/outSheet', query: {id: query?.id as any} }} passHref>
                                            <a target="_blank">
                                                <Button variant="contained" size={"small"} >طباعة ورقة الخروج</Button>
                                            </a>
                                        </Link>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue == 1 && failedShipments.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>عدد الطرود <ChipM label={failedShipments.length} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={onCollectedBoxs} >استلام الطرود</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue == 2 && unpaidDeliveredShipments.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>عدد الطرود <ChipM label={unpaidDeliveredShipments.length} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={() => setOpenDriverCommissionModal(true)} >دفع للسائق</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue == 3 && unpaidPickedUpShipments.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>عدد الطرود <ChipM label={unpaidPickedUpShipments.length} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={() => setOpenDriverCommissionPickUpModal(true)} >دفع للسائق</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue == 4 && deliveredShipments.length > 0 && (
                                <Grid container xs={12} sm="auto" marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                                    <Stack direction="row" spacing={"15px"}>
                                        <Typography variant="2xs" color={grey[700]}>عدد الطرود<ChipM label={deliveredShipments.length} size="small" variant={'filled'}/></Typography>
                                    </Stack>

                                    <Grid sm="auto">
                                        <Button variant="contained" size={"small"} onClick={onAccountingDriver} >استلام الأموال</Button>
                                    </Grid>
                                </Grid>)
                            }

                            {tabValue < 7 && (<InfiniteScroll
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
                                    {tabValue < 5 && (
                                        shipmentDataEnqueued.length != 0 ? (
                                            shipmentDataEnqueued?.map((shipment: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
                                                            setOneShipmentInfo={setOneShipmentInfo}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد بيانات"></EmptyStat>
                                            </Grid>
                                        )
                                    )}
                                    {tabValue == 5 && (
                                        groupedPaidDelivered != undefined && Object.keys(groupedPaidDelivered).length > 0 ? (
                                            Object.keys(groupedPaidDelivered).map((key: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        <MoneyDriverCard
                                                            code_invoice={key}
                                                            salary={parseFloat(oneDriverData?.factor?.salary || "0")}
                                                            dataInvoice={
                                                                // @ts-ignore
                                                                groupedPaidDelivered[key]
                                                            }
                                                            idDriver={query?.id?.toString()}
                                                        />
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد بيانات"></EmptyStat>
                                            </Grid>
                                        )
                                    )}

                                    {tabValue == 6 && (
                                        groupedPaidPickedUp != undefined && Object.keys(groupedPaidPickedUp).length > 0 ? (
                                            Object.keys(groupedPaidPickedUp).map((key: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        <MoneyDriverPickUpCard
                                                            code_invoice={key}
                                                            dataInvoice={
                                                                // @ts-ignore
                                                                groupedPaidPickedUp[key]
                                                            }
                                                            idDriver={query?.id?.toString()}
                                                        />
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
                   onClose={() => setOpenShowDetailDrawer(false)}
                   onCloseInside={() => setOpenShowDetailDrawer(false)}
                   detailsData={oneShipmentdata}
                />
            )}
            <FailedModal title={"استلام الطرود من عند السائق"} idDriver={query?.id?.toString() || ""}  open={openTraceModal} onClose={() => setOpenTraceModal(false)} failedBox={failedShipments} />
            <AccountingModal title={"استلام الاموال من عند السائق"} idDriver={query?.id?.toString() || ""} open={openAccountingModal} onClose={() => setOpenAccountingModal(false)} delivered={deliveredShipments} />
            <DriverCommissionModal title={"دفع عمولة السائق"}  idDriver={query?.id?.toString() || ""} salary={oneDriverData?.factor?.salary} open={openDriverCommissionModal} onClose={() => setOpenDriverCommissionModal(false)} delivered={unpaidDeliveredShipments} />
            <DriverCommissionPickUpModal title={"دفع عمولة السائق"}  idDriver={query?.id?.toString() || ""} salary={oneDriverData?.factor?.salary} open={openDriverCommissionPickUpModal} onClose={() => setOpenDriverCommissionPickUpModal(false)} delivered={unpaidPickedUpShipments} />
        </>
    );
}

export default Driver;
