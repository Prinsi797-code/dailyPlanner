import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  PanResponder,
  Image,
  Alert,
  LayoutAnimation,
  UIManager,
  Animated,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";
import { useTheme } from "../theme/ThemeContext";
import { saveCalendarNote, getAllCalendarNotes } from "./CalendarScreen";
import { launchImageLibrary } from "react-native-image-picker";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import RNFS from "react-native-fs";
import alarmIcon from "../assets/icons/alarm.png";
import clipIcon from "../assets/icons/clip.png";
import letterIcon from "../assets/icons/letter.png";
import colorWheelIcon from "../assets/icons/color.png";
import notifee, { TriggerType, AndroidImportance } from "@notifee/react-native";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Share from "react-native-share";
import { useLayout, LineType } from "../theme/LayoutContext";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = StackScreenProps<RootStackParamList, "CalendarNote">;

const FS = 15;
const LH = 32;
const LINE_COUNT = 30;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const COLOR_OPTIONS: { name: string; value: string | null }[] = [
  { name: "Default", value: null },
  { name: "Blue", value: "#2979FF" },
  { name: "Gray", value: "#9E9E9E" },
  { name: "Red", value: "#E53935" },
  { name: "Orange", value: "#FB8C00" },
  { name: "Yellow", value: "#FDD835" },
  { name: "Green", value: "#43A047" },
  { name: "Purple", value: "#8E24AA" },
  { name: "Pink", value: "#F06292" },
];
function SheetModal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(400)).current;
  const [mounted, setMounted] = useState(visible);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      fade.setValue(0);
      slide.setValue(400);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 400,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.4)", opacity: fade },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={onClose}
            />
          </Animated.View>
          <Animated.View style={{ transform: [{ translateY: slide }] }}>
            {children}
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type Run = {
  id: string;
  text: string;
  color: string;
  bg?: string | null;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: Align;
};
type TBlock = { id: string; kind: "text"; runs: Run[] };
type CBlock = {
  id: string;
  kind: "check";
  text: string;
  checked: boolean;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: Align;
};
type LBlock = {
  id: string;
  kind: "list";
  listType: "ordered" | "bullet";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: Align;
};
type ABlock = {
  id: string;
  kind: "attachment";
  uri: string;
  name: string;
  mimeType?: string;
};
type Block = TBlock | CBlock | LBlock | ABlock;

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

type Align = "left" | "center" | "right" | "justify";

function orderedNumber(blocks: Block[], id: string): number {
  const idx = blocks.findIndex((b) => b.id === id);
  let n = 0;
  for (let i = idx; i >= 0; i--) {
    const b = blocks[i];
    if (b.kind === "list" && b.listType === "ordered") n++;
    else break;
  }
  return n;
}

