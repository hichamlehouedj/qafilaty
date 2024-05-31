import {
  TimelineConnector,
  TimelineContent as MUITimelineContent,
  TimelineContentProps,
  TimelineDot,
  TimelineSeparator as MuiTimelineSeparator,
  TimelineSeparatorProps,
} from "@mui/lab";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import React from "react";
import Chip from "../Chip/Chip";

interface Props extends TimelineContentProps {
  customColor?: string;
  status: string;
  time: string;
  note?: string;
  name: string;
  reside: string;
}

const TimelineContent = (props: Props) => {
  return (
    <MUITimelineContent>
      <Box className="Timeline-card">
        <Stack className="Timeline-innercontent" height="100%">
          <Stack
            className="card-header"
            direction={"row"}
            justifyContent="space-between"
          >
            <Chip
              size="medium"
              label={props.status}
              customColor={props.customColor}
            ></Chip>
            <Typography variant="3xs" color={grey[600]} marginTop="2px">
              {props.time}
            </Typography>
          </Stack>
          <Typography
            variant="2xs"
            className="card-comment"
            flex="1"
            color={grey[400]}
            display="flex"
            alignItems="center"
            marginLeft={"8px"}
          >
            {props.note}
          </Typography>
          <Stack
            direction={"row"}
            className="card-footer"
            gap="10px"
            alignItems="center"
            marginLeft={"8px"}
          >
            <Typography variant="2xs" color={blue[400]}>
              {props.reside}
            </Typography>
            <Divider
              orientation="vertical"
              style={{
                borderRadius: 4,
                borderRightWidth: 2,
                borderLeftWidth: 0,
              }}
            ></Divider>
            <Stack direction="row" gap="6px" alignItems={"center"}>
              <Avatar
                sx={{ width: 24, height: 24 }}
                src="https://i.pravatar.cc/150?img=4"
              ></Avatar>
              <Typography variant="2xs" color={grey[500]}>
                {props.name}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </MUITimelineContent>
  );
};

export default TimelineContent;
