// import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import { useContext, useEffect, useState } from 'react';
import { supportedNetworks } from '../../../../ambient-utils/constants';
import { ChainSpec } from '@crocswap-libs/sdk';
import { useSearchParams } from 'react-router-dom';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { Text } from '../../../../styled/Common';
import { RiExternalLinkLine } from 'react-icons/ri';
import cantoLogo from '../../../../assets/images/networks/canto.png';
import scrollLogo from '../../../../assets/images/networks/scroll_logo.svg';
import blastLogo from '../../../../assets/images/networks/blast_logo.png';
// import plumeMainnetLogo from '../../../../assets/images/networks/plume_mainnet_logo.webp';
import plumeSepoliaLogo from '../../../../assets/images/networks/plume_mainnet_logo.webp';
// import plumeSepoliaLogo from '../../../../assets/images/networks/plume_sepolia_network_logo.webp';
import blastSepoliaLogo from '../../../../assets/images/networks/blast_sepolia_logo.webp';
import scrollSepoliaLogo from '../../../../assets/images/networks/scroll_sepolia_logo.webp';
import ETH from '../../../../assets/images/networks/ethereum_logo.svg';
import sepoliaLogo from '../../../../assets/images/networks/sepolia_logo.webp';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import {
    BrandContext,
    BrandContextIF,
} from '../../../../contexts/BrandContext';
import { lookupChainId } from '../../../../ambient-utils/dataLayer';
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './NetworkSelector.module.css';
interface propsIF {
    customBR?: string;
}
import { motion } from 'framer-motion';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useBottomSheet } from '../../../../contexts/BottomSheetContext';

interface NetworkSelectorListItemIF {
    id: string;
    chainId: string;
    name: string;
    logo: string;
    custom: number;
    isExternal: boolean;
    testnet: boolean;
    link: string;
    condition: boolean;
}

