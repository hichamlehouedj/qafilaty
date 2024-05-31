import {
  alpha,
  Box,
  Grid,
  IconButton,
  Stack,
  Typography,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import { AlertCircle, Edit2, Trash2, ListMinus, MoreHorizontal, Plus } from "lucide-react";
import React from "react";
import * as R from "ramda";
import { usePopupState, bindTrigger, bindMenu } from "material-ui-popup-state/hooks";
import {
  AccordionDetails,
  AccordionSummary,
  ProvincesGroupedAccordion,
} from "../../components/Accordion/ProvincesGroupedAccordion";
import Button from "../../components/Button";
import Chip from "../../components/Chip/Chip";
import DraggableChip from "../../components/Chip/DraggableChip";
import AddZoneDialog from "../../components/Dialog/AddZoneDialog";
import useGetAllZones, { ALL_ZONES } from "../../graphql/hooks/shipments/useGetAllZones";
import theme from "../../styles/theme";
import algeria_provinces from "../../utilities/data/api/algeria_provinces.json";
import Menu from "../../components/Menu/Menu";
import EditZoneDialog from "../../components/Dialog/EditZoneDialog";
import { useDeleteZone, useUpdateZone } from "../../graphql/hooks/shipments";
import useStore from "../../store/useStore";
interface Props {
  tabvalue?: any;
  allZonesQuery?: any;
}

let algeriaProvinces = JSON.parse(JSON.stringify(algeria_provinces));

const ProvincesAllocation = React.forwardRef(function ProvincesAllocation(props: Props, ref) {
  const popupState = usePopupState({ variant: "popover", popupId: "demoMenu" });
  const userData = useStore((state: any) => state.userData);

  const [expanded, setExpanded] = React.useState("panel1");
  const [addZoneDialog, setAddZoneDialog] = React.useState(false);
  const [editZoneDialog, setEditZoneDialog] = React.useState(false);
  const [selectedZone, setSelectedZone] = React.useState<any>({});

  const [editZoneMutation, { data }] = useUpdateZone();
  const [deleteZoneMutation] = useDeleteZone();
  // implement dragging

  const accordionExpandHandler = (panel: any) => (event: any, newExpanded: any) => {
    setExpanded(newExpanded ? panel : false);
  };

  const allocatedProvinces: any = R.pipe(
    R.compose(R.uniq, R.flatten, R.map(R.prop("cities"))),
    // R.map(R.compose(R.dec, Number))
    R.map(Number)
  )(props.allZonesQuery);

  const unAllocatedProvinces = R.difference(R.range(1, 59), allocatedProvinces);

  return (
    <Box
      sx={{
        width: "100%",
        // marginTop: "32px",
        direction: "ltr",
        overflow: "hidden",
      }}
    >
      <Grid container spacing={4} direction="row">
        <Grid item xs={6}>
          <Box sx={{ width: "100%", background: "#FFF", borderRadius: "4px" }}>
            {/* header */}
            <Box
              className="header"
              sx={{
                padding: "20px 24px",
                paddingBottom: "14px",
                width: "100%",
                borderBottom: "1px solid " + grey[100],
                // background: "blue",
              }}
            >
              <Stack direction="row" gap={"8px"}>
                <ListMinus size="22" color={grey[600]}></ListMinus>
                <Typography variant="lg" color={grey[600]}>
                  قائمة الولايات
                </Typography>
              </Stack>
            </Box>
            {/* content */}
            <Box
              className="content"
              sx={{
                padding: "20px 24px",
                width: "100%",
              }}
            >
              <Stack gap="20px">
                {/* alert */}
                <Box
                  className="alert"
                  sx={{
                    border: "2px dashed " + alpha(theme.palette.primary.main, 0.2),
                    padding: "10px 8px",
                    borderRadius: "4px",
                  }}
                >
                  <Stack direction="row" gap="10px" alignItems={"center"}>
                    <AlertCircle size={20} color={alpha(theme.palette.primary.main, 0.8)} />
                    <Typography variant="xs" color="#C0B3CC">
                      قم بسحب الولاية المرغوبة في المنطقة المناسبة.
                    </Typography>
                  </Stack>
                </Box>
                {/* list Provinces Chips */}

                <Stack direction="row" sx={{ width: "100%", gap: "8px" }} flexWrap="wrap">
                  {unAllocatedProvinces?.map((wilaya_number: any, i: number) => (
                    <DraggableChip
                      key={i}
                      label={algeriaProvinces?.[wilaya_number - 1]?.wilaya_name}
                      chipData={wilaya_number}
                    />
                  ))}
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Grid>
        {/* add zones (left side) */}
        <Grid item xs={6}>
          <Box sx={{ width: "100%", borderRadius: 4 }}>
            <Grid container flexDirection={"row"} justifyContent="space-between" rowSpacing={3}>
              <Grid item xs={12} sm="auto">
                <Button
                  startIcon={<Plus></Plus>}
                  variant="contained"
                  onClick={() => setAddZoneDialog(true)}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                  // fullWidth
                >
                  إضافة منطقة
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Stack
            sx={{
              marginTop: "28px",
              padding: "4px",
              overflowY: "auto",
              height: "calc(100vh - 64px - 64px - 32px - 32px - 40px - 26px)",
              // paddingRight: 1,
            }}
            gap={"20px"}
          >
            {/* zones */}
            {/* @ts-ignore */}
            {props.allZonesQuery?.map((zone: any, i: number) => (
              <ProvincesGroupedAccordion
                zoneData={zone}
                key={i}
                expanded={(expanded === `panel${i}`) as any}
                onChange={accordionExpandHandler(`panel${i}`)}
              >
                <AccordionSummary
                  aria-controls="panel1d-content"
                  //@ts-ignore
                  id="panel1d-header"
                >
                  {/* @ts-ignore */}
                  <Stack
                    direction="row"
                    width="100%"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="sm" color={grey[700]}>
                      {zone?.name}
                    </Typography>
                    <Stack direction="row" gap="8px" alignItems="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZone(zone);
                          bindTrigger(popupState).onClick(e);
                        }}
                      >
                        <MoreHorizontal size="18" color={grey[400]}></MoreHorizontal>
                      </IconButton>

                      <Box
                        sx={{
                          padding: "4px 8px",
                          backgroundColor: theme.palette.primary.main,
                          color: "#FFF",
                          borderRadius: "6px",
                        }}
                      >
                        <Typography variant="xs">{zone?.cities?.length}</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack direction="row" flexWrap="wrap" gap={"8px"}>
                    {zone?.cities?.map((wilaya_number: number, i: number) => (
                      <Chip
                        key={i}
                        rounded
                        customColor={theme.palette.primary.main}
                        label={algeriaProvinces?.[wilaya_number - 1]?.wilaya_name}
                        onDelete={() => {
                          let arrAfterSelectedRemoved = R.pipe(
                            R.without([wilaya_number.toString()])
                          )(zone?.cities);
                          editZoneMutation({
                            variables: {
                              content: {
                                name: zone?.name,
                                cities: arrAfterSelectedRemoved,
                                id_company: userData?.person?.company?.id,
                              },
                              updateZoneId: zone?.id,
                            },
                            refetchQueries: [ALL_ZONES],
                          });
                        }}
                      ></Chip>
                    ))}
                  </Stack>
                </AccordionDetails>
              </ProvincesGroupedAccordion>
            ))}
          </Stack>
        </Grid>
      </Grid>
      <AddZoneDialog
        width="340px"
        open={addZoneDialog}
        onClose={() => setAddZoneDialog(false)}
      ></AddZoneDialog>

      <EditZoneDialog
        width="340px"
        zoneData={selectedZone}
        open={editZoneDialog}
        onClose={() => setEditZoneDialog(false)}
      ></EditZoneDialog>

      <Menu {...bindMenu(popupState)}>
        <MenuItem
          onClick={() => {
            setEditZoneDialog(true);

            popupState.close();
          }}
        >
          <ListItemIcon>
            <Edit2 size={18} strokeWidth={2} />
          </ListItemIcon>
          تعديل المنطقة
        </MenuItem>
        <MenuItem
          onClick={() => {
            deleteZoneMutation({
              variables: {
                deleteZoneId: selectedZone?.id,
              },
              refetchQueries: [ALL_ZONES],
            });

            popupState.close();
          }}
        >
          <ListItemIcon>
            <Trash2 size={18} strokeWidth={2} />
          </ListItemIcon>
          حذف المنطقة
        </MenuItem>
      </Menu>
    </Box>
  );
});

export default ProvincesAllocation;
