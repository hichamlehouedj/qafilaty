import { Box, Container, Grid } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import { Plus } from "react-feather";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import { useGetAllStocks } from "../graphql/hooks/stocks";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import algerian_provinces from "../utilities/data/api/algeria_provinces.json";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import { ContentRefContext } from "../components/generated/Content";
import StockCard from "../components/generated/StockCard";
import AddStockModal from "../components/Modal/AddStockModal";
import UpdateStockModal from "../components/Modal/UpdateStockModal";

interface Props {}


const data = [
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
  {id: "1", name: "مكتب تيارت", city: "39", address: "وسط المدينة", activation: "active", phone01: "0123456789", phone02: "0123456789", createdAt: "20/11/2022 22:20", numberArchivedBoxes: 20, numberNotArchivedBoxes: 1},
]

export default function Home({}: Props): ReactElement {
  const searchValue = useStore((state: any) => state.searchValue);
  const userData = useStore((state: any) => state.userData);
  const [openAddStockModal, setOpenAddStockModal] = React.useState(false);
  const [openUpdateStockModal, setOpenUpdateStockModal] = React.useState(false);
  const [oneStockInfo, setOneStockInfo] = React.useState<any>({});
  const [tab2value, setTab2value] = React.useState(0);
  const [allStocksData, setAllStocksData] = React.useState<object[]>([]);
  const [renderedStocksData, setRenderedStocksData] = React.useState<object[]>([]);

  // context
  const contentRef = useContext(ContentRefContext);

  // handlers
  const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
    setTab2value(newValue as any);
  };

  // get all shipments
  let getStocksData = data
  // filtering
  let filteredData: object[] = [];
  filteredData = sortByRecentTime(["createdAt"], allStocksData);
  filteredData = searchHelper(searchValue, filteredData);

  let allShipments = filteredData;
  let activeStock = filteredData.filter((v: any) => v.activation == "active");
  let desactiveStock = filteredData.filter((v: any) => v.activation == "desactive");

  // infinite scrolling
  const [hasMore, setHasMore] = useState(true);
  const [loadingDataSize, setLoadingDataSize] = useState(10);
  const [stocksDataEnqueued, setStocksDataEnqueued] = useState<object[]>([]);
  const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

  useEffect(() => {
    setStocksDataEnqueued(() => [...renderedStocksData.slice(0, loadingDataSize)]);
    if (renderedStocksData.length < loadingDataSize) setHasMore(false);
    else setHasMore(true);
  }, [renderedStocksData, searchValue]);

  const moreDataHendler = () => {
    let currentChunk = renderedStocksData.slice(0, stocksDataEnqueued.length + loadingDataSize);
    setTimeout(() => {
      setStocksDataEnqueued([...currentChunk]);
      if (currentChunk.length && renderedStocksData.length <= currentChunk.length) {
        setHasMore(false);
        return;
      }
    }, 800);
  };

  // watchers
  useEffect(() => {
    //console.log("getStocksData", getStocksData)
    setAllStocksData(() => [...getStocksData]);
  }, [getStocksData]);

  useEffect(() => {
    setRenderedStocksData(() => [...allShipments]);
  }, [allStocksData, searchValue]);

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: false });
    useStore.setState({ subPageTab: null });
  }, []);

  if (getStocksData == undefined) return <></>;

  return (
    <>
      <Head><title>المكاتب | قافلتي</title></Head>

      <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%" }}>
        <Box className="q-container" height={"100%"}>
          <Grid container spacing={2} height={renderedStocksData.length == 0 ? "100%" : ""}>
            {/* header content window */}
            <Grid item xs={12}>
              <Grid container flexDirection={"row-reverse"} justifyContent="space-between" rowSpacing={3}>
                <Grid item xs={12} sm="auto">
                  <Button startIcon={<Plus />} variant="contained" onClick={() => setOpenAddStockModal(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
                    إضافة مكتب
                  </Button>
                </Grid>
                <Grid item xs={12} sm="auto">
                  {/* @ts-ignore */}
                  <Tabs2 value={tab2value} onChange={tabs2handler}>
                    <Tab2 label="الكل" count={allShipments.length} onClick={() => setRenderedStocksData(allShipments)}/>
                    <Tab2 label="نشط" count={activeStock.length} onClick={() => setRenderedStocksData(activeStock)}/>
                    <Tab2 label="غير نشط" count={desactiveStock.length} onClick={() => setRenderedStocksData(desactiveStock)}/>
                  </Tabs2>
                </Grid>
              </Grid>
            </Grid>

            {/* content window */}
            <Grid item xs={12} paddingBottom="32px" style={{overflow: "auto"}}>
              <InfiniteScroll
                pageStart={0}
                loadMore={moreDataHendler}
                hasMore={hasMore}
                useWindow={false}
                initialLoad={false}
                getScrollParent={() => contentRef?.current}
                // @ts-ignore
                loader={
                  stocksDataEnqueued.length && (
                    <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0",}}>
                      <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                    </Box>
                  )
                }
              >
                <Grid container spacing={3}>
                  {stocksDataEnqueued.length > 0 ? (
                    stocksDataEnqueued?.map((stock: any, index: any) => {
                      return (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                          <StockCard
                              id={stock.id}
                              name={stock.name}
                              city={algerian_provinces?.[stock.city - 1]?.wilaya_name}
                              address={stock.address}
                              createdAt={stock.createdAt}
                              phone01={stock.phone01}
                              phone02={stock.phone02}
                              activation={stock.activation}
                              numberArchivedBoxes={stock.numberArchivedBoxes}
                              numberNotArchivedBoxes={stock.numberNotArchivedBoxes}
                              oneStockInfo={stock}
                              setOneStockInfo={setOneStockInfo}
                              setOpenUpdateStockModal={setOpenUpdateStockModal}
                          />
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

      {/* Add Stock */}
      <AddStockModal open={openAddStockModal} onClose={() => setOpenAddStockModal(false)} />

      {/* Update Stock */}
      <UpdateStockModal
        oneStockInfo={oneStockInfo}
        open={openUpdateStockModal}
        onClose={() => setOpenUpdateStockModal(false)}
      />
    </>
  );
}
