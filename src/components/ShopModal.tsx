import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { FERTILIZER_ORDER, FERTILIZERS } from "../game/fertilizers";
import { SEED_ORDER, SEEDS } from "../game/seeds";
import { canExpandGrid, expandGridCost } from "../game/shop";
import { buyExpandGrid, buyFertilizer, buySeedPack, gridSize } from "../game/simulation";
import { MAX_GRID_SIZE } from "../game/types";
import type { GameState } from "../game/types";

type Props = {
  open: boolean;
  game: GameState;
  onClose: () => void;
  onApply: (next: GameState) => void;
};

export function ShopModal({ open, game, onClose, onApply }: Props) {
  const size = gridSize(game.grid);
  const nextExpandCost = expandGridCost(size);
  const canExpand = canExpandGrid(size) && game.money >= nextExpandCost;

  const tryExpand = () => {
    const next = buyExpandGrid(game);
    if (next !== game) onApply(next);
  };

  const tryBuySeed = (seedId: string) => {
    const next = buySeedPack(game, seedId, 1);
    if (next !== game) onApply(next);
  };

  const tryBuyFertilizer = (fertilizerId: string) => {
    const next = buyFertilizer(game, fertilizerId, 1);
    if (next !== game) onApply(next);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: { maxHeight: "min(88dvh, 640px)" },
      }}
    >
      <DialogTitle
        id="shop-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        Shop
        <IconButton
          aria-label="Close shop"
          onClick={onClose}
          edge="end"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your coins: <strong>{game.money}</strong>
        </Typography>

        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
          Upgrades
        </Typography>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            mb: 2,
            p: 1.5,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Expand plot
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Add one row and one column (up to {MAX_GRID_SIZE}×{MAX_GRID_SIZE}). Current:{" "}
              {size}×{size}.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!canExpand}
            onClick={tryExpand}
            sx={{ flexShrink: 0 }}
          >
            {size >= MAX_GRID_SIZE ? "Max size" : `${nextExpandCost} coins`}
          </Button>
        </Paper>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
          Fertilizers
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          Apply to growing plants from your toolbar. One type per crop; stacks with neighbor bonuses.
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {FERTILIZER_ORDER.map((id) => {
            const f = FERTILIZERS[id];
            const affordable = game.money >= f.shopPrice;
            return (
              <Paper
                key={id}
                elevation={0}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {f.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {f.description}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  disabled={!affordable || game.seasonEnded}
                  onClick={() => tryBuyFertilizer(id)}
                  sx={{ flexShrink: 0 }}
                >
                  {f.shopPrice} coins
                </Button>
              </Paper>
            );
          })}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 800, mb: 1 }}>
          Seeds
        </Typography>
        <Stack spacing={1}>
          {SEED_ORDER.map((id) => {
            const def = SEEDS[id];
            const affordable = game.money >= def.shopPrice;
            return (
              <Paper
                key={id}
                elevation={0}
                variant="outlined"
                sx={{
                  p: 1.5,
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {def.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {def.description}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={!affordable || game.seasonEnded}
                  onClick={() => tryBuySeed(id)}
                  sx={{ flexShrink: 0 }}
                >
                  {def.shopPrice} coins
                </Button>
              </Paper>
            );
          })}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
