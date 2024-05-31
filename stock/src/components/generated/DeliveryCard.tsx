import {Box, BoxProps, CardActionArea, Divider, Grid, IconButton, ListItemIcon, MenuItem, Stack, Tooltip, Typography,} from "@mui/material";
import {grey, lightGreen, blue} from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState, useEffect } from "react";
import Chip from "../Chip/Chip";
import {MoreHorizontal, List, Printer, Slash, Copy, Check, Edit} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import traking_status from "../../utilities/data/tracking_status";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import { useDebouncedCallback } from "use-debounce";
import { default as copyToClipoard } from "copy-to-clipboard";
import Link from "next/link";
import classNames from "classnames";

interface DeliveryCardProps extends BoxProps {
    shipment_id: string;

    name: string;
    city: string;
    status: number;
    shipment_code: string;
    shipmentRestInfo?: any;
    isCommercial?: boolean;
    onshowDetailsClick: () => any;
    setOpenShowDetailDrawer?: (isOpen: boolean) => any;
    onRequestClick?: (isOpen: boolean) => any;
    setRequestStatus?: (status: number) => any;
    setOneShipmentInfo?: object;

    onRequestWithRadioClick?: (isOpen: boolean) => any;
    setOpenUpdateOrderModal?: (isOpen: boolean) => any;
    setMultiSelectionSelectedShipments?: any;
    isSelecting?: boolean;
    isSelected?: boolean;
}

const StyledDeliveryCard = styled(Box)(({ theme }: { theme: any }) => {
    return {
        width: "100%",
        height: "152px",
        padding: "16px",
        backgroundColor: "#FFF",
        borderRadius: 2,

        "&.selection-active": {
            position: "relative",
            "&:after": {
                content: "''",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                inset: 0,
                position: "absolute",
                backgroundColor: "transparent",
            },
        },
        "&.selected": {
            outline: "2px solid " + blue[300],
        },
    };
});

