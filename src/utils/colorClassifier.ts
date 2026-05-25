/**
 * Color Classifier — maps RGB sensor readings to medical color references.
 * Reference table: Blood, Urine, Skin Disease, Wound Monitoring, pH Strips.
 */

export interface ColorName {
  name: string;
  hex: string;
}

export interface MedicalInterpretation {
  application: string;
  detectedColor: string;
  colorHex: string;
  interpretation: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

// ─── RGB → HSL ───────────────────────────────────────────────────────────────
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
}

// ─── Color Name Detection ─────────────────────────────────────────────────────
export function detectColorName(r: number, g: number, b: number): ColorName {
  const [h, s, l] = rgbToHsl(r, g, b);
  const hex = rgbToHex(r, g, b);

  // Black
  if (l < 15) return { name: 'Black', hex };
  // Pale White / Very Light
  if (l > 85 && s < 20) return { name: 'Pale White', hex };
  // Low saturation (grays)
  if (s < 15) return { name: l > 60 ? 'Light Gray' : 'Gray', hex };

  // Bright Red
  if ((h >= 345 || h <= 10) && s > 55 && l > 45) return { name: 'Bright Red', hex };
  // Dark Red
  if ((h >= 340 || h <= 15) && s > 40 && l <= 45) return { name: 'Dark Red', hex };
  // Pink
  if ((h >= 330 || h <= 20) && l > 60 && s > 20) return { name: 'Pink', hex };
  // Red (general)
  if ((h >= 345 || h <= 10) && s > 40) return { name: 'Red', hex };

  // Orange
  if (h > 10 && h <= 30 && s > 40) return { name: 'Orange', hex };
  // Yellow-Orange
  if (h > 30 && h <= 50 && s > 40) return { name: 'Yellow-Orange', hex };
  // Yellow
  if (h > 50 && h <= 75 && s > 40) return { name: 'Yellow', hex };

  // Brown / Dark Brown
  if (h > 10 && h <= 40 && s > 20 && l < 35) return { name: l < 20 ? 'Dark Brown' : 'Brown', hex };

  // Greenish (low saturation green)
  if (h > 75 && h <= 160 && s >= 15 && s < 40) return { name: 'Greenish', hex };
  // Green
  if (h > 75 && h <= 160 && s >= 40) return { name: 'Green', hex };

  // Blue
  if (h > 190 && h <= 260 && s > 30) return { name: 'Blue', hex };
  // Red-Pink catch-all
  if (h > 300 || h < 20) return { name: 'Red', hex };

  return { name: 'Indeterminate', hex };
}

