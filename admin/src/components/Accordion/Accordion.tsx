import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { AccordionProps } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";

type AccordionCustomProps = AccordionProps & MUIStyledCommonProps;

export const Accordion = styled((props: AccordionCustomProps) => (
  // @ts-ignore
  <MuiAccordion elevation={0} {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

export const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...(props as any)}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
}));

// export default {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
// };

// export default function CustomizedAccordions() {
//   const [expanded, setExpanded] = React.useState('panel1');

//   const handleChange = (panel: any) => (event, newExpanded) => {
//     setExpanded(newExpanded ? panel : false);
//   };

//   return (
//     // @ts-nocheck
//     // @ts-ignore
//     <div>
//       <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
//         <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
//           <Typography>Collapsible Group Item #1</Typography>
//         </AccordionSummary>
//         <AccordionDetails>
//           <Typography>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
//             malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
//             sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
//             sit amet blandit leo lobortis eget.
//           </Typography>
//         </AccordionDetails>
//       </Accordion>
//       <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
//         <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
//           <Typography>Collapsible Group Item #2</Typography>
//         </AccordionSummary>
//         <AccordionDetails>
//           <Typography>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
//             malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
//             sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
//             sit amet blandit leo lobortis eget.
//           </Typography>
//         </AccordionDetails>
//       </Accordion>
//       <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
//         <AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
//           <Typography>Collapsible Group Item #3</Typography>
//         </AccordionSummary>
//         <AccordionDetails>
//           <Typography>
//             Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
//             malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
//             sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
//             sit amet blandit leo lobortis eget.
//           </Typography>
//         </AccordionDetails>
//       </Accordion>
//     </div>
//   );
// }
