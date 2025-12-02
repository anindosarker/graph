export interface GitCommit {
  id: string; // Commit SHA
  parentIds: string[]; // Parent commit SHAs
  author: string;
  subject: string; // Commit message
  message: string;
  timestamp?: number;
  references?: GitReference[]; // Branches/tags pointing to this commit
}
export interface GitReference {
  id: string; // Reference ID (e.g., "refs/heads/main")
  name: string; // Display name (e.g., "main")
  icon?: string; // Optional icon
  color?: string; // Optional color override
}
export interface GraphNode {
  id: string; // Commit ID this node represents
  color: string; // Color of this swimlane
}
export interface CommitViewModel {
  commit: GitCommit;
  kind: "HEAD" | "node" | "merge";
  inputSwimlanes: GraphNode[]; // Swimlanes before this commit
  outputSwimlanes: GraphNode[]; // Swimlanes after this commit
}
