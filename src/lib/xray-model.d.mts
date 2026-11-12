export interface InspectablePart {
  readonly id: string;
  readonly label: string;
  readonly x: number;
  readonly y: number;
  readonly description: string;
}
export declare const INSPECTABLE_PARTS: readonly InspectablePart[];
export declare const DEFAULT_INSPECTION: Readonly<{x:number;y:number}>;
export declare function closestInspectablePart(x:number,y:number): InspectablePart;
export declare function clampInspectionPoint(x:number,y:number):{x:number;y:number};
