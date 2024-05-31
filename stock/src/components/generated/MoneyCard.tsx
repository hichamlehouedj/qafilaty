import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography} from "@mui/material";
import { grey} from "@mui/material/colors";
import { styled } from "@mui/system";
import React, {useEffect, useState} from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, List, Printer, Archive} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import traking_status from "../../utilities/data/tracking_status";
import useStore from "../../store/useStore";
import Link from "next/link";

interface DeliveryCardProps extends BoxProps {
    code_invoice?: string;
    dataInvoice?: [];
}

const StyledDeliveryCard = styled(Box)(({ theme }: { theme: any }) => {
    return {
        width: "100%",
        height: "152px",
        padding: "16px",
        backgroundColor: "#FFF",
        borderRadius: 2,
    };
});

const MoneyCard = ({code_invoice, dataInvoice}: DeliveryCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    const [totalPrice, setTotalPrice] = useState(0);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        let total = 0
        if (dataInvoice != undefined && dataInvoice.length > 0) {
            dataInvoice.map(invoice => {
                // @ts-ignore
                if (invoice?.paid_in_office ) {
                    // @ts-ignore
                    total   += invoice?.price_box - (invoice?.price_box * (invoice?.TVA / 100))
                    // @ts-ignore
                } else if (invoice?.payment_type == "free") {
                    // @ts-ignore
                    total   += invoice?.price_box - (invoice?.price_box * (invoice?.TVA / 100)) - invoice?.price_delivery
                }
                else {
                    // @ts-ignore
                    total   += (invoice?.price_box + invoice?.price_delivery) - (invoice?.price_box * (invoice?.TVA / 100)) - invoice?.price_delivery
                }
            })
            // @ts-ignore
            setStatus(dataInvoice?.[0]?.lastTrace?.[0]?.status)
        }
        setTotalPrice(total)
    }, [dataInvoice])

    return (
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <Divider orientation="vertical" variant="fullWidth" flexItem style={{borderColor: traking_status[status].color, borderWidth: "2px", borderRadius: "3px"}} />
                                    <Stack rowGap={"5px"} alignItems={"flex-start"} >
                                        <Typography variant="sm" color={grey[800]}>{code_invoice}</Typography>
                                        <Chip label={<Stack direction={"row"} alignItems={"center"} ><Archive size={13} style={{marginLeft: "5px"}} /> {dataInvoice?.length}</Stack>} style={{fontSize: "14px!important"}}  size={"small"} />
                                    </Stack>
                                </Stack>
                            </Grid>
                            <Grid item>
                                <IconButton size={"small"} {...bindTrigger(popupState)}>
                                    <MoreHorizontal color={grey[500]} size={18} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item></Grid>
                </Grid>

                <Grid container justifyContent={"space-between"} alignItems="center" sx={{ direction: "rtl" }}>
                    <Grid item>
                        <Typography variant="xs" dir={"rtl"} color={grey[500]}>{`${totalPrice} دج`}</Typography>
                    </Grid>

                    <Grid item>
                        <Chip size={"medium"} variant="filled" label={traking_status[status].nameAr} color="info" customColor={traking_status[status].color} rounded={"true"} dir="rtl"></Chip>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <Link href={{pathname: "/invoice", query: {codeInvoice: code_invoice as any}}} passHref>
                    <a target="_blank">
                        <MenuItem>
                            <ListItemIcon><Printer size={18} strokeWidth={2} /></ListItemIcon>
                            طباعة الفاتورة
                        </MenuItem>
                    </a>
                </Link>
            </Menu>
        </StyledDeliveryCard>
    );
};

export default MoneyCard;
