import React, { useState } from "react";
import useStore from "../../store/useStore";
import { useRouter } from "next/router";
import {useGetAllDriverShipments} from "../../graphql/hooks/shipments";
import dynamic from "next/dynamic";

const OutSheetTemplate = dynamic(() => import("../../components/PDFFormat/OutSheetTemplate"), {
    ssr: false,
});

interface Props {}

const OutSheet = (props: Props) => {
    const route = useRouter();

    // get all shipments
    const idDriver = route?.query?.id?.toString() || ""

    let [getShipmentsData] = useGetAllDriverShipments({
        idDriver: idDriver
    });

    const listTrace = [5, 7, 16, 17, 21, 22]

    let filteredData = getShipmentsData.filter((v: any) => listTrace.includes(v.lastTrace[0]?.status));

    React.useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    console.log("OutSheet filteredData ", filteredData)

    return (
        <>
            <OutSheetTemplate data={filteredData} idDriver={idDriver as any}/>
        </>
    );
};

export default OutSheet;