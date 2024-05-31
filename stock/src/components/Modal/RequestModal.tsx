import { Grid } from "@mui/material";
import { useSnackbar } from "notistack";
import React, {useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import { useCreateRequest, useCreateMultiTrace } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal, { Props as ModalProps } from "./Modal";

interface Props extends ModalProps {
    open: boolean;
    onClose?: (callback: () => any) => void;
    requestStatus?: number;
    oneShipmentInfo?: string;
}

const RequestModal = (props: Props) => {
    const [createRequestMutation, { data: requestData }] = useCreateMultiTrace();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);

    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        // @ts-ignore
        let res = props?.requestStatus == 8 && props?.oneShipmentInfo?.price_box > 0
                ? [
                    {
                        status: 8,
                        id_box: (props?.oneShipmentInfo as any)?.id,
                    },
                    {
                        // @ts-ignore
                        status: props?.oneShipmentInfo?.client?.person?.list_stock_accesses?.stock?.id === userData?.person?.list_stock_accesses?.stock?.id ? 12 : 11,
                        id_box: (props?.oneShipmentInfo as any)?.id,
                    },
                ]
                : [
                    {
                        status: props?.requestStatus,
                        id_box: (props?.oneShipmentInfo as any)?.id,
                    },
                ];

        createRequestMutation({
            variables: {
                content: {
                    boxTrace: res as any,
                    id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                    id_person: userData?.person?.id,
                    id_company: userData?.person?.company?.id,
                    // id_box: (props?.oneShipmentInfo as any)?.id,
                    // status: props.requestStatus,
                    note: note
                },
            },
        }).then(() => {
            enqueueSnackbar("تم إرسال طلبك بنجاح", {variant: "success"});
            closeHandler();
        }).catch(() => {
            closeHandler();
        });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        typeof props.onClose == "function" &&
        props.onClose(() => {
            reset({ note: "" });
        });
        setSubmitLoading(false);
    };

    return (
        <Modal {...props} width="640px"
            footer={
                <>
                    <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                    <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_request">تأكيد</Button>
                </>
            }
        >
            <form id="add_request" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container>
                    <Grid item xs={12}>
                        <TextArea placeholder="ملاحظة (إختياري)" fullWidth minRows={6} maxRows={12}{...register("note")} />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default RequestModal;
