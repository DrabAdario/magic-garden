import StorefrontIcon from "@mui/icons-material/Storefront";
import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { FERTILIZER_ORDER, FERTILIZERS } from "../game/fertilizers";
import { SEED_ORDER, SEEDS } from "../game/seeds";
import { canExpandGrid, expandGridCost } from "../game/shop";
import {
  buyExpandGrid,
  buyFertilizer,
  buyRations,
  buySeedPack,
  gridSize,
  isGrowingSeason,
  RATION_SHOP_PRICE,
} from "../game/simulation";
import { MAX_GRID_SIZE } from "../game/types";
import type { GameState } from "../game/types";
import { sidePanelPaperSx } from "./sidePanelStyles";

type Props = {
  game: GameState;
  onApply: (next: GameState) => void;
};

export function ShopPanel({ game, onApply }: Props) {
  const growing = isGrowingSeason(game);
  const size = gridSize(game.grid);
  const nextExpandCost = expandGridCost(size);
  const canExpand = canExpandGrid(size) && game.money >= nextExpandCost;
  const shopDisabled = game.seasonEnded || !growing;

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

  const tryBuyRation = () => {
    const next = buyRations(game, 1);
    if (next !== game) onApply(next);
  };

  const canBuyRation = game.money >= RATION_SHOP_PRICE;

  return (
    <Paper
      component="aside"
      elevation={0}
      aria-label="Shop"
      sx={sidePanelPaperSx}
    >
      <Box
        sx={{
          p: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(201, 162, 39, 0.12) 100%)`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={0.75}>
          <StorefrontIcon sx={{ color: "secondary.main", fontSize: 22 }} aria-hidden />
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1 }}>
            Shop
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 800, fontVariantNumeric: "tabular-nums", mt: 0.25 }}>
          {game.money}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, lineHeight: 1.35 }}>
          Spend coins on upgrades, rations, fertilizers, and seeds.
        </Typography>
      </Box>

      <Box sx={{ overflow: "auto", px: 1.25, py: 1, flex: 1, minHeight: 0 }}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Winter prep
        </Typography>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ mt: 0.5, p: 1, display: "flex", flexDirection: "column", gap: 0.75 }}
        >
          <Typography variant="caption" fontWeight={700}>
            Rations
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            One ration feeds you for one winter day. Stock up before the snow.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            fullWidth
            disabled={!canBuyRation || shopDisabled}
            onClick={tryBuyRation}
          >
            Buy 1 · {RATION_SHOP_PRICE} coins
          </Button>
        </Paper>

        <Divider sx={{ my: 1.25 }} />

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Upgrades
        </Typography>
        <Paper
          elevation={0}
          variant="outlined"
          sx={{ mt: 0.5, p: 1, display: "flex", flexDirection: "column", gap: 0.75 }}
        >
          <Typography variant="caption" fontWeight={700}>
            Expand plot
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
            +1 row and column (max {MAX_GRID_SIZE}×{MAX_GRID_SIZE}). Now {size}×{size}.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="small"
            fullWidth
            disabled={!canExpand || shopDisabled}
            onClick={tryExpand}
          >
            {size >= MAX_GRID_SIZE ? "Max size" : `${nextExpandCost} coins`}
          </Button>
        </Paper>

        <Divider sx={{ my: 1.25 }} />

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Fertilizers
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, lineHeight: 1.35 }}>
          Apply from the toolbar to growing plants.
        </Typography>
        <Stack spacing={1} sx={{ mb: 1 }}>
          {FERTILIZER_ORDER.map((id) => {
            const f = FERTILIZERS[id];
            const affordable = game.money >= f.shopPrice;
            return (
              <Paper key={id} elevation={0} variant="outlined" sx={{ p: 1 }}>
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.5 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: 0.5,
                      bgcolor: f.color,
                      border: 1,
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" fontWeight={700} noWrap sx={{ minWidth: 0 }}>
                    {f.name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35, mb: 0.75 }}>
                  {f.description}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  size="small"
                  fullWidth
                  disabled={!affordable || shopDisabled}
                  onClick={() => tryBuyFertilizer(id)}
                >
                  {f.shopPrice} coins
                </Button>
              </Paper>
            );
          })}
        </Stack>

        <Divider sx={{ my: 1 }} />

        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: 0.06 }}>
          Seeds
        </Typography>
        <Stack spacing={1}>
          {SEED_ORDER.map((id) => {
            const def = SEEDS[id];
            const affordable = game.money >= def.shopPrice;
            return (
              <Paper key={id} elevation={0} variant="outlined" sx={{ p: 1 }}>
                <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.5 }}>
                  <Box
                    aria-hidden
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: def.color,
                      border: 1,
                      borderColor: "divider",
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="caption" fontWeight={700} noWrap sx={{ minWidth: 0 }}>
                    {def.name}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.35, mb: 0.75 }}>
                  {def.description}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  fullWidth
                  disabled={!affordable || shopDisabled}
                  onClick={() => tryBuySeed(id)}
                >
                  {def.shopPrice} coins
                </Button>
              </Paper>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
}
