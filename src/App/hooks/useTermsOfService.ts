import { useEffect, useState } from 'react';
import { transactionToS } from '../../utils/data/termsOfService';

export interface tosIF {
    text: string;
    version: number;
    publishedOn: string | Date;
    acceptedOn?: string | Date;
};

export const useTermsOfService = () => {
    const getCurrentAgreement = (): (tosIF|undefined) => {
        const agreement = JSON.parse(localStorage.getItem('termsOfService') as string);
        return agreement;
    };

    const [agreement, setAgreement] = useState<tosIF|undefined>(
        getCurrentAgreement()
    );

    useEffect(() => {
        agreement && localStorage.setItem('tos', JSON.stringify(agreement));
    }, [agreement]);

    const output = {
        getCurrentToS: () => transactionToS,
        getLastAgreement: () => agreement,
        checkAgreement: () => agreement?.version === transactionToS.version,
        acceptAgreement: () => setAgreement(
            {...transactionToS, acceptedOn: new Date().toISOString()}
        )
    };

    return output;
};
