import { grey } from "@mui/material/colors";
import { styled } from "@mui/system";
import { useSwitch, UseSwitchProps } from "@mui/base/SwitchUnstyled";
import clsx from "clsx";
import { Check, X } from "react-feather";
import React, { FC } from "react";

export interface Props extends UseSwitchProps {}

const SwitchRoot = styled("span")(({ theme }: { theme: any }) => {
    // console.log(theme);
    return {
        display: "inline-block",
        position: "relative",
        width: "44px",
        minWidth: "44px",
        height: "26px",
    };
});

const SwitchInput = styled("input")(({ theme }: { theme: any }) => {
    // console.log(theme);
    return {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        opacity: 0,
        zIindex: 1,
        margin: 0,
        cursor: "pointer",
    };
});

const SwitchThumb = styled("span")(({ theme, color }: { theme: any; color?: any }) => {
        return {
            width: "18px",
            height: "18px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF",
            borderRadius: "6px",
            boxShadow: theme.shadows[25].elevation2,
            transform: "translateX(4px)",
            transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            color: grey[300],
            "&.checked": {
                transform:
                    theme.direction === "ltr"
                        ? "translateX(calc(40px - 18px))"
                        : "translateX(calc(-18px - 4px))",
                // transform: "translateX(calc(-18px - 4px))",
                color: theme.palette[color || "primary"].main,
            },
            "& svg": {},
        };
    }
);

const SwitchTrack = styled("span")(({ theme, color }: { theme: any; color?: any }) => {
        // console.log(color);
        return {
            backgroundColor: grey[100],
            borderRadius: "6px",
            width: "100%",
            height: "100%",
            display: "flex",
            boxShadow: theme.shadows[25].elevation2,
            alignItems: "center",
            transition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",

            "&.checked": {
                backgroundColor: theme.palette[color || "primary"].main,
            },
        };
    }
);

const Switch = React.forwardRef(function Switch(props: Props, ref) {
    const { getInputProps, checked, disabled, focusVisible } = useSwitch(props);

    const stateClasses = {
        checked,
        disabled,
        focusVisible,
    };

    return (
        <>
            <SwitchRoot {...props} ref={ref as any} className={clsx(stateClasses)}>
                <SwitchTrack className={clsx(stateClasses)}>
                    <SwitchThumb className={clsx(stateClasses)}>
                        {checked ? (
                            <Check size={12} strokeWidth={3} />
                        ) : (
                            <X size={12} strokeWidth={3} />
                        )}
                    </SwitchThumb>
                </SwitchTrack>
                <SwitchInput {...getInputProps()} />
            </SwitchRoot>
        </>
    );
});

export default Switch;
