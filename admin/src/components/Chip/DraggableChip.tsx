import { Box, Stack } from "@mui/material";
import { GripVertical } from "lucide-react";
import React from "react";
import { useDrag } from "react-dnd";
import theme from "../../styles/theme";
import Chip, { Props as ChipProps } from "./Chip";

interface Props extends ChipProps {
  chipData?: any;
}

const DraggableChip = (props: Props) => {
  const [{ isDragging }, drag] = useDrag({
    type: "province",
    item: { ProvinceID: props.chipData },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Box
      ref={drag}
      sx={{
        opacity: isDragging ? 0.6 : 1,
        borderRadius: 8,
        transform: "translate(0, 0)",
      }}
    >
      <Chip
        {...props}
        sx={{ cursor: "grab" }}
        rounded
        size={"default"}
        variant="filled"
        customColor={theme.palette.primary.main}
        label={
          <Stack direction="row" gap="8px">
            <GripVertical size="12" />
            <Box>{props?.label}</Box>
          </Stack>
        }
      ></Chip>
    </Box>
  );
};

export default DraggableChip;
