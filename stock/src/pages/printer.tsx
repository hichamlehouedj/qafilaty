import React, { useState } from "react";
import useStore from "../store/useStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useGetMultipleShipments } from "../graphql/hooks/shipments";
import { default as ReceiptExcelTemplate } from "../components/ExcelFormat/ReceiptTemplate";

const DeliveryTemplate = dynamic(() => import("../components/PDFFormat/DeliveryTemplate"), {ssr: false,});

const ReceiptTemplate = dynamic(() => import("../components/PDFFormat/ReceiptTemplate"), {ssr: false,});

const ExtractAllPDF = dynamic(() => import("../components/PDFFormat/ExtractAllPDF"), {ssr: false,});

const ExtractAllExcel = dynamic(() => import("../components/ExcelFormat/ExtractAllExcel"), {ssr: false,});

interface Props {}

const Printer = (props: Props) => {
    const route = useRouter();
    const userData = useStore((state: any) => state.userData);
    let [GetMultipleShipment, { data: multipleShipmentdata }] = useGetMultipleShipments();
    const { shipmentID, format, bordereau, receipt, extract } = route.query;

    React.useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
        GetMultipleShipment({
            variables: { ids: shipmentID as string[] },
        });
    }, []);

    return (
        <>
            {extract == "false" && format == "pdf" && (
                <>
                    {bordereau == "true" && (
                        <DeliveryTemplate shipmentDataList={multipleShipmentdata?.getBoxs} userData={userData as any}/>
                    )}
                    {receipt == "true" && (
                        <ReceiptTemplate shipmentDataList={multipleShipmentdata?.getBoxs} userData={userData as any}/>
                    )}
                </>
            )}

            {extract == "false" && format == "excel" && receipt == "true" && (
                <ReceiptExcelTemplate shipmentDataList={multipleShipmentdata?.getBoxs} userData={userData as any}/>
            )}

            {extract == "true"  && format == "pdf" && receipt == "true" && (
                <ExtractAllPDF shipmentDataList={multipleShipmentdata?.getBoxs} userData={userData as any}/>
            )}

            {extract == "true"  && format == "excel" && receipt == "true" && (
                <ExtractAllExcel shipmentDataList={multipleShipmentdata?.getBoxs} userData={userData as any}/>
            )}
        </>
    );
};

export default Printer;