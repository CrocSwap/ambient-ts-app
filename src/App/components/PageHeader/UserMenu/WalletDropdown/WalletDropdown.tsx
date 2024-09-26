import { CgProfile } from 'react-icons/cg';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { useContext, useEffect, useMemo, useState } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenIF } from '../../../../../ambient-utils/types';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { LogoutButton } from '../../../../../components/Global/LogoutButton/LogoutButton';
import styles from './WalletDropdown.module.css'

import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    ZERO_ADDRESS,
    supportedNetworks,
} from '../../../../../ambient-utils/constants';
import { TokenBalanceContext } from '../../../../../contexts/TokenBalanceContext';
import UserProfileCard from '../UserProfileCard';
import { ChainDataContext } from '../../../../../contexts/ChainDataContext';
import { Link } from 'react-router-dom';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
    clickLogout: () => void;
    accountAddressFull: string;
    hideProfileCard? : boolean
}

interface TokenAmountDisplayPropsIF {
    logo: string;
    symbol: string;
    amount: string;
    value?: string;
}

export default function WalletDropdown(props: WalletDropdownPropsIF) {
    const {
        ensName,
        accountAddress,
        handleCopyAddress,
        clickOutsideHandler,
        clickLogout,
        hideProfileCard
    } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);
    const { isActiveNetworkBlast, nativeTokenUsdPrice } =
        useContext(ChainDataContext);

    const { tokenBalances } = useContext(TokenBalanceContext);
    const defaultPair = supportedNetworks[chainId].defaultPair;
    const nativeData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find((tkn: TokenIF) => tkn.address === ZERO_ADDRESS);
    const usdcData: TokenIF | undefined = useMemo(() => {
        return tokenBalances?.find(
            (tkn: TokenIF) =>
                tkn.address.toLowerCase() ===
                defaultPair[1].address.toLowerCase(),
        );
    }, [tokenBalances]);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF): JSX.Element {
        const { logo, symbol, amount, value } = props;
        const ariaLabel = `Current amount of ${symbol} in your wallet is ${amount} or ${value} dollars`;
        return (
            <section className={styles.tokenContainer} tabIndex={0} aria-label={ariaLabel}>
                <div className={styles.logoName} >
                    <img src={logo} alt='' />
                    <h3>{symbol}</h3>
                </div>
                <div className={styles.tokenAmount} >
                    <h3>{amount}</h3>
                    <h6>{value !== undefined ? value : '...'}</h6>
                </div>
            </section>
        );
    }

    const [usdcBalanceForDom, setUsdcBalanceForDom] = useState<
        string | undefined
    >();
    const [usdcUsdValueForDom, setUsdcUsdValueForDom] = useState<
        string | undefined
    >();

    const { crocEnv } = useContext(CrocEnvContext);

    useEffect(() => {
        if (!crocEnv) return;

        if (usdcData === undefined) {
            setUsdcUsdValueForDom(undefined);
            setUsdcBalanceForDom(undefined);
            return;
        }
        const usdcCombinedBalance =
            usdcData.walletBalance !== undefined
                ? (
                      BigInt(usdcData.walletBalance) +
                      BigInt(usdcData.dexBalance ?? '0')
                  ).toString()
                : undefined;
        const usdcCombinedBalanceDisplay =
            usdcData && usdcCombinedBalance
                ? toDisplayQty(usdcCombinedBalance, usdcData.decimals)
                : undefined;
        const usdcCombinedBalanceDisplayNum = usdcCombinedBalanceDisplay
            ? parseFloat(usdcCombinedBalanceDisplay ?? '0')
            : undefined;

        const usdcCombinedBalanceDisplayTruncated =
            usdcCombinedBalanceDisplayNum !== 0
                ? getFormattedNumber({
                      value: usdcCombinedBalanceDisplayNum,
                  })
                : '0.00';

        setUsdcBalanceForDom(usdcCombinedBalanceDisplayTruncated);
        Promise.resolve(
            cachedFetchTokenPrice(usdcData.address, chainId, crocEnv),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                const usdValueNum: number =
                    (price &&
                        price?.usdPrice *
                            (usdcCombinedBalanceDisplayNum ?? 0)) ??
                    0;
                const usdValueTruncated = getFormattedNumber({
                    value: usdValueNum,
                    isUSD: true,
                });
                setUsdcUsdValueForDom(usdValueTruncated);
            } else {
                setUsdcUsdValueForDom(undefined);
            }
        });
    }, [crocEnv, chainId, JSON.stringify(usdcData)]);

    const nativeCombinedBalance =
        nativeData?.walletBalance !== undefined
            ? (
                  BigInt(nativeData.walletBalance) +
                  BigInt(nativeData.dexBalance ?? '0')
              ).toString()
            : undefined;
    const nativeCombinedBalanceDisplay =
        nativeData && nativeCombinedBalance
            ? toDisplayQty(nativeCombinedBalance, nativeData.decimals)
            : undefined;
    const nativeCombinedBalanceDisplayNum = nativeCombinedBalanceDisplay
        ? parseFloat(nativeCombinedBalanceDisplay ?? '0')
        : undefined;
    const nativeCombinedBalanceTruncated =
        nativeCombinedBalanceDisplayNum !== undefined
            ? getFormattedNumber({
                  value: nativeCombinedBalanceDisplayNum,
              })
            : undefined;

    const ethMainnetUsdValue =
        nativeTokenUsdPrice !== undefined &&
        nativeCombinedBalanceDisplayNum !== undefined
            ? nativeTokenUsdPrice * nativeCombinedBalanceDisplayNum
            : undefined;

    const nativeTokenMainnetUsdValueTruncated =
        ethMainnetUsdValue !== undefined
            ? ethMainnetUsdValue
                ? getFormattedNumber({
                      value: ethMainnetUsdValue,
                      isUSD: true,
                  })
                : '$0.00'
            : undefined;

    const tokensData = [
        {
            symbol: nativeData?.symbol || 'ETH',
            amount: nativeCombinedBalanceTruncated
                ? nativeData?.symbol === 'ETH'
                    ? 'Ξ ' + nativeCombinedBalanceTruncated
                    : nativeCombinedBalanceTruncated
                : '...',
            value: nativeTokenMainnetUsdValueTruncated,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
    ];
    if (isActiveNetworkBlast) {
        tokensData.push({
            symbol: 'USDB',
            amount: usdcBalanceForDom
                ? parseFloat(usdcBalanceForDom ?? '0') === 0
                    ? '0.00'
                    : usdcBalanceForDom
                : '...',
            value: usdcUsdValueForDom
                ? parseFloat(usdcUsdValueForDom ?? '0') === 0
                    ? '$0.00'
                    : usdcUsdValueForDom
                : '...',
            logo: 'https://assets-global.website-files.com/65a6baa1a3f8ed336f415cb4/65c67f0ebf2f6a1bd0feb13c_usdb-icon-yellow.png',
        });
    } else {
        tokensData.push({
            symbol: 'USDC',
            amount: usdcBalanceForDom
                ? parseFloat(usdcBalanceForDom ?? '0') === 0
                    ? '0.00'
                    : usdcBalanceForDom
                : '...',
            value: usdcUsdValueForDom
                ? parseFloat(usdcUsdValueForDom ?? '0') === 0
                    ? '$0.00'
                    : usdcUsdValueForDom
                : '...',
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        });
    }

    return (
        <div className={styles.walletWrapper}
            style={{padding: hideProfileCard ? '0' : ''}}
            
            tabIndex={0}
            aria-label={`Wallet menu for ${ensName ? ensName : accountAddress}`}
        >
           {!hideProfileCard && <UserProfileCard
                ensName={ensName !== '' ? ensName : ''}
                accountAddress={props.accountAddress}
                handleCopyAddress={handleCopyAddress}
                accountAddressFull={props.accountAddressFull}
            />}
            <section className={styles.walletContent}>
                {tokensData.map((tokenData) => (
                    <TokenAmountDisplay
                        amount={
                            tokenData.amount !== undefined
                                ? tokenData.amount
                                : '…'
                        }
                        value={tokenData.value}
                        symbol={tokenData.symbol}
                        logo={tokenData.logo}
                        key={JSON.stringify(tokenData)}
                    />
                ))}
            </section>
            {!hideProfileCard && <div className={styles.actionsContainer}>
                <Link className={styles.accountLink}
                    to={'/account'}
                    aria-label='Go to the account page '
                    tabIndex={0}
                    onClick={clickOutsideHandler}
                >
                    <CgProfile />
                    My Account
                </Link>
                <LogoutButton onClick={clickLogout} />
            </div>}
        </div>
    );
}
