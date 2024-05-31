import { TimelineItem } from "@mui/lab";
import { Avatar, Box, Divider, Stack, Tabs, Typography } from "@mui/material";
import { blue, green, grey, lightGreen, red } from "@mui/material/colors";
import React from "react";
import { Check, Hash, X } from "react-feather";
import SwipeableViews from "react-swipeable-views";
import priceFormatHelper from "../../utilities/helpers/priceFormatHelper";
import Chip from "../Chip/Chip";
import Tab from "../Tabs/Tab";
import Timeline from "../Timeline/Timeline";
import TimelineContent from "../Timeline/TimelineContent";
import TimelineSeparator from "../Timeline/TimelineSeperator";
import Drawer, { Props as DrawerProps } from "./Drawer";
import dayjs from "dayjs";
import { tracking_status } from "../../utilities/data";
import { default as RAvatar } from "react-avatar";

interface Props extends DrawerProps {
  detailsData: any;
  oneShipmentInfo?: object;
}

const DetailsDrawer = (props: Props) => {
  const { detailsData } = props;
  const [tabvalue, setTabvalue] = React.useState<number | string>(0);
  const tabshandler = (event: React.SyntheticEvent, newValue: number) => {
    setTabvalue(newValue as any);
  };

  return (
    <Drawer
      // @ts-ignore
      {...props}
      // transitionDuration={{ appear: 1000, exit: 3000 }}
    >
      <Box bgcolor="#FFF">
        <Tabs value={tabvalue} onChange={tabshandler} variant={"fullWidth"}>
          <Tab label="التقدم" />
          <Tab label="التفاصيل" />
        </Tabs>
        <Divider></Divider>
      </Box>
      <SwipeableViews
        index={tabvalue as any}
        onChangeIndex={(index) => {
          setTabvalue(index);
        }}
        containerStyle={{ willChange: "unset" }}
      >
        <Box
          padding={"20px"}
          style={{
            height: "calc(100vh - 55px - 68px)",
            overflowY: "auto" as any,
          }}
          sx={{ direction: "ltr" }}
        >
          <Timeline>
            {detailsData?.traceBox?.map((spot: any, index: any) => (
              <TimelineItem key={index}>
                <TimelineSeparator customColor={lightGreen[500]}></TimelineSeparator>
                <TimelineContent
                  customColor={tracking_status[spot.status].color}
                  name={`${spot.person?.first_name} ${spot.person?.last_name}`}
                  status={tracking_status[spot.status].nameAr}
                  reside={spot.stock?.name}
                  time={dayjs(spot?.createdAt, "DD/MM/YYYY HH:mm:ss").fromNow()}
                  note={spot.note}
                ></TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>

        <Box
          padding={"24px"}
          style={{ height: "calc(100vh - 55px - 68px)", overflowY: "auto" }}
          sx={{ direction: "ltr" }}
        >
          <Stack gap="20px">
            {/* Card 1 */}
            <Box padding="18px 20px" bgcolor={"#FFF"} borderRadius="4px">
              <Stack gap="18px">
                <Typography variant="base" color={grey[800]}>
                  تفاصيل عامة
                </Typography>
                <Stack
                  divider={
                    <Divider
                      style={{
                        borderColor: grey[300],
                        borderStyle: "dashed",
                      }}
                    ></Divider>
                  }
                >
                  <Box borderColor={grey[200]} padding="8px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        الحالة
                      </Typography>
                      <Typography variant="xs" color={grey[700]} component="div">
                        <Chip
                          rounded
                          size="small"
                          // label={detailsData?.lastTrace[0]?.status}
                          // customColor={blue[400]}
                          label={tracking_status[detailsData?.lastTrace[0]?.status].nameAr}
                          customColor={tracking_status[detailsData?.lastTrace[0]?.status].color}
                          style={{ padding: "12px 2px" }}
                        ></Chip>
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        الكود
                      </Typography>
                      <Typography variant="xs" color={grey[700]} component="div" dir="ltr">
                        <Stack
                          direction={"row"}
                          alignItems="center"
                          height={"100%"}
                          columnGap={"1px"}
                        >
                          <Hash strokeWidth={3} size={"12px"} color={grey[300]} />
                          <Typography variant="2xs" color={grey[500]}>
                            {detailsData?.code_box}
                          </Typography>
                        </Stack>
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        سهل الكسر
                      </Typography>
                      <Typography variant="xs" color={grey[700]} component="div">
                        {detailsData?.fragile ? (
                          <Check size={16} color={green[400]}></Check>
                        ) : (
                          <X size={16} color={red[400]}></X>
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        تجاري
                      </Typography>
                      <Typography variant="xs" color={grey[700]} component="div">
                        {detailsData?.price_box ? (
                          <Check size={16} color={green[400]}></Check>
                        ) : (
                          <X size={16} color={red[400]}></X>
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        توصيل مجاني
                      </Typography>
                      <Typography variant="xs" color={grey[700]} component="div">
                        {detailsData?.payment_type == "free" ? (
                          <Check size={16} color={green[400]}></Check>
                        ) : (
                          <X size={16} color={red[400]}></X>
                        )}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        سعر الشحنة
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {priceFormatHelper(detailsData?.price_box, "د.ج")}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        عمولة النقل
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {priceFormatHelper(detailsData?.price_delivery, "د.ج")}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        تاريخ الإنشاء
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div" dir="ltr">
                        {detailsData?.createdAt}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
            {/* Card 2 */}
            <Box padding="18px 20px" bgcolor={"#FFF"} borderRadius="4px">
              <Stack gap="18px">
                <Typography variant="base" color={grey[800]}>
                  معلومات المستلم
                </Typography>
                <Stack
                  divider={
                    <Divider
                      style={{
                        borderColor: grey[300],
                        borderStyle: "dashed",
                      }}
                    ></Divider>
                  }
                >
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        الإسم
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        <Stack direction={"row"} columnGap={"6px"} alignItems="center">
                          <RAvatar
                            size="18px"
                            name={props.fullname}
                            round
                            style={{ fontFamily: "Montserrat-Arabic" }}
                            maxInitials={1}
                          ></RAvatar>
                          <Typography variant="2xs" color={grey[700]}>
                            {detailsData?.recipient_name}
                          </Typography>
                        </Stack>
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        رقم الهاتف
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.recipient_phone1}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        المدينة
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.recipient_city}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        العنوان
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.recipient_address}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
            {/* Card 3 */}
            <Box padding="18px 20px" bgcolor={"#FFF"} borderRadius="4px">
              <Stack gap="18px">
                <Typography variant="base" color={grey[800]}>
                  تفاصيل الشحنة
                </Typography>
                <Stack
                  divider={
                    <Divider
                      style={{
                        borderColor: grey[300],
                        borderStyle: "dashed",
                      }}
                    ></Divider>
                  }
                >
                  {/* next row */}

                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        رقم الطلب
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.command_number}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        التصنيف
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.categorie}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        الابعاد
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div" dir="ltr">
                        {detailsData?.width_box} x {detailsData?.height_box} x{" "}
                        {detailsData?.length_box} cm
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        الوزن
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div" dir="ltr">
                        {detailsData?.weight_box} kg
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        نوع التوصيل
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.delivery_type == "office" ? "الى المكتب" : "الى باب المنزل"}
                      </Typography>
                    </Stack>
                  </Box>
                  {/* next row */}
                  <Box borderColor={grey[200]} padding="12px 0">
                    <Stack direction={"row"} justifyContent="space-between" alignItems={"center"}>
                      <Typography variant="xs" color={grey[500]}>
                        ملاحظة
                      </Typography>
                      <Typography variant="2xs" color={grey[700]} component="div">
                        {detailsData?.note}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </SwipeableViews>
    </Drawer>
  );
};

export default DetailsDrawer;
