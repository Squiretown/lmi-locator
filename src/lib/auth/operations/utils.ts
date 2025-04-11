
// Helper function to extract wait time from error messages
export function extractRetrySeconds(errorMessage: string): number {
  const match = errorMessage.match(/after (\d+) seconds/);
  return match ? parseInt(match[1], 10) : 60; // Default to 60 seconds if we can't parse
}
