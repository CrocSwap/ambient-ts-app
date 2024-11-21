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
import { useApprove } from '../../../../../App/functions/approve';
import Toggle from '../../../../../components/Form/Toggle';

interface Props {
    mainAsset: TokenIF;
    secondaryAsset: TokenIF;
    vault: VaultIF;
    onClose: () => void;
}
export default function VaultDeposit(props: Props) {
    const { mainAsset, secondaryAsset, onClose, vault } = props;
    const { approveVault, isApprovalPending } = useApprove();
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [showSubmitted, setShowSubmitted] = useState(false);
    const [depositGasPriceinDollars, setDepositGasPriceinDollars] = useState<
        string | undefined
    >();
    const [displayValue, setDisplayValue] = useState<string>('');
    const [displayValueSecondary, setDisplayValueSecondary] =
        useState<string>('');
    const [depositBigint, setDepositBigint] = useState<bigint | undefined>();
    const [mainAssetPrice, setMainAssetPrice] = useState<number | undefined>();
    const [secondaryAssetPrice, setSecondaryAssetPrice] = useState<
        number | undefined
    >();
    const [mainAssetBalanceBigint, setMainAssetBalanceBigint] = useState<
        bigint | undefined
    >();
    const [secondaryAssetBalanceBigint, setSecondaryAssetBalanceBigint] =
        useState<bigint | undefined>();
    const [mainAssetBalance, setMainAssetBalance] = useState<
        string | undefined
    >();
    const [isZapOn, setIsZapOn] = useState(true);
    const [secondaryAssetBalance, setSecondaryAssetBalance] = useState<
        string | undefined
    >();
    const [minDepositBigint, setMinDepositBigint] = useState<
        bigint | undefined
    >();
    const [mainAssetApprovalBigint, setMainAssetApprovalBigint] = useState<
        bigint | undefined
    >();
    const { sessionReceipts } = useContext(ReceiptContext);

    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);
    const { isUserConnected } = useContext(UserDataContext);
    const { gasPriceInGwei, isActiveNetworkPlume } =
        useContext(ChainDataContext);
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

    const mainAssetDepositGreaterThanWalletBalance = useMemo(
        () =>
            depositBigint !== undefined &&
            mainAssetBalanceBigint !== undefined &&
            depositBigint > mainAssetBalanceBigint,
        [mainAssetBalanceBigint, depositBigint],
    );

    const secondaryAssetDepositGreaterThanWalletBalance = useMemo(
        () =>
            depositBigint !== undefined &&
            secondaryAssetBalanceBigint !== undefined &&
            depositBigint > secondaryAssetBalanceBigint,
        [secondaryAssetBalanceBigint, depositBigint],
    );

    const depositGreaterThanWalletAllowance = useMemo(
        () =>
            depositBigint !== undefined &&
            mainAssetApprovalBigint !== undefined &&
            depositBigint > mainAssetApprovalBigint,
        [mainAssetApprovalBigint, depositBigint],
    );

    // calculate price of gas for vault deposit
    useEffect(() => {
        if (crocEnv) {
            (async () => {
                const mainAssetPrice =
                    (
                        await cachedFetchTokenPrice(
                            mainAsset.address,
                            chainId,
                            crocEnv,
                        )
                    )?.usdPrice || 0.0;

                setMainAssetPrice(mainAssetPrice);
                const secondaryAssetPrice =
                    (
                        await cachedFetchTokenPrice(
                            secondaryAsset.address,
                            chainId,
                            crocEnv,
                        )
                    )?.usdPrice || 0.0;

                setSecondaryAssetPrice(secondaryAssetPrice);
            })();
        }
    }, [crocEnv]);

    // calculate price of gas for vault deposit
    useEffect(() => {
        if (crocEnv) {
            if (!userAddress) {
                setMainAssetBalance(undefined);
                setSecondaryAssetBalance(undefined);
            } else {
                (async () => {
                    crocEnv
                        .token(mainAsset.address)
                        .wallet(userAddress)
                        .then((bal: bigint) => {
                            setMainAssetBalanceBigint(bal);
                            const displayBalance = toDisplayQty(
                                bal,
                                mainAsset.decimals,
                            );
                            setMainAssetBalance(displayBalance);
                        })
                        .catch(console.error);
                    if (!isZapOn) {
                        crocEnv
                            .token(secondaryAsset.address)
                            .wallet(userAddress)
                            .then((bal: bigint) => {
                                setSecondaryAssetBalanceBigint(bal);
                                const displayBalance = toDisplayQty(
                                    bal,
                                    secondaryAsset.decimals,
                                );
                                setSecondaryAssetBalance(displayBalance);
                            })
                            .catch(console.error);
                    }
                    crocEnv
                        .tempestVault(vault.address, vault.mainAsset)
                        .minDeposit()
                        .then((min: bigint) => {
                            setMinDepositBigint(min);
                        })
                        .catch(console.error);
                    crocEnv
                        .tempestVault(vault.address, vault.mainAsset)
                        .allowance(userAddress)
                        .then((allowance: bigint) => {
                            setMainAssetApprovalBigint(allowance);
                        })
                        .catch(console.error);
                })();
            }
        }
    }, [crocEnv, userAddress, vault, sessionReceipts.length, isZapOn]);

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
        setShowSubmitted(true);

        const tx = await crocEnv
            .tempestVault(vault.address, vault.mainAsset)
            .depositZap(depositBigint)
            .catch(console.error);

        if (tx?.hash) {
            addPendingTx(tx?.hash);
            addTransactionByType({
                userAddress: userAddress || '',
                txHash: tx.hash,
                txType: 'Deposit',
                txDescription: `Deposit of ${mainAsset.symbol}`,
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
            setShowSubmitted(false);
        }
    };

    const mainAssetUsdValueForDom =
        mainAssetPrice && parseFloat(displayValue) > 0
            ? getFormattedNumber({
                  value: mainAssetPrice * parseFloat(displayValue),
                  prefix: '$',
              })
            : '';

    const secondaryAssetUsdValueForDom =
        secondaryAssetPrice && parseFloat(displayValue) > 0
            ? getFormattedNumber({
                  value:
                      secondaryAssetPrice * parseFloat(displayValueSecondary),
                  prefix: '$',
              })
            : '';

    const mainAssetWalletBalanceDisplay = mainAssetBalance
        ? mainAssetBalance
        : '...';
    const secondaryAssetWalletBalanceDisplay = secondaryAssetBalance
        ? secondaryAssetBalance
        : '...';

    const mainAssetBalanceToDisplay = getFormattedNumber({
        value: parseFloat(mainAssetWalletBalanceDisplay) ?? undefined,
    });

    const secondaryAssetBalanceToDisplay = getFormattedNumber({
        value: parseFloat(secondaryAssetWalletBalanceDisplay) ?? undefined,
    });

    const mainAssetWalletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={mainAssetUsdValueForDom ?? '…'}
                percentDiffUsdValue={123}
                showWallet={isUserConnected}
                isWithdraw={false}
                balance={mainAssetBalanceToDisplay}
                availableBalance={mainAssetBalanceBigint}
                useExchangeBalance={false}
                isDexSelected={false}
                onToggleDex={() => console.log('handleToggleDex')}
                onMaxButtonClick={() =>
                    handleTokenInputEvent(mainAssetWalletBalanceDisplay, 'main')
                }
            />
        </>
    );

    const secondaryAssetWalletContent = (
        <>
            <WalletBalanceSubinfo
                usdValueForDom={secondaryAssetUsdValueForDom ?? '…'}
                percentDiffUsdValue={123}
                showWallet={isUserConnected}
                isWithdraw={false}
                balance={secondaryAssetBalanceToDisplay}
                availableBalance={secondaryAssetBalanceBigint}
                useExchangeBalance={false}
                isDexSelected={false}
                onToggleDex={() => console.log('handleToggleDex')}
                onMaxButtonClick={() =>
                    handleTokenInputEvent(
                        secondaryAssetWalletBalanceDisplay,
                        'secondary',
                    )
                }
            />
        </>
    );
    const handleTokenInputEvent = (
        input: string,
        type: 'main' | 'secondary',
    ) => {
        if (type === 'main') {
            setDisplayValue(input);
        } else {
            setDisplayValueSecondary(input);
        }

        if (input === '') {
            setDepositBigint(undefined);
            return;
        }

        const inputBigint = BigInt(
            parseFloat(input) * 10 ** mainAsset.decimals,
        );
        setDepositBigint(inputBigint);
    };

    const token = mainAsset;

    const onChange = (
        event: ChangeEvent<HTMLInputElement>,
        type: 'main' | 'secondary',
    ) => {
        let inputStringNoCommas = event.target.value
            .replace(/,/g, '.') // Replace commas with dots
            .replace(/\s+/g, ''); // Remove any spaces

        if (inputStringNoCommas === '.') inputStringNoCommas = '0.';

        // Handle different logic based on 'main' or 'secondary'
        const adjustedString = inputStringNoCommas;
        // type === 'secondary'
        //     ? inputStringNoCommas.replace(/\./g, ',') // Example modification
        //     : inputStringNoCommas;

        const inputStringNoUnfinishedExponent = isNaN(+adjustedString)
            ? adjustedString.replace(
                  /e[+-]?(?!\d)/gi, // Match 'e', 'e-' or 'e+' only if NOT followed by a number
                  '',
              )
            : adjustedString;

        const isPrecisionGreaterThanDecimals =
            precisionOfInput(adjustedString) > token.decimals;

        if (
            !isPrecisionGreaterThanDecimals &&
            !isNaN(+inputStringNoUnfinishedExponent)
        ) {
            handleTokenInputEvent(adjustedString, type); // Call the unified function with `type`
        }
    };

    const renderInput = (type: 'main' | 'secondary') => (
        <input
            className={styles.tokenQuantityInput}
            id={type === 'main' ? 'vault_main_qty' : 'vault_secondary_qty'}
            placeholder={
                showConfirmation
                    ? type === 'main'
                        ? displayValue
                        : displayValueSecondary
                    : '0.0'
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(event, type)
            }
            value={type === 'main' ? displayValue : displayValueSecondary}
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
    // ---------------------------------------------------

    const renderTokenSymbol = (symbol?: string) =>
        symbol && symbol.length > 4 ? (
            <DefaultTooltip
                title={symbol}
                placement={'top'}
                arrow
                enterDelay={700}
                leaveDelay={200}
            >
                <>{symbol}</>
            </DefaultTooltip>
        ) : (
            <>{symbol}</>
        );

    // ---------------------------------------------------
    const tokenSelectRef = useRef(null);
    const renderTokenSelectButton = (
        id: string,
        token: TokenIF,
        tokenSymbol: React.ReactNode,
    ) => (
        <button
            className={`${styles.tokenSelectButton} ${styles.justDisplay}`}
            id={id}
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
    // ---------------------------------------------------

    const inputMain = renderInput('main');
    const inputSecondary = renderInput('secondary');

    const tokenSymbolMain = renderTokenSymbol(mainAsset?.symbol);
    const tokenSymbolSecondary = renderTokenSymbol(secondaryAsset?.symbol);

    const tokenSelectButtonMain = renderTokenSelectButton(
        'main_vault_deposit_token_selector',
        mainAsset,
        tokenSymbolMain,
    );

    const tokenSelectButtonSecondary = renderTokenSelectButton(
        'secondary_vault_deposit_token_selector',
        secondaryAsset,
        tokenSymbolSecondary,
    );

    const submittedButtonTitle = (
        <div className={styles.loading}>
            Submitting
            <span className={styles.dots}></span>
        </div>
    );

    const displayMinDeposit = minDepositBigint
        ? toDisplayQty(minDepositBigint, mainAsset.decimals)
        : '…';

    const approveButton = (
        <Button
            idForDOM='approve_vault_button'
            style={{ textTransform: 'none' }}
            title={
                !isApprovalPending
                    ? `Approve ${mainAsset.symbol} / ${secondaryAsset.symbol}`
                    : `${mainAsset.symbol} / ${secondaryAsset.symbol} Approval Pending`
            }
            disabled={isApprovalPending}
            action={async () => {
                await approveVault(
                    vault,
                    mainAsset,
                    secondaryAsset,
                    undefined,
                    isActiveNetworkPlume ? depositBigint : undefined,
                );
            }}
            flat={true}
        />
    );

    const submitButton = (
        <Button
            idForDOM='vault_deposit_submit'
            style={{ textTransform: 'none' }}
            title={
                showSubmitted
                    ? submittedButtonTitle
                    : !depositBigint
                      ? 'Enter a Deposit Quantity'
                      : !depositGreaterOrEqualToMinimum
                        ? `Minimum Deposit is ${displayMinDeposit} ${mainAsset.symbol}`
                        : mainAssetDepositGreaterThanWalletBalance
                          ? `${mainAsset.symbol} Quantity Exceeds Wallet Balance`
                          : secondaryAssetDepositGreaterThanWalletBalance
                            ? `${secondaryAsset.symbol} Quantity Exceeds Wallet Balance`
                            : 'Submit'
            }
            disabled={
                showSubmitted ||
                !depositGreaterOrEqualToMinimum ||
                mainAssetDepositGreaterThanWalletBalance ||
                secondaryAssetDepositGreaterThanWalletBalance
            }
            action={() => submitDeposit()}
            flat
        />
    );

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
                >{`This deposit function uses "Zap Mode" to convert ${props.mainAsset.symbol} deposit into vault position which holds both ${props.mainAsset.symbol} and ${props.mainAsset.symbol}. The value of a vault deposit will fluctuate with the value of both these tokens and their exchange rate.`}</p>
                <div className={styles.zapContainer}>
                    <p>Zap In</p>

                    <Toggle
                        isOn={isZapOn}
                        handleToggle={() => setIsZapOn(!isZapOn)}
                        Width={36}
                        id='zap_toggle_vault_deposit'
                        disabled={false}
                    />
                </div>
                <div className={styles.content}>
                    <div
                        className={styles.tokenQuantityContainer}
                        style={{ marginBottom: !includeWallet ? '8px' : '0' }}
                    >
                        {inputMain}
                        {tokenSelectButtonMain}
                    </div>
                    {includeWallet &&
                        !showConfirmation &&
                        mainAssetWalletContent}
                </div>
                {!isZapOn && (
                    <div className={styles.content}>
                        <div
                            className={styles.tokenQuantityContainer}
                            style={{
                                marginBottom: !includeWallet ? '8px' : '0',
                            }}
                        >
                            {inputSecondary}
                            {tokenSelectButtonSecondary}
                        </div>
                        {includeWallet &&
                            !showConfirmation &&
                            secondaryAssetWalletContent}
                    </div>
                )}

                <div className={styles.gas_row}>
                    <FaGasPump size={15} /> {depositGasPriceinDollars ?? '…'}
                </div>

                <div className={styles.buttonContainer}>
                    {depositGreaterThanWalletAllowance
                        ? approveButton
                        : submitButton}
                </div>
            </div>
        </Modal>
    );
}
