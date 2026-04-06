import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { FERTILIZER_ORDER, FERTILIZERS } from "../game/fertilizers";
import { SEED_ORDER, SEEDS } from "../game/seeds";
import { sidePanelPaperSx } from "./sidePanelStyles";

type Props = {
  money: number;
  rations: number;
  cropBag: Record<string, number>;
  seedInventory: Record<string, number>;
  fertilizerInventory: Record<string, number>;
};

function Row({
  label,
  count,
  color,
  square,
}: {
  label: string;
  count: number;
  color: string;
  square?: boolean;
}) {
  const empty = count <= 0;
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ py: 0.35 }}>
      <Stack direction="row" alignItems="center" gap={0.75} sx={{ minWidth: 0 }}>
        <Box
          aria-hidden
          sx={{
            width: 14,
            height: 14,
            flexShrink: 0,
            borderRadius: square ? 0.5 : "50%",
            bgcolor: color,
            border: 1,
            borderColor: "divider",
            opacity: empty ? 0.45 : 1,
          }}
        />
        <Typography
          variant="caption"
          color={empty ? "text.secondary" : "text.primary"}
          sx={{ fontWeight: 600, lineHeight: 1.2 }}
          noWrap
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="caption"
        sx={{
          fontVariantNumeric: "tabular-nums",
          fontWeight: 700,
          color: empty ? "text.disabled" : "primary.light",
        }}
      >
        ×{count}
      </Typography>
    </Stack>
  );
}

export function BackpackInventory({
  money,
  rations,
  cropBag,
  seedInventory,
  fertilizerInventory,
}: Props) {
  const cropTotal = Object.values(cropBag).reduce((a, b) => a + b, 0);

  return (
    <Paper
      component="aside"
      elevation={0}
      aria-label="Backpack inventory"
      sx={sidePanelPaperSx}
    >
      <Box
        sx={{
          p: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(125, 206, 140, 0.08) 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <MonetizationOnIcon sx={{ color: "secondary.main", fontSize: 22 }} aria-hidden />
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
            Coins
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", mt: 0.25 }}>
          {money}
        </Typography>
      </Box>

      <Box sx={{ overflow: "auto", px: 1.25, py: 1, flex: 1, minHeight: 0 }}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Rations
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.35 }}>
          Preserved food for winter ({rations} day{rations !== 1 ? "s" : ""}). Pack from harvested crops or buy in the
          shop.
        </Typography>
        <Typography variant="body2" fontWeight={800} sx={{ fontVariantNumeric: "tabular-nums", mb: 1.25 }}>
          ×{rations}
        </Typography>

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Harvested
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.35 }}>
          Crops in your pack ({cropTotal} unit{cropTotal !== 1 ? "s" : ""}). Sell or pack into rations from the bar.
        </Typography>
        <Stack spacing={0}>
          {SEED_ORDER.map((id) => {
            const def = SEEDS[id];
            const n = cropBag[id] ?? 0;
            return <Row key={`crop-${id}`} label={def.name} count={n} color={def.color} />;
          })}
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Seeds
        </Typography>
        <Stack spacing={0} sx={{ mt: 0.5 }}>
          {SEED_ORDER.map((id) => {
            const def = SEEDS[id];
            const n = seedInventory[id] ?? 0;
            return <Row key={`seed-${id}`} label={def.name} count={n} color={def.color} />;
          })}
        </Stack>

        <Divider sx={{ my: 1.25 }} />

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Fertilizers
        </Typography>
        <Stack spacing={0} sx={{ mt: 0.5 }}>
          {FERTILIZER_ORDER.map((id) => {
            const f = FERTILIZERS[id];
            const n = fertilizerInventory[id] ?? 0;
            return <Row key={`fert-${id}`} label={f.name} count={n} color={f.color} square />;
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
