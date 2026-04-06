import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ConstructionIcon from "@mui/icons-material/Construction";
import { Box, Button, Container, Paper, Typography } from "@mui/material";

type Props = {
  onBack: () => void;
};

export function SavesWipScreen({ onBack }: Props) {
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
        aria-labelledby="saves-wip-title"
        sx={{
          width: "100%",
          p: 3,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
        }}
      >
        <ConstructionIcon sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} aria-hidden />
        <Typography id="saves-wip-title" variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Saves
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 320, mx: "auto" }}>
          Save slots and load game are not implemented yet. For now, your run stays in the browser
          session only.
        </Typography>
        <Box sx={{ maxWidth: 280, mx: "auto" }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            startIcon={<ArrowBackIcon />}
            onClick={onBack}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
