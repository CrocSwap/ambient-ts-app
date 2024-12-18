import { useContext, useEffect, useMemo, useState } from 'react';
import { CgProfile } from 'react-icons/cg';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { TokenIF } from '../../../../../ambient-utils/types';
import { LogoutButton } from '../../../../../components/Global/LogoutButton/LogoutButton';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import styles from './WalletDropdown.module.css';

import { toDisplayPrice, toDisplayQty } from '@crocswap-libs/sdk';
import { Link } from 'react-router-dom';
import {
    CACHE_UPDATE_FREQ_IN_MS,
    ZERO_ADDRESS,
    supportedNetworks,
} from '../../../../../ambient-utils/constants';
import processLogoSrc from '../../../../../components/Global/TokenIcon/processLogoSrc';
import { CrocEnvContext, TokenContext } from '../../../../../contexts';
import { AppStateContext } from '../../../../../contexts/AppStateContext';
import { ChainDataContext } from '../../../../../contexts/ChainDataContext';
import { TokenBalanceContext } from '../../../../../contexts/TokenBalanceContext';
import UserProfileCard from '../UserProfileCard';

interface propsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
    clickLogout: () => void;
    accountAddressFull: string;
    hideProfileCard?: boolean;
}

interface TokenAmountDisplayPropsIF {
    logoUri: string;
    symbol: string;
    address: string;
    amount: string;
    value?: string;
}

