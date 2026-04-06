import { Link, Typography } from "@mui/material";

/**
 * Attribution for Admurin pixel icon packs used under their free license.
 * @see https://admurin.itch.io/
 */
export function AdmurinCredits() {
  return (
    <Typography
      variant="caption"
      color="text.secondary"
      component="p"
      sx={{ textAlign: "center", px: 1, py: 0.5, lineHeight: 1.45 }}
    >
      Pixel icons by{" "}
      <Link href="https://admurin.itch.io/" target="_blank" rel="noopener noreferrer" color="inherit">
        Admurin
      </Link>
      .
    </Typography>
  );
}
