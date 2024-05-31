import {
  Box,
  FormControl,
  MenuItem,
  Select as MuiSelect,
  SelectProps,
  StandardTextFieldProps,
  TextField,
  textFieldClasses,
  TextFieldProps,
} from "@mui/material";
import { blueGrey, grey } from "@mui/material/colors";
import { MUIStyledCommonProps, styled, useTheme } from "@mui/system";
import React, { useCallback, useEffect, useState } from "react";

export interface Props extends SelectProps {}

const StyledSelect = styled(MuiSelect)(
  ({ theme, color }: { theme: any; color?: any }) => {
    return {
      ...theme.typography["sm"],
      color: grey[800],
      "&.MuiInputBase-sizeSmall": {
        height: "42px",
      },

      [`&:hover.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline`]: {
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
          padding: "0 16px !important",
          background: "#FFF",
          borderWidth: 2,
          alignItems: "center",
          display: "flex",
          height: "100%",
          // color: grey[200],
        },

      [`& .MuiOutlinedInput-notchedOutline`]: {
        borderWidth: 1,
      },
      [`&.Mui-error .MuiOutlinedInput-notchedOutline`]: {
        borderWidth: 2,
      },
      '& .MuiSelect-nativeInput[value=""]': {
        color: "blue",
      },
    };
  }
);

const Select = (props: Props) => {
  let [isPlaceholder, setIsPlaceholder] = useState(false);
  let theme: any = useTheme();
  let ref = React.useRef();

  useEffect(() => {
    // @ts-ignore
    if (ref.current.childNodes[0].firstChild.nodeType == 1) {
      // @ts-ignore
      ref.current.childNodes[0].firstChild.innerHTML = `<div style='color: #a9a9a9'>${props?.placeholder}</div>`;
    }
  }, []);

  return (
    <>
      <StyledSelect
        {...(props as MUIStyledCommonProps)}
        size="small"
        fullWidth
        inputProps={{
          placeholder: "ddddddddddd",
        }}
        ref={ref}
        MenuProps={{
          MenuListProps: {
            style: {
              ...theme.typography["sm"],
              fontSize: "14px",
            },
          },
          PaperProps: {
            elevation: 0,
            style: {
              boxShadow: theme.shadows[25].elevation3,
            },
          },
        }}
      ></StyledSelect>
    </>
  );
};

export default Select;
