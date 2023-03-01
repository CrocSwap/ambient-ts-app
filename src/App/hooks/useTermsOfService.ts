import { useEffect, useState } from 'react';

export interface tosIF {
    for: string,
    text: string;
    version: number;
    publishedOn: string | Date;
    acceptedOn?: string | Date;
};

export const useTermsOfService = (
    tos: tosIF
) => {
    const getCurrentAgreement = (): (tosIF|undefined) => {
        const agreement = JSON.parse(localStorage.getItem('termsOfService') as string);
        return agreement;
    };

    const [agreement, setAgreement] = useState<tosIF|undefined>(
        getCurrentAgreement()
    );

    useEffect(() => {
        agreement && localStorage.setItem(
            `tos_${agreement.for}`, JSON.stringify(agreement)
        );
    }, [agreement]);

    const output = {
        getCurrentToS: () => tos,
        getLastAgreement: () => agreement,
        checkAgreement: () => agreement?.version === tos.version,
        acceptAgreement: () => setAgreement(
            {...tos, acceptedOn: new Date().toISOString()}
        )
    };

    return output;
};
