import {Badge, Box, CardActionArea, ClickAwayListener, Container, Drawer, Grid, IconButton, Stack, Typography,} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Bell, Menu, Search as SearchIcon, Gift } from "react-feather";
import { useTheme, alpha, lighten } from "@mui/material/styles";

import { usePopupState, bindTrigger, bindPopover } from "material-ui-popup-state/hooks";
import Search from "../Input/Search";
import { Profile } from "./Profile";
import { SideBar } from "./SideBar";
import useStore from "../../store/useStore";
import { default as RAvatar } from "react-avatar";
import { useDebouncedCallback } from "use-debounce";
import {grey, green, deepOrange, yellow} from "@mui/material/colors";

interface Props {}

export const Header: React.FC<Props> = (props) => {
    const searchValue = useStore((state: any) => state.searchValue);
    const notifyCount = useStore((state: any) => state.notifyCount);
    const numPoints = useStore((state: any) => state.numPoints);
    const notificationData = useStore((state: any) => state.notificationData);
    const userData = useStore((state: any) => state.userData);

    console.log("numPoints ", numPoints)

    const [searchValueNotDebounced, setSearchValueNotDebounced] = useState("");
    const [isNotifyLimited, setIsNotifyLimited] = useState(true);
    const [openSearchbarResponsive, setOpenSearchbarResponsive] = useState(false);
    const [openFindScannerModal, setOpenFindScannerModal] = React.useState(false);
    const [openShipScannerModal, setOpenShipScannerModal] = React.useState(false);

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
                <Box
                    className="q-header"
                    bgcolor={"#FFF"}
                    sx={{
                        height: "64px",
                        position: "relative",
                        boxShadow: "0.2px 0px 3px 0.4px rgba(179, 185, 204, 0.18)"
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            height: "100%",
                            padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
                            display: openSearchbarResponsive ? "flex" : "none",
                            alignItems: "center",
                        }}
                    >
                        <Search
                            placeholder="بحث"
                            variant="outlined"
                            autoComplete="off"
                            value={searchValueNotDebounced}
                            onChange={(e: any) => {
                                debounced(e.target.value);
                                setSearchValueNotDebounced(e.target.value);
                            }}
                            onResetClick={() => {
                                useStore.setState({ searchValue: "" });
                                setSearchValueNotDebounced("");
                            }}
                            sx={{
                                display: { xs: "flex", sm: "none" },
                                width: { xs: "100%", md: "40%" },

                                left: 0,
                            }}
                            scannerFinder
                            onScannerFinderClick={() => setOpenFindScannerModal(true)}
                        />
                    </Box>

                    <Container
                        maxWidth="xl"
                        sx={{
                            padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
                            height: "100%",
                            display: openSearchbarResponsive ? "none" : "display",
                        }}
                    >
                        <Box className="q-container" height={"100%"}>
                            <Grid container justifyContent={"space-between"} alignItems={"center"} height={"100%"}>
                                <Grid item xs>
                                    <Stack direction={"row"} alignItems="center" spacing={{ xs: 1, md: 0 }}>
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
                                            onClick={() => {
                                                setOpenSearchbarResponsive(true);
                                                console.log("fffff");
                                            }}
                                        >
                                            <Box padding="6px">
                                                <SearchIcon size={24} color={searchValue ? "#FFF" : theme.palette.primary.main}/>
                                            </Box>
                                        </CardActionArea>

                                        {/* @ts-ignore */}
                                        <Search
                                            disabled
                                            placeholder="بحث"
                                            value={searchValueNotDebounced}
                                            autoComplete="off"
                                            onChange={(e: any) => {
                                                debounced(e.target.value);
                                                setSearchValueNotDebounced(e.target.value);
                                            }}
                                            onResetClick={() => {
                                                useStore.setState({ searchValue: "" });
                                                setSearchValueNotDebounced("");
                                            }}
                                            sx={{
                                                display: { xs: "none", sm: "flex" },
                                                width: { xs: "100%", md: "40%" },
                                            }}
                                            scannerFinder
                                            onScannerFinderClick={() => setOpenFindScannerModal(true)}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs>
                                    <Stack direction={"row-reverse"} alignItems="center" spacing={{ xs: 2, md: 3 }}>
                                        <IconButton size="small" {...bindTrigger(popupProfileState)}>
                                            <RAvatar size="42px" name={userData?.person?.first_name + " " + userData?.person?.last_name} round style={{ fontFamily: "Montserrat-Arabic" }} maxInitials={1}/>
                                        </IconButton>

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
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Container>
                </Box>
            </ClickAwayListener>

            <Profile
                fullname={userData?.person?.first_name + " " + userData?.person?.last_name}
                email={userData?.person?.email}
                clientId={userData?.person?.id}
                {...bindPopover(popupProfileState)}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            />

            <Drawer open={openDrawerNav} onClose={() => setOpenDrawerNav(false)}>
                <SideBar closeDrawer={() => setOpenDrawerNav(false)}></SideBar>
            </Drawer>

        </>
    );
};
