import {
  BRANCH_COLORS,
  CIRCLE_RADIUS,
  CIRCLE_STROKE_WIDTH,
  SWIMLANE_CURVE_RADIUS,
  SWIMLANE_HEIGHT,
  SWIMLANE_WIDTH,
} from "@/constants/graph-constants";
import type { CommitViewModel } from "@/types/git-graph";
import { findLastIndex } from "@/utils/graph-algorithm";
import { createPath, drawCircle, drawVerticalLine } from "@/utils/svg-helpers";
/**
 * Renders a single commit row as an SVG element
 */
export function renderCommitGraph(viewModel: CommitViewModel): SVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

  const { commit, kind, inputSwimlanes, outputSwimlanes } = viewModel;
  // Find where this commit appears in the input swimlanes
  const inputIndex = inputSwimlanes.findIndex((node) => node.id === commit.id);
  // Determine circle position (column index)
  const circleIndex = inputIndex !== -1 ? inputIndex : inputSwimlanes.length;
  // Determine circle color
  const circleColor =
    circleIndex < outputSwimlanes.length
      ? outputSwimlanes[circleIndex].color
      : circleIndex < inputSwimlanes.length
      ? inputSwimlanes[circleIndex].color
      : BRANCH_COLORS[0];
  let outputSwimlaneIndex = 0;
  // STEP 1: Draw lines for all input swimlanes
  for (let i = 0; i < inputSwimlanes.length; i++) {
    const color = inputSwimlanes[i].color;
    if (inputSwimlanes[i].id === commit.id) {
      // This is the current commit's swimlane
      if (i !== circleIndex) {
        // Base commit case: draw merge curve
        const pathData: string[] = [];
        const midY = SWIMLANE_HEIGHT / 2;
        const arcRadius = Math.min(SWIMLANE_WIDTH, SWIMLANE_HEIGHT / 2);

        // Draw curve from top to circle level
        pathData.push(`M ${SWIMLANE_WIDTH * (i + 1)} 0`);
        pathData.push(`V ${midY - arcRadius}`);
        pathData.push(
          `A ${arcRadius} ${arcRadius} 0 0 1 ${
            SWIMLANE_WIDTH * (i + 1) - arcRadius
          } ${midY}`
        );
        // Horizontal line to circle
        pathData.push(`H ${SWIMLANE_WIDTH * (circleIndex + 1)}`);

        const path = createPath(color);
        path.setAttribute("d", pathData.join(" "));
        svg.appendChild(path);
      } else {
        outputSwimlaneIndex++;
      }
    } else {
      // Not the current commit - check if it continues to output
      if (
        outputSwimlaneIndex < outputSwimlanes.length &&
        inputSwimlanes[i].id === outputSwimlanes[outputSwimlaneIndex].id
      ) {
        if (i === outputSwimlaneIndex) {
          // Straight line down
          const path = drawVerticalLine(
            SWIMLANE_WIDTH * (i + 1),
            0,
            SWIMLANE_HEIGHT,
            color
          );
          svg.appendChild(path);
        } else {
          // Lane change: draw S-curve
          const pathData: string[] = [];
          pathData.push(`M ${SWIMLANE_WIDTH * (i + 1)} 0`);
          pathData.push(`V 6`);
          // First curve
          pathData.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 1 ${
              SWIMLANE_WIDTH * (i + 1) - SWIMLANE_CURVE_RADIUS
            } ${SWIMLANE_HEIGHT / 2}`
          );
          // Horizontal line
          pathData.push(
            `H ${
              SWIMLANE_WIDTH * (outputSwimlaneIndex + 1) + SWIMLANE_CURVE_RADIUS
            }`
          );
          // Second curve
          pathData.push(
            `A ${SWIMLANE_CURVE_RADIUS} ${SWIMLANE_CURVE_RADIUS} 0 0 0 ${
              SWIMLANE_WIDTH * (outputSwimlaneIndex + 1)
            } ${SWIMLANE_HEIGHT / 2 + SWIMLANE_CURVE_RADIUS}`
          );
          pathData.push(`V ${SWIMLANE_HEIGHT}`);
          const path = createPath(color);
          path.setAttribute("d", pathData.join(" "));
          svg.appendChild(path);
        }
        outputSwimlaneIndex++;
      }
    }
  }
  // STEP 2: Draw lines for additional parents (merge commits)
  for (let p = 1; p < commit.parentIds.length; p++) {
    const parentOutputIndex = findLastIndex(
      outputSwimlanes,
      commit.parentIds[p]
    );
    if (parentOutputIndex === -1) continue;

    const color = outputSwimlanes[parentOutputIndex].color;
    const parentX = SWIMLANE_WIDTH * (parentOutputIndex + 1);
    const circleX = SWIMLANE_WIDTH * (circleIndex + 1);
    const midY = SWIMLANE_HEIGHT / 2;
    const bottomY = SWIMLANE_HEIGHT;

    // Calculate arc radius dynamically
    const arcRadius = Math.min(SWIMLANE_WIDTH, SWIMLANE_HEIGHT / 2);

    // Create continuous path: Circle → Horizontal → Arc down
    const pathData: string[] = [];

    // Start at circle center
    pathData.push(`M ${circleX} ${midY}`);

    // Horizontal line to just before the arc
    const arcStartX = parentX - arcRadius;
    pathData.push(`H ${arcStartX}`);

    // Arc down
    pathData.push(
      `A ${arcRadius} ${arcRadius} 0 0 1 ${parentX} ${midY + arcRadius}`
    );

    // Vertical line to bottom
    pathData.push(`V ${bottomY}`);

    const path = createPath(color);
    path.setAttribute("d", pathData.join(" "));
    svg.appendChild(path);
  }
  // STEP 3: Draw vertical line TO the circle (from top)
  if (inputIndex !== -1) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      0,
      SWIMLANE_HEIGHT / 2,
      inputSwimlanes[inputIndex].color
    );
    svg.appendChild(path);
  }
  // STEP 4: Draw vertical line FROM the circle (to bottom)
  if (commit.parentIds.length > 0) {
    const path = drawVerticalLine(
      SWIMLANE_WIDTH * (circleIndex + 1),
      SWIMLANE_HEIGHT / 2,
      SWIMLANE_HEIGHT,
      circleColor
    );
    svg.appendChild(path);
  }
  // STEP 5: Draw the commit circle
  if (kind === "HEAD") {
    // HEAD: double circle
    const outerCircle = drawCircle(
      circleIndex,
      CIRCLE_RADIUS + 3,
      CIRCLE_STROKE_WIDTH,
      circleColor,
      "none"
    );
    svg.appendChild(outerCircle);
    const innerCircle = drawCircle(
      circleIndex,
      CIRCLE_STROKE_WIDTH,
      CIRCLE_RADIUS,
      circleColor
    );
    svg.appendChild(innerCircle);
  } else if (kind === "merge") {
    // Merge: double circle
    const outerCircle = drawCircle(
      circleIndex,
      CIRCLE_RADIUS + 2,
      CIRCLE_STROKE_WIDTH,
      circleColor
    );
    svg.appendChild(outerCircle);
    const innerCircle = drawCircle(
      circleIndex,
      CIRCLE_RADIUS - 1,
      CIRCLE_STROKE_WIDTH,
      circleColor
    );
    svg.appendChild(innerCircle);
  } else {
    // Regular commit: single circle
    const circle = drawCircle(
      circleIndex,
      CIRCLE_RADIUS + 1,
      CIRCLE_STROKE_WIDTH,
      circleColor
    );
    svg.appendChild(circle);
  }
  // Set SVG dimensions
  const maxSwimlanes = Math.max(
    inputSwimlanes.length,
    outputSwimlanes.length,
    1
  );
  svg.style.display = "block";
  svg.style.height = `${SWIMLANE_HEIGHT}px`;
  svg.style.width = `${SWIMLANE_WIDTH * (maxSwimlanes + 1)}px`;
  return svg;
}
