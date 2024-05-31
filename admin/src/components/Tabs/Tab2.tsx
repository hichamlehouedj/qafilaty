import { Box, Stack, Tab as MuiTab, TabProps, Tabs as MuiTabs } from "@mui/material";
import { MUIStyledCommonProps, styled } from "@mui/system";
import React from "react";
import { alpha, emphasize, darken, lighten } from "@mui/material/styles";

export interface Props extends TabProps {
  count?: number;
}

const StyledTab = styled(MuiTab)(({ theme, color }: { theme: any; color?: any }) => {
  // let lighterShade: string = alpha(
  //   lighten(theme.palette[color || "primary"].main, 0.75),
  //   0.2
  // );
  return {
    ...theme.typography["sm"],
  };
});

const Tab2 = (props: Props) => {
  return (
    <MuiTab
      {...props}
      label={
        <Stack direction="row" columnGap="4px" alignItems={"center"}>
          <Box className="Tab-label">{props.label}</Box>
          <Box className="Tab-count">{props.count}</Box>
        </Stack>
      }
    ></MuiTab>
  );
};

export default Tab2;
