import { grey } from "@mui/material/colors";

export default function priceFormatHelper(
  price: number,
  currency: string = "DZD",
  currencyStyle?: {}
): any {
  return (
    <>
      <span>{price.toLocaleString("en-US")}</span>
      {currency !== "" && <span style={{ fontSize: "64%", ...currencyStyle }}> {currency}</span>}
    </>
  );
}
