import styles from './WalletDropdown.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { AiOutlineLogout } from 'react-icons/ai';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';

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
        ethAmount,
        ethValue,
    } = props;

    const nameContent = (
        <div className={styles.name_display_container}>
            <div className={styles.image}></div>
            <div className={styles.name_display_content}>
                <div className={styles.name_display}>
                    <h2>{ensName !== '' ? ensName : accountAddress}</h2>

                    <a
                        target='_blank'
                        rel='noreferrer'
                        href={`https://goerli.etherscan.io/address/${accountAddressFull}`}
                    >
                        <FiExternalLink />
                    </a>
                    <div onClick={handleCopyAddress}>
                        <FiCopy />
                    </div>
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
            <button onClick={clickLogout}>
                {' '}
                <AiOutlineLogout color='var(--text-highlight)' /> Logout
            </button>
            <NavLink to={'/account'}>
                <CgProfile />
                My Account
            </NavLink>
        </div>
    );
    // props: TokenAmountDisplayPropsIF
    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF) {
        const { logo, symbol, amount, usdValue } = props;

        return (
            // column
            <section className={styles.token_container}>
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

    return (
        <div className={walletWrapperStyle}>
            {nameContent}
            <section className={styles.wallet_content}>
                <TokenAmountDisplay
                    amount={ethAmount}
                    usdValue={ethValue}
                    symbol={'ETH'}
                    logo={'https://cdn.cdnlogo.com/logos/e/81/ethereum-eth.svg'}
                />
            </section>
            {actionContent}
        </div>
    );
}
