// START: Import React and Dongles
import { useState } from 'react';

// exportable interface for Terms of Service data object
export interface tosIF {
    for: string;
    viewAt: string;
    cid: string;
    acceptedOn?: string | Date;
}

// exportable interface for methods to interact with Terms of Service
// this is the object returned by this hook
export interface tosMethodsIF {
    isAgreed: boolean;
    tos: tosIF;
    lastAgreement: tosIF | undefined;
    acceptToS: () => void;
}

// central react hook in this file
// PARAMS EXPLANATION!!
// termsFor ➔ human-readable label for this ToS instance (plz_use_snake_case)
// cid: resource URI endpoint to locate the ToS on IPFS (from environmental variables)
export const useTermsOfService = (
    termsFor: string,
    cid: string,
): tosMethodsIF => {
    // unique key for data to be stored in local storage
    const localStorageSlug: string = 'tos_' + termsFor;

    // base URL to combine with resource hash to make valid link
    const agreementUriBase = 'https://gateway.ipfs.io/ipfs/';

    // current terms of service metadata
    const tos: tosIF = {
        for: termsFor,
        cid: cid,
        viewAt: agreementUriBase + cid,
    };

    // fn to get the current user agreement from local storage
    const getLastAgreement = () => {
        const agreement = JSON.parse(
            localStorage.getItem(localStorageSlug) as string,
        );
        return agreement;
    };

    // hook to memoize most recent user agreement data in local state
    // will be `undefined` if user has not yet agreed
    const [agreement, setAgreement] = useState<tosIF | undefined>(
        getLastAgreement(),
    );

    // fn to accept terms of service to be called on demand
    const acceptToS = () => {
        const newAgreement = { ...tos, acceptedOn: new Date().toISOString() };
        setAgreement(newAgreement);
        localStorage.setItem(localStorageSlug, JSON.stringify(newAgreement));
    };

    // RETURN VALUES
    // isAgreed ➔ boolean representation whether user is agreed to current ToS
    // tos ➔ metadata about the current active ToS
    // lastAgreement ➔ metadata about ToS version user last agreed to
    // acceptToS ➔ function to record agreement to the current ToS
    return {
        isAgreed: tos.cid === agreement?.cid,
        tos: tos,
        lastAgreement: agreement,
        acceptToS,
    };
};
