import Quagga from "@ericblade/quagga2";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { X } from "react-feather";
import { useCreateRequest } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import Scanner from "../Scanner/Scanner";
import Modal  from "./Modal";

interface Props {
    open: boolean;
    // onClose?: (callback?: () => any) => void;
    onClose?: () => void;
    requestStatus?: number;
    oneShipmentInfo?: string;
}

const FindScannerModal = (props: Props) => {
    const [createRequestMutation, { data: requestData }] = useCreateRequest();
    let userData = useStore((state: any) => state.userData);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [stopScanner, setStopScanner] = useState(false);

    const closeHandler = () => {
        // setStopScanner(true);
        // Quagga.pause();
        Quagga.offProcessed();
        Quagga.offDetected();
        Quagga.stop();
        typeof props.onClose == "function" && props.onClose();
        // document.querySelector("#camera").innerHTML = "";
    };

    return (
        <Modal
            {...props}
            width="640px"
            // keepMounted
            footer={
                <>
                    <Button startIcon={<X/>} variant="outlined" color="primary" onClick={closeHandler as any}>إلغاء</Button>
                </>
            }
        >
            <Box margin="-16px -20px">
                <Scanner
                    onDetected={(result: any, callback: any) => {
                        typeof props.onClose == "function" && props.onClose();
                        useStore.setState({ searchValue: result });
                        callback();
                    }}
                    isScan={"SEARCH_SCAN"}
                />
            </Box>
        </Modal>
    );
};

export default FindScannerModal;