export default function NetworkSelector(props: propsIF) {
    const {
        chooseNetwork,
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { networks, platformName, includeCanto } =
        useContext<BrandContextIF>(BrandContext);
    const { closeBottomSheet } = useBottomSheet();
    const { switchNetwork } = useSwitchNetwork();
    const smallScreen: boolean = useMediaQuery('(max-width: 600px)');

    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');
    const [searchParams, setSearchParams] = useSearchParams();
    const { isConnected } = useWeb3ModalAccount();
    const chainParam = searchParams.get('chain');
    const networkParam = searchParams.get('network');

    const chains: ChainSpec[] = networks.map((chain: string) =>
        lookupChain(chain),
    );

    // organize chain data into a hashmap for easier access in the file
    const chainMap = new Map();
    chains.forEach((chain: ChainSpec) => chainMap.set(chain.chainId, chain));

    // click handler for network switching (does not handle Canto link)
    async function handleClick(chn: ChainSpec): Promise<void> {
        if (isConnected) {
            await switchNetwork(parseInt(chn.chainId));
            if (chainParam || networkParam) {
                // navigate to index page only if chain/network search param present
                linkGenIndex.navigate();
            }
        } else {
            if (chainParam || networkParam) {
                // navigate to index page only if chain/network search param present
                linkGenIndex.navigate();
            }
            chooseNetwork(supportedNetworks[chn.chainId]);
        }
    }

    const [initialLoadComplete, setInitialLoadComplete] = useState(false);
    // logic to consume chain param data from the URL
    // runs once when the app initializes, again when web3modal finishes initializing
    useEffect(() => {
        // search for param in URL by key 'chain' or 'network'
        const chainParam: string | null =
            searchParams.get('chain') ?? searchParams.get('network');
        // logic to execute if a param is found (if not, do nothing)
        if (chainParam) {
            // get a canonical 0x hex string chain ID from URL param
            const targetChain: string =
                lookupChainId(chainParam, 'string') ?? chainParam;
            // check if chain is supported and not the current chain in the app
            // yes → trigger machinery to switch the current network
            // no → no action except to clear the param from the URL
            if (supportedNetworks[targetChain] && targetChain !== chainId) {
                // use web3modal if wallet is connected, otherwise use in-app toggle
                if (isConnected) {
                    switchNetwork(parseInt(targetChain));
                } else {
                    if (!initialLoadComplete) {
                        setTimeout(() => {
                            setInitialLoadComplete(true);
                        }, 500);
                    } else {
                        chooseNetwork(supportedNetworks[targetChain]);
                    }
                }
            } else {
                setSearchParams('');
            }
        }
    }, [isConnected, initialLoadComplete]);

    const networksData: NetworkSelectorListItemIF[] = [
        {
            id: 'ethereum_network_selector',
            chainId: '0x1',
            name: 'Ethereum',
            logo: ETH,
            custom: 0,
            isExternal: false,
            testnet: false,
            link: '',
            condition: chainMap.has('0x1'),
        },
        {
            id: 'scroll_network_selector',
            chainId: '0x82750',
            name: 'Scroll',
            logo: scrollLogo,
            custom: 0,
            isExternal: false,
            testnet: false,
            link: '',
            condition: chainMap.has('0x82750'),
        },
        {
            id: 'blast_network_selector',
            chainId: '0x13e31',
            name: 'Blast',
            logo: blastLogo,
            custom: 0,
            isExternal: false,
            testnet: false,
            link: '',
            condition: chainMap.has('0x13e31'),
        },
        {
            id: 'canto_network_selector',
            chainId: '',
            name: 'Canto',
            logo: cantoLogo,
            custom: 1,
            isExternal: true,
            testnet: false,
            link: 'https://www.canto.io/lp',
            condition: includeCanto && platformName === 'ambient',
        },
        {
            id: 'sepolia_network_selector',
            chainId: '0xaa36a7',
            name: 'Sepolia',
            logo: sepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0xaa36a7'),
        },
        {
            id: 'plume_sepolia_network_selector',
            chainId: '0x18230',
            name: 'Plume',
            logo: plumeSepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0x18230'),
        },
        {
            id: 'scroll_sepolia_network_selector',
            chainId: '0x8274f',
            name: 'Scroll',
            logo: scrollSepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0x8274f'),
        },
        {
            id: 'blast_sepolia_network_selector',
            chainId: '0xa0c71fd',
            name: 'Blast',
            logo: blastSepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0xa0c71fd'),
        },
    ];

    const networkItems = networksData.map((network) =>
        network.condition ? (
            <motion.li
                className={styles.networkItem}
                id={network.id}
                onClick={() => {
                    if (network.isExternal) {
                        window.open(network.link, '_blank');
                    } else {
                        handleClick(chainMap.get(network.chainId));
                    }
                    closeBottomSheet();
                }}
                key={network.id}
                custom={network.custom}
                variants={ItemEnterAnimation}
                tabIndex={0}
            >
                <div
                    className={`${styles.chainNameStatus} ${chainId === network.chainId ? styles.activeChain : ''}`}
                    tabIndex={0}
                >
                    <img
                        src={network.logo}
                        alt={`${network.name} network`}
                        width={network.name === 'Scroll' ? '22px' : '25px'}
                        height={network.name === 'Scroll' ? '22px' : '25px'}
                        style={{ borderRadius: '50%', marginLeft: '-2px' }}
                    />
                    <Text
                        color={
                            chainId === network.chainId ? 'accent1' : 'white'
                        }
                        style={{
                            marginLeft:
                                network.name === 'Scroll' ? '5px' : '1px',
                        }}
                    >
                        {network.name}
                    </Text>
                    {network.testnet && (
                        <Text
                            color={'accent1'}
                            fontSize={'mini'}
                            style={{
                                position: 'absolute', // Position Testnet absolutely
                                right: '0', // Pin it to the right
                            }}
                        >
                            Testnet
                        </Text>
                    )}
                    {network.isExternal && (
                        <RiExternalLinkLine
                            size={14}
                            style={{
                                position: 'absolute', // Position external link absolutely
                                right: '0', // Pin it to the right
                            }}
                        />
                    )}
                </div>
            </motion.li>
        ) : null,
    );

    const networkSpec = supportedNetworks[chainId];

    return (
        <div
            style={{
                position: 'relative',
                borderRadius: props.customBR ? props.customBR : '4px',
            }}
        >
            <div className={styles.dropdownMenuContainer}>
                <DropdownMenu2
                    marginTop={'50px'}
                    marginRight={smallScreen ? '70px' : ''}
                    titleWidth={'80px'}
                    title={networkSpec.displayName}
                    expandable={networks.length > 1}
                    logo={
                        networksData.find(
                            (network) => network.chainId === chainId,
                        )?.logo
                    }
                >
                    <ul
                        className={styles.menuContent}
                        tabIndex={0}
                        aria-label={'Dropdown menu for networks.'}
                    >
                        {networkItems}
                    </ul>
                </DropdownMenu2>
            </div>
        </div>
    );
}
