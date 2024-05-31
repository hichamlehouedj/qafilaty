import { Grid, Stack, Box, Typography, FormControlLabel,  Radio, RadioGroup } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import theme from "../../styles/theme";
import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import {useUpdateInvoice} from "../../graphql/hooks/invoices";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import {ALL_INVOICES} from "../../graphql/hooks/invoices/useGetAllInvoice";

interface Props {
    open: boolean;
    onClose?: () => void;
    oneInvoiceInfo?: any;
}

const initialInputs = {
    points: 100
};

const listPlan = [
    {price: 1000, points: 100},
    {price: 2500, points: 250},
    {price: 5000, points: 500},
    {price: 7500, points: 750},
    {price: 10000, points: 1000},
    //{price: 13000, points: 1300},
    {price: 15000, points: 1500},
    //{price: 25000, points: 2500},
    //{price: 40000, points: 4000}
]

const UpdateInvoiceModal = ({ open, onClose, oneInvoiceInfo }: Props) => {
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [updateInvoice] = useUpdateInvoice();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [selectedPlan, setSelectedPlan] = useState<{ points: number }>({ points: 100 });

    useEffect(() => {
        reset({
            points: oneInvoiceInfo?.points
        })
        setSelectedPlan({
            points: parseInt(oneInvoiceInfo?.points) || 0
        })
    }, [oneInvoiceInfo])

    let onFormSubmit = ({ points }: any) => {
        updateInvoice({
            variables: {
                id: oneInvoiceInfo?.id,
                content: {
                    points: parseInt(points),
                    id_company: userData?.person?.company?.id
                }
            },
            refetchQueries: [ALL_INVOICES]
        })
        .then(() => {
            enqueueSnackbar("لقد تمت تعديل فاتورة النقاط بنجاح قم بمراسلة الفريق حتى يتم تاكيد الشراء", {variant: "success", });
            closeHandler();
        })
        .catch(() => closeHandler());
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal open={open} onClose={closeHandler} title="تعديل فاتورة النقاط" iconTitle={<Plus/>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2} width={"100%"} margin={0}>
                    <RadioGroup defaultValue={selectedPlan.points} sx={{paddingTop: "20px"}}
                        onChange={(e, value: any) => {
                            setSelectedPlan({points: value})
                        }}
                    >
                        <Grid container direction={"row"} spacing={2} width={"100%"} margin={0} alignItems={"center"} >
                            {listPlan.map((plan: any, index: number) => (
                                <Grid item xs={4} key={index} style={{padding: 0, marginBottom: "10px"}}>
                                    <label htmlFor={`radio-${index}`}>
                                        <Box bgcolor={"white"} height={"100px"} padding={"15px 24px"} borderRadius="2px"
                                             sx={{
                                                 overflow: "hidden",
                                                 outlineColor: grey[600],
                                                 cursor: "pointer",
                                                 marginLeft: "6px",
                                                 marginRight: "6px",
                                                 transition: "all 0.08s",
                                                 ...(selectedPlan.points == plan.points && {
                                                     outline: "2px solid" + theme.palette.primary.main,
                                                     "&:hover": {outline: "2px solid" + theme.palette.primary.main}
                                                 })
                                             }}
                                        >
                                            <Stack direction="row" width={"100%"} height={"21px"} alignItems="center" sx={{background: "#FFF", padding: "0",}}>
                                                <Typography variant="xs" color={grey[700]}>
                                                    <FormControlLabel value={plan.points} control={
                                                        <Radio {...register("points", { required: true })} id={`radio-${index}`} sx={{ padding: "0" }} />
                                                    } label=""/>
                                                </Typography>
                                            </Stack>
                                            <Stack direction="column" width={"100%"} height={"42px"} alignItems="center" sx={{background: "#FFF", padding: "12px 0",}}>
                                                <Typography variant="xs" flex="1 0" color={grey[700]}>
                                                    {plan.points}{" "}
                                                    <Typography variant="2xs" flex="1 0" color={grey[700]}>نقطة</Typography>
                                                </Typography>
                                                <Typography variant="xl" flex="1 0" color={grey[700]}>
                                                    {plan.price} {" "}
                                                    <Typography variant="2xs" flex="1 0" color={grey[700]}>دج</Typography>
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </label>
                                </Grid>
                            ))}
                        </Grid>
                    </RadioGroup>

                </Grid>
            </form>
        </Modal>
    );
};

export default UpdateInvoiceModal;
