import type { CommitViewModel } from "@/types/git-graph";
import { CommitGraph } from "./CommitGraph";
interface CommitListProps {
  viewModels: CommitViewModel[];
}
export function CommitList({ viewModels }: CommitListProps) {
  return (
    <div className="flex">
      {/* Graph column - no gaps between rows */}
      <div className="flex flex-col">
        {viewModels.map((viewModel) => (
          <CommitGraph key={viewModel.commit.id} viewModel={viewModel} />
        ))}
      </div>

      {/* Info column */}
      <div className="flex-1">
        {viewModels.map((viewModel) => (
          <div
            key={viewModel.commit.id}
            className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-1"
            style={{ height: "44px" }}
          >
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="text-sm font-medium truncate leading-tight">
                {viewModel.commit.subject}
              </div>
              <div className="text-xs text-gray-500 truncate leading-tight">
                {viewModel.commit.author} •{" "}
                {viewModel.commit.id.substring(0, 7)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
