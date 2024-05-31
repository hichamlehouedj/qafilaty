import {Grid, Stack, Typography, Alert} from "@mui/material";
import React, {useEffect, useState} from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Modal from "./Modal";
import {useCreateMultiTrace} from "../../graphql/hooks/shipments";
import {useSnackbar} from "notistack";
import {grey, red, green} from "@mui/material/colors";
import {ALL_DRIVER_BOXES} from "../../graphql/hooks/shipments/useGetAllDriverShipments";
import {matchSorter} from "match-sorter";

interface Props {
    open: boolean;
    onClose?: () => void;
    failedBox?: object[];
    title?: string;
    idDriver?: string;
}

interface TraceBox {
    id_box: string;
    status: number;
}

const FailedModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    const [createMultiTrace] = useCreateMultiTrace();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    let {register, handleSubmit, watch, reset, control, formState: { errors },} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [totalBox, setTotalBox] = useState(0)

    let onFormSubmit = ({ note }: any) => {
        setSubmitLoading(true);
        if (props.failedBox != undefined) {
            let Ids: TraceBox[] = [];

            for (let i = 0; i < props.failedBox.length; i++) {
                Ids.push({
                    // @ts-ignore
                    id_box: props.failedBox[i]?.id,
                    status: 29
                })
            }

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

                            console.log("cacheData => ", cacheData)

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
        if (props.failedBox != undefined) {
            setTotalBox(props.failedBox.length)
        }
    }, [props.failedBox, props.open])

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
                                عدد الطرود عند هذا السائق :
                                <Typography variant="sm" fontWeight={700} color={grey[700]}  marginLeft={0.5} marginRight={1} >{totalBox}</Typography>
                            </Typography>
                        </Alert>
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

export default FailedModal;
