import { Tab as MuiTab, TabProps, Badge} from "@mui/material";
import { MUIStyledCommonProps, styled } from "@mui/system";
import React from "react";
import { alpha, lighten } from "@mui/material/styles";
import {grey, red} from "@mui/material/colors";

export interface Props extends TabProps {
    new?: boolean;
}

const StyledTab = styled(MuiTab)(
  ({ theme, color }: { theme: any; color?: any }) => {
    let lighterShade: string = alpha(
      lighten(theme.palette[color || "primary"].main, 0.75),
      0.2
    );
    return {
      ...theme.typography["sm"],
      textTransform: "capitalize",
      minHeight: "54px",
      "&.Mui-selected": {
        background: `linear-gradient(180deg, rgba(255, 255, 255, 0) -29.69%, ${lighterShade} 126.56%), #FFFFFF`,
      },
    };
  }
);

const Tab = (props: Props) => {
  return (
    <>
        {
            props.new
                ? <Badge badgeContent={"جديد"}
                     sx={{
                         ".MuiBadge-badge": {
                             background: red[700],
                             color: "#fff",
                             top: "10px",
                             right: "10px",
                             fontSize: "8px"
                         }
                     }}
                >
                    <StyledTab {...(props as MUIStyledCommonProps)}></StyledTab>
                </Badge>
                : <StyledTab {...(props as MUIStyledCommonProps)}></StyledTab>
            }
    </>
  );
};

export default Tab;
