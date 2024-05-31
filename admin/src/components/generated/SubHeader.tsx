import { Box, Container, Divider, Tabs } from "@mui/material";
import React from "react";
import Tab from "../Tabs/Tab";
import useStore from "../../store/useStore";

interface Props {}

const SubHeader = (props: Props) => {
  const subPageTab = useStore((state: any) => state.subPageTab);

  return (
    <Box
      sx={{
        height: "64px",
        width: "100%",
        backgroundColor: "#FFF",
      }}
    >
      <Box
        className="sub-header"
        sx={{
          width: "100%",
          height: "64px",
          bgcolor: "#FFF",
          //   marginTop: "-32px",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" },
            height: "100%",
            position: "relative",
          }}
        >
          <Box bgcolor="#FFF" sx={{ width: "24%", position: "absolute", bottom: 0 }}>
            <Tabs
              sx={{ flex: 1 }}
              value={subPageTab}
              onChange={(_, newVal) => useStore.setState({ subPageTab: newVal })}
              variant={"fullWidth"}
            >
              <Tab label="1. توزيع الولايات" />
              <Tab label="2. تسعير التوصيلات" />
            </Tabs>
            <Divider></Divider>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default SubHeader;
