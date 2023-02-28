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
    const getCurrentAgreement = (section: string): (sectionTermsIF|undefined) => {
        const allAgreements = JSON.parse(localStorage.getItem('termsOfService') as string);
        if (section === 'transaction') {
            return allAgreements?.transaction;
        } else if (section === 'chat') {
            return allAgreements?.chat;
        }
    };

    const [txAgreement, setTxAgreement] = useState<sectionTermsIF|undefined>(
        getCurrentAgreement('transaction')
    );

    useEffect(() => {
        txAgreement && localStorage.setItem('tos', JSON.stringify({
            transaction: txAgreement
        }));
    }, [txAgreement]);

    const output = {
        getCurrentToS: () => transactionToS,
        getLastAgreement: () => txAgreement,
        checkAgreement: () => txAgreement?.version === transactionToS.version,
        acceptAgreement: () => setTxAgreement(
            {...transactionToS, acceptedOn: new Date().toISOString()}
        )
    };

    return output;
};
