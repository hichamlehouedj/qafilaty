import { Box, Tab as MuiTab, TabProps, Tabs as MuiTabs } from "@mui/material";
import { MUIStyledCommonProps, styled } from "@mui/system";
import React from "react";
import { alpha, emphasize, darken, lighten } from "@mui/material/styles";

export interface Props extends TabProps {}

const StyledTab = styled(MuiTab)(({ theme, color }: { theme: any; color?: any }) => {
  let lighterShade: string = alpha(lighten(theme.palette[color || "primary"].main, 0.75), 0.2);
  return {
    ...theme.typography["sm"],
    textTransform: "capitalize",
    minHeight: "54px",
    "&.Mui-selected": {
      background: `linear-gradient(180deg, rgba(255, 255, 255, 0) -29.69%, ${lighterShade} 126.56%), #FFFFFF`,
    },
  };
});

const Tab = (props: Props) => {
  return <StyledTab {...(props as MUIStyledCommonProps)}></StyledTab>;
};

export default Tab;
