import { CHAIN_SPECS } from '@crocswap-libs/sdk';

// function to validate any given value as a proper id for a supported chain
export function validateChainId(chainIdToValidate: string): boolean {
    CHAIN_SPECS;
    return chainIdToValidate in CHAIN_SPECS;
}

// Lists the chain IDs that app should be supported by network selectors and the like
export function getSupportedChainIds(): Array<string> {
    if (process.env.REACT_APP_CHAIN_IDS) {
        return JSON.parse(process.env.REACT_APP_CHAIN_IDS) as [];
    } else {
        return ['0x5', '0x66eed'];
    }
}
