import React, { useState } from "react";
import useStore from "../store/useStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const InvoiceTemplate = dynamic(() => import("../components/PDFFormat/InvoiceDriverTemplatePickUp"), {
    ssr: false,
});

interface Props {}

const InvoiceDriverPickUp = (props: Props) => {
    const route = useRouter();
    const userData = useStore((state: any) => state.userData);

    // get all shipments
    const codeInvoice = route?.query?.codeInvoice || ""
    const idDriver = route?.query?.id || ""

    React.useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    return (
        <>
            <InvoiceTemplate idDriver={idDriver as string} codeInvoice={codeInvoice} userData={userData as any} />
        </>
    );
};

export default InvoiceDriverPickUp;