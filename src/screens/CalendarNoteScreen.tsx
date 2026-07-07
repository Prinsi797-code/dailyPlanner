import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Modal, PanResponder, Image,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { saveCalendarNote, getAllCalendarNotes } from './CalendarScreen';
import { launchImageLibrary } from 'react-native-image-picker';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import RNFS from 'react-native-fs';
import alarmIcon from '../assets/icons/alarm.png';
import clipIcon from '../assets/icons/clip.png';
import letterIcon from '../assets/icons/letter.png';
import colorWheelIcon from '../assets/icons/color.png';

import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';

type Props = StackScreenProps<RootStackParamList, 'CalendarNote'>;

const FS = 15;
const LH = 32;
const LINE_COUNT = 30;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function hsvToRgb(h: number, s: number, v: number) {
  const i = Math.floor(h * 6), f = h * 6 - i;
  const p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  const m = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
  return '#' + m.map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}

function ColorPickerPanel({ color, onChange }: { color: string; onChange: (c: string) => void }) {
  const [hue, setHue] = useState(0); const [sat, setSat] = useState(1); const [val, setVal] = useState(1);
  const SV = 220, HW = 220, HH = 18;
  const svPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: e => { const s = Math.max(0, Math.min(1, e.nativeEvent.locationX / SV)); const v = Math.max(0, Math.min(1, 1 - e.nativeEvent.locationY / SV)); setSat(s); setVal(v); onChange(hsvToRgb(hue, s, v)); },
    onPanResponderMove: e => { const s = Math.max(0, Math.min(1, e.nativeEvent.locationX / SV)); const v = Math.max(0, Math.min(1, 1 - e.nativeEvent.locationY / SV)); setSat(s); setVal(v); onChange(hsvToRgb(hue, s, v)); },
  })).current;
  const huePan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true, onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: e => { const h = Math.max(0, Math.min(1, e.nativeEvent.locationX / HW)); setHue(h); onChange(hsvToRgb(h, sat, val)); },
    onPanResponderMove: e => { const h = Math.max(0, Math.min(1, e.nativeEvent.locationX / HW)); setHue(h); onChange(hsvToRgb(h, sat, val)); },
  })).current;
  const cur = hsvToRgb(hue, sat, val);
  const PRESETS = ['#000000', '#ffffff', '#E53935', '#FB8C00', '#FDD835', '#43A047', '#1E88E5', '#8E24AA', '#00ACC1', '#F06292', '#6D4C41', '#546E7A'];
  return (
    <View style={cp.panel}>
      <View {...svPan.panHandlers} style={[cp.svBox, { width: SV, height: SV }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: hsvToRgb(hue, 1, 1) }]} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity: 1 - sat }]} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: 1 - val }]} />
        <View style={[cp.svCur, { left: sat * SV - 10, top: (1 - val) * SV - 10 }]} />
      </View>
      <View {...huePan.panHandlers} style={[cp.hueBar, { width: HW, height: HH }]}>
        <View style={StyleSheet.absoluteFill}>
          {Array.from({ length: 12 }, (_, i) => (
            <View key={i} style={{ position: 'absolute', left: `${(i / 12) * 100}%` as any, width: `${100 / 12}%` as any, top: 0, bottom: 0, backgroundColor: hsvToRgb(i / 12, 1, 1) }} />
          ))}
        </View>
        <View style={[cp.hueCur, { left: hue * HW - 8 }]} />
      </View>
      <View style={cp.prevRow}>
        <View style={[cp.prevDot, { backgroundColor: cur }]} />
        <Text style={cp.hex}>{cur.toUpperCase()}</Text>
      </View>
      <View style={cp.presets}>
        {PRESETS.map(c => (
          <TouchableOpacity key={c} onPress={() => onChange(c)} style={[cp.swatch, { backgroundColor: c, borderColor: color === c ? '#007AFF' : '#ddd' }]} />
        ))}
      </View>
    </View>
  );
}
const cp = StyleSheet.create({
  panel: { padding: 14, gap: 12, alignItems: 'center' },
  svBox: { borderRadius: 8, overflow: 'hidden' },
  svCur: { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: '#fff', elevation: 3 },
  hueBar: { borderRadius: 9, overflow: 'hidden' },
  hueCur: { position: 'absolute', top: -3, width: 16, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#fff', elevation: 3 },
  prevRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prevDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#ccc' },
  hex: { fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#555' },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  swatch: { width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
});

type TBlock = { id: string; kind: 'text'; value: string };
type CBlock = { id: string; kind: 'check'; text: string; checked: boolean };
type LBlock = { id: string; kind: 'list'; listType: 'ordered' | 'bullet'; text: string };
type ABlock = { id: string; kind: 'attachment'; uri: string; name: string; mimeType?: string };
type Block = TBlock | CBlock | LBlock | ABlock;
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

type Align = 'left' | 'center' | 'right' | 'justify';

function orderedNumber(blocks: Block[], id: string): number {
  const idx = blocks.findIndex(b => b.id === id);
  let n = 0;
  for (let i = idx; i >= 0; i--) {
    const b = blocks[i];
    if (b.kind === 'list' && b.listType === 'ordered') n++;
    else break;
  }
  return n;
}

function formatReminder(d: Date): string {
  let h = d.getHours(); const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12; if (h === 0) h = 12;
  const mm = m.toString().padStart(2, '0');
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}, ${h}:${mm} ${ampm}`;
}

export default function CalendarNoteScreen({ route, navigation }: Props) {
  const { dateKey, dateLabel } = route.params;
  const { colors } = useTheme();
  const [blocks, setBlocks] = useState<Block[]>([{ id: 'b0', kind: 'text', value: '' }]);
  const [txtColor, setTxtColor] = useState('#000000');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [align, setAlign] = useState<Align>('left');
  const [showCP, setShowCP] = useState(false);
  const [showTextOptions, setShowTextOptions] = useState(false);

  const [reminderAt, setReminderAt] = useState<Date | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const refs = useRef<Record<string, TextInput | null>>({});

  useEffect(() => {
    getAllCalendarNotes().then(all => {
      if (!all[dateKey]) return;
      try {
        const p = JSON.parse(all[dateKey]);
        if (p.__type === 'blocksV2') {
          setBlocks(p.blocks); setTxtColor(p.txtColor || '#000000'); setBold(p.bold || false); setItalic(p.italic || false);
          setUnderline(p.underline || false); setStrike(p.strike || false); setAlign(p.align || 'left');
          setReminderAt(p.reminderAt ? new Date(p.reminderAt) : null);
        } else if (p.__type === 'blocksNote') {
          const m: Block[] = (p.blocks || []).map((b: any) => b.type === 'check' ? { id: b.id, kind: 'check', text: b.text, checked: b.checked } : { id: b.id, kind: 'text', value: b.value });
          setBlocks(m.length ? m : [{ id: 'b0', kind: 'text', value: '' }]); setTxtColor(p.textColor || '#000000');
        } else if (p.__type === 'richNote') {
          const m: Block[] = [{ id: uid(), kind: 'text', value: p.text || '' }];
          (p.checklist || []).forEach((it: any) => m.push({ id: it.id, kind: 'check', text: it.text, checked: it.checked }));
          setBlocks(m); setTxtColor(p.textColor || '#000000');
        } else {
          setBlocks([{ id: uid(), kind: 'text', value: all[dateKey] }]);
        }
      } catch { setBlocks([{ id: uid(), kind: 'text', value: all[dateKey] }]); }
    });
  }, [dateKey]);

  const save = async () => {
    await saveCalendarNote(dateKey, JSON.stringify({
      __type: 'blocksV2', blocks, txtColor, bold, italic, underline, strike, align,
      reminderAt: reminderAt ? reminderAt.getTime() : null,
    }));
    navigation.goBack();
  };

  const focus = (id: string, ms = 80) => setTimeout(() => refs.current[id]?.focus(), ms);

  const insertAfter = (afterId: string, nb: Block) => {
    setBlocks(prev => {
      const i = prev.findIndex(b => b.id === afterId);
      const next = [...prev]; next.splice(i + 1, 0, nb); return next;
    });
    focus(nb.id);
  };

  const upd = (id: string, patch: Partial<Block>) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...patch } as Block : b));

  const del = (id: string) => setBlocks(prev => {
    if (prev.length === 1) return prev;
    const i = prev.findIndex(b => b.id === id);
    const next = prev.filter(b => b.id !== id);
    focus(next[Math.max(0, i - 1)]?.id ?? '');
    return next;
  });

  const addCheckAtEnd = () => {
    const nb: CBlock = { id: uid(), kind: 'check', text: '', checked: false };
    setBlocks(prev => [...prev, nb]); focus(nb.id);
  };

  const addListAtEnd = (listType: 'ordered' | 'bullet') => {
    const nb: LBlock = { id: uid(), kind: 'list', listType, text: '' };
    setBlocks(prev => [...prev, nb]); focus(nb.id);
    setShowTextOptions(false);
  };

  const convertToText = (id: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? ({ id, kind: 'text', value: '' } as Block) : b
    ));
    focus(id, 50);
  };

  const pickAttachment = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      console.log('Gallery pick failed:', result.errorCode, result.errorMessage);
      return;
    }

    const asset = result.assets?.[0];
    if (!asset?.uri) return;

    try {
      const dir = `${RNFS.DocumentDirectoryPath}/attachments`;
      const dirExists = await RNFS.exists(dir);
      if (!dirExists) await RNFS.mkdir(dir);

      const ext = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
      const destPath = `${dir}/${uid()}.${ext}`;

      await RNFS.copyFile(asset.uri, destPath);

      const persistentUri = Platform.OS === 'android' ? `file://${destPath}` : destPath;

      const nb: ABlock = {
        id: uid(),
        kind: 'attachment',
        uri: persistentUri,
        name: asset.fileName || 'image.jpg',
        mimeType: asset.type || 'image/jpeg',
      };
      setBlocks(prev => [...prev, nb]);
    } catch (e) {
      console.log('Failed to persist attachment:', e);
    }
  };

  const ensureChannel = async () => {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'reminders',
        name: 'Calendar Reminders',
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
        title: 'Reminder',
        body: dateLabel,
        data: { dateKey: key, dateLabel },
        android: {
          channelId: 'reminders',
          pressAction: { id: 'default' },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
      }
    );
  };
  const openReminderPicker = () => {
    const base = reminderAt || new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: base,
        mode: 'date',
        onChange: (event, date) => {
          if (event.type !== 'set' || !date) return;
          DateTimePickerAndroid.open({
            value: date,
            mode: 'time',
            onChange: (event2, time) => {
              if (event2.type !== 'set' || !time) return;
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

  const clearReminder = async () => {
    await notifee.cancelNotification(dateKey);
    setReminderAt(null);
    setShowReminderModal(false);
  };

  const decoration =
    underline && strike ? 'underline line-through'
      : underline ? 'underline'
        : strike ? 'line-through'
          : 'none';

  const fnt = {
    fontSize: FS,
    color: txtColor,
    fontWeight: (bold ? '700' : '400') as any,
    fontStyle: (italic ? 'italic' : 'normal') as any,
    textDecorationLine: decoration as any,
    textAlign: align as any,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  };

  return (
    <KeyboardAvoidingView style={[S.screen, { backgroundColor: colors.background }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Top bar */}
      <View style={[S.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={S.backBtn}>
          <Text style={{ fontSize: 22, color: colors.text }}>‹</Text>
        </TouchableOpacity>
        <View style={S.topCenter}>
          <Text style={{ fontSize: 13, color: colors.subText }}>📅</Text>
          <Text style={[S.dateLabel, { color: colors.text }]}>{dateLabel}</Text>
        </View>
        <TouchableOpacity onPress={save} style={[S.saveBtn, { backgroundColor: colors.primary }]}>
          <Text style={S.saveTxt}>Save</Text>
        </TouchableOpacity>
      </View>

      {reminderAt && (
        <TouchableOpacity style={S.reminderChip} onPress={openReminderPicker}>
          <Text style={{ fontSize: 13, color: colors.primary }}>⏰ {formatReminder(reminderAt)}</Text>
          <TouchableOpacity onPress={clearReminder} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ fontSize: 14, color: colors.subText, marginLeft: 6 }}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Color picker */}
      <Modal visible={showCP} transparent animationType="slide">
        <View style={S.overlay}>
          <View style={[S.sheet, { backgroundColor: colors.card }]}>
            <View style={S.sheetHdr}>
              <Text style={[S.sheetTitle, { color: colors.text }]}>Text Color</Text>
              <TouchableOpacity onPress={() => setShowCP(false)}><Text style={{ fontSize: 22, color: colors.subText }}>✕</Text></TouchableOpacity>
            </View>
            <ColorPickerPanel color={txtColor} onChange={setTxtColor} />
            <TouchableOpacity onPress={() => setShowCP(false)} style={[S.applyBtn, { backgroundColor: colors.primary }]}>
              <Text style={S.applyTxt}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTextOptions} transparent animationType="slide">
        <View style={S.overlay}>
          <View style={[S.sheet, { backgroundColor: colors.card }]}>
            <View style={S.sheetHdr}>
              <Text style={[S.sheetTitle, { color: colors.text }]}>Text Options</Text>
              <TouchableOpacity onPress={() => setShowTextOptions(false)}>
                <Text style={{ fontSize: 22, color: colors.subText }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={to.row}>
              <TouchableOpacity style={[to.cell, bold && to.cellActive]} onPress={() => setBold(v => !v)}>
                <Text style={[to.icon, { fontWeight: '800', color: bold ? colors.primary : colors.text }]}>B</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[to.cell, underline && to.cellActive]} onPress={() => setUnderline(v => !v)}>
                <Text style={[to.icon, { textDecorationLine: 'underline', color: underline ? colors.primary : colors.text }]}>U</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[to.cell, italic && to.cellActive]} onPress={() => setItalic(v => !v)}>
                <Text style={[to.icon, { fontStyle: 'italic', color: italic ? colors.primary : colors.text }]}>I</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[to.cell, strike && to.cellActive]} onPress={() => setStrike(v => !v)}>
                <Text style={[to.icon, { textDecorationLine: 'line-through', color: strike ? colors.primary : colors.text }]}>S</Text>
              </TouchableOpacity>
            </View>

            <View style={to.row}>
              {(['left', 'center', 'right', 'justify'] as Align[]).map(a => (
                <TouchableOpacity key={a} style={[to.cell, align === a && to.cellActive]} onPress={() => setAlign(a)}>
                  <Text style={{ fontSize: 18, color: align === a ? colors.primary : colors.text }}>
                    {a === 'left' ? '⇤≡' : a === 'center' ? '≡' : a === 'right' ? '≡⇥' : '☰'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={to.row}>
              <TouchableOpacity style={to.cell} onPress={() => addListAtEnd('ordered')}>
                <Text style={{ fontSize: 15, color: colors.text }}>1.{"\n"}2.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={to.cell} onPress={() => addListAtEnd('bullet')}>
                <Text style={{ fontSize: 22, color: colors.text }}>•≡</Text>
              </TouchableOpacity>
              <TouchableOpacity style={to.cell} onPress={() => { addCheckAtEnd(); setShowTextOptions(false); }}>
                <Text style={{ fontSize: 18, color: colors.text }}>☑≡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {Platform.OS === 'ios' && (
        <Modal visible={showReminderModal} transparent animationType="slide">
          <View style={S.overlay}>
            <View style={[S.sheet, { backgroundColor: colors.card }]}>
              <View style={S.sheetHdr}>
                <Text style={[S.sheetTitle, { color: colors.text }]}>Set Reminder</Text>
                <TouchableOpacity onPress={() => setShowReminderModal(false)}>
                  <Text style={{ fontSize: 22, color: colors.subText }}>✕</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="datetime"
                display="spinner"
                onChange={(_, d) => d && setTempDate(d)}
                style={{ alignSelf: 'center' }}
              />
              <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 10 }}>
                {reminderAt && (
                  <TouchableOpacity style={[S.applyBtn, { flex: 1, backgroundColor: '#e2e2e2', marginHorizontal: 0 }]} onPress={clearReminder}>
                    <Text style={[S.applyTxt, { color: '#333' }]}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[S.applyBtn, { flex: 1, backgroundColor: colors.primary, marginHorizontal: 0 }]}
                  onPress={() => { setReminderAt(tempDate); scheduleNotification(tempDate, dateKey); setShowReminderModal(false); }}
                >
                  <Text style={S.applyTxt}>Save Reminder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <ScrollView contentContainerStyle={S.paper} keyboardDismissMode="interactive">
        <View style={S.page}>
          {Array.from({ length: LINE_COUNT }).map((_, i) => (
            <View key={i} style={[S.rule, { top: (i + 1) * LH - 1, backgroundColor: colors.border }]} />
          ))}

          {blocks.map((block, idx) => {
            if (block.kind === 'text') return (
              <TextInput
                key={block.id}
                ref={r => { refs.current[block.id] = r; }}
                style={[S.textBlock, fnt, { lineHeight: LH }]}
                value={block.value}
                onChangeText={v => upd(block.id, { value: v } as any)}
                multiline
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  insertAfter(block.id, { id: uid(), kind: 'text', value: '' });
                }}
                placeholder={idx === 0 ? 'Write notes...' : ''}
                placeholderTextColor={colors.placeholder}
                textAlignVertical="top"
                scrollEnabled={false}
                autoCorrect spellCheck
              />
            );

            if (block.kind === 'check') return (
              <View key={block.id} style={S.checkRow}>

                <TouchableOpacity
                  onPress={() => upd(block.id, { checked: !block.checked } as any)}
                  style={[S.box, {
                    borderColor: block.checked ? colors.primary : colors.subText,
                    backgroundColor: block.checked ? colors.primary : 'transparent',
                  }]}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
                >
                  {block.checked && <Text style={S.tick}>✓</Text>}
                </TouchableOpacity>

                <TextInput
                  ref={r => { refs.current[block.id] = r; }}
                  style={[
                    S.checkInput,
                    fnt,
                    {
                      textDecorationLine: block.checked ? 'line-through' : decoration,
                      opacity: block.checked ? 0.5 : 1,
                    },
                  ]}
                  value={block.text}
                  onChangeText={t => upd(block.id, { text: t } as any)}
                  placeholder="List item..."
                  placeholderTextColor={colors.placeholder}
                  multiline={false}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    insertAfter(block.id, { id: uid(), kind: 'check', text: '', checked: false });
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && block.text === '') convertToText(block.id);
                  }}
                  includeFontPadding={false}
                  textAlignVertical="center"
                />

                <TouchableOpacity onPress={() => del(block.id)} style={S.delBtn} hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}>
                  <Text style={{ color: colors.subText, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>
            );

            if (block.kind === 'list') return (
              <View key={block.id} style={S.checkRow}>
                <Text style={[S.listMarker, { color: colors.text }]}>
                  {block.listType === 'ordered' ? `${orderedNumber(blocks, block.id)}.` : '•'}
                </Text>

                <TextInput
                  ref={r => { refs.current[block.id] = r; }}
                  style={[S.checkInput, fnt, { textDecorationLine: decoration }]}
                  value={block.text}
                  onChangeText={t => upd(block.id, { text: t } as any)}
                  placeholder="List item..."
                  placeholderTextColor={colors.placeholder}
                  multiline={false}
                  returnKeyType="done"
                  blurOnSubmit={false}
                  onSubmitEditing={() => {
                    insertAfter(block.id, { id: uid(), kind: 'list', listType: block.listType, text: '' });
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === 'Backspace' && block.text === '') convertToText(block.id);
                  }}
                  includeFontPadding={false}
                  textAlignVertical="center"
                />

                <TouchableOpacity onPress={() => del(block.id)} style={S.delBtn} hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}>
                  <Text style={{ color: colors.subText, fontSize: 18 }}>×</Text>
                </TouchableOpacity>
              </View>
            );

            if (block.kind === 'attachment') {
              const isImage = !!block.mimeType?.startsWith('image/');
              return (
                <View key={block.id} style={S.attachRow}>
                  {isImage ? (
                    <TouchableOpacity onPress={() => setPreviewUri(block.uri)} activeOpacity={0.8}>
                      <Image source={{ uri: block.uri }} style={S.attachThumb} />
                    </TouchableOpacity>
                  ) : (
                    <View style={[S.attachThumb, S.attachIconWrap, { backgroundColor: colors.background }]}>
                      <Text style={{ fontSize: 20 }}>📄</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }} />
                  <Text style={[S.attachName, { color: colors.text }]} numberOfLines={1}>{block.name}</Text>

                  <TouchableOpacity onPress={() => del(block.id)} style={S.delBtn} hitSlop={{ top: 10, bottom: 10, left: 4, right: 8 }}>
                    <Text style={{ color: colors.subText, fontSize: 18 }}>×</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return null;
          })}
        </View>
      </ScrollView>

      {/* Toolbar */}
      <View style={[S.bar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity style={S.btn} onPress={() => setShowCP(true)}>
          <Image
            source={colorWheelIcon}
            style={{ width: 24, height: 24, resizeMode: 'contain' }}
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
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={S.btn}
          onPress={pickAttachment}
        >
          <Image
            source={clipIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: colors.subText,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[S.btn, reminderAt && { backgroundColor: colors.primary + '22', borderRadius: 8 }]}
          onPress={openReminderPicker}
        >
          <Image
            source={alarmIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: reminderAt ? colors.primary : colors.subText,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={save} style={[S.saveFab, { backgroundColor: colors.primary }]}>
          <Text style={{ color: '#fff', fontSize: 16 }}>✓</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview Modal */}
      <Modal visible={!!previewUri} transparent animationType="fade" onRequestClose={() => setPreviewUri(null)}>
        <TouchableOpacity
          style={S.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}
        >
          <TouchableOpacity style={S.previewCloseBtn} onPress={() => setPreviewUri(null)}>
            <Text style={{ fontSize: 26, color: '#fff' }}>✕</Text>
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

    </KeyboardAvoidingView>
  );
}

const to = StyleSheet.create({
  row: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 10, gap: 10 },
  cell: { flex: 1, height: 48, borderRadius: 10, backgroundColor: '#F2F2F5', alignItems: 'center', justifyContent: 'center' },
  cellActive: { backgroundColor: '#E4ECFF' },
  icon: { fontSize: 18 },
});

const S = StyleSheet.create({
  screen: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, marginTop: 50 },
  backBtn: { padding: 4 },
  topCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dateLabel: { fontSize: 15, fontWeight: '700' },
  saveBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  saveTxt: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reminderChip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginLeft: 16, marginTop: 8 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: Platform.OS === 'ios' ? 34 : 16 },
  sheetHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '700' },
  applyBtn: { marginHorizontal: 20, marginTop: 8, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  applyTxt: { color: '#fff', fontWeight: '700', fontSize: 15 },
  paper: { padding: 16, paddingTop: 8 },
  page: { position: 'relative', minHeight: LINE_COUNT * LH },
  rule: { position: 'absolute', left: 0, right: 0, height: 1 },
  textBlock: {
    width: '100%',
    minHeight: LH,
    padding: 0,
    margin: 0,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: LH,
    paddingVertical: 0,
    marginVertical: 0,
  },
  box: {
    width: 18, height: 18,
    borderRadius: 4, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },
  tick: { color: '#fff', fontSize: 11, fontWeight: '700' },
  listMarker: {
    width: 22,
    textAlign: 'right',
    marginRight: 8,
    fontSize: FS,
    flexShrink: 0,
  },
  checkInput: {
    flex: 1,
    height: LH,
    padding: 0,
    margin: 0,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: LH * 1.6,
    paddingVertical: 6,
    gap: 10,
  },
  attachThumb: {
    width: 42,
    height: 42,
    borderRadius: 8,
  },
  attachIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  attachName: {
    flex: 1,
    fontSize: FS - 1,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 90,
    paddingVertical: 8,
    gap: 10,
  },
  attachThumb: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  attachIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  delBtn: { width: 28, height: LH, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 24 : 10 },
  btn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  saveFab: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wheel: { width: 28, height: 28, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundColor: '#eee' },
  slice: { position: 'absolute', width: 14, height: 14, top: 0, left: 7, transformOrigin: '0 14px' as any },
  wCenter: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#fff' },
});