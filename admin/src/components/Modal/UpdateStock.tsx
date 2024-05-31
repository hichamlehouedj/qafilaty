import { Box, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { AnyAaaaRecord } from "dns";
import React, { useEffect, useState } from "react";
import { Check, Plus, X } from "react-feather";
import { Controller, useForm } from "react-hook-form";
import { useCreateShipment } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import Input from "../Input/Input";
import Select from "../Input/Select";
import TextArea from "../Input/TextArea";
import Switch from "../Switch";
import Modal from "./Modal";
import algerian_provinces from "../../utilities/data/api/algeria_provinces.json";
import { useSnackbar } from "notistack";
interface Props {
    open: boolean;
    onClose?: () => void;
}

const initialInputs = {
    category_shipment: undefined,
    command_number: "",
    delivery_tax: undefined,
    delivery_type: undefined,
    isCommercial: false,
    isFragile: false,
    isFreeDelivery: false,
    recipient_address: "",
    recipient_city: undefined,
    recipient_name: "",
    recipient_phone: "",
    shipment_price: "",
};

const AddShipmentModal = ({ open, onClose }: Props) => {
    let {
        register,
        handleSubmit,
        watch,
        reset,
        control,
        formState: { errors },
    } = useForm();
    let [isCommercial, setIsCommercial] = useState(false);
    let [isFreeDelivery, setIsFreeDelivery] = useState(false);
    let [isExceededSizeLimit, setIsExceededSizeLimit] = useState(false);
    let [isExceededMeasureLimit, setIsExceededMeasureLimit] = useState(false);
    let [createShipmenet] = useCreateShipment();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    let onFormSubmit = ({
                            category_shipment,
                            command_number,
                            delivery_tax,
                            delivery_type,
                            isCommercial,
                            isFragile,
                            isFreeDelivery,
                            recipient_address,
                            recipient_city,
                            recipient_name,
                            recipient_phone,
                            shipment_price,
                            isPickUp,
                            shipment_width,
                            shipment_length,
                            shipment_height,
                            shipment_size,
                            note,
                        }: any) => {
        createShipmenet({
            variables: {
                content: {
                    id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                    id_person: userData?.person?.id,
                    id_client: userData?.id,
                    recipient_name: recipient_name,
                    recipient_phone1: recipient_phone,
                    recipient_phone2: "",
                    recipient_city: recipient_city,
                    recipient_address: recipient_address,
                    categorie: category_shipment,
                    delivery_type: delivery_type,
                    fragile: isFragile,
                    price_box: isCommercial ? parseInt(shipment_price) : 0,
                    price_delivery: parseInt(delivery_tax) || 100,
                    payment_type: isFreeDelivery ? "free" : "normal",
                    status_box: isPickUp ? 2 : 1,
                    command_number: command_number,
                    height_box: shipment_height || "",
                    width_box: shipment_width || "",
                    length_box: shipment_length || "",
                    weight_box: shipment_size || "",
                    note: note,
                    TVA: 1,
                    // extra
                },
            },
        })
            .then(() => {
                enqueueSnackbar("لقد تمت إضافة شحنة بنجاح", {
                    variant: "success",
                });
                closeHandler();
            })
            .catch(() => {
                closeHandler();
            });
    };

    const closeHandler = () => {
        reset(initialInputs);
        setIsCommercial(false);
        setIsFreeDelivery(false);
        setIsExceededMeasureLimit(false);
        setIsExceededSizeLimit(false);
        typeof onClose == "function" && onClose();
    };

    return (
        <Modal
            open={open}
            onClose={closeHandler}
            title="إضافة شحنة"
            iconTitle={<Plus></Plus>}
            width="640px"
            footer={
                <>
                    <Button
                        startIcon={<X></X>}
                        variant="outlined"
                        color="primary"
                        onClick={closeHandler as any}
                    >
                        إلغاء
                    </Button>
                    <Button
                        startIcon={<Check></Check>}
                        variant="contained"
                        color="primary"
                        type="submit"
                        form="add_shipment"
                    >
                        تأكيد
                    </Button>
                </>
            }
        >
            <form id="add_shipment" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container boxSizing={"border-box"} spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Input
                            error={errors?.recipient_name}
                            placeholder="إسم المستلم"
                            fullWidth
                            {...register("recipient_name", { required: true })}
                        ></Input>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            error={errors?.recipient_phone}
                            placeholder="رقم الهاتف"
                            fullWidth
                            {...register("recipient_phone", { required: true })}
                        ></Input>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Select
                            error={errors?.recipient_city}
                            placeholder="إختر المدينة"
                            fullWidth
                            {...register("recipient_city", { required: true })}
                        >
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
                        <Input
                            error={errors?.recipient_address}
                            placeholder="العنوان"
                            fullWidth
                            {...register("recipient_address", { required: true })}
                        ></Input>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Input
                            placeholder="محتوي الشحنة (إختياري)"
                            fullWidth
                            {...register("category_shipment")}
                        ></Input>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Select
                            error={errors?.delivery_type}
                            placeholder="نوع التوصيل"
                            fullWidth
                            {...register("delivery_type", { required: true })}
                        >
                            <MenuItem value="office">الي المكتب</MenuItem>
                            <MenuItem value="house">الي باب المنزل</MenuItem>
                        </Select>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems="center"
                                height={"100%"}
                            >
                                <Typography variant="sm" color={grey[600]}>
                                    هل تطلب سائق لاستلام الشحنة؟
                                </Typography>

                                <Controller
                                    control={control}
                                    name="isPickUp"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return (
                                            <Switch
                                                checked={value}
                                                onChange={(e) => {
                                                    onChange(e);
                                                }}
                                            ></Switch>
                                        );
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems="center"
                                height={"100%"}
                            >
                                <Typography variant="sm" color={grey[600]}>
                                    هل الشحنة سهلة الكسر؟
                                </Typography>
                                <Controller
                                    control={control}
                                    name="isFragile"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return <Switch checked={value} onChange={onChange as any}></Switch>;
                                    }}
                                />
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems="center"
                                height={"100%"}
                            >
                                <Typography variant="sm" color={grey[600]}>
                                    هل التوصيل تجاري؟
                                </Typography>
                                {/* <Switch
                  checked={isCommercial}
                  onChange={() => setIsCommercial(!isCommercial)}
                ></Switch> */}
                                <Controller
                                    control={control}
                                    name="isCommercial"
                                    render={({ field: { onChange, onBlur, value } }) => {
                                        return (
                                            <Switch
                                                checked={value}
                                                onChange={(e) => {
                                                    onChange(e);
                                                    setIsCommercial(!isCommercial);
                                                }}
                                            ></Switch>
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
                                    <Stack
                                        direction={"row"}
                                        justifyContent={"space-between"}
                                        alignItems="center"
                                        height={"100%"}
                                    >
                                        <Typography variant="sm" color={grey[600]}>
                                            هل ثمن التوصيل يخصم من ثمن الشحنة؟
                                        </Typography>

                                        <Controller
                                            control={control}
                                            name="isFreeDelivery"
                                            render={({ field: { onChange, onBlur, value } }) => {
                                                return (
                                                    <Switch
                                                        checked={value}
                                                        onChange={(e) => {
                                                            onChange(e);
                                                            setIsFreeDelivery(!isFreeDelivery);
                                                        }}
                                                    ></Switch>
                                                );
                                            }}
                                        />
                                    </Stack>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Input
                                    error={errors?.shipment_price}
                                    placeholder="ثمن الشحنة"
                                    fullWidth
                                    {...register("shipment_price", { required: true })}
                                ></Input>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12} sm={6}>
                        <Input
                            placeholder="عمولة التوصيل"
                            fullWidth
                            disabled
                            {...register("delivery_tax")}
                        ></Input>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Input
                            placeholder="رقم الطلب (إختياري)"
                            fullWidth
                            {...register("command_number")}
                        ></Input>
                    </Grid>

                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems="center"
                                height={"100%"}
                            >
                                <Typography variant="sm" color={grey[600]}>
                                    هل الوزن يتجاوز 5 كيلو غرام؟
                                </Typography>
                                <Switch onChange={() => setIsExceededSizeLimit(!isExceededSizeLimit)}></Switch>
                            </Stack>
                        </Box>
                    </Grid>
                    <Grid item xs={12}>
                        <Box bgcolor={"white"} height={"48px"} padding={"0 16px"} borderRadius="2px">
                            <Stack
                                direction={"row"}
                                justifyContent={"space-between"}
                                alignItems="center"
                                height={"100%"}
                            >
                                <Typography variant="sm" color={grey[600]}>
                                    هل الطول الاجمالي للشحنة يفوق الـ 5 متر؟
                                </Typography>
                                <Switch
                                    onChange={() => setIsExceededMeasureLimit(!isExceededMeasureLimit)}
                                ></Switch>
                            </Stack>
                        </Box>
                    </Grid>
                    {isExceededSizeLimit && (
                        <Grid item xs={6}>
                            <Input
                                error={errors?.shipment_size}
                                placeholder="الوزن (كغ)"
                                fullWidth
                                {...register("shipment_size", { required: true })}
                            ></Input>
                        </Grid>
                    )}

                    {isExceededMeasureLimit && (
                        <>
                            <Grid item xs={6}>
                                <Input
                                    error={errors?.shipment_width}
                                    placeholder="الطول (متر)"
                                    fullWidth
                                    {...register("shipment_width", { required: true })}
                                ></Input>
                            </Grid>

                            <Grid item xs={6}>
                                <Input
                                    error={errors?.shipment_length}
                                    placeholder="العرض (متر)"
                                    fullWidth
                                    {...register("shipment_length", { required: true })}
                                ></Input>
                            </Grid>

                            <Grid item xs={6}>
                                <Input
                                    error={errors?.shipment_height}
                                    placeholder="الارتفاع (متر)"
                                    fullWidth
                                    {...register("shipment_height", { required: true })}
                                ></Input>
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <TextArea
                            placeholder="ملاحظة (إختياري) "
                            fullWidth
                            minRows={4}
                            maxRows={4}
                            {...register("note")}
                        ></TextArea>
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default AddShipmentModal;
