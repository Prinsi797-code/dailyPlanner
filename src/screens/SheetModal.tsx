// 1) Import Animated (react-native se) — apne existing import me sirf ye add karo:
// import { Animated, ... } from "react-native";

// 2) Ye component file me kahin bhi (ColorPickerPanel ke neeche) add kar do:

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
          duration: 220,
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
          duration: 160,
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
    // animationType="none" — hum khud fade + slide control kar rahe hain
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        {/* Backdrop: sirf FADE hoga, black shadow slide nahi karega */}
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

        {/* Sheet: sirf ye niche se SLIDE hoga */}
        <Animated.View style={{ transform: [{ translateY: slide }] }}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

// 3) Ab har existing "slide" wale Modal ko is tarah replace karo:

// ---- Text Options (jisme aapko problem dikh rahi thi) ----
// PEHLE:
// <Modal visible={showTextOptions} transparent animationType="slide">
//   <View style={S.overlay}>
//     <View style={[S.sheet, { backgroundColor: colors.card }]}>
//       ...content...
//     </View>
//   </View>
// </Modal>

// AB YE:
/*
<SheetModal visible={showTextOptions} onClose={() => setShowTextOptions(false)}>
  <View style={[S.sheet, { backgroundColor: colors.card }]}>
    ...content wahi rakho jo pehle tha...
  </View>
</SheetModal>
*/

// ---- Color Picker ----
/*
<SheetModal visible={showCP} onClose={() => setShowCP(false)}>
  <View style={[S.sheet, { backgroundColor: colors.card }]}>
    ...content wahi rakho...
  </View>
</SheetModal>
*/

// ---- Lock / Password Modal (isme KeyboardAvoidingView andar rakho) ----
/*
<SheetModal visible={showLockModal} onClose={() => setShowLockModal(false)}>
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <View style={[S.sheet, { backgroundColor: colors.card }]}>
      ...content wahi rakho...
    </View>
  </KeyboardAvoidingView>
</SheetModal>
*/

// ---- iOS Reminder Modal ----
/*
{Platform.OS === "ios" && (
  <SheetModal visible={showReminderModal} onClose={() => setShowReminderModal(false)}>
    <View style={[S.sheet, { backgroundColor: colors.card }]}>
      ...content wahi rakho...
    </View>
  </SheetModal>
)}
*/