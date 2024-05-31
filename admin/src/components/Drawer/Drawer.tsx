import {
  Avatar,
  Divider,
  Drawer as MuiDrawer,
  drawerClasses,
  DrawerProps,
  IconButton,
  Stack,
  Tabs,
  Typography,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Box, styled } from "@mui/system";
import React, { MouseEventHandler, ReactNode } from "react";
import { X } from "react-feather";
import Tab from "../Tabs/Tab";
import { default as RAvatar } from "react-avatar";

export interface Props extends DrawerProps {
  title?: string;
  iconTitle?: ReactNode;
  width?: number | string;
  onCloseInside?: MouseEventHandler;
  fullname?: string;
  city?: string;
}

const StyledDrawer = styled(MuiDrawer)(({ theme, color }: { theme: any; color?: any }) => {
  return {
    [`& .${drawerClasses.paper}`]: {
      "& .Drawer-content": {
        height: "100%",
        "& .Drawer-title": {
          ...theme.typography["lg"],
          height: "68px",
          backgroundColor: "White",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          color: grey[800],
          flexShrink: 0,
          borderBottom: `1px solid ${grey[300]}`,
          "&--icon": {
            "& svg": {
              verticalAlign: "middle",
              width: 24,
              height: 24,
              marginLeft: "-2px",
            },
          },
        },

        "& .Drawer-close": {
          "& .MuiIconButton-root": {
            color: grey[800],
            "& svg": {
              verticalAlign: "middle",
              width: 22,
              height: 22,
            },
          },
        },
        "& .Drawer-innerContent": {
          ...theme.typography["sm"],
          flex: "1",
          backgroundColor: theme.palette?.background?.body,
          // padding: "16px 20px",
        },
      },
    },
  };
});

const Drawer = React.forwardRef(function Drawer(props: Props, ref) {
  return (
    <>
      <StyledDrawer
        ref={ref}
        {...(props as any)}
        elevation={10}
        // open={true}
        // variant="temporary"
      >
        <Box
          className="Drawer-content"
          sx={{
            /* minWidth: "470px", */ width: { xs: "100vw", sm: props.width },
          }}
          overflow="hidden"
        >
          <Box
            sx={{
              borderRadius: "6px",
              height: "100%",
            }}
          >
            <Stack height={"100%"}>
              <Box className="Drawer-title">
                <Stack direction="row" spacing={props.iconTitle ? "6px" : 0}>
                  {/* <div className="Drawer-title--icon">{props.iconTitle}</div>
                  <div className="Drawer-title--label">{props.title}</div>
                   */}

                  <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                    {/* <Avatar sizes="44px" sx={{ width: 40, height: 40 }} src="https://i.pravatar.cc/150?img=32"></Avatar> */}
                    <RAvatar
                      size="44px"
                      name={props.fullname}
                      round
                      style={{ fontFamily: "Montserrat-Arabic" }}
                      maxInitials={1}
                    ></RAvatar>
                    <Stack rowGap={"2px"}>
                      <Typography variant="xs" color={grey[800]}>
                        {props.fullname}
                      </Typography>
                      <Typography variant="2xs" color={grey[400]}>
                        {props.city}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <div className="Drawer-close">
                  <IconButton color="primary" aria-label="" onClick={props.onCloseInside}>
                    <X></X>
                  </IconButton>
                </div>
              </Box>

              <Box className="Drawer-innerContent">{props.children}</Box>
            </Stack>
          </Box>
        </Box>
      </StyledDrawer>
    </>
  );
});

export default Drawer;
