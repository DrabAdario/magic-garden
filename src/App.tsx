import { Box, Container, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdmurinCredits } from "./components/AdmurinCredits";
import { BackpackInventory } from "./components/BackpackInventory";
import { FertilizerPalette } from "./components/FertilizerPalette";
import { GameBoard } from "./components/GameBoard";
import { Hud } from "./components/Hud";
import { SavesWipScreen } from "./components/SavesWipScreen";
import { ScoreScreen } from "./components/ScoreScreen";
import { WinterGameScreen } from "./components/WinterGameScreen";
import { SeedPalette } from "./components/SeedPalette";
import { ShopPanel } from "./components/ShopPanel";
import { StarterSeedDialog } from "./components/StarterSeedDialog";
import { StartScreen } from "./components/StartScreen";
import { backgroundForYearPhase } from "./game/seasonBackgrounds";
import {
  advanceSeasonEarly,
  applyFertilizer,
  computeSeasonScore,
  convertCropBagToRations,
  createInitialState,
  finalizeYearToScoreScreen,
  harvestCell,
  isGrowingSeason,
  pickRandomStarterSeedId,
  placeSeed,
  resolveWinterChoice,
  sellAllCrops,
  tick,
} from "./game/simulation";
import { SEED_ORDER } from "./game/seeds";
import type { GameState } from "./game/types";

function bagCount(bag: Record<string, number>): number {
  return Object.values(bag).reduce((a, b) => a + b, 0);
}

type AppScreen = "start" | "saves-wip" | "play";

export function App() {
  const [appScreen, setAppScreen] = useState<AppScreen>("start");
  const [game, setGame] = useState(() => createInitialState("carrot"));
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

  const onPackRations = useCallback(() => {
    setGame((g) => convertCropBagToRations(g));
  }, []);

  const onWinterChoice = useCallback((choiceIndex: 0 | 1) => {
    setGame((g) => resolveWinterChoice(g, choiceIndex));
  }, []);

  const onViewYearResults = useCallback(() => {
    setGame((g) => finalizeYearToScoreScreen(g));
  }, []);

  const onNewSeason = useCallback(() => {
    const id = pickRandomStarterSeedId();
    setGame(createInitialState(id));
    setSelectedSeed(id);
    setStarterGiftSeedId(id);
  }, []);

  const onStartGame = useCallback(() => {
    const id = pickRandomStarterSeedId();
    setGame(createInitialState(id));
    setSelectedSeed(id);
    setStarterGiftSeedId(id);
    setAppScreen("play");
  }, []);

  const applyShop = useCallback((next: GameState) => {
    setGame(next);
  }, []);

  useEffect(() => {
    if (!game.unlockedSeeds[selectedSeed]) {
      setSelectedSeed(SEED_ORDER.find((id) => game.unlockedSeeds[id]) ?? "carrot");
    }
  }, [game, selectedSeed]);

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
      <Stack
        sx={{
          flex: 1,
          minHeight: "100dvh",
          bgcolor: backgroundForYearPhase("winter"),
        }}
      >
        <WinterGameScreen game={game} onChoice={onWinterChoice} onViewResults={onViewYearResults} />
        <AdmurinCredits />
      </Stack>
    );
  }

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        px: { xs: 1.5, sm: 2 },
        py: 1.5,
        pb: "max(12px, env(safe-area-inset-bottom))",
        minHeight: "100dvh",
        bgcolor: backgroundForYearPhase(game.yearPhase),
      }}
    >
      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
        <Hud
          yearPhase={game.yearPhase}
          seasonEarnings={game.seasonEarnings}
          cropBagTotal={bagTotal}
          rations={game.rations}
          harvestsRemaining={game.harvestsRemaining}
          paused={game.paused}
          seasonEnded={game.seasonEnded}
          onPauseToggle={togglePause}
          onSell={onSell}
          onPackRations={onPackRations}
          onAdvanceSeasonEarly={onAdvanceSeasonEarly}
        />
        <StarterSeedDialog seedId={starterGiftSeedId} onClose={() => setStarterGiftSeedId(null)} />
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 1.5,
            flex: 1,
            minHeight: 0,
            alignItems: { xs: "stretch", md: "flex-start" },
          }}
        >
          <Box sx={{ order: { xs: 1, md: 0 }, width: { md: "auto" } }}>
            <ShopPanel game={game} onApply={applyShop} />
          </Box>
          <Stack
            spacing={1.5}
            sx={{
              flex: 1,
              minWidth: 0,
              minHeight: 0,
              order: { xs: 3, md: 0 },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
              <strong>Spring</strong> (20) → <strong>summer</strong> (25) → <strong>fall</strong> (10) →{" "}
              <strong>winter</strong> (survival choices — one ration per day). Shop: unlock new species (high cost),
              then buy seeds. Carrot, tomato, and sunflower start unlocked.
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
              unlockedSeeds={game.unlockedSeeds}
              disabled={game.paused}
            />
            <FertilizerPalette
              selected={selectedFertilizer}
              onSelect={setSelectedFertilizer}
              inventory={game.fertilizerInventory}
              disabled={game.paused}
            />
          </Stack>
          <Box sx={{ order: { xs: 2, md: 0 }, width: { md: "auto" } }}>
            <BackpackInventory
              money={game.money}
              rations={game.rations}
              cropBag={game.cropBag}
              seedInventory={game.inventory}
              fertilizerInventory={game.fertilizerInventory}
            />
          </Box>
        </Box>
      </Stack>
      <AdmurinCredits />
    </Container>
  );
}
