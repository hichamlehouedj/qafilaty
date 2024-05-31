import { Box, Grid, MenuItem} from "@mui/material";
import { grey } from "@mui/material/colors";
import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Select from "../Input/Select";
import {useCreateStock} from "../../graphql/hooks/stocks";
import Modal from "./Modal";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import { useSnackbar } from "notistack";

interface Props {
    open: boolean;
    onClose?: () => void;
}

const initialInputs = {
    name: "",
    city: undefined,
    address: "",
    phone01: "",
    phone02: ""
};

const AddStockModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [createStock] = useCreateStock();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let onFormSubmit = ({name, city, address, phone01, phone02}: any) => {
        createStock({
            variables: {
                content: {
                    name: name,
                    city: city,
                    address: address,
                    phone01: phone01,
                    phone02: phone02,
                    id_company: userData?.person?.company?.id
                }
            },
        })
        .then(() => {
            enqueueSnackbar("لقد تمت إضافة المكتب بنجاح", {variant: "success", });
            closeHandler();
        })
        .catch(() => closeHandler());
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal open={open} onClose={closeHandler} title="إضافة مكتب" iconTitle={<Plus></Plus>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X></X>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button startIcon={<Check></Check>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <Input error={errors?.name} placeholder="إسم المكتب" fullWidth{...register("name", { required: true })}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select error={errors?.city} placeholder="إختر المدينة" fullWidth{...register("city", { required: true })}>
                            {[...JSON.parse(JSON.stringify(algerian_provinces))].map((wilaya, index) => {
                                return (
                                    <MenuItem value={wilaya.wilaya_code} key={index}>
                                        {wilaya.wilaya_code} - {wilaya.wilaya_name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.address} placeholder="العنوان" fullWidth {...register("address", { required: true })}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth {...register("phone01", { required: true })}/>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني" fullWidth {...register("phone0", { required: false })}/>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default AddStockModal;
