import type { GitCommit } from "@/types/git-graph";
import rawData from "../../data/git-graph.json";
interface RawCommitData {
  id: string;
  parentIds: string[];
  author: string;
  timestamp: number;
  subject: string;
  refs?: string; // Optional field
}
export function loadCommits(): GitCommit[] {
  return (rawData as RawCommitData[]).map((raw) => ({
    id: raw.id,
    parentIds: raw.parentIds,
    author: raw.author,
    subject: raw.subject,
    message: raw.subject, // Using subject as message
    timestamp: raw.timestamp,
    // Optional: Parse refs into GitReference objects
    references: raw.refs && raw.refs !== "" ? parseRefs(raw.refs) : undefined,
  }));
}
function parseRefs(refs: string): GitCommit["references"] {
  // Parse refs like "HEAD -> master, origin/master"
  return refs.split(", ").map((ref) => {
    const trimmed = ref.trim();
    const name = trimmed.replace("HEAD -> ", "").replace("origin/", "");
    return {
      id: `refs/${trimmed}`,
      name: name,
      icon: trimmed.includes("HEAD") ? "git-commit" : "git-branch",
    };
  });
}
