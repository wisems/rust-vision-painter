
// Common type definitions for the application

export interface RustAnalysisResult {
  maskData: Uint8Array | number[];
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}
