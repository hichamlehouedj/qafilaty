import {Grid, Stack, Typography, Alert} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal from "./Modal";
import {useCollectedAmounts} from "../../graphql/hooks/shipments";
import {useSnackbar} from "notistack";
import {grey, red, green} from "@mui/material/colors";
import {ALL_CLIENT_BOXES} from "../../graphql/hooks/shipments/useGetAllClientShipments";
import {matchSorter} from "match-sorter";

interface Props {
    open: boolean;
    onClose?: () => void;
    returnedBox?: object[];
    title?: string;
    idClient?: string;
}

interface TraceBox {
    id_box: string;
    status: number;
}

const ReturnModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    const [createInvoiceTrace] = useCollectedAmounts();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    const [totalAmountsCompany, setTotalAmountsCompany] = useState(0)
    const [totalBox, setTotalBox] = useState(0)
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);

    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        if (props.returnedBox != undefined) {
            let Ids: string[] = [];

            for (let i = 0; i < props.returnedBox.length; i++) {
                Ids.push(
                    // @ts-ignore
                    props.returnedBox[i]?.id
                )
            }

            if (Ids.length > 0) {
                createInvoiceTrace({
                    variables: {
                        content: {
                            idS: Ids,
                            status: 18,
                            note: note,
                            id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                            id_person: userData?.person?.id
                        }
                    },
                    update: (cache, { data: { createInvoiceTrace } }) => {

                        let cacheData: object | null = {}

                        cacheData = cache.readQuery({
                            query: ALL_CLIENT_BOXES,
                            variables: { idClient: props.idClient }
                        });

                        console.log("createInvoiceTrace => ", createInvoiceTrace)

                        let idBoxs: string[] = [];
                        for (let i = 0; i < createInvoiceTrace.length; i++) {
                            idBoxs.push(createInvoiceTrace[i]?.box?.id)
                        }

                        console.log("idBoxs => ", idBoxs)

                        let filterData: object[] = [];
                        if (typeof cacheData === 'object' && cacheData !== null && 'boxClient' in cacheData) {

                            console.log("cacheData => ", cacheData)

                            idBoxs.map(id => {
                                // @ts-ignore
                                let box = matchSorter(cacheData?.boxClient, id, {keys: ["id"]})

                                // @ts-ignore
                                let findIndex = cacheData?.boxClient?.findIndex((box: any) => box.id === id);

                                // @ts-ignore
                                filterData.push({box: box[0], index: findIndex})
                            })

                        }

                        // @ts-ignore
                        let newData = [...cacheData?.boxClient];

                        filterData.map(data => {
                            createInvoiceTrace.map((trace: any) => {
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

                        cache.writeQuery({
                            query: ALL_CLIENT_BOXES,
                            variables: { idClient: props.idClient },
                            data: {
                                boxClient: newData,
                            },
                        });
                    }
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
        closeHandler();
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        typeof props.onClose == "function" && props.onClose();
        reset({note: "" });
        setSubmitLoading(false);
    };

    useEffect(() => {
        if (props.returnedBox != undefined) {
            setTotalBox(props.returnedBox.length)
        }
    }, [props.returnedBox])

    useEffect(() => {
        setTotalAmountsCompany(totalBox * userData?.person?.company?.return_price)
    }, [totalBox])

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
                    <Grid item xs={12}>
                        <Alert variant="outlined" severity="success" style={{borderColor: grey[400]}} icon={false}>
                            <Typography variant="2xs" color={grey[700]}>
                                عمولة الإرجاع على كل طرد
                                <Typography variant="sm" fontWeight={700} color={grey[700]}  marginLeft={0.5} marginRight={1} >{`${userData?.person?.company?.return_price} دج`}</Typography>
                            </Typography>
                        </Alert>
                    </Grid>

                    <Grid item xs={6} >
                        <Stack direction="column" spacing={2} style={{background: "#fff", height: "80px"}} justifyContent="center" alignItems={"center"}>
                            <Typography variant="xl" color={red[600]}>{`${totalBox}`}</Typography>
                            <Typography variant="xs" color={grey[600]}>عدد الطرود المرجعة</Typography>
                        </Stack>
                    </Grid>

                    <Grid item xs={6} >
                        <Stack direction="column" spacing={2} style={{background: "#fff", height: "80px"}} justifyContent="center" alignItems={"center"}>
                            <Typography variant="xl" color={green[600]}>{`${totalAmountsCompany} دج`}</Typography>
                            <Typography variant="xs" color={grey[600]}>صافي مستحقات الشركة </Typography>
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

export default ReturnModal;
