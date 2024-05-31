import {
  TimelineConnector,
  TimelineDot,
  TimelineSeparator as MuiTimelineSeparator,
  TimelineSeparatorProps,
} from "@mui/lab";
import { Box } from "@mui/material";
import React from "react";

interface Props extends TimelineSeparatorProps {
  customColor?: string;
}

const TimelineSeparator = (props: Props) => {
  return (
    <MuiTimelineSeparator>
      <TimelineDot
        {...(props as any)}
        style={{ backgroundColor: props.customColor }}
      >
        <Box className="innerCircle"></Box>
      </TimelineDot>
      <TimelineConnector />
    </MuiTimelineSeparator>
  );
};

export default TimelineSeparator;
