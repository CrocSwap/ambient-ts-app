import {
    ChangeEvent,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { TokenIF, VaultIF } from '../../../../../ambient-utils/types';
import {
    AppStateContext,
    CachedDataContext,
    ChainDataContext,
    CrocEnvContext,
    ReceiptContext,
    UserDataContext,
} from '../../../../../contexts';
import styles from './VaultDeposit.module.css';
import WalletBalanceSubinfo from '../../../../../components/Form/WalletBalanceSubinfo';
import {
    getFormattedNumber,
    precisionOfInput,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import { DefaultTooltip } from '../../../../../components/Global/StyledTooltip/StyledTooltip';
import Button from '../../../../../components/Form/Button';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import { FaGasPump } from 'react-icons/fa';
import {
    NUM_GWEI_IN_WEI,
    GAS_DROPS_ESTIMATE_VAULT_DEPOSIT,
} from '../../../../../ambient-utils/constants';
import { toDisplayQty } from '@crocswap-libs/sdk';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../../../utils/TransactionError';

interface Props {
    token0: TokenIF;
    token1: TokenIF;
    vault: VaultIF;
    onClose: () => void;
}
export default function VaultDeposit(props: Props) {
    const { token1, onClose, vault } = props;
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSubmitted, setShowSubmitted] = useState(false);
    const [depositGasPriceinDollars, setDepositGasPriceinDollars] = useState<
        string | undefined
    >();
    const [displayValue, setDisplayValue] = useState<string>('');
    const [depositBigint, setDepositBigint] = useState<bigint | undefined>();
    const [token1Price, setToken1Price] = useState<number | undefined>();
    const [token1BalanceBigint, setToken1BalanceBigint] = useState<
        bigint | undefined
    >();
    const [token1Balance, setToken1Balance] = useState<string | undefined>();
    const [minDepositBigint, setMinDepositBigint] = useState<
        bigint | undefined
    >();

    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { isUserConnected } = useContext(UserDataContext);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { ethMainnetUsdPrice, crocEnv } = useContext(CrocEnvContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const { userAddress } = useContext(UserDataContext);
    const { cachedFetchTokenPrice } = useContext(CachedDataContext);

    const depositGreaterOrEqualToMinimum = useMemo(
        () =>
            depositBigint !== undefined &&
            minDepositBigint !== undefined &&
            depositBigint >= minDepositBigint,
        [minDepositBigint, depositBigint],
    );

    const depositGreaterThanWalletBalance = useMemo(
        () =>
            depositBigint !== undefined &&
            token1BalanceBigint !== undefined &&
            depositBigint > token1BalanceBigint,
        [token1BalanceBigint, depositBigint],
    );

    // calculate price of gas for vault deposit
    useEffect(() => {
        if (crocEnv) {
            (async () => {
                const baseTokenPrice =
                    (
                        await cachedFetchTokenPrice(
                            token1.address,
                            chainId,
                            crocEnv,
                        )
                    )?.usdPrice || 0.0;

                setToken1Price(baseTokenPrice);
            })();
        }
    }, [crocEnv]);

    // calculate price of gas for vault deposit
    useEffect(() => {
        if (crocEnv) {
            if (!userAddress) {
                setToken1Balance(undefined);
            } else {
                (async () => {
                    crocEnv
                        .token(token1.address)
                        .wallet(userAddress)
                        .then((bal: bigint) => {
                            setToken1BalanceBigint(bal);
                            const displayBalance = toDisplayQty(
                                bal,
                                token1.decimals,
                            );
                            setToken1Balance(displayBalance);
                        })
                        .catch(console.error);
                    crocEnv
                        .tempestVault(vault.address, vault.token1Address)
                        .minDeposit()
                        .then((min: bigint) => {
                            setMinDepositBigint(min);
                        })
                        .catch(console.error);
                })();
            }
        }
    }, [crocEnv, userAddress, vault]);

    // calculate price of gas for vault deposit
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                Number(NUM_GWEI_IN_WEI) *
                ethMainnetUsdPrice *
                Number(GAS_DROPS_ESTIMATE_VAULT_DEPOSIT);

            setDepositGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const submitDeposit = async () => {
        if (!crocEnv || !userAddress || !vault || !depositBigint) return;
        console.log('deposit submitted');
        setShowSubmitted(true);
        console.log({ depositBigint });

        const tx = await crocEnv
            .tempestVault(vault.address, vault.token1Address)
            .depositZap(depositBigint)
            .catch(console.error);

        if (tx?.hash) {
            addPendingTx(tx?.hash);
            addTransactionByType({
                userAddress: userAddress || '',
                txHash: tx.hash,
                txType: 'Deposit',
                txDescription: `Deposit of ${token1.symbol}`,
            });
        } else {
            setShowSubmitted(false);
        }
        let receipt;
        try {
            if (tx) receipt = await tx.wait();
        } catch (e) {
            const error = e as TransactionError;
            setShowSubmitted(false);
            console.error({ error });
            // The user used "speed up" or something similar
            // in their client, but we now have the updated info
            if (isTransactionReplacedError(error)) {
                removePendingTx(error.hash);

                const newTransactionHash = error.replacement.hash;
                addPendingTx(newTransactionHash);

                updateTransactionHash(error.hash, error.replacement.hash);
                receipt = error.receipt;
            } else if (isTransactionFailedError(error)) {
                console.error({ error });
                receipt = error.receipt;
            }
        }

        if (receipt) {
            addReceipt(JSON.stringify(receipt));
            removePendingTx(receipt.hash);
        }
    };

    const usdValueForDom =
        token1Price && parseFloat(displayValue) > 0
            ? getFormattedNumber({
                  value: token1Price * parseFloat(displayValue),
                  prefix: '$',
              })
            : '';

    const walletBalanceDisplay = token1Balance ? token1Balance : '...';

    const balanceToDisplay = getFormattedNumber({
        value: parseFloat(walletBalanceDisplay) ?? undefined,
    });

    const walletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={usdValueForDom ?? '…'}
                percentDiffUsdValue={123}
                showWallet={isUserConnected}
                isWithdraw={false}
                balance={balanceToDisplay}
                availableBalance={token1BalanceBigint}
                useExchangeBalance={
                    // isDexSelected &&
                    // !!tokenDexBalance &&
                    // parseFloat(tokenDexBalance) > 0
                    false
                }
                isDexSelected={false}
                onToggleDex={() => console.log('handleToggleDex')}
                onMaxButtonClick={() =>
                    handleTokenInputEvent(walletBalanceDisplay)
                }
            />
        </>
    );
    const handleTokenInputEvent = (input: string) => {
        setDisplayValue(input);
        if (input === '') {
            setDepositBigint(undefined);
            return;
        }
        const inputBigint = BigInt(parseFloat(input) * 10 ** token1.decimals);
        setDepositBigint(inputBigint);
    };
    const token = token1;

    const fieldId = 'vault_deposit_input';
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
        let inputStringNoCommas = event.target.value
            .replace(/,/g, '.') // Replace commas with dots
            .replace(/\s+/g, ''); // Remove any spaces

        if (inputStringNoCommas === '.') inputStringNoCommas = '0.';

        const inputStringNoUnfinishedExponent = isNaN(+inputStringNoCommas)
            ? inputStringNoCommas.replace(
                  /e[+-]?(?!\d)/gi, // Match 'e', 'e-' or 'e+' only if NOT followed by a number
                  '',
              )
            : inputStringNoCommas;

        const isPrecisionGreaterThanDecimals =
            precisionOfInput(inputStringNoCommas) > token.decimals;

        if (
            !isPrecisionGreaterThanDecimals &&
            !isNaN(+inputStringNoUnfinishedExponent)
        ) {
            handleTokenInputEvent(inputStringNoCommas);
        }
    };

    const input = (
        <input
            className={styles.tokenQuantityInput}
            id={fieldId ? `${fieldId}_qty` : undefined}
            placeholder={showConfirmation ? displayValue : '0.0'}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
            value={displayValue}
            type='string'
            step='any'
            inputMode='decimal'
            autoComplete='off'
            autoCorrect='off'
            min='0'
            minLength={1}
            disabled={showConfirmation}
        />
    );

    const tokenSymbol =
        token?.symbol?.length > 4 ? (
            <DefaultTooltip
                title={token.symbol}
                placement={'top'}
                arrow
                enterDelay={700}
                leaveDelay={200}
            >
                <>{token.symbol}</>
            </DefaultTooltip>
        ) : (
            <>{token.symbol}</>
        );

    const tokenSelectRef = useRef(null);

    const tokenSelectButton = (
        <button
            className={`${styles.tokenSelectButton} ${styles.justDisplay}
            }`}
            id={fieldId ? `${fieldId}_token_selector` : undefined}
            onClick={undefined}
            tabIndex={0}
            aria-label='Open swap sell token modal.'
            ref={tokenSelectRef}
            style={{
                borderRadius: '50px',
            }}
        >
            <TokenIcon
                token={token}
                src={uriToHttp(token.logoURI)}
                alt={token.symbol}
                size='2xl'
            />
            {tokenSymbol}
        </button>
    );

    // const extraInfo = [
    //     {
    //         title: 'Expected Output',
    //         tooltipTitle:
    //             'Expected Conversion Rate After Price Impact and Provider Fee',
    //         data: '...',
    //         placement: 'bottom',
    //     },
    //     {
    //         title: 'Price Impact',
    //         tooltipTitle: 'Expected Pool Price After Swap',
    //         data: '...',
    //         placement: 'bottom',
    //     },
    //     {
    //         title: 'Slippage Tolerance',
    //         tooltipTitle: 'Expected Pool Price After Swap',
    //         data: '...',
    //         placement: 'bottom',
    //     },
    //     {
    //         title: 'Liquidity Provider Fee',
    //         tooltipTitle: 'Expected Pool Price After Swap',
    //         data: '...',
    //         placement: 'bottom',
    //     },
    // ];

    // const confirmationDetails = (
    //     <div className={styles.confContainer}>

    //     <div className={styles.confDetails}>
    //         <div className={styles.confRow}>
    //             <p>Current Price</p>
    //             <p>1,690</p>
    //         </div>
    //         <div className={styles.confRow}>
    //             <p>Price Limit</p>
    //             <p>1,690</p>
    //         </div>
    //         <div className={styles.confRow}>
    //             <p>Slippage</p>
    //             <p>0.3%</p>
    //         </div>
    //         </div>

    //         <p>Output is estimated. You will swap up to 1.00ETH for USDC. You may swap less than 1.00ETH if the price moves beyond the limit shown above. You can increase the likelihood of swapping the full amound by increasing your slippage tolerance in the settings.</p>
    //     </div>
    // );
    const submittedButtonTitle = (
        <div className={styles.loading}>
            Submitting
            <span className={styles.dots}></span>
        </div>
    );

    const displayMinDeposit = minDepositBigint
        ? toDisplayQty(minDepositBigint, token1.decimals)
        : '…';

    const includeWallet = true;
    return (
        <Modal usingCustomHeader onClose={onClose}>
            <ModalHeader
                onClose={onClose}
                title={'Deposit'}
                onBackButton={() => setShowConfirmation(false)}
                showBackButton={showConfirmation}
            />
            <div className={styles.container}>
                <p
                    className={styles.disclaimer}
                >{`This deposit function uses "Zap Mode" to convert ${props.token1.symbol} deposit into vault position which holds both ${props.token1.symbol} and ${props.token0.symbol}. The value of a vault deposit will fluctuate with the value of both these tokens and their exchange rate.`}</p>
                <div className={styles.content}>
                    <div
                        className={styles.tokenQuantityContainer}
                        style={{ marginBottom: !includeWallet ? '8px' : '0' }}
                    >
                        {input}
                        {tokenSelectButton}
                    </div>
                    {includeWallet && !showConfirmation && walletContent}
                </div>

                <div className={styles.gas_row}>
                    <FaGasPump size={15} /> {depositGasPriceinDollars ?? '…'}
                </div>

                <div className={styles.buttonContainer}>
                    <Button
                        idForDOM='vault_deposit_submit'
                        style={{ textTransform: 'none' }}
                        title={
                            !depositBigint
                                ? 'Enter a Deposit Quantity'
                                : !depositGreaterOrEqualToMinimum
                                  ? `Minimum Deposit is ${displayMinDeposit} ${token1.symbol}`
                                  : depositGreaterThanWalletBalance
                                    ? 'Reduce Deposit Quantity'
                                    : showSubmitted
                                      ? submittedButtonTitle
                                      : 'Submit'
                        }
                        disabled={
                            showSubmitted ||
                            !depositGreaterOrEqualToMinimum ||
                            depositGreaterThanWalletBalance
                        }
                        action={() => submitDeposit()}
                        flat
                    />
                </div>
            </div>
        </Modal>
    );
}
