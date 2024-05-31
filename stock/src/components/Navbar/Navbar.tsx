import { Box, BoxProps, CardActionArea, Stack } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { Home, Plus } from "react-feather";
import { alpha } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
export interface Props extends BoxProps {}

let StyledNavbar = styled(Box)(
  ({ theme, color }: { theme: any; color?: any }) => {
    return {
      backgroundColor: "white",
      "& .Navbar-content": {
        width: "100%",
        height: "100%",
        // border: "1px solid #EEE",
        // navbar header
        "& .Navbar-header": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
          //   backgroundColor: "blue",
        },

        // navbar content
        "& .Navbar-innerContent": {
          flex: "1 1",
          display: "flex",
          justifyContent: "center",
          alignitems: "center",
          paddingTop: "20px",
          borderRight: "1px solid #ddd",

          "& .Navbar-list": {
            rowGap: "16px",
          },

          "& .List-item": {
            "&--innerItem": {
              display: "flex",
              width: "42px",
              height: "42px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 8,
              overflow: "hidden",
              "& svg": {
                width: "26px",
                height: "26px",
              },
            },

            "& .MuiCardActionArea-root": {
              color: grey[500],
              width: "auto",
              borderRadius: 4,
              transition: "all 0.2s ease",
            },
            "&:hover .MuiCardActionArea-root": {
              backgroundColor: grey[50],
              color: grey[500],
              width: "auto",
              boxShadow: theme.shadows[25].shadow1,
            },

            "&.selected .MuiCardActionArea-root": {
              color: theme.palette.primary.light,
              width: "auto",
              // boxShadow: theme.shadows[25].shadow1,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              "& svg": {
                color: theme.palette.primary.main,
              },
            },
            "&.selected:hover .MuiCardActionArea-root": {
              boxShadow: "none",
            },
          },
        },

        // navbar footer
        "& .Navbar-footer": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          //   backgroundColor: "green",
        },
      },
    };
  }
);

const Navbar = (props: Props) => {
  return (
    <StyledNavbar width={72} height={"100vh"}>
      <Stack className="Navbar-content">{props.children}</Stack>
    </StyledNavbar>
  );
};

export default Navbar;
