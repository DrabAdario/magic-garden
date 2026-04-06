import { Container, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FertilizerPalette } from "./components/FertilizerPalette";
import { GameBoard } from "./components/GameBoard";
import { Hud } from "./components/Hud";
import { SavesWipScreen } from "./components/SavesWipScreen";
import { ScoreScreen } from "./components/ScoreScreen";
import { WinterWipScreen } from "./components/WinterWipScreen";
import { SeedPalette } from "./components/SeedPalette";
import { ShopModal } from "./components/ShopModal";
import { StarterSeedDialog } from "./components/StarterSeedDialog";
import { StartScreen } from "./components/StartScreen";
import { backgroundForYearPhase } from "./game/seasonBackgrounds";
import {
  advanceSeasonEarly,
  applyFertilizer,
  computeSeasonScore,
  createInitialState,
  finalizeYearToScoreScreen,
  harvestCell,
  isGrowingSeason,
  pickRandomStarterSeedId,
  placeSeed,
  sellAllCrops,
  tick,
} from "./game/simulation";
import type { GameState } from "./game/types";

function bagCount(bag: Record<string, number>): number {
  return Object.values(bag).reduce((a, b) => a + b, 0);
}

type AppScreen = "start" | "saves-wip" | "play";

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("start");
  const [game, setGame] = useState(() => createInitialState("carrot"));
  const [shopOpen, setShopOpen] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState("carrot");
  const [selectedFertilizer, setSelectedFertilizer] = useState<string | null>(null);
  const [starterGiftSeedId, setStarterGiftSeedId] = useState<string | null>(null);
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    if (appScreen !== "play") return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const raw = now - last;
      last = now;
      const dt = Math.min(Math.max(raw, 0), 80);
      const g = gameRef.current;
      if (!g.paused && !g.seasonEnded && isGrowingSeason(g)) {
        setGame((prev) => tick(prev, dt));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [appScreen]);

  const onCellTap = useCallback(
    (row: number, col: number) => {
      setGame((g) => {
        if (g.seasonEnded || g.paused || !isGrowingSeason(g)) return g;
        if (selectedFertilizer) {
          return applyFertilizer(g, row, col, selectedFertilizer);
        }
        const cell = g.grid[row][col];
        if (cell?.mature) return harvestCell(g, row, col);
        if (!cell) return placeSeed(g, row, col, selectedSeed);
        return g;
      });
    },
    [selectedSeed, selectedFertilizer],
  );

  const togglePause = useCallback(() => {
    setGame((g) => (g.seasonEnded ? g : { ...g, paused: !g.paused }));
  }, []);

  const onSell = useCallback(() => {
    setGame((g) => sellAllCrops(g));
  }, []);

  const onAdvanceSeasonEarly = useCallback(() => {
    setGame((g) => advanceSeasonEarly(g));
  }, []);

  const onViewYearResults = useCallback(() => {
    setGame((g) => finalizeYearToScoreScreen(g));
  }, []);

  const onNewSeason = useCallback(() => {
    const id = pickRandomStarterSeedId();
    setGame(createInitialState(id));
    setSelectedSeed(id);
    setShopOpen(false);
    setStarterGiftSeedId(id);
  }, []);

  const onStartGame = useCallback(() => {
    const id = pickRandomStarterSeedId();
    setGame(createInitialState(id));
    setSelectedSeed(id);
    setShopOpen(false);
    setStarterGiftSeedId(id);
    setAppScreen("play");
  }, []);

  const applyShop = useCallback((next: GameState) => {
    setGame(next);
  }, []);

  const score = useMemo(() => computeSeasonScore(game), [game]);

  const bagTotal = bagCount(game.cropBag);

  if (appScreen === "start") {
    return (
      <Stack sx={{ flex: 1, minHeight: "100dvh", bgcolor: "background.default" }}>
        <StartScreen onStartGame={onStartGame} onSaves={() => setAppScreen("saves-wip")} />
      </Stack>
    );
  }

  if (appScreen === "saves-wip") {
    return (
      <Stack sx={{ flex: 1, minHeight: "100dvh", bgcolor: "background.default" }}>
        <SavesWipScreen onBack={() => setAppScreen("start")} />
      </Stack>
    );
  }

  if (game.seasonEnded) {
    return (
      <Stack sx={{ flex: 1, minHeight: "100dvh", bgcolor: "background.default" }}>
        <ScoreScreen score={score} onNewSeason={onNewSeason} />
      </Stack>
    );
  }

  if (game.yearPhase === "winter") {
    return (
      <Stack sx={{ flex: 1, minHeight: "100dvh", bgcolor: backgroundForYearPhase("winter") }}>
        <WinterWipScreen onViewResults={onViewYearResults} />
      </Stack>
    );
  }

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        px: 1.5,
        py: 1.5,
        pb: "max(12px, env(safe-area-inset-bottom))",
        minHeight: "100dvh",
        bgcolor: backgroundForYearPhase(game.yearPhase),
      }}
    >
      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        <Hud
          yearPhase={game.yearPhase}
          money={game.money}
          seasonEarnings={game.seasonEarnings}
          cropBagTotal={bagTotal}
          harvestsRemaining={game.harvestsRemaining}
          paused={game.paused}
          seasonEnded={game.seasonEnded}
          onPauseToggle={togglePause}
          onSell={onSell}
          onOpenShop={() => setShopOpen(true)}
          onAdvanceSeasonEarly={onAdvanceSeasonEarly}
        />
        <ShopModal
          open={shopOpen}
          game={game}
          onClose={() => setShopOpen(false)}
          onApply={applyShop}
        />
        <StarterSeedDialog seedId={starterGiftSeedId} onClose={() => setStarterGiftSeedId(null)} />
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
          <strong>Spring</strong> (20) → <strong>summer</strong> (25) → <strong>fall</strong> (10) →{" "}
          <strong>winter</strong>. Each harvest uses one tick; sell anytime for shop coins.{" "}
          <strong>End season early</strong> skips to the next phase.
        </Typography>
        <GameBoard
          grid={game.grid}
          selectedSeed={selectedSeed}
          selectedFertilizer={selectedFertilizer}
          onCellTap={onCellTap}
          paused={game.paused}
          seasonEnded={game.seasonEnded}
        />
        <SeedPalette
          selected={selectedSeed}
          onSelect={(id) => {
            setSelectedFertilizer(null);
            setSelectedSeed(id);
          }}
          inventory={game.inventory}
          disabled={game.paused}
        />
        <FertilizerPalette
          selected={selectedFertilizer}
          onSelect={setSelectedFertilizer}
          inventory={game.fertilizerInventory}
          disabled={game.paused}
        />
      </Stack>
    </Container>
  );
}
