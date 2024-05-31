export declare module '@mui/material/Typography/Typography' {
    interface TypographyPropsVariantOverrides {
        h1: false,
        h2: false,
        h3: false,
        h4: false,
        h5: false,
        h6: false,
        subtitle1: false,
        subtitle2: false,
        body1: false,
        body2: false,
        button: false,
        caption: false,
        overline: false,
        '6xl': true,
        '5xl': true,
        '4xl': true,
        '3xl': true,
        '2xl': true,
        'xl': true,
        'lg': true,
        'base': true,
        'sm': true,
        'xs': true,
        '2xs': true,
        '3xs': true,
    }
}

export declare module "@material-ui/core/styles/createTypography" {
    interface Typography {
      '6xl': React.CSSProperties,
        '5xl': React.CSSProperties,
        '4xl': React.CSSProperties,
        '3xl': React.CSSProperties,
        '2xl': React.CSSProperties,
        'xl': React.CSSProperties,
        'lg': React.CSSProperties,
        'base': React.CSSProperties,
        'sm': React.CSSProperties,
        'xs': React.CSSProperties,
        '2xs': React.CSSProperties,
        '3xs': React.CSSProperties,
    }
  
    // allow configuration using `createMuiTheme`
    interface TypographyOptions {
      '6xl'?: React.CSSProperties,
        '5xl'?: React.CSSProperties,
        '4xl'?: React.CSSProperties,
        '3xl'?: React.CSSProperties,
        '2xl'?: React.CSSProperties,
        'xl'?: React.CSSProperties,
        'lg'?: React.CSSProperties,
        'base'?: React.CSSProperties,
        'sm'?: React.CSSProperties,
        'xs'?: React.CSSProperties,
        '2xs'?: React.CSSProperties,
        '3xs'?: React.CSSProperties,
    }
  }