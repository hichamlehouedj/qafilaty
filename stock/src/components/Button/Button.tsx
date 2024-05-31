import { Button as MuiButton, ButtonProps, createTheme } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";
import { styled } from "@mui/system";
import "../Typography/Typography.d";
import { LoadingButton, LoadingButtonProps } from "@mui/lab";

export interface Props extends LoadingButtonProps {}

let StyledButton = styled(LoadingButton)(
  ({
    theme,
    variant,
    color,
  }: {
    theme: any;
    variant?: string;
    color?: any;
  }) => {
    return {
      ...theme.typography["sm"],
      flexDirection: "row-reverse",
      boxShadow: theme.shadows[25].elevation2,
      textTransform: "capitalize",
      columnGap: "14px",
      outline:
        variant == "outlined" ? `2px solid ${theme.palette[color].main}` : "",
      outlineOffset: -2,
      padding: "11px 10px",
      borderRadius: "4px",
      borderWidth: 0,
      "&:hover": {
        borderWidth: 0,
        boxShadow: "none",
      },
      "& .MuiButton-startIcon, & .MuiButton-endIcon": {
        /* @noflip */
        flip: false,
        // marginRight: 14,
        marginLeft: 0,
        marginRight: 0,
        padding: 0,

        "& svg": {
          width: 16,
          height: 16,
          strokeWidth: 3,
        },
      },
    };
  }
);

function Button(props: Props) {
  return (
    <>
      <StyledButton {...(props as MUIStyledCommonProps)}>
        {props.children}
      </StyledButton>
    </>
  );
}

export default Button;
