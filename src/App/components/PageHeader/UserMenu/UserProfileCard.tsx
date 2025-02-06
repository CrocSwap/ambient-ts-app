import { useContext } from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getAvatarComponent } from '../../../../components/Chat/ChatRenderUtils';
import IconWithTooltip from '../../../../components/Global/IconWithTooltip/IconWithTooltip';
import { AppStateContext } from '../../../../contexts/AppStateContext';
import { UserDataContext } from '../../../../contexts/UserDataContext';
import { FlexContainer } from '../../../../styled/Common';
import styles from './UserProfileCard.module.css';

interface propsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    accountAddressFull: string;
    padding?: string;
    isMobileDropdown?: boolean;
}

export default function UserProfileCard(props: propsIF) {
    const {
        ensName,
        accountAddress,
        handleCopyAddress,
        accountAddressFull,
        isMobileDropdown,
    } = props;
    const { activeNetwork, isUserOnline } = useContext(AppStateContext);
    const { userAddress, userAvatarData } = useContext(UserDataContext);

    return (
        <div
            className={`${styles.nameDisplayContainer} ${isMobileDropdown && styles.mobileDropdown}`}
        >
            <Link to={'/account'}>
                {isUserOnline &&
                    userAddress &&
                    userAvatarData &&
                    getAvatarComponent(userAddress, userAvatarData, 50)}
            </Link>
            <FlexContainer alignItems='center' flexDirection='column'>
                <div className={styles.nameDisplay}>
                    <Link to={'/account'}>
                        <h2>{ensName !== '' ? ensName : accountAddress}</h2>
                    </Link>

                    <IconWithTooltip
                        title={`${'View wallet address on block explorer'}`}
                        placement='right'
                    >
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href={`${activeNetwork.blockExplorer}address/${accountAddressFull}`}
                            aria-label='View address on Etherscan'
                        >
                            <FiExternalLink />
                        </a>
                    </IconWithTooltip>
                    <IconWithTooltip
                        title={`${'Copy wallet address to clipboard'}`}
                        placement='right'
                    >
                        <button
                            className={styles.copyButton}
                            onClick={handleCopyAddress}
                            aria-label='Copy address to clipboard'
                        >
                            <FiCopy />
                        </button>
                    </IconWithTooltip>
                </div>
                <div className={styles.walletDisplay}>
                    <p>Connected Wallet:</p>
                    <p>{accountAddress}</p>
                </div>
            </FlexContainer>
        </div>
    );
}
