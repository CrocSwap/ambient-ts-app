import { useContext, useMemo } from 'react';
import { useApprove } from '../../App/functions/approve';
import Button from '../../components/Form/Button';
import { TokenIF } from '../../utils/interfaces/TokenIF';
import { IS_LOCAL_ENV } from '../../constants';
import { AppStateContext } from '../../contexts/AppStateContext';

interface PropsIF {
    tokenA: TokenIF;
    tokenB: TokenIF;
    tokenACollateral: string;
    tokenBCollateral: string;
    isTokenAInputDisabled: boolean;
    isWithdrawTokenAFromDexChecked: boolean;
    isMintLiqEnabled: boolean;
    tokenAAllowed: boolean;
    tokenBAllowed: boolean;
    erc20TokenWithDexBalance: TokenIF | undefined;
    rangeButtonErrorMessageTokenA: string;
    rangeButtonErrorMessageTokenB: string;
    setActiveContent: React.Dispatch<React.SetStateAction<string>>;
    initialPriceInBaseDenom: number | undefined;
    sendRangePosition: () => Promise<void>;
    sendInit: (
        initialPriceInBaseDenom: number | undefined,
        cb?: (() => void) | undefined,
    ) => Promise<void>;
    poolExists: boolean | null;
    isConnected: boolean;
    connectButtonDelayElapsed: boolean;
    isTokenAAllowanceSufficient: boolean;
    isTokenBAllowanceSufficient: boolean;
    isInitPending: boolean;
    initialPriceDisplay: string;
    advancedHighTick: number;
    advancedLowTick: number;
}
export default function InitButton(props: PropsIF) {
    const {
        wagmiModal: { open: openWagmiModalWallet },
    } = useContext(AppStateContext);
    const { approve, isApprovalPending } = useApprove();

    const {
        tokenA,
        tokenB,
        // eslint-disable-next-line
        // tokenACollateral,
        // tokenBCollateral,
        // isTokenAInputDisabled,
        // isWithdrawTokenAFromDexChecked,
        isMintLiqEnabled,
        tokenAAllowed,
        tokenBAllowed,
        erc20TokenWithDexBalance,
        rangeButtonErrorMessageTokenA,
        rangeButtonErrorMessageTokenB,
        setActiveContent,
        initialPriceInBaseDenom,
        sendRangePosition,
        sendInit,
        poolExists,
        isConnected,
        connectButtonDelayElapsed,
        isTokenAAllowanceSufficient,
        isTokenBAllowanceSufficient,
        initialPriceDisplay,
        isInitPending,
        advancedHighTick,
        advancedLowTick,
    } = props;

    const tokenAApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenA.symbol}`
                    : `${tokenA.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenA.address, tokenA.symbol);
            }}
            flat={true}
        />
    );

    const tokenBApprovalButton = (
        <Button
            title={
                !isApprovalPending
                    ? `Approve ${tokenB.symbol}`
                    : `${tokenB.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(tokenB.address, tokenB.symbol);
            }}
            flat={true}
        />
    );

    const confirmButton = useMemo(() => {
        const tokenInputValid = tokenAAllowed && tokenBAllowed;

        const disabled =
            erc20TokenWithDexBalance !== undefined || !tokenInputValid;
        const title = !tokenInputValid
            ? rangeButtonErrorMessageTokenA || rangeButtonErrorMessageTokenB
            : 'Confirm';
        return (
            <Button
                title={title}
                disabled={disabled}
                action={() => setActiveContent('confirmation')}
                flat={true}
            />
        );
    }, [
        tokenAAllowed,
        tokenBAllowed,
        erc20TokenWithDexBalance,
        rangeButtonErrorMessageTokenA,
        rangeButtonErrorMessageTokenB,
        initialPriceInBaseDenom,
        isMintLiqEnabled,
        sendRangePosition,
        sendInit,
    ]);

    const poolExistsButton = (
        <Button
            title='Pool Already Initialized'
            disabled={true}
            action={() => {
                IS_LOCAL_ENV && console.debug('clicked');
            }}
            flat={true}
        />
    );

    const enterInitialPriceButton = (
        <Button
            title='Enter an Initial Price'
            disabled={true}
            action={() => {
                IS_LOCAL_ENV && console.debug('clicked');
            }}
            flat={true}
        />
    );

    const initializationPendingButton = (
        <Button
            title='Initialization Pending'
            disabled={true}
            action={() => {
                IS_LOCAL_ENV && console.debug('clicked');
            }}
            flat={true}
        />
    );

    const invalidRangeButton = (
        <Button
            title='Invalid range'
            disabled={true}
            action={() => {
                IS_LOCAL_ENV && console.debug('clicked');
            }}
            flat={true}
        />
    );

    const ButtonToRender = () => {
        const initialPriceIsValid =
            initialPriceDisplay === '' ||
            parseFloat(initialPriceDisplay.replaceAll(',', '')) <= 0;

        if (poolExists) {
            return poolExistsButton;
        }

        if (isConnected || !connectButtonDelayElapsed) {
            if (!isTokenAAllowanceSufficient) {
                return tokenAApprovalButton;
            }

            if (!isTokenBAllowanceSufficient) {
                return tokenBApprovalButton;
            }

            if (initialPriceIsValid) {
                return enterInitialPriceButton;
            }

            if (isInitPending) {
                return initializationPendingButton;
            }

            if (
                advancedHighTick <= advancedLowTick &&
                !(advancedHighTick === 0 && advancedLowTick === 0)
            ) {
                return invalidRangeButton;
            }

            return confirmButton;
        }

        return (
            <Button
                title='Connect Wallet'
                action={openWagmiModalWallet}
                flat={true}
            />
        );
    };

    return <ButtonToRender />;
}
