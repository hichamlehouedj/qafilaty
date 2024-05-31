import {Alert, Box, Container, Grid, Skeleton, Stack, Typography} from "@mui/material";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import Button from "../components/Button";
import { Plus} from "react-feather";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import { useGetAllClients } from "../graphql/hooks/clients";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import ClientCard from "../components/generated/ClientCard";
import AddClientModal from "../components/Modal/AddClientModal";
import AddUserModal from "../components/Modal/AddUserModal";
import UpdateClientModal from "../components/Modal/UpdateClientModal";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import {ContentRefContext} from "../components/generated/Content";
import InfiniteScroll from "react-infinite-scroller";
import {useDebouncedCallback} from "use-debounce";
import {grey} from "@mui/material/colors";

interface Props {}

export function Clients({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openAddOrderModal, setOpenAddOrderModal] = React.useState(false);
    const [openAddUserModal, setOpenAddUserModal] = React.useState(false);
    const [openUpdateClientModal, setOpenUpdateClientModal] = React.useState(false);
    const [personID, setPersonID] = React.useState("");
    const [clientID, setClientID] = React.useState("");
    const [tab2value, setTab2value] = React.useState(0);
    const [allClientsData, setAllClientsData] = React.useState<object[]>([]);
    const [renderedClientsData, setRenderedClientsData] = React.useState<object[]>([]);
    const [alert, setAlert] = useState<boolean>(true);
    // context
    const contentRef = useContext(ContentRefContext);

    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    // get all shipments
    let [getClientsData, getClientsLoading] = useGetAllClients({
        stock_id: userData?.person?.list_stock_accesses?.stock?.id
    });

    const [loadingPage, setLoadingPage] = React.useState<boolean>(getClientsLoading);

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], allClientsData);
    filteredData = searchHelper(searchValue, filteredData);

    let allClients = filteredData;
    let clientsHasUser = filteredData.filter((v: any) => v.user !== null);
    let clientsDontHasUser = filteredData.filter((v: any) => v.user === null);

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(40);
    const [clientDataEnqueued, setClientDataEnqueued] = useState<object[]>([]);
    const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

    useEffect(() => {
        setClientDataEnqueued(() => [...renderedClientsData.slice(0, loadingDataSize)]);
        if (renderedClientsData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedClientsData, searchValue]);

    const moreDataHendler = () => {
        let currentChunk = renderedClientsData.slice(0, clientDataEnqueued.length + loadingDataSize);
        setTimeout(() => {
            setClientDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedClientsData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // watchers
    useEffect(() => {
        setAllClientsData(() => [...getClientsData]);
    }, [getClientsData]);

    useEffect(() => {
        setRenderedClientsData(() => [...allClients]);
    }, [allClientsData, searchValue]);

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    if (loadingPage) {
        setLoadingPageDebounced(getClientsLoading);
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
            <Head><title>العملاء | قافلي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%" }} >
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={renderedClientsData.length == 0 ? "100%" : ""} >
                        {
                            alert && (
                                <Grid item xs={12} sm={12} sx={{paddingTop: "0px !important"}} >
                                    <Alert variant="outlined" severity={"warning"} sx={{ padding: "4px 16px"}} onClose={() => setAlert(false)} >
                                        <Stack rowGap={"8px"}>
                                            <Typography variant="2xs" color={grey[700]}>- العميل بدون حساب لا يمكنه تسجيل الدخول الى لوحة تحكم العملاء.</Typography>
                                            <Typography variant="2xs" color={grey[700]}>- العميل بدون بريد الكتروني لا يستطيع ان يمتلك حساب.</Typography>
                                        </Stack>
                                    </Alert>
                                </Grid>
                            )
                        }

                        <Grid item xs={12}>
                            <Grid container flexDirection={"row-reverse"} justifyContent="space-between">
                                <Grid item xs={12} sm="auto">
                                    <Button startIcon={<Plus></Plus>} variant="contained" onClick={() => setOpenAddOrderModal(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>إضافة عميل</Button>
                                </Grid>
                                <Grid item xs={12} sm="auto">
                                    {/* @ts-ignore */}
                                    <Tabs2 value={tab2value} onChange={tabs2handler}>
                                        <Tab2 label="الكل" count={allClients.length} onClick={() => setRenderedClientsData(allClients)}/>
                                        <Tab2 label="عنده حساب" count={clientsHasUser.length} onClick={() => setRenderedClientsData(clientsHasUser)}/>
                                        <Tab2 label="بدون حساب" count={clientsDontHasUser.length} onClick={() => setRenderedClientsData(clientsDontHasUser)}/>
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
                                getScrollParent={() => contentRef?.current}
                                // @ts-ignore
                                loader={
                                    clientDataEnqueued.length && (
                                        <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0"}}>
                                            <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                                        </Box>
                                    )
                                }
                            >
                                <Grid item xs={12} paddingBottom="32px">
                                    <Grid container spacing={3}>
                                        {renderedClientsData.length != 0 ? (
                                            renderedClientsData?.map((client: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        <ClientCard
                                                            id={client.id}
                                                            id_person={client.person.id}
                                                            name={`${client.person.first_name} ${client.person.last_name}`}
                                                            email={client.person.email}
                                                            phone={client.person.phone01}
                                                            user={client.user !== null  ? true : false}
                                                            activation={client.user?.activation}
                                                            setPersonID={setPersonID}
                                                            setOpenAddUserModal={setOpenAddUserModal}

                                                            setOpenUpdateClientModal={setOpenUpdateClientModal}
                                                            setClientID={setClientID}
                                                        ></ClientCard>
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد عملاء"></EmptyStat>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Grid>

                            </InfiniteScroll>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Add Shipment */}
            <AddClientModal open={openAddOrderModal} onClose={() => setOpenAddOrderModal(false)}></AddClientModal>

            <AddUserModal  typePerson={"client"} role={"Client"} personID={personID} open={openAddUserModal} onClose={() => setOpenAddUserModal(false)}></AddUserModal>

            <UpdateClientModal clientID={clientID} open={openUpdateClientModal} onClose={() => setOpenUpdateClientModal(false)}></UpdateClientModal>
        </>
    );
}

export default Clients;
