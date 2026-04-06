import AcUnitIcon from "@mui/icons-material/AcUnit";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { HEALTH_MAX, WINTER_DAY_COUNT } from "../game/winterConstants";
import { getWinterEvent } from "../game/winterEvents";
import type { GameState } from "../game/types";

type Props = {
  game: GameState;
  onChoice: (choiceIndex: 0 | 1) => void;
  onViewResults: () => void;
};

export function WinterGameScreen({ game, onChoice, onViewResults }: Props) {
  const ev = getWinterEvent(game.winterEventId);
  const done = game.winterMinigameComplete || game.winterFailed;

  return (
    <Container
      maxWidth="sm"
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        minHeight: "100dvh",
        py: 2,
        px: 1.5,
        pb: "max(16px, env(safe-area-inset-bottom))",
      }}
    >
      <Paper
        component="section"
        elevation={0}
        aria-labelledby="winter-title"
        sx={{
          width: "100%",
          p: 3,
          border: 1,
          borderColor: "divider",
          bgcolor: "rgba(15, 26, 42, 0.92)",
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
          <AcUnitIcon sx={{ fontSize: 32, color: "primary.light" }} aria-hidden />
          <Typography id="winter-title" variant="h5" component="h1" sx={{ fontWeight: 800 }}>
            Winter
          </Typography>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
          <ChipStat
            icon={<FavoriteIcon sx={{ fontSize: 18 }} />}
            label="Health"
            value={`${game.health} / ${HEALTH_MAX}`}
          />
          <ChipStat
            icon={<RestaurantIcon sx={{ fontSize: 18 }} />}
            label="Rations"
            value={String(game.rations)}
          />
          {!done && (
            <ChipStat
              icon={<AcUnitIcon sx={{ fontSize: 18 }} />}
              label="Day"
              value={`${game.winterDay} / ${WINTER_DAY_COUNT}`}
            />
          )}
        </Stack>

        <LinearProgress
          variant="determinate"
          value={(game.health / HEALTH_MAX) * 100}
          sx={{ mb: 2, height: 8, borderRadius: 1 }}
          color={game.health < 30 ? "error" : "primary"}
        />

        {game.winterFailed && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              The cold won this time
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Your health reached zero. Stock up on rations next year — one per winter day.
            </Typography>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={onViewResults}>
              View year results
            </Button>
          </Box>
        )}

        {game.winterMinigameComplete && !game.winterFailed && (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
              You survived the winter
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {WINTER_DAY_COUNT} days of choices — you made it. {game.rations} rations left.
            </Typography>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={onViewResults}>
              View year results
            </Button>
          </Box>
        )}

        {!done && ev && (
          <>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
              {ev.text}
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={() => onChoice(0)}
              >
                {ev.choices[0].label}
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                fullWidth
                onClick={() => onChoice(1)}
              >
                {ev.choices[1].label}
              </Button>
            </Stack>
          </>
        )}
      </Paper>
    </Container>
  );
}

function ChipStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        px: 1.25,
        py: 0.75,
        display: "flex",
        alignItems: "center",
        gap: 0.75,
        borderColor: "divider",
      }}
    >
      <Box sx={{ color: "primary.light", display: "flex" }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" lineHeight={1}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
