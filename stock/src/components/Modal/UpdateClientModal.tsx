import {Alert, Grid, MenuItem, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, Plus, X } from "react-feather";
import { useForm } from "react-hook-form";
import {useUpdateClient, useGetOneClient} from "../../graphql/hooks/clients";
import Button from "../Button";
import Input from "../Input/Input";
import Modal from "./Modal";
import { useSnackbar } from "notistack";
import {ALL_CLIENTS} from "../../graphql/hooks/clients/useGetAllClients";
import useStore from "../../store/useStore";
import {useGetProvincesPrices} from "../../graphql/hooks/shipments";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import Select from "../Input/Select";
import {grey} from "@mui/material/colors";

interface Props {
    open: boolean;
    onClose?: () => void;
    clientID: string;
}

const UpdateClientModal = ({ open, onClose, clientID }: Props) => {
    let {register, handleSubmit, reset, control, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [updateClient] = useUpdateClient();
    const [clientOnUpdated, setClientOnUpdated] = React.useState({
        id: "",
        id_person: "",
        first_name: "",
        last_name: "",
        email: "",
        phone01: "",
        phone02: "",
        address: "",
        city:   0
    });
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar()
    let [algeriaProvincesFiltered, setAlgeriaProvincesFiltered] = useState<any>([]);


    let getProvincesPrices: any = useGetProvincesPrices({
        city: userData?.person?.list_stock_accesses?.stock?.city  || "1",
        idCompany: userData?.person?.company?.id
    });

    let [GetOneClient, { data: oneClientdata }] = useGetOneClient();

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

    useEffect(() => {
        GetOneClient({
            variables: { clientId: clientID || "" }
        })
    }, [open]);

    useEffect(() => {
        setClientOnUpdated({
            id: oneClientdata?.client?.id,
            id_person: oneClientdata?.client?.person.id,
            first_name: oneClientdata?.client?.person.first_name,
            last_name: oneClientdata?.client?.person.last_name,
            email: oneClientdata?.client?.person.email,
            phone01: oneClientdata?.client?.person.phone01,
            phone02: oneClientdata?.client?.person.phone02,
            address: oneClientdata?.client?.person.address,
            city: oneClientdata?.client?.person.city
        })
        reset();
    }, [oneClientdata]);

    useEffect(() => {
        reset(clientOnUpdated);
    }, [clientOnUpdated]);

    let onFormSubmit = ({first_name, last_name, email, phone01, phone02, address, city}: any) => {
        setSubmitLoading(true);
        updateClient({
            variables: {
                id_person: clientOnUpdated.id_person,
                content: {
                    person: {
                        first_name,
                        last_name,
                        email,
                        phone01,
                        phone02,
                        address,
                        city
                    }
                }
            },
            update: (cache, { data: { updateClient } }) => {

                let cacheData: object | null = {}

                cacheData = cache.readQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id }
                });

                let findIndex: any
                if (typeof cacheData === 'object' && cacheData !== null && 'allClients' in cacheData) {
                    // @ts-ignore
                    findIndex = cacheData?.allClients?.findIndex(
                        ({id}: any) => id === clientOnUpdated.id
                    );
                }

                let updatedData = {
                    id: clientOnUpdated.id,
                    person: {
                        id: clientOnUpdated.id_person,
                        first_name,
                        last_name,
                        email,
                        phone01,
                        phone02,
                        address,
                        city
                    }
                }

                // @ts-ignore
                let newData = [...cacheData?.allClients];

                let positionData = newData.splice(findIndex, 1, updatedData);

                cache.writeQuery({
                    query: ALL_CLIENTS,
                    variables: { IdStock: userData?.person?.list_stock_accesses?.stock?.id },
                    data: {
                        allClients: newData,
                    },
                });
            }
        })
        .then(() => {
            enqueueSnackbar("لقد تم تعديل معلومات العميل بنجاح", {variant: "success"});
            closeHandler();
            setTimeout(() => closeSnackbar(), 3000)
        })
        .catch(() => { closeHandler(); });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        reset(clientOnUpdated);
        typeof onClose == "function" && onClose();
        setSubmitLoading(false);
    };

    return (
        <Modal open={open} onClose={closeHandler} title="تعديل عميل" iconTitle={<Plus></Plus>} width="640px"
               footer={
                   <>
                       <Button startIcon={<X></X>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check></Check>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                   </>
               }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Alert variant="outlined" severity="warning" sx={{ padding: "4px 16px", marginBottom: "20px" }}>
                    ملاحظة :{" "}
                    <Typography variant="2xs" color={grey[700]}>ستظهر لك الولايات التي تغطيها فقط.</Typography>
                </Alert>

                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.first_name} placeholder="الاسم الاول" fullWidth {...register("first_name", { required: true })} defaultValue={clientOnUpdated.first_name}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.last_name} placeholder="الاسم الاخير" fullWidth {...register("last_name", { required: true })} defaultValue={clientOnUpdated.last_name} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input error={errors?.email} placeholder="البريد الالكتروني" fullWidth {...register("email")} defaultValue={clientOnUpdated.email} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone01} placeholder="رقم الهاتف الاول" fullWidth {...register("phone01", { required: true })} defaultValue={clientOnUpdated.phone01} ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.phone02} placeholder="رقم الهاتف الثاني (إختياري)" fullWidth {...register("phone02", { required: false })} defaultValue={clientOnUpdated.phone02}></Input>
                    </Grid>
                    {clientOnUpdated.city && (
                        <Grid item xs={12} sm={6}>
                            <Select error={errors?.city} placeholder="إختر المدينة" fullWidth {...register("city", { required: true })} defaultValue={clientOnUpdated.city}>
                                {algeriaProvincesFiltered?.map((wilaya: any, index: any) => {
                                    return (
                                        <MenuItem value={wilaya.wilaya_code} key={index}>
                                            {wilaya.wilaya_code} - {wilaya.wilaya_name}
                                        </MenuItem>
                                    );
                                })}
                            </Select>
                        </Grid>
                    )}
                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.address} placeholder="المدينة العنوان" fullWidth {...register("address", { required: true })} defaultValue={clientOnUpdated?.address} ></Input>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default UpdateClientModal;