import { useEffect, useMemo, useState } from 'react';

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

    const isAgreed = useMemo<boolean>(() => {
        console.debug(
            `rechecking agreement for ${tos.for} terms of service`,
            tos
        );
        return agreement?.version === tos.version
    }, [agreement]);

    const output = {
        isAgreed,
        getCurrentToS: () => tos,
        getLastAgreement: () => agreement,
        acceptAgreement: () => setAgreement(
            {...tos, acceptedOn: new Date().toISOString()}
        )
    };

    return output;
};
