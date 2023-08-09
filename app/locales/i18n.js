import I18n from 'react-native-i18n';

import usflag from '../assets/images/flag/en.jpg';
import bgflag from '../assets/images/flag/bg.jpg';
import itflag from '../assets/images/flag/it.jpg';
import deflag from '../assets/images/flag/de.jpg';
import esflag from '../assets/images/flag/es.jpg';
import flflag from '../assets/images/flag/fil.jpg';
import ptflag from '../assets/images/flag/pt.jpg';
import ruflag from '../assets/images/flag/ru.jpg';
import frflag from '../assets/images/flag/fr.jpg';
// Import all locales
import en from './en.json';
import bg from './bg.json';
import it from './it.json';
import de from './de.json';
import es from './es.json';
import fil from './fil.json';
import pt from './pt.json';
import ru from './ru.json';
import fr from './fr.json';
// Should the app fallback to English if user locale doesn't exists
I18n.fallbacks = true;
I18n.defaultLocale = 'en';
I18n.locale = 'en';
// Define the supported translations
I18n.translations = {
  en,
  de,
  fr,
  bg,
  it,
  pt,
  ru,
  fil,
  es,
};

export const getCntFlage = (param) => {
  switch (param) {
    case 'pt':
      return ptflag;
      break;
    case 'bg':
      return bgflag;
      break;
    case 'de':
      return deflag;
      break;
    case 'es':
      return esflag;
      break;
    case 'fil':
      return flflag;
      break;
    case 'fr':
      return frflag;
      break;
    case 'ru':
      return ruflag;
      break;
    case 'it':
      return itflag;
      break;

    default:
      return usflag;
      break;
  }
};

const currentLocale = I18n.currentLocale();
export async function setLanguage(param = 'en') {
  I18n.locale = param;
  I18n.currentLocale();
}
export function getSvgUrl(param) {
  return lans[param];
}
export const getCurrentLocale = () => I18n.locale;
// The method we'll use instead of a regular string
export function strings(name, params = {}) {
  return I18n.t(name, params);
}

export default I18n;
