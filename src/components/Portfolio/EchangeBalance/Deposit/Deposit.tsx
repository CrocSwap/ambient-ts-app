import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
// import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
// import { setToken } from '../../../../utils/state/temp';
import { CrocEnv, toDisplayQty } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import {
    addPendingTx,
    addReceipt,
    removePendingTx,
} from '../../../../utils/state/receiptDataSlice';
import {
    isTransactionFailedError,
    isTransactionReplacedError,
    TransactionError,
} from '../../../../utils/TransactionError';
import { BigNumber } from 'ethers';
import { ZERO_ADDRESS } from '../../../../constants';
// import { formatAmountOld } from '../../../../utils/numbers';
interface PortfolioDepositProps {
    crocEnv: CrocEnv | undefined;
    connectedAccount: string;
    openGlobalModal: (content: React.ReactNode, title?: string) => void;
    closeGlobalModal: () => void;
    selectedToken: TokenIF;
    tokenAllowance: string;
    tokenWalletBalance: string;
    tokenDexBalance: string;
    setRecheckTokenAllowance: Dispatch<SetStateAction<boolean>>;
    setRecheckTokenBalances: Dispatch<SetStateAction<boolean>>;
    openTokenModal: () => void;
    selectedTokenDecimals: number;
    gasPriceInGwei: number | undefined;
}

