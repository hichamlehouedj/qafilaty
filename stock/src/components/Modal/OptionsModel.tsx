import {Grid, Stack, Typography, Box, Collapse, IconButton, Tooltip, TooltipProps, ListItemIcon, MenuItem, Divider} from "@mui/material";
import React, {useEffect, useState} from "react";
import {green, grey, red} from "@mui/material/colors";
import theme from "../../styles/theme";
import { styled } from "@mui/system";
import { Minus, MoreHorizontal, Printer, FileText, Sheet } from "lucide-react";
import Link from "next/link";
import { bindMenu, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import ExtractAllPDF from "../PDFFormat/ExtractAllPDF";

interface Props {
    multiSelectionSelectedShipments: any;
    setMultiSelectionSelectedShipments: any;
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (<Tooltip {...props} classes={{ popper: className }} />))
    (({ theme }: { theme: any }) => ({
        [`& .tooltip`]: {
            backgroundColor: '#f5f5f9',
            color: 'rgba(0, 0, 0, 0.87)',
            maxWidth: 220,
            fontSize: theme.typography.pxToRem(12),
            border: '1px solid #dadde9',
        },
    }));


const OptionsModel = (props: Props) => {
    const popupState = usePopupState({ variant: "popover", popupId: "multiSelectMenu" });
    const [showReceiptIcon, setShowReceiptIcon] = React.useState(false);
    const [isReceiptFormatCollapsed, setIsReceiptFormatCollapsed] = React.useState(false);


    useEffect(() => {
        if (props.multiSelectionSelectedShipments.length > 0) {
            setShowReceiptIcon(checkAllBoxForClient(props.multiSelectionSelectedShipments))
        }
    }, [props.multiSelectionSelectedShipments]);


    const checkAllBoxForClient = (boxs: any) => {
        const idClientSelected = boxs?.[0]?.client?.id
        for (let index = 0; index < boxs.length; index++) {
            if(idClientSelected !== boxs?.[index]?.client?.id) {
                return false
            }
        }
        return true
    }

    return (
        <>
            <Grid item xs={12} sm="auto" sx={{position: "fixed", top: "65px", right: "calc(50% - 120px)", zIndex: 1}}>
                <Box sx={{
                    width: "270px", height: "44px", backgroundColor: "#FFF", padding: "0 14px",
                    borderRadius: "6px", boxShadow: (theme as any).shadows[25].shadow3,
                }}>
                    <Stack direction={"row"} height="100%" alignItems="center" justifyContent={"space-between"}>
                        <Stack direction={"row"} gap="8px" alignItems={"center"}>
                            <Box
                                onClick={() => props.setMultiSelectionSelectedShipments([])}
                                sx={{
                                    backgroundColor: theme.palette.primary.main, width: "17px", height: "17px",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    borderRadius: "2px", cursor: "pointer",
                                }}
                            >
                                <Minus size="13" strokeWidth={"3"} color="#FFF" />
                            </Box>
                            <Typography variant="xs" color={"#9790B1"}>
                                تم تحديد{" "}
                                <Typography variant="xs" color={theme.palette.primary.main}>
                                    {props.multiSelectionSelectedShipments.length}
                                </Typography>{" "}
                                طرد
                            </Typography>
                        </Stack>
                        <Stack direction={"row"} gap="0px" alignItems={"center"}>

                            <Link
                                href={{
                                    pathname: "/printer",
                                    query: {shipmentID: props.multiSelectionSelectedShipments.map((v: any) => v.id), bordereau: true, format: "pdf", extract: false},
                                }}
                                passHref
                            >
                                <a target="_blank">

                                    <HtmlTooltip title={"طباعة"}>
                                        <IconButton size={"small"}>
                                            <Printer color={grey[600]} size={17} />
                                        </IconButton>
                                    </HtmlTooltip>
                                </a>
                            </Link>

                            <Box sx={{ padding: "12px 0" }} {...bindTrigger(popupState)}>
                                <IconButton size={"small"} sx={{ "&:hover svg": { stroke: grey[500] } }}>
                                    <MoreHorizontal color={grey[600]} size={17} />
                                </IconButton>
                            </Box>
                        </Stack>
                    </Stack>
                </Box>
            </Grid>

            <Menu
                {...bindMenu(popupState)}
                anchorOrigin={{vertical: "bottom", horizontal: "center",}}
                transformOrigin={{vertical: "top", horizontal: "center",}}
            >
                {showReceiptIcon
                    ? <MenuItem onClick={() => setIsReceiptFormatCollapsed(!isReceiptFormatCollapsed)}>
                        <ListItemIcon>
                            <img src="/receipt.svg" width={17} height={17} />
                        </ListItemIcon>
                        <Box marginLeft={"-8px"}>إنشاء وصل إستلام</Box>
                    </MenuItem>
                    : <HtmlTooltip title={"قم بتحديد طرود خاصة بنفس العميل حتى تستطيع الطباعة"}>
                        <MenuItem>
                            <ListItemIcon><img src="/receipt.svg" width={17} height={17} /></ListItemIcon>
                            <Box marginLeft={"-8px"} color={"#d32f2f"}>إنشاء وصل إستلام</Box>
                        </MenuItem>
                    </HtmlTooltip>
                }

                <Collapse in={isReceiptFormatCollapsed} timeout="auto" unmountOnExit>
                    <Link
                        href={{
                            pathname: "/printer",
                            query: {shipmentID: props.multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "pdf", extract: false},
                        }}
                        passHref
                    >
                        <a target="_blank">
                            <MenuItem sx={{ backgroundColor: "#F2F1F5" }} onClick={() => popupState.close()}>
                                <ListItemIcon sx={{ marginLeft: "2px" }}>
                                    <FileText size={15} strokeWidth={2} />
                                </ListItemIcon>
                                <Box marginLeft={"-8px"} fontSize="12px">بصيغة PDF</Box>
                            </MenuItem>
                        </a>
                    </Link>
                    <Link
                        href={{
                            pathname: "/printer",
                            query: {shipmentID: props.multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "excel", extract: false},
                        }}
                        passHref
                    >
                        <a target="_blank">
                            <MenuItem sx={{ backgroundColor: "#F2F1F5" }} onClick={() => popupState.close()}>
                                <ListItemIcon sx={{ marginLeft: "2px" }}>
                                    <Sheet size={15} strokeWidth={2} />
                                </ListItemIcon>
                                <Box marginLeft={"-8px"} fontSize="12px">بصيغة Excel</Box>
                            </MenuItem>
                        </a>
                    </Link>
                </Collapse>

                <Divider/>
                <Link
                    href={{
                        pathname: "/printer",
                        query: {shipmentID: props.multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "pdf", extract: true},
                    }}
                    passHref
                >
                    <a target="_blank">
                        <MenuItem>
                            <ListItemIcon>
                                <FileText size={15} strokeWidth={2} />
                            </ListItemIcon>
                            <Box marginLeft={"-8px"}>استخراج الكل PDF</Box>
                        </MenuItem>
                    </a>
                </Link>

                <Link
                    href={{
                        pathname: "/printer",
                        query: {shipmentID: props.multiSelectionSelectedShipments.map((v: any) => v.id), receipt: true, format: "excel", extract: true},
                    }}
                    passHref
                >
                    <a target="_blank">
                        <MenuItem>
                            <ListItemIcon>
                                <Sheet size={15} strokeWidth={2} />
                            </ListItemIcon>
                            <Box marginLeft={"-8px"}>استخراج الكل Excel</Box>
                        </MenuItem>
                    </a>
                </Link>
            </Menu>
        </>
    );
};

export default OptionsModel;
