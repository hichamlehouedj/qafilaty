import Quagga from "@ericblade/quagga2";
import {Alert, Chip, Grid, Snackbar, Stack, Typography} from "@mui/material";
import { grey } from "@mui/material/colors";
import { Box } from "@mui/system";
import { ScanLine } from "lucide-react";
import { useSnackbar } from "notistack";
import React, { useEffect, useRef, useState } from "react";
import { Check, X } from "react-feather";
import {useCreateMultiTrace} from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import theme from "../../styles/theme";
import traking_status from "../../utilities/data/tracking_status";
import SocketClient from "../../utilities/lib/socket";
import Button from "../Button";
import onScan from "onscan.js";
import Modal, { Props as ModalProps } from "./Modal";
import ReactLoading from "react-loading";
import { useDebouncedCallback } from "use-debounce";
import {ALL_CLOSE_ENVELOPE_CITY} from "../../graphql/hooks/envelopes/useGetCloseEnvelopeCity";
import {ALL_ENVELOPE_DELIVERY} from "../../graphql/hooks/envelopes/useGetDeliveryEnvelopeCity";
import {useGetAllClients} from "../../graphql/hooks/clients";
import Input from "../Input/Input";
import {useForm} from "react-hook-form";

interface Props extends ModalProps {
    open: boolean;
    // onClose?: (callback?: () => any) => void;
    onClose?: () => void;
    requestStatus?: number;
    oneShipmentInfo?: string;
}

