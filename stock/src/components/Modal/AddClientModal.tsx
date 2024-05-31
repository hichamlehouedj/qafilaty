import {Alert, Button as MuiButton, Grid, MenuItem, Stack, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import { useCreateClient } from "../../graphql/hooks/clients";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import Select from "../Input/Select";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import {useGetProvincesPrices} from "../../graphql/hooks/shipments";
import {grey} from "@mui/material/colors";

interface Props {
    open: boolean;
    onClose?: () => void;
}

const initialInputs = {
    first_name: "",
    last_name: "",
    email: "",
    phone01: "",
    phone02: "",
    address: ""
};

const AddClientModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, setError, watch, reset, control, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [createClient] = useCreateClient();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let [algeriaProvincesFiltered, setAlgeriaProvincesFiltered] = useState<any>([]);


    let getProvincesPrices: any = useGetProvincesPrices({
        city: userData?.person?.list_stock_accesses?.stock?.city  || "1",
        idCompany: userData?.person?.company?.id
    });

    useEffect(() => {
        if (getProvincesPrices) {
            let algeriaProvincesTrimmed = getProvincesPrices?.listPrice?.map((trans: any) => {
                if (trans?.zone_begin?.id != getProvincesPrices.id) return trans?.zone_begin?.cities;
                if (trans?.zone_end?.id != getProvincesPrices.id) return trans?.zone_end?.cities;
                return undefined;
            });

            algeriaProvincesTrimmed = algeriaProvincesTrimmed
                ?.concat(getProvincesPrices?.cities)
                ?.filter((v: any) => v)
                .flat(2)
                .sort((a: any, b: any) =>
                    a.localeCompare(b, undefined, {
                        numeric: true,
                        sensitivity: "base",
                    })
                );

            let candidateProvices = [...JSON.parse(JSON.stringify(algerian_provinces))]?.filter((v: any) =>
                algeriaProvincesTrimmed?.includes(v.wilaya_code)
            );

            setAlgeriaProvincesFiltered(candidateProvices);
        }
    }, [getProvincesPrices]);

    let onFormSubmit = ({first_name, last_name, email, phone01, phone02, city, address}: any) => {
        setSubmitLoading(true);
        createClient({
            variables: {
                content: {
                    person: {
                        first_name,
                        last_name,
                        email,
                        phone01,
                        phone02,
                        city,
                        address,
                        id_stock: userData?.person?.list_stock_accesses?.stock?.id
                    }
                },
            },
        })
        .then(() => {
            enqueueSnackbar("لقد تمت إضافة طرد بنجاح", {variant: "success", autoHideDuration: 5000});
            closeHandler();
        }).catch(({graphQLErrors}) => {
            if (graphQLErrors[0]?.extensions.code === "EMAIL_EXIST") {
                setError("email", {
                    type: "manual",
                    message: "هذا البريد الالكتروني موجود سابقا",
                })
            } else if (graphQLErrors[0]?.extensions.code === "PHONE_EXIST") {
                setError("phone01", {
                    type: "manual",
                    message: "رقم الهاتف هذا موجود سابقا",
                })
            }
        });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        reset(initialInputs);
        typeof onClose == "function" && onClose();
        setSubmitLoading(false);
    };

    return (
        <Modal open={open} onClose={closeHandler} title="إضافة عميل" iconTitle={<Plus/>} width="640px"
            footer={
                <>
                    <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                    <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                </>
            }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Alert variant="outlined" severity="warning" sx={{ padding: "4px 16px", marginBottom: "20px" }}>
                    ملاحظة :{" "}<br/>
                    <Stack rowGap={"5px"} marginTop={"5px"}>
                        <Typography variant="2xs" color={grey[700]}>- ستظهر لك الولايات التي تغطيها فقط.</Typography>
                        <Typography variant="2xs" color={grey[700]}>- إذا لم تقم بإدخال بريد الكتروني لن يستطيع إمتلاك حساب.</Typography>
                    </Stack>
                </Alert>

                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.first_name} placeholder="الاسم الاول" fullWidth {...register("first_name", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.last_name} placeholder="الاسم الاخير" fullWidth {...register("last_name", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input helperText={errors?.email?.message} error={errors?.email} placeholder="البريد الالكتروني" fullWidth {...register("email")} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input helperText={errors?.phone01?.message} error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth {...register("phone01", { required: true })}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني (إختياري)" fullWidth {...register("phone02", { required: false })}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select error={errors?.city} placeholder="إختر المدينة" fullWidth {...register("city", { required: true })}>
                            {algeriaProvincesFiltered?.map((wilaya: any, index: any) => {
                                return (
                                    <MenuItem value={wilaya.wilaya_code} key={index}>
                                        {wilaya.wilaya_code} - {wilaya.wilaya_name}
                                    </MenuItem>
                                );
                            })}
                        </Select>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.address} placeholder="العنوان" fullWidth {...register("address", { required: true })}></Input>
                    </Grid>

                </Grid>
            </form>
        </Modal>
    );
};

export default AddClientModal;
