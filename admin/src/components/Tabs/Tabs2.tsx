import { Box, Tabs as MuiTabs, Tab as MuiTab, TabProps, Tab, Stack } from "@mui/material";
import { MUIStyledCommonProps, styled } from "@mui/system";
import React from "react";
import { alpha, emphasize, darken, lighten } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

export interface Props extends TabProps {}

const StyledTabs = styled(MuiTabs)(({ theme, color }: { theme: any; color?: any }) => {
  let lighterShade100: string = alpha(theme.palette[color || "primary"].main, 0.1);
  return {
    //   ...theme.typography["sm"],
    //   minHeight: "54px",
    //   "&.Mui-selected": {
    //     background: `linear-gradient(180deg, rgba(255, 255, 255, 0) -29.69%, ${lighterShade} 126.56%), #FFFFFF`,
    //   },
    "& .MuiTabs-flexContainer": {
      ...theme.typography["sm"],

      columnGap: 8,

      "& .MuiTab-root": {
        ...theme.typography["sm"],
        textTransform: "capitalize",
        borderRadius: 30,
        backgroundColor: "transparent",
        minHeight: "36px",
        minWidth: "auto",
        padding: "8px 14px",
        color: grey[500],
        transition: "all 0.4s",
        "& .Tab-label": {},
        "& .Tab-count": {
          ...theme.typography["3xs"],
          padding: "4px 6px",
          backgroundColor: grey[300],
          color: grey[500],
          borderRadius: 6,
        },
      },

      "& .MuiTab-root.Mui-selected": {
        ...theme.typography["sm"],
        borderRadius: 30,
        backgroundColor: lighterShade100,
        color: theme.palette[color || "primary"].main,
        minHeight: "36px",
        minWidth: "auto",
        padding: "8px 14px",

        "& .Tab-label": {},
        "& .Tab-count": {
          ...theme.typography["3xs"],
          fontWeight: 500,
          padding: "4px 6px",
          backgroundColor: theme.palette[color || "primary"].main,
          color: "#FFF",
          borderRadius: 6,
        },
      },
    },
    "& .MuiTabs-indicator": {
      display: "none",
    },
  };
});

const Tabs2 = (props: Props) => {
  return (
    <StyledTabs
      {...(props as MUIStyledCommonProps)}
      sx={{ maxWidth: { xs: "xs", sm: "600px", md: "900px", lg: "1200px", xl: "1200px" } }}
    >
      {props.children}
    </StyledTabs>
  );
};

export default Tabs2;
