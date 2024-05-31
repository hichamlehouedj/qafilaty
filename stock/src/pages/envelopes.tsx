import {Box, Container, Grid, Tabs, Tab, Alert} from "@mui/material";
import React, { ReactElement,  useEffect} from "react";
import Head from "next/head";
import AddShipmentModal from "../components/Modal/AddShipmentModal";
import useStore from "../store/useStore";
import SwipeableViews from "react-swipeable-views";
import OpenEnvelopes from "../subPages/OpenEnvelope";
import CloseEnvelopes from "../subPages/CloseEnvelope";
import DeliveryEnvelopes from "../subPages/DeliveryEnvelope";
import ReadyEnvelopes from "../subPages/ReadyEnvelope";

interface Props {}

export default function Envelopes({}: Props): ReactElement {
    const searchValue = useStore((state: any) => state.searchValue);
    const userData = useStore((state: any) => state.userData);
    const [openAddOrderModal, setOpenAddOrderModal] = React.useState(false);
    const [tab2value, setTab2value] = React.useState(0);
    const [envelopeCityData, setAllEnvelopeCityData] = React.useState<object[]>([]);
    const [hasData, setHasData] = React.useState(0);

    // handlers
    const tabs2handler = (event: React.SyntheticEvent, newValue: number) => {
        setTab2value(newValue as any);
    };

    useEffect(() => {
        useStore.setState({ isLayoutDisabled: false });
    }, []);

    return (
        <>
            <Head><title>أظرف مالية | قافلي</title></Head>

            <Container maxWidth="xl" sx={{padding: { xs: "0 24px", lg: "0 32px", xl: "0 48px" }, height: "100%"}}>
                <Box className="q-container" height={"100%"}>
                    <Grid container spacing={2} height={"auto"}>
                        {/* header content window */}
                        <Grid item xs={12} >
                            <Grid container flexDirection={"row"} justifyContent="space-between" rowSpacing={3}>
                                <Grid item xs={12} sm="auto">
                                    <Tabs value={tab2value} onChange={tabs2handler}>
                                        <Tab label="اظرف مالية مفتوحة" />
                                        <Tab label="اظرف مالية مغلقة" />
                                        <Tab label="اظرف مالية قيد التوصيل" />
                                        <Tab label="اظرف مالية جاهزة للدفع" />
                                    </Tabs>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} paddingBottom="32px">
                            <SwipeableViews width={"100%"} id={"SwipeableViews"}
                                animateTransitions={false}
                                index={tab2value as any}
                                onChangeIndex={(index) => {
                                    useStore.setState({ subPageTab: index });
                                }}
                                containerStyle={{ willChange: "unset" }}
                            >
                                <OpenEnvelopes setHasData={setHasData} />
                                <CloseEnvelopes setHasData={setHasData} />
                                <DeliveryEnvelopes setHasData={setHasData} />
                                <ReadyEnvelopes setHasData={setHasData} />
                            </SwipeableViews>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            {/* Add Shipment */}
            <AddShipmentModal open={openAddOrderModal} onClose={() => setOpenAddOrderModal(false)}></AddShipmentModal>
        </>
    );
}