import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../theme/ThemeContext';
import { TEMPLATE_DESIGNS, DEFAULT_DESIGN } from '../templates/templateConfigs';
import SectionRenderer from '../templates/SectionRenderer';
import { adaptDesignForTheme } from '../utils/themeColorAdapter';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { isTemplateFavorite, toggleFavorite } from '../utils/favorites';
import Toast from 'react-native-toast-message';
import AppText from '../components/AppText';
import { useScreenInterstitial } from '../ads/useScreenInterstitial';
import { AD_SCREENS } from '../ads/adConfig';
import { useTranslation } from 'react-i18next';
import { ImageBackground } from 'react-native';

type Props = StackScreenProps<RootStackParamList, 'TemplatePreview'>;

const PREVIEW_BOX_HEIGHT = 460;
const TALL_PREVIEW_BOX_HEIGHT = 620; 
const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 40;

function PreviewContent({
  template,
  design,
  isScript,
}: {
  template: any;
  design: any;
  isScript: boolean;
}) {
  return (
    <View>
      {!design.hideHeader && (
        <Text
          style={{
            color: design.headerColor,
            fontSize: isScript ? 26 : 20,
            fontWeight: isScript ? '500' : '800',
            fontStyle: isScript ? 'italic' : 'normal',
            marginBottom: 12,
          }}
        >
          {template.name}
        </Text>
      )}
      {design.sections.map((section: any, i: number) => (
        <SectionRenderer
          key={i}
          section={section}
          accentColor={design.accentColor}
          values={{}}
          onChange={() => {}}
          fieldKey={`preview_${i}`}
          themeStyle={design.themeStyle}
        />
      ))}
    </View>
  );
}

export default function TemplatePreviewScreen({ navigation, route }: Props) {
  const { colors, isDark } = useTheme();
  const template = route.params?.template;
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const [isFav, setIsFav] = useState(false);
  const { t } = useTranslation();

  const proScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(proScale, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(proScale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [proScale]);

  const showtempleteInter = useScreenInterstitial(
    AD_SCREENS.templete_screen.inter,
    'inter',
  );

  useEffect(() => {
    if (template?.id) {
      isTemplateFavorite(template.id).then(setIsFav);
    }
  }, [template?.id]);

  const handleToggleFavorite = async () => {
    if (!template) return;
    const nowFav = await toggleFavorite(template);
    setIsFav(nowFav);

    Toast.show({
      type: 'success',
      text1: nowFav
        ? t('settings.AddedtoFavorites')
        : t('settings.RemovedfromFavorites'),
      position: 'bottom',
      bottomOffset: 100,
      visibilityTime: 1500,
    });
  };

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
  }, [navigation]);

  const handleMeasure = (e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (!contentHeight && h > 0) setContentHeight(h);
  };

  if (!template) {
    return (
      <SafeAreaView
        style={[
          styles.safe,
          {
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        <AppText style={{ color: colors.text, marginBottom: 16, fontSize: 15 }}>
          {t('Templatenotfound')}
        </AppText>
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: colors.primary, paddingHorizontal: 24 },
          ]}
          onPress={() => navigation.navigate('Templates' as never)}
        >
          <AppText style={styles.ctaText}>{t('GotoTemplates')}</AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const rawDesign = TEMPLATE_DESIGNS[template.id] || DEFAULT_DESIGN;
  const design = adaptDesignForTheme(rawDesign, isDark);
  const isScript = design.headerStyle === 'script';
  const sheetBg = design.sheetBg || '#FFFFFF';
  
  const activeBg = design.backgroundImages?.[0] ?? design.backgroundImage;
  const boxHeight =
    design.layout === 'photo-collage' ? TALL_PREVIEW_BOX_HEIGHT : PREVIEW_BOX_HEIGHT;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[
            styles.backBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => showtempleteInter(() => navigation.goBack())}
        >
          {/* <Text style={{ fontSize: 16, color: colors.text }}>‹</Text> */}
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.topRight}>
          {/* <View style={[styles.proBadge, { borderColor: colors.primary }]}>
            <Text style={{ fontSize: 12 }}>💎</Text>
            <Text style={[styles.proText, { color: colors.primary }]}>PRO</Text>
          </View> */}
          <Animated.View
            style={[
              styles.proBadge,
              {
                borderColor: colors.primary,
                backgroundColor: colors.primary,
                transform: [{ scale: proScale }],
              },
            ]}
          >
            {/* <Text style={{ fontSize: 11 }}>💎</Text> */}
            <AppText style={[styles.proText, { color: colors.text }]}>
              PRO
            </AppText>
          </Animated.View>

          {/* <TouchableOpacity style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 20 }}>♡</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.iconBtn, { marginLeft: 20 }]}
            onPress={handleToggleFavorite}
          >
            <Image
              source={require('../assets/icons/heart.png')}
              style={{
                width: 20,
                height: 20,
                tintColor: isFav ? '#FF3B30' : colors.subText,
                resizeMode: 'contain',
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <AppText style={[styles.title, { color: colors.text }]}>
          {template.name}
        </AppText>
        <AppText style={[styles.subtitle, { color: colors.subText }]}>
          {t('settings.templatedetail')}
        </AppText>
        {activeBg ? (
          <ImageBackground
            source={activeBg}
            resizeMode="cover"
            style={[
              styles.previewCard,
              {
                borderColor: colors.border,
                 height: boxHeight,
                overflow: 'hidden',
              },
            ]}
          >
            {contentHeight === null && (
              <View
                style={{ position: 'absolute', top: 16, left: 16, width: CARD_WIDTH - 32, opacity: 0 }}
                onLayout={handleMeasure}
                pointerEvents="none"
              >
                <PreviewContent template={template} design={design} isScript={isScript} />
              </View>
            )}
            {contentHeight !== null && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  width: (CARD_WIDTH - 32) / Math.min(1, (boxHeight - 32) / contentHeight), // 👈 change
                  transform: [{ scale: Math.min(1, (boxHeight - 32) / contentHeight) }], // 👈 change
                  transformOrigin: 'top left',
                }}
              >
                <PreviewContent template={template} design={design} isScript={isScript} />
              </View>
            )}
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.previewCard,
              { backgroundColor: sheetBg, borderColor: colors.border, height: boxHeight }, // 👈 change
            ]}
          >
            {contentHeight === null && (
              <View
                style={{ position: 'absolute', top: 16, left: 16, width: CARD_WIDTH - 32, opacity: 0 }}
                onLayout={handleMeasure}
                pointerEvents="none"
              >
                <PreviewContent template={template} design={design} isScript={isScript} />
              </View>
            )}
            {contentHeight !== null && (
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  width: (CARD_WIDTH - 32) / Math.min(1, (boxHeight - 32) / contentHeight),
                  transform: [{ scale: Math.min(1, (boxHeight - 32) / contentHeight) }],
                  transformOrigin: 'top left',
                }}
              >
                <PreviewContent template={template} design={design} isScript={isScript} />
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('PlannerDetail', { template })}
        >
          <AppText style={styles.ctaText}>
            {t('settings.StartUsingThis')}
          </AppText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRight: { flexDirection: 'row', alignItems: 'center' },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  proText: { fontSize: 12, fontWeight: '700' },

  scrollContent: { padding: 20, paddingBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 10 },
  subtitle: { fontSize: 13, lineHeight: 19, marginBottom: 24 },

  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },

  ctaWrap: { padding: 16 },
  ctaBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
