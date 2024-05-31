import React, { useState } from "react";
import useStore from "../store/useStore";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const EnvelopeTemplate = dynamic(() => import("../components/PDFFormat/EnvelopeTemplate"), {
    ssr: false,
});

interface Props {}

const Invoice = (props: Props) => {
    const route = useRouter();
    const userData = useStore((state: any) => state.userData);

    // get all shipments
    const codeEnvelope = route?.query?.codeEnvelope || ""

    React.useEffect(() => {
        useStore.setState({ isLayoutDisabled: true });
    }, []);

    return (
        <>
            <EnvelopeTemplate codeEnvelope={codeEnvelope} userData={userData as any}/>
        </>
    );
};

export default Invoice;