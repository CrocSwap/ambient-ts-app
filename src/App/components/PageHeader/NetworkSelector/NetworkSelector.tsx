// import{ lookupChain } from '@crocswap-libs/sdk/dist/context';
import { ChainSpec } from '@crocswap-libs/sdk';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { RiExternalLinkLine } from 'react-icons/ri';
import { useSearchParams } from 'react-router-dom';
import { supportedNetworks } from '../../../../ambient-utils/constants';
import { lookupChainId } from '../../../../ambient-utils/dataLayer';
// import baseLogo from '../../../../assets/images/networks/Base_Network_Logo.svg';
import baseSepoliaLogo from '../../../../assets/images/networks/base_sepolia_logo.webp';
import blastLogo from '../../../../assets/images/networks/blast_logo.png';
import blastSepoliaLogo from '../../../../assets/images/networks/blast_sepolia_logo.webp';
import cantoLogo from '../../../../assets/images/networks/canto.png';
import ETH from '../../../../assets/images/networks/ethereum_logo.svg';
import plumeLogo from '../../../../assets/images/networks/plume_mainnet_logo.webp';
import plumeSepoliaLogo from '../../../../assets/images/networks/plume_sepolia_logo_small.webp';
import scrollLogo from '../../../../assets/images/networks/scroll_logo.svg';
import scrollSepoliaLogo from '../../../../assets/images/networks/scroll_sepolia_logo.webp';
import sepoliaLogo from '../../../../assets/images/networks/sepolia_logo.webp';
import swellLogo from '../../../../assets/images/networks/swell_network_small_logo.svg';
import swellSepoliaLogo from '../../../../assets/images/networks/swell_sepolia.webp';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { CrocEnvContext } from '../../../../contexts';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { useBottomSheet } from '../../../../contexts/BottomSheetContext';
import { BrandContext } from '../../../../contexts/BrandContext';
import { Text } from '../../../../styled/Common';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import styles from './NetworkSelector.module.css';
interface propsIF {
    customBR?: string;
}

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
    const { networks, platformName, includeCanto } = useContext(BrandContext);
    const { setCrocEnv } = useContext(CrocEnvContext);

    const [isNetworkUpdateInProgress, setIsNetworkUpdateInProgress] =
        useState(false);

    const [selectedNetworkDisplayName, setSelectedNetworkDisplayName] =
        useState('');

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
        if (chn.chainId === chainId) return;
        setIsNetworkUpdateInProgress(true);
        const selectedNetwork = supportedNetworks[chn.chainId];
        setSelectedNetworkDisplayName(selectedNetwork.displayName);
        if (isConnected) {
            setCrocEnv(undefined);
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
            chooseNetwork(selectedNetwork);
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

    useEffect(() => {
        // reset temporary update state when chain changes
        if (isNetworkUpdateInProgress) {
            setIsNetworkUpdateInProgress(false);
            setSelectedNetworkDisplayName('');
        }
    }, [chainId]);

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
            id: 'swell_network_selector',
            chainId: '0x783',
            name: 'Swell',
            logo: swellLogo,
            custom: 0,
            isExternal: false,
            testnet: false,
            link: '',
            condition: chainMap.has('0x783'),
        },
        {
            id: 'plume_network_selector',
            chainId: '0x18231',
            name: 'Plume',
            logo: plumeLogo,
            custom: 0,
            isExternal: false,
            testnet: false,
            link: '',
            condition: chainMap.has('0x18231'),
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
            id: 'swell_sepolia_network_selector',
            chainId: '0x784',
            name: 'Swell',
            logo: swellSepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0x784'),
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
        {
            id: 'base_sepolia_network_selector',
            chainId: '0x14a34',
            name: 'Base',
            logo: baseSepoliaLogo,
            custom: 2,
            isExternal: false,
            testnet: true,
            link: '',
            condition: chainMap.has('0x14a34'),
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
            <div
                className={styles.dropdownMenuContainer}
                style={{ cursor: networks.length > 1 ? 'pointer' : 'default' }}
            >
                <DropdownMenu2
                    marginTop={'50px'}
                    marginRight={smallScreen ? '70px' : ''}
                    titleWidth={'80px'}
                    title={
                        isNetworkUpdateInProgress
                            ? selectedNetworkDisplayName
                            : networkSpec.displayName
                    }
                    expandable={networks.length > 1}
                    logo={
                        networksData.find(
                            (network) => network.chainId === chainId,
                        )?.logo
                    }
                    loading={isNetworkUpdateInProgress}
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
