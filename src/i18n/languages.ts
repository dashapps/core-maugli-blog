// src/i18n/languages.ts


import de from './de.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import ja from './ja.json';
import pt from './pt.json';
import ru from './ru.json';
import zh from './zh.json';

export const LANGUAGES = [
  { code: 'ru', label: 'РУ ВЕРСИЯ', flag: '🇷🇺', icon: '/flags/russia.svg', dict: ru },
  { code: 'en', label: 'EN USA EDITION', flag: '🇺🇸', icon: '/flags/united states.svg', dict: en },
  { code: 'es', label: 'ES LATAM', flag: '🇪🇸', icon: '/flags/spain.svg', dict: es },
  { code: 'de', label: 'DE VERSION', flag: '🇩🇪', icon: '/flags/germany.svg', dict: de },
  { code: 'pt', label: 'PT BRASIL', flag: '🇧🇷', icon: '/flags/brazil.svg', dict: pt },
  { code: 'fr', label: 'FR', flag: '🇫🇷', icon: '/flags/france.svg', dict: fr },
  { code: 'zh', label: '中文', flag: '🇨🇳', icon: '/flags/china.svg', dict: zh },
  { code: 'ja', label: '日本語', flag: '🇯🇵', icon: '/flags/japan.svg', dict: ja },
  // Добавляйте новые языки по мере необходимости
];
