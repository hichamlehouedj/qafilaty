import { Box, Grid, MenuItem} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Select from "../Input/Select";
import {useCreateStock} from "../../graphql/hooks/stocks";
import Modal from "./Modal";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import { useSnackbar } from "notistack";
import useUpdateStock from "../../graphql/hooks/stocks/useUpdateStock";
import {ALL_STOCK} from "../../graphql/hooks/stocks/useGetAllStock";

interface Props {
    open: boolean;
    onClose?: () => void;
    oneStockInfo: any;
}

const initialInputs = {
    name: "",
    city: undefined,
    address: "",
    phone01: "",
    phone02: ""
};

const UpdateStockModal = ({ open, onClose, oneStockInfo }: Props) => {
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [updateStock] = useUpdateStock();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        reset({
            name: oneStockInfo.name,
            city: oneStockInfo.city,
            address: oneStockInfo.address,
            phone01: oneStockInfo.phone01,
            phone02: oneStockInfo.phone02
        })
    }, [oneStockInfo])

    let onFormSubmit = ({name, city, address, phone01, phone02}: any) => {
        updateStock({
            variables: {
                id: oneStockInfo?.id,
                content: {
                    name: name,
                    city: city,
                    address: address,
                    phone01: phone01,
                    phone02: phone02,
                    id_company: userData?.person?.company?.id
                }
            },
            update: (cache, { data: { updateStock } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_STOCK,
                    variables: { idCompany: userData?.person?.company?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allStock' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allStock?.findIndex(
                        ({id}: any) => id === oneStockInfo?.id
                    );
                }

                let updatedData = {
                    ...oneStockInfo,
                    id: oneStockInfo?.id,
                    name: name,
                    city: city,
                    address: address,
                    phone01: phone01,
                    phone02: phone02,
                    id_company: userData?.person?.company?.id
                }

                // @ts-ignore
                let newData = [...cacheData?.allStock];

                let positionData = newData.splice(findIndex, 1, updatedData);

                cache.writeQuery({
                    query: ALL_STOCK,
                    variables: { idCompany: userData?.person?.company?.id },
                    data: {
                        allStock: newData,
                    },
                });
            }
        })
            .then(() => {
                enqueueSnackbar("لقد تمت تعديل المكتب بنجاح", {variant: "success", });
                closeHandler();
            })
            .catch(() => closeHandler());
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal open={open} onClose={closeHandler} title="تعديل مكتب" iconTitle={<Plus></Plus>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={12}>
                        <Input error={errors?.name} placeholder="إسم المكتب" fullWidth{...register("name", { required: true })} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select error={errors?.city} placeholder="إختر المدينة" fullWidth{...register("city", { required: true })} defaultValue={oneStockInfo?.city} >
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
                        <Input error={errors?.address} placeholder="العنوان" fullWidth{...register("address", { required: true })} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth{...register("phone01", { required: true })} />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني" fullWidth{...register("phone02", { required: false })} />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default UpdateStockModal;