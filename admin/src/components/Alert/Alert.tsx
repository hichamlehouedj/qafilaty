import React from "react";
import { Alert as MuaAlert, Typography, AlertProps } from "@mui/material";
import { styled } from "@mui/system";

export interface Props extends AlertProps {
}

const StyledAlert = styled(MuaAlert)(({theme, color, customColor, size, rounded, doted}: { theme: any; color?: any; customColor?: string; size?: string; rounded: boolean; doted: boolean; }) => {
    return {
        [`& .MuiAlert-message`]: {
            width: "100%",
        },
    }
});

const Alert = (props: Props) => {
    return (
        <>
            <StyledAlert
                {...(props as any)}
            >
                {props.children}
            </StyledAlert>
        </>
    );
}

export default Alert;