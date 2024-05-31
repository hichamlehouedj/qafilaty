import {
  Box,
  DialogProps,
  Dialog as MuiDialog,
  modalClasses,
  ModalProps,
  Stack,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { ReactNode } from "react";
import { Check, Plus, X } from "react-feather";
import Button from "../Button";

export interface Props extends DialogProps {
  title?: any;
  iconTitle?: ReactNode;
  footer?: ReactNode;
  width: string;
}

let StyledDialog = styled(MuiDialog)(({ theme, color }: { theme: any; color?: any }) => {
  return {
    ...theme.typography["sm"],
    //   border: "unset",
    //   margin: 0,
    //   padding: 0,

    //   [`&.${modalClasses.root}`]: {
    //     "& .Modal-content": {
    //       backgroundColor: "#FFFFFF",
    //       position: "absolute" as "absolute",
    //       top: "50%",
    //       left: "50%",
    //       transform: "translate(-50%, -50%)",
    //       // border: '2px solid #000',
    //       // boxShadow: 24,
    //       maxHeight: "94vh",
    //       outline: "unset",
    //       padding: "0",
    //       borderRadius: "6px",
    //       boxSizing: "border-box",
    //       overflow: "hidden",

    //       "& .Modal-title": {
    //         ...theme.typography["lg"],
    //         height: "72px",
    //         backgroundColor: "White",
    //         display: "flex",
    //         alignItems: "center",
    //         padding: "0 20px",
    //         color: grey[700],
    //         borderBottom: `2px solid ${grey[300]}`,
    //         "&--icon": {
    //           "& svg": {
    //             verticalAlign: "middle",
    //             width: 22,
    //             height: 22,
    //             marginLeft: "-2px",
    //           },
    //         },
    //       },

    //       "& .Modal-innerContent": {
    //         ...theme.typography["sm"],
    //         flex: "1",
    //         backgroundColor: theme.palette?.background?.body,
    //         padding: "16px 20px",
    //         height: "100%",
    //         maxHeight: "calc(94vh - 72px - 72px)",
    //         overflowY: "overlay",
    //       },

    //       "& .Modal-footer": {
    //         height: "72px",
    //         backgroundColor: "White",
    //         display: "flex",
    //         alignItems: "center",
    //         padding: "0 20px",
    //         // flexDirection: 'row-reverse',
    //         justifyContent: "flex-end",
    //         borderTop: `2px solid ${grey[300]}`,
    //       },
    //     },
    //   },
  };
});

const Dialog = (props: Props) => {
  return (
    <>
      <StyledDialog
        // open={open}
        // onClose={handleClose}
        aria-labelledby="dialog-dialog-title"
        aria-describedby="dialog-dialog-description"
        {...(props as any)}
      >
        <DialogTitle>{props.title}</DialogTitle>
        <DialogContent sx={{ marginTop: "4px" }}>{props.children}</DialogContent>
        <DialogActions>{props.footer}</DialogActions>
      </StyledDialog>
    </>
  );
};

export default Dialog;
