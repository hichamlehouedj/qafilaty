import { Box, FormControlLabel, Grid, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import { useCreateRequest } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import theme from "../../styles/theme";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal, { Props as ModalProps } from "./Modal";

interface Props extends ModalProps {
  open: boolean;
  onClose?: (callback: () => any) => void;
  requestStatus?: number;
  oneShipmentInfo?: string;
}

const RequestWithRadioModal = (props: Props) => {
  const [createRequestMutation, { data: requestData }] = useCreateRequest();
  let userData = useStore((state: any) => state.userData);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [selectedReason, setselectedReason] = useState<{ index: number }>({ index: 0 });
  let [submitLoading, setSubmitLoading] = useState<boolean>(false);

  let {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();
  let onFormSubmit = ({ note }: any) => {
    setSubmitLoading(true);

    let stockID = createRequestMutation({
      variables: {
        content: {
          id_stock: userData?.person?.list_stock_accesses?.stock?.id,
          /* props.requestStatus !== 14
              ? userData?.stock_accesses?.[0]?.id_stock
              : (props?.oneShipmentInfo as any)?.lastTrace?.[0]?.stock.id, */
          id_person: userData?.person?.id,
          id_box: (props?.oneShipmentInfo as any)?.id,
          status: props.requestStatus,
          note: reasons[selectedReason?.index],
        },
      },
    })
      .then(() => {
        enqueueSnackbar("تم إرسال طلبك بنجاح", {
          variant: "success",
        });
        setSubmitLoading(false);
        closeHandler();
      })
      .catch(() => {
        setSubmitLoading(false);
        closeHandler();
      });
  };

  const closeHandler = () => {
    typeof props.onClose == "function" &&
      props.onClose(() => {
        reset({ note: "" });
      });

    setselectedReason({ index: 0 });
  };

  const reasons = [
    "هاتف المستلم مغلق او خارج الخدمة",
    "المستلم لايجيب على الهاتف",
    "رقم المستلم خاطئ",
    " المستلم غائب (يؤجل)",
    "المستلم غائب (يلغى)",
    "تم الالغاء من طرف المستلم",
    "الطلب مكرر",
    "المستلم لم يطلب الطرد",
    "المنتج غير صحيح",
    "المنتج ناقص",
    "المنتج تالف",
    "المستلم غير قادر على الدفع",
    "عنوان الولاية خاطئ",
    "عنوان البدية خاطئ",
    "عدم حظور المستلم",
  ];
  return (
    <Modal
      {...props}
      width="640px"
      footer={
        <>
          <Button
            startIcon={<X></X>}
            variant="outlined"
            color="primary"
            onClick={closeHandler as any}
          >
            إلغاء
          </Button>
          <Button
            loading={submitLoading}
            startIcon={<Check></Check>}
            variant="contained"
            color="primary"
            type="submit"
            form="add_request"
          >
            تأكيد
          </Button>
        </>
      }
    >
      <form id="add_request" onSubmit={handleSubmit(onFormSubmit)}>
        <Grid container>
          <Grid item xs={12}>
            <Stack rowGap={"16px"}>
              <Box>
                <Stack
                  direction="row"
                  width={"100%"}
                  // bgcolor="#CCC"
                  sx={{
                    borderBottom: "1px dashed #CCC",
                    padding: "8px 0px",
                  }}
                >
                  {/* <Typography variant="xs" color={grey[600]} paddingRight="28px"></Typography> */}
                  <Typography variant="xs" flex="1 0" color={grey[600]}>
                    ماهو سبب فشل التوصيل؟
                  </Typography>
                </Stack>
              </Box>
              <RadioGroup
                // aria-labelledby="demo-radio-buttons-group-label"

                defaultValue={0}
                onChange={(e, value: any) => {
                  // let selectedBuy: any = filteredData[value];
                  setselectedReason({
                    index: value,
                  });
                  // setBuyInputs({
                  //   quantity: selectedBuy?.quantity_remained,
                  //   lastQuantity: selectedBuy?.quantity_remained,
                  //   sellPrice: selectedBuy?.selling_price,
                  //   margin:
                  //     (selectedBuy?.selling_price - selectedBuy?.purchasing_price) *
                  //     selectedBuy?.quantity_remained,
                  // });
                }}
                name="radio-buttons-group"
              >
                <Stack gap={"8px"}>
                  {reasons?.map((reason: any, index: any) => (
                    <Stack key={index}>
                      {/* @ts-ignore */}
                      <label htmlFor={`radio-${index}`}>
                        <Box
                          bgcolor={"white"}
                          height={"42px"}
                          padding={"0 24px"}
                          borderRadius="2px"
                          sx={{
                            overflow: "hidden",
                            outlineColor: grey[600],
                            cursor: "pointer",
                            marginLeft: "6px",
                            marginRight: "6px",
                            transition: "all 0.08s",
                            // "&:hover": {
                            //   outline: "2px solid" + grey[600],
                            // },
                            ...(selectedReason.index == index && {
                              outline: "2px solid" + theme.palette.primary.main,
                              "&:hover": {
                                outline: "2px solid" + theme.palette.primary.main,
                              },
                            }),
                          }}
                        >
                          <Stack
                            direction="row"
                            width={"100%"}
                            height={"42px"}
                            alignItems="center"
                            // bgcolor="#CCC"
                            sx={{
                              background: "#FFF",
                              padding: "12px 0",
                            }}
                          >
                            <Typography variant="xs" color={grey[700]}>
                              <FormControlLabel
                                value={index}
                                control={
                                  <Radio
                                    required={true}
                                    id={`radio-${index}`}
                                    sx={{ padding: "0" }}
                                  />
                                }
                                label=""
                              />
                            </Typography>
                            <Typography variant="xs" flex="1 0" color={grey[700]}>
                              {/* {buy?.quantity_remained} */}
                              {reason}
                            </Typography>
                          </Stack>
                        </Box>
                      </label>
                    </Stack>
                  ))}
                </Stack>

                {/* <Box
                  display={(filteredData?.length && "none") as any}
                  sx={{
                    backgroundColor: "#FFF",
                    width: "100%",
                    margin: "0 auto",
                    textAlign: "center",
                    padding: "20px 0",
                    borderRadius: "2px",
                  }}
                >
                  <Stack gap="8px">
                    <img src="/empty2.svg" alt="empty" height="38px" />
                    <Typography variant="2xs" color={grey[500]}>
                      لايوجد مشتريات متاحة
                    </Typography>
                  </Stack>
                </Box> */}
              </RadioGroup>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};

export default RequestWithRadioModal;
