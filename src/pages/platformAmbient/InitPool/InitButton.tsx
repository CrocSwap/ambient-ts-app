import { fromDisplayQty } from '@crocswap-libs/sdk';
import { ethers } from 'ethers';
import { useContext, useMemo } from 'react';
import { IS_LOCAL_ENV } from '../../../ambient-utils/constants';
import { MAINNET_TOKENS } from '../../../ambient-utils/constants/networks/ethereumMainnet';
import { TokenIF } from '../../../ambient-utils/types';
import { useApprove } from '../../../App/functions/approve';
import Button from '../../../components/Form/Button';
import { ChainDataContext } from '../../../contexts';
import { AppStateContext } from '../../../contexts/AppStateContext';

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
    defaultLowTick: number;
    defaultHighTick: number;
    selectedPoolPriceTick: number;
    tokenAQtyCoveredByWalletBalance: bigint;
    tokenBQtyCoveredByWalletBalance: bigint;
    isTokenAPrimary: boolean;
    tokenABalance: string;
    tokenBBalance: string;
    tokenAAllowance: bigint | undefined;
    tokenBAllowance: bigint | undefined;
}
export default function InitButton(props: PropsIF) {
    const {
        walletModal: { open: openWalletModalWallet },
    } = useContext(AppStateContext);
    const { approve, isApprovalPending } = useApprove();

    const {
        tokenA,
        tokenB,
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
        defaultLowTick,
        defaultHighTick,
        selectedPoolPriceTick,
        tokenAQtyCoveredByWalletBalance,
        tokenBQtyCoveredByWalletBalance,
        isTokenAPrimary,
        tokenAAllowance,
        tokenBAllowance,
    } = props;

    const { isActiveNetworkPlume } = useContext(ChainDataContext);

    const tokenAQtyForApproval = isMintLiqEnabled
        ? tokenAQtyCoveredByWalletBalance +
          fromDisplayQty('0.1', tokenA.decimals)
        : fromDisplayQty('0.1', tokenA.decimals);
    const tokenBQtyForApproval = isMintLiqEnabled
        ? tokenBQtyCoveredByWalletBalance +
          fromDisplayQty('0.1', tokenB.decimals)
        : fromDisplayQty('0.1', tokenB.decimals);

    const isUsdtResetRequiredTokenA = useMemo(() => {
        return (
            tokenA.address.toLowerCase() ===
                MAINNET_TOKENS.USDT.address.toLowerCase() &&
            !!tokenAAllowance &&
            tokenAAllowance < tokenAQtyCoveredByWalletBalance
        );
    }, [tokenA.address, tokenAAllowance, tokenAQtyCoveredByWalletBalance]);

    const isUsdtResetRequiredTokenB = useMemo(() => {
        return (
            tokenB.address.toLowerCase() ===
                MAINNET_TOKENS.USDT.address.toLowerCase() &&
            !!tokenBAllowance &&
            tokenBAllowance < tokenBQtyCoveredByWalletBalance
        );
    }, [tokenB.address, tokenBAllowance, tokenBQtyCoveredByWalletBalance]);

    const tokenAApprovalButton = (
        <Button
            idForDOM='approve_token_A_button'
            style={{ textTransform: 'none' }}
            title={
                !isApprovalPending
                    ? isUsdtResetRequiredTokenA
                        ? 'Reset USDT Approval (Step 1/2)'
                        : `Approve ${tokenA.symbol}`
                    : isUsdtResetRequiredTokenA
                      ? 'USDT Approval Reset Pending...'
                      : `${tokenA.symbol} Approval Pending...`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(
                    tokenA.address,
                    tokenA.symbol,
                    undefined,
                    isUsdtResetRequiredTokenA
                        ? 0n
                        : isActiveNetworkPlume
                          ? isTokenAPrimary
                              ? tokenAQtyForApproval
                              : // add 1% buffer to avoid rounding errors
                                (tokenAQtyForApproval * 101n) / 100n
                          : ethers.MaxUint256,
                    // tokenABalance
                    //   ? fromDisplayQty(tokenABalance, tokenA.decimals)
                    //   : undefined,
                );
            }}
            flat={true}
        />
    );

    const tokenBApprovalButton = (
        <Button
            idForDOM='approve_token_b_for_init_page'
            style={{ textTransform: 'none' }}
            title={
                !isApprovalPending
                    ? isUsdtResetRequiredTokenB
                        ? 'Reset USDT Approval (Step 1/2)'
                        : `Approve ${tokenB.symbol}`
                    : isUsdtResetRequiredTokenB
                      ? 'USDT Approval Reset Pending...'
                      : `${tokenB.symbol} Approval Pending...`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approve(
                    tokenB.address,
                    tokenB.symbol,
                    undefined,
                    isUsdtResetRequiredTokenB
                        ? 0n
                        : isActiveNetworkPlume
                          ? !isTokenAPrimary
                              ? tokenBQtyForApproval
                              : // add 1% buffer to avoid rounding errors
                                (tokenBQtyForApproval * 101n) / 100n
                          : ethers.MaxUint256,
                    //  tokenBBalance
                    //   ? fromDisplayQty(tokenBBalance, tokenB.decimals)
                    //   : undefined,
                );
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
                idForDOM='confirm_new_pool_button'
                style={{ textTransform: 'none' }}
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
            idForDOM='pool_already_initialized_button'
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
            idForDOM='enter_initial_price_button'
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
            idForDOM='initialization_pending_button'
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
            idForDOM='invalid_range_indicated_button'
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
                isMintLiqEnabled &&
                ((defaultHighTick === 0 &&
                    defaultLowTick === 0 &&
                    selectedPoolPriceTick === 0) ||
                    (defaultHighTick <= defaultLowTick &&
                        !(defaultHighTick === 0 && defaultLowTick === 0)))
            ) {
                return invalidRangeButton;
            }

            return confirmButton;
        }

        return (
            <Button
                idForDOM='connect_wallet_init_page_button'
                title='Connect Wallet'
                action={openWalletModalWallet}
                flat={true}
            />
        );
    };

    return <ButtonToRender />;
}
