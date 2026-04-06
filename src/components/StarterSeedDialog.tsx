import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { SEEDS } from "../game/seeds";

type Props = {
  seedId: string | null;
  onClose: () => void;
};

export function StarterSeedDialog({ seedId, onClose }: Props) {
  const open = seedId !== null;
  const def = seedId ? SEEDS[seedId] : undefined;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="starter-seed-title"
      PaperProps={{ sx: { border: 1, borderColor: "divider" } }}
    >
      {def && (
        <>
          <DialogTitle id="starter-seed-title" sx={{ fontWeight: 800, pb: 0.5 }}>
            Your starter seed
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This season you begin with a single seed. Make it count.
            </Typography>
            <StackRowSeed def={def} />
            <Typography variant="body2" sx={{ mt: 1.5, lineHeight: 1.45 }}>
              {def.description}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" color="primary" size="large" fullWidth onClick={onClose}>
              Start planting
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function StackRowSeed({ def }: { def: { name: string; color: string } }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Box
        aria-hidden
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          bgcolor: def.color,
          border: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      />
      <Typography variant="h6" component="p" sx={{ fontWeight: 800 }}>
        {def.name}
      </Typography>
    </Box>
  );
}
