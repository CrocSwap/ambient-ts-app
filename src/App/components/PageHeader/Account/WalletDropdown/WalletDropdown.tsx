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
import { CachedDataContext } from '../../../../../contexts/CachedDataContext';
import { USDC } from '../../../../../utils/tokens/exports';
import { tokenData } from '../../../../../utils/state/userDataSlice';
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
} from '../../../../../styled/Components/Header';
import { FlexContainer } from '../../../../../styled/Common';

interface WalletDropdownPropsIF {
    ensName: string;
    accountAddress: string;
    handleCopyAddress: () => void;
    clickOutsideHandler: () => void;
    connectorName: string | undefined;
    clickLogout: () => void;
    accountAddressFull: string;
    ethAmount: string;
    ethValue: string | undefined;
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
        ethAmount,
        ethValue,
    } = props;
    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const tokenDataFromRTK: tokenData = useAppSelector(
        (state) => state.userData.tokens,
    );
    const erc20Tokens: TokenIF[] = tokenDataFromRTK.erc20Tokens ?? [];
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
    if (tokenDataFromRTK.erc20Tokens) {
        usdcBalForDOM = usdcData?.combinedBalanceDisplayTruncated ?? '0.00';
    } else {
        usdcBalForDOM = '…';
    }

    const [usdcVal, setUsdcVal] = useState<string | undefined>();
    useEffect(() => {
        if (tokenDataFromRTK.erc20Tokens === undefined) {
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
    }, [chainId, JSON.stringify(tokenDataFromRTK)]);

    const tokensData = [
        {
            symbol: 'ETH',
            amount: ethAmount,
            value: ethValue,
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
            rounded={true}
            tabIndex={0}
            aria-label={`Wallet menu for ${ensName ? ensName : accountAddress}`}
        >
            <NameDisplayContainer gap={4} alignItems='center'>
                <Jazzicon
                    diameter={50}
                    seed={jsNumberForAddress(accountAddressFull.toLowerCase())}
                />

                <div>
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
                </div>
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
                <NavLink
                    to={'/account'}
                    className={styles.account_button}
                    aria-label='Go to the account page '
                    tabIndex={0}
                    onClick={clickOutsideHandler}
                >
                    <CgProfile />
                    My Account
                </NavLink>
                <LogoutButton onClick={clickLogout} />
            </ActionsContainer>
        </WalletWrapper>
    );
}
