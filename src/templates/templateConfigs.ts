import { ThemeStyle } from './SectionRenderer';

export type FieldType = 'text' | 'textarea' | 'checklistLine' | 'hourGrid' | 'dayPicker' | 'iconRow' | 'habitGrid' | 'monthCalendar';

export type SectionConfig = {
    type: FieldType;
    title?: string;
    count?: number;
    hours?: string[];
    accentColor?: string;
    icons?: string[];
    startDay?: 'mon' | 'sun';
    decoration?: 'floral' | 'tropical' | 'minimal' | 'flamingo';
};

export type TemplateDesign = {
    layout: string;
    headerColor: string;
    headerStyle: 'bold' | 'script' | 'handwritten';
    accentColor: string;
    headerBg?: string;      
    sheetBg?: string;        
    themeStyle?: ThemeStyle; 
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
            { type: 'hourGrid', hours: ['5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'] },
            { type: 'checklistLine', title: 'To-Do List', count: 6 },
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
            { type: 'checklistLine', title: 'Tasks', count: 8 },
            { type: 'checklistLine', title: 'Reminder', count: 8 },
            { type: 'iconRow', title: 'Hydrate', icons: ['💧','💧','💧','💧','💧','💧','💧','💧'] },
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
            { type: 'hourGrid', hours: ['5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','12 AM'] },
            { type: 'iconRow', title: 'Self-Care', icons: ['🛁','❤️','🦷'] },
            { type: 'iconRow', title: 'Hydrate!', icons: ['🥤','🥤','🥤','🥤','🥤','🥤','🥤'] },
            { type: 'checklistLine', title: 'Top 3 - Get These Done!', count: 3 },
            { type: 'checklistLine', title: 'Soon-ish', count: 3 },
            { type: 'checklistLine', title: 'Later-ish', count: 3 },
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
            { type: 'textarea', title: 'Top Goals This Week' },
            { type: 'checklistLine', title: 'To-Do List for the Week', count: 7 },
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
            { type: 'hourGrid', hours: ['5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM','12 AM'] },
            { type: 'monthCalendar', startDay: 'sun', decoration: 'minimal' },
            { type: 'checklistLine', title: 'To-Do', count: 6 },
            { type: 'checklistLine', title: 'Priorities', count: 4 },
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
            { type: 'iconRow', title: 'How Do I Feel Today? 😊', icons: ['😄','😊','😐','😢','😡','🤒'] },
            { type: 'checklistLine', title: '⭐ My 3 Goals Today', count: 3 },
            { type: 'checklistLine', title: '📚 School Tasks', count: 5 },
            { type: 'iconRow', title: '💧 Water & Snacks', icons: ['💧','💧','💧','💧','🍎','🍎','🍎'] },
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
            { type: 'checklistLine', title: '🧺 Food & Drinks to Pack', count: 8 },
            { type: 'checklistLine', title: '🎒 Things to Bring', count: 6 },
            { type: 'checklistLine', title: '👥 Guests Invited', count: 5 },
            { type: 'iconRow', title: '🌤️ Weather Check', icons: ['☀️','⛅','🌥️','🌧️'] },
            { type: 'textarea', title: '🎶 Music & Activities Ideas' },
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
            { type: 'checklistLine', title: '🎯 Must-See Places', count: 6 },
            { type: 'hourGrid', hours: ['6 AM','8 AM','10 AM','12 PM','2 PM','4 PM','6 PM','8 PM','10 PM'] },
            { type: 'checklistLine', title: '🧳 Packing List', count: 10 },
            { type: 'iconRow', title: '✅ Pre-Trip Checklist', icons: ['🛂','🎫','💳','📱','🔋','🗺️'] },
            { type: 'textarea', title: '💡 Trip Notes & Tips' },
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
            { type: 'checklistLine', title: '🌹 Date Ideas This Week', count: 5 },
            { type: 'checklistLine', title: '💬 Things to Talk About', count: 4 },
            { type: 'iconRow', title: '❤️ Love Meter', icons: ['❤️','❤️','❤️','❤️','❤️','❤️','❤️','❤️','❤️','❤️'] },
            { type: 'textarea', title: '📝 Our Memories Today' },
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
            { type: 'checklistLine', title: '🧹 Cleaning Tasks', count: 6 },
            { type: 'checklistLine', title: '🛒 Grocery / Shopping List', count: 8 },
            { type: 'checklistLine', title: '🔧 Fix & Repair List', count: 4 },
            { type: 'iconRow', title: '🏡 Room Done Today', icons: ['🛋️','🍳','🛁','🛏️','🪟','🪴'] },
            { type: 'textarea', title: '📋 Home Notes' },
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
            { type: 'checklistLine', title: '🐠 Daily Tank Care', count: 5 },
            { type: 'iconRow', title: '🌡️ Water Check', icons: ['🌡️','💧','⚗️','🔬','🐟'] },
            { type: 'textarea', title: '📊 Water Parameters (pH, Temp, Nitrate)' },
            { type: 'checklistLine', title: '🛒 Supplies to Buy', count: 4 },
            { type: 'textarea', title: '🗒️ Observation Notes' },
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
            { type: 'iconRow', title: "😺 Kitty's Mood Today", icons: ['😻','😸','😾','🙀','😴','🐱'] },
            { type: 'checklistLine', title: '🐾 Daily Cat Care', count: 5 },
            { type: 'iconRow', title: '🍽️ Meals & Treats', icons: ['🥣','🥣','🍗','🐟','🧃'] },
            { type: 'textarea', title: '📝 Vet Notes & Reminders' },
            { type: 'checklistLine', title: '🛒 Cat Supplies Needed', count: 4 },
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
            { type: 'hourGrid', hours: ['7 AM','12 PM','3 PM','6 PM','9 PM'] },
            { type: 'iconRow', title: "🐕 Doggo's Day", icons: ['🦮','🎾','🛁','💊','🍗','🐾'] },
            { type: 'checklistLine', title: '🐾 Daily Dog Tasks', count: 6 },
            { type: 'textarea', title: '🏥 Vet / Health Notes' },
            { type: 'checklistLine', title: '🛒 Dog Supplies List', count: 4 },
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
            { type: 'hourGrid', hours: ['6 AM','7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'] },
            { type: 'checklistLine', title: '📋 Tasks for This Shift', count: 6 },
            { type: 'checklistLine', title: '⏰ Handover Notes', count: 4 },
            { type: 'iconRow', title: '✅ Shift Checklist', icons: ['🔑','📞','💻','📁','☕','🏁'] },
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
            { type: 'iconRow', title: '🌈 My Mood', icons: ['😄','😊','😐','😔','😡','🥺','😰'] },
            { type: 'textarea', title: '☀️ Morning Thoughts' },
            { type: 'checklistLine', title: '🙏 Grateful For Today', count: 3 },
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
            { type: 'checklistLine', title: '📖 Classes Today', count: 5 },
            { type: 'hourGrid', hours: ['7 AM','8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM'] },
            { type: 'checklistLine', title: '📝 Assignments Due', count: 5 },
            { type: 'checklistLine', title: '📌 Exam / Test Reminders', count: 3 },
            { type: 'habitGrid', title: '📊 Study Habit Tracker' },
            { type: 'textarea', title: '💡 Notes & Ideas' },
        ],
    },
};

export const DEFAULT_DESIGN: TemplateDesign = TEMPLATE_DESIGNS[1];