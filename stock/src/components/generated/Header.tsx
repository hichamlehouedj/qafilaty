import {Badge, Box, CardActionArea, ClickAwayListener, Container, Drawer, Grid, IconButton, Stack, ListItemIcon, Menu as MuiMenu, MenuItem, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Bell, Menu, Camera, Search as SearchIcon, Gift } from "react-feather";
import { useTheme, alpha, lighten  } from "@mui/material/styles";
import { usePopupState, bindTrigger, bindMenu, bindPopover } from "material-ui-popup-state/hooks";
import Search from "../Input/Search";
import Notification from "../Notification/Notification";
import { Profile } from "./Profile";
import { SideBar } from "./SideBar";
import useStore from "../../store/useStore";
import { default as RAvatar } from "react-avatar";
import { useDebouncedCallback } from "use-debounce";
import NotificationItem from "../Notification/NotificationItem";
import { ArrowDown, ScanLine, Keyboard } from "lucide-react";
import {grey, green, deepOrange, yellow} from "@mui/material/colors";

import FindScannerModal from "../Modal/FindScannerModal";
import ShipScannerModal from "../Modal/ShipScannerModal";
import ShipPhyisicalScannerModal from "../Modal/ShipPhisicalScannerModal";
import ChangeTraceManualModal from "../Modal/ChangeTraceManualModal";

interface Props {}

