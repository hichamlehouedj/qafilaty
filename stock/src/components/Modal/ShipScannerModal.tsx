import Quagga from "@ericblade/quagga2";
import { Chip, Grid, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Box } from "@mui/system";
import { ListChecks, Plus, Scan, ScanLine } from "lucide-react";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { Check, X } from "react-feather";
import useStore from "../../store/useStore";
import theme from "../../styles/theme";
import traking_status from "../../utilities/data/tracking_status";
import SocketClient from "../../utilities/lib/socket";
import Button from "../Button";
import Scanner from "../Scanner/Scanner";
import Modal, { Props as ModalProps } from "./Modal";

interface Props extends ModalProps {
    open: boolean;
    // onClose?: (callback?: () => any) => void;
    onClose?: () => void;
    requestStatus?: number;
    oneShipmentInfo?: string;
}

const ShipScannerModal = (props: Props) => {
    let userData = useStore((state: any) => state.userData);
    let scanShipmentResult: any = useStore((state: any) => state.scanShipmentResult);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [stopScanner, setStopScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanCode, setScanCode] = useState(false);
    const [scannedShipments, setScannedShipments] = useState<any>([]);
    let [submitLoading, setSubmitLoading] = useState<boolean>(false);

    const statusChangable = [2, 4, 6, 15, 20];

    const submitHandler = () => {
        setSubmitLoading(true);
        let res = scannedShipments.map((shipment: any, i: number) => {
            return {
                id_box: shipment?.id_box,
                status: statusChangable.includes(shipment?.status)
                    ? shipment?.status + 1
                    : shipment?.status,
            };
        });
        // createRequestMutation({
        //     variables: {
        //         content: {
        //             boxTrace: res,
        //             id_person: userData?.person?.id,
        //             id_stock: userData?.stock_accesses?.[0]?.id_stock,
        //             note: "",
        //         },
        //     },
        // }).then((res) => {
        //     // closeHandler()
        // });
        setSubmitLoading(false);
    };

    const closeHandler = () => {
        // setStopScanner(true);
        // Quagga.pause();
        Quagga.offProcessed();
        Quagga.offDetected();
        Quagga.stop();
        typeof props.onClose == "function" && props.onClose();
        setSubmitLoading(false);
    };

    useEffect(() => {
        if (scanShipmentResult) {
            let res: any = { ...scanShipmentResult, code: scanCode };
            setScannedShipments((prev: any) => [...prev, res]);
        }
    }, [scanShipmentResult]);

    useEffect(() => {
        if (props.open) {
            setScannedShipments([]);
            setIsScanning(false);
        }
    }, [props.open]);

    return (
        <Modal {...props} width="580px"
            footer={
                <Stack direction="row" justifyContent={"space-between"} width="100%" >
                    <Button
                        startIcon={isScanning ? <ListChecks /> : <ScanLine />}
                        variant="contained"
                        color="secondary"
                        type="submit"
                        form="add_request"
                        onClick={() => setIsScanning(!isScanning)}
                    >
                        {isScanning ? "عرض الطرود" : "إدخال طرد"}
                    </Button>

                    <Stack direction="row" gap="6px">
                        <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                        <Button loading={submitLoading} startIcon={<Check/>} variant="contained" color="primary" type="submit" form="add_request" disabled={!scannedShipments.length} onClick={submitHandler}>تأكيد</Button>
                    </Stack>
                </Stack>
            }
        >
            <Box margin="-16px -20px">
                {(isScanning && (
                    <Scanner
                        onDetectedForShipping={(result: any, callback: any) => {
                            // @ts-ignore
                            SocketClient?.io?.emit("status", {codeBox: result});
                            setScanCode(result);
                            setIsScanning(false);
                            callback();
                        }}
                        isScan={"SHIPPING_SCAN"}
                    />
                )) || (
                    <Stack rowGap={"16px"} padding="14px 20px">
                        <Box>
                            <Stack direction="row" width={"100%"} sx={{borderBottom: "1px dashed #CCC", padding: "8px 0px",}}>
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
                                <Chip
                                    key={i}
                                    label={shipment.code}
                                    sx={{
                                        fontSize: 13, bgcolor: "primary.main", color: "#FFF",
                                        ...([24].includes(shipment.status) && {bgcolor: traking_status[24]?.color, color: "#FFF"}),
                                        ...([26].includes(shipment.status) && {bgcolor: traking_status[26]?.color, color: "#FFF"}),
                                    }}
                                    onDelete={() => {
                                        setScannedShipments((prev: any) => {
                                            return prev?.filter((prevshipment: any) => prevshipment.code != shipment.code);
                                        });
                                    }}
                                />
                            ))}
                        </Stack>
                    </Stack>
                )}

                {!isScanning && scannedShipments.length == 0 && (
                    <Stack justifyContent={"center"} sx={{textAlign: "center", marginBottom: "28px"}}>
                        <Box component={"img"} width="72px" src="/empty2.svg" sx={{margin: "0px auto", marginBottom: "10px"}}/>
                        <Typography variant="sm" color={grey[500]}>لايوجد الطرود</Typography>
                    </Stack>
                )}
            </Box>
        </Modal>
    );
};

export default ShipScannerModal;