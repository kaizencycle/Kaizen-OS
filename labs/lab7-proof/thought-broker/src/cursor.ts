import fetch from 'node-fetch';

export async function dispatchToCursor(cursorUrl: string, token: string, args: {
  repo: string; branch: string; commitMessage: string; files: { path: string; content: string }[];
}) {
  // Replace this with real Cursor API call
  // Here we just simulate a success payload
  return {
    prUrl: `https://github.com/${args.repo}/pull/123`,
    commitSha: 'e4c1d2f3',
  };
}
