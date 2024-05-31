import {
  outlinedInputClasses,
  StandardTextFieldProps,
  TextField,
  textFieldClasses,
  TextFieldProps,
} from "@mui/material";
import { blueGrey, grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import React from "react";

export interface Props extends StandardTextFieldProps {}

const StyledTextField = styled(TextField)(
  ({ theme, color }: { theme: any; color?: any }) => {
    return {
      ...theme.typography["sm"],
      color: grey[800],
        background: "#fff",
      [`&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline`]: {
        borderColor: grey[700],
        borderWidth: 2,
      },

      [`& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline`]:
        {
          borderColor: theme.palette[color || "primary"].main,
          // outline: `2px solid ${theme.palette[color || 'primary'].main}`
        },

      "& .MuiOutlinedInput-input.MuiInputBase-input.MuiInputBase-inputSizeSmall":
        {
          height: "42px",
          padding: "0 16px !important",
          background: "#FFF",
          borderWidth: 1,
          // color: grey[200],
        },

      [`& .MuiOutlinedInput-notchedOutline`]: {
        borderWidth: 1,
      },
      [`& .Mui-error .MuiOutlinedInput-notchedOutline`]: {
        borderWidth: 2,
      },
    };
  }
);

const Input = React.forwardRef(function Input(props: Props, ref) {
  return (
    <>
      <StyledTextField
        {...props}
        ref={ref as any}
        size="small"
      />
    </>
  );
});

export default Input;
