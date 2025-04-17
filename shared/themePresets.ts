import { Theme } from "./themeSchema";

/**
 * Theme presets organized by categories
 * These provide a rich set of pre-defined themes for businesses to choose from
 */
export const themePresets: Theme[] = [
  // General purpose themes
  {
    name: "Default",
    primary: "#1E3A8A",    // Indigo-600 equivalent
    secondary: "#9333EA",  // Purple-600 equivalent
    background: "#FFFFFF", // White
    text: "#111827",       // Gray-900 equivalent
    appearance: "system",  // Default to system preference
    font: "Inter",         // Default font family
    borderRadius: "0.375rem", // Default border radius
    spacing: "1rem",       // Default spacing unit
  },
  {
    name: "Classic Blue",
    primary: "#1F2937",
    secondary: "#3B82F6",
    background: "#F9FAFB",
    text: "#111827",
    appearance: "light",
    font: "Arial",
    borderRadius: "0.25rem",
    spacing: "1rem",
  },
  {
    name: "Minimal Gray",
    primary: "#374151",
    secondary: "#4B5563",
    background: "#F9FAFB",
    text: "#1F2937", 
    appearance: "light",
    font: "Inter",
    borderRadius: "0.125rem",
    spacing: "0.75rem",
  },
  {
    name: "Elegant Purple",
    primary: "#6D28D9",
    secondary: "#8B5CF6",
    background: "#FFFFFF",
    text: "#1F2937",
    appearance: "light",
    font: "Poppins",
    borderRadius: "0.5rem",
    spacing: "1rem",
  },
  {
    name: "Forest Green",
    primary: "#065F46",
    secondary: "#10B981",
    background: "#ECFDF5",
    text: "#111827",
    appearance: "light",
    font: "Roboto",
    borderRadius: "0.375rem",
    spacing: "0.875rem",
  },
  {
    name: "Ocean Blue",
    primary: "#1E40AF",
    secondary: "#3B82F6",
    background: "#F0F9FF",
    text: "#1E3A8A",
    appearance: "light",
    font: "Montserrat",
    borderRadius: "0.5rem",
    spacing: "1.25rem",
  },
  {
    name: "Sunset Orange",
    primary: "#B91C1C",
    secondary: "#F59E0B",
    background: "#FFFBEB",
    text: "#7C2D12",
    appearance: "light",
    font: "Source Sans Pro",
    borderRadius: "0.75rem",
    spacing: "1rem",
  },
  {
    name: "Dark Mode",
    primary: "#60A5FA",
    secondary: "#8B5CF6",
    background: "#111827",
    text: "#F9FAFB",
    appearance: "dark",
    font: "Inter",
    borderRadius: "0.5rem",
    spacing: "1rem",
  },
  {
    name: "Night Owl",
    primary: "#93C5FD",
    secondary: "#C4B5FD",
    background: "#1F2937",
    text: "#F9FAFB",
    appearance: "dark",
    font: "Roboto",
    borderRadius: "0.375rem",
    spacing: "1rem",
  },
  
  // Industry-specific themes
  {
    name: "Salon Chic",
    primary: "#BE185D",
    secondary: "#EC4899",
    background: "#FDF2F8",
    text: "#9D174D",
    appearance: "light",
    font: "Playfair Display",
    borderRadius: "0.75rem",
    spacing: "1.5rem",
  },
  {
    name: "Salon Modern",
    primary: "#3B0764",
    secondary: "#7E22CE",
    background: "#FFFFFF",
    text: "#1F2937",
    appearance: "light",
    font: "Poppins",
    borderRadius: "0.5rem",
    spacing: "1.25rem",
  },
  {
    name: "Fitness High Energy",
    primary: "#DC2626",
    secondary: "#F97316",
    background: "#FFFFFF",
    text: "#1F2937",
    appearance: "light",
    font: "Montserrat",
    borderRadius: "0.625rem",
    spacing: "1rem",
  },
  {
    name: "Fitness Professional",
    primary: "#0284C7",
    secondary: "#0EA5E9",
    background: "#F0F9FF",
    text: "#0C4A6E",
    appearance: "light",
    font: "Roboto",
    borderRadius: "0.375rem",
    spacing: "1rem",
  },
  {
    name: "Medical Clean",
    primary: "#0F766E",
    secondary: "#14B8A6",
    background: "#F0FDFA",
    text: "#134E4A",
    appearance: "light",
    font: "Inter",
    borderRadius: "0.25rem",
    spacing: "1rem",
  },
  {
    name: "Medical Professional",
    primary: "#0369A1",
    secondary: "#0EA5E9",
    background: "#FFFFFF",
    text: "#0C4A6E",
    appearance: "light",
    font: "Roboto",
    borderRadius: "0.375rem",
    spacing: "1rem",
  },
  {
    name: "Spa Tranquil",
    primary: "#4338CA",
    secondary: "#8B5CF6",
    background: "#EEF2FF",
    text: "#312E81",
    appearance: "light",
    font: "Playfair Display",
    borderRadius: "1rem",
    spacing: "1.5rem",
  },
  {
    name: "Spa Zen",
    primary: "#065F46",
    secondary: "#059669",
    background: "#ECFDF5",
    text: "#064E3B",
    appearance: "light",
    font: "Montserrat",
    borderRadius: "0.75rem",
    spacing: "1.25rem",
  },
];

/**
 * A function to get a theme preset by name
 * @param name The name of the theme preset to retrieve
 * @returns The theme preset or undefined if not found
 */
export function getThemePresetByName(name: string): Theme | undefined {
  return themePresets.find(preset => preset.name === name);
}

/**
 * Group theme presets by industry type
 * @returns An object with themes grouped by industry
 */
export function getThemePresetsByIndustry() {
  return {
    salon: themePresets.filter(theme => 
      theme.name.toLowerCase().includes('salon')),
    fitness: themePresets.filter(theme => 
      theme.name.toLowerCase().includes('fitness')),
    medical: themePresets.filter(theme => 
      theme.name.toLowerCase().includes('medical')),
    spa: themePresets.filter(theme => 
      theme.name.toLowerCase().includes('spa')),
    general: themePresets.filter(theme => 
      !theme.name.toLowerCase().includes('salon') &&
      !theme.name.toLowerCase().includes('fitness') &&
      !theme.name.toLowerCase().includes('medical') &&
      !theme.name.toLowerCase().includes('spa')),
  };
}