import { Box } from "@mui/material";

type Sheet = {
  file: string;
  width: number;
  height: number;
  cell: number;
};

type Props = {
  sheet: Sheet;
  col: number;
  row: number;
  /** Display size in CSS pixels (square). */
  size: number;
  /** Optional border for UI contrast */
  bordered?: boolean;
};

/**
 * Renders one cell from a PNG sprite sheet using background-position (crisp pixel art).
 */
export function SpriteSheetIcon({ sheet, col, row, size, bordered }: Props) {
  const { width: sw, height: sh, cell: cw } = sheet;
  const ch = cw;
  const scale = size / cw;
  const bgW = sw * scale;
  const bgH = sh * scale;
  const url = `${import.meta.env.BASE_URL}sprites/${sheet.file}`;

  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        boxSizing: "border-box",
        border: bordered ? 1 : 0,
        borderColor: "divider",
        borderRadius: bordered ? 0.5 : 0,
        backgroundImage: `url(${url})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `-${col * cw * scale}px -${row * ch * scale}px`,
        imageRendering: "pixelated",
      }}
    />
  );
}
