import { ThemeStyle } from './SectionRenderer';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'checklistLine'
  | 'hourGrid'
  | 'dayPicker'
  | 'iconRow'
  | 'habitGrid'
  | 'monthCalendar'
  | 'checklistGrid'
  | 'table'
  | 'checkboxRow'
  | 'labeledLines'
  | 'row'
  | 'checklistWithNotes'
  | 'sectionBanner'
  | 'checkboxInlineRow'
  | 'timePeriodBlock'
  | 'brainBreak'
  | 'colorGroupTable'
  | 'skillTrackerBlock'
  | 'monthGridTracker'
  | 'photoCollage'
  | 'decorHeader'
  | 'photoFrame'
  | 'scriptHeading'
  | 'photoScatter'
  | 'group';

export type ChecklistBox = {
  title: string;
  count: number;
};

export type SectionConfig = {
  type: FieldType;
  title?: string;
  count?: number;
  hours?: string[];
  accentColor?: string;
  icons?: string[];
  startDay?: 'mon' | 'sun';
  decoration?: 'floral' | 'tropical' | 'minimal' | 'flamingo';
  boxes?: ChecklistBox[]; // checklistGrid ke liye — har box apna title + line count
  columns?: string[]; // table
  rows?: number; // table
  caption?: string; // table — table ke upar chhoti label line (e.g. "Opening Cash Balance:")
  items?: string[]; // checkboxRow / checklistWithNotes / checkboxInlineRow
  lines?: string[]; // labeledLines
  notesLabel?: string; // checklistWithNotes
  children?: SectionConfig[]; // row (side-by-side) / group (stacked)
  rowLabelTitle?: string; // colorGroupTable — leftmost header (e.g. "Day")
  rowLabelColor?: string; // colorGroupTable — leftmost column color
  rowLabels?: string[]; // colorGroupTable — fixed row labels (e.g. ['M','T','W','T','F','S','S'])
  groupHeaders?: { label: string; span: number; color?: string }[]; // colorGroupTable — top grouped header row
  colColumns?: { title: string; color?: string }[]; // colorGroupTable — per-column title + color
  totalDays?: number; // monthGridTracker — kitne din (default 31)
  hoursCount?: number; // monthGridTracker — kitne hour columns (default 12)
  hideBullet?: boolean;
  splitAt?: number;
  photoCount?: number;
  photoStyle?: 'polaroid' | 'rounded';
  frameCaption?: string;
  noBox?: boolean;
  placeholder?: string;
  photoPositions?: {
    top: number;
    left: number;
    width: number;
    height: number;
    rotate?: string;
  }[];
  scatterHeight?: number; 
};

export type TemplateDesign = {
  layout: string;
  headerColor: string;
  headerStyle: 'bold' | 'script' | 'handwritten';
  accentColor: string;
  headerBg?: string;
  sheetBg?: string;
  backgroundImage?: any;
  backgroundImages?: any[];
  themeStyle?: ThemeStyle;
  hideHeader?: boolean;
  sections: SectionConfig[];
};

