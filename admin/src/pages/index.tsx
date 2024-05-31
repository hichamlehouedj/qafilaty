import { Box, Container } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";

import Head from "next/head";

import SwipeableViews from "react-swipeable-views";

import useStore from "../store/useStore";

import algerian_provinces from "../utilities/data/api/algeria_provinces.json";

import { CheckCircle, CheckCircle2 } from "lucide-react";
import ProvincesAllocation from "../subPages/Home/ProvincesAllocation";
import PricingTransactions from "../subPages/Home/PricingTransactions";
import useGetAllZones from "../graphql/hooks/shipments/useGetAllZones";

interface Props {}

// const algerianProvinces = JSON.parse(JSON.stringify(algerian_provinces));

export default function Index({}: Props): ReactElement {
  /* admin specific */
  const [tabvalue, setTabvalue] = React.useState<number | string>(0);

  /* unused will be removed!  */
  const searchValue = useStore((state: any) => state.searchValue);
  const userData = useStore((state: any) => state.userData);

  const subPageTab = useStore((state: any) => state.subPageTab);

  const allZonesQuery = useGetAllZones({
    companyID: userData?.person?.company?.id || "",
  });

  // watchers
  // useEffect(() => {
  //   setAllShipmentsData(() => [...getShipmentsData]);
  // }, [getShipmentsData]);

  // useEffect(() => {
  //   setRenderedShipmentsData(() => [...allShipments]);
  // }, [allShipmentsData, searchValue]);

  useEffect(() => {
    useStore.setState({ isLayoutDisabled: false });
    useStore.setState({ subPageTab: 0 });
  }, []);

  // if (!getShipmentsData?.length)
  //   return (
  //     <>
  //       {/* <Grid container spacing={3}>
  //         <Grid item xs={12} sm={6} md={4} lg={3}>
  //           <Skeleton animation="wave" height={"152px"} width="100%" />
  //         </Grid>
  //         <Grid item xs={12} sm={6} md={4} lg={3}>
  //           <Skeleton animation="wave" height={"152px"} width="100%" />
  //         </Grid>
  //         <Grid item xs={12} sm={6} md={4} lg={3}>
  //           <Skeleton animation="wave" height={"152px"} width="100%" />
  //         </Grid>
  //       </Grid> */}
  //     </>
  //   );

  return (
    <>
      <Head>
        <title>المناطق والتسعيرات | قافلتي</title>
      </Head>

      <Container
        maxWidth="lg"
        sx={{
          padding: { xs: "0 24px", lg: "0 16px", xl: "0 24px" },
          height: "100%",
          // margin: "0 auto",
          // overflowY: "scroll",
          // height: "calc(100vh)",
        }}
      >
        <Box className="q-container" height={"100%"}>
          <SwipeableViews
            animateTransitions={false}
            // style={{ direction: "rtl" }}
            width={"100%"}
            index={subPageTab as any}
            onChangeIndex={(index) => {
              useStore.setState({ subPageTab: index });
            }}
            containerStyle={{ willChange: "unset" }}
          >
            <ProvincesAllocation
              tabvalue={tabvalue}
              allZonesQuery={allZonesQuery}
            ></ProvincesAllocation>
            <PricingTransactions
              tabvalue={subPageTab}
              allZonesQuery={allZonesQuery}
            ></PricingTransactions>
          </SwipeableViews>
        </Box>
      </Container>
    </>
  );
}
