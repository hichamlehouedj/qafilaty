import { Box } from "@mui/material";
import { Flag, Map, Settings, Home, Wallet, Gift } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC } from "react";
import Navbar, { NavbarHeader, NavbarItem, NavbarList } from "../Navbar";

interface Props {
    closeDrawer?: () => any;
}

export const SideBar: FC<Props> = (props) => {
    let route = useRouter();
    return (
        <>
            <Box className="q-sidebar" sx={{ height: "100%", backgroundColor: "#FFF" }}>
                <Navbar>
                    <NavbarHeader flexShrink={0}>
                        <Image src="/logo.svg" width={45} height={40} alt="logo" />
                    </NavbarHeader>
                    <NavbarList>
                        <NavbarItem
                            title="المكاتب"
                            selected={route.pathname === "/stocks"}
                            onClick={() => {
                                route.push("/stocks");
                                if (typeof props.closeDrawer == "function") props.closeDrawer();
                            }}
                        >
                            <Home />
                        </NavbarItem>

                        <NavbarItem
                            title="توزيع الولايات"
                            selected={route.pathname === "/"}
                            onClick={() => {
                                route.push("/");
                                if (typeof props.closeDrawer == "function") props.closeDrawer();
                            }}
                        >
                            <Map />
                        </NavbarItem>

                        {/*<NavbarItem*/}
                        {/*    title="الباقات"*/}
                        {/*    selected={route.pathname === "/plans"}*/}
                        {/*    onClick={() => {*/}
                        {/*        route.push("/plans");*/}
                        {/*        if (typeof props.closeDrawer == "function") props.closeDrawer();*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    <Gift />*/}
                        {/*</NavbarItem>*/}

                        <NavbarItem
                            title="النقاط"
                            selected={route.pathname === "/points"}
                            onClick={() => {
                                route.push("/points");
                                if (typeof props.closeDrawer == "function") props.closeDrawer();
                            }}
                        >
                            <Wallet />
                        </NavbarItem>

                        {/* <NavbarItem
                          title="الشركات"
                          selected={route.pathname === "/companies"}
                          onClick={() => {
                            route.push("/companies");
                            if (typeof props.closeDrawer == "function") props.closeDrawer();
                          }}
                        >
                          <Building />
                        </NavbarItem> */}

                        <NavbarItem
                            title="إعدادات الشركة"
                            selected={route.pathname === "/settings"}
                            onClick={() => {
                                route.push("/settings");
                                if (typeof props.closeDrawer == "function") props.closeDrawer();
                            }}
                        >
                            <Settings />
                        </NavbarItem>
                    </NavbarList>
                </Navbar>
            </Box>
        </>
    );
};