const ChangeTraceManualModal = (props: Props) => {
    const [createRequestMutation, { data: requestData }] = useCreateMultiTrace();
    let userData = useStore((state: any) => state.userData);
    let scanShipmentResult: any = useStore((state: any) => state.scanShipmentResult);
    const [stopScanner, setStopScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [scanCode, setScanCode] = useState(false);
    const [scannedShipments, setScannedShipments] = useState<any>([]);
    const [scanAlert, setScanAlert] = useState<any>({
        status: "info",
        persist: true,
        open: true,
        count: 0,
    });
    let {register, handleSubmit, reset, setError, formState: { errors }} = useForm();
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const isScanningRef = useRef(isScanning);
    const scannedShipmentsRef = useRef(scannedShipments);

    const statusChangable = [1, 2, 3, 5, 16, 21, 10, 28, 31, 34];

    let scanWaitingStatusDelayed = useDebouncedCallback(() => {
        setScanAlert((prev: any) => ({ ...prev, status: "info", persist: false, open: true }));
    }, 2500);

    // get all shipments
    let [allClientStock] = useGetAllClients({
        stock_id: userData?.person?.list_stock_accesses?.stock?.id
    });

    useEffect(() => {
        isScanningRef.current = isScanning;
        if (isScanning) {
            setScanAlert({ status: "info", persist: false, count: 0, open: true });
        } else {
            setScanAlert({ status: "info", persist: false, count: 0, open: false });
        }
    }, [isScanning]);

    useEffect(() => {
        scannedShipmentsRef.current = scannedShipments;
    }, [scannedShipments]);

    useEffect(() => {
        // scanWaitingStatus();
        // console.log("ShipPhisicalScannerModal ~ props.open", props.open);
        if (props.open) {
            setScanAlert((prev: any) => ({ ...prev, open: true }));
            setIsScanning(true);
        } else {
            setScannedShipments([]);
            setIsScanning(false);
            setScanAlert({ status: "info", persist: false, count: 0, open: false });
        }
    }, [props.open]);

    let onFormSubmit = ({codeBox}: any) => {
        let shipmentCode: any =  codeBox;

        if (isScanningRef.current) {
            if (shipmentCode.toLowerCase().match(/^(qaf)-\w+/g) || shipmentCode.toLowerCase().match(/^(env)-\w+/g)) {
                SocketClient.io?.emit("status", {codeBox: shipmentCode}, (e: any) => {
                    console.log("🚀 ~ file: scan", e);

                    SocketClient.io?.once("statusBox", (data) => {
                        if (shipmentCode.split("-")[0].toLowerCase() == "qaf") {
                            if (!scannedShipmentsRef.current.find((shipment: any) => shipment.code == shipmentCode)) {
                                setScannedShipments((prev: any) => [...prev, { ...data, code: shipmentCode },]);
                                setScanAlert((prev: any) => ({ ...prev, status: "success", count: prev.count + 1 }));
                            } else {
                                setScanAlert((prev: any) => ({ ...prev, status: "warning" }));
                            }
                        } else if (shipmentCode.split("-")[0].toLowerCase() == "env") {
                            if (!scannedShipmentsRef.current.find((shipment: any) => shipment.code == data?.[0]?.code_envelope)) {
                                console.log(scannedShipmentsRef.current)
                                data.map((box: any, index: number) => {
                                    setScannedShipments((prev: any) => [...prev, {
                                        ...box,
                                        code: index == 0 ? box.code_envelope : box.code_envelope.split("-")[1]
                                    }]);
                                    setScanAlert((prev: any) => ({ ...prev, status: "success", count: prev.count + 1 }));
                                })
                            } else {
                                setScanAlert((prev: any) => ({ ...prev, status: "warning" }));
                            }
                        }
                    })
                });
            } else {
                setScanAlert((prev: any) => ({ ...prev, status: "error" }));
            }

            reset({codeBox: ""})
        }
        scanWaitingStatusDelayed();
    }

    const submitHandler = () => {
        setSubmitLoading(true);
        const scannedShipmentsFiltred = scannedShipments.filter((shipment: any) => statusChangable.includes(shipment?.status))
        let res = scannedShipmentsFiltred.map((shipment: any, i: number) => {
            return {
                id_box: shipment?.id_box,
                status: [1, 2, 3].includes(shipment?.status) ? 4 :
                    shipment?.status == 10 ?
                        (allClientStock.filter((client: any) => client.id == shipment.id_client)).length > 0 ? 12 : 11
                        : [28, 31].includes(shipment?.status) ? shipment?.status + 1 :
                            shipment?.status == 34 ? 15 : shipment?.status - 1
            };
        });
        createRequestMutation({
            variables: {
                content: {
                    boxTrace: res,
                    id_person: userData?.person?.id,
                    id_stock: userData?.person?.list_stock_accesses?.stock?.id,
                    id_company: userData?.person?.company?.id,
                    note: "",
                },
            },
            refetchQueries: [ALL_CLOSE_ENVELOPE_CITY, ALL_ENVELOPE_DELIVERY]
        }).then((res) => {
            closeHandler()
        })
        .catch((e) => {
            closeHandler()
        })
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        typeof props.onClose == "function" && props.onClose();
        setSubmitLoading(false);
    };

    return (
        <>
            <Snackbar open={scanAlert.open} autoHideDuration={6000} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
                <Alert
                    severity={scanAlert?.status}
                    icon={scanAlert?.status == "info" ? false : ""}
                    sx={{ width: "100%", alignItems: "center" }}
                >
                    <Stack direction="row" gap="14px" alignItems={"center"}>
                        {scanAlert?.status == "info" && (
                            <ReactLoading
                                type={"spokes"}
                                color={theme.palette?.["info"]?.main}
                                height={"22px"}
                                width={"22px"}
                            />
                        )}
                        {scanAlert?.status == "info" && (
                            <Typography variant="xs">في إنتظار عملية الادخال!</Typography>
                        )}

                        {scanAlert?.status == "success" && (
                            <Typography variant="xs">تم إضافة طرد +{scanAlert.count}</Typography>
                        )}

                        {scanAlert?.status == "error" && (
                            <Typography variant="xs">كود الطرد غير صحيح!</Typography>
                        )}

                        {scanAlert?.status == "warning" && (
                            <Typography variant="xs">تم إدخال هذه الطرد مسبقا!</Typography>
                        )}
                    </Stack>
                </Alert>
            </Snackbar>
            <Modal {...props} width="580px"
                // keepMounted
                footer={
                    <>
                        <Stack direction="row" justifyContent={"end"} width="100%">
                            <Stack direction="row" gap="6px">
                                <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                                <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_request" disabled={!scannedShipments.length} onClick={submitHandler}>تأكيد</Button>
                            </Stack>
                        </Stack>
                    </>
                }
            >
                <Box margin="-16px -20px">
                    <Stack rowGap={"16px"} padding="14px 20px">
                        <Box>
                            <Stack direction="row" alignItems="center" width={"100%"} sx={{borderBottom: "1px dashed #CCC", padding: "8px 0px",}}>
                                <form  onSubmit={handleSubmit(onFormSubmit)} style={{position: "relative", height: "42px", display: "flex", alignItems: "center"}}>
                                    <Input  placeholder="كود الشحنة" fullWidth {...register("codeBox", { required: true })} />
                                    <Button style={{position: "absolute", left: "2px", height: "38px", top: "2px",}}
                                        type="submit" variant="contained" color="primary" >مسح</Button>
                                </form>
                                <Typography variant="xs" flex="1 0" color={grey[600]}>
                                    <Stack direction="row" justifyContent={"flex-end"} gap="4px">
                                        <Box component={"span"} fontSize="18">إجمالي الطرود:</Box>
                                        <Box component={"span"} color={theme.palette.primary.main} fontSize="16px">{scannedShipments.length}</Box>
                                    </Stack>
                                </Typography>
                            </Stack>
                        </Box>

                        <Stack direction={"row"} gap="8px" flexWrap={"wrap"}>
                            {scannedShipments?.map((shipment: any, i: number) => (

                                shipment.code.split("-")[0].toLowerCase() == "qaf"
                                    ? <Chip key={i} label={shipment.code}
                                         sx={{
                                             fontSize: 13, bgcolor: "primary.main", color: "#FFF",
                                             ...([24].includes(shipment.status) && {
                                                 bgcolor: traking_status[24].color,
                                                 color: "#FFF"
                                             }),
                                             ...([26].includes(shipment.status) && {
                                                 bgcolor: traking_status[26].color,
                                                 color: "#FFF"
                                             }),
                                         }}
                                         onDelete={() => {
                                             setScannedShipments((prev: any) => {
                                                 return prev?.filter((prevshipment: any) => prevshipment.code != shipment.code);
                                             });
                                         }}
                                    />
                                    : shipment.code.split("-")[0].toLowerCase() == "env"
                                        ? <Chip key={i} label={shipment.code}
                                             sx={{
                                                 fontSize: 13, bgcolor: "primary.main", color: "#FFF",
                                             }}
                                             onDelete={() => {
                                                 setScannedShipments((prev: any) => {
                                                     return prev?.filter((prevshipment: any) => prevshipment.code_envelope != shipment.code);
                                                 });
                                             }}
                                        />
                                        : null
                            ))}
                        </Stack>
                    </Stack>

                    {scannedShipments.length == 0 && (
                        <Stack justifyContent={"center"} sx={{textAlign: "center", marginBottom: "28px",}}>
                            <Box component={"img"} width="72px" src="/empty2.svg" sx={{margin: "0px auto", marginBottom: "10px"}}/>
                            <Typography variant="sm" color={grey[500]}>لايوجد طرود</Typography>
                        </Stack>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default ChangeTraceManualModal;