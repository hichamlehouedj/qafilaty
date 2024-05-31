import { ChipProps, Chip as MuiChip, chipClasses } from "@mui/material";
import { styled } from "@mui/system";
import React from "react";
import { alpha, emphasize, darken, lighten } from "@mui/material/styles";

export interface Props extends Omit<ChipProps, "size"> {
  size?: "small" | "medium" | "default";
  rounded?: boolean;
  customColor?: string;
  doted?: boolean;
}

const StyledChip = styled(MuiChip)(
  ({
    theme,
    color,
    customColor,
    size,
    rounded,
    doted,
  }: {
    theme: any;
    color?: any;
    customColor?: string;
    size?: string;
    rounded: boolean;
    doted: boolean;
  }) => {
    let selectedColor: string =
      customColor ?? theme?.palette[color]?.main ?? theme.palette["primary"].main;
    let lighterShade: string = lighten(selectedColor, 0.9);
    return {
      borderRadius: rounded ? "" : "2px",
      backgroundColor: lighterShade,
      color: selectedColor,
      // small chip
      ...(size == "small" && {
        [`&.${chipClasses.sizeSmall}`]: {
          ...theme.typography["3xs"],
          height: "20px",

          [`& .${chipClasses.labelSmall}`]: {
            padding: "4px 8px",
            display: "inline-flex",
            alignItems: "center",
            columnGap: doted ? 4 : 0,
            color: selectedColor,
            ...(doted && {
              [`& .dot`]: {
                backgroundColor: selectedColor,
                display: "inline-block",
                width: 5,
                height: 5,
                borderRadius: "50%",
              },
            }),
          },
        },
      }),

      // medium chip
      ...(size == "medium" && {
        [`&.${chipClasses.sizeMedium}`]: {
          ...theme.typography["3xs"],
          height: "25px",

          [`& .${chipClasses.labelMedium}`]: {
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            columnGap: doted ? 6 : 0,
            color: selectedColor,
            ...(doted && {
              [`& .dot`]: {
                backgroundColor: selectedColor,
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
              },
            }),
          },
        },
      }),
    };
  }
);

const Chip = (props: Props) => {
  return (
    <>
      <StyledChip
        {...(props as any)}
        label={
          <>
            <span className="dot"></span>
            <span className="label">{props.label}</span>
          </>
        }
      ></StyledChip>
    </>
  );
}

export default Chip;
