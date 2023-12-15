import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { FlexContainer } from '../../../../styled/Common';
import {
    NameDisplay,
    WalletDisplay,
    CopyButton,
    NameDisplayContainer,
} from '../../../../styled/Components/Header';
import { jsNumberForAddress } from 'react-jazzicon';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { getChainExplorer } from '../../../../ambient-utils/dataLayer';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { useContext } from 'react';
interface LevelDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
    accountAddressFull: string;
}

export default function UserProfileCard(props: LevelDropdownPropsIF) {
    const { ensName, accountAddress, handleCopyAddress, accountAddressFull } =
        props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const blockExplorer = getChainExplorer(chainId);

    return (
        <NameDisplayContainer gap={4} alignItems='center'>
            <Jazzicon
                diameter={50}
                seed={jsNumberForAddress(accountAddressFull.toLowerCase())}
            />

            <FlexContainer alignItems='center' flexDirection='column'>
                <NameDisplay gap={16} alignItems='center'>
                    <h2>{ensName !== '' ? ensName : accountAddress}</h2>
                    <IconWithTooltip
                        title={`${'View wallet address on block explorer'}`}
                        placement='right'
                    >
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href={`${blockExplorer}address/${accountAddressFull}`}
                            aria-label='View address on Etherscan'
                        >
                            <FiExternalLink />
                        </a>
                    </IconWithTooltip>

                    <IconWithTooltip
                        title={`${'Copy wallet address to clipboard'}`}
                        placement='right'
                    >
                        <CopyButton
                            onClick={handleCopyAddress}
                            aria-label='Copy address to clipboard'
                        >
                            <FiCopy />
                        </CopyButton>
                    </IconWithTooltip>
                </NameDisplay>
                <WalletDisplay gap={16} alignItems='center'>
                    <p>Metamask</p>
                    <p>{props.accountAddress}</p>
                </WalletDisplay>
            </FlexContainer>
        </NameDisplayContainer>
    );
}