// ─── Medical Classification ───────────────────────────────────────────────────
export function classifyForMedical(r: number, g: number, b: number): MedicalInterpretation[] {
  const { name: colorName } = detectColorName(r, g, b);

  const lookup: Record<string, MedicalInterpretation[]> = {
    'Bright Red': [
      { application: 'Blood Sample Analysis', detectedColor: 'Bright Red', colorHex: '#DC2626', interpretation: 'Normal oxygenated blood', status: 'NORMAL' },
      { application: 'Wound Monitoring System', detectedColor: 'Bright Red', colorHex: '#DC2626', interpretation: 'Infected or inflamed wound', status: 'CRITICAL' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Red', colorHex: '#DC2626', interpretation: 'Presence of blood in urine', status: 'CRITICAL' },
    ],
    'Dark Red': [
      { application: 'Blood Sample Analysis', detectedColor: 'Dark Red', colorHex: '#7F1D1D', interpretation: 'Low oxygen level — venous blood', status: 'WARNING' },
      { application: 'Wound Monitoring System', detectedColor: 'Dark Red', colorHex: '#7F1D1D', interpretation: 'Inflamed or infected wound tissue', status: 'CRITICAL' },
    ],
    'Red': [
      { application: 'Wound Monitoring System', detectedColor: 'Red', colorHex: '#DC2626', interpretation: 'Infected or inflamed wound', status: 'CRITICAL' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Red', colorHex: '#DC2626', interpretation: 'Presence of blood in urine', status: 'CRITICAL' },
      { application: 'Blood Sample Analysis', detectedColor: 'Red', colorHex: '#DC2626', interpretation: 'Possible oxygenated blood sample', status: 'NORMAL' },
    ],
    'Pink': [
      { application: 'Wound Monitoring System', detectedColor: 'Pink', colorHex: '#FCA5A5', interpretation: 'Healthy healing tissue', status: 'NORMAL' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Pink', colorHex: '#FCA5A5', interpretation: 'Possible trace blood in urine', status: 'WARNING' },
    ],
    'Yellow': [
      { application: 'Urine Test Strip Analysis', detectedColor: 'Yellow', colorHex: '#FBBF24', interpretation: 'Normal urine condition', status: 'NORMAL' },
      { application: 'pH & Diagnostic Strip', detectedColor: 'Yellow-Orange', colorHex: '#FBBF24', interpretation: 'Acidic condition', status: 'WARNING' },
    ],
    'Yellow-Orange': [
      { application: 'pH & Diagnostic Strip', detectedColor: 'Yellow-Orange', colorHex: '#F97316', interpretation: 'Acidic condition', status: 'WARNING' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Yellow-Orange', colorHex: '#F97316', interpretation: 'Concentrated or dehydrated urine', status: 'WARNING' },
    ],
    'Orange': [
      { application: 'pH & Diagnostic Strip', detectedColor: 'Orange', colorHex: '#F97316', interpretation: 'Acidic condition', status: 'WARNING' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Orange', colorHex: '#F97316', interpretation: 'Highly concentrated urine', status: 'WARNING' },
    ],
    'Greenish': [
      { application: 'Urine Test Strip Analysis', detectedColor: 'Greenish', colorHex: '#6EE7B7', interpretation: 'Possible infection', status: 'CRITICAL' },
      { application: 'pH & Diagnostic Strip', detectedColor: 'Green', colorHex: '#4ADE80', interpretation: 'Neutral condition', status: 'NORMAL' },
    ],
    'Green': [
      { application: 'pH & Diagnostic Strip', detectedColor: 'Green', colorHex: '#22C55E', interpretation: 'Neutral condition', status: 'NORMAL' },
      { application: 'Urine Test Strip Analysis', detectedColor: 'Greenish', colorHex: '#86EFAC', interpretation: 'Possible bacterial infection', status: 'CRITICAL' },
    ],
    'Blue': [
      { application: 'pH & Diagnostic Strip', detectedColor: 'Blue', colorHex: '#3B82F6', interpretation: 'Alkaline condition', status: 'NORMAL' },
    ],
    'Pale White': [
      { application: 'Skin Disease Detection', detectedColor: 'Pale White', colorHex: '#F9FAFB', interpretation: 'Poor blood circulation or anaemia', status: 'WARNING' },
    ],
    'Dark Brown': [
      { application: 'Skin Disease Detection', detectedColor: 'Dark Brown', colorHex: '#3B1F0C', interpretation: 'Possible skin lesion or melanoma', status: 'CRITICAL' },
      { application: 'Wound Monitoring System', detectedColor: 'Dark Brown', colorHex: '#3B1F0C', interpretation: 'Possibly necrotic tissue', status: 'CRITICAL' },
    ],
    'Brown': [
      { application: 'Skin Disease Detection', detectedColor: 'Brown', colorHex: '#92400E', interpretation: 'Pigmented area — monitor for change', status: 'WARNING' },
    ],
    'Black': [
      { application: 'Skin Disease Detection', detectedColor: 'Black', colorHex: '#111827', interpretation: 'Possible melanoma — urgent review', status: 'CRITICAL' },
      { application: 'Wound Monitoring System', detectedColor: 'Black', colorHex: '#111827', interpretation: 'Dead tissue (necrosis)', status: 'CRITICAL' },
    ],
  };

  // Return matched interpretations, or a default
  const results = lookup[colorName];
  if (results && results.length > 0) return results;

  return [
    { application: 'Blood Sample Analysis', detectedColor: colorName, colorHex: rgbToHex(r, g, b), interpretation: 'No reference match — manual review required', status: 'WARNING' },
    { application: 'pH & Diagnostic Strip', detectedColor: colorName, colorHex: rgbToHex(r, g, b), interpretation: 'No reference match — manual review required', status: 'WARNING' },
  ];
}

// ─── Well-known test samples for mock data ────────────────────────────────────
export const SAMPLE_READINGS: Array<{ r: number; g: number; b: number; label: string }> = [
  { r: 220, g: 40, b: 40, label: 'Oxygenated Blood' },        // Bright Red
  { r: 140, g: 20, b: 20, label: 'Venous Blood' },            // Dark Red
  { r: 230, g: 200, b: 60, label: 'Normal Urine' },           // Yellow
  { r: 200, g: 80, b: 80, label: 'Haematuria Urine' },        // Pink-Red
  { r: 100, g: 180, b: 100, label: 'Infected Urine' },        // Greenish
  { r: 240, g: 235, b: 230, label: 'Pale Skin Sample' },      // Pale White
  { r: 50, g: 25, b: 10, label: 'Dark Lesion' },              // Dark Brown/Black
  { r: 220, g: 150, b: 150, label: 'Healing Wound' },         // Pink
  { r: 210, g: 50, b: 50, label: 'Inflamed Wound' },          // Red
  { r: 20, g: 20, b: 20, label: 'Necrotic Tissue' },          // Black
  { r: 60, g: 100, b: 220, label: 'Alkaline Strip' },         // Blue
  { r: 60, g: 190, b: 90, label: 'Neutral Strip' },           // Green
  { r: 230, g: 160, b: 40, label: 'Acidic Strip' },           // Yellow-Orange
];
