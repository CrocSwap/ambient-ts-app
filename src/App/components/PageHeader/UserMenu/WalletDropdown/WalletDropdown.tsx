import { CgProfile } from 'react-icons/cg';
import { getFormattedNumber } from '../../../../../ambient-utils/dataLayer';
import { useContext, useEffect, useMemo, useState } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { TokenIF } from '../../../../../ambient-utils/types';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { LogoutButton } from '../../../../../components/Global/LogoutButton/LogoutButton';
import styles from './WalletDropdown.module.css';

import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    ZERO_ADDRESS,
    supportedNetworks,
} from '../../../../../ambient-utils/constants';
import {
    TokenBalanceContext,
    TokenBalanceContextIF,
} from '../../../../../contexts/TokenBalanceContext';
import UserProfileCard from '../UserProfileCard';
import {
    ChainDataContext,
    ChainDataContextIF,
} from '../../../../../contexts/ChainDataContext';
import { Link } from 'react-router-dom';
import processLogoSrc from '../../../../../components/Global/TokenIcon/processLogoSrc';
import { TokenContext } from '../../../../../contexts';
import {
    AppStateContext,
    AppStateContextIF,
} from '../../../../../contexts/AppStateContext';

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
    } = useContext<AppStateContextIF>(AppStateContext);

    const { isActiveNetworkBlast, nativeTokenUsdPrice, isActiveNetworkPlume } =
        useContext<ChainDataContextIF>(ChainDataContext);

    const { tokens } = useContext(TokenContext);

    const { tokenBalances } =
        useContext<TokenBalanceContextIF>(TokenBalanceContext);
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

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    function TokenAmountDisplay(props: TokenAmountDisplayPropsIF): JSX.Element {
        const { logoUri, symbol, amount, value } = props;
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
                            token: tokens.getTokensByNameOrSymbol(symbol, chainId)[0],
                            symbol: symbol,
                            sourceURI: logoUri,
                        })}
                        alt=''
                    />
                    <h3>{symbol}</h3>
                </div>
                <div className={styles.tokenAmount}>
                    <h3>{amount}</h3>
                    <h6>{value !== undefined ? value : '...'}</h6>
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

    const { crocEnv } = useContext(CrocEnvContext);

    useEffect(() => {
        if (!crocEnv) return;

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
            cachedFetchTokenPrice(
                secondDefaultTokenData.address,
                chainId,
                crocEnv,
            ),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                const usdValueNum: number =
                    (price &&
                        price?.usdPrice *
                            (secondTokenCombinedBalanceDisplayNum ?? 0)) ??
                    0;
                const usdValueTruncated = getFormattedNumber({
                    value: usdValueNum,
                    isUSD: true,
                });
                setSecondTokenUsdValueForDom(usdValueTruncated);
            } else {
                setSecondTokenUsdValueForDom(undefined);
            }
        });
    }, [crocEnv, chainId, JSON.stringify(secondDefaultTokenData)]);

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
            logoUri:
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
    ];
    if (isActiveNetworkBlast) {
        tokensData.push({
            symbol: 'USDB',
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
                'https://assets-global.website-files.com/65a6baa1a3f8ed336f415cb4/65c67f0ebf2f6a1bd0feb13c_usdb-icon-yellow.png',
        });
    } else if (isActiveNetworkPlume) {
        tokensData.push({
            symbol: 'pUSD',
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
                'https://img.cryptorank.io/coins/plume_network1716480863760.png',
        });
    } else {
        tokensData.push({
            symbol: 'USDC',
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
                'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        });
    }

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
