"use client";

import { useMemo } from "react";

/**
 * Minimal QR code renderer using SVG.
 * Generates a visual QR-style pattern from a URL string.
 * For production, replace with a proper QR library like `qrcode`.
 */
export function QrCode({
  value,
  size = 160,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const cells = useMemo(() => {
    // Simple hash-based grid generation for visual representation
    const grid: boolean[][] = [];
    const moduleCount = 21; // QR Version 1
    for (let row = 0; row < moduleCount; row++) {
      grid[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        // Finder patterns (top-left, top-right, bottom-left)
        if (
          (row < 7 && col < 7) ||
          (row < 7 && col >= moduleCount - 7) ||
          (row >= moduleCount - 7 && col < 7)
        ) {
          const isOuter =
            row === 0 ||
            col === 0 ||
            row === 6 ||
            col === 6 ||
            row === moduleCount - 7 ||
            col === moduleCount - 7 ||
            row === moduleCount - 1 ||
            col === moduleCount - 1;
          const isInner =
            (row >= 2 && row <= 4 && col >= 2 && col <= 4) ||
            (row >= 2 && row <= 4 && col >= moduleCount - 5 && col <= moduleCount - 3) ||
            (row >= moduleCount - 5 && row <= moduleCount - 3 && col >= 2 && col <= 4);
          grid[row][col] = isOuter || isInner;
        } else {
          // Data area: deterministic pattern from value hash
          let hash = 0;
          for (let i = 0; i < value.length; i++) {
            hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
          }
          hash = ((hash << (row + col)) - hash + row * 31 + col * 17) | 0;
          grid[row][col] = Math.abs(hash) % 3 !== 0;
        }
      }
    }
    return grid;
  }, [value]);

  const cellSize = size / 21;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`QR code for ${value}`}
    >
      <rect width={size} height={size} fill="white" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}
