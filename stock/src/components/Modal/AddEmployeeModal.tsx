import {Box, Grid, MenuItem, Stack, Typography} from "@mui/material";
import React, {useState} from "react";
import { Check, Plus, X } from "react-feather";
import {Controller, useForm} from "react-hook-form";
import { useCreateEmployee } from "../../graphql/hooks/employees";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Select from "../Input/Select";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import {grey} from "@mui/material/colors";
import Switch from "../Switch";

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
    address: "",
    department: ""
};

const AddEmployeeModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, setError, control, reset, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [isDriver, setIsDriver] = useState<boolean>(false);
    let [isSuccessDelivery, setIsSuccessDelivery] = useState<boolean>(false);
    let [createEmployee] = useCreateEmployee();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let onFormSubmit = ({first_name, last_name, email, phone01, phone02, city, address, department, salaryType, salary}: any) => {
        setSubmitLoading(true);
        createEmployee({
            variables: {
                content: {
                    department,
                    salary_type: salaryType ? "success_delivery" : "wage",
                    salary: parseFloat(salary || 0),
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
            enqueueSnackbar("لقد تمت إضافة موظف بنجاح", {variant: "success",});
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
        <Modal open={open} onClose={closeHandler} title="إضافة موظف" iconTitle={<Plus/>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.first_name} placeholder="الاسم الاول" fullWidth {...register("first_name", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.last_name} placeholder="الاسم الاخير" fullWidth {...register("last_name", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input helperText={errors?.email?.message} error={errors?.email} placeholder="البريد الالكتروني" fullWidth {...register("email", { required: true })} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input helperText={errors?.phone01?.message} error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth {...register("phone01", { required: true })}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني (إختياري)" fullWidth {...register("phone02", { required: false })}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select error={errors?.city} placeholder="إختر المدينة" fullWidth {...register("city", { required: true })}>
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
                        <Input error={errors?.address} placeholder="العنوان" fullWidth {...register("address", { required: true })}></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Select error={errors?.department} placeholder="القسم" fullWidth {...register("department", { required: false })}
                            onChange={(e) => setIsDriver(e?.target?.value == "سائق")}
                        >
                            <MenuItem value="سائق">سائق</MenuItem>
                            <MenuItem value="موظف">موظف</MenuItem>
                            <MenuItem value="مسؤول مخزن">مسؤول مخزن</MenuItem>
                            <MenuItem value="محاسب">محاسب</MenuItem>
                            <MenuItem value="موظف استقبال">موظف استقبال</MenuItem>
                        </Select>
                    </Grid>

                    {isDriver &&
                        <Grid item xs={12}>
                            <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                                <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                    <Typography variant="sm" color={grey[600]}>هل السائق يأخذ عمولة على كل توصيل ناجح؟</Typography>

                                    <Controller control={control} name="salaryType"
                                        render={({ field: { onChange, onBlur, value } }) => {
                                            return <Switch checked={value} onChange={(e) => {onChange(e); setIsSuccessDelivery(!isSuccessDelivery);}}/>
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Grid>
                    }

                    {isDriver && isSuccessDelivery &&
                        <Grid item xs={12} sm={12}>
                            <Input placeholder="سعر توصيل كل طرد ناجح" fullWidth {...register("salary", { required: false })} />
                        </Grid>
                    }

                </Grid>
            </form>
        </Modal>
    );
};

export default AddEmployeeModal;
