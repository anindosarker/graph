import { CommitList } from "@/components/CommitList";
import { loadCommits } from "@/data/load-commits";
import { createCommitViewModels } from "@/utils/graph-algorithm";
function App() {
  // Load your real git data
  const commits = loadCommits();

  // Find the HEAD commit (the one with "HEAD" in refs)
  const headCommit = commits.find((c) =>
    c.references?.some((ref) => ref.name.includes("master"))
  );

  // Create view models from your git data
  const viewModels = createCommitViewModels(commits, headCommit?.id);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Git Graph Visualization</h1>
        <div className="border rounded-lg overflow-hidden">
          <CommitList viewModels={viewModels} />
        </div>
      </div>
    </div>
  );
}
export default App;
