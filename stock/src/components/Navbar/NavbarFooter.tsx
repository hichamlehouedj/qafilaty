import { Box } from "@mui/material";
import { BoxProps } from "@mui/system";
import React from "react";
import { Plus } from "react-feather";

interface Props extends BoxProps {}

const NavbarFooter = (props: Props) => {
  return (
    <Box {...props} className="Navbar-header" height="64px">
      {props.children}
    </Box>
  );
};

export default NavbarFooter;
