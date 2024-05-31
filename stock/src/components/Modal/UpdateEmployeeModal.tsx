import {Box, Grid, MenuItem, Stack, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, Plus, X } from "react-feather";
import {Controller, useForm} from "react-hook-form";
import {useUpdateEmployee, useGetOneEmployee} from "../../graphql/hooks/employees";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import {ALL_FACTORS} from "../../graphql/hooks/employees/useGetAllEmployees";
import Select from "../Input/Select";
import {grey} from "@mui/material/colors";
import Switch from "../Switch";

interface Props {
    open: boolean;
    onClose?: () => void;
    employeeID: string;
}

const UpdateEmployeeModal = ({ open, onClose, employeeID }: Props) => {
    let {register, handleSubmit, reset, control, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [isDriver, setIsDriver] = useState<boolean>(false);
    let [isSuccessDelivery, setIsSuccessDelivery] = useState<boolean>(false);
    let [updateEmployee] = useUpdateEmployee();
    const [employeeOnUpdated, setEmployeeOnUpdated] = React.useState({
        id: "",
        id_person: "",
        first_name: "",
        last_name: "",
        email: "",
        phone01: "",
        phone02: "",
        address: "",
        department: "",
        salary_type: "",
        salary: 0
    });
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()

    let [GetOneEmployee, { data: oneEmployeedata }] = useGetOneEmployee();

    useEffect(() => {
        GetOneEmployee({
            variables: { factorId: employeeID }
        })
    }, [open]);

    useEffect(() => {
        setEmployeeOnUpdated({
            id: oneEmployeedata?.factor?.id,
            id_person: oneEmployeedata?.factor?.person.id,
            first_name: oneEmployeedata?.factor?.person.first_name,
            last_name: oneEmployeedata?.factor?.person.last_name,
            email: oneEmployeedata?.factor?.person.email,
            phone01: oneEmployeedata?.factor?.person.phone01,
            phone02: oneEmployeedata?.factor?.person.phone02,
            address: oneEmployeedata?.factor?.person.address,
            department: oneEmployeedata?.factor?.department,
            salary_type: oneEmployeedata?.factor?.salary_type,
            salary: oneEmployeedata?.factor?.salary,

            // @ts-ignore
            salaryType: oneEmployeedata?.factor?.salary_type == "success_delivery"
        })
        setIsDriver(oneEmployeedata?.factor?.department == "سائق")
        setIsSuccessDelivery(oneEmployeedata?.factor?.salary_type == "success_delivery")
    }, [oneEmployeedata]);

    useEffect(() => {
        reset(employeeOnUpdated);
    }, [employeeOnUpdated]);

    let onFormSubmit = ({first_name, last_name, email, phone01, phone02, address, department, salaryType, salary}: any) => {
        setSubmitLoading(true);
        updateEmployee({
            variables: {
                id_person: employeeOnUpdated.id_person,
                content: {
                    department,
                    salary_type: salaryType ? "success_delivery" : "wage",
                    salary: parseFloat(salary),
                    person: {
                        first_name,
                        last_name,
                        email,
                        phone01,
                        phone02,
                        address
                    }
                }
            },
            update: (cache, { data: { updateFactor } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allFactors' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allFactors?.findIndex(
                        ({id}: any) => id === employeeOnUpdated.id
                    );
                }

                let updatedData = {
                    id: employeeOnUpdated.id,
                    department,
                    person: {
                        id: employeeOnUpdated.id_person,
                        first_name,
                        last_name,
                        email,
                        phone01,
                        phone02,
                        address
                    }
                }

                // @ts-ignore
                let newData = [...cacheData?.allFactors];

                let positionData = newData.splice(findIndex, 1, updatedData);

                cache.writeQuery({
                    query: ALL_FACTORS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allFactors: newData,
                    },
                });
            }
        })
        .then(() => {
            enqueueSnackbar("لقد تم تعديل معلومات الموظف بنجاح", {variant: "success",});
            closeHandler();
            setTimeout(() => closeSnackbar(), 3000)
        })
        .catch(() => { closeHandler(); });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        reset(employeeOnUpdated);
        typeof onClose == "function" && onClose();
        setSubmitLoading(false);
    };

    return (
        <Modal open={open} onClose={closeHandler} title="تعديل موظف" iconTitle={<Plus></Plus>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X></X>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check></Check>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.first_name} placeholder="الاسم الاول" fullWidth {...register("first_name", { required: true })} defaultValue={employeeOnUpdated.first_name}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.last_name} placeholder="الاسم الاخير" fullWidth {...register("last_name", { required: true })} defaultValue={employeeOnUpdated.last_name} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input error={errors?.email} placeholder="البريد الالكتروني" fullWidth {...register("email", { required: true })} defaultValue={employeeOnUpdated.email} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth {...register("phone01", { required: true })} defaultValue={employeeOnUpdated.phone01} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني (إختياري)" fullWidth {...register("phone02", { required: false })} defaultValue={employeeOnUpdated.phone02}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.address} placeholder="المدينة العنوان" fullWidth {...register("address", { required: true })} defaultValue={employeeOnUpdated?.address} ></Input>
                    </Grid>

                    {
                        employeeOnUpdated?.department && (
                            <Grid item xs={12} sm={6}>
                                <Select error={errors?.department} placeholder="القسم" fullWidth {...register("department", { required: true })} defaultValue={employeeOnUpdated?.department}
                                    onChange={(e) => setIsDriver(e?.target?.value == "سائق")}
                                >
                                    <MenuItem value="سائق" >سائق</MenuItem>
                                    <MenuItem value="موظف" >موظف</MenuItem>
                                    <MenuItem value="مسؤول مخزن" >مسؤول مخزن</MenuItem>
                                    <MenuItem value="محاسب" >محاسب</MenuItem>
                                    <MenuItem value="موظف استقبال" >موظف استقبال</MenuItem>
                                </Select>
                            </Grid>
                        )
                    }

                    {isDriver && (
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
                    )}

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

export default UpdateEmployeeModal;
