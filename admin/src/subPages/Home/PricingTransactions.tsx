import {alpha, Box, Button, Grid, Chip as MuiChip, Stack, Typography,} from "@mui/material";
import { grey } from "@mui/material/colors";
import {AlertCircle, ArrowLeftRight, ListMinus, Edit2,} from "lucide-react";
import React, { useEffect } from "react";
import EditTransactionPricesDialog from "../../components/Dialog/EditTransactionPricesDialog";
import { useGetZoneTransaction } from "../../graphql/hooks/shipments";
import theme from "../../styles/theme";
import { priceFormatHelper } from "../../utilities/helpers";
import { sortByRecentTime } from "../../utilities/helpers/filters";

interface Props {
    tabvalue?: any;
    allZonesQuery?: any;
}

const PricingTransactions = React.forwardRef(function PricingTransactions(props: Props, ref) {
    const [expanded, setExpanded] = React.useState("panel1");
    const [selectedZone, setSelectedZone] = React.useState(0);
    const [selectedTransaction, setSelectedTransaction] = React.useState({});
    const [editTransactionDialog, setEditTransactionDialog] = React.useState(false);

    const [getZoneTransactionLazy, { loading: loadingTransaction, data: zoneTransactionsData }] =
        useGetZoneTransaction();

    const accordionExpandHandler = (panel: any) => (event: any, newExpanded: any) => {
        setExpanded(newExpanded ? panel : false);
    };

    const sortedZoneData: any = sortByRecentTime(["createdAt"], props.allZonesQuery);

    useEffect(() => {
        if (props.tabvalue == 1) {
            getZoneTransactionLazy({
                variables: {
                    idZone: sortedZoneData?.[selectedZone]?.id,
                },
            });
        }
    }, [props.tabvalue, selectedZone]);

    return (
        <Box
            sx={{
                width: "100%",
                // marginTop: "32px",
                direction: "ltr",
                overflow: "hidden",
            }}
        >
            <Grid container spacing={4} direction="row">
                <Grid item xs={6}>
                    <Box sx={{ width: "100%", background: "#FFF", borderRadius: "4px" }}>
                        {/* header */}
                        <Box
                            className="header"
                            sx={{
                                padding: "20px 24px",
                                paddingBottom: "14px",
                                width: "100%",
                                borderBottom: "1px solid " + grey[100],
                                // background: "blue",
                            }}
                        >
                            <Stack direction="row" gap={"8px"}>
                                <ListMinus size="22" color={grey[600]}></ListMinus>
                                <Typography variant="lg" color={grey[600]}>
                                    قائمة المناطق
                                </Typography>
                            </Stack>
                        </Box>
                        {/* content */}
                        <Box
                            className="content"
                            sx={{
                                padding: "20px 24px",
                                width: "100%",
                            }}
                        >
                            <Stack gap="20px">
                                {/* alert */}
                                <Box
                                    className="alert"
                                    sx={{
                                        border: "2px dashed " + alpha(theme.palette.primary.main, 0.2),
                                        padding: "10px 8px",
                                        borderRadius: "4px",
                                    }}
                                >
                                    <Stack direction="row" gap="10px" alignItems={"center"}>
                                        <AlertCircle size={20} color={alpha(theme.palette.primary.main, 0.8)} />
                                        <Typography variant="xs" color="#C0B3CC">
                                            يرجى إختيار منطقة معينة للتصفية.
                                        </Typography>
                                    </Stack>
                                </Box>
                                {/* list Provinces Chips */}

                                <Stack direction="row" flexWrap={"wrap"} sx={{ width: "100%", gap: "8px" }}>
                                    {sortedZoneData?.map((zone: any, i: number) => (
                                        <Box key={i}>
                                            <MuiChip
                                                // size={"default"}
                                                variant={selectedZone === i ? "filled" : "outlined"}
                                                // customColor={theme.palette.primary.main}
                                                label={
                                                    <Stack direction="row" gap="8px">
                                                        {/* <GripVertical size="12" /> */}
                                                        <Box>{zone?.name}</Box>
                                                    </Stack>
                                                }
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedZone(i);
                                                }}
                                                // variant="outlined"
                                            ></MuiChip>
                                        </Box>
                                    ))}
                                    {/* <Box>
                    <Chip
                      rounded
                      size={"default"}
                      variant="filled"
                      customColor={theme.palette.primary.main}
                      label={
                        <Stack direction="row" gap="8px">
                          {/* <GripVertical size="12" />
                          <Box>ولايات غرب الجزائر</Box>
                        </Stack>


                    ></Chip>
                  </Box> */}
                                </Stack>
                            </Stack>
                        </Box>
                    </Box>
                </Grid>
                {/* add zones (left side) */}
                <Grid item xs={6}>
                    <Stack
                        sx={{
                            overflowY: "auto",
                            height: "calc(100vh - 64px - 64px - 32px - 32px)",
                            paddingRight: 1,
                        }}
                        gap={"22px"}
                    >
                        {zoneTransactionsData?.allPricing?.map((transaction: any, i: number) => (
                            <Box sx={{ width: "100%", background: "#FFF", borderRadius: "4px" }} key={i}>
                                <Stack height="100%">
                                    {/* header */}
                                    <Stack direction="row">
                                        <Box sx={{ flex: 1, padding: "14px" }}>
                                            <Typography variant="sm" color={grey[700]}>
                                                {transaction?.zone_begin?.name}
                                            </Typography>
                                        </Box>
                                        {/* @ts-ignore */}
                                        <Stack
                                            hegiht="100%"
                                            // width="20px"
                                            // alignItems="center"
                                            justifyContent={"center"}
                                            position="relative"
                                            zIndex="99"
                                            sx={{
                                                "&:before": {
                                                    content: '""',
                                                    position: "absolute",
                                                    width: "50%",
                                                    height: "100%",
                                                    right: 0,
                                                    backgroundColor: "#F8F8F8",
                                                    zIndex: -1,
                                                },
                                            }}
                                        >
                                            <Stack
                                                flex={"0 0 auto"}
                                                sx={{
                                                    padding: "8px",
                                                    backgroundColor: theme.palette.primary.main,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <ArrowLeftRight size="16" color="#FFF" />
                                            </Stack>
                                        </Stack>
                                        <Box
                                            sx={{
                                                flex: 1,
                                                padding: "14px",
                                                backgroundColor: "#F8F8F8",
                                            }}
                                        >
                                            <Typography component="div" variant="sm" color={grey[700]} textAlign="right">
                                                {transaction?.zone_end?.name}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    {/* content */}
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent={"space-between"}
                                        sx={{
                                            borderTop: "1px solid " + grey[100],
                                            height: "72px",
                                            padding: "0 14px",
                                            width: "100%",
                                            backgroundColor: "#FFF",
                                        }}
                                    >
                                        <Stack direction="row" gap={"28px"}>
                                            <Stack gap={"4px"}>
                                                <Typography variant="2xs" color={alpha(theme.palette.primary.main, 0.7)}>
                                                    توصيل للمنزل
                                                </Typography>
                                                <Typography variant="lg" color={theme.palette.primary.main}>
                                                    {priceFormatHelper(transaction?.default_price_house, "د.ج", {
                                                        fontSize: "inherit",
                                                    })}
                                                </Typography>
                                            </Stack>

                                            <Stack gap={"4px"}>
                                                <Typography variant="2xs" color={alpha(theme.palette.primary.main, 0.7)}>
                                                    توصيل للمكتب
                                                </Typography>
                                                <Typography variant="lg" color={theme.palette.primary.main}>
                                                    {priceFormatHelper(transaction?.default_price_office, "د.ج", {
                                                        fontSize: "inherit",
                                                    })}
                                                </Typography>
                                            </Stack>
                                        </Stack>

                                        <Button
                                            color="primary"
                                            sx={{ borderRadius: "4px", padding: "12px 10px" }}
                                            onClick={() => {
                                                setEditTransactionDialog(true);
                                                setSelectedTransaction(transaction);
                                            }}
                                        >
                                            <Stack direction={"row"} gap="8px" alignItems="center">
                                                {/* <Edit2 size={18} /> */}
                                                <Edit2 size={16} />
                                                <Typography variant="xs">تعديل الأسعار</Typography>
                                            </Stack>
                                        </Button>
                                    </Stack>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Grid>
            </Grid>

            <EditTransactionPricesDialog
                width="340px"
                zoneID={sortedZoneData?.[selectedZone]?.id}
                transactionData={selectedTransaction}
                open={editTransactionDialog}
                onClose={() => setEditTransactionDialog(false)}
            />
        </Box>
    );
});

export default PricingTransactions;
