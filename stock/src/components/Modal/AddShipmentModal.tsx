import {Alert, Box, Grid, MenuItem, Stack, Typography} from "@mui/material";
import { amber, grey } from "@mui/material/colors";
import React, {useEffect, useState} from "react";
import { Check, Plus, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { useCreateShipment, useGetProvincesPrices  } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Select from "../Input/Select";
import TextArea from "../Input/TextArea";
import AutoCompleteSelect from "../Input/AutoCompleteSelect";
import Switch from "../Switch";
import Modal from "./Modal";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import { useSnackbar } from "notistack";
import { priceFormatHelper } from "../../utilities/helpers";
import * as yup from 'yup';

interface Props {
    open: boolean;
    onClose?: () => void;
}

const initialInputs = {
    category_shipment: undefined,
    command_number: "",
    delivery_tax: undefined,
    delivery_type: "office",
    isCommercial: false,
    isFragile: false,
    isOpenable: false,
    isCoverable: false,
    isFreeDelivery: false,
    recipient_address: "",
    recipient_city: "",
    recipient_name: "",
    recipient_phone: "",
    shipment_price: "",
    recipient_loction: ""
};

let schema = yup.object().shape({
    category_shipment:  yup.string().max(255, "الطول الاقصى لمحتوى الطرد هو 255 حرف"),
    command_number:     yup.string().max(50, "الطول الاقصى لرقم الطلب هو 50 حرف"),
    delivery_tax:       yup.number().min(0, "الحد الادنى 0 دج").required("سعر التوصيل اجباري"),
    delivery_type:      yup.mixed().oneOf(["office", "house", "نوع التوصيل يجب ان يكون من الخيارات الطروحة"] as any).defined("نوع التوصيل يجب ان يكون من الخيارات الطروحة"),

    recipient_address:  yup.string().max(50, "الطول الاقصى لعنوان المستلم هو 50 حرف").required("عنوان المستلم اجباري"),
    recipient_city:     yup.string().required("اختيار مدينة المستلم اجباري"),
    recipient_name:     yup.string().max(50, "الطول الاقصى لاسم المستلم هو 50 حرف").required("اسم المستلم اجباري"),
    recipient_phone:    yup.string().max(50, "الطول الاقصى لرقم هاتف المستلم هو 50 حرف").required("رقم هاتف المستلم اجباري"),
    shipment_price:     yup.number().min(0, "الحد الادنى 0 دج").required("يوجد خطأ قم بتحديث الصفحة"),
    recipient_loction:  yup.string().max(255, "الطول الاقصى لرابط عنوان المستلم هو 255 حرف"),

    clientIdValue:     yup.string().required("اختيار العميل اجباري").defined("اختيار العميل اجباري"),
    note:  yup.string().max(255, "الطول الاقصى للملاحظات هو 255 حرف")
});

const AddShipmentModal = ({ open, onClose }: Props) => {
    let {register, handleSubmit, reset, control, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    let [isCommercial, setIsCommercial] = useState(false);
    let [isOpenable, setIsOpenable] = useState(false);
    let [isCoverable, setIsCoverable] = useState(false);
    let [isFreeDelivery, setIsFreeDelivery] = useState(false);
    let [isExceededSizeLimit, setIsExceededSizeLimit] = useState(false);
    let [isExceededMeasureLimit, setIsExceededMeasureLimit] = useState(false);
    let [wilaya, setWilaya] = useState("");
    let [deliveryType, setDeliveryType] = useState<string>("");
    let [deliveryPrice, setDeliveryPrice] = useState(null);
    let [shipmentPrice, setShipmentPrice] = useState<string>("");
    let [deliveryPriceAfterMeasuremnt, setDeliveryPriceAfterMeasuremnt] = useState(null);
    let [measurement, setMeasurement] = useState<any>({
        weight: 0,
        width: 0,
        height: 0,
        length: 0,
    });
    let [createShipmenet] = useCreateShipment();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let [clientIdValue, setClientIdValue] = useState<any>("");
    let [clientCity, setClientCity] = useState<any>(0);
    let [algeriaProvincesFiltered, setAlgeriaProvincesFiltered] = useState<any>([]);
    const [alert, setAlert] = useState<{
        status?: string;
        msg?: string;
        length?: number;
    }>({});


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

    useEffect(() => {
        let draft: any = { ...getProvincesPrices };
        let isItOnSameZone = draft?.cities?.findIndex((city: any) => wilaya == city);
        let findTransactionIndex = undefined;
        let deliveryPriceResult = undefined;
        if (deliveryType) {
            if (wilaya !== clientCity) {
                if (isItOnSameZone >= 0) {
                    findTransactionIndex = draft?.listPrice?.findIndex(
                        (trans: any) => trans.zone_begin.id == trans.zone_end.id
                    );

                    deliveryPriceResult =
                        deliveryType == "house"
                            ? draft.listPrice?.[findTransactionIndex]?.default_price_house
                            : draft.listPrice?.[findTransactionIndex]?.default_price_office;

                    setDeliveryPrice(deliveryPriceResult);
                } else {
                    findTransactionIndex = draft?.listPrice?.findIndex(
                        (trans: any) =>
                            trans?.zone_begin.cities.includes(wilaya) || trans?.zone_end.cities.includes(wilaya)
                    );

                    deliveryPriceResult =
                        deliveryType == "house"
                            ? draft.listPrice?.[findTransactionIndex]?.default_price_house
                            : draft.listPrice?.[findTransactionIndex]?.default_price_office;

                    setDeliveryPrice(deliveryPriceResult);
                }
                setDeliveryPriceAfterMeasuremnt(deliverPriceHandler(deliveryPriceResult));
            } else {
                setDeliveryPrice(userData?.person?.company?.price_in_state);
                setDeliveryPriceAfterMeasuremnt(
                    deliverPriceHandler(userData?.person?.company?.price_in_state)
                );
            }
        }
    }, [wilaya, deliveryType, measurement, isExceededSizeLimit, isExceededMeasureLimit, isCoverable]);

    let onFormSubmit = async ({category_shipment, command_number, delivery_tax, delivery_type, isCommercial, isFragile, isFreeDelivery, recipient_address, recipient_city, recipient_name, recipient_phone, shipment_price, paidInOffice, shipment_width, shipment_length, shipment_height, shipment_size, note, recipient_loction}: any) => {
        setSubmitLoading(true);

        let valid = false;

        try {
            const schemaValidate = await schema.validateSync({
                recipient_name: recipient_name,
                recipient_phone: recipient_phone,
                recipient_city: recipient_city,
                recipient_address: recipient_address,
                recipient_loction: recipient_loction,
                category_shipment: category_shipment,
                delivery_type: delivery_type,
                command_number: command_number,
                delivery_tax: parseFloat(deliveryPriceAfterMeasuremnt as any || 0),
                shipment_price: isCommercial ? parseFloat(shipment_price) : 0,
                clientIdValue: clientIdValue,
                note: note
            })
            valid = true
            setAlert({})
        } catch(e) {
            setSubmitLoading(false);
            // @ts-ignore
            setAlert({status: "error", msg: e?.message})
            scrollFormToTop()
        }

        if(isCommercial && parseFloat(shipment_price) <= 0) {
            setSubmitLoading(false);
            setAlert({status: "error", msg: "لقد اخترت التوصيل التجاري يجب ان يكون سعر الطرد اكبر من 0 دج"})
            scrollFormToTop()
            valid = false
        }

        if(isExceededSizeLimit && parseFloat(shipment_size) <= userData?.person?.company?.defult_weight) {
            setSubmitLoading(false);
            setAlert({status: "error", msg: `لقد اخترت الوزن اكبر من ${userData?.person?.company?.defult_weight} كلغ. يجب ان يكون الوزن اكبر من ${userData?.person?.company?.defult_weight} كلغ ` })
            scrollFormToTop()
            valid = false
        }

        if(isExceededMeasureLimit && (parseFloat(shipment_width) * parseFloat(shipment_length) * parseFloat(shipment_height)) <= userData?.person?.company?.defult_length) {
            setSubmitLoading(false);
            setAlert({status: "error", msg: `لقد اخترت الطول الاجمالي اكبر من ${userData?.person?.company?.defult_length} م. يجب ان يكون الطول × العرض × الارتفاع اكبر من ${userData?.person?.company?.defult_length} م ` })
            scrollFormToTop()
            valid = false
        }

        if(isCommercial && isFreeDelivery && parseFloat(shipment_price) < parseFloat(deliveryPriceAfterMeasuremnt as any || 0)) {
            setSubmitLoading(false);
            setAlert({status: "error", msg: "لقد اخترت سعر التوصيل يخصم من سعر المنتج لذلك يجب ان يكون سعر المنتج اكبر من سعر التوصيل"})
            scrollFormToTop()
            valid = false
        }

        if (paidInOffice && isFreeDelivery && isCommercial) {
            setSubmitLoading(false);
            setAlert({status: "error", msg: "لم يمكنك اختيار سعر التوصيل خالص في المكتب وفي نفس الوقت يخصم من سعر الطرد"})
            scrollFormToTop()
            valid = false
        }

        if (valid) {
            createShipmenet({
                variables: {
                    content: {
                        id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                        id_person: userData?.person?.id,
                        id_client: clientIdValue,
                        recipient_name: recipient_name,
                        recipient_phone1: recipient_phone,
                        recipient_phone2: "",
                        recipient_city: recipient_city,
                        recipient_address: recipient_address,
                        categorie: category_shipment,
                        delivery_type: delivery_type,
                        fragile: isFragile,
                        price_box: isCommercial ? parseFloat(shipment_price) : 0,
                        price_delivery: parseFloat(deliveryPriceAfterMeasuremnt as any),
                        payment_type: (isFreeDelivery && isCommercial) ? "free" : "normal",
                        status_box: 4,
                        command_number: command_number,
                        height_box: shipment_height || userData?.person?.company?.defult_length.toString(),
                        width_box: shipment_width || userData?.person?.company?.defult_length.toString(),
                        length_box: shipment_length || userData?.person?.company?.defult_length.toString(),
                        weight_box: shipment_size || userData?.person?.company?.defult_weight.toString(),
                        paid_in_office: paidInOffice,
                        note: note,
                        recipient_loction: recipient_loction,
                        TVA: userData?.person?.company?.TVA,
                        possibility_open: isOpenable as any,
                        encapsulation: isCoverable as any
                        // extra
                    },
                },
            })
            .then(() => {
                enqueueSnackbar("لقد تمت إضافة طرد بنجاح", {variant: "success",});
                closeHandler();
            })
            .catch(() => {
                closeHandler();
            });
        }
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        reset(initialInputs);
        setIsCommercial(false);
        setIsFreeDelivery(false);
        setIsExceededMeasureLimit(false);
        setIsExceededSizeLimit(false);
        setWilaya("");
        setDeliveryPrice(null);
        setShipmentPrice(null as any);
        setDeliveryType("");
        setMeasurement({
            weight: 0,
            width: 0,
            height: 0,
            length: 0,
        });
        setSubmitLoading(false);
        setAlert({})

        setIsOpenable(false);
        setIsCoverable(false);
        typeof onClose == "function" && onClose();
    };

    const deliverPriceHandler = (deliveryPriceResult: any) => {
        const sizePricing =
            measurement.weight > userData?.person?.company?.defult_weight
                ? Math.floor((measurement.weight - userData?.person?.company?.defult_weight) / userData?.person?.company?.plus_size) * userData?.person?.company?.value_plus_size
                : 0;

        const dimensionPricing =
            measurement.width * measurement.length * measurement.height >
            userData?.person?.company?.defult_length
                ? Math.floor(
                (measurement.width * measurement.length * measurement.height -
                    userData?.person?.company?.defult_length) /
                userData?.person?.company?.plus_tail
            ) * userData?.person?.company?.value_plus_tail
                : 0;

        const sizePricingCond = isExceededSizeLimit ? sizePricing : 0;
        const dimensionPricingCond = isExceededMeasureLimit ? dimensionPricing : 0;

        const isCoverablePrice = isCoverable ? userData?.person?.company?.encapsulation_price : 0;

        return (
            deliveryPriceResult + sizePricingCond + dimensionPricingCond + isCoverablePrice
        );
    };

    const scrollFormToTop = () => {
        // @ts-ignore
        document.querySelector("#modelAddBox .Modal-innerContent").scrollTop = 0
    }

    return (
        <Modal id={"modelAddBox"} open={open} onClose={closeHandler} title="إضافة طرد" iconTitle={<Plus/>} width="640px"
            footer={
                <Stack direction="row" justifyContent={"end"} width="100%">
                    <Stack direction="row" gap="6px">
                        <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                        <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_shipment">تأكيد</Button>
                    </Stack>
                </Stack>
            }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>

                    { alert.status && (
                        <Grid item xs={12} sm={12} >
                            <Alert variant="outlined" severity={alert.status as any} sx={{ padding: "4px 16px"}} onClose={() => setAlert({})}>
                                {alert.msg}
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12} sm={12}>
                        <AutoCompleteSelect
                            onChangeCallback={(data: any) => {
                                setClientCity(data?.person?.city)
                                setClientIdValue(data.id)
                            }}
                            customInputProps={{
                                error: errors?.id_client,
                                register: register("id_client"),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.recipient_name} placeholder="إسم المستلم" fullWidth {...register("recipient_name")}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input error={errors?.recipient_phone} placeholder="رقم الهاتف" fullWidth {...register("recipient_phone")}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select
                            error={errors?.recipient_city}
                            placeholder="إختر المدينة" fullWidth
                            {...register("recipient_city")}
                            onChange={(e, c) => {
                                setWilaya(e.target.value as any);
                                register("recipient_city").onChange(e);
                            }}
                        >
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
                        <Input error={errors?.recipient_address} placeholder="العنوان" fullWidth {...register("recipient_address")}></Input>
                    </Grid>

                    <Grid item xs={12} sm={12}>
                        <Input
                            type={"url"}
                            error={errors?.recipient_loction}
                            placeholder="رابط موقع المستلم (إختياري)"
                            fullWidth
                            {...register("recipient_loction", {
                                required: false,
                                pattern: /(https:\/\/goo\.gl\/maps\/.+|https:\/\/(www\.)?google\.com\/maps\/.*)/i,
                            })}
                        ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input placeholder="محتوي الطرد (إختياري)" fullWidth {...register("category_shipment")}></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Select error={errors?.delivery_type} placeholder="نوع التوصيل" fullWidth {...register("delivery_type")}
                            onChange={(e) => {
                                setDeliveryType(e.target.value as any);
                                register("delivery_type").onChange(e);
                            }}
                        >
                            <MenuItem value="office" >الي المكتب</MenuItem>
                            <MenuItem value="house" >الي باب المنزل</MenuItem>
                        </Select>
                    </Grid>

                    {userData?.person?.company?.encapsulation && (
                        <Grid item xs={12}>
                            <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                                <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                    <Stack direction="row" gap="8px">
                                        <Typography variant="sm" color={grey[600]}>هل يتم تغليف الطرد؟</Typography>
                                        <Typography variant="sm" color={amber[600]}>(+{priceFormatHelper(userData?.person?.company?.encapsulation_price, "د.ج")})</Typography>
                                    </Stack>

                                    <Controller control={control} name="isCoverable" render={({ field: { onChange, onBlur, value } }) => {
                                            return (
                                                <Switch checked={value} onChange={(e) => {onChange(e);setIsCoverable(!isCoverable); }}/>
                                            );
                                        }}
                                    />
                                </Stack>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>خالص في المكتب او لا؟</Typography>

                                <Controller control={control} name="paidInOffice"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return <Switch checked={value} onChange={(e) => {onChange(e)}}></Switch>
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>هل الطرد سهل الكسر؟</Typography>
                                <Controller control={control} name="isFragile"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return <Switch checked={value} onChange={onChange as any}></Switch>;
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>هل يمكن الاطلاع على محتوى الطرد؟</Typography>
                                <Controller control={control} name="isOpenable"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return (<Switch checked={value} onChange={(e) => {onChange(e);setIsOpenable(!isOpenable);}}/>);
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>هل التوصيل تجاري؟</Typography>
                                <Controller control={control} name="isCommercial"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return (
                                            // @ts-ignore
                                            <Switch checked={value}
                                                onChange={(e) => {
                                                    onChange(e);
                                                    setIsCommercial(!isCommercial);
                                                }}
                                            >
                                            </Switch>
                                        );
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    {isCommercial && (
                        <>
                            <Grid item xs={12}>
                                <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                                      <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"} >
                                            <Typography variant="sm" color={grey[600]}>هل ثمن التوصيل يخصم من ثمن الطرد؟</Typography>
                                            <Controller
                                                  control={control}
                                                  name="isFreeDelivery"
                                                  render={({ field: { onChange, onBlur, value } }) => {
                                                        return (<Switch checked={value} onChange={(e) => {onChange(e);setIsFreeDelivery(!isFreeDelivery)}}/>);
                                                  }}
                                            />
                                      </Stack>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Input error={errors?.shipment_price} placeholder="ثمن الطرد" fullWidth {...register("shipment_price")}
                                       onChange={(e) => {
                                           setShipmentPrice(e.target.value as any);
                                           register("shipment_price").onChange(e);
                                       }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <Input fullWidth disabled
                            placeholder={!deliveryPrice ? "عمولة التوصيل" : `${deliveryPriceAfterMeasuremnt} د.ج`}
                            {...register("delivery_tax")}
                            InputProps={{
                                readOnly: true,
                                sx: {"& ::placeholder": {opacity: "1 !important"}},
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input placeholder="رقم الطلب (إختياري)" fullWidth {...register("command_number")}></Input>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>
                                    هل الوزن يتجاوز {userData?.person?.company?.defult_weight?.toString()} كيلو غرام؟
                                </Typography>
                                <Switch onChange={() => setIsExceededSizeLimit(!isExceededSizeLimit)}></Switch>
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack direction={"row"} justifyContent={"space-between"} alignItems="center" height={"100%"}>
                                <Typography variant="sm" color={grey[600]}>
                                    هل الطول الاجمالي للطرد يفوق الـ{userData?.person?.company?.defult_length?.toString()} متر؟
                                </Typography>
                                <Switch onChange={() => setIsExceededMeasureLimit(!isExceededMeasureLimit)}></Switch>
                            </Stack>
                        </Box>
                    </Grid>

                    {isExceededSizeLimit && (
                        <Grid item xs={6}>
                            <Input
                                type="number"
                                InputProps={{ inputProps: { min: userData?.person?.company?.defult_weight } }}
                                error={errors?.shipment_size}
                                placeholder="الوزن (كغ)" fullWidth
                                {...register("shipment_size")}
                                onChange={(e) => {
                                    setMeasurement({...measurement, weight: e.target.value});
                                    register("shipment_size").onChange(e);
                                }}
                            />
                        </Grid>
                    )}

                    {isExceededMeasureLimit && (
                        <>
                            <Grid item xs={6}>
                                <Input
                                    type="number"
                                    InputProps={{ inputProps: { min: userData?.person?.company?.defult_length } }}
                                    error={errors?.shipment_width}
                                    placeholder="الطول (متر)" fullWidth
                                    {...register("shipment_width")}
                                    onChange={(e) => {
                                        setMeasurement({...measurement, width: e.target.value});
                                        register("shipment_width").onChange(e);
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Input
                                    type="number"
                                    InputProps={{ inputProps: { min: userData?.person?.company?.defult_length } }}
                                    error={errors?.shipment_length}
                                    placeholder="العرض (متر)" fullWidth
                                    {...register("shipment_length")}
                                    onChange={(e) => {
                                        setMeasurement({...measurement, length: e.target.value});
                                        register("shipment_length").onChange(e);
                                    }}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <Input
                                    type="number"
                                    InputProps={{ inputProps: { min: userData?.person?.company?.defult_length } }}
                                    error={errors?.shipment_height}
                                    placeholder="الارتفاع (متر)"
                                    fullWidth
                                    {...register("shipment_height")}
                                    onChange={(e) => {
                                        setMeasurement({...measurement, height: e.target.value});
                                        register("shipment_height").onChange(e);
                                    }}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextArea placeholder="ملاحظة (إختياري) " fullWidth minRows={4} maxRows={4} {...register("note")} ></TextArea>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default AddShipmentModal;