export const Header: React.FC<Props> = (props) => {
    const searchValue = useStore((state: any) => state.searchValue);
    const notifyCount = useStore((state: any) => state.notifyCount);
    const numPoints = useStore((state: any) => state.numPoints);
    const notificationData = useStore((state: any) => state.notificationData);
    const userData = useStore((state: any) => state.userData);
    const popupState = usePopupState({ variant: "popover", popupId: "scannerMenu" });

    const [searchValueNotDebounced, setSearchValueNotDebounced] = useState("");
    const [isNotifyLimited, setIsNotifyLimited] = useState(true);
    const [openSearchbarResponsive, setOpenSearchbarResponsive] = useState(false);
    const [openFindScannerModal, setOpenFindScannerModal] = React.useState(false);
    const [openShipScannerModal, setOpenShipScannerModal] = React.useState(false);
    const [openShipPhisicalScannerModal, setOpenShipPhisicalScannerModal] = React.useState(false);

    const [openDrawerNav, setOpenDrawerNav] = useState(false);
    let theme = useTheme();
    const popupNotificationState = usePopupState({
        variant: "popover",
        popupId: "notificationPopover",
    });

    const popupProfileState = usePopupState({
        variant: "popover",
        popupId: "profilePopover",
    });

    let debounced = useDebouncedCallback((value) => {
        console.log("🚀 ~ file: Header.tsx ~ line 48 ~ debounced ~ value", value);
        useStore.setState({ searchValue: value });
    }, 400);

    useEffect(() => {
        setSearchValueNotDebounced(searchValue);
    }, [searchValue]);

    return (
        <>
            <ClickAwayListener disableReactTree onClickAway={() => setOpenSearchbarResponsive(false)}>
                <Box className="q-header" bgcolor={"#FFF"} borderBottom={"1px solid #ddd"} sx={{ height: "64px", position: "relative" }}>
                    <Box
                        sx={{
                            width: "100%", height: "100%", alignItems: "center",
                            padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
                            display: openSearchbarResponsive ? "flex" : "none",
                        }}
                    >
                        <Search
                            placeholder="بحث" variant="outlined" autoComplete="off" value={searchValueNotDebounced}
                            onChange={(e: any) => {debounced(e.target.value); setSearchValueNotDebounced(e.target.value);}}
                            onResetClick={() => {useStore.setState({ searchValue: "" }); setSearchValueNotDebounced("");}}
                            sx={{display: { xs: "flex", sm: "none" }, width: { xs: "100%", md: "40%" }, left: 0,}}
                            scannerFinder
                            onScannerFinderClick={() => setOpenFindScannerModal(false)}
                        ></Search>
                    </Box>

                    <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%", display: openSearchbarResponsive ? "none" : "display"}}>
                        <Box className="q-container" height={"100%"}>
                            <Grid container justifyContent={"space-between"} alignItems={"center"} height={"100%"}>
                                <Grid item xs>
                                    <Stack
                                        direction={"row"}
                                        alignItems="center"
                                        // columnGap={"24px"}
                                        // sx={{columnGap: {xs: ''}}}
                                        spacing={{ xs: 1, md: 0 }}
                                    >
                                        <CardActionArea
                                            sx={{
                                                width: "auto",
                                                color: theme.palette.primary.dark,
                                                borderRadius: 1,
                                                display: { xs: "block", sm: "none" },
                                            }}
                                        >
                                            <Box padding="6px" onClick={() => setOpenDrawerNav(true)}>
                                                <Menu size={24} color={theme.palette.primary.main}></Menu>
                                            </Box>
                                        </CardActionArea>

                                        <CardActionArea
                                            sx={{
                                                width: "auto",
                                                color: theme.palette.primary.dark,
                                                borderRadius: 1,
                                                display: { xs: "block", sm: "none" },
                                                backgroundColor: searchValue ? theme.palette.primary.main : "",
                                            }}
                                            onClick={() => {setOpenSearchbarResponsive(true)}}
                                        >
                                            <Box padding="6px">
                                                <SearchIcon size={24} color={searchValue ? "#FFF" : theme.palette.primary.main}></SearchIcon>
                                            </Box>
                                        </CardActionArea>

                                        {/* @ts-ignore */}
                                        <Search placeholder="بحث" value={searchValueNotDebounced} autoComplete="off"
                                            onChange={(e: any) => {debounced(e.target.value);setSearchValueNotDebounced(e.target.value);}}
                                            onResetClick={() => {useStore.setState({ searchValue: "" });setSearchValueNotDebounced("");}}
                                            sx={{
                                                display: { xs: "none", sm: "flex" },
                                                width: { xs: "100%", md: "40%" },
                                            }}
                                            scannerFinder
                                            onScannerFinderClick={() => setOpenFindScannerModal(false)}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs>
                                    <Stack direction={"row-reverse"} alignItems="center" spacing={{ xs: 2, md: 3 }}>
                                        <IconButton size="small" {...bindTrigger(popupProfileState)}>
                                            <RAvatar
                                                size="42px" round style={{ fontFamily: "Montserrat-Arabic" }} maxInitials={1}
                                                name={userData?.person?.first_name + " " + userData?.person?.first_name}
                                            ></RAvatar>
                                        </IconButton>
                                        {/* Notification */}
                                        <Box height={44} display="flex" alignItems={"center"} {...bindTrigger(popupNotificationState)}>
                                            <CardActionArea onClick={() => {useStore.setState({ notifyCount: 0 });}}>
                                                <Box width={32} height={32} bgcolor={alpha(theme.palette.primary.main, 0.1)} borderRadius={1} display="flex" alignItems={"center"} justifyContent={"center"}>
                                                    <Badge badgeContent={notifyCount} color="primary" sx={{ direction: "rtl" }} anchorOrigin={{vertical: "top", horizontal: "left",}} >
                                                        <Bell size={18} strokeWidth="3" color={theme.palette.primary.main}></Bell>
                                                    </Badge>
                                                </Box>
                                            </CardActionArea>
                                        </Box>

                                        {/* Points */}
                                        <Box height={44} display="flex" alignItems={"center"}>
                                            <Box
                                                width={50}
                                                height={32}
                                                bgcolor={
                                                    lighten(numPoints <= 0 ? deepOrange["A400"] :
                                                        numPoints <= 50 ? yellow["800"] : green["A400"], 0.9)
                                                }
                                                borderRadius={1}
                                                display="flex"
                                                alignItems={"center"}
                                                justifyContent={"center"}
                                            >
                                                <Typography variant="sm"
                                                    color={
                                                        numPoints <= 0 ? deepOrange["A400"] :
                                                            numPoints <= 50 ? yellow["800"] : green["A400"]
                                                    }
                                                    marginRight={"5px"}
                                                >{numPoints}</Typography>
                                                <Gift size={14} strokeWidth="2" color={
                                                    numPoints <= 0 ? deepOrange["A400"] :
                                                        numPoints <= 50 ? yellow["800"] : green["A400"]
                                                }/>
                                            </Box>
                                        </Box>

                                        {/* scanner */}
                                        <Box height={44} display="flex" alignItems={"center"}
                                                // onClick={() => setOpenShipScannerModal(true)}
                                             {...bindTrigger(popupState)}
                                        >
                                            <CardActionArea onClick={() => useStore.setState({ notifyCount: 0 }) } >
                                                <Box width={32} height={32} borderRadius={1} display="flex" alignItems={"center"} justifyContent={"center"}
                                                    bgcolor={alpha(theme.palette.primary.main, 0.1)}
                                                >
                                                    <ArrowDown size={18} strokeWidth="3" color={theme.palette.primary.main}/>
                                                </Box>
                                            </CardActionArea>
                                        </Box>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                </Box>
            </ClickAwayListener>

            <Box>
                <Notification
                    isOpen={popupNotificationState.isOpen}
                    onMaximize={(maximizeStatus: boolean) => {
                        setIsNotifyLimited(maximizeStatus);
                    }}
                    anchorOrigin={{vertical: "bottom", horizontal: "center",}}
                    transformOrigin={{vertical: "top", horizontal: "center",}}
                    {...bindPopover(popupNotificationState)}
                >
                    {notificationData?.slice(0, isNotifyLimited ? 5 : notificationData.length)
                        .map((notification: any, index: any) => (
                            <NotificationItem
                                key={index}
                                fullName={`${notification?.box?.client?.person?.first_name} ${notification?.box?.client?.person?.last_name}`}
                                note={notification?.note}
                                status={notification?.status}
                                date={notification?.createdAt}
                                shipment_code={notification?.box?.code_box}
                                bottomDivider
                            ></NotificationItem>
                        ))
                    }
                </Notification>
            </Box>

            <Profile
                fullname={userData?.person?.first_name + " " + userData?.person?.first_name}
                email={userData?.person?.email}
                clientId={userData?.person?.id}
                {...bindPopover(popupProfileState)}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                transformOrigin={{vertical: "top", horizontal: "center"}}
            ></Profile>

            <Drawer open={openDrawerNav} onClose={() => setOpenDrawerNav(false)}>
                <SideBar closeDrawer={() => setOpenDrawerNav(false)}></SideBar>
            </Drawer>

            {/* @ts-ignore */}
            <FindScannerModal
                open={false}
                onClose={() => setOpenFindScannerModal(false)}
            />

            {/* @ts-ignore */}
            <ShipPhyisicalScannerModal
                open={openShipPhisicalScannerModal}
                onClose={() => setOpenShipPhisicalScannerModal(false)}
            />

            {/* @ts-ignore */}
            <ChangeTraceManualModal
                open={openShipScannerModal}
                onClose={() => setOpenShipScannerModal(false)}
            />

            {/* @ts-ignore */}
            {/*<ShipScannerModal*/}
            {/*    open={openShipScannerModal}*/}
            {/*    onClose={() => setOpenShipScannerModal(false)}*/}
            {/*/>*/}

            <MuiMenu
                {...bindMenu(popupState)}
                anchorOrigin={{vertical: "bottom", horizontal: "center",}}
                transformOrigin={{vertical: "top", horizontal: "center"}}
                elevation={2}
            >
                <MenuItem
                    sx={{ paddingTop: "10px", paddingBottom: "10px" }}
                    onClick={() => {
                        setOpenShipScannerModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon>
                        <Keyboard size={18} strokeWidth={2} />
                    </ListItemIcon>
                    إستخدام الادخال اليدوي
                </MenuItem>

                <MenuItem
                    sx={{ paddingTop: "10px", paddingBottom: "10px" }}
                    onClick={() => {
                        setOpenShipPhisicalScannerModal(true);
                        popupState.close();
                    }}
                >
                    <ListItemIcon>
                        <ScanLine size={18} strokeWidth={2} />
                    </ListItemIcon>
                    إستخدام الماسح
                </MenuItem>
            </MuiMenu>
        </>
    );
}