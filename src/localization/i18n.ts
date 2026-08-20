import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import en from './translations/en.json';
import hi from './translations/hi.json';
import es from './translations/es.json';
import fr from './translations/fr.json';
import pt from './translations/pt.json';
import ar from './translations/ar.json';
import ru from './translations/ru.json';
import ko from './translations/ko.json';
import de from './translations/de.json';
import tr from './translations/tr.json';
import it from './translations/it.json';
import vi from './translations/vi.json';
import ja from './translations/ja.json';
import id from './translations/id.json';
import th from './translations/th.json';
import pl from './translations/pl.json';
import zh from './translations/zh.json';
import ro from './translations/ro.json';
import af from './translations/af.json';
import hu from './translations/hu.json';
import uk from './translations/uk.json';
import fil from './translations/fil.json';

export const LANGUAGE_RESOURCES = {
  en: { translation: en },
  hi: { translation: hi },
  es: { translation: es },
  fr: { translation: fr },
  pt: { translation: pt },
  ar: { translation: ar },
  ru: { translation: ru },
  ko: { translation: ko },
  de: { translation: de },
  tr: { translation: tr },
  it: { translation: it },
  vi: { translation: vi },
  ja: { translation: ja },
  id: { translation: id },
  th: { translation: th },
  pl: { translation: pl },
  zh: { translation: zh },
  ro: { translation: ro },
  af: { translation: af },
  hu: { translation: hu },
  uk: { translation: uk },
  fil: { translation: fil },  
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi(हिन्दी)' },
  { code: 'es', label: 'Spanish (Española)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'pt', label: 'Portuguese (Português)' },
  { code: 'ar', label: 'Arabic (عربي)' },
  { code: 'ru', label: 'Russian (Русский)' },
  { code: 'ko', label: 'Korean (한국인)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'tr', label: 'Turkish (Türkçe)' },
  { code: 'it', label: 'Italian (Italiana)' },
  { code: 'vi', label: 'Vietnamese (Tiếng Việt)' },
  { code: 'ja', label: 'Japanese (日本語)' },
  { code: 'id', label: 'Indonesian (Indonesia)' },
  { code: 'th', label: 'Thai (แบบไทย)' },
  { code: 'pl', label: 'Polish (Polski)' },
  { code: 'zh', label: 'Chinese (中国人)' },
  { code: 'ro', label: 'Romanian (Română)' },
  { code: 'af', label: 'Afrikaans (Afrikaans)' },
  { code: 'hu', label: 'Hungarian (magyar)' },
  { code: 'uk', label: 'Ukrainian (Українська)' },
  { code: 'fil', label: 'Filipino (Filipino)' },

];

function getDeviceLanguage(): string {
  const locales = RNLocalize.getLocales();
  const deviceLang = locales[0]?.languageCode ?? 'en';
  const supported = SUPPORTED_LANGUAGES.map(l => l.code);
  return supported.includes(deviceLang) ? deviceLang : 'en';
}

i18n.use(initReactI18next).init({
  resources: LANGUAGE_RESOURCES,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  compatibilityJSON: 'v4',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;