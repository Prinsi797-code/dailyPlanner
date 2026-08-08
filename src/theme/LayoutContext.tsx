import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type LayoutMode = "grid" | "list";
export type DayOrder = "rowMajor" | "colMajor";
export type LineType = "solid" | "round" | "dash" | "dot";
export type WeekStartDay = "monday" | "sunday" | "saturday";

const LAYOUT_STORAGE_KEY = "@calendar_layout_mode";
const DAY_ORDER_STORAGE_KEY = "@day_order";
const LINE_TYPE_STORAGE_KEY = "@line_type";
const WEEK_START_STORAGE_KEY = "@week_start_day";

const DEFAULT_LAYOUT: LayoutMode = "grid";
const DEFAULT_DAY_ORDER: DayOrder = "rowMajor";
const DEFAULT_LINE_TYPE: LineType = "solid";
const DEFAULT_WEEK_START: WeekStartDay = "monday";

type LayoutContextValue = {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  dayOrder: DayOrder;
  setDayOrder: (mode: DayOrder) => void;
  lineType: LineType;
  setLineType: (type: LineType) => void;
  weekStartDay: WeekStartDay;
  setWeekStartDay: (day: WeekStartDay) => void;
};

const LayoutContext = createContext<LayoutContextValue>({
  layoutMode: DEFAULT_LAYOUT,
  setLayoutMode: () => {},
  dayOrder: DEFAULT_DAY_ORDER,
  setDayOrder: () => {},
  lineType: DEFAULT_LINE_TYPE,
  setLineType: () => {},
  weekStartDay: DEFAULT_WEEK_START,
  setWeekStartDay: () => {},
});

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>(DEFAULT_LAYOUT);
  const [dayOrder, setDayOrderState] = useState<DayOrder>(DEFAULT_DAY_ORDER);
  const [lineType, setLineTypeState] = useState<LineType>(DEFAULT_LINE_TYPE);
  const [weekStartDay, setWeekStartDayState] = useState<WeekStartDay>(DEFAULT_WEEK_START);

  useEffect(() => {
    AsyncStorage.getItem(LAYOUT_STORAGE_KEY).then((val) => {
      if (val === "grid" || val === "list") {
        setLayoutModeState(val);
      }
    });
    AsyncStorage.getItem(DAY_ORDER_STORAGE_KEY).then((val) => {
      if (val === "rowMajor" || val === "colMajor") {
        setDayOrderState(val);
      }
    });
    AsyncStorage.getItem(LINE_TYPE_STORAGE_KEY).then((val) => {
      if (val === "solid" || val === "round" || val === "dash" || val === "dot") {
        setLineTypeState(val);
      }
    });
    AsyncStorage.getItem(WEEK_START_STORAGE_KEY).then((val) => {
      if (val === "monday" || val === "sunday" || val === "saturday") {
        setWeekStartDayState(val);
      }
    });
  }, []);

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    AsyncStorage.setItem(LAYOUT_STORAGE_KEY, mode).catch(() => {});
  };

  const setDayOrder = (mode: DayOrder) => {
    setDayOrderState(mode);
    AsyncStorage.setItem(DAY_ORDER_STORAGE_KEY, mode).catch(() => {});
  };

  const setLineType = (type: LineType) => {
    setLineTypeState(type);
    AsyncStorage.setItem(LINE_TYPE_STORAGE_KEY, type).catch(() => {});
  };

  const setWeekStartDay = (day: WeekStartDay) => {
    setWeekStartDayState(day);
    AsyncStorage.setItem(WEEK_START_STORAGE_KEY, day).catch(() => {});
  };

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        setLayoutMode,
        dayOrder,
        setDayOrder,
        lineType,
        setLineType,
        weekStartDay,
        setWeekStartDay,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  return useContext(LayoutContext);
}