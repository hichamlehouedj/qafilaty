import * as React from "react";
import { styled } from "@mui/material/styles";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { AccordionProps, Box, alpha } from "@mui/material";
import { MUIStyledCommonProps } from "@mui/system";
import { grey } from "@mui/material/colors";
import { useDrop } from "react-dnd";
import theme from "../../styles/theme";
import { useCreateZone, useUpdateZone } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
import { UPDATE_ZONE } from "../../graphql/hooks/shipments/useUpdateZone";
import { ALL_ZONES } from "../../graphql/hooks/shipments/useGetAllZones";
import * as R from "ramda";

type AccordionCustomProps = AccordionProps &
  MUIStyledCommonProps & {
    zoneData?: any;
  };

export const Accordion = styled((props: AccordionCustomProps) => (
  // @ts-ignore
  <MuiAccordion elevation={0} disableGutters {...props} />
))(({ theme }) => ({
  // border: `1px solid ${theme.palette.divider}`,
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
  backgroundColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, .05)" : "#FFF",

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
  borderTop: "1px solid " + grey[100],
}));

export const ProvincesGroupedAccordion = (props: AccordionCustomProps) => {
  const [updateZoneMutation, { data }] = useUpdateZone();
  const userData = useStore((state: any) => state.userData);
  const [{ isOver }, drop] = useDrop({
    accept: "province",
    drop: (value: any) => {
      console.log("props.zoneData?.cities: ", props.zoneData?.cities);
      let incNumberArr: any = R.pipe(R.map(R.compose(String, R.inc, Number)))([
        ...props.zoneData?.cities,
        value.ProvinceID.toString(),
      ]);
      updateZoneMutation({
        variables: {
          content: {
            name: props.zoneData?.name,
            cities: [...props.zoneData?.cities, value.ProvinceID.toString()],
            id_company: userData?.person?.company?.id,
          },
          updateZoneId: props.zoneData?.id,
        },
        refetchQueries: [ALL_ZONES],
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });
  return (
    <Box
      ref={drop}
      flexShrink="0"
      sx={{
        outline: isOver ? "3px solid " + alpha(theme.palette.primary.main, 0.7) : "",
        borderRadius: "4px",
        overflow: "hidden",
        width: "99%",
        background: "#FFF",
      }}
    >
      <Accordion {...(props as any)}>{props.children}</Accordion>
    </Box>
  );
};

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
