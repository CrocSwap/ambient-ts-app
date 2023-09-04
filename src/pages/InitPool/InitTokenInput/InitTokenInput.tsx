import { Dispatch, SetStateAction, useContext } from 'react';
import TokenInput from '../../../components/Global/TokenInput/TokenInput';
import { ZERO_ADDRESS } from '../../../constants';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import { useAppSelector } from '../../../utils/hooks/reduxToolkit';
import { LocalPairDataIF } from '../../../utils/state/localPairDataSlice';
import { formatTokenInput } from '../../../utils/numbers';

interface PropsIF {
    baseTokenAddress: string;

    tokenABalance: string | undefined;
    tokenBBalance: string | undefined;
    tokenADexBalance: string | undefined;
    tokenBDexBalance: string | undefined;
    isWithdrawTokenAFromDexChecked: boolean;
    isWithdrawTokenBFromDexChecked: boolean;
    handleTokenAChangeEvent: (val: string) => void;
    handleTokenBChangeEvent: (val: string) => void;
    reverseTokens: () => void;
    toggleDexSelection: (tokenAorB: 'A' | 'B') => void;
    tokenAInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    tokenBInputQty: { value: string; set: Dispatch<SetStateAction<string>> };
    disabled: boolean;
}
export default function InitTokenInput(props: PropsIF) {
    // eslint-disable-next-line
    const {
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        handleTokenAChangeEvent,
        handleTokenBChangeEvent,
        tokenAInputQty: { value: tokenAInputQty, set: setTokenAInputQty },
        tokenBInputQty: { value: tokenBInputQty, set: setTokenBInputQty },
        toggleDexSelection,
        reverseTokens,
        // eslint-disable-next-line
        disabled,
    } = props;
    const localPair: LocalPairDataIF = useAppSelector(
        (state) => state.localPairData,
    );
    const { showRangePulseAnimation } = useContext(TradeTableContext);

    const [tokenA, tokenB] = localPair.tokens;

    const { isLoggedIn: isUserConnected } = useAppSelector(
        (state) => state.userData,
    );

    const isTokenAEth = tokenA.address === ZERO_ADDRESS;
    const isTokenBEth = tokenB.address === ZERO_ADDRESS;

    return (
        <section>
            <TokenInput
                fieldId='init_collateral_A'
                tokenAorB='A'
                token={tokenA}
                tokenInput={tokenAInputQty}
                tokenBalance={tokenABalance}
                tokenDexBalance={tokenADexBalance}
                isTokenEth={isTokenAEth}
                isDexSelected={isWithdrawTokenAFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenAChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('A')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenAInputQty(formatTokenInput(val, tokenA, isMax));
                }}
                showWallet={isUserConnected}
            />

            <TokenInput
                fieldId='init_collateral_B'
                tokenAorB='B'
                token={tokenB}
                tokenInput={tokenBInputQty}
                tokenBalance={tokenBBalance}
                tokenDexBalance={tokenBDexBalance}
                isTokenEth={isTokenBEth}
                isDexSelected={isWithdrawTokenBFromDexChecked}
                showPulseAnimation={showRangePulseAnimation}
                handleTokenInputEvent={handleTokenBChangeEvent}
                reverseTokens={reverseTokens}
                handleToggleDexSelection={() => toggleDexSelection('B')}
                parseTokenInput={(val: string, isMax?: boolean) => {
                    setTokenBInputQty(formatTokenInput(val, tokenB, isMax));
                }}
                showWallet={isUserConnected}
                isWithdraw
            />
        </section>
    );
}
