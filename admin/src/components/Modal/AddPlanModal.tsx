import {
    Grid,
    Stack,
    Box,
    Typography,
    FormControlLabel,
    Radio,
    RadioGroup,
    InputAdornment,
    MenuItem
} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import theme from "../../styles/theme";
import React, { useEffect, useState } from "react";
import { Check, Plus, X, Percent } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import {useUpdatePlan} from "../../graphql/hooks/plans";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import {ALL_PLANS} from "../../graphql/hooks/plans/useGetAllPlans";
import Input from "../Input/Input";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import Select from "../Input/Select";

interface Props {
    open: boolean;
    onClose?: () => void;
}

/*
    title:             String
    description:       String
    discount_return:   Int
    discount_delivery: Int
    status:            String
    id_company:        ID
 */

const initialInputs = {
    title:             "",
    description:       "",
    discount_return:   0,
    discount_delivery: 0,
    status:            "",
    id_company:        ""
};

const AddPlanModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [updatePlan] = useUpdatePlan();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    /*
    id
title
     */
    let onFormSubmit = ({ points }: any) => {
        // updateInvoice({
        //     variables: {
        //         id: oneInvoiceInfo?.id,
        //         content: {
        //             points: parseInt(points),
        //             id_company: userData?.person?.company?.id
        //         }
        //     },
        //     refetchQueries: [ALL_PLANS]
        // })
        // .then(() => {
        //     enqueueSnackbar("لقد تمت تعديل فاتورة النقاط بنجاح قم بمراسلة الفريق حتى يتم تاكيد الشراء", {variant: "success", });
        //     closeHandler();
        // })
        // .catch(() => closeHandler());
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal open={open} onClose={closeHandler} title="اضافة العرض" iconTitle={<Plus/>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_plan" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2} width={"100%"} margin={0}>
                    <Grid item xs={12} sm={12}>
                        <Select error={errors?.city} placeholder="إسم العرض" fullWidth{...register("city", { required: true })}>
                            <MenuItem value={"plan_1"} >عملاء مميزون</MenuItem>
                            <MenuItem value={"plan_2"} >عملاء VIP</MenuItem>
                            <MenuItem value={"plan_3"} >عملاء VIP PRO</MenuItem>
                        </Select>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input error={errors?.name} placeholder="الوصف" fullWidth{...register("name", { required: true })}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.name} prefix={"%"} placeholder="الخصم على سعر الطرود الراجعة" fullWidth{...register("name", { required: true })}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end" style={{marginLeft: "-5px"}}>
                                       <Percent size={18} strokeWidth={2} />
                                   </InputAdornment>
                               )
                           }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.name} placeholder="الخصم على سعر الطرود الواصلة" fullWidth{...register("name", { required: true })}
                               InputProps={{
                                   endAdornment: (
                                       <InputAdornment position="end" style={{marginLeft: "-5px"}}>
                                           <Percent size={18} strokeWidth={2} />
                                       </InputAdornment>
                                   )
                               }}
                        />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default AddPlanModal;
