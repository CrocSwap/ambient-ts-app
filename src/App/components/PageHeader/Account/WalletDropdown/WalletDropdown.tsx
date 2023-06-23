import styles from './WalletDropdown.module.css';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import { NavLink } from 'react-router-dom';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {
    getChainExplorer,
    mktDataChainId,
} from '../../../../../utils/data/chains';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { USDC, ChainTypesUSDC } from '../../../../../utils/tokens/exports';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
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
        clickOutsideHandler,
        connectorName,
        clickLogout,
        walletWrapperStyle,
        accountAddressFull,
        ethAmount,
        ethValue,
    } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const erc20Tokens: TokenIF[] =
        useAppSelector((state) => state.userData.tokens.erc20Tokens) ?? [];
    const usdcAddr: string = USDC[chainId as '0x1'];
    const usdcData: TokenIF | undefined = erc20Tokens.find(
        (tkn: TokenIF) =>
            tkn.address.toLowerCase() === usdcAddr.toLowerCase() &&
            tkn.chainId === parseInt(chainId),
    );
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const blockExplorer = getChainExplorer(chainId);

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF): JSX.Element {
        const { logo, symbol, amount, value } = props;
        const ariaLabel = `Current amount of ${symbol} in your wallet is ${amount} or ${value} dollars`;
        return (
            <section
                className={styles.token_container}
                tabIndex={0}
                aria-label={ariaLabel}
            >
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

    const [usdcVal, setUsdcVal] = useState<string>('…');
    useEffect(() => {
        console.log(chainId);
        const usdBal = parseFloat(usdcData?.combinedBalanceDisplay ?? '0');
        Promise.resolve(
            cachedFetchTokenPrice(
                USDC[mktDataChainId(chainId) as '0x1'],
                chainId,
            ),
        ).then((price) => {
            let newPriceString: string;
            if (price?.usdPrice) {
                const priceString: string = (
                    (price && price?.usdPrice * usdBal) ??
                    0
                )
                    .toFixed(2)
                    .toString();
                const parts: string[] = priceString.split('.');
                const intPart = parts[0];
                const decimalPart = parts[1] || '';
                const intWithCommas = intPart.replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    ',',
                );
                newPriceString =
                    intWithCommas +
                    (decimalPart.length > 0 ? '.' + decimalPart : '');
            } else {
                newPriceString = '…';
            }
            if (usdcVal !== newPriceString) {
                setUsdcVal(newPriceString);
            }
        });
    }, [chainId]);

    const tokensData = [
        {
            symbol: 'ETH',
            amount: ethAmount,
            value: ethValue,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
        {
            symbol: 'USDC',
            amount: usdcData?.combinedBalanceDisplayTruncated ?? '0',
            value: '$' + usdcVal,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
    ];

    return (
        <div
            className={walletWrapperStyle}
            tabIndex={0}
            aria-label={`Wallet menu for ${ensName ? ensName : accountAddress}`}
        >
            <div className={styles.name_display_container}>
                <Jazzicon
                    diameter={50}
                    seed={jsNumberForAddress(accountAddressFull.toLowerCase())}
                />
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
            <section className={styles.wallet_content}>
                {tokensData.map((tokenData) => (
                    <TokenAmountDisplay
                        amount={tokenData.amount}
                        value={tokenData.value}
                        symbol={tokenData.symbol}
                        logo={tokenData.logo}
                        key={JSON.stringify(tokenData)}
                    />
                ))}
            </section>
            <div className={styles.actions_container}>
                <NavLink
                    to={'/account'}
                    aria-label='Go to the account page '
                    tabIndex={0}
                    onClick={clickOutsideHandler}
                >
                    <CgProfile />
                    My Account
                </NavLink>
                <button onClick={clickLogout}>Logout</button>
            </div>
        </div>
    );
}
