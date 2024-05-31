import React, { useState } from "react";
import useStore from "../store/useStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const InvoiceTemplate = dynamic(() => import("../components/PDFFormat/InvoiceTemplate"), {
    ssr: false,
});

interface Props {}

const Invoice = (props: Props) => {
    const route = useRouter();
    const userData = useStore((state: any) => state.userData);
    // get all shipments
    const codeInvoice = route?.query?.codeInvoice || ""


    console.log("🚀 ~ file: printer.tsx ~ line 28 ~ React.useEffect ~ route.query", route.query);

    React.useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    return (
        <>
            <InvoiceTemplate codeInvoice={codeInvoice} userData={userData as any} />
        </>
    );
};

export default Invoice;