import React from "react";
import Input from "../Input/Input";
import Dialog, { Props as DialogProps } from "./Dialog";
import { Button as MuiButton, Stack, Typography } from "@mui/material";
import { useUpdateZoneTransaction } from "../../graphql/hooks/shipments";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import { ALL_ZONES } from "../../graphql/hooks/shipments/useGetAllZones";
import { ALL_PRICING } from "../../graphql/hooks/shipments/useGetZoneTransaction";
import { grey } from "@mui/material/colors";

interface Props extends DialogProps {
  zoneID?: any;
  transactionData?: any;
}

const EditTransactionPricesDialog = (props: Props) => {
  const [editTransactionMutation, { data }] = useUpdateZoneTransaction();
  const userData = useStore((state: any) => state.userData);
  let {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const onFormSubmit = ({ house_price, office_price }: any) => {
    console.log(
      "🚀 ~ file: EditTransactionPricesDialog.tsx ~ line 36 ~ onFormSubmit ~ transactionData",
      props.transactionData
    );

    editTransactionMutation({
      variables: {
        content: {
          default_price_house: parseFloat(house_price),
          default_price_office: parseFloat(office_price),
        },
        updatePricingId: props?.transactionData?.id,
      },
      refetchQueries: () => [
        {
          query: ALL_PRICING,
          variables: {
            idZone: props?.zoneID,
          },
        },
      ],
    });
    // @ts-ignore
    typeof props.onClose == "function" && props.onClose();
    reset();
  };

  React.useEffect(() => {
    if (props.open)
      reset({
        house_price: props?.transactionData?.default_price_house,
        office_price: props?.transactionData?.default_price_office,
      });
  }, [props.open]);

  return (
    <Dialog
      {...props}
      title="  تعديل الأسعار"
      footer={
        <>
          <MuiButton
            onClick={() => {
              // @ts-ignore
              typeof props.onClose == "function" && props.onClose();
              reset();
            }}
          >
            إلغاء
          </MuiButton>
          <MuiButton form="form" type="submit" onClick={() => {}}>
            تأكيد
          </MuiButton>
        </>
      }
    >
      <form id="form" onSubmit={handleSubmit(onFormSubmit)}>
        <Stack gap="16px" padding={"2px 0"}>
          <Stack gap="6px" width="100%">
            <Typography variant="xs" color={grey[500]}>
              سعر التوصيل للمنزل:
            </Typography>
            <Input
              type="number"
              sx={{ width: "320px" }}
              fullWidth
              // placeholder="إسم الشركة"
              error={errors?.house_price}
              {...register("house_price", { required: true })}
            ></Input>
          </Stack>
          <Stack gap="6px" width="100%">
            <Typography variant="xs" color={grey[500]}>
              سعر التوصيل للمكتب:
            </Typography>
            <Input
              type="number"
              sx={{ width: "320px" }}
              fullWidth
              // placeholder="إسم الشركة"
              error={errors?.office_price}
              {...register("office_price", { required: true })}
            ></Input>
          </Stack>
        </Stack>
      </form>
    </Dialog>
  );
};

export default EditTransactionPricesDialog;
