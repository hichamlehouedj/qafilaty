import { amber, grey, purple, red } from "@mui/material/colors";
// import { createTheme } from "@mui/material";
import { createTheme as MuiTheme } from "@mui/material";
import { createTheme } from "@mui/material/styles";

let defaultTheme = MuiTheme();

let fontScales = {
  "6xl": "36px !important",
  "5xl": "32px !important",
  "4xl": "29px !important",
  "3xl": "26px !important",
  "2xl": "23px !important",
  xl: "20px !important",
  lg: "18px !important",
  base: "16px !important",
  sm: "14px !important",
  xs: "13px !important",
  "2xs": "11px !important",
  "3xs": "10px !important",
};

const theme = createTheme({
  typography: {
    fontFamily: ["Montserrat-Arabic", "sans-serif"].join(","),
    // h1: undefined,
    // h2: undefined,
    // h3: undefined,
    // h4: undefined,
    // h5: undefined,
    // h6: undefined,
    // subtitle1: undefined,
    // subtitle2: undefined,
    // body1: undefined,
    // body2: undefined,
    // button: undefined,
    // caption: undefined,
    // overline: undefined,

    // @ts-ignore
    "6xl": {
      margin: 0,
      fontSize: fontScales["6xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "5xl": {
      margin: 0,
      fontSize: fontScales["5xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "4xl": {
      margin: 0,
      fontSize: fontScales["4xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "3xl": {
      margin: 0,
      fontSize: fontScales["3xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "2xl": {
      margin: 0,
      fontSize: fontScales["2xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    xl: {
      margin: 0,
      fontSize: fontScales["xl"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    lg: {
      margin: 0,
      fontSize: fontScales["lg"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    base: {
      margin: 0,
      fontSize: fontScales["base"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    sm: {
      margin: 0,
      fontSize: fontScales["sm"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    xs: {
      margin: 0,
      fontSize: fontScales["xs"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "2xs": {
      margin: 0,
      fontSize: fontScales["2xs"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
    "3xs": {
      margin: 0,
      fontSize: fontScales["3xs"],
      lineHeight: "120%",
      fontWeight: 400,
      fontFamily: "Montserrat-Arabic",
    },
  },
  palette: {
    primary: {
      main: "#7d749e",
    },
    secondary: {
      main: amber[400],
    },
    error: {
      main: red[300],
    },
    background: {
      ...defaultTheme.palette.background,
      body: "#F3F4F7",
    } as any,
    grey: {
      main: grey[500],
    } as any,
  },
  shadows: [
    ...defaultTheme.shadows,
    {
      shadow1: "0px 2px 4px -2px rgba(24, 39, 75, 0.12), 0px 4px 4px -2px rgba(24, 39, 75, 0.08)",
      shadow2: "0px 4px 6px -4px rgba(24, 39, 75, 0.12), 0px 8px 8px -4px rgba(24, 39, 75, 0.08)",
      shadow3: "0px 6px 8px -6px rgba(24, 39, 75, 0.12), 0px 8px 16px -6px rgba(24, 39, 75, 0.08)",
      shadow4: "0px 6px 12px -6px rgba(24, 39, 75, 0.12), 0px 8px 24px -4px rgba(24, 39, 75, 0.08)",
      shadow5: "0px 6px 14px -6px rgba(24, 39, 75, 0.12), 0px 10px 32px -4px rgba(24, 39, 75, 0.1)",
      elevation1: "0px 0px 0px 0.8px rgba(0, 0, 0, 0.12)",
      elevation2: "0px 0.4px 1px 0.8px rgba(0, 0, 0, 0.13)",
      elevation3: "0px 0.8px 2px 0.8px rgba(0, 0, 0, 0.14)",
      elevation4: "0px 1.2px 3px 0.8px rgba(0, 0, 0, 0.15)",
      elevation5: "0px 1.6px 4px 0.8px rgba(0, 0, 0, 0.16)",
    },
  ] as any,
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          ":hover": {
            border: "unset",
            boxShadow: "none",
          },
        },
      },
    },
  },
});

export default theme;