function formatReminder(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m.toString().padStart(2, "0");
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}, ${h}:${mm} ${ampm}`;
}

function RuleSegments({
  type,
  color,
  width,
}: {
  type: LineType;
  color: string;
  width: number;
}) {
  if (width <= 0) return null;

  if (type === "dot") {
    const size = 2.4,
      gap = 4.6;
    const count = Math.max(1, Math.floor(width / (size + gap)));
    return (
      <View style={{ flexDirection: "row", overflow: "hidden" }}>
        {Array.from({ length: count }).map((_, i) => (
          <View
            key={i}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
              marginRight: gap,
            }}
          />
        ))}
      </View>
    );
  }

  if (type === "dash") {
    const dashWidth = 7,
      gap = 5;
    const count = Math.max(1, Math.floor(width / (dashWidth + gap)));
    return (
      <View style={{ flexDirection: "row", overflow: "hidden" }}>
        {Array.from({ length: count }).map((_, i) => (
          <View
            key={i}
            style={{
              width: dashWidth,
              height: 1,
              backgroundColor: color,
              marginRight: gap,
            }}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={{
        width,
        height: type === "round" ? 2 : 1,
        borderRadius: type === "round" ? 2 : 1,
        backgroundColor: color,
      }}
    />
  );
}

export default function CalendarNoteScreen({ route, navigation }: Props) {
  const { dateKey, dateLabel } = route.params;
  const { colors, isDark } = useTheme();
  const { lineType } = useLayout();
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: "b0",
      kind: "text",
      runs: [{ id: uid(), text: "", color: isDark ? "#FFFFFF" : "#000000" }],
    },
  ]);
  const [txtColor, setTxtColor] = useState(isDark ? "#FFFFFF" : "#000000");
  const [userPickedColor, setUserPickedColor] = useState(false);
  const [activeTextBlockId, setActiveTextBlockId] = useState<string | null>(
    "b0",
  );
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [align, setAlign] = useState<Align>("left");
  const [showCP, setShowCP] = useState(false);
  const [showTextOptions, setShowTextOptions] = useState(false);

  const [reminderAt, setReminderAt] = useState<Date | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const [isLocked, setIsLocked] = useState(false);
  const [passwordHash, setPasswordHash] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockPwd, setLockPwd] = useState("");
  const [lockPwdConfirm, setLockPwdConfirm] = useState("");
  const [lockError, setLockError] = useState("");
  const [lockMode, setLockMode] = useState<"set" | "remove">("set");
  const [contentHeight, setContentHeight] = useState(0);
  const lineCount = Math.max(LINE_COUNT, Math.ceil(contentHeight / LH) + 4);

  const [showUnlockGate, setShowUnlockGate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [runWidths, setRunWidths] = useState<Record<string, number>>({});
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [unlockPwd, setUnlockPwd] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [pageWidth, setPageWidth] = useState(0);

  const HIGHLIGHT_OPTIONS: { name: string; value: string | null }[] = [
    { name: "None", value: null },
    { name: "Pink", value: "#FADADD" },
    { name: "Yellow", value: "#FFF3B0" },
    { name: "Green", value: "#C8F0C8" },
    { name: "Blue", value: "#CDE7FF" },
    { name: "Purple", value: "#E6D6FA" },
    { name: "Orange", value: "#FFE0C2" },
  ];

  const [showHL, setShowHL] = useState(false);
  const [hlColor, setHlColor] = useState<string | null>(null);

  const refs = useRef<Record<string, TextInput | null>>({});
  const scrollRef = useRef<ScrollView>(null);

  function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString(36);
  }

  const applyHighlightChange = (bg: string | null) => {
    const targetId =
      activeTextBlockId &&
      blocks.some((b) => b.id === activeTextBlockId && b.kind === "text")
        ? activeTextBlockId
        : getLastTextBlockId();
    if (!targetId) return;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== targetId || b.kind !== "text") return b;
        const tb = b as TBlock;
        // Poore block ke sab runs pe bg apply karo — sirf active run pe nahi
        return {
          ...tb,
          runs: tb.runs.map((r) => ({ ...r, bg })),
        };
      }),
    );
  };

  const selectHighlight = (value: string | null) => {
    setHlColor(value);
    applyHighlightChange(value);
    setShowHL(false);
  };

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  useEffect(() => {
    if (!userPickedColor) setTxtColor(isDark ? "#FFFFFF" : "#000000");
  }, [isDark]);

  useEffect(() => {
    getAllCalendarNotes().then((all) => {
      if (!all[dateKey]) return;
      try {
        const p = JSON.parse(all[dateKey]);
        const applyColor = (saved?: string) => {
          const isDefaultBW =
            !saved ||
            saved.toLowerCase() === "#000000" ||
            saved.toLowerCase() === "#ffffff";
          if (isDefaultBW) {
            setTxtColor(isDark ? "#FFFFFF" : "#000000");
            setUserPickedColor(false);
          } else {
            setTxtColor(saved!);
            setUserPickedColor(true);
          }
        };

        const fallbackColor = () =>
          p.txtColor || p.textColor || (isDark ? "#FFFFFF" : "#000000");

        const migrateBlocks = (rawBlocks: any[], fallback: string): Block[] =>
          (rawBlocks || []).map((b: any) => {
            if (b.kind === "text") {
              if (Array.isArray(b.runs) && b.runs.length) {
                return { id: b.id, kind: "text", runs: b.runs } as TBlock;
              }
              return {
                id: b.id,
                kind: "text",
                runs: [{ id: uid(), text: b.value ?? "", color: fallback }],
              } as TBlock;
            }
            return b as Block;
          });

        if (p.__type === "blocksV2") {
          const migrated = migrateBlocks(p.blocks, fallbackColor());
          setBlocks(migrated);
          const firstText = migrated.find((b) => b.kind === "text");
          setActiveTextBlockId(firstText ? firstText.id : null);
          applyColor(p.txtColor);
          setBold(p.bold || false);
          setItalic(p.italic || false);
          setUnderline(p.underline || false);
          setStrike(p.strike || false);
          setAlign(p.align || "left");
          setReminderAt(p.reminderAt ? new Date(p.reminderAt) : null);
          if (p.locked && p.passwordHash) {
            setIsLocked(true);
            setPasswordHash(p.passwordHash);
            setShowUnlockGate(true);
          }
        } else if (p.__type === "blocksNote") {
          const fb = fallbackColor();
          const m: Block[] = (p.blocks || []).map((b: any) =>
            b.type === "check"
              ? { id: b.id, kind: "check", text: b.text, checked: b.checked }
              : {
                  id: b.id,
                  kind: "text",
                  runs: [{ id: uid(), text: b.value ?? "", color: fb }],
                },
          );
          const finalBlocks = m.length
            ? m
            : [
                {
                  id: "b0",
                  kind: "text",
                  runs: [{ id: uid(), text: "", color: fb }],
                } as Block,
              ];
          setBlocks(finalBlocks);
          const firstText = finalBlocks.find((b) => b.kind === "text");
          setActiveTextBlockId(firstText ? firstText.id : null);
          applyColor(p.textColor);
        } else if (p.__type === "richNote") {
          const fb = fallbackColor();
          const m: Block[] = [
            {
              id: uid(),
              kind: "text",
              runs: [{ id: uid(), text: p.text || "", color: fb }],
            },
          ];
          (p.checklist || []).forEach((it: any) =>
            m.push({
              id: it.id,
              kind: "check",
              text: it.text,
              checked: it.checked,
            }),
          );
          setBlocks(m);
          setActiveTextBlockId(m[0].id);
          applyColor(p.textColor);
        } else {
          const fb = isDark ? "#FFFFFF" : "#000000";
          const bId = uid();
          setBlocks([
            {
              id: bId,
              kind: "text",
              runs: [{ id: uid(), text: all[dateKey], color: fb }],
            },
          ]);
          setActiveTextBlockId(bId);
        }
      } catch {
        const fb = isDark ? "#FFFFFF" : "#000000";
        const bId = uid();
        setBlocks([
          {
            id: bId,
            kind: "text",
            runs: [{ id: uid(), text: all[dateKey], color: fb }],
          },
        ]);
        setActiveTextBlockId(bId);
      }
    });
  }, [dateKey]);

  const save = async () => {
    await saveCalendarNote(
      dateKey,
      JSON.stringify({
        __type: "blocksV2",
        blocks,
        txtColor,
        bold,
        italic,
        underline,
        strike,
        align,
        reminderAt: reminderAt ? reminderAt.getTime() : null,
        locked: isLocked,
        passwordHash,
      }),
    );
    navigation.goBack();
  };

  const openLockModal = () => {
    setLockPwd("");
    setLockPwdConfirm("");
    setLockError("");
    setLockMode(isLocked ? "remove" : "set");
    setShowLockModal(true);
  };

  const confirmSetLock = () => {
    if (lockMode === "remove") {
      if (simpleHash(lockPwd) !== passwordHash) {
        setLockError("Incorrect password");
        return;
      }
      setIsLocked(false);
      setPasswordHash(null);
      setShowLockModal(false);
      return;
    }
    if (lockPwd.length < 4) {
      setLockError("Password must be at least 4 characters");
      return;
    }
    if (lockPwd !== lockPwdConfirm) {
      setLockError("Passwords do not match");
      return;
    }
    setIsLocked(true);
    setPasswordHash(simpleHash(lockPwd));
    setShowLockModal(false);
  };

  const submitUnlock = () => {
    if (simpleHash(unlockPwd) === passwordHash) {
      setShowUnlockGate(false);
      setUnlockPwd("");
      setUnlockError("");
    } else {
      setUnlockError("Incorrect password");
    }
  };

  const hexToRgb01 = (hex: string) => {
    const h = (hex || "#000000").replace("#", "");
    const full =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;
    const r = parseInt(full.slice(0, 2), 16) / 255;
    const g = parseInt(full.slice(2, 4), 16) / 255;
    const b = parseInt(full.slice(4, 6), 16) / 255;
    return rgb(isNaN(r) ? 0 : r, isNaN(g) ? 0 : g, isNaN(b) ? 0 : b);
  };

  const generatePdf = async (): Promise<string | null> => {
    try {
      setGeneratingPdf(true);
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pW = 595,
        pH = 842,
        margin = 40,
        lh = 22;
      let page = pdfDoc.addPage([pW, pH]);
      let y = pH - margin;

      const drawLine = (
        text: string,
        size = 12,
        useFont = font,
        color = rgb(0, 0, 0),
      ) => {
        if (y < margin + lh) {
          page = pdfDoc.addPage([pW, pH]);
          y = pH - margin;
          9;
        }
        page.drawText(text, { x: margin, y, size, font: useFont, color });
        y -= lh;
      };

      drawLine(sanitizePdfText(dateLabel), 11, font, rgb(0.5, 0.5, 0.5));

      if (reminderAt) {
        drawLine(
          `Reminder: ${sanitizePdfText(formatReminder(reminderAt))}`,
          10,
          font,
          rgb(0.7, 0.5, 0.1),
        );
      }
      y -= 8;

      const textColor = hexToRgb01(txtColor);
      const bodyFont = bold ? fontBold : font;

      const textBlocks = blocks.filter(
        (b) => b.kind === "text" || b.kind === "check" || b.kind === "list",
      );
      const imageBlocks = blocks.filter(
        (b) => b.kind === "attachment",
      ) as ABlock[];

      for (const block of textBlocks) {
        if (block.kind === "text") {
          const tb = block as TBlock;
          const combined = tb.runs.map((r) => r.text).join("");
          if (combined.trim()) {
            let cursorX = margin;
            for (const run of tb.runs) {
              if (!run.text) continue;
              const runColor = hexToRgb01(run.color);
              const cleanRunText = stripControlCharsKeepNewline(run.text);
              const safeRunText = safeEncode(bodyFont, cleanRunText);
              const subLines = safeRunText.split("\n");

              for (let li = 0; li < subLines.length; li++) {
                const words = subLines[li].split(" ");
                for (let wi = 0; wi < words.length; wi++) {
                  const isLast = wi === words.length - 1;
                  const word = words[wi] + (isLast ? "" : " ");
                  if (!word) continue;
                  const wordWidth = bodyFont.widthOfTextAtSize(word, 12);
                  if (cursorX + wordWidth > pW - margin) {
                    if (y < margin + lh) {
                      page = pdfDoc.addPage([pW, pH]);
                      y = pH - margin;
                    } else {
                      y -= lh;
                    }
                    cursorX = margin;
                  }
                  page.drawText(word, {
                    x: cursorX,
                    y,
                    size: 12,
                    font: bodyFont,
                    color: runColor,
                  });
                  cursorX += wordWidth;
                }
                if (li < subLines.length - 1) {
                  if (y < margin + lh) {
                    page = pdfDoc.addPage([pW, pH]);
                    y = pH - margin;
                  } else {
                    y -= lh;
                  }
                  cursorX = margin;
                }
              }
            }
            if (y < margin + lh) {
              page = pdfDoc.addPage([pW, pH]);
              y = pH - margin;
            } else {
              y -= lh;
            }
          }
        }

        if (block.kind === "check") {
          drawLine(
            `${block.checked ? "[x]" : "[ ]"} ${safeEncode(font, sanitizePdfText(block.text))}`,
            12,
            font,
            textColor,
          );
        }

        if (block.kind === "list") {
          const marker =
            block.listType === "ordered"
              ? `${orderedNumber(blocks, block.id)}.`
              : "-";
          drawLine(
            `${marker} ${safeEncode(font, sanitizePdfText(block.text))}`,
            12,
            font,
            textColor,
          );
        }
      }

      if (imageBlocks.length > 0) {
        y -= 10;
        drawLine("— Attachments —", 10, font, rgb(0.6, 0.6, 0.6));
        y -= 6;

        for (const block of imageBlocks) {
          const isImg = !!block.mimeType?.startsWith("image/");
          if (isImg) {
            try {
              const imgPath = block.uri.replace("file://", "");
              const imgBase64 = await RNFS.readFile(imgPath, "base64");

              let embeddedImg;
              if (block.mimeType?.includes("png")) {
                embeddedImg = await pdfDoc.embedPng(imgBase64);
              } else {
                embeddedImg = await pdfDoc.embedJpg(imgBase64);
              }

              const maxW = pW - margin * 2;
              const maxH = 300;
              const scaleW = maxW / embeddedImg.width;
              const scaleH = maxH / embeddedImg.height;
              const scale = Math.min(scaleW, scaleH, 1);
              const imgW = embeddedImg.width * scale;
              const imgH = embeddedImg.height * scale;

              if (y < margin + imgH + 20) {
                page = pdfDoc.addPage([pW, pH]);
                y = pH - margin;
              }

              y -= imgH;
              page.drawImage(embeddedImg, {
                x: margin,
                y,
                width: imgW,
                height: imgH,
              });
              y -= 20;
            } catch {
              drawLine(
                `[Image] ${safeEncode(font, sanitizePdfText(block.name))}`,
                11,
                font,
                rgb(0.4, 0.4, 0.4),
              );
            }
          } else {
            drawLine(
              `[Attachment] ${safeEncode(font, sanitizePdfText(block.name))}`,
              11,
              font,
              rgb(0.4, 0.4, 0.4),
            );
          }
        }
      }

      const pdfBytes = await pdfDoc.saveAsBase64();
      const path = `${RNFS.DocumentDirectoryPath}/note_${dateKey}.pdf`;
      await RNFS.writeFile(path, pdfBytes, "base64");
      setGeneratingPdf(false);
      return path;
    } catch (e: any) {
      setGeneratingPdf(false);
      Alert.alert("PDF Error", e?.message || "Failed to generate PDF");
      return null;
    }
  };

  const applyRunFormat = (patch: Partial<Run>) => {
    const targetId = activeTextBlockId ?? blocks[blocks.length - 1]?.id;
    if (!targetId) return;

    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== targetId) return b;

        if (b.kind === "text") {
          const tb = b as TBlock;
          const last = tb.runs[tb.runs.length - 1];
          if (last.text === "") {
            return {
              ...tb,
              runs: [...tb.runs.slice(0, -1), { ...last, ...patch }],
            };
          }
          return {
            ...tb,
            runs: [...tb.runs, { ...last, id: uid(), text: "", ...patch }],
          };
        }

        if (b.kind === "check" || b.kind === "list") {
          return { ...b, ...patch } as Block;
        }

        return b;
      }),
    );
  };
  const handleSaveAsPdf = async () => {
    setShowMenu(false);
    const path = await generatePdf();
    if (!path) return;
    try {
      await Share.open({
        url: Platform.OS === "android" ? `file://${path}` : path,
        type: "application/pdf",
        title: dateLabel,
        failOnCancel: false,
      });
    } catch (e: any) {
      if (e?.message !== "User did not share")
        Alert.alert("Save Error", e?.message || "Failed to save PDF");
    }
  };

  const handleSharePdf = async () => {
    setShowMenu(false);
    const path = await generatePdf();
    if (!path) return;
    try {
      await Share.open({
        url: Platform.OS === "android" ? `file://${path}` : path,
        type: "application/pdf",
        title: dateLabel,
        failOnCancel: false,
      });
    } catch (e: any) {
      if (e?.message !== "User did not share")
        Alert.alert("Share Error", e?.message || "Failed to share");
    }
  };

  const focus = (id: string, ms = 0) =>
    setTimeout(() => refs.current[id]?.focus(), ms);

  const insertAfter = (afterId: string, nb: Block) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === afterId);
      const next = [...prev];
      next.splice(i + 1, 0, nb);
      return next;
    });
    if (nb.kind === "text") setActiveTextBlockId(nb.id);
    focus(nb.id);
  };

  const getLastTextBlockId = (): string | null => {
    for (let i = blocks.length - 1; i >= 0; i--) {
      if (blocks[i].kind === "text") return blocks[i].id;
    }
    return null;
  };

  const updateActiveRunText = (blockId: string, text: string) =>
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.kind !== "text") return b;
        const tb = b as TBlock;
        const runs = [...tb.runs];
        runs[runs.length - 1] = { ...runs[runs.length - 1], text };
        return { ...tb, runs };
      }),
    );

  const applyColorChange = (color: string) => {
    const targetId =
      activeTextBlockId &&
      blocks.some((b) => b.id === activeTextBlockId && b.kind === "text")
        ? activeTextBlockId
        : getLastTextBlockId();
    if (!targetId) return;

    const block = blocks.find((b) => b.id === targetId) as TBlock | undefined;
    if (!block) return;
    const last = block.runs[block.runs.length - 1];

    if (last.text === "") {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === targetId
            ? {
                ...b,
                runs: [...(b as TBlock).runs.slice(0, -1), { ...last, color }],
              }
            : b,
        ),
      );
      return;
    }

    if (last.color.toLowerCase() === color.toLowerCase()) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === targetId
          ? {
              ...(b as TBlock),
              runs: [
                ...(b as TBlock).runs,
                { ...last, id: uid(), text: "", color },
              ],
            }
          : b,
      ),
    );
  };

  const toggleBold = () => {
    const nv = !bold;
    setBold(nv);
    applyRunFormat({ bold: nv });
  };
  const toggleItalic = () => {
    const nv = !italic;
    setItalic(nv);
    applyRunFormat({ italic: nv });
  };
  const toggleUnderline = () => {
    const nv = !underline;
    setUnderline(nv);
    applyRunFormat({ underline: nv });
  };
  const toggleStrike = () => {
    const nv = !strike;
    setStrike(nv);
    applyRunFormat({ strike: nv });
  };
  const changeAlign = (a: Align) => {
    setAlign(a);
    applyRunFormat({ align: a });
  };

  const mergeBackIntoActiveRun = (blockId: string) =>
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.kind !== "text") return b;
        const tb = b as TBlock;
        if (tb.runs.length <= 1) return tb;
        return { ...tb, runs: tb.runs.slice(0, -1) };
      }),
    );

  const upd = (id: string, patch: Partial<Block>) =>
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)),
    );

  const del = (id: string) =>
    setBlocks((prev) => {
      if (prev.length === 1) return prev;
      const i = prev.findIndex((b) => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      focus(next[Math.max(0, i - 1)]?.id ?? "");
      return next;
    });

  const addCheckAtEnd = () => {
    const anchorId = activeTextBlockId ?? blocks[blocks.length - 1]?.id;
    const nb: CBlock = {
      id: uid(),
      kind: "check",
      text: "",
      checked: false,
      bold,
      italic,
      underline,
      strike,
      align,
    };
    if (anchorId) {
      insertAfter(anchorId, nb);
    } else {
      setBlocks((prev) => [...prev, nb]);
      focus(nb.id);
    }
  };

  const addListAtEnd = (listType: "ordered" | "bullet") => {
    const anchorId = activeTextBlockId ?? blocks[blocks.length - 1]?.id;
    const nb: LBlock = {
      id: uid(),
      kind: "list",
      listType,
      text: "",
      bold,
      italic,
      underline,
      strike,
      align,
    };
    if (anchorId) {
      insertAfter(anchorId, nb);
    } else {
      setBlocks((prev) => [...prev, nb]);
      focus(nb.id);
    }
    setShowTextOptions(false);
  };

  const convertToText = (id: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === id
          ? ({
              id,
              kind: "text",
              runs: [{ id: uid(), text: "", color: txtColor }],
            } as Block)
          : b,
      ),
    );
    setActiveTextBlockId(id);
    focus(id, 50);
  };

  const pickAttachment = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      selectionLimit: 1,
      quality: 0.9,
    });
    if (result.didCancel || result.errorCode) return;
    const asset = result.assets?.[0];
    if (!asset?.uri) return;
    try {
      const dir = `${RNFS.DocumentDirectoryPath}/attachments`;
      if (!(await RNFS.exists(dir))) await RNFS.mkdir(dir);
      const ext = (asset.fileName?.split(".").pop() || "jpg").toLowerCase();
      const destPath = `${dir}/${uid()}.${ext}`;
      await RNFS.copyFile(asset.uri, destPath);
      const persistentUri =
        Platform.OS === "android" ? `file://${destPath}` : destPath;
      const nb: ABlock = {
        id: uid(),
        kind: "attachment",
        uri: persistentUri,
        name: asset.fileName || "image.jpg",
        mimeType: asset.type || "image/jpeg",
      };
      setBlocks((prev) => [...prev, nb]);
    } catch (e) {
      console.log("Failed to persist attachment:", e);
    }
  };

  const ensureChannel = async () => {
    if (Platform.OS === "android") {
      await notifee.createChannel({
        id: "reminders",
        name: "Calendar Reminders",
        importance: AndroidImportance.HIGH,
      });
    }
  };

  const scheduleNotification = async (date: Date, key: string) => {
    await notifee.requestPermission();
    await ensureChannel();
    await notifee.cancelNotification(key);
    if (date.getTime() <= Date.now()) return;
    await notifee.createTriggerNotification(
      {
        id: key,
        title: "Reminder",
        body: dateLabel,
        data: { dateKey: key, dateLabel },
        android: { channelId: "reminders", pressAction: { id: "default" } },
      },
      { type: TriggerType.TIMESTAMP, timestamp: date.getTime() },
    );
  };

  const openReminderPicker = () => {
    const base = reminderAt || new Date();
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: base,
        mode: "date",
        onChange: (event, date) => {
          if (event.type !== "set" || !date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: "time",
            onChange: (event2, time) => {
              if (event2.type !== "set" || !time) return;
              const combined = new Date(date);
              combined.setHours(time.getHours(), time.getMinutes());
              setReminderAt(combined);
              scheduleNotification(combined, dateKey);
            },
          });
        },
      });
    } else {
      setTempDate(base);
      setShowReminderModal(true);
    }
  };

  const sanitizePdfText = (text: string): string =>
    (text || "")
      .replace(/\r\n|\r|\n/g, " ")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  const stripControlCharsKeepNewline = (text: string): string =>
    (text || "")
      .replace(/\r\n|\r/g, "\n")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

  const safeEncode = (font: any, text: string): string => {
    try {
      font.encodeText(text);
      return text;
    } catch {
      return Array.from(text)
        .map((ch) => {
          try {
            font.encodeText(ch);
            return ch;
          } catch {
            return "?";
          }
        })
        .join("");
    }
  };

  const clearReminder = async () => {
    await notifee.cancelNotification(dateKey);
    setReminderAt(null);
    setShowReminderModal(false);
  };

  const decoration =
    underline && strike
      ? "underline line-through"
      : underline
        ? "underline"
        : strike
          ? "line-through"
          : "none";

  const fnt = {
    fontSize: FS,
    color: txtColor,
    fontWeight: (bold ? "700" : "400") as any,
    fontStyle: (italic ? "italic" : "normal") as any,
    textDecorationLine: decoration as any,
    textAlign: align as any,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  };

  const selectColor = (value: string | null) => {
    const resolved = value === null ? (isDark ? "#FFFFFF" : "#000000") : value;
    setTxtColor(resolved);
    setUserPickedColor(value !== null);
    applyColorChange(resolved);
    setShowCP(false);
  };

  return (
    <KeyboardAvoidingView
      style={[S.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top bar */}
      <View style={[S.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            S.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={S.topCenter}>
          <Text
            style={[S.dateLabel, { color: colors.text }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {dateLabel}
          </Text>
        </View>

        <TouchableOpacity onPress={openLockModal} style={S.lockBtn}>
          <TouchableOpacity onPress={openLockModal} style={S.lockBtn}>
            <Image
              source={
                isLocked
                  ? require("../assets/icons/padlock.png")
                  : require("../assets/icons/unlock.png")
              }
              style={{ width: 22, height: 22, resizeMode: "contain" }}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowMenu(true)} style={S.menuBtn}>
          <Image
            source={require("../assets/icons/more.png")}
            style={{ width: 22, height: 22, resizeMode: "contain" }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={save}
          style={[S.saveFab, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>✓</Text>
        </TouchableOpacity>
      </View>

      {reminderAt && (
        <TouchableOpacity style={S.reminderChip} onPress={openReminderPicker}>
          <Text style={{ fontSize: 13, color: colors.primary }}>
            ⏰ {formatReminder(reminderAt)}
          </Text>
          <TouchableOpacity
            onPress={clearReminder}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text
              style={{ fontSize: 14, color: colors.subText, marginLeft: 6 }}
            >
              ✕
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* 3-dot menu */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={S.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              S.menuBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={S.menuItem}
              onPress={handleSaveAsPdf}
              disabled={generatingPdf}
            >
              <Text style={{ fontSize: 15, color: colors.text }}>
                Save as PDF
              </Text>
            </TouchableOpacity>
            <View style={[S.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={S.menuItem}
              onPress={handleSharePdf}
              disabled={generatingPdf}
            >
              <Text style={{ fontSize: 15, color: colors.text }}>Share</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Lock modal */}
      <SheetModal
        visible={showLockModal}
        onClose={() => setShowLockModal(false)}
      >
        <View style={[S.sheet, { backgroundColor: colors.card }]}>
          <View style={S.sheetHdr}>
            <Text style={[S.sheetTitle, { color: colors.text }]}>
              {lockMode === "remove" ? "Remove Lock" : "Set Password"}
            </Text>
            <TouchableOpacity onPress={() => setShowLockModal(false)}>
              <Text style={{ fontSize: 22, color: colors.subText }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, gap: 12 }}>
            <TextInput
              value={lockPwd}
              onChangeText={setLockPwd}
              placeholder={
                lockMode === "remove"
                  ? "Enter current password"
                  : "New password"
              }
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={[
                S.lockInput,
                { borderColor: colors.border, color: colors.text },
              ]}
            />
            {lockMode === "set" && (
              <TextInput
                value={lockPwdConfirm}
                onChangeText={setLockPwdConfirm}
                placeholder="Confirm password"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                style={[
                  S.lockInput,
                  { borderColor: colors.border, color: colors.text },
                ]}
              />
            )}
            {!!lockError && (
              <Text style={{ color: "#E53935", fontSize: 12 }}>
                {lockError}
              </Text>
            )}
          </View>
          {/* Lock confirm button — flat */}
          <TouchableOpacity
            onPress={confirmSetLock}
            style={[S.applyBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={S.applyTxt}>
              {lockMode === "remove" ? "Remove Lock" : "Set Lock"}
            </Text>
          </TouchableOpacity>
        </View>
      </SheetModal>

      <Modal visible={showCP} transparent animationType="fade">
        <TouchableOpacity
          style={S.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowCP(false)}
        >
          <View
            style={[
              S.colorMenuBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {COLOR_OPTIONS.map((opt) => {
              const swatch = opt.value || (isDark ? "#FFFFFF" : "#000000");
              const isSelected =
                opt.value === null
                  ? !userPickedColor
                  : userPickedColor &&
                    txtColor.toLowerCase() === opt.value.toLowerCase();
              return (
                <TouchableOpacity
                  key={opt.name}
                  style={S.colorMenuItem}
                  onPress={() => selectColor(opt.value)}
                >
                  <Text style={[S.colorCheck, { color: colors.primary }]}>
                    {isSelected ? "✓" : ""}
                  </Text>
                  <View
                    style={[
                      S.colorDot,
                      {
                        backgroundColor: swatch,
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={{ fontSize: 15, color: colors.text }}>
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Text options */}
      <SheetModal
        visible={showTextOptions}
        onClose={() => setShowTextOptions(false)}
      >
        <View style={[S.sheet, { backgroundColor: colors.card }]}>
          <View style={S.sheetHdr}>
            <Text style={[S.sheetTitle, { color: colors.text }]}>
              Text Options
            </Text>
            <TouchableOpacity onPress={() => setShowTextOptions(false)}>
              <Text style={{ fontSize: 22, color: colors.subText }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={to.row}>
            {[
              {
                label: "B",
                style: { fontWeight: "800" as any },
                active: bold,
                onPress: toggleBold,
              },
              {
                label: "U",
                style: { textDecorationLine: "underline" as any },
                active: underline,
                onPress: toggleUnderline,
              },
              {
                label: "I",
                style: { fontStyle: "italic" as any },
                active: italic,
                onPress: toggleItalic,
              },
              {
                label: "S",
                style: { textDecorationLine: "line-through" as any },
                active: strike,
                onPress: toggleStrike,
              },
            ].map(({ label, style, active, onPress }) => (
              <TouchableOpacity
                key={label}
                style={[
                  to.cell,
                  active && to.cellActive,
                  { backgroundColor: colors.border },
                ]}
                onPress={onPress}
              >
                <Text
                  style={[
                    to.icon,
                    style,
                    { color: active ? colors.primary : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={to.row}>
            {(["left", "center", "right", "justify"] as Align[]).map((a) => (
              <TouchableOpacity
                key={a}
                style={[
                  to.cell,
                  align === a && to.cellActive,
                  { backgroundColor: colors.border },
                ]}
                onPress={() => changeAlign(a)}
              >
                <Text
                  style={{
                    fontSize: 18,
                    color: align === a ? colors.primary : colors.text,
                  }}
                >
                  {a === "left"
                    ? "⇤≡"
                    : a === "center"
                      ? "≡"
                      : a === "right"
                        ? "≡⇥"
                        : "☰"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={to.row}>
            <TouchableOpacity
              style={[to.cell, { backgroundColor: colors.border }]}
              onPress={() => addListAtEnd("ordered")}
            >
              <Text style={{ fontSize: 15, color: colors.text }}>
                1.{"\n"}2.
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[to.cell, { backgroundColor: colors.border }]}
              onPress={() => addListAtEnd("bullet")}
            >
              <Text style={{ fontSize: 22, color: colors.text }}>•≡</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[to.cell, { backgroundColor: colors.border }]}
              onPress={() => {
                addCheckAtEnd();
                setShowTextOptions(false);
              }}
            >
              <Text style={{ fontSize: 18, color: colors.text }}>☑≡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SheetModal>

      {/* Reminder modal (iOS) */}
      {Platform.OS === "ios" && (
        <SheetModal
          visible={showReminderModal}
          onClose={() => setShowReminderModal(false)}
        >
          <View style={[S.sheet, { backgroundColor: colors.card }]}>
            <View style={S.sheetHdr}>
              <Text style={[S.sheetTitle, { color: colors.text }]}>
                Set Reminder
              </Text>
              <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                <Text style={{ fontSize: 22, color: colors.subText }}>✕</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={tempDate}
              mode="datetime"
              display="spinner"
              onChange={(_, d) => d && setTempDate(d)}
              style={{ alignSelf: "center" }}
            />
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: 20,
                marginTop: 10,
              }}
            >
              {reminderAt && (
                <TouchableOpacity
                  style={[
                    S.applyBtn,
                    {
                      flex: 1,
                      backgroundColor: "#e2e2e2",
                      marginHorizontal: 0,
                    },
                  ]}
                  onPress={clearReminder}
                >
                  <Text style={[S.applyTxt, { color: "#333" }]}>Clear</Text>
                </TouchableOpacity>
              )}
              {/* Reminder Save button — flat */}
              <TouchableOpacity
                style={[
                  S.applyBtn,
                  {
                    flex: 1,
                    backgroundColor: colors.primary,
                    marginHorizontal: 0,
                  },
                ]}
                onPress={() => {
                  setReminderAt(tempDate);
                  scheduleNotification(tempDate, dateKey);
                  setShowReminderModal(false);
                }}
              >
                <Text style={S.applyTxt}>Save Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SheetModal>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={S.paper}
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={S.page}
          onLayout={(e) => {
            setPageWidth(e.nativeEvent.layout.width);
            setContentHeight(e.nativeEvent.layout.height);
          }}
        >
          {Array.from({ length: lineCount }).map((_, i) => (
            <View key={i} style={[S.rule, { top: (i + 1) * LH - 1 }]}>
              <RuleSegments
                type={lineType}
                color={colors.border}
                width={pageWidth}
              />
            </View>
          ))}

          {blocks.map((block, idx) => {
            if (block.kind === "text") {
              const tb = block as TBlock;
              const frozenRuns = tb.runs.slice(0, -1);
              const activeRun = tb.runs[tb.runs.length - 1];
              const activeDecoration =
                activeRun.underline && activeRun.strike
                  ? "underline line-through"
                  : activeRun.underline
                    ? "underline"
                    : activeRun.strike
                      ? "line-through"
                      : "none";
              return (
                <View key={block.id} style={S.runRow}>
                  {frozenRuns.some((r) => r.text) && (
                    <Text
                      style={S.frozenWrap}
                      onPress={() => {
                        setActiveTextBlockId(block.id);
                        focus(block.id, 0);
                      }}
                    >
                      {frozenRuns.map((r) => {
                        const rDecoration =
                          r.underline && r.strike
                            ? "underline line-through"
                            : r.underline
                              ? "underline"
                              : r.strike
                                ? "line-through"
                                : "none";
                        return r.text ? (
                          <Text
                            key={r.id}
                            style={[
                              fnt,
                              {
                                lineHeight: LH,
                                color: r.color,
                                backgroundColor: r.bg || "transparent",
                                paddingHorizontal: r.bg ? 2 : 0,
                                fontWeight: (r.bold ? "700" : "400") as any,
                                fontStyle: (r.italic
                                  ? "italic"
                                  : "normal") as any,
                                textDecorationLine: rDecoration as any,
                              },
                            ]}
                          >
                            {r.text}
                          </Text>
                        ) : null;
                      })}
                    </Text>
                  )}
                  <TextInput
                    ref={(r) => {
                      refs.current[block.id] = r;
                    }}
                    style={[
                      fnt,
                      S.runInput,
                      {
                        lineHeight: LH,
                        color: activeRun.color,
                        backgroundColor: activeRun.bg || "transparent",
                        paddingHorizontal: activeRun.bg ? 2 : 0,
                        width: Math.max(runWidths[block.id] || 4, 4),
                        fontWeight: (activeRun.bold ? "700" : "400") as any,
                        fontStyle: (activeRun.italic
                          ? "italic"
                          : "normal") as any,
                        textDecorationLine: activeDecoration as any,
                        textAlign: (activeRun.align ?? "left") as any,
                      },
                    ]}
                    value={activeRun.text}
                    onContentSizeChange={(e) => {
                      const w = e?.nativeEvent?.contentSize?.width;
                      if (w == null) return;
                      setRunWidths((prev) => ({
                        ...prev,
                        [block.id]: w,
                      }));
                    }}
                    onChangeText={(v) => {
                      const nlIndex = v.indexOf("\n");
                      if (nlIndex === -1) {
                        updateActiveRunText(block.id, v);
                        return;
                      }
                      const before = v.slice(0, nlIndex);
                      const after = v.slice(nlIndex + 1);

                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );

                      updateActiveRunText(block.id, before);

                      insertAfter(block.id, {
                        id: uid(),
                        kind: "text",
                        runs: [
                          {
                            id: uid(),
                            text: after,
                            color: txtColor,
                            bold,
                            italic,
                            underline,
                            strike,
                            align,
                          },
                        ],
                      });
                    }}
                    onFocus={() => setActiveTextBlockId(block.id)}
                    multiline
                    blurOnSubmit={false}
                    onSubmitEditing={() =>
                      insertAfter(block.id, {
                        id: uid(),
                        kind: "text",
                        runs: [
                          {
                            id: uid(),
                            text: "",
                            color: txtColor,
                            bold,
                            italic,
                            underline,
                            strike,
                            align,
                          },
                        ],
                      })
                    }
                    onKeyPress={({ nativeEvent }) => {
                      if (
                        nativeEvent.key === "Backspace" &&
                        activeRun.text === ""
                      ) {
                        if (tb.runs.length > 1) {
                          mergeBackIntoActiveRun(block.id);
                        } else if (blocks.length > 1) {
                          del(block.id);
                        }
                      }
                    }}
                    placeholder={
                      idx === 0 && tb.runs.every((r) => r.text === "")
                        ? "Write notes..."
                        : ""
                    }
                    placeholderTextColor={colors.placeholder}
                    textAlignVertical="top"
                    scrollEnabled={false}
                    autoCorrect
                    spellCheck
                  />
                </View>
              );
            }

            if (block.kind === "check")
              return (
                <View key={block.id} style={S.checkRow}>
                  <TouchableOpacity
                    onPress={() =>
                      upd(block.id, { checked: !block.checked } as any)
                    }
                    style={[
                      S.box,
                      {
                        borderColor: block.checked
                          ? colors.primary
                          : colors.subText,
                        backgroundColor: block.checked
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
                  >
                    {block.checked && <Text style={S.tick}>✓</Text>}
                  </TouchableOpacity>
                  <TextInput
                    ref={(r) => {
                      refs.current[block.id] = r;
                    }}
                    style={[
                      S.checkInput,
                      fnt,
                      {
                        fontWeight: (block.bold ? "700" : "400") as any,
                        fontStyle: (block.italic ? "italic" : "normal") as any,
                        textAlign: (block.align ?? "left") as any,
                        textDecorationLine: block.checked
                          ? "line-through"
                          : block.underline && block.strike
                            ? "underline line-through"
                            : block.underline
                              ? "underline"
                              : block.strike
                                ? "line-through"
                                : "none",
                        opacity: block.checked ? 0.5 : 1,
                      },
                    ]}
                    value={block.text}
                    onChangeText={(t) => upd(block.id, { text: t } as any)}
                    placeholder="List item..."
                    placeholderTextColor={colors.placeholder}
                    multiline={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => setActiveTextBlockId(block.id)}
                    onSubmitEditing={() =>
                      insertAfter(block.id, {
                        id: uid(),
                        kind: "check",
                        text: "",
                        checked: false,
                        bold,
                        italic,
                        underline,
                        strike,
                        align,
                      })
                    }
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace" && block.text === "")
                        convertToText(block.id);
                    }}
                    includeFontPadding={false}
                    textAlignVertical="center"
                  />
                  <TouchableOpacity
                    onPress={() => del(block.id)}
                    style={S.delBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}
                  >
                    <Text style={{ color: colors.subText, fontSize: 18 }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              );

            if (block.kind === "list")
              return (
                <View key={block.id} style={S.checkRow}>
                  <Text style={[S.listMarker, { color: colors.text }]}>
                    {block.listType === "ordered"
                      ? `${orderedNumber(blocks, block.id)}.`
                      : "•"}
                  </Text>
                  <TextInput
                    ref={(r) => {
                      refs.current[block.id] = r;
                    }}
                    style={[
                      S.checkInput,
                      fnt,
                      {
                        fontWeight: (block.bold ? "700" : "400") as any,
                        fontStyle: (block.italic ? "italic" : "normal") as any,
                        textAlign: (block.align ?? "left") as any,
                        textDecorationLine:
                          block.underline && block.strike
                            ? "underline line-through"
                            : block.underline
                              ? "underline"
                              : block.strike
                                ? "line-through"
                                : "none",
                      },
                    ]}
                    value={block.text}
                    onChangeText={(t) => upd(block.id, { text: t } as any)}
                    placeholder="List item..."
                    placeholderTextColor={colors.placeholder}
                    multiline={false}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => setActiveTextBlockId(block.id)}
                    onSubmitEditing={() =>
                      insertAfter(block.id, {
                        id: uid(),
                        kind: "list",
                        listType: block.listType,
                        text: "",
                        bold,
                        italic,
                        underline,
                        strike,
                        align,
                      })
                    }
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace" && block.text === "")
                        convertToText(block.id);
                    }}
                    includeFontPadding={false}
                    textAlignVertical="center"
                  />
                  <TouchableOpacity
                    onPress={() => del(block.id)}
                    style={S.delBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}
                  >
                    <Text style={{ color: colors.subText, fontSize: 18 }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              );

            if (block.kind === "attachment") {
              const isImage = !!block.mimeType?.startsWith("image/");
              return (
                <View key={block.id} style={S.attachRow}>
                  {isImage ? (
                    <TouchableOpacity
                      onPress={() => setPreviewUri(block.uri)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{ uri: block.uri }}
                        style={S.attachThumb}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={[
                        S.attachThumb,
                        S.attachIconWrap,
                        { backgroundColor: colors.background },
                      ]}
                    >
                      <Text style={{ fontSize: 20 }}>📄</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }} />
                  <Text
                    style={[S.attachName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {block.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => del(block.id)}
                    style={S.delBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}
                  >
                    <Text style={{ color: colors.subText, fontSize: 18 }}>
                      ×
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View
        style={[
          S.bar,
          { backgroundColor: colors.card, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity style={S.btn} onPress={() => setShowCP(true)}>
          <Image
            source={colorWheelIcon}
            style={{ width: 24, height: 24, resizeMode: "contain" }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={S.btn} onPress={() => setShowHL(true)}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 4,
              backgroundColor: hlColor || "#FFF3B0",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={S.btn}
          onPress={() => setShowTextOptions(true)}
        >
          <Image
            source={letterIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: colors.subText,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={S.btn} onPress={pickAttachment}>
          <Image
            source={clipIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: colors.subText,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            S.btn,
            reminderAt && {
              backgroundColor: colors.primary + "22",
              borderRadius: 8,
            },
          ]}
          onPress={openReminderPicker}
        >
          <Image
            source={alarmIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: reminderAt ? colors.primary : colors.subText,
              resizeMode: "contain",
            }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={save}
          style={[S.saveFab, { backgroundColor: colors.primary }]}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>✓</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showHL} transparent animationType="fade">
        <TouchableOpacity
          style={S.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowHL(false)}
        >
          <View
            style={[
              S.colorMenuBox,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {HIGHLIGHT_OPTIONS.map((opt) => {
              const isSelected =
                (opt.value || "").toLowerCase() ===
                (hlColor || "").toLowerCase();
              return (
                <TouchableOpacity
                  key={opt.name}
                  style={S.colorMenuItem}
                  onPress={() => selectHighlight(opt.value)}
                >
                  <Text style={[S.colorCheck, { color: colors.primary }]}>
                    {isSelected ? "✓" : ""}
                  </Text>
                  <View
                    style={[
                      S.colorDot,
                      {
                        backgroundColor: opt.value || "transparent",
                        borderColor: colors.border,
                      },
                    ]}
                  />
                  <Text style={{ fontSize: 15, color: colors.text }}>
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Image Preview Modal */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <TouchableOpacity
          style={S.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}
        >
          <TouchableOpacity
            style={S.previewCloseBtn}
            onPress={() => setPreviewUri(null)}
          >
            <Text style={{ fontSize: 26, color: "#fff" }}>✕</Text>
          </TouchableOpacity>
          {previewUri && (
            <Image
              source={{ uri: previewUri }}
              style={S.previewImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>

      {/* Unlock gate */}
      <Modal visible={showUnlockGate} transparent={false} animationType="fade">
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[
              S.unlockGate,
              { backgroundColor: colors.background, flexGrow: 1 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={{ fontSize: 40, marginBottom: 16 }}>🔒</Text>
            <Text
              style={[S.sheetTitle, { color: colors.text, marginBottom: 6 }]}
            >
              This note is locked
            </Text>
            <Text
              style={{ color: colors.subText, fontSize: 13, marginBottom: 20 }}
            >
              Enter password to view
            </Text>
            <TextInput
              value={unlockPwd}
              onChangeText={setUnlockPwd}
              placeholder="Password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              style={[
                S.lockInput,
                { borderColor: colors.border, color: colors.text, width: 220 },
              ]}
            />
            {!!unlockError && (
              <Text style={{ color: "#E53935", fontSize: 12, marginTop: 8 }}>
                {unlockError}
              </Text>
            )}

            {/* Unlock button — flat */}
            <TouchableOpacity
              onPress={submitUnlock}
              style={[S.unlockBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={S.applyTxt}>Unlock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 16 }}
            >
              <Text style={{ color: colors.subText, fontSize: 13 }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const to = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  cell: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cellActive: {},
  icon: { fontSize: 18 },
});

const S = StyleSheet.create({
  screen: { flex: 1 },
  saveBtn: {
    width: 60,
    height: 30,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  applyTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    marginTop: 50,
    gap: 4,
  },
  menuBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  menuOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.15)" },
  menuBox: {
    position: "absolute",
    top: 95,
    right: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    minWidth: 170,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuDivider: { height: 1, marginHorizontal: 8 },
  colorMenuBox: {
    position: "absolute",
    bottom: 84,
    left: 14,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    minWidth: 190,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  colorMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  colorCheck: {
    width: 20,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "left",
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 10,
  },
  lockBtn: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topCenter: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dateLabel: { fontSize: 15, fontWeight: "700", flexShrink: 1 },
  lockInput: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  unlockGate: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  unlockBtn: {
    width: 160,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  applyBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginLeft: 16,
    marginTop: 8,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
  },
  sheetHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  sheetTitle: { fontSize: 17, fontWeight: "700" },
  paper: { padding: 16, paddingTop: 8 },
  page: {
    position: "relative",
    minHeight: LINE_COUNT * LH,
    paddingBottom: 100,
  },
  rule: { position: "absolute", left: 0, right: 0 },
  textBlock: { width: "100%", minHeight: LH, padding: 0, margin: 0 },
  runRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  runInput: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 4,
    width: "100%",
    padding: 0,
    margin: 0,
  },
  frozenWrap: {
    flexShrink: 1,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    height: LH,
    paddingVertical: 0,
    marginVertical: 0,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    flexShrink: 0,
  },
  tick: { color: "#fff", fontSize: 11, fontWeight: "700" },
  listMarker: {
    width: 22,
    textAlign: "right",
    marginRight: 8,
    fontSize: FS,
    flexShrink: 0,
  },
  checkInput: { flex: 1, height: LH, padding: 0, margin: 0 },
  attachRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 90,
    paddingVertical: 8,
    gap: 10,
  },
  attachThumb: { width: 90, height: 90, borderRadius: 12 },
  attachIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  attachName: { flex: 1, fontSize: FS - 1 },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  previewImage: { width: "100%", height: "80%" },
  delBtn: {
    width: 28,
    height: LH,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
  },
  btn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  saveFab: {
    width: 35,
    height: 35,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
