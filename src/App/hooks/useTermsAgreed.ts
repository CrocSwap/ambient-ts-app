import { useEffect, useState } from 'react';

export interface TermsOfServiceUrls {
    tos: string;
    privacy: string;
    openSource: string;
}

export const useTermsAgreed = (): [
    recordAgreed: () => void,
    hasAgreedTerms: boolean,
    termsUrls: TermsOfServiceUrls,
    termsVersion: string,
] => {
    const TOS_VERSION = '2023-04-13';
    const TERMS_URLS = {
        tos: 'tos',
        privacy: 'eula/CrocodileLabsPrivacyPolicy.html',
        openSource: 'https://github.com/CrocSwap/ambient-ts-app',
    };

    const [agreedTermsVersion, setAgreedVersion] = useState(
        localStorage.getItem('termsOfService'),
    );

    useEffect(() => {
        setAgreedVersion(localStorage.getItem('termsOfService'));
    }, [localStorage.getItem('termsOfService')]);

    const [hasAgreedTerms, setAgreedTerms] = useState(false);

    useEffect(() => {
        if (agreedTermsVersion === TOS_VERSION) {
            setAgreedTerms(true);
        }
    }, [agreedTermsVersion]);

    function recordAgreed() {
        localStorage.setItem('termsOfService', TOS_VERSION);
        setAgreedTerms(true);
    }

    return [recordAgreed, hasAgreedTerms, TERMS_URLS, TOS_VERSION];
};
