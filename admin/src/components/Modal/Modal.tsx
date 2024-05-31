import { Box, Modal as MuiModal, modalClasses, ModalProps, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React, { ReactNode } from "react";
import { Check, Plus, X } from "react-feather";
import Button from "../Button";

export interface Props extends ModalProps {
  title?: any;
  iconTitle?: ReactNode;
  footer?: ReactNode;
  width: string;
}

let StyledModal = styled(MuiModal)(({ theme, color }: { theme: any; color?: any }) => {
  return {
    ...theme.typography["sm"],
    border: "unset",
    margin: 0,
    padding: 0,

    [`&.${modalClasses.root}`]: {
      "& .Modal-content": {
        backgroundColor: "#FFFFFF",
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        // border: '2px solid #000',
        // boxShadow: 24,
        maxHeight: "94vh",
        outline: "unset",
        padding: "0",
        borderRadius: "6px",
        boxSizing: "border-box",
        overflow: "hidden",

        "& .Modal-title": {
          ...theme.typography["lg"],
          height: "72px",
          backgroundColor: "White",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          color: grey[700],
          borderBottom: `2px solid ${grey[300]}`,
          "&--icon": {
            "& svg": {
              verticalAlign: "middle",
              width: 22,
              height: 22,
              marginLeft: "-2px",
            },
          },
        },

        "& .Modal-innerContent": {
          ...theme.typography["sm"],
          flex: "1",
          backgroundColor: theme.palette?.background?.body,
          padding: "16px 20px",
          height: "100%",
          maxHeight: "calc(94vh - 72px - 72px)",
          overflowY: "overlay",
        },

        "& .Modal-footer": {
          height: "72px",
          backgroundColor: "White",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          // flexDirection: 'row-reverse',
          justifyContent: "flex-end",
          borderTop: `2px solid ${grey[300]}`,
        },
      },
    },
  };
});

const Modal = (props: Props) => {
  return (
    <>
      <StyledModal
        // open={open}
        // onClose={handleClose}
        // aria-labelledby="modal-modal-title"
        // aria-describedby="modal-modal-description"
        {...(props as any)}
      >
        <Box
          className="Modal-content"
          sx={{ width: { xs: "100vw", sm: "600px", md: props.width } }}
        >
          <Box sx={{ borderRadius: "6px", height: "100%" }}>
            <Stack height={"100%"}>
              <Box
                className="Modal-title"
                flexShrink={0}
                display={props.title ? "flex" : "none !important"}
              >
                <Stack direction="row" spacing={props.iconTitle ? "6px" : 0}>
                  <div className="Modal-title--icon">{props.iconTitle}</div>
                  <div className="Modal-title--label">{props.title}</div>
                </Stack>
              </Box>
              <Box className="Modal-innerContent">{props.children}</Box>
              <Box className="Modal-footer" flexShrink={0}>
                <Stack direction="row" spacing="6px" width="100%" justifyContent={"flex-end"}>
                  {props.footer}
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>
      </StyledModal>
    </>
  );
};

export default Modal;
