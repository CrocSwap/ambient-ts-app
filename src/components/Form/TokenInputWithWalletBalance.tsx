import { memo, useContext, useEffect, useState } from 'react';
import { getFormattedNumber } from '../../App/functions/getFormattedNumber';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { formatTokenInput } from '../../utils/numbers';
import TokenInputQuantity from './TokenInputQuantity';
import { RefreshButton } from '../../styled/Components/TradeModules';
import { FiRefreshCw } from 'react-icons/fi';
import WalletBalanceSubinfo from './WalletBalanceSubinfo';
import { CachedDataContext } from '../../contexts/CachedDataContext';
import { CrocEnvContext } from '../../contexts/CrocEnvContext';
import { translateTestnetToken } from '../../utils/data/testnetTokenMap';
interface propsIF {
    tokenAorB: 'A' | 'B';
    token: TokenIF;
    tokenInput: string;
    isTokenEth: boolean;
    isDexSelected: boolean;
    showPulseAnimation: boolean;
    handleTokenInputEvent: (val: string) => void;
    reverseTokens: () => void;
    handleToggleDexSelection: () => void;
    handleRefresh?: () => void;
    parseTokenInput?: (val: string, isMax?: boolean) => void | string;
    fieldId?: string;
    isLoading?: boolean;
    showWallet?: boolean;
    hideWalletMaxButton?: boolean;
    tokenBalance?: string;
    tokenDexBalance?: string;
    isWithdraw?: boolean;
    disabledContent?: React.ReactNode;
    amountToReduceEth?: number;
}

function TokenInputWithWalletBalance(props: propsIF) {
    const {
        fieldId,
        tokenAorB,
        token,
        tokenInput,
        tokenBalance,
        tokenDexBalance,
        isTokenEth,
        isDexSelected,
        isWithdraw,
        showPulseAnimation,
        isLoading,
        showWallet,
        hideWalletMaxButton,
        disabledContent,
        handleTokenInputEvent,
        reverseTokens,
        handleToggleDexSelection,
        parseTokenInput,
        handleRefresh,
        amountToReduceEth,
    } = props;

    const {
        chainData: { chainId },
    } = useContext(CrocEnvContext);

    const amountToReduceEthMainnet = 0.01; // .01 ETH
    const amountToReduceEthScroll = 0.0003; // .0003 ETH

    const ethOffset = amountToReduceEth
        ? amountToReduceEth
        : chainId === '0x82750' || chainId === '0x8274f'
        ? amountToReduceEthScroll
        : amountToReduceEthMainnet;

    const [usdValueForDom, setUsdValueForDom] = useState<string | undefined>();

    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const pricedToken = translateTestnetToken(token.address);

    useEffect(() => {
        Promise.resolve(cachedFetchTokenPrice(pricedToken, chainId)).then(
            (price) => {
                if (price?.usdPrice !== undefined) {
                    const usdValueNum: number | undefined =
                        price !== undefined && tokenInput !== ''
                            ? price.usdPrice * parseFloat(tokenInput)
                            : undefined;
                    const usdValueTruncated =
                        usdValueNum !== undefined
                            ? getFormattedNumber({
                                  value: usdValueNum,
                                  isUSD: true,
                              })
                            : undefined;
                    usdValueTruncated !== undefined
                        ? setUsdValueForDom(usdValueTruncated)
                        : setUsdValueForDom('');
                } else {
                    setUsdValueForDom(undefined);
                }
            },
        );
    }, [chainId, pricedToken, tokenInput]);

    const toDecimal = (val: string) =>
        isTokenEth ? parseFloat(val).toFixed(18) : parseFloat(val).toString();

    const walletBalance = tokenBalance ? toDecimal(tokenBalance) : '...';
    const walletAndExchangeBalance =
        tokenBalance && tokenDexBalance
            ? toDecimal(
                  (
                      parseFloat(tokenBalance) + parseFloat(tokenDexBalance)
                  ).toString(),
              )
            : '...';
    const balance = !isDexSelected ? walletBalance : walletAndExchangeBalance;
    const balanceToDisplay = getFormattedNumber({
        value: parseFloat(balance) ?? undefined,
    });

    const subtractBuffer = (balance: string) =>
        isTokenEth ? (parseFloat(balance) - ethOffset).toFixed(18) : balance;

    const balanceWithBuffer = balance ? subtractBuffer(balance) : '...';

    const handleMaxButtonClick = () => {
        if (
            formatTokenInput(balanceWithBuffer, token, true) !== tokenInput &&
            parseFloat(balanceWithBuffer) > 0
        ) {
            parseTokenInput && parseTokenInput(balanceWithBuffer, true);
            handleTokenInputEvent(
                formatTokenInput(balanceWithBuffer, token, true),
            );
        }
    };

    const handleToggleDex = () => {
        // if the sell token quantity is maximized and the user switches to use exchange balance,
        // then the quantity should be updated to the exchange balance maximum
        if (
            tokenAorB === 'A' &&
            parseFloat(formatTokenInput(balanceWithBuffer, token)) ===
                parseFloat(tokenInput)
        ) {
            const balance = subtractBuffer(
                isDexSelected ? walletBalance : walletAndExchangeBalance,
            );
            parseTokenInput && parseTokenInput(balance);
            handleTokenInputEvent(balance);
        }
        handleToggleDexSelection();
    };

    const walletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={
                    isLoading || !usdValueForDom ? '' : usdValueForDom
                }
                showWallet={showWallet}
                isWithdraw={isWithdraw ?? tokenAorB === 'A'}
                balance={balanceToDisplay}
                availableBalance={parseFloat(balanceWithBuffer)}
                useExchangeBalance={
                    isDexSelected &&
                    !!tokenDexBalance &&
                    parseFloat(tokenDexBalance) > 0
                }
                isDexSelected={isDexSelected}
                onToggleDex={handleToggleDex}
                onMaxButtonClick={
                    !hideWalletMaxButton ? handleMaxButtonClick : undefined
                }
                onRefresh={handleRefresh}
            />
        </>
    );

    return (
        <>
            <TokenInputQuantity
                fieldId={fieldId}
                token={token}
                tokenAorB={tokenAorB}
                value={tokenInput}
                handleTokenInputEvent={handleTokenInputEvent}
                reverseTokens={reverseTokens}
                isLoading={isLoading}
                includeWallet={walletContent}
                showPulseAnimation={showPulseAnimation}
                parseInput={parseTokenInput}
                disabledContent={disabledContent}
            />
            {handleRefresh && (
                <RefreshButton
                    onClick={handleRefresh}
                    aria-label='Refresh data'
                >
                    <FiRefreshCw size={18} />
                </RefreshButton>
            )}
        </>
    );
}

export default memo(TokenInputWithWalletBalance);
