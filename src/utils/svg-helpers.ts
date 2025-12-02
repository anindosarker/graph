import { SWIMLANE_HEIGHT, SWIMLANE_WIDTH } from "@/constants/graph-constants";
/**
 * Creates an SVG path element with styling
 */
export function createPath(color: string, strokeWidth = 1): SVGPathElement {
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", color);
  path.setAttribute("stroke-width", `${strokeWidth}px`);
  path.setAttribute("stroke-linecap", "round");
  return path;
}
/**
 * Draws a vertical line from (x, y1) to (x, y2)
 */
export function drawVerticalLine(
  x: number,
  y1: number,
  y2: number,
  color: string,
  strokeWidth = 1
): SVGPathElement {
  const path = createPath(color, strokeWidth);
  // M = Move to, V = Vertical line to
  path.setAttribute("d", `M ${x} ${y1} V ${y2}`);
  return path;
}
/**
 * Draws a commit circle at the given swimlane index
 */
export function drawCircle(
  index: number,
  radius: number,
  strokeWidth: number,
  color: string,
  fill?: string
): SVGCircleElement {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  // Position: index determines horizontal position
  const cx = SWIMLANE_WIDTH * (index + 1);
  const cy = SWIMLANE_HEIGHT / 2; // Vertically centered in the row
  circle.setAttribute("cx", `${cx}`);
  circle.setAttribute("cy", `${cy}`);
  circle.setAttribute("r", `${radius}`);
  circle.setAttribute("stroke", color);
  circle.setAttribute("stroke-width", `${strokeWidth}px`);
  if (fill) {
    circle.setAttribute("fill", fill);
  } else {
    circle.setAttribute("fill", color);
  }
  return circle;
}
/**
 * Draws a dashed circle (for pending changes)
 */
export function drawDashedCircle(
  index: number,
  radius: number,
  strokeWidth: number,
  color: string
): SVGCircleElement {
  const circle = drawCircle(index, radius, strokeWidth, color, "none");
  circle.setAttribute("stroke-dasharray", "4,2");
  return circle;
}
