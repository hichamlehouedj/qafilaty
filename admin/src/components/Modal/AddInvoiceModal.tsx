import { Grid, Stack, Box, Typography, FormControlLabel,  Radio, RadioGroup} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import theme from "../../styles/theme";
import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import {useCreateInvoice} from "../../graphql/hooks/invoices";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import Alert from "../Alert";

interface Props {
    open: boolean;
    onClose?: () => void;
}

const initialInputs = {
    points: 100
};

const listPlan = [
    {price: 1000, pointe: 100},
    {price: 2500, pointe: 250},
    {price: 5000, pointe: 500},
    {price: 7500, pointe: 750},
    {price: 10000, pointe: 1000},
    //{price: 13000, pointe: 1300},
    {price: 15000, pointe: 1500},
    //{price: 25000, pointe: 2500},
    //{price: 40000, pointe: 4000}
]

const AddInvoiceModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [createInvoice] = useCreateInvoice();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [selectedPlan, setSelectedPlan] = useState<{ pointe: number }>({ pointe: 100 });

    let onFormSubmit = ({ points }: any) => {
        createInvoice({
            variables: {
                content: {
                    points: parseInt(points),
                    id_company: userData?.person?.company?.id
                }
            },
        })
        .then(() => {
            enqueueSnackbar("لقد تمت إضافة النقاط بنجاح قم بمراسلة الفريق حتى يتم تاكيد الشراء", {variant: "success", });
            closeHandler();
        })
        .catch(() => closeHandler());
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal open={open} onClose={closeHandler} title="شراء نقاط" iconTitle={<Plus/>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2} width={"100%"} margin={0}>
                    <Alert variant="outlined" icon={false} severity="warning" sx={{width: "100%", bgcolor: "#f7ffe7", color: "#444"}}>
                        <Typography variant="2xs" width={"100%"} marginBottom={"5px"} component={"p"} color={grey[700]}>قم بارسال ثمن النقاط الى الحساب البريدي بالاسفل</Typography>
                        <Typography variant="2xs" width={"100%"} marginBottom={"10px"} component={"p"} color={grey[700]}>قم بارسال حوالة التحويل الى الفريق سيتم تاكيد شرائك في بضع دقائق</Typography>

                        <Typography variant="xs" width={"100%"} marginBottom={"10px"} textAlign={"right"} component={"p"} color={grey[700]}>CCP: 23555199  79 / LEHOUEDJ HICHAM</Typography>
                        <Typography variant="xs" width={"100%"} component={"p"} textAlign={"right"} color={grey[700]}>BaridiMob : 00799999002355519979</Typography>
                    </Alert>
                    <RadioGroup defaultValue={selectedPlan.pointe} sx={{paddingTop: "20px"}}
                        onChange={(e, value: any) => {
                            setSelectedPlan({pointe: value})
                        }}
                    >
                        <Grid container direction={"row"} spacing={2} width={"100%"} margin={0} alignItems={"center"} >
                            {listPlan.map((plan: any, index: number) => (
                                <Grid item xs={4} key={index} style={{padding: 0, marginBottom: "10px"}}>
                                    <label htmlFor={`radio-${index}`}>
                                        <Box bgcolor={"white"} height={"130px"} padding={"15px 24px"} borderRadius="2px"
                                             sx={{
                                                 overflow: "hidden",
                                                 outlineColor: grey[600],
                                                 cursor: "pointer",
                                                 marginLeft: "6px",
                                                 marginRight: "6px",
                                                 transition: "all 0.08s",
                                                 ...(selectedPlan.pointe == plan.pointe && {
                                                     outline: "2px solid" + theme.palette.primary.main,
                                                     "&:hover": {outline: "2px solid" + theme.palette.primary.main}
                                                 })
                                             }}
                                        >
                                            <Stack direction="row" width={"100%"} height={"21px"} alignItems="center" sx={{background: "#FFF", padding: "0",}}>
                                                <Typography variant="xs" color={grey[700]}>
                                                    <FormControlLabel value={plan.pointe} control={
                                                        <Radio {...register("points", { required: true })} id={`radio-${index}`} sx={{ padding: "0" }} />
                                                    } label=""/>
                                                </Typography>
                                            </Stack>
                                            <Stack direction="column" width={"100%"} alignItems="center" justifyContent={"space-between"} sx={{background: "#FFF", padding: "12px 0",}}>
                                                <Typography variant="xs" flex="1 0" color={grey[700]} style={{marginBottom: "10px"}}>
                                                    {plan.pointe}{" "}
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

export default AddInvoiceModal;