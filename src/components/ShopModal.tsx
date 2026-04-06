import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    <Drawer
      anchor={isMobile ? "bottom" : "left"}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: isMobile
          ? {
              maxHeight: "min(88dvh, 640px)",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              backgroundImage: "none",
            }
          : {
              width: { md: "min(420px, 92vw)" },
              height: "100%",
              maxHeight: "100dvh",
              borderTopRightRadius: 16,
              borderBottomRightRadius: 16,
              bgcolor: "background.paper",
              borderRight: 1,
              borderColor: "divider",
              backgroundImage: "none",
            },
      }}
      slotProps={{
        backdrop: {
          sx: { bgcolor: "rgba(0,0,0,0.55)" },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          ...(isMobile
            ? { maxHeight: "min(88dvh, 640px)" }
            : { height: "100%", minHeight: 0, flex: 1 }),
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            px: 2,
            pt: isMobile ? 1 : 2,
            pb: 0.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {isMobile && (
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: "divider",
                mx: "auto",
                mb: 1.5,
              }}
            />
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              pb: 1,
            }}
          >
            <Typography id="shop-title" variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              Shop
            </Typography>
            <IconButton aria-label="Close shop" onClick={onClose} edge="end" size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Box
          sx={{
            overflow: "auto",
            flex: isMobile ? undefined : 1,
            minHeight: 0,
            px: 2,
            py: 2,
            pb: "max(16px, env(safe-area-inset-bottom))",
            ...(!isMobile && {
              pl: "max(16px, env(safe-area-inset-left, 0px))",
            }),
          }}
        >
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
        </Box>
      </Box>
    </Drawer>
  );
}
