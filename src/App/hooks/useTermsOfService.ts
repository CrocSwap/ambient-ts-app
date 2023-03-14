// START: Import React and Dongles
import { useState } from 'react';

// exportable interface for Terms of Service data object
export interface tosIF {
    for: string;
    viewAt: string;
    cid: string;
    acceptedOn?: string | Date;
};

// exportable interface for methods to interact with Terms of Service
// this is the object returned by this hook
export interface tosMethodsIF {
    isAgreed: boolean,
    tosURL: tosIF,
    lastAgreement: tosIF | undefined,
    acceptToS: () => void,
}

// central react hook in this file
export const useTermsOfService = (termsFor: string): tosMethodsIF => {
    // unique key for data to be stored in local storage
    const localStorageSlug: string = 'tos_' + termsFor;

    // resource hash for terms of service URI
    // this is the "cid" from the IPFS resource
    const agreementUriSlug = 'Qmad5FtHuwnsEDdEz71Rn5oyPuw2nbfqG9XpAGHW8wGCt1';

    // base URL to combine with resource hash to make valid link
    const agreementUriBase = 'https://gateway.ipfs.io/ipfs/';

    // current terms of service metadata
    const tos: tosIF = {
        for: termsFor,
        cid: agreementUriSlug,
        viewAt: agreementUriBase + agreementUriSlug,
    };

    // fn to get the current user agreement from local storage
    const getLastAgreement = () => {
        const agreement = JSON.parse(localStorage.getItem(localStorageSlug) as string);
        return agreement;
    };

    // hook to memoize most recent user agreement data in local state
    // will be `undefined` if user has not yet agreed
    const [agreement, setAgreement] = useState<tosIF|undefined>(getLastAgreement());

    // fn to accept terms of service to be called on demand
    const acceptToS = () => {
        const newAgreement = {...tos, acceptedOn: new Date().toISOString()};
        setAgreement(newAgreement);
        localStorage.setItem(localStorageSlug, JSON.stringify(newAgreement));
    };

    return {
        isAgreed: tos.cid === agreement?.cid,
        tosURL: tos,
        lastAgreement: agreement,
        acceptToS
    };
};
