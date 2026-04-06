import FlagIcon from "@mui/icons-material/Flag";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

type Props = {
  money: number;
  seasonEarnings: number;
  cropBagTotal: number;
  paused: boolean;
  seasonEnded: boolean;
  onPauseToggle: () => void;
  onSell: () => void;
  onEndSeason: () => void;
  onOpenShop: () => void;
};

export function Hud({
  money,
  seasonEarnings,
  cropBagTotal,
  paused,
  seasonEnded,
  onPauseToggle,
  onSell,
  onEndSeason,
  onOpenShop,
}: Props) {
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
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          Coins <strong>{money}</strong>
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          Season <strong>{seasonEarnings}</strong>
        </Typography>
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          Bag <strong>{cropBagTotal}</strong>
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<StorefrontIcon />}
            onClick={onOpenShop}
            disabled={seasonEnded}
          >
            Shop
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={paused ? <PlayArrowIcon /> : <PauseIcon />}
            onClick={onPauseToggle}
            disabled={seasonEnded}
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
            disabled={seasonEnded || cropBagTotal === 0}
          >
            Sell crops
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<FlagIcon />}
            onClick={onEndSeason}
            disabled={seasonEnded}
          >
            End season
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
