import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { supportedNetworks, vaultSupportedNetworkIds } from '../../constants';

// function to validate any given value as a proper id for a supported chain
export function validateChainId(chainIdToValidate: string): boolean {
    return getSupportedChainIds().includes(chainIdToValidate);
}

// Lists the chain IDs that app should be supported by network selectors and the like
export function getSupportedChainIds(): Array<string> {
    return DFLT_SUPPORTED_CHAINS;
}

export function getDefaultChainId(): string {
    return getSupportedChainIds()[0];
}
export function getDefaultPairForChain(chainId: string) {
    return [
        supportedNetworks[chainId].defaultPair[0],
        supportedNetworks[chainId].defaultPair[1],
    ];
}

export function getBlockExplorerUrl(chainId: string): string {
    return supportedNetworks[chainId].blockExplorer;
}

// Given a chain ID returns the relevant block explorer URL
export function getBlockExplorerFromSDK(chainId: string | number): string {
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

export const someSupportedNetworkIsVaultSupportedNetwork =
    vaultSupportedNetworkIds.some((vaultNetworkId) =>
        validateChainId(vaultNetworkId),
    );
