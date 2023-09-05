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
interface NetworkSelectorPropsIF {
    switchNetwork: ((chainId_?: number | undefined) => void) | undefined;
}

export default function NetworkSelector(props: NetworkSelectorPropsIF) {
    const { switchNetwork } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const chains = getSupportedChainIds().map((chain: string) =>
        lookupChain(chain),
    );

    const dropdownAriaDescription = 'Dropdown menu for networks.';
    const networkMenuContent = (
        <MenuContent tabIndex={0} aria-label={dropdownAriaDescription}>
            {chains.map((chain, idx) => (
                <NetworkItem
                    onClick={() =>
                        switchNetwork
                            ? switchNetwork(parseInt(chain.chainId))
                            : null
                    }
                    key={chain.chainId}
                    custom={idx}
                    variants={ItemEnterAnimation}
                    tabIndex={0}
                >
                    <ChainNameStatus tabIndex={0}>
                        <img
                            src={chain.logoUrl}
                            alt={chain.displayName}
                            width='21px'
                            height='21px'
                            style={{ borderRadius: '50%' }}
                        />
                        {chain.displayName}
                    </ChainNameStatus>
                </NetworkItem>
            ))}
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
