import { Grid } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import {
  useCreateRequest,
  useCreateStaticMessage,
  useEditStaticMessage,
} from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal, { Props as ModalProps } from "./Modal";

interface Props extends ModalProps {
  open: boolean;
  onClose?: (callback: () => any) => void;
  requestStatus?: number;
  oneShipmentInfo?: string;
  activeTab?: any;
  oneMessageInfo?: any;
}

const EditStaticMessageModal = (props: Props) => {
  const [editStaticMessageMutation, { data: staticMsgData }] = useEditStaticMessage();
  let userData = useStore((state: any) => state.userData);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
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

    editStaticMessageMutation({
      variables: {
        updateMessageId: props.oneMessageInfo?.id,
        content: {
          type: props.activeTab === 0 ? "client" : "recipient",
          message: note,
          id_company: userData?.person?.company?.id,
        },
      },
    })
      .then(() => {
        enqueueSnackbar("تم حذف الرسالة بنجاح", {
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
  };

  React.useEffect(() => {
    if (props.open) {
      reset({ note: props.oneMessageInfo?.message });
    }
  }, [props.open]);

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
            <TextArea
              placeholder=" إدخل رسالة هنا"
              fullWidth
              minRows={6}
              maxRows={12}
              {...register("note")}
            ></TextArea>
          </Grid>
        </Grid>
      </form>
    </Modal>
  );
};

export default EditStaticMessageModal;
