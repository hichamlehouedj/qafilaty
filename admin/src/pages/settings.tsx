import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  Typography,
  Button as MuiButton,
  TextField as MuiInput,
  CardActionArea,
} from "@mui/material";
import { blue, grey, red } from "@mui/material/colors";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import useStore from "../store/useStore";
import { Check, Edit2, Minus, Percent, Plus, Settings as SettingsIcon, Trash2 } from "lucide-react";
import Input from "../components/Input/Input";
import Button from "../components/Button";
import {
  useDeleteStaticMessage,
  useGetAllStaticMessages,
  useGetCompanyInfo,
  useUpdateCompanyInfo,
} from "../graphql/hooks/shipments";
import { Controller, useForm, useWatch } from "react-hook-form";
import Select from "../components/Input/Select";
import algerian_provinces from "../utilities/data/api/algeria_provinces.json";
import Switch from "../components/Switch";
import Tab from "../components/Tabs/Tab";
import AddStaticMessageModal from "../components/Modal/AddStaticMessageModal";
import SwipeableViews from "react-swipeable-views";
import { styled } from "@mui/system";
import EditStaticMessageModal from "../components/Modal/EditStaticMessageModal";
import produce from "immer";
import { sortByRecentTime } from "../utilities/helpers/filters";
import { COMPANY } from "../graphql/hooks/shipments/useGetCompanyInfo";

interface Props {}

const Chart = dynamic(
  () => {
    return import("react-apexcharts");
  },
  { ssr: false }
);

// const PaperStyled = styled(() => <Paper elevation="0" />)

