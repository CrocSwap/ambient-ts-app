import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { mainnet, goerli, arbitrumGoerli } from 'wagmi/chains';
import { Chain as WagmiChain } from 'wagmi';

// function to validate any given value as a proper id for a supported chain
export function validateChainId(chainIdToValidate: string): boolean {
    return getSupportedChainIds().includes(chainIdToValidate);
}

// Lists the chain IDs that app should be supported by network selectors and the like
export function getSupportedChainIds(): Array<string> {
    if (process.env.REACT_APP_CHAIN_IDS) {
        return JSON.parse(process.env.REACT_APP_CHAIN_IDS) as [];
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

// Returns the chain we should use to reference market data for charting, etc.
// Used for testnets, so we can render real-world data in the testnet application
export function mktDataChainId(chainId: string): string {
    if (chainId in MKT_DATA_CHAIN_MAP) {
        return MKT_DATA_CHAIN_MAP[chainId as TestnetChainIdTypes];
    } else {
        return chainId;
    }
}

const PLACEHOLDER_BLOCK_EXPLORER = 'https://etherscan.io/';

const DFLT_SUPPORTED_CHAINS = [
    '0x5', // Goerli
    '0x66eed', // Arbitrum
];

// Maps testnets to the referenced production market data we should use on chart, etc.
const MKT_DATA_CHAIN_MAP = {
    '0x5': '0x1', // Goerli -> Mainnet
    '0x66eed': '0x1', // Arbitrum Testnet -> Mainnet
};

type TestnetChainIdTypes = '0x5' | '0x66eed';
type ProdChainIdTypes = '0x1';
export type ChainIdType = TestnetChainIdTypes | ProdChainIdTypes;

/* Returns a list of the Wagmi chains given the application defined supported
 * chains. Used by wagmi library's configureChain() hook. */
export function getWagmiChains(): WagmiChain[] {
    return getSupportedChainIds()
        .filter((chain) => chain in WAGMI_CHAIN_MAP)
        .map((chain) => WAGMI_CHAIN_MAP[chain as ChainIdType]);
}

const WAGMI_CHAIN_MAP = {
    '0x1': mainnet,
    '0x5': goerli,
    '0x66eed': arbitrumGoerli,
};

// Converts the network labels used in the backend to a canonical chain id
export function backendNetworkToChainId(label: string): ChainIdType {
    const caseLabel = label.toLowerCase() as BackendLabels;
    const lookup = BACKEND_NETWORK_LABELS_MAP[caseLabel];
    return (lookup ?? DFLT_SUPPORTED_CHAINS[0]) as ChainIdType;
}

const BACKEND_NETWORK_LABELS_MAP = {
    '0x5': '0x5',
    goerli: '0x5',
    '0x1': '0x1',
    mainnet: '0x1',
    'arbitrum-goerli': '0x66eed',
    '0x66eed': '0x66eed',
};
type BackendLabels = keyof typeof BACKEND_NETWORK_LABELS_MAP;
