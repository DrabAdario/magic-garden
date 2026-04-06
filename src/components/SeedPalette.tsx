import LockIcon from "@mui/icons-material/Lock";
import { Box, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { ICON_ATLAS, SEED_SPRITE_CELL } from "../game/spriteAssets";
import { SEED_ORDER, SEEDS } from "../game/seeds";
import { SpriteSheetIcon } from "./SpriteSheetIcon";

type Props = {
  selected: string;
  onSelect: (id: string) => void;
  inventory: Record<string, number>;
  unlockedSeeds: Record<string, boolean>;
  disabled?: boolean;
};

function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${s}s`;
}

export function SeedPalette({ selected, onSelect, inventory, unlockedSeeds, disabled }: Props) {
  const detail = SEEDS[selected];
  const count = inventory[selected] ?? 0;
  const selectedUnlocked = unlockedSeeds[selected] ?? false;

  return (
    <Stack
      spacing={1}
      sx={{
        mt: "auto",
        pt: 0.5,
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <Paper
        component="section"
        elevation={0}
        id="seed-detail-panel"
        aria-label="Selected seed details"
        aria-live="polite"
        sx={{ p: 1.25, border: 1, borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
          {SEED_SPRITE_CELL[selected] ? (
            <SpriteSheetIcon
              sheet={ICON_ATLAS}
              col={SEED_SPRITE_CELL[selected]!.col}
              row={SEED_SPRITE_CELL[selected]!.row}
              size={28}
              bordered
            />
          ) : (
            <Box
              aria-hidden
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                bgcolor: detail.color,
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
              }}
            />
          )}
          <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800 }}>
            {detail.name}
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.45 }}>
          {detail.description}
        </Typography>
        {!selectedUnlocked && (
          <Typography variant="caption" color="warning.main" display="block" sx={{ mb: 0.75 }}>
            Locked — unlock in the shop or find seeds during winter events.
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" display="block">
          Grows in ~{formatDuration(detail.growDurationMs)} · Sells for{" "}
          <strong>{detail.sellPrice}</strong> coins
          {count <= 0 ? (
            <Box component="span" color="text.secondary">
              {" "}
              · None left in inventory
            </Box>
          ) : (
            <Box component="span" color="text.secondary">
              {" "}
              · <strong>{count}</strong> to plant
            </Box>
          )}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        role="presentation"
        sx={{ p: 0.75, border: 1, borderColor: "divider" }}
      >
        <ToggleButtonGroup
          exclusive
          value={selected}
          disabled={disabled}
          onChange={(_, value) => {
            if (value != null) onSelect(value as string);
          }}
          aria-label="Seeds to plant"
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
          {SEED_ORDER.map((id) => {
            const def = SEEDS[id];
            const n = inventory[id] ?? 0;
            const out = n <= 0;
            const locked = !(unlockedSeeds[id] ?? false);
            return (
              <ToggleButton
                key={id}
                value={id}
                disabled={locked || disabled}
                aria-describedby="seed-detail-panel"
                sx={{
                  px: 1,
                  py: 0.5,
                  textTransform: "none",
                  gap: 0.5,
                  opacity: locked ? 0.55 : out && selected !== id ? 0.65 : 1,
                  "&.Mui-selected": {
                    borderColor: out ? "text.secondary" : "primary.main",
                    bgcolor: out ? "action.selected" : "action.selected",
                  },
                }}
              >
                {locked && (
                  <LockIcon sx={{ fontSize: 16, opacity: 0.8 }} aria-hidden />
                )}
                {SEED_SPRITE_CELL[id] ? (
                  <Box sx={{ opacity: locked ? 0.55 : 1, display: "flex" }}>
                    <SpriteSheetIcon
                      sheet={ICON_ATLAS}
                      col={SEED_SPRITE_CELL[id]!.col}
                      row={SEED_SPRITE_CELL[id]!.row}
                      size={18}
                      bordered
                    />
                  </Box>
                ) : (
                  <Box
                    aria-hidden
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      bgcolor: def.color,
                      border: "1px solid",
                      borderColor: "divider",
                      opacity: locked ? 0.55 : 1,
                    }}
                  />
                )}
                <Typography variant="body2" component="span" sx={{ fontWeight: 600 }}>
                  {def.name}{" "}
                  <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>
                    {locked ? "—" : out ? "—" : `×${n}`}
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
