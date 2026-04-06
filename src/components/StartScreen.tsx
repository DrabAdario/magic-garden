import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import { Button, Container, Paper, Stack, Typography } from "@mui/material";

type Props = {
  onStartGame: () => void;
  onSaves: () => void;
};

export function StartScreen({ onStartGame, onSaves }: Props) {
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
        aria-labelledby="start-title"
        sx={{
          width: "100%",
          p: 3,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          id="start-title"
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          Magic Garden
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, mx: "auto" }}>
          Plant seeds, grow crops, and sell your harvest. Take it one season at a time.
        </Typography>
        <Stack spacing={1.5} sx={{ maxWidth: 280, mx: "auto" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={onStartGame}
          >
            Start game
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={onSaves}
          >
            Saves
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
