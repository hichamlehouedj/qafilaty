import { useTheme, alpha } from "@mui/material/styles";
import {Box, Container, Divider, Grid, Stack, Typography} from "@mui/material";
import { grey } from "@mui/material/colors";
import React, { useEffect } from "react";
import { Box as BoxIcon } from "react-feather";
import { Props as ChartProps } from "react-apexcharts";
import dynamic from "next/dynamic";
import Chip from "../Chip/Chip";
import useGetStatistics from "../../graphql/hooks/statistics/useGetStatistics";
import priceFormatHelper from "../../utilities/helpers/priceFormatHelper";
import { tracking_status } from "../../utilities/data";
import useStore from "../../store/useStore";

interface Props {
    idClient: string;
}

const Chart = dynamic(
    () => {
        return import("react-apexcharts");
    },
    { ssr: false }
);

export const StatisticsClient = (props: Props) => {
    let userData = useStore((state: any) => state.userData);

    let theme = useTheme();
    let statisticsData = useGetStatistics({
        id_client: props?.idClient || "",
    });

    let areaOptions01 = {
        series: [
            { name: "المحفظة", data: [0, 0, 0, 0, 0] },
        ],
        options: {
            colors: [theme.palette.primary.main],

            fill: {
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0.5,
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 4,
                    right: 3,
                    bottom: 6,
                    top: 0,
                },
            },
            chart: {
                type: "area",
                toolbar: { show: false },
                sparkline: { enabled: true },
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: "stepline",
                width: 3
            },
            yaxis: {
                forceNiceScale: true,
                labels: { show: false },

                floating: false,
                tooltip: { enabled: false },
                opposite: true,
            },
            xaxis: {
                forceNiceScale: true,
                tooltip: { enabled: false },
                type: "datetime",
                categories: [
                    "2018-09-19T00:00:00.000Z",
                    "2018-09-19T01:30:00.000Z",
                    "2018-09-19T02:30:00.000Z",
                    "2018-09-19T03:30:00.000Z",
                    "2018-09-19T04:30:00.000Z",
                ],
            },
            plotOptions: {},
            tooltip: {
                style: { fontFamily: "Montserrat-Arabic" },
                marker: { show: false },
                x: { format: "dd/MM/yy HH:mm" },
            },
        },
    } as ChartProps;

    let areaOptions02 = {
        series: [
            { name: "العملات", data: [0, 0, 0, 0, 0] },
        ],
        options: {
            colors: [theme.palette.primary.main],

            fill: {
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.5,
                    opacityTo: 0.5,
                },
            },
            grid: {
                show: false,
                padding: {
                    left: 4,
                    right: 3,
                    bottom: 6,
                    top: 0,
                },
            },
            chart: {
                type: "area",
                toolbar: { show: false },
                sparkline: { enabled: true },
            },
            dataLabels: { enabled: false },
            stroke: {
                curve: "stepline",
                width: 3
            },
            yaxis: {
                forceNiceScale: true,
                labels: { show: false },

                floating: false,
                tooltip: { enabled: false },
                opposite: true,
            },
            xaxis: {
                forceNiceScale: true,
                tooltip: { enabled: false },
                type: "datetime",
                categories: [
                    "2018-09-19T00:00:00.000Z",
                    "2018-09-19T01:30:00.000Z",
                    "2018-09-19T02:30:00.000Z",
                    "2018-09-19T03:30:00.000Z",
                    "2018-09-19T04:30:00.000Z",
                ],
            },
            plotOptions: {},
            tooltip: {
                style: { fontFamily: "Montserrat-Arabic" },
                marker: { show: false },
                x: { format: "dd/MM/yy HH:mm" },
            },
        },
    } as ChartProps;

    let chartOptions = {
        series: [statisticsData?.numberAllBoxNotArchived || 0, statisticsData?.numberAllBoxArchived || 0],
        options: {
            stroke: {
                width: 5,
                colors: ["#FFFFFF"],
                lineCap: "butt",
                dashArray: 80,
                show: true,
            },
            states: {
                active: {
                    filter: {type: "none", value: 0.75,},
                },
                hover: {
                    filter: {type: "none", value: 0.9,},
                },
            },
            tooltip: {
                shared: false,
                intersect: true,
                inverseOrder: true,
                marker: {show: true,},

                fillSeriesColor: false,
                style: {fontFamily: "Montserrat-Arabic",},
            },
            labels: ["Active", "Archived"],
            legend: {show: false,},
            chart: {type: "donut",},
            dataLabels: {enabled: false,},
            colors: [theme.palette.primary.main, "#EFF0F3"],
            fill: { colors: [theme.palette.primary.main, "#EFF0F3"] },
            plotOptions: {
                pie: {
                    expandOnClick: false,
                    donut: {
                        size: "70",

                        labels: {
                            show: true,
                            name: { show: false },
                            value: { show: false, offsetY: 0 }
                        },
                    },
                },
            },
        },
    } as ChartProps;

    // watchers

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    if (!statisticsData)
        return (
            <Container maxWidth="lg" sx={{ padding: { xs: "0 24px", lg: "0 16px" } }}>
                <Typography variant="sm" color={grey[800]}> loading... </Typography>
            </Container>
        );

    return (
        <>
            <Container maxWidth="lg" sx={{ padding: { xs: "0 24px", lg: "0 16px" } }}>
                <Stack gap={"26px"} width={"100%"} margin="0 auto">
                    {/* Wallet & commissions */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} lg={6}>
                            <Box bgcolor={"#FFF"} height="288px" padding={"25px 28px"} paddingBottom="0" borderRadius="6px">
                                <Stack height="100%">
                                    <Typography variant="2xl" color={grey[700]}> المحفظة</Typography>
                                    <Box flex={"1"} marginRight="-28px">
                                        <Stack height="100%" direction={"row"} alignItems={"center"} gap="30px">
                                            <Stack gap="12px">
                                                <Typography variant="5xl" fontWeight={500} color={theme.palette.primary.main}>
                                                    {priceFormatHelper(statisticsData.moneyReadyReceive, "د.ج" )}
                                                </Typography>
                                                <Typography variant="base" fontWeight={500} color={grey[500]}>الأموال المتاحة</Typography>
                                            </Stack>
                                            <Box flex="1" /* border={"1px solid blue"} */ height="100%" boxSizing={"border-box"}>
                                                <Chart type="area" dir="rtl" options={areaOptions01.options} series={areaOptions01.series}/* width="300px" */ height="140px"/>
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Box height="80px">
                                        <Stack height="100%" direction="row">
                                            <Box flex="1" paddingTop={"4px"} /* paddingLeft={"20px"} */ >
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}> في الفرع </Typography>
                                                    <Typography variant="sm" color={grey[800]}>
                                                        {priceFormatHelper(statisticsData.moneyStock, "د.ج" )}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical"
                                                     style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}
                                            ></Divider>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>قيد التوصيل</Typography>
                                                    <Typography variant="sm" color={grey[800]}>
                                                        {priceFormatHelper(statisticsData.moneyDriver, "د.ج")}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical"
                                                     style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}
                                            ></Divider>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>الأموال المستلمة</Typography>
                                                    <Typography variant="sm" color={grey[800]}>
                                                        {priceFormatHelper(statisticsData.moneyReceived, "د.ج")}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12} lg={6}>
                            <Box bgcolor={"#FFF"} height="288px" padding={"25px 28px"} paddingBottom="0" borderRadius="6px">
                                <Stack height="100%">
                                    <Typography variant="2xl" color={grey[700]}>العمولات</Typography>
                                    <Box flex={"1"} marginRight="-28px">
                                        <Stack height="100%" direction={"row"} alignItems={"center"} gap="30px">
                                            <Stack gap="12px">
                                                <Typography variant="5xl" fontWeight={500} color={theme.palette.primary.main}>
                                                    {priceFormatHelper(statisticsData.totalCommissions, "د.ج")}
                                                </Typography>
                                                <Typography variant="base" fontWeight={500} color={grey[500]}>إجمالي العمولات</Typography>
                                            </Stack>
                                            <Box flex="1" height="100%" boxSizing={"border-box"}>
                                                <Chart type="area" options={areaOptions02.options} series={areaOptions02.series} height="140px"/>
                                            </Box>
                                        </Stack>
                                    </Box>

                                    <Box height="80px">
                                        <Stack height="100%" direction="row">
                                            <Box flex="1" paddingTop={"4px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>تم تسليمها</Typography>
                                                    <Typography variant="sm" color={grey[800]}>{priceFormatHelper(statisticsData.totalAmountDelivered, "د.ج")}</Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical" style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}></Divider>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>مسبقة الدفع</Typography>
                                                    <Typography variant="sm" color={grey[800]}>
                                                        {priceFormatHelper(statisticsData.totalPrepaid, "د.ج")}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical" style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}></Divider>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>القيمة المضافة</Typography>
                                                    <Typography variant="sm" color={grey[800]}>{priceFormatHelper(statisticsData.totalAmountTax, "د.ج")}</Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical" style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}></Divider>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>راجع</Typography>
                                                    <Typography variant="sm" color={grey[800]}>{priceFormatHelper(statisticsData.totalAmountCancelled, "د.ج")}</Typography>
                                                </Stack>
                                            </Box>
                                            <Divider orientation="vertical" style={{borderRight: "1.5px dashed rgba(0, 0, 0, 0.12)", borderLeft: 0,}}/>

                                            <Box flex="1" paddingTop={"4px"} paddingLeft={"20px"}>
                                                <Stack gap="14px">
                                                    <Typography variant="sm" color={grey[500]}>تم الالتقاط</Typography>
                                                    <Typography variant="sm" color={grey[800]}>{priceFormatHelper(statisticsData.totalAmountPickUp, "د.ج")}</Typography>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* 3 Boxes */}
                    <Grid container spacing={{ xs: 3 }}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box bgcolor={"#FFF"} height="114px" padding={"25px 28px"} borderRadius="6px">
                                <Stack direction="row" columnGap="24px" alignItems="center">
                                    <Box borderRadius={"50%"} width="64px" height="64px"
                                         bgcolor={alpha(theme.palette.primary.main, 0.1)}
                                         display="flex" alignItems={"center"} justifyContent="center">
                                        <BoxIcon size={36} color={theme.palette.primary.main}></BoxIcon>
                                    </Box>
                                    <Stack gap="4px">
                                        <Typography variant="lg" color={grey[800]}>{statisticsData.numberAllBox}</Typography>
                                        <Typography variant="sm" color={grey[500]}>مجموع الطرود</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Box bgcolor={"#FFF"} height="114px" padding={"25px 28px"} borderRadius="6px">
                                <Stack direction="row" columnGap="24px" alignItems="center">
                                    <Box borderRadius={"50%"} width="64px" height="64px"
                                         bgcolor={alpha(theme.palette.primary.main, 0.1)}
                                         display="flex" alignItems={"center"} justifyContent="center"
                                    >
                                        <BoxIcon size={36} color={theme.palette.primary.main}></BoxIcon>
                                    </Box>
                                    <Stack gap="4px">
                                        <Typography variant="lg" color={grey[800]}>{statisticsData.numberClassicBox}</Typography>
                                        <Typography variant="sm" color={grey[500]}>الطرود الكلاسيكية</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Box bgcolor={"#FFF"} height="114px" padding={"25px 28px"} borderRadius="6px">
                                <Stack direction="row" columnGap="24px" alignItems="center">
                                    <Box borderRadius={"50%"} width="64px" height="64px"
                                         bgcolor={alpha(theme.palette.primary.main, 0.1)}
                                         display="flex" alignItems={"center"} justifyContent="center"
                                    >
                                        <BoxIcon size={36} color={theme.palette.primary.main}></BoxIcon>
                                    </Box>
                                    <Stack gap="4px">
                                        <Typography variant="lg" color={grey[800]}>{statisticsData.numberCommercialBox}</Typography>
                                        <Typography variant="sm" color={grey[500]}>الطرود التجارية</Typography>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Table & Chart */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={12} md={4}>
                            <Box bgcolor={"#FFF"} padding={"25px 28px"} borderRadius="6px" flex="1">
                                <Stack gap="20px">
                                    <Typography variant="xl" color={grey[700]}>إحصائيات الطرود</Typography>
                                    <Box position={"relative"} flex="1" margin={"0 auto"}>
                                        <Chart
                                            options={chartOptions.options}
                                            series={chartOptions.series}
                                            type="donut" width="230px" height="230px"
                                        />
                                    </Box>
                                    <Stack direction={"row"} gap="20px" margin={"0 auto"}>
                                        <Box>
                                            <Stack direction="row" alignItems={"center"} gap="6px">
                                                <Box width="10px" height="10px" borderRadius={"50%"}
                                                     bgcolor={theme.palette.primary.main}
                                                ></Box>
                                                <Typography variant="sm" color={grey[500]}>نشطة</Typography>
                                            </Stack>
                                        </Box>
                                        <Box>
                                            <Stack direction="row" alignItems={"center"} gap="6px">
                                                <Box width="10px" height="10px" borderRadius={"50%"} bgcolor={"#EFF0F3"}></Box>
                                                <Typography variant="sm" color={grey[500]}>مؤرشفة</Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>

                        <Grid item xs={12} sm={12} md={8}>
                            <Box bgcolor={"#FFF"} padding={"25px 28px"} borderRadius="6px" flex="2">
                                <Stack gap="24px">
                                    <Typography variant="xl" color={grey[700]}>حالات الطرود</Typography>
                                    <Stack direction={"row"}>
                                        <Typography variant="sm" color={grey[500]} flex="1">الحالة</Typography>
                                        <Typography variant="sm" color={grey[500]} flex="1">إجمالي</Typography>
                                        <Typography variant="sm" color={grey[500]} flex="1">كلاسيكة</Typography>
                                        <Typography variant="sm" color={grey[500]} flex="1">تجارية</Typography>
                                    </Stack>
                                    <Divider style={{borderBottom: "1.5px dashed rgba(0, 0, 0, 0.12)", marginTop: -4,}}></Divider>
                                    <Stack gap="20px" marginTop={"-8px"}>
                                        {statisticsData?.allStatus?.map((stat: any, index: any) => (
                                            <Stack direction="row" alignItems={"center"} key={index}>
                                                <Typography variant="sm" color={grey[800]} flex="1">
                                                    <Chip size="medium" rounded={"true"} style={{ fontSize: "11px !important" }}
                                                          label={tracking_status[stat.status].nameAr}
                                                          customColor={tracking_status[stat.status].color}
                                                    ></Chip>
                                                </Typography>
                                                <Typography variant="sm" color={grey[800]} flex="1">{stat.numberClassic + stat.numberCommercial}</Typography>
                                                <Typography variant="sm" color={grey[800]} flex="1">{stat.numberClassic}</Typography>
                                                <Typography variant="sm" color={grey[800]} flex="1">{stat.numberCommercial}</Typography>
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </>
    );
};

export default StatisticsClient;
