import { Box } from "@mui/material";
import { BoxProps } from "@mui/system";
import React from "react";

interface Props extends BoxProps {}

const NavbarHeader = (props: Props) => {
  return (
    <Box {...props} className="Navbar-header" height="64px">
      {props.children}
    </Box>
  );
};

export default NavbarHeader;
