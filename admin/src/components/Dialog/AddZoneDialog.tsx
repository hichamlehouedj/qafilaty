import React from "react";
import Input from "../Input/Input";
import Dialog, { Props as DialogProps } from "./Dialog";
import { Button as MuiButton } from "@mui/material";
import { useCreateZone } from "../../graphql/hooks/shipments";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import { ALL_ZONES } from "../../graphql/hooks/shipments/useGetAllZones";

interface Props extends DialogProps {}

const AddZoneDialog = (props: Props) => {
  const [createZoneMutation, { data }] = useCreateZone();
  const userData = useStore((state: any) => state.userData);
  let {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm();

  const onFormSubmit = ({ zone_name }: any) => {
    createZoneMutation({
      variables: {
        content: {
          name: zone_name,
          cities: [],
          id_company: userData?.person?.company?.id,
        },
      },
      refetchQueries: [ALL_ZONES],
    });
    // @ts-ignore
    typeof props.onClose == "function" && props.onClose();
    reset();
  };

  return (
    <Dialog
      {...props}
      title="إضافة المنطقة"
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
        <Input placeholder="إسم المنطقة" sx={{ width: "320px" }} error={errors?.zone_name || false}{...register("zone_name", { required: true })}/>
      </form>
    </Dialog>
  );
};

export default AddZoneDialog;
