import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SectionConfig } from "./templateConfigs";
import { useTheme } from "../theme/ThemeContext";
import MonthCalendarBlock from "./MonthCalendarBlock";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

type Props = {
  section: SectionConfig;
  accentColor: string;
  values: Record<string, string[]>;
  onChange: (key: string, index: number, text: string) => void;
  fieldKey: string;
  themeStyle?: ThemeStyle;
};

export type ThemeStyle = {
  sectionBg?: string; // section card background
  sectionBorderColor?: string; // section card border
  sectionBorderWidth?: number;
  sectionBorderRadius?: number;
  tagStyle?: "pill" | "banner" | "box" | "underline"; // title style
  bulletShape?: "circle" | "square" | "star" | "heart";
  inputUnderlineColor?: string;
  font?: "normal" | "italic";
};

function BulletShape({ shape, color }: { shape?: string; color: string }) {
  switch (shape) {
    case "square":
      return (
        <View
          style={{
            width: 8,
            height: 8,
            borderWidth: 1.5,
            borderColor: color,
            marginRight: 8,
            borderRadius: 2,
          }}
        />
      );
    case "star":
      return <Text style={{ marginRight: 8, fontSize: 11, color }}>⭐</Text>;
    case "heart":
      return <Text style={{ marginRight: 8, fontSize: 11, color }}>♡</Text>;
    default: // circle
      return (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            borderWidth: 1.4,
            borderColor: color,
            marginRight: 8,
          }}
        />
      );
  }
}

function SectionTag({
  title,
  accentColor,
  tagStyle,
}: {
  title: string;
  accentColor: string;
  tagStyle?: string;
}) {
  switch (tagStyle) {
    case "banner":
      return (
        <View
          style={[
            sectionTagStyles.bannerWrap,
            { backgroundColor: accentColor },
          ]}
        >
          <View
            style={[
              sectionTagStyles.bannerEar,
              sectionTagStyles.bannerEarLeft,
              { borderRightColor: accentColor },
            ]}
          />
          <Text style={sectionTagStyles.bannerText}>{title}</Text>
          <View
            style={[
              sectionTagStyles.bannerEar,
              sectionTagStyles.bannerEarRight,
              { borderLeftColor: accentColor },
            ]}
          />
        </View>
      );
    case "box":
      return (
        <View style={[sectionTagStyles.boxWrap, { borderColor: accentColor }]}>
          <Text style={[sectionTagStyles.boxText, { color: accentColor }]}>
            {title}
          </Text>
        </View>
      );
    case "underline":
      return (
        <View style={sectionTagStyles.underlineWrap}>
          <Text
            style={[sectionTagStyles.underlineText, { color: accentColor }]}
          >
            {title}
          </Text>
          <View
            style={[
              sectionTagStyles.underlineLine,
              { backgroundColor: accentColor },
            ]}
          />
        </View>
      );
    default: // pill
      return (
        <View
          style={[sectionTagStyles.pillWrap, { backgroundColor: accentColor }]}
        >
          <Text style={sectionTagStyles.pillText}>{title}</Text>
        </View>
      );
  }
}

const sectionTagStyles = StyleSheet.create({
  pillWrap: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  pillText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  bannerWrap: {
    flexDirection: "row",
    alignSelf: "center",
    marginBottom: 12,
    alignItems: "center",
  },
  bannerEar: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  bannerEarLeft: { borderRightWidth: 10 },
  bannerEarRight: { borderLeftWidth: 10 },
  bannerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingVertical: 5,
  },

  boxWrap: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  boxText: { fontSize: 12, fontWeight: "700" },

  underlineWrap: { marginBottom: 12 },
  underlineText: { fontSize: 14, fontWeight: "800", marginBottom: 4 },
  underlineLine: { height: 2, borderRadius: 1, width: "100%" },
});

