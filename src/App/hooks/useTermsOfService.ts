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

    const [txAgreement, setTxAgreement] = useState<sectionTermsIF|undefined>(
        getCurrentAgreement()
    );

    useEffect(() => {
        txAgreement && localStorage.setItem('tos', JSON.stringify(txAgreement));
    }, [txAgreement]);

    const output = {
        currentToS: () => transactionToS,
        getLastAgreement: () => txAgreement,
        checkAgreement: () => txAgreement?.version === transactionToS.version,
        acceptAgreement: () => setTxAgreement({...transactionToS, acceptedOn: new Date().toISOString()})
    };

    return output;
};
