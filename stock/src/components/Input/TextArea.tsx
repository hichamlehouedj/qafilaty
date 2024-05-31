import {
  outlinedInputClasses,
  StandardTextFieldProps,
  TextareaAutosize,
  TextareaAutosizeProps,
  TextField,
  textFieldClasses,
  TextFieldProps,
} from "@mui/material";
import { blueGrey, grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React from "react";
import Input from "./Input";

export interface Props extends StandardTextFieldProps {}

const StyledTextArea = styled(Input)(
  ({ theme, color }: { theme: any; color?: any }) => {
    return {
      "& .MuiOutlinedInput-root": {
        background: "white",
        padding: 0,
        paddingTop: "6px",
      },
    };
  }
);

const TextArea = React.forwardRef(function TextArea(props: Props, ref) {
  return (
    <StyledTextArea
      ref={ref as any}
      {...(props as any)}
      multiline
    ></StyledTextArea>
  );
});

export default TextArea;
