import type { CommitViewModel } from "@/types/git-graph";
import { CommitGraph } from "./CommitGraph";
interface CommitListProps {
  viewModels: CommitViewModel[];
}
export function CommitList({ viewModels }: CommitListProps) {
  return (
    <div className="space-y-0">
      {viewModels.map((viewModel) => (
        <div
          key={viewModel.commit.id}
          className="flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-800 px-2"
        >
          {/* Graph column */}
          <div className="shrink-0">
            <CommitGraph viewModel={viewModel} />
          </div>
          {/* Commit info column */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">
              {viewModel.commit.subject}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {viewModel.commit.author} • {viewModel.commit.id.substring(0, 7)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
