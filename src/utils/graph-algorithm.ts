import { BRANCH_COLORS } from "@/constants/graph-constants";
import type { CommitViewModel, GitCommit, GraphNode } from "@/types/git-graph";
/**
 * Converts raw git commits into visual view models with swimlane information
 *
 * This is the CORE algorithm that determines how branches are positioned
 */
export function createCommitViewModels(
  commits: GitCommit[],
  headCommitId?: string
): CommitViewModel[] {
  const viewModels: CommitViewModel[] = [];
  let colorIndex = 0;
  // Map to track which commit IDs have which colors
  const colorMap = new Map<string, string>();
  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i];
    // Get input swimlanes from previous commit's output
    const inputSwimlanes: GraphNode[] =
      i === 0 ? [] : [...viewModels[i - 1].outputSwimlanes];
    const outputSwimlanes: GraphNode[] = [];
    // Determine commit kind
    const kind =
      commit.id === headCommitId
        ? "HEAD"
        : commit.parentIds.length > 1
        ? "merge"
        : "node";
    let firstParentAdded = false;
    // Process first parent: replace current commit with its first parent
    if (commit.parentIds.length > 0) {
      for (const node of inputSwimlanes) {
        if (node.id === commit.id) {
          if (!firstParentAdded) {
            // Keep the same color - the parent continues this branch
            outputSwimlanes.push({
              id: commit.parentIds[0],
              color: node.color, // Preserve the existing color!
            });
            firstParentAdded = true;
          }
          continue; // Don't copy this node
        }
        outputSwimlanes.push({ ...node });
      }

      // If commit wasn't in input swimlanes, it's a new branch - assign color
      if (!firstParentAdded) {
        let color = colorMap.get(commit.parentIds[0]);
        if (!color) {
          color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
          colorIndex++;
          colorMap.set(commit.parentIds[0], color);
        }
        outputSwimlanes.push({
          id: commit.parentIds[0],
          color: color,
        });
        firstParentAdded = true;
      }
    }

    // Add additional parents (for merge commits)
    for (let p = firstParentAdded ? 1 : 0; p < commit.parentIds.length; p++) {
      const parentId = commit.parentIds[p];
      let color = colorMap.get(parentId);
      if (!color) {
        color = BRANCH_COLORS[colorIndex % BRANCH_COLORS.length];
        colorIndex++;
        colorMap.set(parentId, color);
      }
      outputSwimlanes.push({
        id: parentId,
        color: color,
      });
    }
    viewModels.push({
      commit,
      kind,
      inputSwimlanes,
      outputSwimlanes,
    });
  }
  return viewModels;
}
/**
 * Helper to find the last occurrence of a commit in swimlanes
 */
export function findLastIndex(nodes: GraphNode[], id: string): number {
  for (let i = nodes.length - 1; i >= 0; i--) {
    if (nodes[i].id === id) {
      return i;
    }
  }
  return -1;
}
