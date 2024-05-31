import React from "react";
import Input from "../Input/Input";
import Dialog, { Props as DialogProps } from "./Dialog";
import { Button as MuiButton } from "@mui/material";
import { useUpdateZone } from "../../graphql/hooks/shipments";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import { ALL_ZONES } from "../../graphql/hooks/shipments/useGetAllZones";

interface Props extends DialogProps {
  zoneData?: any;
}

const EditZoneDialog = (props: Props) => {
  const [editZoneMutation, { data }] = useUpdateZone();
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
    editZoneMutation({
      variables: {
        content: {
          name: zone_name,
          cities: props?.zoneData?.cities,
          id_company: userData?.person?.company?.id,
        },
        updateZoneId: props?.zoneData?.id,
      },
      refetchQueries: [ALL_ZONES],
    });
    // @ts-ignore
    typeof props.onClose == "function" && props.onClose();
    reset();
  };

  React.useEffect(() => {
    if (props.open) reset({ zone_name: props?.zoneData?.name });
  }, [props.open]);

  return (
    <Dialog
      {...props}
      title="تعديل المنطقة"
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
        <Input
          placeholder="إسم المنطقة"
          // onChange={(e) => {}}
          sx={{ width: "320px" }}
          error={errors?.zone_name}
          {...register("zone_name", { required: true })}
        ></Input>
      </form>
    </Dialog>
  );
};

export default EditZoneDialog;
