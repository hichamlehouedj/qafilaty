import { Box, Container } from "@mui/material";
import React, { createContext, FC, useRef } from "react";
import useStore from "../../store/useStore";

interface Props {}
export const ContentRefContext: React.Context<any> = createContext(null);

export const Content: FC<Props> = (props) => {
    const contentRef = useRef(null);
    return (
        <Box
            ref={contentRef}
            className="q-content"
            sx={{margin: "0 auto", overflowY: "overlay", height: "calc(100vh - 64px)"}}
            paddingTop={"32px"}
            paddingBottom={"32px"}
            width={"100%"}
        >
            <ContentRefContext.Provider value={contentRef}>{props.children}</ContentRefContext.Provider>
            {/* <Container maxWidth="xl"></Container> */}
        </Box>
    );
};