export default function WalletDropdown(props: propsIF) {
    const {
        ensName,
        accountAddress,
        handleCopyAddress,
        clickOutsideHandler,
        clickLogout,
        hideProfileCard,
    } = props;

    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);

    const { nativeTokenUsdPrice } = useContext(ChainDataContext);
    const { crocEnv } = useContext(CrocEnvContext);

    const { tokens } = useContext(TokenContext);

    const { tokenBalances } = useContext(TokenBalanceContext);
    const defaultPair = supportedNetworks[chainId].defaultPair;
    const nativeData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find((tkn: TokenIF) => tkn.address === ZERO_ADDRESS);

    const secondDefaultTokenData: TokenIF | undefined = useMemo(() => {
        return tokenBalances?.find(
            (tkn: TokenIF) =>
                tkn.address.toLowerCase() ===
                defaultPair[1].address.toLowerCase(),
        );
    }, [tokenBalances]);

    const { cachedFetchTokenPrice, cachedQuerySpotPrice } =
        useContext(CachedDataContext);

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF): JSX.Element {
        const { logoUri, symbol, address, amount, value } = props;
        const token = tokens.getTokenByAddress(address);
        const ariaLabel = `Current amount of ${symbol} in your wallet is ${amount} or ${value} dollars`;
        return (
            <section
                className={styles.tokenContainer}
                tabIndex={0}
                aria-label={ariaLabel}
            >
                <div className={styles.logoName}>
                    <img
                        src={processLogoSrc({
                            token: token,
                            symbol: symbol,
                            sourceURI: logoUri,
                        })}
                        alt=''
                    />
                    <h3>{symbol}</h3>
                </div>
                <div className={styles.tokenAmount}>
                    <h3>{amount}</h3>
                    <h6>{value !== '$0.00' ? value : '...'}</h6>
                </div>
            </section>
        );
    }

    const [secondTokenBalanceForDom, setSecondTokenBalanceForDom] = useState<
        string | undefined
    >();
    const [secondTokenUsdValueForDom, setSecondTokenUsdValueForDom] = useState<
        string | undefined
    >();

    useEffect(() => {
        if (secondDefaultTokenData === undefined) {
            setSecondTokenUsdValueForDom(undefined);
            setSecondTokenBalanceForDom(undefined);
            return;
        }
        const secondTokenCombinedBalance =
            secondDefaultTokenData.walletBalance !== undefined
                ? (
                      BigInt(secondDefaultTokenData.walletBalance) +
                      BigInt(secondDefaultTokenData.dexBalance ?? '0')
                  ).toString()
                : undefined;

        const secondTokenCombinedBalanceDisplay =
            secondDefaultTokenData && secondTokenCombinedBalance
                ? toDisplayQty(
                      secondTokenCombinedBalance,
                      secondDefaultTokenData.decimals,
                  )
                : undefined;

        const secondTokenCombinedBalanceDisplayNum =
            secondTokenCombinedBalanceDisplay
                ? parseFloat(secondTokenCombinedBalanceDisplay ?? '0')
                : undefined;

        const secondTokenCombinedBalanceDisplayTruncated =
            secondTokenCombinedBalanceDisplayNum !== 0
                ? getFormattedNumber({
                      value: secondTokenCombinedBalanceDisplayNum,
                  })
                : '0.00';

        setSecondTokenBalanceForDom(secondTokenCombinedBalanceDisplayTruncated);
        Promise.resolve(
            cachedFetchTokenPrice(secondDefaultTokenData.address, chainId),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                const usdValueNum: number =
                    price.usdPrice *
                    (secondTokenCombinedBalanceDisplayNum ?? 0);
                const usdValueTruncated = getFormattedNumber({
                    value: usdValueNum,
                    isUSD: true,
                });
                setSecondTokenUsdValueForDom(usdValueTruncated);
            } else {
                if (!crocEnv || !nativeTokenUsdPrice) return;

                cachedQuerySpotPrice(
                    crocEnv,
                    ZERO_ADDRESS,
                    secondDefaultTokenData.address,
                    chainId,
                    Math.floor(Date.now() / CACHE_UPDATE_FREQ_IN_MS),
                ).then((ethPoolPriceNonDisplay) => {
                    if (!ethPoolPriceNonDisplay)
                        setSecondTokenUsdValueForDom(undefined);

                    const ethPoolPriceDisplay = toDisplayPrice(
                        ethPoolPriceNonDisplay,
                        18,
                        secondDefaultTokenData.decimals,
                    );
                    const usdValueNum: number =
                        ethPoolPriceDisplay *
                        nativeTokenUsdPrice *
                        (secondTokenCombinedBalanceDisplayNum ?? 0);
                    const usdValueTruncated = getFormattedNumber({
                        value: usdValueNum,
                        isUSD: true,
                    });
                    setSecondTokenUsdValueForDom(usdValueTruncated);
                });
            }
        });
    }, [chainId, JSON.stringify(secondDefaultTokenData)]);

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
            symbol: defaultPair[0]?.symbol,
            address: defaultPair[0]?.address,
            amount: nativeCombinedBalanceTruncated
                ? nativeData?.symbol === 'ETH'
                    ? 'Ξ ' + nativeCombinedBalanceTruncated
                    : nativeCombinedBalanceTruncated
                : '...',
            value: nativeTokenMainnetUsdValueTruncated,
            logoUri: defaultPair[0]?.logoURI || '',
        },
    ];

    tokensData.push({
        symbol: defaultPair[1]?.symbol,
        address: defaultPair[1]?.address,
        amount: secondTokenBalanceForDom
            ? parseFloat(secondTokenBalanceForDom ?? '0') === 0
                ? '0.00'
                : secondTokenBalanceForDom
            : '...',
        value: secondTokenUsdValueForDom
            ? parseFloat(secondTokenUsdValueForDom ?? '0') === 0
                ? '$0.00'
                : secondTokenUsdValueForDom
            : '...',
        logoUri:
            defaultPair[1]?.logoURI ||
            'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png',
    });

    return (
        <div
            className={styles.walletWrapper}
            style={{ padding: hideProfileCard ? '0' : '' }}
            tabIndex={0}
            aria-label={`Wallet menu for ${ensName ? ensName : accountAddress}`}
        >
            {!hideProfileCard && (
                <UserProfileCard
                    ensName={ensName !== '' ? ensName : ''}
                    accountAddress={props.accountAddress}
                    handleCopyAddress={handleCopyAddress}
                    accountAddressFull={props.accountAddressFull}
                />
            )}
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
                        address={tokenData.address}
                        logoUri={tokenData.logoUri}
                        key={JSON.stringify(tokenData)}
                    />
                ))}
            </section>
            {!hideProfileCard && (
                <div className={styles.actionsContainer}>
                    <Link
                        className={styles.accountLink}
                        to={'/account'}
                        aria-label='Go to the account page '
                        tabIndex={0}
                        onClick={clickOutsideHandler}
                    >
                        <CgProfile />
                        My Account
                    </Link>
                    <LogoutButton onClick={clickLogout} />
                </div>
            )}
        </div>
    );
}
