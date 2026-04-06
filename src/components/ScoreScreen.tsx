import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type { SeasonScore } from "../game/types";

type Props = {
  score: SeasonScore;
  onNewSeason: () => void;
};

export function ScoreScreen({ score, onNewSeason }: Props) {
  const rank =
    score.totalEarnings >= 200
      ? "Master Gardener"
      : score.totalEarnings >= 120
        ? "Green Thumb"
        : score.totalEarnings >= 60
          ? "Sprout"
          : "Seedling";

  return (
    <Container maxWidth="sm" sx={{ py: 2, flex: 1, display: "flex", alignItems: "center" }}>
      <Paper
        component="section"
        elevation={0}
        aria-live="polite"
        sx={{
          width: "100%",
          p: 2,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Season complete
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No fail state — chill run. Here is how you did.
        </Typography>
        <Typography variant="h6" sx={{ my: 1 }}>
          Rank:{" "}
          <Box component="span" color="primary.main" fontWeight={800}>
            {rank}
          </Box>
        </Typography>
        <Stack spacing={0.75} sx={{ maxWidth: 280, mx: "auto", my: 2, textAlign: "left" }}>
          {[
            ["Coins earned", score.totalEarnings],
            ["Crops sold", score.cropsSold],
            ["Chain pulses", score.synergyEvents],
            ["Peak synergy tiles", score.tilesWithSynergyGrowth],
          ].map(([label, val]) => (
            <Stack
              key={String(label)}
              direction="row"
              justifyContent="space-between"
              gap={1}
            >
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
                {val}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<RestartAltIcon />}
          onClick={onNewSeason}
        >
          New season
        </Button>
      </Paper>
    </Container>
  );
}
