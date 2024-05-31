import {
    Avatar,
    Box,
    BoxProps,
    Button,
    CardActionArea,
    Divider,
    Grid,
    IconButton,
    ListItemIcon,
    MenuItem,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { blue, green, grey, lightGreen } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import Chip from "../Chip/Chip";
import {
    Hash,
    MoreHorizontal,
    Edit,
    List,
    Edit2,
    Trash2,
    Printer,
    Repeat,
    XOctagon,
    Slash,
    CornerUpLeft,
    Copy,
    Check,
} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import traking_status from "../../utilities/data/tracking_status";
// import Menu from "../Menu/Menu";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import { useDebouncedCallback } from "use-debounce";
import { default as copyToClipoard } from "copy-to-clipboard";
import { AlertCircle, CheckCircle } from "lucide-react";

interface DeliveryCardProps extends BoxProps {
    shipment_id: string;

    name: string;
    city: string;
    status: number;
    shipment_code: string;
    shipmentRestInfo?: object;
    isCommercial?: boolean;
    onshowDetailsClick: () => any;
    setOpenShowDetailDrawer?: (isOpen: boolean) => any;
    onRequestClick?: (isOpen: boolean) => any;
    onRequestWithRadioClick?: (isOpen: boolean) => any;
    setRequestStatus?: (status: number) => any;
    setOneShipmentInfo?: object;
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

const DeliveryCard = (props: DeliveryCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    //   console.log(props.setOpenShowDetailDrawer);
    const userData = useStore((state: any) => state.userData);
    const [copied, setCopied] = useState(false);
    let debouncedCopy = useDebouncedCallback(() => setCopied(false), 800);
    const copy_active = {
        background: `${lightGreen["300"]}!important`,
        color: "#FFF",
        border: "unset",
        "&:hover": {
            background: lightGreen["300"],
        },
        "& svg": {
            color: "#FFF",
        },
    };

    const shipmentRestInfoHandler = () => {
        typeof props.setOneShipmentInfo == "function" &&
        props.setOneShipmentInfo({
            ...props.shipmentRestInfo,
        });
    };

    const requestHandler = (status: number) => {
        typeof props.setRequestStatus == "function" && props.setRequestStatus(status);
        typeof props.onRequestClick == "function" && props.onRequestClick(true);
        shipmentRestInfoHandler();
        popupState.close();
    };

    const requestWithRadioHandler = (status: number) => {
        typeof props.setRequestStatus == "function" && props.setRequestStatus(status);
        typeof props.onRequestWithRadioClick == "function" && props.onRequestWithRadioClick(true);
        shipmentRestInfoHandler();
        popupState.close();
    };

    return (
        <StyledDeliveryCard>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <RAvatar
                                        size="44px"
                                        name={props.name}
                                        round
                                        style={{ fontFamily: "Montserrat-Arabic" }}
                                        maxInitials={1}
                                    ></RAvatar>
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>
                                            {props.name}
                                        </Typography>
                                        <Typography variant="2xs" color={grey[400]}>
                                            {props.city}
                                        </Typography>
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
                <Grid
                    container
                    justifyContent={"space-between"}
                    alignItems="center"
                    sx={{ direction: "rtl" }}
                >
                    <Grid item>
                        <Box>
                            <Stack direction={"row"} alignItems="center" height={"100%"} columnGap={"4px"}>
                                {/* <Hash strokeWidth={3} size={"16px"} color={grey[300]} /> */}
                                <Tooltip title={copied ? "تم النسخ!" : "إضغط هنا للنسخ"} placement="top" arrow>
                                    <CardActionArea
                                        sx={{
                                            width: "auto",
                                            borderRadius: "50%",
                                            color: lightGreen[400],
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: "26px",
                                                height: "26px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                border: "2px dashed",
                                                borderColor: grey[200],
                                                borderRadius: "20px",
                                                cursor: "pointer",
                                                transition: "all 0.4s",
                                                "& svg": {
                                                    color: grey[400],
                                                },
                                                "&:hover": {
                                                    background: grey["50"],
                                                    "& svg": {
                                                        // color: "#FFF",
                                                    },
                                                },
                                                ...(copied && copy_active),
                                            }}
                                            onClick={() => {
                                                setCopied(true);
                                                copyToClipoard(props.shipment_code);
                                            }}
                                            onMouseLeave={() => debouncedCopy()}
                                        >
                                            {(!copied && <Copy size={14} strokeWidth="2"></Copy>) || (
                                                <Check size={14} strokeWidth="2"></Check>
                                            )}
                                        </Box>
                                    </CardActionArea>
                                </Tooltip>
                                <Typography
                                    variant="sm"
                                    color={grey[500]}
                                    // sx={{ "&:first-letter": { textTransform: "capitalize" } }}
                                >
                                    {props.shipment_code}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Stack direction={"row"}>
                            <Chip
                                size={"medium"}
                                variant="filled"
                                label={traking_status[props.status || 0].nameAr}
                                color="info"
                                // customColor={"#4DABF5"}
                                customColor={traking_status[props.status || 0].color}
                                rounded
                                dir="rtl"
                            ></Chip>
                            <img src="/box_starred.svg" height="18px" />
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                <MenuItem
                    onClick={() => {
                        props.onshowDetailsClick();
                        shipmentRestInfoHandler();
                        typeof props.setOpenShowDetailDrawer == "function" &&
                        props.setOpenShowDetailDrawer(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon>
                        <List size={18} strokeWidth={2} />
                    </ListItemIcon>
                    عرض التفاصيل
                </MenuItem>
                <Divider></Divider>

                <MenuItem
                    onClick={() => {
                        requestHandler(8);
                    }}
                >
                    <ListItemIcon>
                        <CheckCircle size={18} strokeWidth={2} />
                    </ListItemIcon>
                    إجراء تم التوصيل
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        requestWithRadioHandler(28);
                    }}
                >
                    <ListItemIcon>
                        <Slash size={18} strokeWidth={2} />
                    </ListItemIcon>
                    إجراء فشل التوصيل
                </MenuItem>
            </Menu>
        </StyledDeliveryCard>
    );
};

export default DeliveryCard;
