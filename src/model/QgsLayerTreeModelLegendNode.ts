export interface QgsLayerTreeModelLegendNode {
  isValid(): boolean;
  label(): string;
  symbolImage(size: number): string;
}
