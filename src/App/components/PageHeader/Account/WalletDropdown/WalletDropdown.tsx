import styles from './WalletDropdown.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import { getChainExplorer } from '../../../../../utils/data/chains';
import { useContext } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    connectorName: string | undefined;
    clickLogout: () => void;
    walletWrapperStyle: string;
    accountAddressFull: string;
    ethAmount: string;
    ethValue: string;
    walletDropdownTokenData:
        | {
              logo: string;
              symbol: string;
              value: string | undefined;
              amount: string | undefined;
          }[]
        | null;
}

interface TokenAmountDisplayPropsIF {
    logo: string;
    symbol: string;
    amount: string;
    value: string;
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
        ethAmount,
        ethValue,
        walletDropdownTokenData,
    } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const jazziconsSeed = accountAddressFull.toLowerCase();

    const blockExplorer = getChainExplorer(chainId);

    const myJazzicon = (
        <Jazzicon diameter={50} seed={jsNumberForAddress(jazziconsSeed)} />
    );

    const nameContent = (
        <div className={styles.name_display_container}>
            {myJazzicon}
            <div className={styles.name_display_content}>
                <div className={styles.name_display}>
                    <h2>{ensName !== '' ? ensName : accountAddress}</h2>

                    <a
                        target='_blank'
                        rel='noreferrer'
                        href={`${blockExplorer}address/${accountAddressFull}`}
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
            <button onClick={clickLogout}>Logout</button>
        </div>
    );

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF) {
        const { logo, symbol, amount, value } = props;
        const ariaLabel = `Current amount of ${symbol} in your wallet is ${amount} or ${value} dollars`;
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
                    <h6>{value}</h6>
                </div>
            </section>
        );
    }

    const ariaLabel = `Wallet menu for ${ensName ? ensName : accountAddress}`;

    const tokensData = [
        {
            symbol: 'ETH',
            amount: ethAmount,
            value: ethValue,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
    ];

    return (
        <div className={walletWrapperStyle} tabIndex={0} aria-label={ariaLabel}>
            {nameContent}
            <section className={styles.wallet_content}>
                {tokensData.map((token, idx) => (
                    <TokenAmountDisplay
                        amount={token.amount}
                        value={token.value}
                        symbol={token.symbol}
                        logo={token.logo}
                        key={idx}
                    />
                ))}
                {walletDropdownTokenData?.map((token, idx) => (
                    <TokenAmountDisplay
                        amount={token.amount ?? ''}
                        value={'$' + token.value ?? ''}
                        symbol={token.symbol ?? ''}
                        logo={token.logo ?? ''}
                        key={idx}
                    />
                ))}
            </section>
            {actionContent}
        </div>
    );
}
