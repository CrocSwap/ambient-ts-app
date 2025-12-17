const supportedLanguages = ['en', 'zh', 'ko', 'ja'];

export const getDefaultLanguage = () => {
    const navLang = navigator.language;
    const isNavLangSupported = supportedLanguages.includes(
        navLang.split('-')[0],
    );
    const defaultLanguage = isNavLangSupported
        ? navLang.split('-')[0]
        : navigator.languages
              .map((lang) => lang.split('-')[0])
              .find((lang) => supportedLanguages.includes(lang)) || 'en';
    return defaultLanguage;
};
