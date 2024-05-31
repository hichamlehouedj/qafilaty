import {
  Avatar,
  Box,
  BoxProps,
  Divider,
  outlinedInputClasses,
  Stack,
  StandardTextFieldProps,
  TextField,
  textFieldClasses,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { blueGrey, grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React from "react";
import { tracking_status } from "../../utilities/data";
import Chip from "../Chip/Chip";
import { default as RAvatar } from "react-avatar";
import { Hash } from "react-feather";
import dayjs from "dayjs";

export interface Props extends BoxProps {
  fullName?: string;
  note?: string;
  status?: number;
  date?: string;
  shipment_code?: string;
  bottomDivider?: boolean;
}

const StyledNotificationItem = styled(Box)(({ theme, color }: { theme: any; color?: any }) => {
  return {};
});

const NotificationItem = React.forwardRef(function Input(props: Props, ref) {
  return (
    <>
      <StyledNotificationItem {...(props as any)} ref={ref as any}>
        <Box
          sx={{
            // minheight: "96px",
            padding: "10px 16px",
          }}
        >
          <Stack direction={"row"} gap={"12px"} height="100%" flexShrink={0}>
            <RAvatar
              size="40px"
              name={props.fullName}
              round
              style={{ fontFamily: "Montserrat-Arabic" }}
              maxInitials={1}
            ></RAvatar>

            <Stack justifyContent="space-between" gap={"10px"} flex={1}>
              <Typography variant="xs">{props.fullName}</Typography>
              <Typography variant="2xs" color={grey[500]}>
                {props.note || "(لايوجد ملاحظة)"}
              </Typography>
              <Stack direction="row" alignItems={"center"} gap={"6px"}>
                <Chip
                  size="small"
                  label={tracking_status?.[props?.status as any]?.nameAr}
                  customColor={tracking_status?.[props?.status as any]?.color}
                  doted
                ></Chip>
                <Stack direction="row-reverse" gap={"2px"}>
                  <Hash color={grey[300]} size={12}></Hash>
                  <Typography variant="2xs" color={grey[600]}>
                    {props.shipment_code}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Typography variant="3xs" color={grey[600]}>
              {dayjs(props.date, "YYYY-MM-DDTHH:mm:ss.SSSZ").fromNow()}
              {/* {props.date} */}
            </Typography>
          </Stack>
        </Box>
        {props.bottomDivider && (
          <Divider sx={{ borderStyle: "dashed", borderWidth: "1", borderTopWidth: 0 }}></Divider>
        )}
      </StyledNotificationItem>
    </>
  );
});

export default NotificationItem;
