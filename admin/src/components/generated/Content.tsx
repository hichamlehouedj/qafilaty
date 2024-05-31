import { Box, Container } from "@mui/material";
import React, { createContext, FC, useRef } from "react";
import useStore from "../../store/useStore";
import SubHeader from "./SubHeader";

interface Props {}

export const ContentRefContext: React.Context<any> = createContext(null);

export const Content: FC<Props> = (props) => {
  const contentRef = useRef(null);
  const subPageTab = useStore((state: any) => state.subPageTab);
  return (
    <Box>
      {subPageTab !== null && <SubHeader></SubHeader>}
      <Box
        ref={contentRef}
        className="q-content"
        sx={{
            margin: "0 auto", overflowY: "overlay",
            height: subPageTab !== null ? `calc(100vh - 128px)` : `calc(100vh - 64px)`
        }}
        paddingTop={"32px"}
        paddingBottom={"32px"}
        width={"100%"}
      >
        <ContentRefContext.Provider value={contentRef}>{props.children}</ContentRefContext.Provider>
      </Box>
    </Box>
  );
};
