import AcUnitIcon from "@mui/icons-material/AcUnit";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

type Props = {
  onViewResults: () => void;
};

export function WinterWipScreen({ onViewResults }: Props) {
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
        aria-labelledby="winter-wip-title"
        sx={{
          width: "100%",
          p: 3,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
          bgcolor: "rgba(15, 26, 42, 0.85)",
        }}
      >
        <AcUnitIcon sx={{ fontSize: 48, color: "primary.light", mb: 1 }} aria-hidden />
        <Typography id="winter-wip-title" variant="h5" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Winter
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, mx: "auto" }}>
          The winter minigame is coming soon. For now, wrap up and see how your year went.
        </Typography>
        <Box sx={{ maxWidth: 280, mx: "auto" }}>
          <Button variant="contained" color="primary" size="large" fullWidth onClick={onViewResults}>
            View year results
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
