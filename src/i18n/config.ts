import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enCommon from './en/common.json';
import enValidation from './en/validation.json';
import enGlossary from './en/glossary.json';
import zhCommon from './zh/common.json';
import zhValidation from './zh/validation.json';
import zhGlossary from './zh/glossary.json';
import krCommon from './kr/common.json';
import krValidation from './kr/validation.json';
import krGlossary from './kr/glossary.json';

export const resources = {
    en: {
        common: enCommon,
        validation: enValidation,
        glossary: enGlossary,
    },
    zh: {
        common: zhCommon,
        validation: zhValidation,
        glossary: zhGlossary,
    },
    kr: {
        common: krCommon,
        validation: krValidation,
        glossary: krGlossary,
    },
} as const;

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        ns: ['common', 'validation', 'glossary'],
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources,
    });

export default i18n;
