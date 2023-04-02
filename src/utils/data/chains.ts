// map of all chains supported by Moralis and recognized chain id values
// all chains supported by Moralis are here regardless of Ambient support
// keys === name of the network (human readable)

import { CHAIN_SPECS } from '@crocswap-libs/sdk';

// function to validate any given value as a proper id for a supported chain
export function validateChainId(chainIdToValidate: string): boolean {
    CHAIN_SPECS;
    return chainIdToValidate in CHAIN_SPECS;
}
