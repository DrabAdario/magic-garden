import FastForwardIcon from "@mui/icons-material/FastForward";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import type { YearPhase } from "../game/types";

const PHASE_LABEL: Record<YearPhase, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
};

type Props = {
  yearPhase: YearPhase;
  seasonEarnings: number;
  cropBagTotal: number;
  rations: number;
  harvestsRemaining: number;
  paused: boolean;
  seasonEnded: boolean;
  onPauseToggle: () => void;
  onSell: () => void;
  onPackRations: () => void;
  onAdvanceSeasonEarly: () => void;
};

export function Hud({
  yearPhase,
  seasonEarnings,
  cropBagTotal,
  rations,
  harvestsRemaining,
  paused,
  seasonEnded,
  onPauseToggle,
  onSell,
  onPackRations,
  onAdvanceSeasonEarly,
}: Props) {
  const growing = yearPhase === "spring" || yearPhase === "summer" || yearPhase === "fall";

  return (
    <Paper
      component="header"
      elevation={0}
      sx={{
        p: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Stack
        direction="row"
        flexWrap="wrap"
        alignItems="center"
        gap={1}
        useFlexGap
      >
        <Typography variant="h6" component="h1" sx={{ fontWeight: 800, letterSpacing: 0.02 }}>
          Magic Garden
        </Typography>
        <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 700 }}>
          {PHASE_LABEL[yearPhase]}
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          Year <strong>{seasonEarnings}</strong>
        </Typography>
        <Typography
          variant="body2"
          color="secondary.main"
          sx={{ fontVariantNumeric: "tabular-nums", fontWeight: 700 }}
        >
          Harvests <strong>{harvestsRemaining}</strong>
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          Rations <strong>{rations}</strong>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
          <Button
            variant="outlined"
            size="small"
            startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={onPauseToggle}
            disabled={seasonEnded || !growing}
            aria-pressed={paused}
          >
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<ShoppingCartIcon />}
            onClick={onSell}
            disabled={seasonEnded || !growing || cropBagTotal === 0}
          >
            Sell crops
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            startIcon={<RestaurantIcon />}
            onClick={onPackRations}
            disabled={seasonEnded || !growing || cropBagTotal === 0}
          >
            Pack rations
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            startIcon={<FastForwardIcon />}
            onClick={onAdvanceSeasonEarly}
            disabled={seasonEnded || !growing}
          >
            End season early
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
