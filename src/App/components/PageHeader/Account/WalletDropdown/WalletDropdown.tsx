import { FiCopy, FiExternalLink } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import {
    getChainExplorer,
    mktDataChainId,
} from '../../../../../utils/data/chains';
import { useContext, useEffect, useState } from 'react';
import { CrocEnvContext } from '../../../../../contexts/CrocEnvContext';
import { useAppSelector } from '../../../../../utils/hooks/reduxToolkit';
import { TokenIF } from '../../../../../utils/interfaces/exports';
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { USDC } from '../../../../../utils/tokens/exports';
import { getFormattedNumber } from '../../../../functions/getFormattedNumber';
import { LogoutButton } from '../../../../../components/Global/LogoutButton/LogoutButton';
import {
    NameDisplay,
    WalletDisplay,
    CopyButton,
    TokenContainer,
    LogoName,
    TokenAmount,
    ActionsContainer,
    NameDisplayContainer,
    WalletContent,
    WalletWrapper,
    AccountLink,
} from '../../../../../styled/Components/Header';
import { FlexContainer } from '../../../../../styled/Common';
import { ZERO_ADDRESS } from '../../../../../constants';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
    connectorName: string | undefined;
    clickLogout: () => void;
    accountAddressFull: string;
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
        connectorName,
        clickLogout,
        accountAddressFull,
    } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const tokenBalances: TokenIF[] | undefined = useAppSelector(
        (state) => state.userData.tokenBalances,
    );
    const nativeData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find((tkn: TokenIF) => tkn.address === ZERO_ADDRESS);
    const usdcAddr: string = USDC[chainId as '0x1'];
    const usdcData: TokenIF | undefined =
        tokenBalances &&
        tokenBalances.find(
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
            <TokenContainer tabIndex={0} aria-label={ariaLabel}>
                <LogoName alignItems='center' gap={4}>
                    <img src={logo} alt='' />
                    <h3>{symbol}</h3>
                </LogoName>
                <TokenAmount gap={4} flexDirection={'column'}>
                    <h3>{amount}</h3>
                    <h6>{value !== undefined ? '$' + value : '...'}</h6>
                </TokenAmount>
            </TokenContainer>
        );
    }

    let usdcBalForDOM: string;
    if (tokenBalances) {
        usdcBalForDOM = usdcData?.combinedBalanceDisplayTruncated ?? '...';
    } else {
        usdcBalForDOM = '…';
    }

    const [usdcVal, setUsdcVal] = useState<string | undefined>();
    useEffect(() => {
        if (tokenBalances === undefined) {
            setUsdcVal(undefined);
            return;
        }
        const usdBal: number = parseFloat(
            usdcData?.combinedBalanceDisplay ?? '0.00',
        );
        Promise.resolve(
            cachedFetchTokenPrice(
                USDC[mktDataChainId(chainId) as '0x1'],
                chainId,
            ),
        ).then((price) => {
            if (price?.usdPrice !== undefined) {
                const usdValueNum: number =
                    (price && price?.usdPrice * usdBal) ?? 0;
                const usdValueTruncated = getFormattedNumber({
                    value: usdValueNum,
                    minFracDigits: 2,
                    maxFracDigits: 2,
                });
                setUsdcVal(usdValueTruncated);
            } else {
                setUsdcVal(undefined);
            }
        });
    }, [chainId, JSON.stringify(tokenBalances)]);

    const { ethMainnetUsdPrice } = useContext(CrocEnvContext);

    const ethMainnetUsdValue =
        ethMainnetUsdPrice !== undefined &&
        nativeData?.combinedBalanceDisplayTruncated !== undefined
            ? ethMainnetUsdPrice *
              parseFloat(
                  nativeData?.combinedBalanceDisplayTruncated.replaceAll(
                      ',',
                      '',
                  ),
              )
            : undefined;

    const nativeTokenMainnetUsdValueTruncated = ethMainnetUsdValue
        ? getFormattedNumber({
              value: ethMainnetUsdValue,
              minFracDigits: 2,
              maxFracDigits: 2,
          })
        : undefined;

    const tokensData = [
        {
            symbol: nativeData?.symbol || 'ETH',
            amount: nativeData?.combinedBalanceDisplayTruncated
                ? nativeData?.symbol === 'ETH'
                    ? 'Ξ ' + nativeData.combinedBalanceDisplayTruncated
                    : nativeData.combinedBalanceDisplayTruncated
                : '...',
            value: nativeTokenMainnetUsdValueTruncated,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
        },
        {
            symbol: 'USDC',
            amount: usdcBalForDOM,
            value: usdcVal,
            logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
        },
    ];

    return (
        <WalletWrapper
            flexDirection='column'
            justifyContent='space-between'
            gap={16}
            rounded
            tabIndex={0}
            aria-label={`Wallet menu for ${ensName ? ensName : accountAddress}`}
        >
            <NameDisplayContainer gap={4} alignItems='center'>
                <Jazzicon
                    diameter={50}
                    seed={jsNumberForAddress(accountAddressFull.toLowerCase())}
                />

                <FlexContainer alignItems='center' flexDirection='column'>
                    <NameDisplay gap={16} alignItems='center'>
                        <h2>{ensName !== '' ? ensName : accountAddress}</h2>
                        <a
                            target='_blank'
                            rel='noreferrer'
                            href={`${blockExplorer}address/${accountAddressFull}`}
                            aria-label='View address on Etherscan'
                        >
                            <FiExternalLink />
                        </a>
                        <CopyButton
                            onClick={handleCopyAddress}
                            aria-label='Copy address to clipboard'
                        >
                            <FiCopy />
                        </CopyButton>
                    </NameDisplay>
                    <WalletDisplay gap={16} alignItems='center'>
                        <p>{connectorName}</p>
                        <p>{props.accountAddress}</p>
                    </WalletDisplay>
                </FlexContainer>
            </NameDisplayContainer>
            <WalletContent>
                {tokensData.map((tokenData) => (
                    <TokenAmountDisplay
                        amount={tokenData.amount}
                        value={tokenData.value}
                        symbol={tokenData.symbol}
                        logo={tokenData.logo}
                        key={JSON.stringify(tokenData)}
                    />
                ))}
            </WalletContent>
            <ActionsContainer numCols={2} gapSize={16} fullWidth={true}>
                <AccountLink
                    to={'/account'}
                    aria-label='Go to the account page '
                    tabIndex={0}
                    onClick={clickOutsideHandler}
                >
                    <CgProfile />
                    My Account
                </AccountLink>
                <LogoutButton onClick={clickLogout} />
            </ActionsContainer>
        </WalletWrapper>
    );
}
