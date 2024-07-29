export function calculateStats(data: number[]): {
  mean: number;
  median: number;
} {
  return {
    mean: calculateMean(data),
    median: calculateMedian(data),
  };
}

function calculateMean(data: number[]): number {
  return data.reduce((sum, value) => sum + value, 0) / data.length;
}

function calculateMedian(data: number[]): number {
  const sorted = [...data].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}
