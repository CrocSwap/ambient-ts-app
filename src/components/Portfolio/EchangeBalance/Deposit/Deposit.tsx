import styles from './Deposit.module.css';
import DepositButton from './DepositButton/DepositButton';
import DepositCurrencySelector from './DepositCurrencySelector/DepositCurrencySelector';
import { defaultTokens } from '../../../../utils/data/defaultTokens';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';
import { useAppDispatch } from '../../../../utils/hooks/reduxToolkit';
import { setToken } from '../../../../utils/state/temp';
import { CrocEnv } from '@crocswap-libs/sdk';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';

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
}

export default function Deposit(props: PortfolioDepositProps) {
    const {
        crocEnv,
        tokenAllowance,
        connectedAccount,
        openGlobalModal,
        closeGlobalModal,
        selectedToken,
        tokenWalletBalance,
        tokenDexBalance,
        setRecheckTokenAllowance,
        setRecheckTokenBalances,
    } = props;

    const dispatch = useAppDispatch();

    const [depositQty, setDepositQty] = useState<number>(0);
    const [buttonMessage, setButtonMessage] = useState<string>('...');
    // const [isDepositAllowed, setIsDepositAllowed] = useState<boolean>(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

    const isTokenAllowanceSufficient = useMemo(
        () => (tokenAllowance !== '0.0' ? parseFloat(tokenAllowance) >= depositQty : false),
        [tokenAllowance, depositQty],
    );
    const isWalletBalanceSufficient = useMemo(
        () => (tokenWalletBalance !== '0.0' ? parseFloat(tokenWalletBalance) >= depositQty : false),
        [tokenWalletBalance, depositQty],
    );

    const isDepositQtyValid = useMemo(() => depositQty > 0, [depositQty]);

    const [isApprovalPending, setIsApprovalPending] = useState(false);
    const [isDepositPending, setIsDepositPending] = useState(false);

    useEffect(() => {
        // console.log({ isDepositQtyValid });
        // console.log({ isTokenAllowanceSufficient });
        if (!depositQty) {
            setIsButtonDisabled(true);
            setButtonMessage('Please Enter Token Quantity');
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

    const chooseToken = (tok: TokenIF) => {
        console.log(tok);
        dispatch(setToken(tok));
        closeGlobalModal();
    };

    const chooseTokenDiv = (
        <div>
            {defaultTokens
                .filter((token: TokenIF) => token.chainId === parseInt('0x5'))
                .map((token: TokenIF) => (
                    <button key={'button_to_set_' + token.name} onClick={() => chooseToken(token)}>
                        {token.name}
                    </button>
                ))}
        </div>
    );

    const deposit = async (depositQty: number) => {
        if (crocEnv && depositQty) {
            try {
                setIsDepositPending(true);
                const tx = await crocEnv
                    .token(selectedToken.address)
                    .deposit(depositQty, connectedAccount);
                if (tx) {
                    await tx.wait();
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
        await deposit(depositQty);
    };

    const approve = async (tokenAddress: string) => {
        if (!crocEnv) return;
        try {
            setIsApprovalPending(true);
            const tx = await crocEnv.token(tokenAddress).approve();
            if (tx) {
                await tx.wait();
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

    return (
        <div className={styles.deposit_container}>
            <div className={styles.info_text}>
                Deposit tokens to Ambient Finance exchange wallet
            </div>
            <DepositCurrencySelector
                fieldId='exchange-balance-deposit'
                onClick={() => openGlobalModal(chooseTokenDiv)}
                selectedToken={selectedToken}
                setDepositQty={setDepositQty}
            />
            <div className={styles.info_text}>
                {selectedToken.symbol} Wallet Balance: {tokenWalletBalance}
            </div>
            <div className={styles.info_text}>
                {selectedToken.symbol} Exchange Balance: {tokenDexBalance}
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
