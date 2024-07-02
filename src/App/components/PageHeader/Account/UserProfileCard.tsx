import { useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getChainExplorer } from '../../../../ambient-utils/dataLayer';
import { getAvatarComponent } from '../../../../components/Chat/ChatRenderUtils';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { CrocEnvContext } from '../../../../contexts/CrocEnvContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import {
    CopyButton,
    NameDisplay,
    NameDisplayContainer,
    WalletDisplay,
} from '../../../../styled/Components/Header';
interface LevelDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    accountAddressFull: string;
    padding?: string;
}

export default function UserProfileCard(props: LevelDropdownPropsIF) {
    const { ensName, accountAddress, handleCopyAddress, accountAddressFull } =
        props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { userAddress, resolvedAddressFromContext, userAvatarData } =
        useContext(UserDataContext);
    const blockExplorer = getChainExplorer(chainId);
    const link = resolvedAddressFromContext
        ? `/${resolvedAddressFromContext}`
        : `/${userAddress}`;

    return (
        <NameDisplayContainer gap={4} alignItems='center'>
            <Link to={link}>
                {userAddress &&
                    userAvatarData &&
                    getAvatarComponent(userAddress, userAvatarData, 50)}
            </Link>

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
                    <p>Connected Wallet:</p>
                    <p>{props.accountAddress}</p>
                </WalletDisplay>
            </FlexContainer>
        </NameDisplayContainer>
    );
}
