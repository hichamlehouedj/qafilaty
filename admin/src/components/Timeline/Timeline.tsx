import React, { FC } from "react";
import { MUIStyledCommonProps, styled } from "@mui/system";
import { default as MuiTimeline } from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineDot from "@mui/lab/TimelineDot";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import Button from "../Button";
import Chip from "../Chip/Chip";
import { css } from "@emotion/react";
import { TimelineProps } from "@mui/lab/Timeline/Timeline";
import { amber, blue, grey, lightGreen } from "@mui/material/colors";
import TimelineSeparator from "./TimelineSeperator";
import TimelineContent from "./TimelineContent";

export interface Props extends TimelineProps {}

const StyledTimeLine = styled(MuiTimeline)<Props>`
  padding: 0;
  margin: 0;
  & .MuiTimelineItem-root {
    &:before {
      padding: 0;
      flex: 0;
    }
    & .MuiTimelineContent-root {
      padding: 18px 16px;
    }
    & .MuiTimelineSeparator-root {
      & .MuiTimelineDot-root {
        width: 20px;
        height: 20px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${({ theme }: { theme: any }) =>
          theme.shadows[25].elevation3};
        & .innerCircle {
          width: 10px;
          height: 10px;
          background-color: #fff;
          border-radius: 50%;
          box-shadow: ${({ theme }: { theme: any }) =>
            theme.shadows[25].shadow1};
        }
      }

      & .MuiTimelineConnector-root {
        background-color: ${grey[300]};
      }
    }
    & .Timeline-card {
      box-sizing: "border-box";
      width: "auto";
      height: 128px;
      padding: 14px 18px;
      background-color: #fff;
      border-radius: 4px;
    }
  }
`;

export const Timeline: FC<Props> = (props) => {
  return (
    <StyledTimeLine {...(props as MUIStyledCommonProps)}>
      {props.children}
    </StyledTimeLine>
  );
};

export default Timeline;
