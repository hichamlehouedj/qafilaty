export default function priceFormatHelper(price: number, currency: string = "DZD"): any {
    return (
        <>
            <span>{price?.toLocaleString("en-US")}</span>

            <span style={{ fontSize: "64%" }}> {currency}</span>
        </>
    );
}
