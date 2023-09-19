import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { supportedNetworks } from '../networks';

// function to validate any given value as a proper id for a supported chain
export function validateChainId(chainIdToValidate: string): boolean {
    return getSupportedChainIds().includes(chainIdToValidate);
}

// Lists the chain IDs that app should be supported by network selectors and the like
export function getSupportedChainIds(): Array<string> {
    if (process.env.REACT_APP_CHAIN_IDS) {
        return process.env.REACT_APP_CHAIN_IDS.split(',');
    } else {
        return DFLT_SUPPORTED_CHAINS;
    }
}

export function getDefaultChainId(): string {
    return getSupportedChainIds()[0];
}

// Given a chain ID returns the relevant block explorer URL
export function getChainExplorer(chainId: string | number): string {
    try {
        const explorer = lookupChain(chainId).blockExplorer;
        if (explorer) {
            return explorer;
        }
        console.warn('No block explorer defined for ', chainId);
    } catch {
        console.warn(
            'Cannot return block explorer, because no chain data found for ',
            chainId,
        );
    }

    return PLACEHOLDER_BLOCK_EXPLORER;
}

const PLACEHOLDER_BLOCK_EXPLORER = 'https://etherscan.io/';

const DFLT_SUPPORTED_CHAINS = Object.keys(supportedNetworks);
