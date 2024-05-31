import { Box, Container, Grid } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import Button from "../components/Button";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import { useGetAllInvoice } from "../graphql/hooks/invoices";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import { ContentRefContext } from "../components/generated/Content";
import PointCard from "../components/generated/PointCard";
import AddInvoiceModal from "../components/Modal/AddInvoiceModal";
import UpdateInvoiceModal from "../components/Modal/UpdateInvoiceModal";

interface Props {}

export default function Home({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openAddInvoiceModal, setOpenAddInvoiceModal] = React.useState(false);
    const [openUpdateInvoiceModal, setOpenUpdateInvoiceModal] = React.useState(false);
    const [oneInvoiceInfo, setOneInvoiceInfo] = React.useState<any>({});
    const [tab2value, setTab2value] = React.useState(0);
    const [allInvoiceData, setAllInvoiceData] = React.useState<object[]>([]);
    const [renderedInvoiceData, setRenderedInvoiceData] = React.useState<object[]>([]);

    // context
    const contentRef = useContext(ContentRefContext);

    // handlers
    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    // get all shipments
    let getInvoiceData  = useGetAllInvoice({
        company_id: userData?.person?.company?.id || "",
    });

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], allInvoiceData);
    filteredData = searchHelper(searchValue, filteredData);

    let allInvoices = filteredData;
    let activeInvoice = filteredData.filter((v: any) => v.status == "active");
    let desactiveInvoice = filteredData.filter((v: any) => v.status == "desactive");
    let waitingInvoice = filteredData.filter((v: any) => v.status == "waiting");

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(10);
    const [invoicesDataEnqueued, setInvoicesDataEnqueued] = useState<object[]>([]);
    const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

    useEffect(() => {
        setInvoicesDataEnqueued(() => [...renderedInvoiceData.slice(0, loadingDataSize)]);
        if (renderedInvoiceData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedInvoiceData, searchValue]);

    const moreDataHendler = () => {
        let currentChunk = renderedInvoiceData.slice(0, invoicesDataEnqueued.length + loadingDataSize);
        setTimeout(() => {
            setInvoicesDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedInvoiceData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // watchers
    useEffect(() => {
        //console.log("getInvoiceData ", getInvoiceData )
        setAllInvoiceData(() => [...getInvoiceData ]);
    }, [getInvoiceData ]);

    useEffect(() => {
        setRenderedInvoiceData(() => [...allInvoices]);
    }, [allInvoiceData, searchValue]);

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
        useStore.setState({ subPageTab: null });
    }, []);

    if (getInvoiceData  == undefined) return <></>;

    return (
        <>
            <Head><title>النقاط | قافلتي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%" }}>
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={renderedInvoiceData.length == 0 ? "100%" : ""}>
                        {/* header content window */}
                        <Grid item xs={12}>
                            <Grid container flexDirection={"row-reverse"} justifyContent="space-between" rowSpacing={3}>
                                <Grid item xs={12} sm="auto">
                                    <Button variant="contained" onClick={() => setOpenAddInvoiceModal(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        شراء نقاط
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm="auto">
                                    {/* @ts-ignore */}
                                    <Tabs2 value={tab2value} onChange={tabs2handler}>
                                        <Tab2 label="الكل" count={allInvoices.length} onClick={() => setRenderedInvoiceData(allInvoices)}/>
                                        <Tab2 label="تم التحقق" count={activeInvoice.length} onClick={() => setRenderedInvoiceData(activeInvoice)}/>
                                        <Tab2 label="قيد الانتظار" count={waitingInvoice.length} onClick={() => setRenderedInvoiceData(waitingInvoice)}/>
                                        <Tab2 label="مرفوض" count={desactiveInvoice.length} onClick={() => setRenderedInvoiceData(desactiveInvoice)}/>
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
                                    invoicesDataEnqueued.length && (
                                        <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0",}}>
                                            <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                                        </Box>
                                    )
                                }
                            >
                                <Grid container spacing={3}>
                                    {invoicesDataEnqueued.length > 0 ? (
                                        invoicesDataEnqueued?.map((invoice: any, index: any) => {
                                            return (
                                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                    <PointCard
                                                        id={invoice.id}
                                                        code_invoice={invoice.code_invoice}
                                                        points={invoice.points}
                                                        status={invoice.status}
                                                        oneInvoiceInfo={invoice}
                                                        setOneInvoiceInfo={setOneInvoiceInfo}
                                                        setOpenUpdateInvoiceModal={setOpenUpdateInvoiceModal}
                                                    />
                                                </Grid>
                                            );
                                        })
                                    ) : (
                                        <Grid item xs={12}>
                                            <EmptyStat title="لايوجد نقاط متاحة"></EmptyStat>
                                        </Grid>
                                    )}
                                </Grid>
                            </InfiniteScroll>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Add Stock */}
            <AddInvoiceModal open={openAddInvoiceModal} onClose={() => setOpenAddInvoiceModal(false)} />

             {/*Update Invoice */}
            <UpdateInvoiceModal
                oneInvoiceInfo={oneInvoiceInfo}
                open={openUpdateInvoiceModal}
                onClose={() => setOpenUpdateInvoiceModal(false)}
            />
        </>
    );
}
