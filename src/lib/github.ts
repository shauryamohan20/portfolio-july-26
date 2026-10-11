/**
 * Commits files to the repository through the GitHub API.
 *
 * A deployed Next.js app has a read-only filesystem, so saving online means
 * writing back to the repo and letting the host redeploy. Everything in one
 * save goes into a single commit (via the Git Data API) so each save triggers
 * exactly one deploy.
 *
 * Needs:
 *   GITHUB_TOKEN  fine-grained token with "Contents: read and write" on the repo
 *   GITHUB_REPO   "owner/name"
 *   GITHUB_BRANCH optional, defaults to "main"
 */

export type CommitFile = {
  /** Repo-relative path, e.g. "data/projects.json". */
  path: string;
  /** Text content, or base64 for binary files. */
  content: string;
  encoding: "utf-8" | "base64";
};

export function githubConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_REPO);
}

function config() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new Error(
      "Saving online needs GITHUB_TOKEN and GITHUB_REPO to be set in the environment."
    );
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error(`GITHUB_REPO should look like "owner/name", got "${repo}".`);
  }
  return {
    token,
    repo,
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

/** Overridable so the commit path can be exercised against a mock server. */
function apiBase() {
  return process.env.GITHUB_API_URL || "https://api.github.com";
}

async function gh<T>(
  path: string,
  init: RequestInit & { token: string }
): Promise<T> {
  const { token, ...rest } = init;
  const response = await fetch(`${apiBase()}${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...rest.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub ${response.status} on ${path}: ${body.slice(0, 300) || response.statusText}`
    );
  }
  return response.json() as Promise<T>;
}

/** Read a file from the repo. Returns undefined when it does not exist. */
export async function readRepoFile(path: string): Promise<string | undefined> {
  const { token, repo, branch } = config();
  const response = await fetch(
    `${apiBase()}/repos/${repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(branch)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github.raw",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );

  if (response.status === 404) return undefined;
  if (!response.ok) {
    throw new Error(`GitHub ${response.status} reading ${path}`);
  }
  return response.text();
}

/** Commit one or more files to the branch in a single commit. */
export async function commitFiles(files: CommitFile[], message: string) {
  const { token, repo, branch } = config();
  const base = `/repos/${repo}`;

  const ref = await gh<{ object: { sha: string } }>(
    `${base}/git/ref/heads/${encodeURIComponent(branch)}`,
    { token }
  );
  const headSha = ref.object.sha;

  const headCommit = await gh<{ tree: { sha: string } }>(
    `${base}/git/commits/${headSha}`,
    { token }
  );

  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await gh<{ sha: string }>(`${base}/git/blobs`, {
        token,
        method: "POST",
        body: JSON.stringify({ content: file.content, encoding: file.encoding }),
      });
      return { path: file.path, sha: blob.sha };
    })
  );

  const tree = await gh<{ sha: string }>(`${base}/git/trees`, {
    token,
    method: "POST",
    body: JSON.stringify({
      base_tree: headCommit.tree.sha,
      tree: blobs.map((blob) => ({
        path: blob.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      })),
    }),
  });

  const commit = await gh<{ sha: string }>(`${base}/git/commits`, {
    token,
    method: "POST",
    body: JSON.stringify({
      message,
      tree: tree.sha,
      parents: [headSha],
    }),
  });

  await gh(`${base}/git/refs/heads/${encodeURIComponent(branch)}`, {
    token,
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
}
