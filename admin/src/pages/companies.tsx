import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";
import Head from "next/head";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { CornerUpLeft, Play, Plus, Repeat, Slash, XOctagon } from "react-feather";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import { useDebouncedCallback } from "use-debounce";
import Button from "../components/Button";
import DetailsDrawer from "../components/Drawer/DetailsDrawer";
import CompanyCard from "../components/generated/CompanyCard";
import { ContentRefContext } from "../components/generated/Content";
import DeliveryCard from "../components/generated/DeliveryCard";
import EmptyStat from "../components/generated/EmptyStat";
// import AddShipmentModal from "../components/Modal/AddShipmentModal";
import RequestModal from "../components/Modal/RequestModal";
import Tab2 from "../components/Tabs/Tab2";
import Tabs2 from "../components/Tabs/Tabs2";
import { useGetOneShipments } from "../graphql/hooks/shipments";
import useGetAllClientShipments from "../graphql/hooks/shipments/useGetAllClientShipments";
import useStore from "../store/useStore";
import theme from "../styles/theme";
import algerian_provinces from "../utilities/data/api/algeria_provinces.json";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";

interface Props {}

export default function Home({}: Props): ReactElement {
  const searchValue = useStore((state: any) => state.searchValue);
  const userData = useStore((state: any) => state.userData);
  const [openShowDetailDrawer, setOpenShowDetailDrawer] = React.useState(false);
  const [openAddOrderModal, setOpenAddOrderModal] = React.useState(false);
  const [openRequestModal, setOpenRequestModal] = React.useState(false);
  const [oneShipmentInfo, setOneShipmentInfo] = React.useState<any>({});
  const [requestStatus, setRequestStatus] = React.useState<number | undefined>(undefined);
  const [tab2value, setTab2value] = React.useState(0);
  const [allShipmentsData, setAllShipmentsData] = React.useState<object[]>([]);
  const [renderedShipmentsData, setRenderedShipmentsData] = React.useState<object[]>([]);

  // context
  const contentRef = useContext(ContentRefContext);

  // handlers
  const handleCloseShowDetailDrawer = () => setOpenShowDetailDrawer(false);
  const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
    setTab2value(newValue as any);
  };

  // get all shipments
  let [getShipmentsData, getShipmentsLoading] = useGetAllClientShipments({
    // stock_id: userData?.stock_accesses?.[0]?.id_stock,
    client_id: userData?.id,
  });

  getShipmentsData = [];

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
  filteredData = searchHelper(searchValue?.toLowerCase(), filteredData);

  let allShipments = filteredData;
  let activeShipments = filteredData.filter((v: any) => v.archived == 0);
  let archivedShipments = filteredData.filter((v: any) => v.archived == 1);

  // infinite scrolling
  const [hasMore, setHasMore] = useState(true);
  const [loadingDataSize, setLoadingDataSize] = useState(40);
  const [shipmentDataEnqueued, setShipmentDataEnqueued] = useState<object[]>([]);
  const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

  useEffect(() => {
    setShipmentDataEnqueued(() => [...renderedShipmentsData.slice(0, loadingDataSize), {}]);

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
  // useEffect(() => {
  //   setAllShipmentsData(() => [...getShipmentsData]);
  // }, [getShipmentsData]);

  // useEffect(() => {
  //   setRenderedShipmentsData(() => [...allShipments]);
  // }, [allShipmentsData, searchValue]);

  // useEffect(() => {
  //   useStore.setState({ isLayoutDisabled: false });
  // }, []);

  if (loadingPage) {
    setLoadingPageDebounced(getShipmentsLoading);
    return (
      <>
        <Head>
          <title>الشركات | قافلتي</title>
        </Head>
        <Container
          maxWidth="xl"
          sx={{
            padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
            height: "100%",
          }}
        >
          <Grid
            container
            spacing={3}
            // height={"100%"}
            // xs={11}
            // height="100%"
          >
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={10}>
                  <Stack direction={"row"} spacing={1}>
                    <Skeleton
                      variant="circular"
                      sx={{
                        width: "76px",
                        height: "36px",
                        borderRadius: "16px",
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                      }}
                    ></Skeleton>
                    <Skeleton
                      variant="circular"
                      sx={{
                        width: "94px",
                        height: "36px",
                        borderRadius: "16px",
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                      }}
                    ></Skeleton>
                    <Skeleton
                      variant="circular"
                      sx={{
                        width: "94px",
                        height: "36px",
                        borderRadius: "16px",
                        bgcolor: "rgba(0, 0, 0, 0.05)",
                      }}
                    ></Skeleton>
                  </Stack>
                </Grid>
                <Grid item xs={2} justifyContent="end">
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      width: "120px",
                      height: "38px",
                      borderRadius: "4px",
                      marginLeft: "auto",
                      bgcolor: "rgba(0, 0, 0, 0.05)",
                    }}
                  ></Skeleton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                {Array(8)
                  .fill(null)
                  .map((_, i: number) => (
                    <Grid key={i} item xs={12} sm={6} md={4} lg={3}>
                      <Skeleton
                        variant="rectangular"
                        sx={{
                          width: "100%",
                          height: "152px",
                          borderRadius: "4px",
                          bgcolor: "rgba(0, 0, 0, 0.05)",
                          // marginLeft: "auto",
                        }}
                      ></Skeleton>
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
      <Head>
        <title>الشركات | قافلتي</title>
      </Head>
      <Container
        maxWidth="xl"
        sx={{
          padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
          height: "100%",
        }}
      >
        <Box className="q-container" height={"100%"}>
          <Grid
            container
            spacing={2}
            // height={renderedShipmentsData.length == 0 ? "100%" : ""}
            // height="100%"
          >
            <Grid item xs={12}>
              <Grid container flexDirection={"row"} justifyContent="space-between" rowSpacing={3}>
                {/* <Grid item xs={12} sm="auto">
                  <Button
                    startIcon={<Plus></Plus>}
                    variant="contained"
                    onClick={() => setOpenAddOrderModal(true)}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                    // fullWidth
                  >
                    إضافة طرد
                  </Button>
                </Grid> */}
                <Grid item xs={12} sm="auto">
                  {/* @ts-ignore */}
                  <Tabs2 value={tab2value} onChange={tabs2handler}>
                    <Tab2
                      label="الكل"
                      count={allShipments.length}
                      onClick={() => setRenderedShipmentsData(allShipments)}
                    />
                    <Tab2
                      label="نشطة"
                      count={activeShipments.length}
                      onClick={() => setRenderedShipmentsData(activeShipments)}
                    />
                    <Tab2
                      label="مؤرشفة"
                      count={archivedShipments.length}
                      onClick={() => setRenderedShipmentsData(archivedShipments)}
                    />
                  </Tabs2>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} paddingBottom="32px">
              <InfiniteScroll
                pageStart={0}
                loadMore={moreDataHendler}
                hasMore={hasMore}
                useWindow={false}
                initialLoad={false}
                getScrollParent={() => contentRef?.current}
                // @ts-ignore
                loader={
                  shipmentDataEnqueued.length && (
                    <Box
                      className="loader"
                      key={0}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        padding: "20px 0",
                      }}
                    >
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
                          <CompanyCard
                            shipment_id={shipment?.id}
                            name={shipment?.recipient_name}
                            city={algerian_provinces?.[shipment?.recipient_city - 1]?.wilaya_name}
                            shipment_code={shipment?.code_box}
                            status={shipment?.lastTrace?.[0]?.status}
                            isCommercial={shipment?.price_box > 0}
                            shipmentRestInfo={shipment}
                            setOpenShowDetailDrawer={setOpenShowDetailDrawer}
                            onshowDetailsClick={() =>
                              GetOneShipment({
                                variables: {
                                  boxId: shipment?.id,
                                },
                              })
                            }
                            setRequestStatus={setRequestStatus}
                            onRequestClick={setOpenRequestModal}
                            setOneShipmentInfo={setOneShipmentInfo}
                          ></CompanyCard>
                        </Grid>
                      );
                    })
                  ) : (
                    <Grid item xs={12}>
                      <EmptyStat title="لايوجد شحن متاحة"></EmptyStat>
                    </Grid>
                  )}
                </Grid>
              </InfiniteScroll>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Show Details */}
      {/* @ts-ignore */}
      {oneShipmentdata && (
        <DetailsDrawer
          fullname={oneShipmentInfo?.recipient_name}
          city={algerian_provinces?.[oneShipmentInfo.recipient_city - 1]?.wilaya_name}
          open={openShowDetailDrawer}
          onClose={handleCloseShowDetailDrawer}
          anchor="right"
          onCloseInside={handleCloseShowDetailDrawer}
          width={"470px"}
          detailsData={oneShipmentdata}
        ></DetailsDrawer>
      )}
      {/* Show Details */}
      {/* @ts-ignore */}
      <RequestModal
        oneShipmentInfo={oneShipmentInfo}
        requestStatus={requestStatus}
        open={openRequestModal}
        width="640px"
        onClose={(resetModalFn: any) => {
          setOpenRequestModal(false);
          typeof resetModalFn == "function" && resetModalFn();
        }}
        title={
          (requestStatus == 26 && "طلب تأجيل") ||
          (requestStatus == 24 && "طلب إلغاء") ||
          (requestStatus == 19 && "طلب إستبدال") ||
          (requestStatus == 4 && "طلب إستئناف") ||
          (requestStatus == 14 && "طلب إرجاع")
        }
        iconTitle={
          (requestStatus == 26 && <Slash />) ||
          (requestStatus == 24 && <XOctagon />) ||
          (requestStatus == 19 && <Repeat />) ||
          (requestStatus == 4 && <Play />) ||
          (requestStatus == 14 && <CornerUpLeft />)
        }
      ></RequestModal>
    </>
  );
}
