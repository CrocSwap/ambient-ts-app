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

    const chains = getSupportedChainIds().map((chain: string) =>
        lookupChain(chain),
    );

    const handleClick = (chn: ChainSpec): void => {
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
    };

    const dropdownAriaDescription = 'Dropdown menu for networks.';
    const networkMenuContent = (
        <MenuContent tabIndex={0} aria-label={dropdownAriaDescription}>
            {chains.map((chain, idx) => (
                <NetworkItem
                    onClick={() => handleClick(chain)}
                    key={chain.chainId}
                    custom={idx}
                    variants={ItemEnterAnimation}
                    tabIndex={0}
                >
                    <ChainNameStatus
                        tabIndex={0}
                        active={chain.chainId === chainId}
                    >
                        <img
                            src={chain.logoUrl}
                            alt={chain.displayName}
                            width='21px'
                            height='21px'
                            style={{ borderRadius: '50%' }}
                        />

                        <Text
                            color={
                                chain.chainId === chainId ? 'accent1' : 'white'
                            }
                        >
                            {chain.displayName}
                        </Text>
                    </ChainNameStatus>
                </NetworkItem>
            ))}
            <NetworkItem
                onClick={() => window.open('http://beta.canto.io/lp', '_blank')}
                key={'canto'}
                custom={chains.length}
                variants={ItemEnterAnimation}
                tabIndex={0}
            >
                <ChainNameStatus tabIndex={0} active={false}>
                    <img
                        src={canto}
                        alt={'Canto'}
                        width='21px'
                        height='21px'
                        style={{ borderRadius: '50%' }}
                    />

                    <Text color='white'>Canto</Text>
                </ChainNameStatus>
            </NetworkItem>
        </MenuContent>
    );

    return (
        <>
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
                        {networkMenuContent}
                    </DropdownMenu2>
                </DropdownMenuContainer>
            </div>
        </>
    );
}