const DeliveryCard = (props: DeliveryCardProps) => {
    const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
    const userData = useStore((state: any) => state.userData);
    const [copied, setCopied] = useState(false);
    const [selected, setSelected] = useState(props.isSelected || false);
    let debouncedCopy = useDebouncedCallback(() => setCopied(false), 800);
    const copy_active = {
        background: `${lightGreen["300"]}!important`,
        color: "#FFF",
        border: "unset",
        "&:hover": {background: lightGreen["300"],},
        "& svg": {color: "#FFF"},
    };

    const shipmentRestInfoHandler = () => {
        typeof props.setOneShipmentInfo == "function" &&
        props.setOneShipmentInfo({...props.shipmentRestInfo});
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

    useEffect(() => {
        if (!props.isSelecting) {
            setSelected(false);
        }
    }, [props.isSelecting]);

    return (
        <StyledDeliveryCard className={classNames({ "selection-active": props.isSelecting, selected })}>
            <Stack height={"100%"} justifyContent="space-between">
                <Grid container>
                    <Grid item width={"100%"}>
                        <Grid container justifyContent={"space-between"}>
                            <Grid item>
                                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                                    <RAvatar size="44px" name={props.name} round style={{ fontFamily: "Montserrat-Arabic" }} maxInitials={1}></RAvatar>
                                    <Stack rowGap={"2px"}>
                                        <Typography variant="xs" color={grey[700]}>{props.name}</Typography>
                                        <Stack direction="row" gap="2px" alignItems="center" >
                                            <Typography variant="2xs" color={grey[400]}>{props.city}</Typography>
                                            {
                                                // @ts-ignore
                                                props.shipmentRestInfo?.recipient_loction !== "" && (
                                                <Box
                                                    component={"a"}
                                                    // @ts-ignore
                                                    href={props.shipmentRestInfo?.recipient_loction || ""}
                                                    target="_blank"
                                                    sx={{display: "flex", "&:hover svg": {transition: "all 0.3s", stroke: grey[200]},}}
                                                >
                                                    <Box component={"img"} src="/map-pin-filled.svg" height="14px" sx={{ stroke: grey[400] }}/>
                                                </Box>
                                            )}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </Grid>

                            <Grid item>
                                {(props.isSelecting && (
                                    <IconButton size={"small"} disableRipple disableTouchRipple>
                                        <CardActionArea
                                            sx={{
                                                color: blue[800],
                                                display: "inline",
                                                borderRadius: "4px",
                                            }}
                                            onClick={() => {
                                                setSelected(!selected);
                                                props.setMultiSelectionSelectedShipments((prev: any) => {
                                                    let foundShipmentIndex = [...prev].findIndex(
                                                        (v: any) => v.id == props.shipmentRestInfo?.id
                                                    );
                                                    // add selection
                                                    if (foundShipmentIndex > -1) {
                                                        // console.log("removed");
                                                        return [...prev].filter((v: any) => v.id != props.shipmentRestInfo?.id);
                                                    }
                                                    // remove selection
                                                    return [...prev, props.shipmentRestInfo];
                                                });
                                            }}
                                        >
                                            <Box
                                                component={"button"}
                                                sx={{
                                                    border: "none",
                                                    backgroundColor: selected ? blue[300] : "#F2F1F5",
                                                    cursor: "pointer",
                                                    borderRadius: "4px",
                                                    width: "19px",
                                                    height: "19px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    zIndex: 10,
                                                    position: "relative",
                                                }}
                                            >
                                                <div>
                                                    <Check size={13} strokeWidth="3" color={selected ? "#FFF" : "#D7D4E1"} />
                                                </div>
                                            </Box>
                                        </CardActionArea>
                                    </IconButton>
                                )) || (
                                    <IconButton size={"small"} {...bindTrigger(popupState)}>
                                        <MoreHorizontal color={grey[500]} size={18} />
                                    </IconButton>
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item></Grid>
                </Grid>

                <Grid container justifyContent={"space-between"} alignItems="center" sx={{ direction: "rtl" }}>
                    <Grid item>
                        <Box>
                            <Stack direction={"row"} alignItems="center" height={"100%"} columnGap={"4px"}>
                                <Tooltip title={copied ? "تم النسخ!" : "إضغط هنا للنسخ"} placement="top" arrow>
                                    <CardActionArea sx={{width: "auto", borderRadius: "50%", color: lightGreen[400],}}>
                                        <Box
                                            sx={
                                                {
                                                    width: "26px", height: "26px", display: "flex", alignItems: "center",
                                                    justifyContent: "center", border: "2px dashed", borderColor: grey[200],
                                                    borderRadius: "20px", cursor: "pointer", transition: "all 0.4s",
                                                    "& svg": {color: grey[400],},
                                                    "&:hover": {background: grey["50"],
                                                    "& svg": {/* color: "#FFF",*/},
                                                },
                                                ...(copied && copy_active),
                                            }}
                                            onClick={() => {setCopied(true); copyToClipoard(props.shipment_code);}}
                                            onMouseLeave={() => debouncedCopy()}
                                        >
                                          {(!copied && <Copy size={14} strokeWidth="2"></Copy>) || (<Check size={14} strokeWidth="2"></Check>)}
                                        </Box>
                                    </CardActionArea>
                                </Tooltip>
                                <Typography variant="sm" color={grey[500]}
                                    /* sx={{ "&:first-letter": { textTransform: "capitalize" } }}*/>
                                    {props.shipment_code}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item>
                        <Stack direction={"row"} alignItems="center" gap="4px">
                            {props.isCommercial && <img src="/box_starred.svg" height="18px" />}
                            <Chip size={"medium"} variant="filled" label={traking_status[props.status || 0]?.nameAr} color="info" customColor={traking_status[props.status || 0]?.color} rounded={"true"} dir="rtl"></Chip>
                        </Stack>
                    </Grid>
                </Grid>
            </Stack>

            <Menu {...bindMenu(popupState)}>
                {props.isSelecting !== undefined && props.isSelected !== undefined && (
                    <MenuItem
                        onClick={() => {
                            // shipmentRestInfoHandler();
                            setSelected(true);
                            props.setMultiSelectionSelectedShipments([props.shipmentRestInfo]);
                            popupState.close();
                        }}
                    >
                        <ListItemIcon>
                            <img src="multi-select.svg" width={16} height={16} />
                            {/* <BoxSelect size={18} strokeWidth={2} /> */}
                        </ListItemIcon>
                        تحديد الطرد
                    </MenuItem>
                )}

                <MenuItem
                    onClick={() => {
                        props.onshowDetailsClick();
                        typeof props.setOpenShowDetailDrawer == "function" && props.setOpenShowDetailDrawer(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon><List size={18} strokeWidth={2} /></ListItemIcon> عرض التفاصيل
                </MenuItem>

                {(props.status === 4) && (
                    <MenuItem
                        onClick={() => {
                            props.onshowDetailsClick();
                            typeof props.setOpenUpdateOrderModal == "function" && props.setOpenUpdateOrderModal(true);
                            popupState.close();
                        }}
                    >
                        <ListItemIcon><Edit size={18} strokeWidth={2} /></ListItemIcon>تعديل الطرد
                    </MenuItem>
                )}

                <Divider></Divider>

                <Link
                    href={{pathname: "/printer", query: {shipmentID: props?.shipment_id as any, bordereau: true, format: "pdf", extract: false}}}
                    passHref
                >
                    <a target="_blank">
                        <MenuItem>
                            <ListItemIcon><Printer size={18} strokeWidth={2} /></ListItemIcon>
                            طباعة الطرد
                        </MenuItem>
                    </a>
                </Link>


                {(props.status === 14) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestHandler(15);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>تأكيد طلب الارجاع
                        </MenuItem>
                    </>
                )}

                {(props.status === 19) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestHandler(20);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>تأكيد طلب الاستبدال
                        </MenuItem>
                    </>
                )}

                {(props.status === 26) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestHandler(27);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>تأكيد طلب التأجيل
                        </MenuItem>
                    </>
                )}

                {(props.status === 24) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestHandler(25);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>تأكيد طلب الالغاء
                        </MenuItem>
                    </>
                )}

                {(props.status === 4) && (
                    <>
                        <Divider/>
                        <MenuItem
                            onClick={() => {requestWithRadioHandler(29);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إجراء فشل التوصيل
                        </MenuItem>
                        <MenuItem onClick={() => {requestHandler(8);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إجراء تسليم للعميل
                        </MenuItem>
                    </>
                )}

                {(props.status === 29 || props.status === 32) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestHandler(8);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إجراء تسليم للعميل
                        </MenuItem>
                    </>
                )}

                {(props.status === 29) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestWithRadioHandler(32);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إجراء فشل التوصيل ثاني
                        </MenuItem>
                    </>
                )}

                {(props.status === 32) && (
                    <>
                        <Divider/>
                        <MenuItem onClick={() => {requestWithRadioHandler(15);}}>
                            <ListItemIcon><Slash size={18} strokeWidth={2} /></ListItemIcon>إجراء فشل التوصيل ثالث
                        </MenuItem>
                    </>
                )}
              {/*
                  <MenuItem>
                    <ListItemIcon><Edit size={18} strokeWidth={2} /></ListItemIcon>تعديل الطرد
                  </MenuItem>
                  <MenuItem>
                      <ListItemIcon><Trash2 size={18} strokeWidth={2} /></ListItemIcon>حذف الطرد
                  </MenuItem>
              */}

            </Menu>
        </StyledDeliveryCard>
    );
};

export default DeliveryCard;
