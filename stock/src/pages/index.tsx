import {Box, Container, Grid, Skeleton, Stack} from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import { Plus, Slash, XOctagon, Repeat, CornerUpLeft, Check } from "react-feather";
import DeliveryCard from "../components/generated/DeliveryCard";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import AddShipmentModal from "../components/Modal/AddShipmentModal";
import { useGetAllShipments, useGetOneShipments } from "../graphql/hooks/shipments";
import DetailsDrawer from "../components/Drawer/DetailsDrawer";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import RequestModal from "../components/Modal/RequestModal";
import RequestWithRadioModal from "../components/Modal/RequestWithRadioModal";
import algerian_provinces from "../utilities/data/api/algeria_provinces.json";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import { ContentRefContext } from "../components/generated/Content";
import UpdateShipmentModal from "../components/Modal/UpdateShipmentModal";
import OptionsModel from "../components/Modal/OptionsModel";

import { useDebouncedCallback } from "use-debounce";
import { matchSorter } from 'match-sorter';
import { usePopupState } from "material-ui-popup-state/hooks";

interface Props {}

export default function Home({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openShowDetailDrawer, setOpenShowDetailDrawer] = React.useState(false);
    const [openAddOrderModal, setOpenAddOrderModal] = React.useState(false);
    const [openUpdateOrderModal, setOpenUpdateOrderModal] = React.useState(false);
    const [openRequestModal, setOpenRequestModal] = React.useState(false);
    const [openRequestWithRadioModal, setOpenRequestWithRadioModal] = React.useState(false);
    const [oneShipmentInfo, setOneShipmentInfo] = React.useState<any>({});
    const [requestStatus, setRequestStatus] = React.useState<number | undefined>(undefined);
    const [tab2value, setTab2value] = React.useState(0);
    const [allShipmentsData, setAllShipmentsData] = React.useState<object[]>([]);
    const [renderedShipmentsData, setRenderedShipmentsData] = React.useState<object[]>([]);
    const [multiSelectionSelectedShipments, setMultiSelectionSelectedShipments] = React.useState<any>([]);

    // context
    const contentRef = useContext(ContentRefContext);

    // handlers
    const handleCloseShowDetailDrawer = () => setOpenShowDetailDrawer(false);
    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    // get all shipments
    let [getShipmentsData, getShipmentsLoading] = useGetAllShipments({
        stock_id: userData?.person?.list_stock_accesses?.stock?.id
    });

    const [loadingPage, setLoadingPage] = React.useState<boolean>(getShipmentsLoading);

    // get one shipments (drawer use)
    let [GetOneShipment, { data: oneShipmentdata }] = useGetOneShipments();
    oneShipmentdata = oneShipmentdata?.box;

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], allShipmentsData);
    filteredData = matchSorter(filteredData, searchValue, {keys: ["code_box", "client.person.phone01"]});

    let allShipments = filteredData;
    let classicShipments = filteredData.filter((v: any) => v.price_box == 0);
    let commercialShipments = filteredData.filter((v: any) => v.price_box > 0);
    let exaggerated = filteredData.filter((v: any) => v.lastTrace[0]?.status >= 10 && v.lastTrace[0]?.status <= 13);

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(40);
    const [shipmentDataEnqueued, setShipmentDataEnqueued] = useState<object[]>([]);
    const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

    useEffect(() => {
        setShipmentDataEnqueued(() => [...renderedShipmentsData.slice(0, loadingDataSize)]);
        if (renderedShipmentsData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedShipmentsData, searchValue]);

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

    // watchers
    useEffect(() => {
        //console.log("getShipmentsData", getShipmentsData)
        if (getShipmentsData != undefined) {
            setAllShipmentsData(() => [...getShipmentsData]);
        }
    }, [getShipmentsData]);

    useEffect(() => {
        setRenderedShipmentsData(() => [...allShipments]);
    }, [allShipmentsData, searchValue]);

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    if (loadingPage) {
        setLoadingPageDebounced(getShipmentsLoading);
        return (
            <>
                <Head><title>الصفحة الرئيسية | قافلتي</title></Head>
                <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%"}}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Grid container>
                                <Grid item xs={10}>
                                    <Stack direction={"row"} spacing={1}>
                                        <Skeleton variant="circular" sx={{width: "76px", height: "36px", borderRadius: "16px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                        <Skeleton variant="circular" sx={{width: "94px", height: "36px", borderRadius: "16px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                        <Skeleton variant="circular" sx={{width: "94px", height: "36px", borderRadius: "16px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                        <Skeleton variant="circular" sx={{width: "94px", height: "36px", borderRadius: "16px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                    </Stack>
                                </Grid>
                                <Grid item xs={2} justifyContent="end">
                                    <Skeleton variant="rectangular" sx={{width: "120px", height: "38px", borderRadius: "4px", marginLeft: "auto", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={3}>
                                {Array(8)
                                    .fill(null)
                                    .map((_, i: number) => (
                                        <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                                            <Skeleton variant="rectangular" sx={{width: "100%", height: "152px", borderRadius: "4px", bgcolor: "rgba(0, 0, 0, 0.05)"}}/>
                                        </Grid>
                                    ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </>
        );
    }

    return (
        <>
            <Head><title>طرود | قافلي</title></Head>

            <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%"}}>
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={renderedShipmentsData.length == 0 ? "100%" : ""}>
                        {/* header content window */}
                        <Grid item xs={12}>
                            <Grid container flexDirection={"row-reverse"} justifyContent="space-between" rowSpacing={3}>
                                <Grid item xs={12} sm="auto">
                                    <Button startIcon={<Plus/>} variant="contained" onClick={() => setOpenAddOrderModal(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        إضافة طرد
                                    </Button>
                                </Grid>

                                {multiSelectionSelectedShipments.length > 0 && (
                                    <OptionsModel
                                        multiSelectionSelectedShipments={multiSelectionSelectedShipments}
                                        setMultiSelectionSelectedShipments={setMultiSelectionSelectedShipments}
                                    />
                                )}

                                <Grid item xs={12} sm="auto">
                                    {/* @ts-ignore */}
                                    <Tabs2 value={tab2value} onChange={tabs2handler}>
                                        <Tab2 label="الكل" count={allShipments.length} onClick={() => setRenderedShipmentsData(allShipments)}/>
                                        <Tab2 label="كلاسيكية" count={classicShipments.length} onClick={() => setRenderedShipmentsData(classicShipments)}/>
                                        <Tab2 label="تجارية" count={commercialShipments.length} onClick={() => setRenderedShipmentsData(commercialShipments)}/>
                                        <Tab2 label="مبالغ" count={exaggerated.length} onClick={() => setRenderedShipmentsData(exaggerated)}/>
                                    </Tabs2>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* content window */}
                        <Grid item xs={12} paddingBottom="32px">
                            <InfiniteScroll
                                pageStart={0}
                                loadMore={moreDataHendler}
                                hasMore={hasMore}
                                useWindow={false}
                                initialLoad={false}
                                // getScrollParent={() => contentRef?.current}
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
                                    {shipmentDataEnqueued.length != 0 ? (
                                        shipmentDataEnqueued?.map((shipment: any, index: any) => {
                                            return (
                                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                    <DeliveryCard
                                                        shipment_id={shipment.id}
                                                        name={`${shipment.client.person.first_name} ${shipment.client.person.last_name}`}
                                                        city={algerian_provinces?.[shipment.recipient_city - 1]?.wilaya_name}
                                                        shipment_code={shipment.code_box}
                                                        status={shipment?.lastTrace[0]?.status}
                                                        shipmentRestInfo={shipment}
                                                        isCommercial={shipment?.price_box > 0}
                                                        setOpenShowDetailDrawer={setOpenShowDetailDrawer}
                                                        onshowDetailsClick={() => GetOneShipment({ variables: {boxId: shipment.id} })}
                                                        setRequestStatus={setRequestStatus}
                                                        onRequestClick={setOpenRequestModal}
                                                        setOneShipmentInfo={setOneShipmentInfo}
                                                        setOpenUpdateOrderModal={setOpenUpdateOrderModal}
                                                        onRequestWithRadioClick={setOpenRequestWithRadioModal}
                                                        isSelecting={multiSelectionSelectedShipments.length > 0}
                                                        isSelected={
                                                            multiSelectionSelectedShipments.findIndex(
                                                                (v: any) => v.id == shipment.id
                                                            ) > -1
                                                        }
                                                        setMultiSelectionSelectedShipments={setMultiSelectionSelectedShipments}
                                                    ></DeliveryCard>
                                                </Grid>
                                            );
                                        })
                                    ) : (
                                        <Grid item xs={12}>
                                            <EmptyStat title="لايوجد طرود متاحة"></EmptyStat>
                                        </Grid>
                                    )}
                                </Grid>
                            </InfiniteScroll>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Add Shipment */}
            <AddShipmentModal open={openAddOrderModal} onClose={() => setOpenAddOrderModal(false)}></AddShipmentModal>

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
                />
            )}

            {oneShipmentdata && (
                <UpdateShipmentModal
                    open={openUpdateOrderModal}
                    onClose={() => setOpenUpdateOrderModal(false)}
                    box={oneShipmentdata}
                />
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
        </>
    );
}