import {
  Avatar,
  Box,
  BoxProps,
  Button,
  CardActionArea,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { blue, green, grey, lightGreen } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { useState } from "react";
import Chip from "../Chip/Chip";
import {
  Hash,
  MoreHorizontal,
  Edit,
  List,
  Edit2,
  Trash2,
  Printer,
  Repeat,
  XOctagon,
  Slash,
  CornerUpLeft,
  Copy,
  Check,
} from "react-feather";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import Menu from "../Menu/Menu";
import traking_status from "../../utilities/data/tracking_status";
// import Menu from "../Menu/Menu";
import { default as RAvatar } from "react-avatar";
import useStore from "../../store/useStore";
import { useDebouncedCallback } from "use-debounce";
import { default as copyToClipoard } from "copy-to-clipboard";
import { AlertCircle, CheckCircle, ClipboardList, Phone } from "lucide-react";
import theme from "../../styles/theme";

interface CompanyCardProps extends BoxProps {
  shipment_id: string;

  name: string;
  city: string;
  status: number;
  shipment_code: string;
  shipmentRestInfo?: object;
  isCommercial?: boolean;
  onshowDetailsClick: () => any;
  setOpenShowDetailDrawer?: (isOpen: boolean) => any;
  onRequestClick?: (isOpen: boolean) => any;
  onRequestWithRadioClick?: (isOpen: boolean) => any;
  setRequestStatus?: (status: number) => any;
  setOneShipmentInfo?: object;
}

const StyledCompanyCard = styled(Box)(({ theme }: { theme: any }) => {
  return {
    width: "100%",
    height: "200px",
    padding: "16px",
    backgroundColor: "#FFF",
    borderRadius: 2,
  };
});

const CompanyCard = (props: CompanyCardProps) => {
  const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
  //   console.log(props.setOpenShowDetailDrawer);
  const userData = useStore((state: any) => state.userData);
  const [copied, setCopied] = useState(false);
  let debouncedCopy = useDebouncedCallback(() => setCopied(false), 800);
  const copy_active = {
    background: `${lightGreen["300"]}!important`,
    color: "#FFF",
    border: "unset",
    "&:hover": {
      background: lightGreen["300"],
    },
    "& svg": {
      color: "#FFF",
    },
  };

  const shipmentRestInfoHandler = () => {
    typeof props.setOneShipmentInfo == "function" &&
      props.setOneShipmentInfo({
        ...props.shipmentRestInfo,
      });
  };

  const requestHandler = (status: number) => {
    typeof props.setRequestStatus == "function" && props.setRequestStatus(status);
    typeof props.onRequestClick == "function" && props.onRequestClick(true);
    shipmentRestInfoHandler();
    popupState.close();
  };

  const requestWithRadioHandler = (status: number) => {
    typeof props.setRequestStatus == "function" && props.setRequestStatus(status);
    typeof props.onRequestWithRadioClick == "function" && props.onRequestWithRadioClick(true);
    shipmentRestInfoHandler();
    popupState.close();
  };

  return (
    <StyledCompanyCard>
      <Stack height={"100%"} justifyContent="space-between">
        <Grid container>
          <Grid item width={"100%"}>
            <Grid container justifyContent={"space-between"}>
              <Grid item>
                <Stack direction={"row"} columnGap={"10px"} alignItems="center">
                  {/* <Avatar
                    sizes="44px"
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#FFF",
                      color: "#CCC",
                      border: "1px solid #CCC",
                    }}
                    // src="https://i.pravatar.cc/150?img=32"
                  >
                    <Typography variant="xs">
                      {props.name[0].toUpperCase()}
                    </Typography>
                  </Avatar> */}
                  <RAvatar
                    size="44px"
                    // name={props.name}
                    src="/logo.png"
                    round={"2"}
                    style={{
                      fontFamily: "Montserrat-Arabic",
                      // outline: "1px solid " + grey[500],
                      background: "#FFF",
                      boxShadow: (theme as any)?.shadows?.[25]?.elevation3,
                    }}
                    maxInitials={1}
                  ></RAvatar>
                  <Stack rowGap={"2px"}>
                    <Typography variant="xs" color={grey[700]}>
                      spirit Express
                      {/* {props.name} */}
                    </Typography>
                    <Typography variant="2xs" color={grey[400]}>
                      الوادي
                      {/* {props.city} */}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item>
                <Stack direction="row" gap="3px">
                  <IconButton
                    size={"small"}
                    // {...bindTrigger(contactMenuPopupState)}
                    sx={{ width: "28px", height: "28px", background: "#EDF7EE" }}
                  >
                    <img src="/support1.png" width="15px" height="15px" />
                    {/* <Phone color={green[500]} size={13} /> */}
                  </IconButton>
                  <IconButton size={"small"} {...bindTrigger(popupState)}>
                    <MoreHorizontal color={grey[500]} size={18} />
                  </IconButton>
                </Stack>
              </Grid>
            </Grid>
          </Grid>
          <Grid item></Grid>
        </Grid>

        <Box
          sx={{
            borderTop: "1px solid " + grey[200],
            borderBottom: "1px solid " + grey[200],
            margin: "0 -16px",
            // padding: "10px 0",
          }}
        >
          <Grid
            container
            justifyContent={"space-between"}
            alignItems="center"
            sx={{ direction: "rtl" }}
            // spacing={1}
          >
            <Grid item xs>
              <Stack gap="6px" justifyContent="center" width="100%" sx={{ padding: "0 10px" }}>
                <Typography
                  variant="2xs"
                  sx={{ width: "100%", textAlign: "center", color: grey[500] }}
                >
                  عرض التفاصيل
                </Typography>
                <Typography
                  variant="xs"
                  sx={{ width: "100%", textAlign: "center", color: grey[700] }}
                >
                  18
                </Typography>
              </Stack>
            </Grid>
            <Grid item>
              <Box sx={{ height: "52px", borderLeft: "1px solid " + grey[200] }}></Box>
            </Grid>
            <Grid item xs>
              <Stack gap="6px" justifyContent="center" width="100%" sx={{ padding: "0 10px" }}>
                <Typography
                  variant="2xs"
                  sx={{ width: "100%", textAlign: "center", color: grey[500] }}
                >
                  الولايات المدعومة
                </Typography>
                <Typography
                  variant="xs"
                  sx={{ width: "100%", textAlign: "center", color: grey[700] }}
                >
                  18
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Grid
          container
          justifyContent={"space-between"}
          alignItems="center"
          sx={{ direction: "rtl" }}
          spacing={1}
        >
          <Grid item xs={6}>
            <Button
              sx={{ height: "36px", boxShadow: (theme as any)?.shadows?.[25]?.elevation2 }}
              variant="outlined"
              // @ts-ignore
              color="grey"
              fullWidth
            >
              <Stack direction="row" gap="6px" alignItems="center">
                <Typography variant="2xs" sx={{ width: "100%" }}>
                  عرض التفاصيل
                </Typography>
                <ClipboardList size="20px" strokeWidth={1.5} />
              </Stack>
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              sx={{
                height: "36px",
                boxShadow: (theme as any)?.shadows?.[25]?.elevation2,
                "&:hover": { boxShadow: (theme as any)?.shadows?.[25]?.elevation3 },
              }}
              variant="contained"
              color="primary"
              fullWidth
            >
              <Stack direction="row" gap="6px" alignItems="center">
                <Typography variant="2xs">طلب تعاون</Typography>
                <img src="/collaborate.png" width="20" height="20" alt="" />
                {/* <ClipboardList size="17" strokeWidth={1.5} /> */}
              </Stack>
            </Button>
          </Grid>
        </Grid>
      </Stack>

      <Menu {...bindMenu(popupState)}>
        <MenuItem
          onClick={() => {
            props.onshowDetailsClick();
            shipmentRestInfoHandler();
            typeof props.setOpenShowDetailDrawer == "function" &&
              props.setOpenShowDetailDrawer(true);
            popupState.close();
          }}
        >
          <ListItemIcon>
            <List size={18} strokeWidth={2} />
          </ListItemIcon>
          عرض التفاصيل
        </MenuItem>
        <Divider></Divider>

        <MenuItem
          onClick={() => {
            requestHandler(8);
          }}
        >
          <ListItemIcon>
            <CheckCircle size={18} strokeWidth={2} />
          </ListItemIcon>
          إجراء تم التوصيل
        </MenuItem>
        <MenuItem
          onClick={() => {
            requestWithRadioHandler(28);
          }}
        >
          <ListItemIcon>
            <Slash size={18} strokeWidth={2} />
          </ListItemIcon>
          إجراء فشل التوصيل
        </MenuItem>

        {/* <MenuItem>
          <ListItemIcon>
            <Edit size={18} strokeWidth={2} />
          </ListItemIcon>
          تعديل الشحنة
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Trash2 size={18} strokeWidth={2} />
          </ListItemIcon>
          حذف الشحنة
        </MenuItem> */}
      </Menu>
    </StyledCompanyCard>
  );
};

export default CompanyCard;
