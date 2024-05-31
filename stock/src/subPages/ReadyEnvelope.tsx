import {Box, Container, Grid, Skeleton} from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import { ContentRefContext } from "../components/generated/Content";
import EnvelopeCard from "../components/generated/EnvelopeCard";
import {useGetReadyEnvelopeCity} from "../graphql/hooks/envelopes";
import Head from "next/head";
import {useDebouncedCallback} from "use-debounce";

interface Props {
    setHasData?: (data: number) => any;
}

export default function ReadyEnvelopes({setHasData}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [envelopeCityData, setAllEnvelopeCityData] = React.useState<object[]>([]);
    const [renderedShipmentsData, setRenderedShipmentsData] = React.useState<object[]>([]);

    // context
    const contentRef = useContext(ContentRefContext);

    // get all shipments
    let [getEnvelopeCityData, getEnvelopeCityLoading] = useGetReadyEnvelopeCity({
        idStock: userData?.person?.list_stock_accesses?.stock?.id || ""
    });

    const [loadingPage, setLoadingPage] = React.useState<boolean>(getEnvelopeCityLoading);

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], envelopeCityData);
    filteredData = searchHelper(searchValue, filteredData);

    let allEnvelopes = envelopeCityData

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(40);
    const [envelopeDataEnqueued, setEnvelopeDataEnqueued] = useState<object[]>([]);

    useEffect(() => {
        setEnvelopeDataEnqueued(() => [...renderedShipmentsData.slice(0, loadingDataSize)]);
        if (renderedShipmentsData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedShipmentsData, searchValue]);

    const moreDataHendler = () => {
        let currentChunk = renderedShipmentsData.slice(0, envelopeDataEnqueued.length + loadingDataSize);
        setTimeout(() => {
            setEnvelopeDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedShipmentsData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // watchers
    useEffect(() => {
        setAllEnvelopeCityData(() => [...getEnvelopeCityData]);
    }, [getEnvelopeCityData]);

    useEffect(() => {
        setRenderedShipmentsData(() => [...allEnvelopes]);
    }, [envelopeCityData, searchValue]);

    if (loadingPage) {
        setLoadingPageDebounced(getEnvelopeCityLoading);
        return (
            <>
                <Head><title>الصفحة الرئيسية | قافلتي</title></Head>
                <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%"}}>
                    <Grid container spacing={3}>
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
        <Box sx={{width: "100%", direction: "ltr", overflow: "hidden"}}>
            <InfiniteScroll
                pageStart={0}
                loadMore={moreDataHendler}
                hasMore={hasMore}
                useWindow={false}
                initialLoad={false}
                getScrollParent={() => contentRef?.current}
                // @ts-ignore
                loader={
                    envelopeDataEnqueued.length && (
                        <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0"}}>
                            <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                        </Box>
                    )
                }
            >
                <Grid container spacing={3}>
                    {typeof setHasData == "function" && setHasData(envelopeCityData.length)}
                    {envelopeCityData != undefined && envelopeCityData.length > 0 ? (
                        envelopeCityData?.map((envelope: any, index: any) => {
                            return (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                    <EnvelopeCard
                                        city={envelope.city}
                                        codeEnvelope={envelope.codeEnvelope}
                                        numberBox={envelope.numberBox}
                                        totalMouny={envelope.totalMouny}
                                        code_invoice={envelope.city}
                                        showClosse={false}
                                    />
                                </Grid>
                            );
                        })
                    ) : (
                        <Grid item xs={12} marginTop={"100px"}>
                            <EmptyStat title="لايوجد بيانات"></EmptyStat>
                        </Grid>
                    )
                    }
                </Grid>
            </InfiniteScroll>
        </Box>
    );
}