export const Settings = (props: Props) => {
  let userData = useStore((state: any) => state.userData);
  let [selectedMenu, setSelectedMenu] = useState(0);
  let [wilaya, setWilaya] = useState<number>(0);
  let [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(false);
  let [isCoverOptionAvailable, setIsCoverOptionAvailable] = useState(false);
  let [isPickUpOptionAvailable, setIsPickUpOptionAvailable] = useState(false);
  let [pickUpPlan, setPickUpPlan] = useState<any>([]);
  const [openAddStaticMsgModal, setOpenAddStaticMsgModal] = React.useState(false);
  const [openEditStaticMsgModal, setOpenEditStaticMsgModal] = React.useState(false);
  let [oneMessageInfo, setOneMessageInfo] = useState({});

  const [tabvalue, setTabvalue] = React.useState<number | string>(0);

  let theme = useTheme();
  let companyData = useGetCompanyInfo({
    companyID: userData?.person?.company?.id,
  });
  let [updateCompanyInfoMutation] = useUpdateCompanyInfo();
  let [deleteMessageMutation] = useDeleteStaticMessage();
  let staticMsgsData = useGetAllStaticMessages({
    companyID: userData?.person?.company?.id,
  });

  let {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  let watchers = useWatch({ control: control });

  let onFormSubmit = ({
    name,
    logo,
    phone01,
    phone02,
    email,
    url_site,
    city,
    address,
    TVA,
    plus_size,
    plus_tail,
    value_plus_size,
    value_plus_tail,
    return_price,
    change_price,
    defult_weight,
    defult_length,
    activation,
    encapsulation_price,
    encapsulation,
    pickup_price,
    pickup,
    price_in_state,
  }: any) => {
    updateCompanyInfoMutation({
      variables: {
        updateCompanyId: userData?.person?.company?.id,
        content: {
          name: name,
          logo: logo,
          phone01: phone01,
          phone02: phone02,
          email: email,
          url_site: url_site,
          city: wilaya.toString(),
          address: address,
          TVA: parseFloat(TVA),
          plus_size: parseFloat(plus_size),
          plus_tail: parseFloat(plus_tail),
          value_plus_size: parseFloat(value_plus_size),
          value_plus_tail: parseFloat(value_plus_tail),
          return_price: parseFloat(return_price),
          change_price: parseFloat(change_price),
          defult_weight: parseFloat(defult_weight),
          defult_length: parseFloat(defult_length),
          encapsulation_price: parseFloat(encapsulation_price),
          encapsulation: isCoverOptionAvailable,
          pickup_price: parseFloat(pickup_price),
          pickup: isPickUpOptionAvailable,
          price_in_state: parseFloat(price_in_state),

          activation: activation,
          pickUpPlanContent: pickUpPlan,
        },
      },
      refetchQueries: [COMPANY],

    }).then(() => {
      setIsSubmitButtonDisabled(true);
    });
  };

  // watchers

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: false });
    useStore.setState({ subPageTab: null });
  }, []);

  useEffect(() => {
    setIsSubmitButtonDisabled(false);
  }, [watchers, isCoverOptionAvailable, isPickUpOptionAvailable, pickUpPlan]);

  useEffect(() => {
    reset({
      name: companyData?.name,
      phone01: companyData?.phone01,
      phone02: companyData?.phone02,
      email: companyData?.email,
      url_site: companyData?.url_site,
      city: parseInt(companyData?.city),
      address: companyData?.address,
      TVA: companyData?.TVA,
      return_price: companyData?.return_price,
      change_price: companyData?.change_price,
      plus_size: companyData?.plus_size,
      plus_tail: companyData?.plus_tail,
      value_plus_size: companyData?.value_plus_size,
      value_plus_tail: companyData?.value_plus_tail,
      defult_weight: companyData?.defult_weight,
      defult_length: companyData?.defult_length,
      encapsulation_price: companyData?.encapsulation_price,
      encapsulation: companyData?.encapsulation,
      pickup_price: companyData?.pickup_price,
      pickup: companyData?.pickup,
      price_in_state: companyData?.price_in_state,
    });
    setWilaya(companyData?.city);
    setIsCoverOptionAvailable(companyData?.encapsulation);
    setIsPickUpOptionAvailable(companyData?.pickup);

    setPickUpPlan(
      sortByRecentTime(["createdAt"], companyData?.listPickUpPlan)
        ?.reverse()
        .map(({ number_box, price }: any) => ({ number_box, price }))
    );
  }, [companyData]);

  if (!companyData)
    return (
      <Container maxWidth="lg" sx={{ padding: { xs: "0 24px", lg: "0 16px" } }}>
        <Typography variant="sm" color={grey[800]}>
          loading...
        </Typography>
      </Container>
    );

  return (
    <>
      <Head>
        <title>Settings | Qafilaty</title>
        <title>إعدادات الشركة | قافلتي</title>
      </Head>
      <Container maxWidth="lg" sx={{ padding: { xs: "0 24px", lg: "0 16px" } }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Stack sx={{ borderRadius: "4px", overflow: "hidden" }}>
              <Stack
                alignItems="center"
                direction="row"
                sx={{
                  backgroundColor: "#FFF",
                  width: "100%",
                  height: "64px",
                  paddingLeft: "20px",
                  borderBottom: "1px solid " + grey[100],
                }}
              >
                <Stack direction="row" alignItems="center" gap={"8px"}>
                  <SettingsIcon color={grey[700]} />
                  <Typography variant="lg" color={grey[700]}>
                    إعدادات الأدمين
                  </Typography>
                </Stack>
              </Stack>
              <Box sx={{ backgroundColor: "#FFF" }}>
                <MenuList>
                  <MenuItem
                    selected={selectedMenu === 0}
                    onClick={() => setSelectedMenu(0)}
                    sx={{
                      height: "56px",
                      paddingLeft: "28px",
                      transition: "all 0.3s",
                      color: grey[700],
                      borderRight: "3px solid transparent",
                      ...(selectedMenu === 0 && {
                        // paddingLeft: "32px",
                        borderRight: "3px solid " + theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        background: `${alpha(theme.palette.primary.main, 0.12)} !important`,
                      }),
                    }}
                  >
                    <ListItemText>
                      <Typography variant="sm">معلومات الأدمين</Typography>
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    selected={selectedMenu === 1}
                    onClick={() => setSelectedMenu(1)}
                    sx={{
                      height: "56px",
                      paddingLeft: "28px",
                      transition: "all 0.3s",
                      color: grey[700],
                      borderRight: "3px solid transparent",
                      ...(selectedMenu === 1 && {
                        // paddingLeft: "32px",
                        color: theme.palette.primary.main,
                        borderRight: "3px solid " + theme.palette.primary.main,
                        background: `${alpha(theme.palette.primary.main, 0.12)} !important`,
                      }),
                    }}
                  >
                    <ListItemText>
                      <Typography variant="sm">العمولات والتسعيرات</Typography>
                    </ListItemText>
                  </MenuItem>

                  <MenuItem
                    selected={selectedMenu === 2}
                    onClick={() => setSelectedMenu(2)}
                    sx={{
                      height: "56px",
                      paddingLeft: "28px",
                      transition: "all 0.3s",
                      color: grey[700],
                      borderRight: "3px solid transparent",
                      ...(selectedMenu === 2 && {
                        // paddingLeft: "32px",
                        color: theme.palette.primary.main,
                        borderRight: "3px solid " + theme.palette.primary.main,
                        background: `${alpha(theme.palette.primary.main, 0.12)} !important`,
                      }),
                    }}
                  >
                    <ListItemText>
                      <Typography variant="sm">إعداد الرسائل</Typography>
                    </ListItemText>
                  </MenuItem>
                </MenuList>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={8}>
            <form id="update_company_info" onSubmit={handleSubmit(onFormSubmit)}>
              {/* menu page 1 */}
              <Stack
                display={selectedMenu == 0 ? "flex" : "none"}
                gap="32px"
                sx={{ backgroundColor: "#FFF", width: "100%", padding: "22px 24px" }}
              >
                {/* image & submit button */}
                <Stack direction="row">
                  <Stack
                    direction="row"
                    justifyContent={"space-between"}
                    alignItems="center"
                    width="100%"
                  >
                    <Stack direction="row" gap="12px" alignItems={"center"}>
                      <Box
                        sx={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          backgroundColor: "#F2F1F5",
                          boxSizing: "border-box",
                          border: "6px solid #FFF",
                          outline: "2px dashed #C3BFD2",
                        }}
                      ></Box>

                      <Typography
                        variant="xs"
                        color={grey[600]}
                        sx={{
                          textDecoration: "underline",
                        }}
                      >
                        تغيير الصورة
                      </Typography>
                    </Stack>
                    <Button
                      startIcon={<Check></Check>}
                      variant="contained"
                      color="primary"
                      type="submit"
                      form="update_company_info"
                      disabled={isSubmitButtonDisabled}
                    >
                      {!isSubmitButtonDisabled ? "حفظ التغييرات" : "تم الحفظ"}
                    </Button>
                  </Stack>
                </Stack>
                <Stack gap="24px">
                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        إسم الشركة:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        error={errors?.name}
                        {...register("name", { required: false })}
                      ></Input>
                    </Stack>
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        البريد الإلكتروني:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="email"
                        error={errors?.email}
                        {...register("email", { required: false })}
                      ></Input>
                    </Stack>
                  </Stack>
                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        رقم الهاتق الأول:{" "}
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        error={errors?.phone01}
                        {...register("phone01", { required: false })}
                      ></Input>
                    </Stack>
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        رقم الهاتق الثاني:{" "}
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        error={errors?.phone02}
                        {...register("phone02", { required: false })}
                      ></Input>
                    </Stack>
                  </Stack>
                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        الولاية:{" "}
                      </Typography>
                      <Select
                        error={errors?.city}
                        placeholder="إختر المدينة"
                        fullWidth
                        {...register("city", { required: false })}
                        value={wilaya}
                        onChange={(e: any, newVal: any) => {
                          setWilaya(e.target.value);
                        }}
                      >
                        {[...JSON.parse(JSON.stringify(algerian_provinces))].map(
                          (wilaya, index) => {
                            return (
                              <MenuItem value={wilaya.wilaya_code} key={index}>
                                {wilaya.wilaya_code} - {wilaya.wilaya_name}
                              </MenuItem>
                            );
                          }
                        )}
                      </Select>
                    </Stack>
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        العنوان:{" "}
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        error={errors?.address}
                        {...register("address", { required: false })}
                      ></Input>
                    </Stack>
                  </Stack>

                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        رابط الموقع:{" "}
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        error={errors?.url_site}
                        {...register("url_site", { required: false })}
                      ></Input>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              {/* menu page 2 */}
              <Stack
                display={selectedMenu == 1 ? "flex" : "none"}
                gap="32px"
                sx={{
                  backgroundColor: "#FFF",
                  width: "100%",
                  padding: "22px 24px",
                  height: "calc(100vh - 64px - 32px - 32px)",
                  marginBottom: "32px",
                  overflowY: "overlay",
                }}
              >
                <Stack gap="24px">
                  <Stack direction="row" gap="24px">
                    <Typography variant="base" color={grey[700]}>
                      العمولات
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        قيمة الضربية المضافة (TVA):
                      </Typography>
                      <Input
                        fullWidth
                        type="number"
                        // placeholder="إسم الشركة"
                        error={errors?.TVA}
                        {...register("TVA", { required: false })}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Percent size={18} />
                            </InputAdornment>
                          ),
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        عمولة الإرجاع:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.return_price}
                        {...register("return_price", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        عمولة الأستبدال:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.change_price}
                        {...register("change_price", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>
                  </Stack>
                </Stack>

                <Stack gap="24px">
                  {/* <Stack direction="row" gap="24px" width="100%"> */}
                  <Box sx={{ borderBottom: "1px solid " + grey[200], margin: "-6px 0" }}></Box>
                  {/* </Stack> */}
                  <Stack direction="row" gap="24px">
                    <Typography variant="base" color={grey[700]}>
                      التسعيرات
                    </Typography>
                  </Stack>
                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        الحد الأدنى لإحتساب الوزن:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.defult_weight}
                        {...register("defult_weight", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        قيمة الوزن:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.plus_size}
                        {...register("plus_size", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        سعر الوزن:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.value_plus_size}
                        {...register("value_plus_size", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>
                  </Stack>

                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        الحد الأدنى لإحتساب الابعاد:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.defult_length}
                        {...register("defult_length", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">متر</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        قيمة البعد:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.plus_tail}
                        {...register("plus_tail", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">متر</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        سعر البعد:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.value_plus_tail}
                        {...register("value_plus_tail", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>
                  </Stack>

                  <Stack direction="row" gap="24px">
                    <Stack gap="6px" width="100%">
                      <Typography variant="xs" color={grey[500]}>
                        سعر التوصيل داخل الولاية:
                      </Typography>
                      <Input
                        fullWidth
                        // placeholder="إسم الشركة"
                        type="number"
                        error={errors?.price_in_state}
                        {...register("price_in_state", { required: false })}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                        }}
                      ></Input>
                    </Stack>

                    <Stack gap="6px" width="100%"></Stack>

                    <Stack gap="6px" width="100%"></Stack>
                  </Stack>

                  <Stack direction="column" gap={isCoverOptionAvailable ? "24px" : 0}>
                    <Stack
                      gap="6px"
                      width="100%"
                      padding="10px 12px"
                      direction="row"
                      justifyContent={"space-between"}
                      alignItems="center"
                      border={"2px dashed " + grey[200]}
                      borderRadius="4px"
                    >
                      <Stack gap="3px">
                        <Typography variant="sm" color={grey[700]}>
                          إمكانية التغليف
                        </Typography>
                        <Typography variant="3xs" color={grey[500]}>
                          تفعيل إمكانية تغليف الشحنات
                        </Typography>
                      </Stack>
                      <Stack>
                        <Switch
                          checked={isCoverOptionAvailable}
                          onChange={() => setIsCoverOptionAvailable(!isCoverOptionAvailable)}
                        ></Switch>
                      </Stack>
                    </Stack>
                    <Stack direction="row" gap="24px" marginTop="-6px">
                      {isCoverOptionAvailable && (
                        <>
                          <Stack gap="6px" width="100%">
                            <Typography variant="xs" color={grey[500]}>
                              سعر التغليف:
                            </Typography>
                            <Input
                              fullWidth
                              // placeholder="إسم الشركة"
                              type="number"
                              error={errors?.encapsulation_price}
                              {...register("encapsulation_price", { required: false })}
                              InputProps={{
                                endAdornment: <InputAdornment position="end">د.ج</InputAdornment>,
                              }}
                            ></Input>
                          </Stack>
                          <Stack gap="6px" width="100%"></Stack>
                          <Stack gap="6px" width="100%"></Stack>
                        </>
                      )}
                    </Stack>
                  </Stack>

                  <Stack
                    direction="column"
                    gap={isPickUpOptionAvailable ? "24px" : 0}
                    marginTop="-4px"
                  >
                    <Stack
                      gap="6px"
                      width="100%"
                      padding="10px 12px"
                      direction="row"
                      justifyContent={"space-between"}
                      alignItems="center"
                      border={"2px dashed " + grey[200]}
                      // border={"2px dashed " + alpha(theme.palette.primary.main, 0.2)}
                      borderRadius="4px"
                    >
                      <Stack gap="3px">
                        <Typography variant="sm" color={grey[700]}>
                          إمكانية الـ pick-up
                        </Typography>
                        <Typography variant="3xs" color={grey[500]}>
                          تفعيل إمكانية طلب سائق لأخذ الشحنة ( يتم تسعير الشحنات على شكل خطط مسعرة )
                        </Typography>
                      </Stack>
                      <Stack>
                        <Switch
                          checked={isPickUpOptionAvailable}
                          onChange={() => setIsPickUpOptionAvailable(!isPickUpOptionAvailable)}
                        ></Switch>
                      </Stack>
                    </Stack>
                    <Stack direction="row" gap="24px">
                      {isPickUpOptionAvailable && (
                        <>
                          {/* table */}
                          <Stack gap="0" width="100%" marginTop="-6px">
                            {/* table header */}
                            <Grid
                              container
                              sx={{
                                backgroundColor: "#A8A2BE",
                                borderTopLeftRadius: "6px",
                                borderTopRightRadius: "6px",
                                padding: "12px",
                              }}
                            >
                              <Grid item xs={3}>
                                <Typography color={"#FFF"} variant="xs">
                                  رقم الخطة
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography color={"#FFF"} variant="xs">
                                  عدد الطرود
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography color={"#FFF"} variant="xs">
                                  سعر الخطة
                                </Typography>
                              </Grid>
                              <Grid item xs={3}>
                                <Typography color={"#FFF"} variant="xs"></Typography>
                              </Grid>
                            </Grid>
                            {/* table row */}
                            {pickUpPlan?.map((plan: any, i: number) => (
                              <Grid
                                key={i}
                                container
                                sx={{
                                  // backgroundColor: "#9790B1",
                                  // borderTopLeftRadius: "6px",
                                  // borderTopRightRadius: "6px",
                                  padding: "14px 12px",
                                }}
                              >
                                <Grid item xs={3} display="flex" alignItems="center">
                                  <Typography color={grey[600]} variant="2xs">
                                    خطة {i + 1}
                                  </Typography>
                                </Grid>
                                <Grid item xs={3} display="flex" alignItems="center">
                                  <Stack direction={"row"} alignItems="center" gap={"6px"}>
                                    <MuiButton
                                      sx={{
                                        width: "20px",
                                        height: "20px",
                                        minWidth: 0,
                                        borderRadius: "4px",
                                        border: "1px solid " + grey[300],
                                        background: "#FFF",
                                      }}
                                      onClick={(e) =>
                                        setPickUpPlan((prev: any) => {
                                          let newData = produce(prev, (draft: any) => {
                                            draft[i].number_box = draft[i]?.number_box + 1;
                                          });
                                          return newData;
                                        })
                                      }
                                    >
                                      <div>
                                        <Plus color={grey[600]} size="12" />
                                      </div>
                                    </MuiButton>
                                    <Typography color={grey[600]} variant="2xs">
                                      {plan?.number_box} طرد
                                    </Typography>
                                    <MuiButton
                                      sx={{
                                        width: "20px",
                                        height: "20px",
                                        minWidth: 0,
                                        borderRadius: "4px",
                                        border: "1px solid " + grey[300],
                                        background: "#FFF",
                                      }}
                                      onClick={(e) =>
                                        setPickUpPlan((prev: any) => {
                                          let newData = produce(prev, (draft: any) => {
                                            draft[i].number_box =
                                              draft[i]?.number_box > 1
                                                ? draft[i]?.number_box - 1
                                                : 1;
                                          });
                                          return newData;
                                        })
                                      }
                                    >
                                      <div>
                                        <Minus color={grey[600]} size="12" />
                                      </div>
                                    </MuiButton>
                                  </Stack>
                                </Grid>
                                <Grid item xs={3} display="flex" alignItems="center">
                                  <MuiInput
                                    type={"number"}
                                    sx={{ width: "90px" }}
                                    variant="standard"
                                    value={plan?.price}
                                    onChange={(e) => {
                                      setPickUpPlan((prev: any) => {
                                        let newData = produce(prev, (draft: any) => {
                                          draft[i].price = parseFloat(e.target.value);
                                        });
                                        return newData;
                                      });
                                    }}
                                    InputProps={{
                                      inputProps: { min: 0 },
                                      sx: { color: grey[700], fontSize: "12px !important" },
                                      endAdornment: (
                                        <InputAdornment position="end">
                                          {/* @ts-ignore */}
                                          <spn style={{ fontSize: "12px !important" }}>د.ج</spn>
                                        </InputAdornment>
                                      ),
                                    }}
                                  ></MuiInput>
                                </Grid>
                                <Grid item xs={3} display="flex">
                                  <Box marginLeft="auto">
                                    {/* {pickUpPlan.length != 0 && ( */}
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={(e) => {
                                        setPickUpPlan((prev: any) => {
                                          let newData = produce(prev, (draft: any) => {
                                            draft.splice(i, 1);
                                            return draft;
                                          });
                                          return newData;
                                        });
                                      }}
                                      disabled={pickUpPlan.length <= 1}
                                    >
                                      <Trash2
                                        size="16"
                                        color={pickUpPlan.length <= 1 ? grey[300] : red[300]}
                                      />
                                    </IconButton>
                                    {/* )} */}
                                  </Box>
                                  {/* <Typography color={grey[600]} variant="2xs"></Typography> */}
                                </Grid>
                              </Grid>
                            ))}

                            {/* table footer */}
                            <Grid
                              container
                              sx={{
                                backgroundColor: "#F7F7F7",
                                borderBottomLeftRadius: "6px",
                                borderBottomRightRadius: "6px",
                                // padding: "12px",
                              }}
                            >
                              <Grid item xs={12} display="flex">
                                <CardActionArea
                                  disableRipple
                                  onClick={(e) => {
                                    setPickUpPlan((prev: any) => [
                                      ...prev,
                                      { number_box: 1, price: 0 },
                                    ]);
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    justifyContent={"center"}
                                    gap="6px"
                                    width="100%"
                                    padding="12px"
                                  >
                                    <Plus size="16" strokeWidth={2} color={grey[700]} />
                                    <Typography color={grey[600]} variant="xs">
                                      إضافة خطة جديدة
                                    </Typography>
                                  </Stack>
                                </CardActionArea>
                              </Grid>
                            </Grid>
                          </Stack>
                          {/* <Stack gap="6px" width="100%"></Stack>
                          <Stack gap="6px" width="100%"></Stack> */}
                        </>
                      )}
                    </Stack>
                  </Stack>
                </Stack>

                {/* submit button */}
                <Stack direction="row">
                  <Stack
                    direction="row"
                    justifyContent={"flex-end"}
                    alignItems="center"
                    width="100%"
                  >
                    <Button
                      startIcon={<Check></Check>}
                      variant="contained"
                      color="primary"
                      type="submit"
                      form="update_company_info"
                      disabled={isSubmitButtonDisabled}
                    >
                      {!isSubmitButtonDisabled ? "حفظ التغييرات" : "تم الحفظ"}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
              {/* menu page 3 */}
              <Stack
                display={selectedMenu == 2 ? "flex" : "none"}
                gap="32px"
                sx={{
                  backgroundColor: "#FFF",
                  width: "100%",
                  padding: "22px 24px",
                  // height: "calc(100vh - 64px - 32px - 32px)",
                }}
              >
                <Stack direction="row">
                  <Stack
                    direction="row"
                    justifyContent={"space-between"}
                    alignItems="center"
                    width="100%"
                  >
                    <Stack sx={{ width: { xs: "384px" } }}>
                      <Box bgcolor="#FFF">
                        <Tabs
                          value={tabvalue}
                          onChange={(_, newVal) => setTabvalue(newVal)}
                          variant={"fullWidth"}
                          sx={{ height: "50px" }}
                        >
                          <Tab label="العميل" />
                          <Tab label="المستلم" />
                        </Tabs>
                        <Divider></Divider>
                      </Box>
                    </Stack>
                    <Button
                      startIcon={<Plus></Plus>}
                      variant="contained"
                      color="primary"
                      type="submit"
                      form="update_company_info"
                      onClick={() => setOpenAddStaticMsgModal(true)}
                      // disabled={isSubmitButtonDisabled}
                    >
                      {/* {!isSubmitButtonDisabled ? "حفظ التغييرات" : "تم الحفظ"} */}
                      إضافة رسالة
                    </Button>
                  </Stack>
                </Stack>
                <SwipeableViews
                  animateTransitions={false}
                  index={tabvalue as any}
                  onChangeIndex={(index) => {
                    setTabvalue(index);
                  }}
                  containerStyle={{ willChange: "unset" }}
                  // style={{ overflow: "visible" }}
                >
                  <Box
                    sx={{
                      direction: "ltr",
                      padding: "2px !important",
                      height: "auto !important",
                      // boxShadow: "0px 1px 2px -2px rgba(24, 39, 75, 0.1)",
                    }}
                  >
                    <Stack gap="24px">
                      <Stack direction="row" gap="24px">
                        <TableContainer component={Paper}>
                          <Table sx={{ width: "100%" }}>
                            <TableBody>
                              {staticMsgsData
                                ?.filter((msg: any) => msg.type == "client")
                                .map((msg: any, index: any) => (
                                  <TableRow key={index}>
                                    <TableCell component="th" scope="row" sx={{ padding: "13px" }}>
                                      <Typography variant="sm">{msg?.message}</Typography>
                                    </TableCell>

                                    <TableCell
                                      style={{ width: "100px" }}
                                      sx={{ padding: "13px" }}
                                      align="left"
                                    >
                                      <Stack direction="row" justifyContent={"flex-end"} gap="4px">
                                        <IconButton
                                          size="small"
                                          sx={{ padding: "6px" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenEditStaticMsgModal(true);
                                            setOneMessageInfo(msg);
                                          }}
                                        >
                                          <Edit2 size="15" color={grey[600]}></Edit2>
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          sx={{ padding: "6px", color: red[800] }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMessageMutation({
                                              variables: { deleteMessageId: msg?.id },
                                            });
                                            // setOneMessageInfo(msg)
                                          }}
                                        >
                                          <Trash2 size="15" color={red[400]}></Trash2>
                                        </IconButton>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Stack>
                  </Box>
                  <Box
                    sx={{
                      direction: "ltr",
                      padding: "2px !important",
                      height: "auto !important",
                      // boxShadow: "0px 1px 2px -2px rgba(24, 39, 75, 0.1)",
                    }}
                  >
                    <Stack gap="24px">
                      <Stack direction="row" gap="24px">
                        <TableContainer component={Paper}>
                          <Table sx={{ width: "100%" }}>
                            <TableBody>
                              {staticMsgsData
                                ?.filter((msg: any) => msg.type == "recipient")
                                .map((msg: any, index: any) => (
                                  <TableRow key={index}>
                                    <TableCell component="th" scope="row" sx={{ padding: "13px" }}>
                                      <Typography variant="sm">{msg?.message}</Typography>
                                    </TableCell>

                                    <TableCell
                                      style={{ width: "100px" }}
                                      sx={{ padding: "13px" }}
                                      align="left"
                                    >
                                      <Stack direction="row" justifyContent={"flex-end"} gap="4px">
                                        <IconButton
                                          size="small"
                                          sx={{ padding: "6px" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenEditStaticMsgModal(true);
                                            setOneMessageInfo(msg);
                                          }}
                                        >
                                          <Edit2 size="15" color={grey[600]}></Edit2>
                                        </IconButton>
                                        <IconButton
                                          size="small"
                                          sx={{ padding: "6px", color: red[500] }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteMessageMutation({
                                              variables: { deleteMessageId: msg?.id },
                                            });
                                            // setOneMessageInfo(msg)
                                          }}
                                        >
                                          <Trash2 size="15" color={red[400]}></Trash2>
                                        </IconButton>
                                      </Stack>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Stack>
                  </Box>
                </SwipeableViews>
              </Stack>
            </form>
          </Grid>
        </Grid>
      </Container>
      {/* @ts-ignore */}
      <AddStaticMessageModal
        title={tabvalue === 0 ? "إضافة رسالة للعميل" : "إضافة رسالة للمستلم"}
        activeTab={tabvalue}
        open={openAddStaticMsgModal}
        onClose={() => setOpenAddStaticMsgModal(false)}
      />
      {/* @ts-ignore */}
      <EditStaticMessageModal
        oneMessageInfo={oneMessageInfo}
        title={tabvalue === 0 ? "تعديل الرسالة للعميل" : "تعديل الرسالة للمستلم"}
        activeTab={tabvalue}
        open={openEditStaticMsgModal}
        onClose={() => setOpenEditStaticMsgModal(false)}
      />
    </>
  );
};

export default Settings;
