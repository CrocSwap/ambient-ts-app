// START: Import React and Dongles
import { useEffect, useMemo, useState } from 'react';

// exportable interface for Terms of Service data object
export interface tosIF {
    for: string,
    text: string;
    version: number;
    publishedOn: string | Date;
    acceptedOn?: string | Date;
};

// exportable interface for methods to interact with Terms of Service
// this is the object returned by this hook
export interface tosMethodsIF {
    isAgreed: boolean,
    getCurrentToS: () => tosIF,
    getLastAgreement: () => tosIF | undefined,
    acceptAgreement: () => void,
}

// central react hook in this file
export const useTermsOfService = (tos: tosIF): tosMethodsIF => {
    // fn to get the current user agreement from local storage
    const getCurrentAgreement = (): (tosIF|undefined) => {
        const agreement = JSON.parse(localStorage.getItem(`tos_${tos.for}`) as string);
        return agreement;
    };

    // hook to memoize most recent user agreement data in local state
    const [agreement, setAgreement] = useState<tosIF|undefined>(getCurrentAgreement());

    // sync `agreement` into local storage when user newly agrees 
    useEffect(() => {
        // check that `agreement` is not undefined
        // if it is a defined value, update local storage
        agreement && localStorage.setItem(`tos_${agreement.for}`, JSON.stringify(agreement));
    }, [agreement]);

    // memoize check as to whether user agreement is current
    // memoization matters because some app functionalities will check frequently
    const isAgreed = useMemo<boolean>(() => {
        // log rechecks at the debug level
        console.debug(
            `rechecking agreement for ${tos.for} terms of service`,
            tos
        );
        // return whether agreement matches the current tos (version number)
        return agreement?.version === tos.version
    }, [agreement]);

    // return methods for the app to interact with this instance of ToS
    return {
        isAgreed,
        getCurrentToS: () => tos,
        getLastAgreement: () => agreement,
        acceptAgreement: () => setAgreement(
            {...tos, acceptedOn: new Date().toISOString()}
        )
    };
};
