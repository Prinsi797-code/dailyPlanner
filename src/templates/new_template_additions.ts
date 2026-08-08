// ============================================================
// Add these entries to your Templates list / picker screen
// so users can browse and select the new templates.
// ============================================================

export const NEW_TEMPLATES = [
  // ── Kids & Family ──────────────────────────────────────────
  { id: 20, name: "Kids Daily Planner 🧸", type: "daily",    category: "Kids & Family" },
  { id: 21, name: "Picnic Planner 🧺",     type: "activity", category: "Kids & Family" },

  // ── Adventure & Travel ────────────────────────────────────
  { id: 22, name: "Travel Planner ✈️",     type: "activity", category: "Travel" },

  // ── Love & Relationships ──────────────────────────────────
  { id: 23, name: "Love & Us 💕",          type: "daily",    category: "Lifestyle" },

  // ── Home ──────────────────────────────────────────────────
  { id: 24, name: "Home Planner 🏠",       type: "daily",    category: "Home" },

  // ── Pet Lovers ────────────────────────────────────────────
  { id: 25, name: "Aquarium Log 🐟",       type: "daily",    category: "Pets" },
  { id: 26, name: "Cat Parent 🐱",         type: "daily",    category: "Pets" },
  { id: 27, name: "Dog Parent 🐶",         type: "daily",    category: "Pets" },

  // ── Work ──────────────────────────────────────────────────
  { id: 28, name: "Shift Planner 🔄",      type: "daily",    category: "Work" },

  // ── Personal ──────────────────────────────────────────────
  { id: 29, name: "My Diary 📔",           type: "daily",    category: "Personal" },
  { id: 30, name: "Student Planner 📚",    type: "daily",    category: "Student" },
];

export const CATEGORY_ACCENT: Record<string, string> = {
  "Kids & Family": "#FF6B9D",
  "Travel":        "#E07B39",
  "Lifestyle":     "#E91E63",
  "Home":          "#9A8C98",
  "Pets":          "#C77DFF",
  "Work":          "#00A896",
  "Personal":      "#A0522D",
  "Student":       "#F77F00",
};