export const TEMPLATE_DESIGNS: Record<number, TemplateDesign> = {
  1: {
    layout: 'classic-daily',
    headerColor: '#1a1a2e',
    headerBg: '#FFF1EC',
    headerStyle: 'bold',
    accentColor: '#a85432',
    sheetBg: '#FFFAF8',
    themeStyle: {
      tagStyle: 'pill',
      bulletShape: 'circle',
      sectionBg: '#FFF5F0',
      sectionBorderColor: '#F5C9B3',
      sectionBorderWidth: 1,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#E8B49A',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'checklistLine', title: 'Top Priorities', count: 3 },
      {
        type: 'hourGrid',
        hours: [
          '6 AM',
          '7 AM',
          '8 AM',
          '9 AM',
          '10 AM',
          '11 AM',
          '12 PM',
          '1 PM',
          '2 PM',
          '3 PM',
          '4 PM',
          '5 PM',
          '6 PM',
          '7 PM',
          '8 PM',
        ],
      },
      { type: 'checklistLine', title: 'To-Do List', count: 5 },
      { type: 'textarea', title: 'Notes' },
    ],
  },

  // ── 2: Daily Task Reminder — dark navy script ───────────────
  2: {
    layout: 'task-reminder',
    headerColor: '#1a1a2e',
    headerBg: '#FDEEF3',
    headerStyle: 'script',
    accentColor: '#1a1a2e',
    sheetBg: '#FAFAFA',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#F4F4FA',
      sectionBorderColor: '#C5C8E8',
      sectionBorderWidth: 1,
      sectionBorderRadius: 8,
      inputUnderlineColor: '#9497C8',
    },
    sections: [
      { type: 'textarea', title: 'Focus' },
      { type: 'checklistLine', title: 'Tasks', count: 6 },
      {
        type: 'iconRow',
        title: 'Hydrate',
        icons: ['💧', '💧', '💧', '💧', '💧', '💧', '💧', '💧'],
      },
    ],
  },

  // ── 3: Block It Out — earthy green ─────────────────────────
  3: {
    layout: 'block-it-out',
    headerColor: '#2d2d2d',
    headerBg: '#EFF5F0',
    headerStyle: 'bold',
    accentColor: '#7a8c6f',
    sheetBg: '#F7FBF7',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'circle',
      sectionBg: '#EEF4EE',
      sectionBorderColor: '#BDD3BD',
      sectionBorderWidth: 1,
      sectionBorderRadius: 8,
      inputUnderlineColor: '#A0C0A0',
    },
    sections: [
      { type: 'dayPicker' },
      {
        type: 'hourGrid',
        hours: [
          '6 AM',
          '7 AM',
          '8 AM',
          '9 AM',
          '10 AM',
          '11 AM',
          '12 PM',
          '1 PM',
          '2 PM',
          '3 PM',
          '4 PM',
          '5 PM',
          '6 PM',
          '7 PM',
          '8 PM',
        ],
      },
      { type: 'checklistLine', title: 'Top 3 - Get These Done!', count: 3 },
      { type: 'checklistLine', title: 'Soon-ish', count: 3 },
    ],
  },

  // ── 5: Weekly Classic — indigo ──────────────────────────────
  5: {
    layout: 'weekly-classic',
    headerColor: '#3d3d5c',
    headerBg: '#EAF3FB',
    headerStyle: 'bold',
    accentColor: '#a85432',
    sheetBg: '#F9FBFF',
    themeStyle: {
      tagStyle: 'pill',
      bulletShape: 'circle',
      sectionBg: '#EEF4FF',
      sectionBorderColor: '#C5D8F0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 12,
      inputUnderlineColor: '#A0BEE0',
    },
    sections: [
      { type: 'textarea', title: "This Week's Main Focus" },
      { type: 'checklistLine', title: 'To-Do List for the Week', count: 6 },
      { type: 'habitGrid', title: 'Habit Tracker' },
    ],
  },

  // ── 6: Weekly Colorful — pink bold ──────────────────────────
  6: {
    layout: 'weekly-colorful',
    headerColor: '#d6336c',
    headerBg: '#FDEEF3',
    headerStyle: 'bold',
    accentColor: '#d6336c',
    sheetBg: '#FFF8FA',
    themeStyle: {
      tagStyle: 'banner',
      bulletShape: 'heart',
      sectionBg: '#FFEEF5',
      sectionBorderColor: '#F5B8D0',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 14,
      inputUnderlineColor: '#F0A0C0',
    },
    sections: [
      { type: 'checklistLine', title: 'To Do', count: 8 },
      { type: 'textarea', title: 'Notes' },
    ],
  },

  // ── 10: Floral Monthly ───────────────────────────────────────
  10: {
    layout: 'monthly-calendar',
    headerColor: '#7c6f9f',
    headerBg: '#FBEFF3',
    headerStyle: 'bold',
    accentColor: '#e8a0a0',
    sheetBg: '#FFF7F8',
    themeStyle: {
      tagStyle: 'pill',
      sectionBg: '#FFF0F3',
      sectionBorderColor: '#F5C5D0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 12,
    },
    sections: [
      { type: 'monthCalendar', startDay: 'mon', decoration: 'floral' },
    ],
  },

  // ── 11: Schedule & Calendar ──────────────────────────────────
  11: {
    layout: 'monthly-calendar',
    headerColor: '#c2547a',
    headerBg: '#FDEEF3',
    headerStyle: 'bold',
    accentColor: '#c2547a',
    sheetBg: '#FFF8FA',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'circle',
      sectionBg: '#FFF0F5',
      sectionBorderColor: '#EDB0C8',
      sectionBorderWidth: 1,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#E890B8',
    },
    sections: [
      { type: 'monthCalendar', startDay: 'sun', decoration: 'minimal' },
      { type: 'checklistLine', title: 'To-Do', count: 5 },
      { type: 'textarea', title: 'Notes' },
    ],
  },

  // ── 12: Tropical Flamingo ────────────────────────────────────
  12: {
    layout: 'monthly-calendar',
    headerColor: '#3d4a5c',
    headerBg: '#EAF6F0',
    headerStyle: 'bold',
    accentColor: '#e8849a',
    sheetBg: '#F5FEFA',
    themeStyle: {
      tagStyle: 'underline',
      sectionBg: '#E8F8F2',
      sectionBorderColor: '#A8DCC8',
      sectionBorderWidth: 1,
      sectionBorderRadius: 10,
    },
    sections: [
      { type: 'monthCalendar', startDay: 'sun', decoration: 'tropical' },
    ],
  },

  // ── 13: Pastel Floral ────────────────────────────────────────
  13: {
    layout: 'monthly-calendar',
    headerColor: '#c2547a',
    headerBg: '#F0F6FB',
    headerStyle: 'bold',
    accentColor: '#a0c4e8',
    sheetBg: '#F8FBFF',
    themeStyle: {
      tagStyle: 'pill',
      sectionBg: '#EEF5FC',
      sectionBorderColor: '#B8D8F0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 12,
    },
    sections: [
      { type: 'monthCalendar', startDay: 'mon', decoration: 'flamingo' },
    ],
  },

  // ── 20: Kids Daily Planner 🧸 ────────────────────────────────
  20: {
    layout: 'classic-daily',
    headerColor: '#FF6B9D',
    headerBg: '#FFF0F5',
    headerStyle: 'bold',
    accentColor: '#FF6B9D',
    sheetBg: '#FFF5FA',
    themeStyle: {
      tagStyle: 'banner',
      bulletShape: 'star',
      sectionBg: '#FFF0F8',
      sectionBorderColor: '#FFB8D8',
      sectionBorderWidth: 2,
      sectionBorderRadius: 16,
      inputUnderlineColor: '#FFB8D8',
    },
    sections: [
      { type: 'dayPicker' },
      {
        type: 'iconRow',
        title: 'How Do I Feel Today? 😊',
        icons: ['😄', '😊', '😐', '😢', '😡', '🤒'],
      },
      { type: 'checklistLine', title: '⭐ My 3 Goals Today', count: 3 },
      { type: 'checklistLine', title: '📚 School Tasks', count: 4 },
      { type: 'textarea', title: '✏️ My Day in a Few Words' },
    ],
  },

  // ── 21: Picnic Planner 🧺 ────────────────────────────────────
  21: {
    layout: 'task-reminder',
    headerColor: '#5D8A3C',
    headerBg: '#F5FAF0',
    headerStyle: 'bold',
    accentColor: '#F4A261',
    sheetBg: '#FDFAF5',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'circle',
      sectionBg: '#FEFAF2',
      sectionBorderColor: '#F5D9B0',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#F0C080',
    },
    sections: [
      { type: 'textarea', title: '📍 Picnic Spot & Date' },
      { type: 'checklistLine', title: '🧺 Food & Drinks to Pack', count: 6 },
      { type: 'checklistLine', title: '🎒 Things to Bring', count: 5 },
      {
        type: 'iconRow',
        title: '🌤️ Weather Check',
        icons: ['☀️', '⛅', '🌥️', '🌧️'],
      },
    ],
  },

  // ── 22: Travel Planner ✈️ ────────────────────────────────────
  22: {
    layout: 'block-it-out',
    headerColor: '#1A3C5E',
    headerBg: '#EEF4FB',
    headerStyle: 'bold',
    accentColor: '#E07B39',
    sheetBg: '#F8FAFE',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#EEF4FF',
      sectionBorderColor: '#A8C8F0',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#90B8E8',
    },
    sections: [
      { type: 'textarea', title: '🗺️ Destination & Trip Dates' },
      { type: 'checklistLine', title: '🎯 Must-See Places', count: 5 },
      { type: 'checklistLine', title: '🧳 Packing List', count: 7 },
      {
        type: 'iconRow',
        title: '✅ Pre-Trip Checklist',
        icons: ['🛂', '🎫', '💳', '📱', '🔋', '🗺️'],
      },
    ],
  },

  // ── 23: Love & Us 💕 ─────────────────────────────────────────
  23: {
    layout: 'task-reminder',
    headerColor: '#C2185B',
    headerBg: '#FFF0F5',
    headerStyle: 'script',
    accentColor: '#E91E63',
    sheetBg: '#FFF8FA',
    
    themeStyle: {
      tagStyle: 'pill',
      bulletShape: 'heart',
      sectionBg: '#FFF0F5',
      sectionBorderColor: '#F5B0CC',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 16,
      inputUnderlineColor: '#F090B8',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'textarea', title: '💌 Today I Love You Because...' },
      { type: 'checklistLine', title: '🌹 Date Ideas This Week', count: 4 },
      {
        type: 'iconRow',
        title: '❤️ Love Meter',
        icons: ['❤️', '❤️', '❤️', '❤️', '❤️', '❤️', '❤️', '❤️', '❤️', '❤️'],
      },
    ],
  },

  // ── 24: Home Planner 🏠 ──────────────────────────────────────
  24: {
    layout: 'block-it-out',
    headerColor: '#4A4E69',
    headerBg: '#F0EEF8',
    headerStyle: 'bold',
    accentColor: '#9A8C98',
    sheetBg: '#F8F7FC',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#F0EDF8',
      sectionBorderColor: '#C8C0E0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#B0A8D0',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'checklistLine', title: '🧹 Cleaning Tasks', count: 5 },
      { type: 'checklistLine', title: '🛒 Grocery / Shopping List', count: 6 },
      {
        type: 'iconRow',
        title: '🏡 Room Done Today',
        icons: ['🛋️', '🍳', '🛁', '🛏️', '🪟', '🪴'],
      },
    ],
  },

  // ── 25: Aquarium Log 🐟 ──────────────────────────────────────
  25: {
    layout: 'classic-daily',
    headerColor: '#006994',
    headerBg: '#E8F7FC',
    headerStyle: 'bold',
    accentColor: '#00B4D8',
    sheetBg: '#F0FAFF',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'circle',
      sectionBg: '#E0F5FC',
      sectionBorderColor: '#80D4F0',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 12,
      inputUnderlineColor: '#60C8E8',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'checklistLine', title: '🐠 Daily Tank Care', count: 4 },
      {
        type: 'iconRow',
        title: '🌡️ Water Check',
        icons: ['🌡️', '💧', '⚗️', '🔬', '🐟'],
      },
      { type: 'textarea', title: '📊 Water Parameters (pH, Temp, Nitrate)' },
    ],
  },

  // ── 26: Cat Parent 🐱 ────────────────────────────────────────
  26: {
    layout: 'task-reminder',
    headerColor: '#6B4C93',
    headerBg: '#F5EEFF',
    headerStyle: 'script',
    accentColor: '#C77DFF',
    sheetBg: '#FAF5FF',
    themeStyle: {
      tagStyle: 'pill',
      bulletShape: 'heart',
      sectionBg: '#F5EEFF',
      sectionBorderColor: '#DDB8FF',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 16,
      inputUnderlineColor: '#C890F0',
    },
    sections: [
      { type: 'dayPicker' },
      {
        type: 'iconRow',
        title: "😺 Kitty's Mood Today",
        icons: ['😻', '😸', '😾', '🙀', '😴', '🐱'],
      },
      { type: 'checklistLine', title: '🐾 Daily Cat Care', count: 4 },
      { type: 'textarea', title: '📝 Vet Notes & Reminders' },
    ],
  },

  // ── 27: Dog Parent 🐶 ────────────────────────────────────────
  27: {
    layout: 'block-it-out',
    headerColor: '#7B5E3A',
    headerBg: '#FEF6EC',
    headerStyle: 'bold',
    accentColor: '#F4A261',
    sheetBg: '#FFFAF5',
    themeStyle: {
      tagStyle: 'banner',
      bulletShape: 'circle',
      sectionBg: '#FEF5E8',
      sectionBorderColor: '#F5D0A0',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 12,
      inputUnderlineColor: '#E8B880',
    },
    sections: [
      { type: 'dayPicker' },
      {
        type: 'iconRow',
        title: "🐕 Doggo's Day",
        icons: ['🦮', '🎾', '🛁', '💊', '🍗', '🐾'],
      },
      { type: 'checklistLine', title: '🐾 Daily Dog Tasks', count: 5 },
      { type: 'textarea', title: '🏥 Vet / Health Notes' },
    ],
  },

  // ── 28: Shift Planner 🔄 ─────────────────────────────────────
  28: {
    layout: 'block-it-out',
    headerColor: '#1B2A3B',
    headerBg: '#E0F5F3',
    headerStyle: 'bold',
    accentColor: '#00A896',
    sheetBg: '#F0FDFB',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#E8F8F5',
      sectionBorderColor: '#80D8CC',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 8,
      inputUnderlineColor: '#60C8BC',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'textarea', title: '🕐 Shift Timing & Location' },
      { type: 'checklistLine', title: '📋 Tasks for This Shift', count: 5 },
      {
        type: 'iconRow',
        title: '✅ Shift Checklist',
        icons: ['🔑', '📞', '💻', '📁', '☕', '🏁'],
      },
    ],
  },

  // ── 29: My Diary 📔 ──────────────────────────────────────────
  29: {
    layout: 'task-reminder',
    headerColor: '#2C1810',
    headerBg: '#F5EFE6',
    headerStyle: 'script',
    accentColor: '#A0522D',
    sheetBg: '#FDF9F5',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: '#FDF5EE',
      sectionBorderColor: '#E0C0A0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#C8A080',
      font: 'italic',
    },
    sections: [
      { type: 'dayPicker' },
      {
        type: 'iconRow',
        title: '🌈 My Mood',
        icons: ['😄', '😊', '😐', '😔', '😡', '🥺', '😰'],
      },
      { type: 'textarea', title: '✍️ Dear Diary...' },
      { type: 'textarea', title: '🌙 Evening Reflection' },
    ],
  },

  // ── 30: Student Planner 📚 ───────────────────────────────────
  30: {
    layout: 'classic-daily',
    headerColor: '#003049',
    headerBg: '#FFF4E8',
    headerStyle: 'bold',
    accentColor: '#F77F00',
    sheetBg: '#FFFBF5',
    themeStyle: {
      tagStyle: 'banner',
      bulletShape: 'square',
      sectionBg: '#FFF5E8',
      sectionBorderColor: '#F5C880',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 10,
      inputUnderlineColor: '#E8A840',
    },
    sections: [
      { type: 'dayPicker' },
      { type: 'checklistLine', title: '📖 Classes Today', count: 4 },
      { type: 'checklistLine', title: '📝 Assignments Due', count: 4 },
      { type: 'habitGrid', title: '📊 Study Habit Tracker' },
    ],
  },

  // ── 31: Morning Check-In ☀️ — cream/yellow, 2-col boxed grid ──
  31: {
    layout: 'morning-checkin',
    headerColor: '#1a1a1a',
    headerBg: '#FFF9E0',
    headerStyle: 'bold',
    accentColor: '#F5A623',
    sheetBg: '#FFF9E0',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#E8E2C8',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 14,
      inputUnderlineColor: '#D8D0B0',
    },
    sections: [
      { type: 'text', title: 'Date' },
      {
        type: 'checklistGrid',
        boxes: [
          { title: 'How I’m Feeling', count: 5 },
          { title: 'Things to Look Forward to Today', count: 5 },
          { title: 'What I Would Love to Talk About', count: 5 },
          { title: "Today's Goals", count: 5 },
          { title: 'Things to Improve How I’m Feeling', count: 5 },
          { title: 'Things to Remember', count: 5 },
        ],
      },
    ],
  },

  // ── 32: Reselling Planner 🛍️ — table + tracker layout ────────
  32: {
    layout: 'reselling-planner',
    headerColor: '#111111',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#2d2d2d',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      { type: 'text', title: 'Date' },
      {
        type: 'checkboxRow',
        title: "Today's Goal",
        items: [
          'Source Products',
          'Create Listings',
          'Pack Orders',
          'Ship Orders',
          'Update Inventory',
          'Customer Messages',
        ],
      },
      {
        type: 'table',
        title: 'Products To Resell',
        columns: ['Item', 'Source', 'Cost', 'Selling Price', 'Expected Profit'],
        rows: 3,
      },
      {
        type: 'row',
        children: [
          {
            type: 'table',
            title: 'Listing Tracker',
            columns: ['Platform', 'Status'],
            rows: 3,
          },
          {
            type: 'labeledLines',
            title: 'Sales Tracker',
            lines: ['Total Sales:', 'Total Expenses:', "Today's Profit:"],
          },
        ],
      },
      {
        type: 'row',
        children: [
          {
            type: 'labeledLines',
            title: 'Order & Shipping',
            lines: ['Orders To Pack:', 'Orders Shipped:', 'Tracking Notes:'],
          },
          {
            type: 'checklistWithNotes',
            title: 'Customer Follow-Up',
            items: ['Reply To Messages', 'Send Updates', 'Request Reviews'],
            notesLabel: 'Notes',
          },
        ],
      },
      { type: 'text', title: 'Best Selling Item' },
      {
        type: 'row',
        children: [
          { type: 'textarea', title: 'What Worked Today?' },
          { type: 'textarea', title: 'What To Improve Tomorrow?' },
        ],
      },
    ],
  },

  // ── 33: Cashier Planner 🧾 — shift + cash count form ──────────
  33: {
    layout: 'cashier-planner',
    headerColor: '#111111',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#7FA7CC',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Date:' },
          { type: 'text', title: 'Day:' },
        ],
      },
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Cashier Name:' },
          { type: 'text', title: 'Employee ID:' },
        ],
      },
      { type: 'text', title: 'Store / Location:' },
      {
        type: 'checkboxInlineRow',
        title: 'Shift:',
        items: ['Morning', 'Afternoon', 'Evening'],
      },
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Start Time:' },
          { type: 'text', title: 'End Time:' },
        ],
      },
      { type: 'sectionBanner', title: 'Shift Overview' },
      {
        type: 'table',
        caption: 'Opening Cash Balance:',
        columns: ['Payment Type', 'Amount', 'Payment Type', 'Amount'],
        rows: 3,
      },
      { type: 'sectionBanner', title: 'Cash Count' },
      {
        type: 'table',
        caption: 'Cash In Drawer:',
        columns: ['Denomination', 'Quantity', 'Total'],
        rows: 2,
      },
      {
        type: 'labeledLines',
        lines: [
          'Expected Closing Balance',
          'Actual Closing Balance',
          'Difference (+ / -)',
        ],
      },
      {
        type: 'row',
        children: [
          { type: 'checklistLine', title: 'Task Checklist', count: 6 },
          {
            type: 'group',
            children: [
              { type: 'textarea', title: 'Customer Service Notes' },
              { type: 'sectionBanner', title: 'Daily Summary' },
              { type: 'labeledLines', lines: ['Total Customers Served:'] },
              { type: 'textarea', title: 'Best Moment of the Shift' },
              { type: 'textarea', title: 'Challenges / Follow-Up' },
            ],
          },
        ],
      },
    ],
  },
  // ── 34: Daily/Shift Planner 🕒 — time-blocking + priority layout ──
  34: {
    layout: 'daily-shift-planner',
    headerColor: '#1a1a2e',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#1B2A56',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#1B2A56',
      sectionBorderWidth: 1.5,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#C8C8C8',
    },
    sections: [
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Date' },
          { type: 'text', title: 'Today I Choose To Be' },
        ],
      },
      {
        type: 'row',
        children: [
          {
            type: 'group',
            children: [
              { type: 'text', title: 'What do I need to get done today?' },
              {
                type: 'checklistLine',
                title: "Today's Big Priority",
                count: 4,
              },
              { type: 'text', title: 'What am I thankful for today?' },
              { type: 'textarea', title: 'Notes / Doodles / Ideas' },
            ],
          },
          {
            type: 'group',
            children: [
              { type: 'sectionBanner', title: 'Time-Blocking' },
              {
                type: 'timePeriodBlock',
                title: 'MORNING',
                caption: 'Start the day off right.',
                icons: ['☀️'],
                hours: ['8:00 AM', '9:00 AM', '10:00 AM'],
              },
              { type: 'brainBreak', title: 'BRAIN BREAK', caption: '11:00 AM' },
              {
                type: 'timePeriodBlock',
                title: 'AFTERNOON',
                caption: 'Keep up the momentum!',
                icons: ['🌤️'],
                hours: ['12:00 PM', '1:00 PM', '2:00 PM'],
              },
              { type: 'brainBreak', title: 'BRAIN BREAK', caption: '3:00 PM' },
              {
                type: 'timePeriodBlock',
                title: 'EVENING',
                caption: 'Finish your day strong!',
                icons: ['🌙'],
                hours: ['4:00 PM', '5:00 PM', '6:00 PM'],
              },
              { type: 'brainBreak', title: 'BRAIN BREAK', caption: '7:00 PM' },
              { type: 'text', title: 'One win from today:' },
            ],
          },
        ],
      },
    ],
  },
  35: {
    layout: 'activity-report',
    headerColor: '#3D2470',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#3D2470',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      { type: 'text', title: 'Date:' },
      { type: 'text', title: 'Employee:' },
      { type: 'text', title: 'Department:' },
      {
        type: 'sectionBanner',
        title: 'Completed Task',
        accentColor: '#4B2E83',
      },
      {
        type: 'table',
        columns: ['Task Description', 'Time Spent (hrs)', 'Notes'],
        rows: 5,
      },
      { type: 'sectionBanner', title: 'Ongoing Task', accentColor: '#1C7293' },
      {
        type: 'table',
        columns: ['Task Description', 'Progress', 'Due Date'],
        rows: 5,
      },
      { type: 'sectionBanner', title: 'Notes', accentColor: '#5C4813' },
      { type: 'textarea' },
    ],
  },
  37: {
    layout: 'dbt-diary-card',
    headerColor: '#1a1a1a',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#9ECB9E',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Date Range:' },
          { type: 'text', title: 'Target Behavior:' },
        ],
      },
      {
        type: 'colorGroupTable',
        rowLabelTitle: 'Day',
        rowLabelColor: '#9ECB9E',
        rowLabels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        groupHeaders: [
          { label: 'Target Behaviour', span: 2, color: '#D6D6D6' },
          { label: 'Emotions (1-5)', span: 7, color: '#D6D6D6' },
        ],
        colColumns: [
          { title: 'Intensity (0-5)', color: '#E2E2E2' },
          { title: 'Action (Y/N)', color: '#E2E2E2' },
          { title: 'Fear', color: '#CBB8E8' },
          { title: 'Anger', color: '#E8A0A0' },
          { title: 'Sadness', color: '#E8C39B' },
          { title: 'Joy', color: '#F0D060' },
          { title: 'Shame', color: '#A8CC9A' },
          { title: 'Pain', color: '#9AB8D8' },
          { title: 'Other', color: '#B8BEDB' },
        ],
      },
      { type: 'sectionBanner', title: 'Skills', accentColor: '#C7CCC7' },
      {
        type: 'row',
        children: [
          {
            type: 'skillTrackerBlock',
            title: 'Mindfulness',
            accentColor: '#E8A0A0',
            count: 3,
          },
          {
            type: 'skillTrackerBlock',
            title: 'Emotion Regulation',
            accentColor: '#E8C39B',
            count: 3,
          },
        ],
      },
      {
        type: 'row',
        children: [
          {
            type: 'skillTrackerBlock',
            title: 'Interpersonal Effectiveness',
            accentColor: '#F0D060',
            count: 3,
          },
          {
            type: 'skillTrackerBlock',
            title: 'Emotional Endurance',
            accentColor: '#A8CC9A',
            count: 3,
          },
        ],
      },
      { type: 'sectionBanner', title: 'Notes', accentColor: '#C7CCC7' },
      { type: 'textarea' },
    ],
  },
  38: {
    layout: 'spelling-bee-planner',
    headerColor: '#1a1a1a',
    headerBg: '#FBF6DC',
    headerStyle: 'bold',
    accentColor: '#E8B923',
    sheetBg: '#FBF6DC',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8CFA0',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#C8BE90',
    },
    sections: [
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Name:' },
          { type: 'text', title: 'Week Of:' },
        ],
      },
      {
        type: 'colorGroupTable',
        rowLabelTitle: 'Time',
        rowLabelColor: '#E8B923',
        rowLabels: [
          '8:00 AM',
          '9:00 AM',
          '10:00 AM',
          '11:00 AM',
          '1:00 PM',
          '2:00 PM',
          '3:00 PM',
          '4:00 PM',
        ],
        groupHeaders: [
          { label: 'Monday', span: 1, color: '#F5E6A8' },
          { label: 'Tuesday', span: 1, color: '#F5E6A8' },
          { label: 'Wednesday', span: 1, color: '#F5E6A8' },
          { label: 'Thursday', span: 1, color: '#F5E6A8' },
          { label: 'Friday', span: 1, color: '#F5E6A8' },
        ],
        colColumns: [
          { title: 'Assignment', color: '#FBF6DC' },
          { title: 'Activity', color: '#FBF6DC' },
          { title: 'Reading', color: '#FBF6DC' },
          { title: 'Revision', color: '#FBF6DC' },
          { title: 'Quiz', color: '#FBF6DC' },
        ],
      },
    ],
  },
  39: {
    layout: 'sleep-tracker',
    headerColor: '#1a1a1a',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#4A4A4A',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1,
      sectionBorderRadius: 4,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      { type: 'text', title: 'Month:' },
      { type: 'monthGridTracker', totalDays: 31, hoursCount: 12, splitAt: 16 },
    ],
  },
  // ── 40: Rent Payment Ledger 🧾 — tenant/property form + monthly table ──
  40: {
    layout: 'rent-ledger',
    headerColor: '#1a1a1a',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#A9C6E8',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      { type: 'text', title: 'Year:' },
      {
        type: 'row',
        children: [
          {
            type: 'group',
            children: [
              {
                type: 'sectionBanner',
                title: 'Tenant',
                accentColor: '#A9C6E8',
              },
              { type: 'text', title: 'Name:' },
              { type: 'text', title: 'Phone:' },
              { type: 'text', title: 'Monthly Rent:' },
            ],
          },
          {
            type: 'group',
            children: [
              {
                type: 'sectionBanner',
                title: 'Property',
                accentColor: '#A9C6E8',
              },
              { type: 'text', title: 'Address:' },
              { type: 'text' },
              { type: 'text' },
            ],
          },
        ],
      },
      {
        type: 'colorGroupTable',
        rowLabelTitle: 'Month',
        rowLabelColor: '#A9C6E8',
        rowLabels: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ],
        colColumns: [
          { title: 'Due Date', color: '#B9D0EC' },
          { title: 'Rent Amount', color: '#B9D0EC' },
          { title: 'Amount Paid', color: '#B9D0EC' },
          { title: 'Fees', color: '#B9D0EC' },
          { title: 'Comment', color: '#B9D0EC' },
        ],
      },
      { type: 'sectionBanner', title: 'Notes', accentColor: '#A9C6E8' },
      { type: 'textarea' },
    ],
  },
  41: {
    layout: 'egg-count-planner',
    headerColor: '#1a1a1a',
    headerBg: '#FFFFFF',
    headerStyle: 'bold',
    accentColor: '#8FC9BE',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8B8B8',
    },
    sections: [
      {
        type: 'row',
        children: [
          {
            type: 'group',
            children: [
              { type: 'text', title: 'Month:' },
              {
                type: 'table',
                title: 'Monthly Expense Log',
                columns: ['Date', 'Expense', 'Amount'],
                rows: 10,
              },
              { type: 'textarea', title: 'Notes' },
              {
                type: 'labeledLines',
                title: 'Eggs — Total',
                lines: ['Gross Sales', 'Monthly Expenses', 'Net Profit'],
              },
            ],
          },
          {
            type: 'colorGroupTable',
            rowLabelTitle: '#',
            rowLabelColor: '#8FC9BE',
            rowLabels: [
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
              '11',
              '12',
              '13',
              '14',
              '15',
              '16',
              '17',
              '18',
              '19',
              '20',
              '21',
              '22',
              '23',
              '24',
              '25',
              '26',
              '27',
              '28',
              '29',
              '30',
              '31',
              'Total',
            ],
            colColumns: [{ title: 'Eggs', color: '#E4F5F1' }],
          },
        ],
      },
    ],
  },
  42: {
    layout: 'school-schedule-planner',
    headerColor: '#FFFFFF',
    headerBg: '#8d76aa',
    headerStyle: 'bold',
    accentColor: '#8d76aa',
    sheetBg: '#8d76aa',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#EFEAFB',
      sectionBorderColor: '#8d76aa',
      sectionBorderWidth: 1,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#B8A8DC',
    },
    sections: [
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Name:' },
          { type: 'text', title: 'Grade:' },
          { type: 'text', title: 'Week Of:' },
        ],
      },
      {
        type: 'row',
        children: [
          { type: 'text', title: 'School:' },
          { type: 'text', title: 'Semester:' },
        ],
      },
      {
        type: 'colorGroupTable',
        rowLabelTitle: 'Time',
        rowLabelColor: '#8d76aa',
        rowLabels: [
          '8:00 AM',
          '9:00 AM',
          '10:00 AM',
          '11:00 AM',
          '12:00 PM',
          '1:00 PM',
          '2:00 PM',
          '3:00 PM',
        ],
        colColumns: [
          { title: 'Monday', color: '#C9B8EC' },
          { title: 'Tuesday', color: '#C9B8EC' },
          { title: 'Wednesday', color: '#C9B8EC' },
          { title: 'Thursday', color: '#C9B8EC' },
          { title: 'Friday', color: '#C9B8EC' },
        ],
      },
      { type: 'text', title: 'Notes:' },
    ],
  },
  43: {
    layout: 'group-study-planner',
    headerColor: '#1a1a1a',
    headerBg: '#FBE4E9',
    headerStyle: 'bold',
    accentColor: '#EAB8C4',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'square',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#D8D8D8',
      sectionBorderWidth: 1,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#C8C8C8',
    },
    sections: [
      {
        type: 'sectionBanner',
        title: 'Study Group Details',
        accentColor: '#F3C9D3',
      },
      { type: 'text', title: 'Group Name:' },
      { type: 'text', title: 'Members:' },
      { type: 'text', title: 'Subject/Topic:' },
      {
        type: 'row',
        children: [
          { type: 'text', title: 'Study Session Date:' },
          { type: 'text', title: 'Time:' },
        ],
      },
      {
        type: 'sectionBanner',
        title: 'Study Goals & Objectives',
        accentColor: '#F3C9D3',
      },
      { type: 'textarea', title: 'Main Goal' },
      { type: 'textarea', title: 'Key Topics to Cover' },
      {
        type: 'sectionBanner',
        title: 'Study Plan & Task Division',
        accentColor: '#F3C9D3',
      },
      {
        type: 'table',
        columns: ['Time Slot', 'Activity', 'Responsible Member'],
        rows: 5,
      },
      {
        type: 'row',
        children: [
          {
            type: 'group',
            children: [
              {
                type: 'sectionBanner',
                title: 'Resources Needed',
                accentColor: '#F3C9D3',
              },
              { type: 'checklistLine', count: 6 },
            ],
          },
          {
            type: 'group',
            children: [
              {
                type: 'sectionBanner',
                title: 'Doubts & Questions',
                accentColor: '#F3C9D3',
              },
              { type: 'checklistLine', count: 3 },
              {
                type: 'sectionBanner',
                title: 'Summary & Next Steps',
                accentColor: '#F3C9D3',
              },
              { type: 'text', title: 'Key Takeaways:' },
              { type: 'text', title: 'Next Meeting Date & Time:' },
            ],
          },
        ],
      },
    ],
  },
  44: {
    layout: 'valentines-activity-planner',
    headerColor: '#B03052',
    headerBg: '#FFFFFF',
    headerStyle: 'script',
    accentColor: '#B03052',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: '#FFFFFF',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D8D8D8',
    },
    sections: [
      {
        type: 'row',
        children: [
          {
            type: 'group',
            children: [
              {
                type: 'checklistLine',
                title: 'Things to Make',
                count: 4,
                hideBullet: true,
              },
              {
                type: 'checklistLine',
                title: 'Games to Play',
                count: 4,
                hideBullet: true,
              },
              {
                type: 'checklistLine',
                title: 'Yummy Things to Eat and Drink',
                count: 6,
                hideBullet: true,
              },
              {
                type: 'checklistLine',
                title: 'Books and Movies',
                count: 3,
                hideBullet: true,
              },
            ],
          },
          {
            type: 'group',
            children: [
              {
                type: 'checklistLine',
                title: 'Shopping List',
                count: 14,
                hideBullet: true,
              },
            ],
          },
        ],
      },
    ],
  },
  45: {
    layout: 'weekly-valentine-planner',
    headerColor: '#B03052',
    headerBg: '#FFFFFF',
    headerStyle: 'script',
    accentColor: '#B03052',
    sheetBg: '#FFF9FA',
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#F0C7D0',
      sectionBorderWidth: 1,
      sectionBorderRadius: 8,
      inputUnderlineColor: '#E8B0BE',
    },
    sections: [
      { type: 'text', title: 'Week Of:' },
      {
        type: 'row',
        children: [
          { type: 'textarea', title: '💌 Monday' },
          { type: 'textarea', title: '💕 Tuesday' },
          { type: 'textarea', title: '💖 Wednesday' },
        ],
      },
      {
        type: 'row',
        children: [
          { type: 'textarea', title: '💝 Thursday' },
          { type: 'textarea', title: '🌹 Friday' },
          {
            type: 'group',
            children: [
              { type: 'textarea', title: '💗 Saturday' },
              { type: 'textarea', title: '❤️ Sunday' },
            ],
          },
        ],
      },
      { type: 'textarea', title: '💘 Notes' },
    ],
  },
  46: {
    layout: 'valentines-gift-idea-planner',
    headerColor: '#C2185B',
    headerBg: '#FFFFFF',
    headerStyle: 'script',
    accentColor: '#E091A8',
    sheetBg: '#FFFFFF',
    themeStyle: {
      tagStyle: 'box',
      bulletShape: 'heart',
      sectionBg: '#FFFFFF',
      sectionBorderColor: '#F0C0CC',
      sectionBorderWidth: 1.2,
      sectionBorderRadius: 6,
      inputUnderlineColor: '#E8B0C0',
    },
    sections: [
      {
        type: 'table',
        columns: ['Ideas', 'Where To Get It', 'When To Get It', 'Cost'],
        rows: 16,
      },
    ],
  },
  47: {
    layout: 'photo-collage',
    headerColor: '#3d2418',
    headerBg: '#F3E9DD',
    headerStyle: 'script',
    accentColor: '#8a4a5a',
    sheetBg: '#F3E9DD',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/love1.jpeg'),
      require('../assets/templets/love2.jpeg'),
      require('../assets/templets/love3.jpeg'),
      require('../assets/templets/love4.jpeg'),
      require('../assets/templets/love5.jpeg'),
      require('../assets/templets/love6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D8A0AE',
    },
    sections: [
      { type: 'decorHeader', icons: ['🌸', '🎀'] },
      {
        type: 'scriptHeading',
        placeholder: 'Happy Anniversary',
        accentColor: '#7a3548',
      },
      { type: 'photoCollage', photoCount: 2, photoStyle: 'polaroid' },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'may you be a couple who love each other forever.',
      },
    ],
  },
  48: {
    layout: 'photo-collage',
    headerColor: '#4A3728',
    headerBg: '#F5E9DC',
    headerStyle: 'script',
    accentColor: '#8a4a5a',
    sheetBg: '#F5E9DC',
    hideHeader: true,
    backgroundImages: [
        require('../assets/templets/bod.jpeg'),
        require('../assets/templets/bod1.jpeg'),
        require('../assets/templets/bod2.jpeg'),
        require('../assets/templets/bod3.jpeg'),
        require('../assets/templets/bod4.jpeg'),
        require('../assets/templets/bod5.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#E0B8C4',
    },
    sections: [
        {
            type: 'photoFrame',
            frameCaption: 'Happy Birthday!',
        },
    ],
  },
  49: {
  layout: 'photo-collage',
  headerColor: '#3d5a80',
  headerBg: '#EAF2FB',
  headerStyle: 'script',
  accentColor: '#7a9cc6',
  sheetBg: '#EAF2FB',
  hideHeader: true,
  backgroundImages: [
    require('../assets/templets/babyshower1.jpeg'),
    require('../assets/templets/babyshower2.jpeg'),
    require('../assets/templets/babyshower3.jpeg'),
    require('../assets/templets/babyshower4.jpeg'),
    require('../assets/templets/babyshower5.jpeg'),
    require('../assets/templets/babyshower6.jpeg'),
  ],
  themeStyle: {
    tagStyle: 'underline',
    bulletShape: 'heart',
    sectionBg: 'transparent',
    sectionBorderColor: 'transparent',
    sectionBorderWidth: 0,
    sectionBorderRadius: 0,
    inputUnderlineColor: '#B8CCE0',
  },
  sections: [
    { type: 'decorHeader', icons: ['🍼', '🧸'] },
    {
      type: 'scriptHeading',
      placeholder: 'Welcome Baby',
      accentColor: '#3d5a80',
    },
    { type: 'photoFrame', frameCaption: 'Baby Shower' },
  ],
},
50: {
    layout: 'photo-collage',
    headerColor: '#3d2418',
    headerBg: '#F3E9DD',
    headerStyle: 'script',
    accentColor: '#8a4a5a',
    sheetBg: '#F3E9DD',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/love1.jpeg'),
      require('../assets/templets/love2.jpeg'),
      require('../assets/templets/love3.jpeg'),
      require('../assets/templets/love4.jpeg'),
      require('../assets/templets/love5.jpeg'),
      require('../assets/templets/love6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D8A0AE',
    },
    sections: [
      { type: 'decorHeader', icons: ['💫', '🤍'] },
      {
        type: 'scriptHeading',
        placeholder: 'Forever & Always',
        accentColor: '#7a3548',
      },
      {
        type: 'photoScatter',
        scatterHeight: 340,
        photoPositions: [
          { top: 0, left: 30, width: 190, height: 220, rotate: '-6deg' },
          { top: 100, left: 190, width: 140, height: 160, rotate: '8deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'every moment with you is a memory worth keeping.',
      },
    ],
  },
  51: {
    layout: 'photo-collage',
    headerColor: '#2e3d32',
    headerBg: '#EAF3EA',
    headerStyle: 'script',
    accentColor: '#4a6b52',
    sheetBg: '#EAF3EA',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/love1.jpeg'),
      require('../assets/templets/love2.jpeg'),
      require('../assets/templets/love3.jpeg'),
      require('../assets/templets/love4.jpeg'),
      require('../assets/templets/love5.jpeg'),
      require('../assets/templets/love6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#A8C4AE',
    },
    sections: [
      { type: 'decorHeader', icons: ['🍃', '🌼'] },
      {
        type: 'scriptHeading',
        placeholder: 'Simple Moments',
        accentColor: '#3d5540',
      },
      {
        type: 'photoScatter',
        scatterHeight: 360,
        photoPositions: [
          { top: 10, left: 20, width: 150, height: 180, rotate: '-4deg' },
          { top: 40, left: 190, width: 160, height: 190, rotate: '5deg' },
          { top: 210, left: 60, width: 150, height: 150, rotate: '3deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'the little things are never really little.',
      },
    ],
  },

  52: {
    layout: 'photo-collage',
    headerColor: '#3d2b1f',
    headerBg: '#F5EFE0',
    headerStyle: 'script',
    accentColor: '#a8763f',
    sheetBg: '#F5EFE0',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/bod.jpeg'),
      require('../assets/templets/bod1.jpeg'),
      require('../assets/templets/bod2.jpeg'),
      require('../assets/templets/bod3.jpeg'),
      require('../assets/templets/bod4.jpeg'),
      require('../assets/templets/bod5.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'star',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D8C0A0',
    },
    sections: [
      { type: 'decorHeader', icons: ['🎈', '✨'] },
      {
        type: 'scriptHeading',
        placeholder: 'Celebrate Today',
        accentColor: '#7a5228',
      },
      {
        type: 'photoScatter',
        scatterHeight: 380,
        photoPositions: [
          { top: 0, left: 90, width: 170, height: 200, rotate: '2deg' },
          { top: 150, left: 10, width: 140, height: 160, rotate: '-8deg' },
          { top: 190, left: 220, width: 130, height: 150, rotate: '7deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'here is to another year of memories.',
      },
    ],
  },

  53: {
    layout: 'photo-collage',
    headerColor: '#2b3d4a',
    headerBg: '#EAF2FB',
    headerStyle: 'script',
    accentColor: '#5a7ea3',
    sheetBg: '#EAF2FB',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/babyshower1.jpeg'),
      require('../assets/templets/babyshower2.jpeg'),
      require('../assets/templets/babyshower3.jpeg'),
      require('../assets/templets/babyshower4.jpeg'),
      require('../assets/templets/babyshower5.jpeg'),
      require('../assets/templets/babyshower6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#B8CCE0',
    },
    sections: [
      { type: 'decorHeader', icons: ['🎀', '🧸'] },
      {
        type: 'scriptHeading',
        placeholder: 'Precious Moments',
        accentColor: '#3d5a80',
      },
      {
        type: 'photoScatter',
        scatterHeight: 340,
        photoPositions: [
          { top: 20, left: 60, width: 200, height: 180, rotate: '-3deg' },
          { top: 170, left: 140, width: 150, height: 170, rotate: '6deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'small hands, big love.',
      },
    ],
  },
  54: {
    layout: 'photo-collage',
    headerColor: '#4a3d2b',
    headerBg: '#F7F0E3',
    headerStyle: 'script',
    accentColor: '#9c7a3f',
    sheetBg: '#F7F0E3',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/love1.jpeg'),
      require('../assets/templets/love2.jpeg'),
      require('../assets/templets/love3.jpeg'),
      require('../assets/templets/love4.jpeg'),
      require('../assets/templets/love5.jpeg'),
      require('../assets/templets/love6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D8C29A',
    },
    sections: [
      { type: 'decorHeader', icons: ['💍', '🕊️'] },
      {
        type: 'scriptHeading',
        placeholder: 'Our Wedding Day',
        accentColor: '#6b542a',
      },
      {
        type: 'photoScatter',
        scatterHeight: 400,
        photoPositions: [
          { top: 0, left: 10, width: 160, height: 190, rotate: '-5deg' },
          { top: 30, left: 170, width: 150, height: 180, rotate: '4deg' },
          { top: 220, left: 40, width: 140, height: 150, rotate: '6deg' },
          { top: 240, left: 190, width: 130, height: 140, rotate: '-3deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'the beginning of our forever.',
      },
    ],
  },

  55: {
    layout: 'photo-collage',
    headerColor: '#2b3a4a',
    headerBg: '#EAF0F7',
    headerStyle: 'script',
    accentColor: '#5f7a99',
    sheetBg: '#EAF0F7',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/bod.jpeg'),
      require('../assets/templets/bod1.jpeg'),
      require('../assets/templets/bod2.jpeg'),
      require('../assets/templets/bod3.jpeg'),
      require('../assets/templets/bod4.jpeg'),
      require('../assets/templets/bod5.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'star',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#B8C8DC',
    },
    sections: [
      { type: 'decorHeader', icons: ['👯', '🎉'] },
      {
        type: 'scriptHeading',
        placeholder: 'Friends Forever',
        accentColor: '#3d5266',
      },
      {
        type: 'photoScatter',
        scatterHeight: 340,
        photoPositions: [
          { top: 10, left: 100, width: 170, height: 190, rotate: '0deg' },
          { top: 130, left: 0, width: 130, height: 150, rotate: '-7deg' },
          { top: 160, left: 210, width: 120, height: 140, rotate: '8deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'good times and crazy friends make the best memories.',
      },
    ],
  },

  56: {
    layout: 'photo-collage',
    headerColor: '#3d2b4a',
    headerBg: '#F1EAF7',
    headerStyle: 'script',
    accentColor: '#7a5f99',
    sheetBg: '#F1EAF7',
    hideHeader: true,
    backgroundImages: [
      require('../assets/templets/babyshower1.jpeg'),
      require('../assets/templets/babyshower2.jpeg'),
      require('../assets/templets/babyshower3.jpeg'),
      require('../assets/templets/babyshower4.jpeg'),
      require('../assets/templets/babyshower5.jpeg'),
      require('../assets/templets/babyshower6.jpeg'),
    ],
    themeStyle: {
      tagStyle: 'underline',
      bulletShape: 'heart',
      sectionBg: 'transparent',
      sectionBorderColor: 'transparent',
      sectionBorderWidth: 0,
      sectionBorderRadius: 0,
      inputUnderlineColor: '#D0C0E0',
    },
    sections: [
      { type: 'decorHeader', icons: ['🎓', '⭐'] },
      {
        type: 'scriptHeading',
        placeholder: 'New Beginnings',
        accentColor: '#54366b',
      },
      {
        type: 'photoScatter',
        scatterHeight: 360,
        photoPositions: [
          { top: 0, left: 60, width: 180, height: 200, rotate: '3deg' },
          { top: 190, left: 0, width: 140, height: 150, rotate: '-6deg' },
          { top: 210, left: 190, width: 130, height: 140, rotate: '5deg' },
        ],
      },
      {
        type: 'textarea',
        noBox: true,
        placeholder: 'every ending is just a new beginning in disguise.',
      },
    ],
  },
};

export const DEFAULT_DESIGN: TemplateDesign = TEMPLATE_DESIGNS[1];