export default function Deposit(props: PortfolioDepositProps) {
    const {
        crocEnv,
        tokenAllowance,
        connectedAccount,
        // openGlobalModal,
        // closeGlobalModal,
        selectedToken,
        tokenWalletBalance,
        tokenDexBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
        openTokenModal,
        selectedTokenDecimals,
        gasPriceInGwei,
    } = props;

    const dispatch = useAppDispatch();

    const isTokenEth = selectedToken.address === ZERO_ADDRESS;
    const tokenWalletBalanceAdjustedNonDisplayString =
        isTokenEth && !!gasPriceInGwei && !!tokenWalletBalance
            ? BigNumber.from(tokenWalletBalance)
                  .sub(BigNumber.from(Math.floor(gasPriceInGwei * 200000 * 1e8)))
                  //   .sub(BigNumber.from(Math.floor(1000000000000000)))
                  //   .sub(BigNumber.from(Math.floor(gasPriceInGwei * 11500000 * 1e-9)))
                  .toString()
            : tokenWalletBalance;

    const tokenWalletBalanceDisplay = tokenWalletBalance
        ? toDisplayQty(tokenWalletBalance, selectedTokenDecimals)
        : undefined;

    const tokenWalletBalanceDisplayNum = tokenWalletBalanceDisplay
        ? parseFloat(tokenWalletBalanceDisplay)
        : undefined;

    const tokenWalletBalanceTruncated = tokenWalletBalanceDisplayNum
        ? tokenWalletBalanceDisplayNum < 0.0001
            ? tokenWalletBalanceDisplayNum.toExponential(2)
            : tokenWalletBalanceDisplayNum < 2
            ? tokenWalletBalanceDisplayNum.toPrecision(3)
            : // : tokenWalletBalanceNum >= 100000
              // ? formatAmountOld(tokenWalletBalanceNum)
              tokenWalletBalanceDisplayNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const tokenDexBalanceNum = parseFloat(tokenDexBalance);

    const tokenDexBalanceTruncated = tokenDexBalanceNum
        ? tokenDexBalanceNum < 0.0001
            ? tokenDexBalanceNum.toExponential(2)
            : tokenDexBalanceNum < 2
            ? tokenDexBalanceNum.toPrecision(3)
            : // : tokenDexBalanceNum >= 100000
              // ? formatAmountOld(tokenDexBalanceNum)
              tokenDexBalanceNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : undefined;

    const [depositQty, setDepositQty] = useState<string | undefined>();
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    const isTokenAllowanceSufficient = useMemo(
        () =>
            tokenAllowance && depositQty
                ? BigNumber.from(tokenAllowance).gte(BigNumber.from(depositQty))
                : false,
        [tokenAllowance, depositQty],
    );
    const isWalletBalanceSufficient = useMemo(
        () =>
            tokenWalletBalance && depositQty
                ? BigNumber.from(tokenWalletBalance).gte(BigNumber.from(depositQty))
                : false,
        [tokenWalletBalance, depositQty],
    );

    const isDepositQtyValid = useMemo(() => depositQty !== undefined, [depositQty]);

    const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isDepositPending, setIsDepositPending] = useState(false);

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        // console.log({ isTokenAllowanceSufficient });
        if (!depositQty) {
            setIsButtonDisabled(true);
            setButtonMessage('Enter a Deposit Amount');
        } else if (isApprovalPending) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Approval Pending`);
        } else if (isDepositPending) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Deposit Pending`);
        } else if (!isWalletBalanceSufficient) {
            setIsButtonDisabled(true);
            setButtonMessage(`${selectedToken.symbol} Wallet Balance Insufficient`);
        } else if (!isTokenAllowanceSufficient) {
            setIsButtonDisabled(false);
            setButtonMessage(`Click to Approve ${selectedToken.symbol}`);
        } else if (isDepositQtyValid) {
            setIsButtonDisabled(false);
            setButtonMessage('Deposit');
        }
    }, [
        isApprovalPending,
        isDepositPending,
        isTokenAllowanceSufficient,
        isWalletBalanceSufficient,
        isDepositQtyValid,
        selectedToken.symbol,
    ]);

    // const chooseToken = (tok: TokenIF) => {
    //     console.log(tok);
    //     dispatch(setToken(tok));
    //     closeGlobalModal();
    // };

    // const chooseTokenDiv = (
    //     <div>
    //         {defaultTokens
    //             .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
    //             .map((token: TokenIF) => (
    //                 <button key={'button_to_set_' + token.name} onClick={() => chooseToken(token)}>
    //                     {token.name}
    //                 </button>
    //             ))}
    //     </div>
    // );

    const deposit = async (depositQty: string) => {
        if (crocEnv && depositQty) {
            try {
                const depositQtyDisplay = toDisplayQty(depositQty, selectedTokenDecimals);

                setIsDepositPending(true);

                const tx = await crocEnv
                    .token(selectedToken.address)
                    .deposit(depositQtyDisplay, connectedAccount);

                dispatch(addPendingTx(tx?.hash));

                let receipt;

                try {
                    if (tx) receipt = await tx.wait();
                } catch (e) {
                    const error = e as TransactionError;
                    console.log({ error });
                    // The user used "speed up" or something similar
                    // in their client, but we now have the updated info
                    if (isTransactionReplacedError(error)) {
                        console.log('repriced');
                        dispatch(removePendingTx(error.hash));

                        const newTransactionHash = error.replacement.hash;
                        dispatch(addPendingTx(newTransactionHash));

                        console.log({ newTransactionHash });
                        receipt = error.receipt;

                        //  if (newTransactionHash) {
                        //      fetch(
                        //          newSwapCacheEndpoint +
                        //              new URLSearchParams({
                        //                  tx: newTransactionHash,
                        //                  user: account ?? '',
                        //                  base: isSellTokenBase ? sellTokenAddress : buyTokenAddress,
                        //                  quote: isSellTokenBase
                        //                      ? buyTokenAddress
                        //                      : sellTokenAddress,
                        //                  poolIdx: (await env.context).chain.poolIndex.toString(),
                        //                  isBuy: isSellTokenBase.toString(),
                        //                  inBaseQty: inBaseQty.toString(),
                        //                  qty: crocQty.toString(),
                        //                  override: 'false',
                        //                  chainId: chainId,
                        //                  limitPrice: '0',
                        //                  minOut: '0',
                        //              }),
                        //      );
                        //  }
                    } else if (isTransactionFailedError(error)) {
                        // console.log({ error });
                        receipt = error.receipt;
                    }
                }

                if (receipt) {
                    dispatch(addReceipt(JSON.stringify(receipt)));
                    dispatch(removePendingTx(receipt.transactionHash));
                }
            } catch (error) {
                console.warn({ error });
            } finally {
                setIsDepositPending(false);
                setRecheckTokenBalances(true);
            }

            // crocEnv.token(selectedToken.address).deposit(1, wallet.address);
        }
    };

    const depositFn = async () => {
        if (tokenWalletBalanceAdjustedNonDisplayString)
            await deposit(tokenWalletBalanceAdjustedNonDisplayString);
    };

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) dispatch(addPendingTx(tx?.hash));
            let receipt;
            try {
                if (tx) receipt = await tx.wait();
            } catch (e) {
                const error = e as TransactionError;
                console.log({ error });
                // The user used "speed up" or something similar
                // in their client, but we now have the updated info
                if (isTransactionReplacedError(error)) {
                    console.log('repriced');
                    dispatch(removePendingTx(error.hash));

                    const newTransactionHash = error.replacement.hash;
                    dispatch(addPendingTx(newTransactionHash));

                    console.log({ newTransactionHash });
                    receipt = error.receipt;
                } else if (isTransactionFailedError(error)) {
                    // console.log({ error });
                    receipt = error.receipt;
                }
            }

            if (receipt) {
                dispatch(addReceipt(JSON.stringify(receipt)));
                dispatch(removePendingTx(receipt.transactionHash));
            }
        } catch (error) {
            console.warn({ error });
        } finally {
            setIsApprovalPending(false);
            setRecheckTokenAllowance(true);
        }
    };

    const approvalFn = async () => {
        await approve(selectedToken.address);
    };

    const handleBalanceClick = () => {
        setDepositQty(tokenWalletBalanceAdjustedNonDisplayString);

        const depositInput = document.getElementById(
            'exchange-balance-deposit-exchange-balance-deposit-quantity',
        ) as HTMLInputElement;

        if (depositInput && tokenWalletBalanceDisplay)
            depositInput.value = tokenWalletBalanceDisplay;
    };

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit collateral for future trading at lower gas costs:
            </div>
            <DepositCurrencySelector
                fieldId='exchange-balance-deposit'
                onClick={() => openTokenModal()}
                selectedToken={selectedToken}
                setDepositQty={setDepositQty}
            />
            <div className={styles.info_text}>
                Your Wallet Balance ({selectedToken.symbol}):{' '}
                <span className={styles.clickable_balance} onClick={handleBalanceClick}>
                    {tokenWalletBalanceTruncated}
                </span>
            </div>
            <div className={styles.info_text}>
                Your Exchange Balance ({selectedToken.symbol}):{' '}
                <span>{tokenDexBalanceTruncated}</span>
            </div>
            <DepositButton
                onClick={() => {
                    !isTokenAllowanceSufficient ? approvalFn() : depositFn();
                }}
                disabled={isButtonDisabled}
                buttonMessage={buttonMessage}
            />
        </div>
    );
}
