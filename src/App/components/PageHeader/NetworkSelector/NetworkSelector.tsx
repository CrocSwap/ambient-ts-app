// import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';

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
import blastSepoliaLogo from '../../../../assets/images/networks/blast_sepolia_logo.webp';
import scrollSepoliaLogo from '../../../../assets/images/networks/scroll_sepolia_logo.webp';
import ETH from '../../../../assets/images/networks/ethereum_logo.svg';
import sepoliaLogo from '../../../../assets/images/networks/sepolia_logo.webp';
import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import { BrandContext } from '../../../../contexts/BrandContext';
import { lookupChainId } from '../../../../ambient-utils/dataLayer';
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './NetworkSelector.module.css';
interface propsIF {
    customBR?: string;
}
import { motion } from 'framer-motion';

export default function NetworkSelector(props: propsIF) {
    const {
        chooseNetwork,
        chainData: { chainId },
        chainData,
    } = useContext(CrocEnvContext);
    const { networks, platformName, includeCanto } = useContext(BrandContext);
    const { switchNetwork } = useSwitchNetwork();
    const smallScreen = useMediaQuery('(max-width: 600px)');

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
            if (
                supportedNetworks[targetChain] &&
                targetChain !== chainData.chainId
            ) {
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

    // !important:  network data is manually coded because the data used to generate
    // !important:  ... elements does not follow a consistent shape (due to Canto)

    // JSX element to select ethereum mainnet network
    const ethereumNetwork: JSX.Element = (
        <motion.li className={styles.networkItem}
            id='ethereum_network_selector'
            onClick={() => handleClick(chainMap.get('0x1'))}
            key='ethereum'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus}${chainId === '0x1' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={ETH}
                    alt='ethereum mainnet network'
                    width='25px'
                    height='25px'
                    style={{ borderRadius: '50%', marginLeft: '-2px' }}
                />
                <Text
                    color={chainId === '0x1' ? 'accent1' : 'white'}
                    style={{ marginLeft: '1px' }}
                >
                    Ethereum
                </Text>
            </div>
        </motion.li>
    );

    const blastNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='blast_network_selector'
            onClick={() => handleClick(chainMap.get('0x13e31'))}
            key='blast'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus} ${chainId === '0x13e31' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={blastLogo}
                    alt='blast network'
                    width='25px'
                    height='25px'
                    style={{ borderRadius: '50%', marginLeft: '-2px' }}
                />
                <Text
                    color={chainId === '0x13e31' ? 'accent1' : 'white'}
                    style={{ marginLeft: '1px' }}
                >
                    {'Blast'}
                </Text>
            </div>
        </motion.li>
    );

    const scrollNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='scroll_network_selector'
            onClick={() => handleClick(chainMap.get('0x82750'))}
            key='scroll'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus} ${chainId === '0x82750' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={scrollLogo}
                    alt='scroll network'
                    width='22px'
                    height='22px'
                    style={{ borderRadius: '50%', marginLeft: '-2px' }}
                />
                <Text
                    color={chainId === '0x82750' ? 'accent1' : 'white'}
                    style={{ marginLeft: '5px' }}
                >
                    {'Scroll'}
                </Text>
            </div>
        </motion.li>
    );

    // JSX element to select canto network (external link)
    const cantoNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='canto_network_selector'
            onClick={() => window.open('https://app.canto.io/lp', '_blank')}
            key='canto'
            custom={chains.length + 1}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus}`}
                tabIndex={0}
            >
                <img
                    src={cantoLogo}
                    alt='canto network'
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color='white' marginRight='10px' marginLeft='4px'>
                    Canto
                </Text>
                <RiExternalLinkLine size={14} style={{ marginLeft: '55px' }} />
            </div>
        </motion.li>
    );

    // JSX element to select sepolia network
    // uses the same logo as scroll network
    const sepoliaNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='sepolia_network_selector'
            onClick={() => handleClick(chainMap.get('0xaa36a7'))}
            key='sepolia'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus} ${chainId === '0xaa36a7' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={sepoliaLogo}
                    alt='sepolia network'
                    width='25px'
                    height='25px'
                    style={{
                        borderRadius: '50%',
                        marginLeft: '-2px',
                    }}
                />
                <Text
                    color={chainId === '0xaa36a7' ? 'accent1' : 'white'}
                    marginLeft='1px'
                >
                    Sepolia
                </Text>
                <Text color={'accent1'} fontSize={'mini'} marginLeft='30px'>
                    Testnet
                </Text>
            </div>
        </motion.li>
    );

    const blastSepoliaNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='blast_sepolia_network_selector'
            onClick={() => handleClick(chainMap.get('0xa0c71fd'))}
            key='blast sepolia'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus} ${chainId === '0xa0c71fd' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={blastSepoliaLogo}
                    alt='blast network'
                    width='25px'
                    height='25px'
                    style={{ borderRadius: '50%', marginLeft: '-2px' }}
                />
                <Text
                    color={chainId === '0xa0c71fd' ? 'accent1' : 'white'}
                    style={{ marginLeft: '2px' }}
                >
                    Blast
                </Text>
                <Text color={'accent1'} fontSize={'mini'} marginLeft='50px'>
                    Testnet
                </Text>
            </div>
        </motion.li>
    );

    // JSX element to select scroll sepolia network
    const scrollSepoliaNetwork: JSX.Element = (
         <motion.li className={styles.networkItem}
            id='scroll_sepolia_network_selector'
            onClick={() => handleClick(chainMap.get('0x8274f'))}
            key='scroll-scroll'
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <div
                className={`${styles.chainNameStatus} ${chainId === '0x82747' ? styles.activeChain : ''}`}
                tabIndex={0}
            >
                <img
                    src={scrollSepoliaLogo}
                    alt='scroll sepolia network'
                    width='22px'
                    height='22px'
                    style={{ borderRadius: '50%' }}
                />
                <Text
                    color={chainId === '0x8274f' ? 'accent1' : 'white'}
                    style={{ marginLeft: '3px' }}
                >
                    Scroll
                </Text>
                <Text color={'accent1'} fontSize={'mini'} marginLeft='47px'>
                    Testnet
                </Text>
            </div>
        </motion.li>
    );

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
                    title={lookupChain(chainId).displayName}
                    expandable={networks.length > 1}
                    logo={
                        lookupChain(chainId)
                            .displayName.toLowerCase()
                            .includes('blast sepolia')
                            ? blastSepoliaLogo
                            : lookupChain(chainId)
                                    .displayName.toLowerCase()
                                    .includes('scroll sepolia')
                              ? scrollSepoliaLogo
                              : lookupChain(chainId)
                                      .displayName.toLowerCase()
                                      .includes('scroll')
                                ? scrollLogo
                                : lookupChain(chainId)
                                        .displayName.toLowerCase()
                                        .includes('blast')
                                  ? blastLogo
                                  : lookupChain(chainId)
                                          .displayName.toLowerCase()
                                          .includes('sepolia')
                                    ? sepoliaLogo
                                    : ETH
                    }
                >
                    <ul
                        className={styles.menuContent}
                        tabIndex={0}
                        aria-label={'Dropdown menu for networks.'}
                    >
                        {chainMap.has('0x1') && ethereumNetwork}
                        {chainMap.has('0x13e31') && blastNetwork}
                        {chainMap.has('0x82750') && scrollNetwork}
                        {includeCanto &&
                            platformName === 'ambient' &&
                            cantoNetwork}
                        {chainMap.has('0xaa36a7') && sepoliaNetwork}
                        {chainMap.has('0xa0c71fd') && blastSepoliaNetwork}
                        {chainMap.has('0x8274f') && scrollSepoliaNetwork}
                    </ul>
                </DropdownMenu2>
            </div>
        </div>
    );
}
