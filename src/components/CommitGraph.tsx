import type { CommitViewModel } from "@/types/git-graph";
import { renderCommitGraph } from "@/utils/graph-renderer";
import { useEffect, useRef } from "react";
interface CommitGraphProps {
  viewModel: CommitViewModel;
  className?: string;
}
export function CommitGraph({ viewModel, className }: CommitGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    // Clear previous content
    containerRef.current.innerHTML = "";
    // Render the SVG graph
    const svg = renderCommitGraph(viewModel);
    containerRef.current.appendChild(svg);
  }, [viewModel]);
  return <div ref={containerRef} className={className} />;
}
