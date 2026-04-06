import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FERTILIZER_ORDER, FERTILIZERS } from "../game/fertilizers";

type Props = {
  selected: string | null;
  onSelect: (id: string | null) => void;
  inventory: Record<string, number>;
  disabled?: boolean;
};

export function FertilizerPalette({ selected, onSelect, inventory, disabled }: Props) {
  const def = selected ? FERTILIZERS[selected] : null;
  const count = selected ? (inventory[selected] ?? 0) : 0;

  return (
    <Stack spacing={1}>
      <Paper
        component="section"
        elevation={0}
        id="fertilizer-detail-panel"
        aria-label="Selected fertilizer details"
        aria-live="polite"
        sx={{ p: 1.25, border: 1, borderColor: "divider" }}
      >
        {def ? (
          <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Box
                aria-hidden
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: def.color,
                  border: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              />
              <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800 }}>
                {def.name}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.45 }}>
              {def.description}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {def.growthSpeedMult != null && def.growthSpeedMult > 1 && (
                <>
                  Growth <strong>×{def.growthSpeedMult.toFixed(2)}</strong>
                </>
              )}
              {def.growthSpeedMult != null &&
                def.growthSpeedMult > 1 &&
                (def.harvestExtraCount ?? 0) > 0 &&
                " · "}
              {(def.harvestExtraCount ?? 0) > 0 && (
                <>
                  Harvest <strong>+{def.harvestExtraCount}</strong> extra
                </>
              )}
              {count <= 0 ? (
                <Box component="span" color="text.secondary">
                  {" "}
                  · None in bag
                </Box>
              ) : (
                <Box component="span" color="text.secondary">
                  {" "}
                  · <strong>{count}</strong> to use
                </Box>
              )}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Select a fertilizer, then tap a <strong>growing</strong> plant to apply. One fertilizer per
            crop.
          </Typography>
        )}
      </Paper>

      <Paper elevation={0} role="presentation" sx={{ p: 0.75, border: 1, borderColor: "divider" }}>
        <ToggleButtonGroup
          exclusive
          value={selected ?? ""}
          disabled={disabled}
          onChange={(_, value) => {
            if (value == null || value === "") onSelect(null);
            else onSelect(value as string);
          }}
          aria-label="Fertilizers to apply"
          sx={{
            flexWrap: "wrap",
            gap: 0.75,
            "& .MuiToggleButtonGroup-grouped": {
              borderRadius: "999px !important",
              border: "1px solid !important",
              my: 0.25,
            },
          }}
        >
          {FERTILIZER_ORDER.map((id) => {
            const f = FERTILIZERS[id];
            const n = inventory[id] ?? 0;
            const out = n <= 0;
            return (
              <ToggleButton
                key={id}
                value={id}
                aria-describedby="fertilizer-detail-panel"
                sx={{
                  px: 1,
                  py: 0.5,
                  textTransform: "none",
                  gap: 0.5,
                  opacity: out && selected !== id ? 0.65 : 1,
                  "&.Mui-selected": {
                    borderColor: out ? "text.secondary" : "secondary.main",
                    bgcolor: "action.selected",
                  },
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: 0.75,
                    bgcolor: f.color,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                  {f.name}{" "}
                  <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {out ? "—" : `×${n}`}
                  </Box>
                </Typography>
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
      </Paper>
    </Stack>
  );
}
