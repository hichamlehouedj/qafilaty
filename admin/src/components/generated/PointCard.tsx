import {Box, BoxProps, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Typography} from "@mui/material";
import {green, grey, red} from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, List, Slash} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import useStore from "../../store/useStore";
import { X, Edit } from "lucide-react";
import useDeleteInvoice from "../../graphql/hooks/invoices/useDeleteInvoice";
import {ALL_INVOICES} from "../../graphql/hooks/invoices/useGetAllInvoice";
import {useSnackbar} from "notistack";

interface PointCardProps extends BoxProps {
    id: string;

    code_invoice: string;
    points: number;
    status: string;

    oneInvoiceInfo?: any;
    setOneInvoiceInfo?: object;
    setOpenUpdateInvoiceModal?: (isOpen: boolean) => any;
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

const PointCard = (props: PointCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    let [deleteInvoice] = useDeleteInvoice();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const setInvoiceInfo = () => {
        typeof props.setOneInvoiceInfo == "function" &&
        props.setOneInvoiceInfo({...props.oneInvoiceInfo});
    };

    const onDeleteInvoice = () => {
        deleteInvoice({
            variables: {
                id: props?.id
            },
            refetchQueries: [ALL_INVOICES]
        })
        .then(() => {
            enqueueSnackbar("لقد تمت حذف فاتورة النقاط بنجاح", {variant: "success"});
        })
    }

    return (
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <Divider orientation="vertical" variant="fullWidth" flexItem style={{borderColor: props.status == "active" ? green["500"] : props.status == "desactive" ? red["500"] : grey[700], borderWidth: "2px", borderRadius: "3px"}} />
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>{props.code_invoice}</Typography>
                                        <Typography variant="2xs" color={grey[400]}>{`${props.points} نقطة`}</Typography>
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
                        <Stack direction={"row"}>
                            <Chip
                                size={"medium"}
                                variant="filled"
                                label={props.status == "active" ? "تم التحقق" : props.status == "desactive" ? "مرفوض" : "قيد الانتظار"}
                                color="info"
                                customColor={props.status == "active" ? green["500"] : props.status == "desactive" ? red["500"] : grey[500] }
                                rounded
                                dir="rtl"
                            />
                        </Stack>
                    </Grid>
                    <Grid item>
                        <Box>
                            <Stack direction={"row"} alignItems="center" height={"100%"} columnGap={"4px"}>
                                <Typography variant="sm" dir="rtl" color={grey[500]}>{`${props.points * 10} دج`}</Typography>
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <MenuItem
                    onClick={() => {
                        setInvoiceInfo();
                        typeof props.setOpenUpdateInvoiceModal == "function" &&
                        props.setOpenUpdateInvoiceModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon>
                        <Edit size={18} strokeWidth={2} />
                    </ListItemIcon>
                    تعديل
                </MenuItem>
                <Divider></Divider>

                <MenuItem
                    onClick={() => {
                        onDeleteInvoice();
                        popupState.close();
                    }}
                >
                    <ListItemIcon>
                        <X size={18} strokeWidth={2} />
                    </ListItemIcon>
                    حذف
                </MenuItem>
            </Menu>
        </StyledDeliveryCard>
    );
};

export default PointCard;
