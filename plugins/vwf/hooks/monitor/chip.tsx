import type { ClientModule } from "claude-code";

/** What the hooks module hands the chip: plain data alone. */
export type ChipProps = {
  /** One glyph for each unit: its color, or null while it is pending. */
  glyphs: (string | null)[];
  count: string;
  word: string;
  color: string;
  took: string;
};

/**
 * The chip above the prompt on the desktop. A desktop Button draws one plain
 * label, so the colored glyphs need this region, and a press anywhere on it
 * posts to the hooks module, which opens the pane.
 */
const Chip: ClientModule<ChipProps> = (props, surface) => {
  const { Box, Text } = surface.elements;
  surface.onPointer((event) => {
    if (event.type === "up") {
      surface.post({ open: true });
    }
  });
  const glyphs = props.glyphs.map((color, i) =>
    color === null
      ? Text({ key: `glyph-${i}`, dimColor: true, children: "▱" })
      : Text({ key: `glyph-${i}`, color, children: "▰" })
  );

  return Box({
    flexDirection: "row",
    children: Text({
      children: [
        ...glyphs,
        Text({ key: "count", children: ` ${props.count} ` }),
        Text({ key: "word", color: props.color, children: props.word }),
        Text({ key: "took", dimColor: true, children: ` ${props.took}` }),
      ],
    }),
  });
};

export default Chip;
