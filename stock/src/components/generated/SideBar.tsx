import { Box } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC } from "react";
import { BarChart, Home, Briefcase, Users, Mail} from "react-feather";
import Navbar, { NavbarHeader, NavbarItem, NavbarList } from "../Navbar";

interface Props {
  closeDrawer?: () => any;
}

export const SideBar: FC<Props> = (props) => {
    let route = useRouter();

    return (
        <>
            <Box className="q-sidebar" sx={{ height: "100%" }}>
                <Navbar>
                    <NavbarHeader>
                        <Image src="/logo.png" width={45} height={40} alt="logo"></Image>
                    </NavbarHeader>

                    <NavbarList>
                        <NavbarItem title="الصفحة الرئيسية"
                            onClick={() => {route.push(`/`); if (typeof props.closeDrawer == "function") props.closeDrawer();}}
                            selected={route.pathname === `/`}
                        >
                            <Home/>
                        </NavbarItem>

                        <NavbarItem title="الاظرف المالية"
                                    onClick={() => { route.push(`/envelopes`); if (typeof props.closeDrawer == "function") props.closeDrawer();}}
                                    selected={route.pathname === `/envelopes`}
                        >
                            <Mail/>
                        </NavbarItem>

                        <NavbarItem title="الأحصائيات"
                            onClick={() => { route.push(`/statistics`); if (typeof props.closeDrawer == "function") props.closeDrawer();}}
                            selected={route.pathname === `/statistics`}
                        >
                            <BarChart/>
                        </NavbarItem>

                        <NavbarItem title="عملاء"
                            onClick={() => { route.push(`/clients`); if (typeof props.closeDrawer == "function") props.closeDrawer();}}
                            selected={route.pathname === `/clients`}
                        >
                            <Users/>
                        </NavbarItem>

                        <NavbarItem title="الموظفين"
                                    onClick={() => { route.push(`/employees`); if (typeof props.closeDrawer == "function") props.closeDrawer();}}
                                    selected={route.pathname === `/employees`}
                        >
                            <Briefcase/>
                        </NavbarItem>
                    </NavbarList>

                    {/* <NavbarFooter> <Info></Info> </NavbarFooter> */}
                </Navbar>
            </Box>
        </>
    );
};
