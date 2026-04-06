import type { SxProps, Theme } from "@mui/material/styles";

/** Shared width/height for shop + backpack side columns. */
export const sidePanelPaperSx: SxProps<Theme> = {
  border: 1,
  borderColor: "divider",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  maxHeight: { xs: 320, md: "min(72dvh, 560px)" },
  width: { xs: "100%", md: 268 },
  flexShrink: 0,
  alignSelf: { xs: "stretch", md: "flex-start" },
  bgcolor: "background.paper",
};
