import {Alert, Divider, Grid, Stack, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal, { Props as ModalProps } from "./Modal";
import {useDriverCommission} from "../../graphql/hooks/shipments";
import {useSnackbar} from "notistack";
import {green, grey, red, deepPurple} from "@mui/material/colors";
import {ALL_DRIVER_BOXES_DELIVERED} from "../../graphql/hooks/shipments/useDeliveredDriverBox";

interface Props {
    open: boolean;
    onClose?: () => void;
    idDriver: string;
    salary: string;
    delivered?: object[];
    title?: string;
}

const DriverCommissionModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [driverCommission] = useDriverCommission();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    const [totalBox, setTotalBox] = useState(0)
    const [totalBoxNotAccounting, setTotalBoxNotAccounting] = useState(0)

    const [totalPriceDelivered, setTotalPriceDelivered] = useState(0)


    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        if (props.delivered != undefined) {
            let idBoxes: string[] = [];
            for (let i = 0; i < props.delivered.length; i++) {
                // @ts-ignore
                if (props.delivered[i]?.price_box > 0) {
                    // @ts-ignore
                    if (![8, 10].includes(props.delivered[i]?.lastTrace?.[0]?.status)) {
                        // @ts-ignore
                        idBoxes.push(
                            // @ts-ignore
                            props.delivered[i]?.id
                        )
                    }
                } else {
                    // @ts-ignore
                    if(props.delivered[i]?.lastTrace?.[0]?.status == 9) {
                        // @ts-ignore
                        idBoxes.push(
                            // @ts-ignore
                            props.delivered[i]?.id
                        )
                    }
                }
            }

            console.log("idBoxes ", idBoxes)

            if (idBoxes.length > 0) {
                driverCommission({
                    variables: {
                        idBoxes: idBoxes
                    },
                    refetchQueries: [ALL_DRIVER_BOXES_DELIVERED]
                })
                .then(() => {
                    enqueueSnackbar("لقد تمت الدفع بنجاح", {variant: "success", autoHideDuration: 5000});
                }).catch((error) => {
                    console.error(error)
                });
            } else {
                enqueueSnackbar("لا توجد اموال لدفعها", {variant: "error", autoHideDuration: 5000});
            }
        }
        setSubmitLoading(false);
        closeHandler();
    };

    useEffect(() => {
        if (props.delivered != undefined) {
            let deliveredBoxSalary = parseFloat(props?.salary || "0");
            let numberBoxes = 0;
            let numberBoxesNotAccounting = 0;

            for (let i = 0; i < props.delivered.length; i++) {
                // @ts-ignore
                if (props.delivered[i]?.price_box > 0) {
                    // @ts-ignore
                    if (![8, 10].includes(props.delivered[i]?.lastTrace?.[0]?.status)) numberBoxes++
                    else  numberBoxesNotAccounting++
                } else {
                    // @ts-ignore
                    if(props.delivered[i]?.lastTrace?.[0]?.status == 9) numberBoxes++
                    else  numberBoxesNotAccounting++

                }
            }

            setTotalBox(numberBoxes)
            setTotalBoxNotAccounting(numberBoxesNotAccounting)
            setTotalPriceDelivered( deliveredBoxSalary * numberBoxes)
        }
    }, [props.delivered, props.open])


    const closeHandler = () => {
        typeof props.onClose == "function" && props.onClose();
        reset({note: "" });
    };

    return (
        <Modal {...props} width="640px" title={props.title}
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_request">تأكيد</Button>
                   </>
               }
        >
            <form id="add_request" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container sm="auto" rowSpacing={3} columnSpacing={2} marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                    <Grid item xs={12} >
                        <Alert variant="outlined" severity="warning">
                            عنده
                            <Typography variant="sm" fontWeight={800} marginLeft={1} marginRight={1} >
                                {totalBoxNotAccounting}
                            </Typography>
                            طرود لم يتم استلام اموالها بعد لا يمكن دفع عمولة توصيلها
                        </Alert>
                    </Grid>
                    <Grid item xs={12}>
                        <Alert variant="outlined" severity="success" style={{borderColor: grey[400]}} icon={false}>
                            <Typography variant="2xs" color={grey[700]}>
                                 طرود نجح في توصيلها :
                                <Typography variant="sm" fontWeight={700} color={grey[700]}  marginLeft={0.5} marginRight={1} >
                                    {totalBox}
                                </Typography>
                            </Typography>
                            <Typography variant="2xs" color={grey[700]}>
                                سعر التوصيل الناجح لكل طرد :
                                <Typography variant="sm" fontWeight={700} color={grey[700]}  marginLeft={0.5} marginRight={1} >
                                    {`${parseFloat(props?.salary || "0")} دج`}
                                </Typography>
                            </Typography>
                        </Alert>
                    </Grid>

                    <Grid item xs={12} >
                        <Stack direction="column" spacing={2} style={{background: "#fff", height: "80px"}} justifyContent="center" alignItems={"center"}>
                            <Typography variant="xl" color={green[600]}>{`${totalPriceDelivered} دج`}</Typography>
                            <Typography variant="xs" color={grey[600]}>عمولة التوصيل الناجح</Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default DriverCommissionModal;
