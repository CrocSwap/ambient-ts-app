import { useEffect, useState } from 'react';
import { transactionToS } from '../../utils/data/termsOfService';

export interface sectionTermsIF {
    text: string;
    version: number;
    publishedOn: string | Date;
    acceptedOn?: string | Date;
};

export interface termsOfServiceIF {
    transaction: sectionTermsIF,
    chat: sectionTermsIF
}

export const useTermsOfService = () => {
    const getCurrentAgreement = (): (sectionTermsIF|undefined) => {
        return JSON.parse(localStorage.getItem('termsOfService') as string);
    };

    const [agreement, setAgreement] = useState<sectionTermsIF|undefined>(
        getCurrentAgreement()
    );

    useEffect(() => {
        agreement && localStorage.setItem('tos', JSON.stringify(agreement));
    }, [agreement]);

    false && agreement;
    false && setAgreement;

    const output = {
        currentToS: () => transactionToS,
        getLastAgreement: () => agreement,
        checkAgreement: () => agreement?.version === transactionToS.version,
        acceptAgreement: () => setAgreement({...transactionToS, acceptedOn: new Date().toISOString()})
    };

    return output;
};
