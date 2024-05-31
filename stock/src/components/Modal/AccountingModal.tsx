import {Alert, Chip as ChipM, Divider, Grid, Stack, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal, { Props as ModalProps } from "./Modal";
import {useCreateMultiTrace} from "../../graphql/hooks/shipments";
import {useSnackbar} from "notistack";
import {green, grey, red} from "@mui/material/colors";
import {ALL_DRIVER_BOXES} from "../../graphql/hooks/shipments/useGetAllDriverShipments";
import {matchSorter} from "match-sorter";
import {ALL_DRIVER_BOXES_DELIVERED} from "../../graphql/hooks/shipments/useDeliveredDriverBox";

interface Props {
    open: boolean;
    onClose?: () => void;
    delivered?: object[];
    title?: string;
    idDriver?: string;
}

interface TraceBox {
    id_box: string;
    status: number;
}

const AccountingModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [createMultiTrace] = useCreateMultiTrace();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    const [totalBox, setTotalBox] = useState(0)
    const [totalPrice, setTotalPrice] = useState(0)
    const [totalPriceBox, setTotalPriceBox] = useState(0)
    const [totalCommission, setTotalCommission] = useState(0)
    const [totalPriceInOffice, setTotalPriceInOffice] = useState(0)
    const [totalPricePaymentFree, setTotalPricePaymentFree] = useState(0)

    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        if (props.delivered != undefined) {
            let Ids: TraceBox[] = [];
            for (let i = 0; i < props.delivered.length; i++) {
                // @ts-ignore
                if (props.delivered[i]?.lastTrace[0]?.status == 8) {
                    Ids.push({
                        // @ts-ignore
                        id_box: props.delivered[i]?.id,
                        status: 9
                    })
                    // @ts-ignore
                } else if (props.delivered[i]?.lastTrace[0]?.status == 10) {
                    // @ts-ignore
                    if(props.delivered[i]?.client?.person?.list_stock_accesses?.stock?.id === userData?.person?.list_stock_accesses?.stock.id) {
                        Ids.push({
                            // @ts-ignore
                            id_box: props.delivered[i]?.id,
                            status: 12
                        })
                    } else {
                        Ids.push({
                            // @ts-ignore
                            id_box: props.delivered[i]?.id,
                            status: 11
                        })
                    }
                }
            }

            // console.log("Ids ", Ids)

            if (Ids.length > 0) {
                createMultiTrace({
                    variables: {
                        content: {
                            boxTrace: Ids,
                            note: note,
                            id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                            id_person: userData?.person?.id,
                            id_company: userData?.person?.company?.id,
                        }
                    },
                    update: (cache, { data: { createMultiTrace } }) => {

                        let cacheData: object | null = {}

                        cacheData = cache.readQuery({
                            query: ALL_DRIVER_BOXES,
                            variables: { idDriver: props.idDriver }
                        });

                        console.log("createMultiTrace => ", createMultiTrace)

                        let idBoxs: string[] = [];
                        for (let i = 0; i < createMultiTrace.length; i++) {
                            idBoxs.push(createMultiTrace[i]?.box?.id)
                        }

                        console.log("idBoxs => ", idBoxs)

                        let filterData: object[] = [];
                        if (typeof cacheData === 'object' && cacheData !== null && 'boxDriver' in cacheData) {
                            idBoxs.map(id => {
                                // @ts-ignore
                                let box = matchSorter(cacheData?.boxDriver, id, {keys: ["id"]})
                                // @ts-ignore
                                let findIndex = cacheData?.boxDriver?.findIndex((box: any) => box.id === id);
                                // @ts-ignore
                                filterData.push({box: box[0], index: findIndex})
                            })
                        }

                        // @ts-ignore
                        let newData = [...cacheData?.boxDriver];

                        console.log("newData 1 => ", newData)

                        filterData.map(data => {
                            createMultiTrace.map((trace: any) => {
                                // @ts-ignore
                                if(trace.box.id === data?.box?.id) {
                                    let updatedData = {
                                        // @ts-ignore
                                        ...data?.box,
                                        lastTrace: [{
                                            status: trace.status,
                                            stock: {
                                                id: trace.stock.id,
                                                __typename: "Stock"
                                            },
                                            __typename: "BoxTrace"
                                        }]
                                    }


                                    // @ts-ignore
                                    newData.splice(data?.index, 1, updatedData);
                                }
                            })
                        })

                        console.log("newData 2 => ", newData)

                        cache.writeQuery({
                            query: ALL_DRIVER_BOXES,
                            variables: { idDriver: props.idDriver },
                            data: {
                                boxDriver: newData,
                            },
                        });
                    },
                    refetchQueries: [ALL_DRIVER_BOXES_DELIVERED]
                })
                    .then(() => {
                        enqueueSnackbar("لقد تمت الدفع بنجاح", {variant: "success", autoHideDuration: 5000});
                    }).catch((error) => {
                    console.error(error)
                });
                // .catch(({graphQLErrors}) => {
                //     console.log(graphQLErrors)
                // });
            } else {
                enqueueSnackbar("لا توجد اموال لدفعها", {variant: "error", autoHideDuration: 5000});
            }
        }
        setSubmitLoading(false);
        closeHandler();
    };

    useEffect(() => {
        if (props.delivered != undefined) {
            let Price = 0;
            let PriceBox = 0;
            let PriceInOffice = 0;
            let Commission = 0;
            let PaymentFree = 0;

            setTotalBox(props.delivered.length)
            props.delivered.map((box: any) => {
                PriceBox += box.price_box
                if (box.paid_in_office) {
                    Price += box.price_box
                    PriceInOffice += box.price_delivery
                } else if (box?.price_box > 0 && box?.payment_type == "free") {
                    // @ts-ignore
                    Price += box.price_box
                    PaymentFree += box.price_delivery
                    Commission += box.price_delivery
                } else {
                    Price += box.price_box + box.price_delivery
                    Commission += box.price_delivery
                }
            })
            setTotalPrice(Price)
            setTotalCommission(Commission)
            setTotalPricePaymentFree(PaymentFree)
            setTotalPriceInOffice(PriceInOffice)
            setTotalPriceBox(PriceBox)
        }
    }, [props.delivered, props.open])

    const closeHandler = () => {
        typeof props.onClose == "function" && props.onClose();
        reset({note: "" });
    };

    return (
        <Modal {...props} width="640px" title={props.title}
               footer={
                   <>
                       <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                       <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_request">تأكيد</Button>
                   </>
               }
        >
            <form id="add_request" onSubmit={handleSubmit(onFormSubmit)}>
                <Grid container sm="auto" rowSpacing={3} columnSpacing={2} marginBottom={"25px"} direction="row" justifyContent="space-between" alignItems={"center"}>
                    <Grid container xs={12} marginTop={"20px"} paddingLeft={"16px"} direction="row" >
                        <Stack direction="column" spacing={0} style={{background: "#fff", width: "50%"}} justifyContent="center" alignItems={"center"} padding={"10px"}>
                            <Typography flex={0.5} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>الطرود</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>مبالغ الطرود</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>عمولة في المكتب</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>توصيل مجاني</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>إجمالي العمولات</Typography>
                        </Stack>

                        <Stack direction="column" spacing={0} style={{background: "#fff", width: "50%"}} justifyContent="center" alignItems={"center"} padding={"10px"}>
                            <Typography flex={0.5} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>{totalBox}</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>{`${totalPriceBox} دج`}</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>{`${totalPriceInOffice} دج`}</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>{`${totalPricePaymentFree} دج`}</Typography>
                            <Divider orientation="horizontal" flexItem />
                            <Typography flex={1.2} variant="sm" padding={"10px 0"} color={grey[600]} textAlign={"center"}>{`${totalCommission} دج`}</Typography>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} >
                        <Stack direction="column" spacing={2} style={{background: "#fff", height: "80px"}} justifyContent="center" alignItems={"center"}>
                            <Typography variant="xl" color={green[600]}>{`${totalPrice} دج`}</Typography>
                            <Typography variant="xs" color={grey[600]}>إجمالي الأموال عند السائق</Typography>
                        </Stack>
                    </Grid>
                </Grid>

                <Grid container>
                    <Grid item xs={12}>
                        <TextArea placeholder="ملاحظة (إختياري)" fullWidth minRows={6} maxRows={12}{...register("note")} />
                    </Grid>
                </Grid>
            </form>
        </Modal>
    );
};

export default AccountingModal;
