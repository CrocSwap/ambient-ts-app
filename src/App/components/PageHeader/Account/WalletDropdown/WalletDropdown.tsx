import styles from './WalletDropdown.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { AiOutlineLogout } from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import Blockies from 'react-blockies';
import { getChainExplorer } from '../../../../../utils/data/chains';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    connectorName: string | undefined;
    clickLogout: () => void;
    walletWrapperStyle: string;
    accountAddressFull: string;
    chainId: string;

    ethAmount: string;
    ethValue: string;

    setShowWalletDropdown: React.Dispatch<React.SetStateAction<boolean>>;
    showWalletDropdown: boolean;
}

interface TokenAmountDisplayPropsIF {
    logo: string;
    symbol: string;
    amount: string;
    usdValue: string;
}

export default function WalletDropdown(props: WalletDropdownPropsIF) {
    const {
        ensName,
        accountAddress,
        handleCopyAddress,
        connectorName,
        clickLogout,
        walletWrapperStyle,
        accountAddressFull,
        chainId,
        ethAmount,
        ethValue,
        // showWalletDropdown, setShowWalletDropdown
    } = props;

    const blockiesSeed = accountAddressFull.toLowerCase();
    const blockExplorer = getChainExplorer(chainId);

    const myBlockie = (
        <div className={styles.blockie_container}>
            <Blockies seed={blockiesSeed} scale={6} />
        </div>
    );

    const nameContent = (
        <div className={styles.name_display_container}>
            {myBlockie}
            <div className={styles.name_display_content}>
                <div className={styles.name_display}>
                    <h2>{ensName !== '' ? ensName : accountAddress}</h2>

                    <a
                        target='_blank'
                        rel='noreferrer'
                        href={`${blockExplorer}/address/${accountAddressFull}`}
                        aria-label='View address on Etherscan'
                    >
                        <FiExternalLink />
                    </a>
                    <button
                        onClick={handleCopyAddress}
                        className={styles.copy_button}
                        aria-label='Copy address to clipboard'
                    >
                        <FiCopy />
                    </button>
                </div>
                <div className={styles.wallet_display}>
                    <p>{connectorName}</p>
                    <p>{props.accountAddress}</p>
                </div>
            </div>
        </div>
    );

    const actionContent = (
        <div className={styles.actions_container}>
            <NavLink
                to={'/account'}
                aria-label='Go to the account page '
                tabIndex={0}
            >
                <CgProfile />
                My Account
            </NavLink>
            <button onClick={clickLogout}>
                <AiOutlineLogout color='var(--text-highlight)' /> Logout
            </button>
        </div>
    );

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF) {
        const { logo, symbol, amount, usdValue } = props;
        const ariaLabel = `Current amount of ${symbol} in your wallet is ${amount} or ${usdValue} dollars`;
        return (
            // column
            <section
                className={styles.token_container}
                tabIndex={0}
                aria-label={ariaLabel}
            >
                {/* row */}
                <div className={styles.logo_name}>
                    <img src={logo} alt='' />
                    <h3>{symbol}</h3>
                </div>

                <div className={styles.token_amount}>
                    <h3>{amount}</h3>
                    <h6>{usdValue}</h6>
                </div>
            </section>
        );
    }

    const ariaLabel = `Wallet menu for ${ensName ? ensName : accountAddress}`;

    return (
        <div className={walletWrapperStyle} tabIndex={0} aria-label={ariaLabel}>
            {nameContent}
            <section className={styles.wallet_content}>
                <TokenAmountDisplay
                    amount={ethAmount}
                    usdValue={ethValue}
                    symbol={'ETH'}
                    logo={
                        'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
                    }
                />
            </section>
            {actionContent}
        </div>
    );
}
