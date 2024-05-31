import { Box, Stack } from "@mui/material";
import { BoxProps } from "@mui/system";
import React from "react";
import { Plus } from "react-feather";

interface Props extends BoxProps {}

const NavbarList = (props: Props) => {
  return (
    <Box
      className="Navbar-innerContent"
      sx={{
        background: "#FFF",
      }}
    >
      <Stack className="Navbar-list">{props.children}</Stack>
    </Box>
  );
};

export default NavbarList;
