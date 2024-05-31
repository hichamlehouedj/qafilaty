import {Alert, Box, Container, Grid, Skeleton, Stack} from "@mui/material";
import React, {ReactElement, useContext, useEffect, useState} from "react";
import Button from "../components/Button";
import { Plus } from "react-feather";
import EmployeeCard from "../components/generated/EmployeeCard";
import Tabs2 from "../components/Tabs/Tabs2";
import Tab2 from "../components/Tabs/Tab2";
import Head from "next/head";
import { useGetAllEmployees, useGetOneEmployee } from "../graphql/hooks/employees";
import { searchHelper, sortByRecentTime } from "../utilities/helpers/filters";
import useStore from "../store/useStore";
import EmptyStat from "../components/generated/EmptyStat";
import AddEmployeeModal from "../components/Modal/AddEmployeeModal";
import AddUserModal from "../components/Modal/AddUserModal";
import UpdateEmployeeModal from "../components/Modal/UpdateEmployeeModal";
import InfiniteScroll from "react-infinite-scroller";
import PuffLoader from "react-spinners/PuffLoader";
import theme from "../styles/theme";
import {ContentRefContext} from "../components/generated/Content";
import {useDebouncedCallback} from "use-debounce";

interface Props {}

export function Employees({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openAddEmployeeModal, setOpenAddEmployeeModal] = React.useState(false);
    const [openAddUserModal, setOpenAddUserModal] = React.useState(false);
    const [openUpdateEmployeeModal, setOpenUpdateEmployeeModal] = React.useState(false);
    const [personID, setPersonID] = React.useState("");
    const [personRole, setPersonRole] = React.useState("");
    const [employeeID, setEmployeeID] = React.useState("");
    const [tab2value, setTab2value] = React.useState(0);
    const [allEmployeesData, setAllEmployeesData] = React.useState<object[]>([]);
    const [renderedEmployeesData, setRenderedEmployeesData] = React.useState<object[]>([]);
    const [alert, setAlert] = useState<boolean>(true);

    // context
    const contentRef = useContext(ContentRefContext);

    // handlers
    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    // get all shipments
    let [getEmployeesData, getEmployeesLoading] = useGetAllEmployees({
        stock_id: userData?.person?.list_stock_accesses?.stock?.id
    });


    const [loadingPage, setLoadingPage] = React.useState<boolean>(getEmployeesLoading);

    // debounce
    const setLoadingPageDebounced = useDebouncedCallback((value) => {
        if (!value) setLoadingPage(false);
    }, 700);

    // filtering
    let filteredData: object[] = [];
    filteredData = sortByRecentTime(["createdAt"], allEmployeesData);
    filteredData = searchHelper(searchValue, filteredData);

    let allEmployees = filteredData;
    let employeesHasUser = filteredData.filter((v: any) => v.user !== null);
    let employeesDontHasUser = filteredData.filter((v: any) => v.user === null);

    // infinite scrolling
    const [hasMore, setHasMore] = useState(true);
    const [loadingDataSize, setLoadingDataSize] = useState(40);
    const [employeeDataEnqueued, setEmployeeDataEnqueued] = useState<object[]>([]);
    const contentScrollParentRef = useStore((state: any) => state.contentScrollParentRef);

    useEffect(() => {
        setEmployeeDataEnqueued(() => [...renderedEmployeesData.slice(0, loadingDataSize)]);
        if (renderedEmployeesData.length < loadingDataSize) setHasMore(false);
        else setHasMore(true);
    }, [renderedEmployeesData, searchValue]);

    const moreDataHendler = () => {
        let currentChunk = renderedEmployeesData.slice(0, employeeDataEnqueued.length + loadingDataSize);
        setTimeout(() => {
            setEmployeeDataEnqueued([...currentChunk]);
            if (currentChunk.length && renderedEmployeesData.length <= currentChunk.length) {
                setHasMore(false);
                return;
            }
        }, 800);
    };

    // watchers
    useEffect(() => {
        setAllEmployeesData(() => [...getEmployeesData]);
    }, [getEmployeesData]);

    useEffect(() => {
        setRenderedEmployeesData(() => [...allEmployees]);
    }, [allEmployeesData, searchValue]);

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    if (loadingPage) {
        setLoadingPageDebounced(getEmployeesLoading);
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
            <Head><title>الموظفين | قافلي</title></Head>

            <Container maxWidth="xl" sx={{ padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%" }} >
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={renderedEmployeesData.length == 0 ? "100%" : ""} >
                        {
                            alert && (
                                <Grid item xs={12} sm={12} sx={{paddingTop: "0px !important"}} >
                                    <Alert variant="outlined" severity={"warning"} sx={{ padding: "4px 16px"}} onClose={() => setAlert(false)} >
                                        السائق فقط يملك ملف شخصي.
                                    </Alert>
                                </Grid>
                            )
                        }

                        <Grid item xs={12}>
                            <Grid container flexDirection={"row-reverse"} justifyContent="space-between">
                                <Grid item xs={12} sm="auto">
                                    <Button startIcon={<Plus></Plus>} variant="contained" onClick={() => setOpenAddEmployeeModal(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        إضافة موظف
                                    </Button>
                                </Grid>
                                <Grid item xs={12} sm="auto">
                                    {/* @ts-ignore */}
                                    <Tabs2 value={tab2value} onChange={tabs2handler}>
                                        <Tab2 label="الكل" count={allEmployees.length} onClick={() => setRenderedEmployeesData(allEmployees)}/>
                                        <Tab2 label="عنده حساب" count={employeesHasUser.length} onClick={() => setRenderedEmployeesData(employeesHasUser)}/>
                                        <Tab2 label="بدون حساب" count={employeesDontHasUser.length} onClick={() => setRenderedEmployeesData(employeesDontHasUser)}/>
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
                                    employeeDataEnqueued.length && (
                                        <Box className="loader" key={0} sx={{width: "100%", display: "flex", justifyContent: "center", padding: "20px 0"}}>
                                            <PuffLoader size={38} color={theme.palette.primary.main}></PuffLoader>
                                        </Box>
                                    )
                                }
                            >
                                <Grid item xs={12} paddingBottom="32px">
                                    <Grid container spacing={3}>
                                        {renderedEmployeesData.length != 0 ? (
                                            renderedEmployeesData?.map((employee: any, index: any) => {
                                                return (
                                                    <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                                        <EmployeeCard
                                                            id={employee.id}
                                                            id_person={employee.person.id}
                                                            name={`${employee.person.first_name} ${employee.person.last_name}`}
                                                            phone={employee.person.phone01}
                                                            department={employee.department}
                                                            user={employee.user !== null ? true : false}
                                                            activation={employee.user?.activation}
                                                            setPersonID={setPersonID}
                                                            setOpenAddUserModal={setOpenAddUserModal}
                                                            setOpenUpdateEmployeeModal={setOpenUpdateEmployeeModal}
                                                            setEmployeeID={setEmployeeID}
                                                            setPersonRole={setPersonRole}
                                                        ></EmployeeCard>
                                                    </Grid>
                                                );
                                            })
                                        ) : (
                                            <Grid item xs={12}>
                                                <EmptyStat title="لايوجد موظفيين"></EmptyStat>
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
            <AddEmployeeModal open={openAddEmployeeModal} onClose={() => setOpenAddEmployeeModal(false)}></AddEmployeeModal>

            <AddUserModal typePerson={"employee"} role={personRole} personID={personID} open={openAddUserModal} onClose={() => setOpenAddUserModal(false)}></AddUserModal>

            <UpdateEmployeeModal employeeID={employeeID} open={openUpdateEmployeeModal} onClose={() => setOpenUpdateEmployeeModal(false)}></UpdateEmployeeModal>
        </>
    );
}

export default Employees;