export default function SectionRenderer({
  section,
  accentColor,
  values,
  onChange,
  fieldKey,
  themeStyle,
}: Props) {
  const { colors } = useTheme();
  const data = values[fieldKey] || [];
  const ts = themeStyle || {};

  const setVal = (i: number, text: string) => onChange(fieldKey, i, text);

  const cardStyle = {
    backgroundColor: ts.sectionBg || "transparent",
    borderColor: ts.sectionBorderColor || "transparent",
    borderWidth: ts.sectionBorderWidth || 0,
    borderRadius: ts.sectionBorderRadius ?? 10,
    padding: ts.sectionBg ? 12 : 0,
    marginBottom: 18,
  };

  const underlineColor = ts.inputUnderlineColor || colors.border;

  switch (section.type) {
    case "text":
      return (
        <View style={[cardStyle, styles.textInlineRow]}>
          {section.title && (
            <Text style={[styles.textInlineLabel, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          <TextInput
            style={[
              styles.textInlineInput,
              { borderColor: underlineColor, color: colors.text },
            ]}
            value={data[0] || ""}
            onChangeText={(t) => setVal(0, t)}
            placeholderTextColor={colors.placeholder}
          />
        </View>
      );

    case "dayPicker":
      return (
        <View
          style={[
            cardStyle,
            {
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 6,
              alignItems: "center",
            },
          ]}
        >
          {DAYS.map((d, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setVal(0, data[0] === String(i) ? "" : String(i))}
              style={[
                styles.dayCircle,
                {
                  borderColor: accentColor,
                  backgroundColor:
                    data[0] === String(i) ? accentColor : "transparent",
                },
              ]}
            >
              <Text
                style={{
                  fontSize: 11,
                  color: data[0] === String(i) ? "#fff" : accentColor,
                  fontWeight: "700",
                }}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    case "checklistLine":
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag
              title={section.title}
              accentColor={accentColor}
              tagStyle={ts.tagStyle}
            />
          )}
          {Array.from({ length: section.count || 3 }).map((_, i) => (
            <View key={i} style={styles.checklistRow}>
              <BulletShape shape={ts.bulletShape} color={accentColor} />
              <TextInput
                style={[
                  styles.checklistInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[i] || ""}
                onChangeText={(t) => setVal(i, t)}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          ))}
        </View>
      );

    // 👇 Naya: 2-column boxed checklist grid (e.g. "Morning Check-In" style)
    case "checklistGrid":
      return (
        <View
          style={[
            cardStyle,
            { padding: 0, backgroundColor: "transparent", borderWidth: 0 },
          ]}
        >
          <View style={styles.gridWrap}>
            {(section.boxes || []).map((box, boxIndex) => {
              // Har box ka data alag rakhne ke liye offset use kiya (jaise habitGrid mein)
              const baseIndex = boxIndex * 20;
              return (
                <View
                  key={boxIndex}
                  style={[
                    styles.gridBox,
                    {
                      backgroundColor: ts.sectionBg || "#FFFFFF",
                      borderColor: ts.sectionBorderColor || colors.border,
                      borderWidth: ts.sectionBorderWidth ?? 1.5,
                      borderRadius: ts.sectionBorderRadius ?? 14,
                    },
                  ]}
                >
                  <Text style={[styles.gridBoxTitle, { color: colors.text }]}>
                    {box.title}
                  </Text>
                  {Array.from({ length: box.count || 5 }).map((_, i) => {
                    const idx = baseIndex + i;
                    return (
                      <View key={i} style={styles.gridChecklistRow}>
                        <View
                          style={[
                            styles.checkboxSquare,
                            {
                              borderColor: accentColor,
                              backgroundColor:
                                data[idx] === "1" ? accentColor : "transparent",
                            },
                          ]}
                        />
                        <TextInput
                          style={[
                            styles.gridChecklistInput,
                            { borderColor: underlineColor, color: colors.text },
                          ]}
                          value={data[idx] || ""}
                          onChangeText={(t) => setVal(idx, t)}
                          placeholderTextColor={colors.placeholder}
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      );

    // 👇 Naya: flexible-width label + input line, stacked (e.g. "Sales Tracker")
    case "labeledLines":
      return (
        <View style={cardStyle}>
          {section.title && (
            <Text style={[styles.plainTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          {(section.lines || []).map((label, i) => (
            <View key={i} style={styles.labeledLineRow}>
              <Text style={[styles.labeledLineLabel, { color: colors.text }]}>
                {label}
              </Text>
              <TextInput
                style={[
                  styles.labeledLineInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[i] || ""}
                onChangeText={(t) => setVal(i, t)}
              />
            </View>
          ))}
        </View>
      );

    // 👇 Naya: horizontal checkbox + label chips (e.g. "Today's Goal")
    case "checkboxRow":
      return (
        <View style={cardStyle}>
          {section.title && (
            <Text style={[styles.plainTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          <View style={styles.checkboxRowWrap}>
            {(section.items || []).map((label, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setVal(i, data[i] === "1" ? "" : "1")}
                style={styles.checkboxRowItem}
              >
                <View
                  style={[
                    styles.checkboxRowBox,
                    {
                      borderColor: accentColor,
                      backgroundColor:
                        data[i] === "1" ? accentColor : "transparent",
                    },
                  ]}
                />
                <Text style={[styles.checkboxRowLabel, { color: colors.text }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    // 👇 Naya: multi-column table (e.g. "Products To Resell", "Listing Tracker")
    case "table": {
      const cols = section.columns || [];
      const rowCount = section.rows || 3;
      return (
        <View style={cardStyle}>
          {section.title && (
            <Text style={[styles.plainTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          {section.caption && (
            <Text style={[styles.tableCaption, { color: colors.text }]}>
              {section.caption}
            </Text>
          )}
          <View style={[styles.tableWrap, { borderColor: underlineColor }]}>
            {/* Header row */}
            <View
              style={[styles.tableRow, { borderBottomColor: underlineColor }]}
            >
              {cols.map((col, ci) => (
                <View
                  key={ci}
                  style={[
                    styles.tableHeaderCell,
                    {
                      borderRightColor: underlineColor,
                      borderRightWidth: ci < cols.length - 1 ? 1 : 0,
                    },
                  ]}
                >
                  <Text
                    style={[styles.tableHeaderText, { color: colors.text }]}
                  >
                    {col}
                  </Text>
                </View>
              ))}
            </View>
            {/* Body rows */}
            {Array.from({ length: rowCount }).map((_, ri) => (
              <View
                key={ri}
                style={[
                  styles.tableRow,
                  {
                    borderBottomWidth: ri < rowCount - 1 ? 1 : 0,
                    borderBottomColor: underlineColor,
                  },
                ]}
              >
                {cols.map((_, ci) => {
                  const idx = ri * 100 + ci;
                  return (
                    <View
                      key={ci}
                      style={[
                        styles.tableBodyCell,
                        {
                          borderRightColor: underlineColor,
                          borderRightWidth: ci < cols.length - 1 ? 1 : 0,
                        },
                      ]}
                    >
                      <TextInput
                        style={[styles.tableCellInput, { color: colors.text }]}
                        value={data[idx] || ""}
                        onChangeText={(t) => setVal(idx, t)}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      );
    }

    // 👇 Naya: checklist items + free-form notes box beside them (e.g. "Customer Follow-Up")
    case "checklistWithNotes":
      return (
        <View style={cardStyle}>
          {section.title && (
            <Text style={[styles.plainTitle, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          <View style={styles.checklistWithNotesRow}>
            <View style={{ flex: 1.2 }}>
              {(section.items || []).map((label, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setVal(i, data[i] === "1" ? "" : "1")}
                  style={styles.checklistWithNotesItem}
                >
                  <View
                    style={[
                      styles.checkboxRowBox,
                      {
                        borderColor: accentColor,
                        backgroundColor:
                          data[i] === "1" ? accentColor : "transparent",
                      },
                    ]}
                  />
                  <Text
                    style={[styles.checkboxRowLabel, { color: colors.text }]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[styles.notesBox, { borderColor: underlineColor }]}>
              {section.notesLabel && (
                <Text style={[styles.notesBoxLabel, { color: colors.text }]}>
                  {section.notesLabel}
                </Text>
              )}
              <TextInput
                style={[styles.notesBoxInput, { color: colors.text }]}
                value={data[50] || ""}
                onChangeText={(t) => setVal(50, t)}
                multiline
              />
            </View>
          </View>
        </View>
      );

    // 👇 Naya: colored full-width banner header (e.g. "Shift Overview", "Cash Count")
    case "sectionBanner":
      const bannerColor = section.accentColor || accentColor;
      const solid = !!section.accentColor;
      return (
        <View
          style={[
            styles.sectionBanner,
            solid
              ? { backgroundColor: bannerColor }
              : { backgroundColor: bannerColor + "33" },
          ]}
        >
          <Text
            style={[
              styles.sectionBannerText,
              { color: solid ? "#fff" : colors.text },
            ]}
          >
            {section.title}
          </Text>
        </View>
      );

    case "colorGroupTable": {
      const rowLabels = section.rowLabels || [];
      const groupHeaders = section.groupHeaders || [];
      const cols = section.colColumns || [];
      return (
        <View
          style={[
            cardStyle,
            { padding: 0, backgroundColor: "transparent", borderWidth: 0 },
          ]}
        >
          <View style={[styles.cgtWrap, { borderColor: underlineColor }]}>
            {/* Row 0: row-label header + group headers — sirf tab jab groupHeaders diye ho */}
            {groupHeaders.length > 0 && (
              <View style={styles.cgtRow}>
                <View
                  style={[
                    styles.cgtDayHeaderCell,
                    { backgroundColor: section.rowLabelColor || accentColor },
                  ]}
                >
                  <Text style={styles.cgtDayHeaderText}>
                    {section.rowLabelTitle || "Day"}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  {groupHeaders.map((g, i) => (
                    <View
                      key={i}
                      style={[
                        styles.cgtGroupHeaderCell,
                        { flex: g.span, backgroundColor: g.color || "#D8D8D8" },
                      ]}
                    >
                      <Text style={styles.cgtGroupHeaderText}>{g.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {/* Row 1: individual column headers (agar groupHeaders nahi hai to ye hi top row hogi, rowLabelTitle bhi isi row me dikhega) */}
            <View style={styles.cgtRow}>
              <View
                style={[
                  styles.cgtDayHeaderCell,
                  groupHeaders.length === 0 && {
                    backgroundColor: section.rowLabelColor || accentColor,
                  },
                ]}
              >
                {groupHeaders.length === 0 && (
                  <Text style={styles.cgtDayHeaderText}>
                    {section.rowLabelTitle || "Day"}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, flexDirection: "row" }}>
                {cols.map((c, ci) => (
                  <View
                    key={ci}
                    style={[
                      styles.cgtColHeaderCell,
                      { flex: 1, backgroundColor: c.color || "#E2E2E2" },
                    ]}
                  >
                    <Text style={styles.cgtColHeaderText}>{c.title}</Text>
                  </View>
                ))}
              </View>
            </View>
            {/* Data rows */}
            {rowLabels.map((rl, ri) => (
              <View
                key={ri}
                style={[
                  styles.cgtRow,
                  { borderTopWidth: 1, borderTopColor: underlineColor },
                ]}
              >
                <View
                  style={[
                    styles.cgtDayCell,
                    {
                      backgroundColor:
                        (section.rowLabelColor || accentColor) + "30",
                    },
                  ]}
                >
                  <Text style={[styles.cgtDayCellText, { color: colors.text }]}>
                    {rl}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  {cols.map((_, ci) => {
                    const idx = ri * 100 + ci;
                    return (
                      <View
                        key={ci}
                        style={[
                          styles.cgtDataCell,
                          {
                            flex: 1,
                            borderLeftWidth: ci > 0 ? 1 : 0,
                            borderLeftColor: underlineColor,
                          },
                        ]}
                      >
                        <TextInput
                          style={[styles.cgtDataInput, { color: colors.text }]}
                          value={data[idx] || ""}
                          onChangeText={(t) => setVal(idx, t)}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      );
    }

    // 👇 Naya: colored banner + M T W T F S S circle-tracker lines (Skills section)
    case "skillTrackerBlock":
      const dayLetters = ["M", "T", "W", "T", "F", "S", "S"];
      const lineCount = section.count || 3;
      const blockColor = section.accentColor || accentColor;
      return (
        <View style={styles.skillBlockWrap}>
          <View style={[styles.skillBanner, { backgroundColor: blockColor }]}>
            <Text style={styles.skillBannerTitle} numberOfLines={1}>
              {section.title}
            </Text>
            <View style={styles.skillBannerDays}>
              {dayLetters.map((d, i) => (
                <Text key={i} style={styles.skillBannerDayText}>
                  {d}
                </Text>
              ))}
            </View>
          </View>
          {Array.from({ length: lineCount }).map((_, row) => (
            <View key={row} style={styles.skillLineRow}>
              <TextInput
                style={[
                  styles.skillLineInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[200 + row] || ""}
                onChangeText={(t) => setVal(200 + row, t)}
              />
              <View style={styles.skillLineCircles}>
                {dayLetters.map((_, di) => {
                  const idx = row * 10 + di;
                  return (
                    <TouchableOpacity
                      key={di}
                      onPress={() => setVal(idx, data[idx] === "1" ? "" : "1")}
                      style={[
                        styles.skillCircle,
                        {
                          borderColor: blockColor,
                          backgroundColor:
                            data[idx] === "1" ? blockColor : "transparent",
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      );

    // 👇 Naya: inline checkbox-left + label chips on one line (e.g. "Shift: Morning / Afternoon / Evening")
    case "checkboxInlineRow":
      return (
        <View style={[cardStyle, styles.checkboxInlineWrap]}>
          {section.title && (
            <Text style={[styles.checkboxInlinePrefix, { color: colors.text }]}>
              {section.title}
            </Text>
          )}
          {(section.items || []).map((label, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setVal(i, data[i] === "1" ? "" : "1")}
              style={styles.checkboxInlineItem}
            >
              <View
                style={[
                  styles.checkboxRowBox,
                  {
                    borderColor: accentColor,
                    backgroundColor:
                      data[i] === "1" ? accentColor : "transparent",
                  },
                ]}
              />
              <Text
                style={[
                  styles.checkboxRowLabel,
                  { color: colors.text, marginLeft: 6 },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );

    // 👇 Naya: ek row-slot ke andar multiple sections vertically stack karna (e.g. Notes + Daily Summary + fields)
    case "group":
      return (
        <View>
          {(section.children || []).map((child, i) => (
            <SectionRenderer
              key={i}
              section={child}
              accentColor={accentColor}
              values={values}
              onChange={onChange}
              fieldKey={`${fieldKey}_g${i}`}
              themeStyle={themeStyle}
            />
          ))}
        </View>
      );

    // 👇 Naya: do sections side-by-side rakhne ke liye generic wrapper
    case "row":
      return (
        <View
          style={[
            cardStyle,
            {
              flexDirection: "row",
              gap: 12,
              padding: 0,
              backgroundColor: "transparent",
              borderWidth: 0,
            },
          ]}
        >
          {(section.children || []).map((child, i) => (
            <View key={i} style={{ flex: 1 }}>
              <SectionRenderer
                section={child}
                accentColor={accentColor}
                values={values}
                onChange={onChange}
                fieldKey={`${fieldKey}_r${i}`}
                themeStyle={themeStyle}
              />
            </View>
          ))}
        </View>
      );

    case "textarea":
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag
              title={section.title}
              accentColor={accentColor}
              tagStyle={ts.tagStyle}
            />
          )}
          <TextInput
            style={[
              styles.textarea,
              {
                borderColor: ts.sectionBorderColor || accentColor + "55",
                color: colors.text,
                backgroundColor: colors.background + "aa",
              },
            ]}
            value={data[0] || ""}
            onChangeText={(t) => setVal(0, t)}
            multiline
            placeholder="Write here..."
            placeholderTextColor={colors.placeholder}
          />
        </View>
      );

    case "hourGrid":
      return (
        <View style={cardStyle}>
          <SectionTag
            title={section.title || "Schedule"}
            accentColor={accentColor}
            tagStyle={ts.tagStyle}
          />
          {(section.hours || []).map((h, i) => (
            <View key={h} style={styles.hourRow}>
              <Text
                style={[
                  styles.hourLabel,
                  { color: accentColor, fontWeight: "700" },
                ]}
              >
                {h}
              </Text>
              <TextInput
                style={[
                  styles.hourInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[i] || ""}
                onChangeText={(t) => setVal(i, t)}
              />
            </View>
          ))}
        </View>
      );

    case "monthCalendar": {
      const today = new Date();
      return (
        <View style={cardStyle}>
          <MonthCalendarBlock
            startDay={section.startDay || "mon"}
            decoration={section.decoration || "minimal"}
            accentColor={accentColor}
            year={today.getFullYear()}
            month={today.getMonth()}
            values={Object.fromEntries(
              data
                .map((v, i) => [`${today.getMonth()}_${i}`, v])
                .filter(([, v]) => v),
            )}
            onChange={(dayKey, text) => {
              const dayNum = parseInt(dayKey.split("_")[1], 10);
              setVal(dayNum, text);
            }}
          />
        </View>
      );
    }

    case "iconRow":
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag
              title={section.title}
              accentColor={accentColor}
              tagStyle={ts.tagStyle}
            />
          )}
          <View style={styles.iconRowWrap}>
            {(section.icons || []).map((icon, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setVal(i, data[i] === "1" ? "" : "1")}
                style={[
                  styles.iconCircle,
                  {
                    borderColor: accentColor,
                    backgroundColor:
                      data[i] === "1" ? accentColor + "30" : "transparent",
                    opacity: data[i] === "1" ? 1 : 0.45,
                  },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{icon}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    case "monthGridTracker": {
      const totalDays = section.totalDays || 31;
      const hoursCount = section.hoursCount || 12;
      const splitAt = section.splitAt || Math.ceil(totalDays / 2);

      const renderHalf = (startDay: number, endDay: number) => (
        <View style={styles.mgtHalf}>
          {/* Header: DAY | HOUR (1..N) | NOTES */}
          <View
            style={[
              styles.mgtRow,
              { borderBottomWidth: 1, borderBottomColor: underlineColor },
            ]}
          >
            <View style={styles.mgtDayCell}>
              <Text style={styles.mgtHeaderText}>DAY</Text>
            </View>
            {Array.from({ length: hoursCount }).map((_, h) => (
              <View
                key={h}
                style={[
                  styles.mgtHourCell,
                  { borderLeftWidth: 1, borderLeftColor: underlineColor },
                ]}
              >
                <Text style={styles.mgtHourHeaderText}>{h + 1}</Text>
              </View>
            ))}
            <View
              style={[
                styles.mgtNotesCell,
                { borderLeftWidth: 1, borderLeftColor: underlineColor },
              ]}
            >
              <Text style={styles.mgtHeaderText}>NOTES</Text>
            </View>
          </View>
          {/* Data rows */}
          {Array.from({ length: endDay - startDay + 1 }).map((_, i) => {
            const day = startDay + i;
            const notesIdx = 1000 + day;
            return (
              <View
                key={day}
                style={[
                  styles.mgtRow,
                  { borderBottomWidth: 1, borderBottomColor: underlineColor },
                ]}
              >
                <View style={styles.mgtDayCell}>
                  <Text style={[styles.mgtDayText, { color: colors.text }]}>
                    {day}
                  </Text>
                </View>
                {Array.from({ length: hoursCount }).map((_, h) => {
                  const idx = day * 20 + h;
                  return (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setVal(idx, data[idx] === "1" ? "" : "1")}
                      style={[
                        styles.mgtHourCell,
                        {
                          borderLeftWidth: 1,
                          borderLeftColor: underlineColor,
                          backgroundColor:
                            data[idx] === "1"
                              ? accentColor + "50"
                              : "transparent",
                        },
                      ]}
                    />
                  );
                })}
                <View
                  style={[
                    styles.mgtNotesCell,
                    { borderLeftWidth: 1, borderLeftColor: underlineColor },
                  ]}
                >
                  <TextInput
                    style={[styles.mgtNotesInput, { color: colors.text }]}
                    value={data[notesIdx] || ""}
                    onChangeText={(t) => setVal(notesIdx, t)}
                  />
                </View>
              </View>
            );
          })}
        </View>
      );

      return (
        <View
          style={[
            cardStyle,
            {
              padding: 0,
              backgroundColor: "transparent",
              borderWidth: 0,
              flexDirection: "row",
              gap: 12,
            },
          ]}
        >
          <View style={[styles.mgtWrap, { borderColor: underlineColor }]}>
            {renderHalf(1, splitAt)}
          </View>
          <View style={[styles.mgtWrap, { borderColor: underlineColor }]}>
            {renderHalf(splitAt + 1, totalDays)}
          </View>
        </View>
      );
    }
    case "habitGrid":
      return (
        <View style={cardStyle}>
          {section.title && (
            <SectionTag
              title={section.title}
              accentColor={accentColor}
              tagStyle={ts.tagStyle}
            />
          )}
          {Array.from({ length: 4 }).map((_, row) => (
            <View
              key={row}
              style={[
                styles.habitRow,
                {
                  backgroundColor:
                    row % 2 === 0 ? accentColor + "10" : "transparent",
                  borderRadius: 6,
                  padding: 4,
                },
              ]}
            >
              <TextInput
                style={[
                  styles.habitNameInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[row] || ""}
                onChangeText={(t) => setVal(row, t)}
                placeholder="Habit"
                placeholderTextColor={colors.placeholder}
              />
              <View style={styles.habitDaysRow}>
                {DAYS.map((d, di) => (
                  <TouchableOpacity
                    key={di}
                    onPress={() =>
                      setVal(
                        100 + row * 10 + di,
                        data[100 + row * 10 + di] === "1" ? "" : "1",
                      )
                    }
                    style={[
                      styles.habitCell,
                      {
                        borderColor: accentColor,
                        backgroundColor:
                          data[100 + row * 10 + di] === "1"
                            ? accentColor
                            : "transparent",
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    case "timePeriodBlock":
      return (
        <View style={[styles.timePeriodRow]}>
          <View style={styles.timePeriodLeft}>
            {section.icons && section.icons[0] && (
              <Text style={{ fontSize: 16, marginBottom: 4 }}>
                {section.icons[0]}
              </Text>
            )}
            <Text style={[styles.timePeriodTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            {section.caption && (
              <Text
                style={[styles.timePeriodCaption, { color: colors.subText }]}
              >
                {section.caption}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            {(section.hours || []).map((h, i) => (
              <View key={i} style={styles.timePeriodHourRow}>
                <Text
                  style={[styles.timePeriodHourLabel, { color: colors.text }]}
                >
                  {h}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setVal(50 + i, data[50 + i] === "1" ? "" : "1")
                  }
                  style={[
                    styles.checkboxRowBox,
                    {
                      borderColor: accentColor,
                      backgroundColor:
                        data[50 + i] === "1" ? accentColor : "transparent",
                    },
                  ]}
                />
                <TextInput
                  style={[
                    styles.timePeriodTaskInput,
                    { borderColor: underlineColor, color: colors.text },
                  ]}
                  value={data[i] || ""}
                  onChangeText={(t) => setVal(i, t)}
                />
              </View>
            ))}
          </View>
        </View>
      );

      case "checklistLine":
      return (
        <View style={cardStyle}>
          {section.title && (
            section.hideBullet ? (
              <Text style={[styles.plainListHeading, { color: accentColor }]}>
                {section.title}
              </Text>
            ) : (
              <SectionTag
                title={section.title}
                accentColor={accentColor}
                tagStyle={ts.tagStyle}
              />
            )
          )}
          {Array.from({ length: section.count || 3 }).map((_, i) => (
            <View key={i} style={styles.checklistRow}>
              {!section.hideBullet && (
                <BulletShape shape={ts.bulletShape} color={accentColor} />
              )}
              <TextInput
                style={[
                  styles.checklistInput,
                  { borderColor: underlineColor, color: colors.text },
                ]}
                value={data[i] || ""}
                onChangeText={(t) => setVal(i, t)}
                placeholderTextColor={colors.placeholder}
              />
            </View>
          ))}
        </View>
      );
    // 👇 Naya: colored "BRAIN BREAK" banner with time label + note line (e.g. mid-day break box)
    case "brainBreak":
      return (
        <View style={[styles.brainBreakWrap, { borderColor: accentColor }]}>
          <View
            style={[styles.brainBreakTag, { backgroundColor: accentColor }]}
          >
            <Text style={styles.brainBreakTagText}>
              {section.title || "BRAIN BREAK"}
            </Text>
          </View>
          <View style={styles.brainBreakBody}>
            <Text style={[styles.brainBreakTimeLabel, { color: colors.text }]}>
              Time
            </Text>
            <Text style={[styles.brainBreakTimeValue, { color: colors.text }]}>
              {section.caption}
            </Text>
            <TextInput
              style={[
                styles.brainBreakNoteInput,
                { borderColor: underlineColor, color: colors.text },
              ]}
              value={data[0] || ""}
              onChangeText={(t) => setVal(0, t)}
            />
          </View>
        </View>
      );

    default:
      return null;
  }
}

const styles = StyleSheet.create({
  singleLineInput: {
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },

  checklistRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  checklistInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 13,
    paddingVertical: 4,
  },

  textarea: {
    borderWidth: 1.5,
    borderRadius: 8,
    minHeight: 80,
    padding: 10,
    fontSize: 13,
    textAlignVertical: "top",
  },

  dayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  hourRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  hourLabel: { width: 52, fontSize: 11 },
  hourInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 12,
    paddingVertical: 3,
  },

  iconRowWrap: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },

  habitRow: { marginBottom: 8 },
  habitNameInput: {
    borderBottomWidth: 1,
    fontSize: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  habitDaysRow: { flexDirection: "row", gap: 5 },
  habitCell: { width: 24, height: 24, borderWidth: 1.5, borderRadius: 5 },

  // ── checklistGrid styles (Morning Check-In style 2-column boxes) ──
  gridWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridBox: { width: "48.5%", padding: 12, marginBottom: 14 },
  gridBoxTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  gridChecklistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkboxSquare: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1.5,
    marginRight: 8,
  },
  gridChecklistInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 11,
    paddingVertical: 2,
  },

  // ── shared plain title (Reselling Planner style — centered bold, no colored pill) ──
  plainTitle: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ── text (inline label + underline field) ──
  textInlineRow: { flexDirection: "row", alignItems: "flex-end" },
  textInlineLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    marginRight: 8,
    flexShrink: 0,
  },
  textInlineInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 12.5,
    paddingVertical: 3,
  },

  // ── labeledLines ──
  labeledLineRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  labeledLineLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 6,
    flexShrink: 0,
  },
  labeledLineInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 12,
    paddingVertical: 3,
  },

  // ── checkboxRow ──
  checkboxRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  checkboxRowItem: { alignItems: "center", width: "31%", marginBottom: 12 },
  checkboxRowBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    marginBottom: 6,
  },
  checkboxRowLabel: { fontSize: 11, fontWeight: "600", textAlign: "center" },

  // ── checkboxInlineRow (checkbox left, label right, all inline on one row) ──
  checkboxInlineWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxInlinePrefix: { fontSize: 12.5, fontWeight: "700", marginRight: 10 },
  checkboxInlineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    marginBottom: 6,
  },

  // ── sectionBanner ──
  sectionBanner: {
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
    marginTop: 4,
  },
  sectionBannerText: {
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },

  // ── table ──
  tableCaption: { fontSize: 11.5, fontWeight: "600", marginBottom: 6 },
  tableWrap: { borderWidth: 1, borderRadius: 4, overflow: "hidden" },
  tableRow: { flexDirection: "row" },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  tableHeaderText: { fontSize: 10.5, fontWeight: "700", textAlign: "center" },
  tableBodyCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minHeight: 34,
  },
  tableCellInput: { fontSize: 11, textAlign: "center" },

  // ── checklistWithNotes ──
  checklistWithNotesRow: { flexDirection: "row", gap: 10 },
  checklistWithNotesItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  notesBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    minHeight: 90,
  },
  notesBoxLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "right",
  },
  notesBoxInput: { flex: 1, fontSize: 11, textAlignVertical: "top" },
  timePeriodRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  timePeriodLeft: { width: 78 },
  timePeriodTitle: { fontSize: 11.5, fontWeight: "800" },
  timePeriodCaption: { fontSize: 9.5, marginTop: 2 },
  timePeriodHourRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  timePeriodHourLabel: { width: 56, fontSize: 10.5, fontWeight: "600" },
  timePeriodTaskInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 11,
    paddingVertical: 3,
  },

  // ── brainBreak ──
  brainBreakWrap: {
    flexDirection: "row",
    borderWidth: 1.5,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
    alignItems: "stretch",
  },
  brainBreakTag: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  brainBreakTagText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "800",
    textAlign: "center",
  },
  brainBreakBody: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  brainBreakTimeLabel: { fontSize: 10, fontWeight: "700" },
  brainBreakTimeValue: { fontSize: 10.5 },
  brainBreakNoteInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 10.5,
    paddingVertical: 2,
  },
  // ── colorGroupTable ──
  cgtWrap: { borderWidth: 1, borderRadius: 6, overflow: "hidden" },
  cgtRow: { flexDirection: "row" },
  cgtDayHeaderCell: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  cgtDayHeaderText: { fontSize: 10, fontWeight: "800", color: "#fff" },
  cgtGroupHeaderCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderLeftWidth: 1,
    borderLeftColor: "#fff",
  },
  cgtGroupHeaderText: { fontSize: 10, fontWeight: "800" },
  cgtColHeaderCell: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderLeftColor: "#fff",
  },
  cgtColHeaderText: { fontSize: 8, fontWeight: "700", textAlign: "center" },
  cgtDayCell: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  cgtDayCellText: { fontSize: 11, fontWeight: "700" },
  cgtDataCell: {
    minHeight: 26,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  cgtDataInput: { fontSize: 10, textAlign: "center" },

  // ── skillTrackerBlock ──
  skillBlockWrap: { flex: 1, marginBottom: 14 },
  skillBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  skillBannerTitle: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1a1a1a",
    flexShrink: 1,
  },
  skillBannerDays: { flexDirection: "row", gap: 6 },
  skillBannerDayText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1a1a1a",
    width: 12,
    textAlign: "center",
  },
  skillLineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  skillLineInput: {
    flex: 1,
    borderBottomWidth: 1,
    fontSize: 10,
    paddingVertical: 2,
  },
  skillLineCircles: { flexDirection: "row", gap: 6 },
  skillCircle: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.4 },
  // ── monthGridTracker ──
  mgtWrap: { flex: 1, borderWidth: 1, borderRadius: 4, overflow: "hidden" },
  mgtHalf: {},
  mgtRow: { flexDirection: "row", alignItems: "stretch" },
  mgtDayCell: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  mgtHeaderText: { fontSize: 7.5, fontWeight: "800" },
  mgtDayText: { fontSize: 9, fontWeight: "700" },
  mgtHourCell: {
    width: 14,
    minHeight: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  mgtHourHeaderText: { fontSize: 7 },
  mgtNotesCell: {
    flex: 1,
    minWidth: 40,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  mgtNotesInput: { fontSize: 8, paddingVertical: 2 },
  plainListHeading: { fontSize: 13, fontWeight: "800", marginBottom: 10 },
});
