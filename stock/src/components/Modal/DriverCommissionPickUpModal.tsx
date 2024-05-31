import {Alert, Grid, Stack, Typography, Divider} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import Modal, { Props as ModalProps } from "./Modal";
import {useDriverCommissionPickUp} from "../../graphql/hooks/shipments";
import {useSnackbar} from "notistack";
import {green, grey, red, deepPurple} from "@mui/material/colors";
import {ALL_DRIVER_BOXES_PICKEDUP} from "../../graphql/hooks/shipments/usePickedDriverBox";
import MoneyDriverCard from "../generated/MoneyDriverCard";
import {array} from "yup";

interface Props {
    open: boolean;
    onClose?: () => void;
    idDriver: string;
    salary: string;
    delivered?: object[];
    title?: string;
}

const DriverCommissionPickUpModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [driverCommissionPickUp] = useDriverCommissionPickUp();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    const [totalBox, setTotalBox] = useState(0)
    const [totalPricePickUp, setTotalPricePickUp] = useState(0)
    const [groupedPaidPickedUp, setGroupedPaidPickedUp] = useState<object>({})


    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        if (props.delivered != undefined) {
            let idBoxes: string[] = [];
            for (let i = 0; i < props.delivered.length; i++) {
                // @ts-ignore
                idBoxes.push(
                    // @ts-ignore
                    props.delivered[i]?.id
                )
            }

            if (idBoxes.length > 0) {
                driverCommissionPickUp({
                    variables: {
                        idBoxes: idBoxes
                    },
                    refetchQueries: [ALL_DRIVER_BOXES_PICKEDUP]
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
            let PricePickUp = 0;

            setTotalBox(props.delivered.length)
            props.delivered.map((box: any) => {
                PricePickUp += box?.price_pick_up
            })

            setTotalPricePickUp(PricePickUp)

        }
    }, [props.delivered, props.open])

    useEffect(() => {
        if (props.delivered != undefined) {
            setGroupedPaidPickedUp(groupByKey(props.delivered, "code_pick_up"))
        }
    }, [props.delivered, props.open])


    function groupByKey(array: object[], key: string) {
        return array.reduce((hash: object, obj: object) => {
            // @ts-ignore
            if(obj[key] === undefined) return hash;
            return Object.assign(hash, {
                // @ts-ignore
                [obj[key]]: ( hash[obj[key]] || [] ).concat(obj)
            })
        }, {})
    }

    const closeHandler = () => {
        typeof props.onClose == "function" && props.onClose();
        reset({note: "" });
    };

    const pricePickUp = (list: object[]) => {
        let price = 0
        list.map((box: any, index: number) => {
            price += box?.price_pick_up
        })
        return price
    }

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

                    <Grid item xs={12} sm={12} md={12} lg={12} marginBottom={"-24px"}>
                        <Stack direction="row" spacing={0} style={{background: "#fff", height: "40px"}} justifyContent="center" alignItems={"center"} padding={"10px 20px"}>
                            <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>كود الرحلة</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>عدد الطرود</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>كلفة الالتقاط</Typography>
                        </Stack>
                    </Grid>

                    {groupedPaidPickedUp != undefined && Object.keys(groupedPaidPickedUp).length > 0 && (
                        Object.keys(groupedPaidPickedUp).map((key: any, index: any) => {
                            return (
                                <Grid item xs={12} sm={12} md={12} lg={12} key={index}>
                                    <Stack direction="row" spacing={0} style={{background: "#fff", height: "50px"}} justifyContent="center" alignItems={"center"} padding={"10px 20px"}>
                                        <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>{key}</Typography>
                                        <Divider orientation="vertical" flexItem />
                                        <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>{
                                            // @ts-ignore
                                            groupedPaidPickedUp?.[key].length
                                        }</Typography>
                                        <Divider orientation="vertical" flexItem />
                                        <Typography flex={1} variant="sm" color={grey[600]} textAlign={"center"}>{
                                            // @ts-ignore
                                            `${pricePickUp(groupedPaidPickedUp[key])} دج`
                                        }</Typography>
                                    </Stack>
                                </Grid>
                            );
                        })
                    )}

                    <Grid item xs={12} sm={12} md={12} lg={12} marginTop={"-20px"}>
                        <Stack direction="row" spacing={0} style={{background: "#7d749eb5", height: "40px"}} justifyContent="center" alignItems={"center"} padding={"10px 20px"}>
                            <Typography flex={1} variant="sm" color={"#fff"} textAlign={"center"}>المجموع</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography flex={1} variant="sm" color={"#fff"} textAlign={"center"}>{props.delivered?.length}</Typography>
                            <Divider orientation="vertical" flexItem />
                            <Typography flex={1} variant="sm" color={"#fff"} textAlign={"center"}>{`${totalPricePickUp} دج`}</Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default DriverCommissionPickUpModal;
