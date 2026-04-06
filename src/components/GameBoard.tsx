import { Box, Button, Typography } from "@mui/material";
import { FERTILIZERS, fertilizerGrowthMult } from "../game/fertilizers";
import { growthMultiplierAt, SEEDS } from "../game/seeds";
import type { PlantedCell } from "../game/types";

type Props = {
  grid: (PlantedCell | null)[][];
  selectedSeed: string;
  selectedFertilizer: string | null;
  onCellTap: (row: number, col: number) => void;
  paused: boolean;
  seasonEnded: boolean;
};

export function GameBoard({
  grid,
  selectedSeed,
  selectedFertilizer,
  onCellTap,
  paused,
  seasonEnded,
}: Props) {
  const blocked = paused || seasonEnded;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: 0,
      }}
    >
      <Box
        role="grid"
        aria-label={`Garden plot ${rows} by ${cols}`}
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: 0.5,
          width: "min(92vw, 420px)",
          aspectRatio: "1",
          p: 0.75,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        {Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const cell = grid[r][c];
            const mult =
              cell && !cell.mature ? growthMultiplierAt(grid, r, c) : null;
            const fertMult =
              cell && !cell.mature && cell.fertilizerId
                ? fertilizerGrowthMult(cell.fertilizerId)
                : 1;
            const combinedMult =
              mult != null ? mult * fertMult : null;
            const seedColor = cell ? SEEDS[cell.seedId].color : undefined;

            const ariaLabel = (() => {
              if (selectedFertilizer) {
                const fn = FERTILIZERS[selectedFertilizer]?.name ?? "fertilizer";
                if (!cell) return `Empty soil — plant a seed first, or apply ${fn} to a growing plant`;
                if (cell.mature) return `${SEEDS[cell.seedId].name} ready — cannot apply ${fn}`;
                return `Apply ${fn} to growing ${SEEDS[cell.seedId].name}`;
              }
              if (cell) {
                return cell.mature
                  ? `${SEEDS[cell.seedId].name}, ready to harvest`
                  : `${SEEDS[cell.seedId].name}, growing`;
              }
              return `Empty plot, plant ${SEEDS[selectedSeed]?.name ?? "seed"}`;
            })();

            return (
              <Button
                key={`${r}-${c}`}
                type="button"
                disabled={blocked}
                onClick={() => onCellTap(r, c)}
                aria-label={ariaLabel}
                sx={{
                  minWidth: 0,
                  minHeight: 0,
                  width: "100%",
                  height: "100%",
                  p: 0.25,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 1,
                  borderWidth: cell?.mature ? 2 : 1,
                  borderStyle: "solid",
                  borderColor: cell?.mature ? "secondary.main" : "divider",
                  bgcolor: cell ? "rgba(20, 32, 24, 0.95)" : "action.hover",
                  color: "text.primary",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    bgcolor: cell ? "rgba(20, 32, 24, 0.95)" : "action.selected",
                  },
                }}
              >
                {cell ? (
                  <>
                    <Box
                      aria-hidden
                      sx={{
                        position: "absolute",
                        inset: 0,
                        top: "auto",
                        height: `${Math.min(100, cell.mature ? 100 : cell.progress * 100)}%`,
                        bgcolor: seedColor,
                        opacity: 0.38,
                        transition: "height 0.2s ease",
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        position: "relative",
                        zIndex: 1,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        textAlign: "center",
                        px: 0.25,
                        fontSize: "clamp(9px, 2.2vw, 11px)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.65)",
                      }}
                    >
                      {cell.mature ? "Harvest" : SEEDS[cell.seedId].name}
                      {!cell.mature && combinedMult !== null && (
                        <>
                          <br />
                          <Box component="span" sx={{ opacity: 0.9, fontSize: "0.9em" }}>
                            ×{combinedMult.toFixed(2)}
                          </Box>
                        </>
                      )}
                    </Typography>
                    {cell.fertilizerId && !cell.mature && (
                      <Box
                        aria-hidden
                        sx={{
                          position: "absolute",
                          bottom: 3,
                          right: 3,
                          width: 10,
                          height: 10,
                          borderRadius: 0.5,
                          bgcolor: FERTILIZERS[cell.fertilizerId]?.color ?? "grey.500",
                          border: "1px solid",
                          borderColor: "divider",
                          zIndex: 2,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <Typography
                    variant="caption"
                    sx={{ opacity: 0.45, fontWeight: 700, position: "relative", zIndex: 1 }}
                  >
                    +
                  </Typography>
                )}
              </Button>
            );
          }),
        ).flat()}
      </Box>
    </Box>
  );
}
