import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography} from "@mui/material";
import { grey, blue, deepPurple} from "@mui/material/colors";
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
    salary: number;
    idDriver: any;
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

const MoneyDriverCard = ({code_invoice, dataInvoice, salary, idDriver}: DeliveryCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    const [totalPrice, setTotalPrice] = useState(0);
    const [status, setStatus] = useState(0);

    useEffect(() => {
        // @ts-ignore
        setTotalPrice(dataInvoice?.length * salary)
    }, [dataInvoice])

    return (
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <Divider orientation="vertical" variant="fullWidth" flexItem style={{borderColor: blue["400"], borderWidth: "2px", borderRadius: "3px"}} />
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
                        <Chip size={"medium"} variant="filled" label={"تم دفع عمولة السائق"} color="info" customColor={deepPurple["A200"]} rounded={"true"} dir="rtl"></Chip>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <Link href={{pathname: "/invoiceDriver", query: {id: idDriver, codeInvoice: code_invoice as any}}} passHref>
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

export default MoneyDriverCard;
