import Quagga from "@ericblade/quagga2";
import { Grid } from "@mui/material";
import { Box } from "@mui/system";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { Check, X } from "react-feather";
import { useForm } from "react-hook-form";
import { useCreateRequest } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import Button from "../Button";
import TextArea from "../Input/TextArea";
import Scanner from "../Scanner/Scanner";
import Modal, { Props as ModalProps } from "./Modal";

interface Props extends ModalProps {
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
          <Button
            startIcon={<X></X>}
            variant="outlined"
            color="primary"
            onClick={closeHandler as any}
          >
            إلغاء
          </Button>
        </>
      }
    >
      <Box margin="-16px -20px">
        {/* <Grid container>
          <Grid item xs={12}> */}
        <Scanner
          onDetected={(result: any, callback: any) => {
            typeof props.onClose == "function" && props.onClose();
            useStore.setState({ searchValue: result });
            callback();
          }}
          isScan={"SEARCH_SCAN"}
        ></Scanner>
        {/* </Grid>
        </Grid> */}
      </Box>
    </Modal>
  );
};

export default FindScannerModal;
