import { lookupChain } from '@crocswap-libs/sdk/dist/context';
import DropdownMenu2 from '../../../../components/Global/DropdownMenu2/DropdownMenu2';
import { ItemEnterAnimation } from '../../../../utils/others/FramerMotionAnimations';
import { getSupportedChainIds } from '../../../../utils/data/chains';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import {
    MenuContent,
    ChainNameStatus,
    NetworkItem,
    DropdownMenuContainer,
} from '../../../../styled/Components/Header';
import { supportedNetworks } from '../../../../utils/networks';
import { ChainSpec } from '@crocswap-libs/sdk';
import { useSearchParams } from 'react-router-dom';
import {
    linkGenMethodsIF,
    useLinkGen,
} from '../../../../utils/hooks/useLinkGen';
import { Text } from '../../../../styled/Common';
import canto from '../../../../assets/images/networks/canto.png';
import { RiExternalLinkLine } from 'react-icons/ri';
import { INCLUDE_CANTO_LINK } from '../../../../constants';

interface propsIF {
    switchNetwork: ((chainId_?: number | undefined) => void) | undefined;
}

export default function NetworkSelector(props: propsIF) {
    const { switchNetwork } = props;
    const {
        chooseNetwork,
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const linkGenIndex: linkGenMethodsIF = useLinkGen('index');
    const [searchParams] = useSearchParams();
    const chainParam = searchParams.get('chain');
    const networkParam = searchParams.get('network');

    const chains: ChainSpec[] = getSupportedChainIds().map((chain: string) =>
        lookupChain(chain),
    );

    // organize chain data into a hashmap for easier access in the file
    const chainMap = new Map();
    chains.forEach((chain: ChainSpec) => chainMap.set(chain.chainId, chain));

    // click handler for network switching (does not handle Canto link)
    function handleClick(chn: ChainSpec): void {
        if (switchNetwork) {
            switchNetwork(parseInt(chn.chainId));
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

    // !important:  network data is manually coded because the data used to generate
    // !important:  ... elements does not follow a consistent shape (due to Canto)

    // JSX element to select ethereum mainnet network
    const ethereumNetwork: JSX.Element = (
        <NetworkItem
            id='ethereum_network_selector'
            onClick={() => handleClick(chainMap.get('0x1'))}
            key={'ethereum'}
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <ChainNameStatus tabIndex={0} active={chainId === '0x1'}>
                <img
                    src={chainMap.get('0x1')?.logoUrl}
                    alt={'ethereum mainnet network'}
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color={chainId === '0x1' ? 'accent1' : 'white'}>
                    Ethereum
                </Text>
            </ChainNameStatus>
        </NetworkItem>
    );

    // JSX element to select scroll network
    const scrollNetwork: JSX.Element = (
        <NetworkItem
            id='scroll_network_selector'
            onClick={() => handleClick(chainMap.get('0x82750'))}
            key={'scroll'}
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <ChainNameStatus tabIndex={0} active={chainId === '0x82750'}>
                <img
                    src={chainMap.get('0x82750')?.logoUrl}
                    alt={'scroll network'}
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color={chainId === '0x82750' ? 'accent1' : 'white'}>
                    Scroll
                </Text>
            </ChainNameStatus>
        </NetworkItem>
    );

    // JSX element to select canto network (external link)
    const cantoNetwork: JSX.Element = (
        <NetworkItem
            id='canto_network_selector'
            onClick={() => window.open('http://beta.canto.io/lp', '_blank')}
            key={'canto'}
            custom={chains.length + 1}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <ChainNameStatus tabIndex={0} active={false}>
                <img
                    src={canto}
                    alt={'canto network'}
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color='white' marginRight='10px'>
                    Canto
                </Text>
                <RiExternalLinkLine size={14} />
            </ChainNameStatus>
        </NetworkItem>
    );

    // JSX element to select goerli network
    const goerliNetwork: JSX.Element = (
        <NetworkItem
            id='goerli_network_selector'
            onClick={() => handleClick(chainMap.get('0x5'))}
            key={'goerli'}
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <ChainNameStatus tabIndex={0} active={chainId === '0x5'}>
                <img
                    src={chainMap.get('0x5')?.logoUrl}
                    alt={'goerli network'}
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color={chainId === '0x5' ? 'accent1' : 'white'}>
                    Görli
                </Text>
            </ChainNameStatus>
        </NetworkItem>
    );

    // JSX element to select sepolia network
    // uses the same logo as scroll network
    const sepoliaNetwork: JSX.Element = (
        <NetworkItem
            id='sepolia_network_selector'
            onClick={() => handleClick(chainMap.get('0x8274f'))}
            key={'sepolia'}
            custom={0}
            variants={ItemEnterAnimation}
            tabIndex={0}
        >
            <ChainNameStatus tabIndex={0} active={chainId === '0x8274f'}>
                <img
                    src={chainMap.get('0x82750')?.logoUrl}
                    alt={'goerli network'}
                    width='21px'
                    height='21px'
                    style={{ borderRadius: '50%' }}
                />
                <Text color={chainId === '0x8274f' ? 'accent1' : 'white'}>
                    Sepolia
                </Text>
            </ChainNameStatus>
        </NetworkItem>
    );

    return (
        <div style={{ position: 'relative' }}>
            <DropdownMenuContainer
                justifyContent='center'
                alignItems='center'
                gap={4}
            >
                <DropdownMenu2
                    marginTop={'50px'}
                    titleWidth={'80px'}
                    title={lookupChain(chainId).displayName}
                    logo={lookupChain(chainId).logoUrl}
                >
                    <MenuContent
                        tabIndex={0}
                        aria-label={'Dropdown menu for networks.'}
                    >
                        {chainMap.has('0x1') && ethereumNetwork}
                        {chainMap.has('0x82750') && scrollNetwork}
                        {INCLUDE_CANTO_LINK && cantoNetwork}
                        {chainMap.has('0x5') && goerliNetwork}
                        {chainMap.has('0x8274f') && sepoliaNetwork}
                    </MenuContent>
                </DropdownMenu2>
            </DropdownMenuContainer>
        </div>
    );
}
