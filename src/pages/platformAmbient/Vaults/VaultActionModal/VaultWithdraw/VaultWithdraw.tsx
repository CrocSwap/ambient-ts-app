import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import Button from '../../../../../components/Form/Button';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import RemoveRangeWidth from '../../../../../components/RangeActionModal/RemoveRangeWidth/RemoveRangeWidth';
import { FlexContainer } from '../../../../../styled/Common';
import styles from './VaultWithdraw.module.css';

import { useContext, useEffect, useRef, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import {
    GAS_DROPS_ESTIMATE_VAULT_WITHDRAWAL,
    IS_LOCAL_ENV,
    NUM_GWEI_IN_WEI,
    VAULT_TX_L1_DATA_FEE_ESTIMATE,
} from '../../../../../ambient-utils/constants';
import {
    AllVaultsServerIF,
    TokenIF,
    VaultStrategy,
} from '../../../../../ambient-utils/types';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import {
    AppStateContext,
    ChainDataContext,
    CrocEnvContext,
    ReceiptContext,
    UserDataContext,
} from '../../../../../contexts';
import {
    TransactionError,
    isTransactionFailedError,
    isTransactionReplacedError,
} from '../../../../../utils/TransactionError';

import { MdEdit } from 'react-icons/md';
import useKeyPress from '../../../../../App/hooks/useKeyPress';

interface propsIF {
    mainAsset: TokenIF;
    vault: AllVaultsServerIF;
    balanceMainAsset: bigint | undefined;
    mainAssetBalanceDisplayQty: string;
    onClose: () => void;
    strategy: VaultStrategy;
}
export default function VaultWithdraw(props: propsIF) {
    const {
        mainAsset,
        onClose,
        mainAssetBalanceDisplayQty,
        vault,
        balanceMainAsset,
        strategy,
    } = props;
    const [showSubmitted, setShowSubmitted] = useState(false);
    const [removalPercentage, setRemovalPercentage] = useState(100);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { ethMainnetUsdPrice, crocEnv } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);
    const {
        activeNetwork: { chainId },
    } = useContext(AppStateContext);
    const {
        addPendingTx,
        addReceipt,
        addTransactionByType,
        removePendingTx,
        updateTransactionHash,
    } = useContext(ReceiptContext);

    const [withdrawGasPriceinDollars, setWithdrawGasPriceinDollars] = useState<
        string | undefined
    >();

    const submitWithdraw = async () => {
        if (!crocEnv || !balanceMainAsset || !userAddress || !vault) return;

        setShowSubmitted(true);

        const withdrawalQtyMainAssetBigint =
            (balanceMainAsset * BigInt(removalPercentage)) / BigInt(100);

        const withdrawalQtyMainAssetBigintMinusSlippage =
            (withdrawalQtyMainAssetBigint *
                (BigInt(10000) - BigInt(slippageTolerance * 100))) /
            BigInt(10000);

        const balanceVault = await crocEnv
            .tempestVault(vault.address, vault.mainAsset, strategy)
            .balanceVault(userAddress);

        const withdrawalQtyVaultBalance =
            (balanceVault * BigInt(removalPercentage)) / BigInt(100);

        const tx = await crocEnv
            .tempestVault(vault.address, vault.mainAsset, strategy)
            .redeemZap(
                withdrawalQtyVaultBalance,
                withdrawalQtyMainAssetBigintMinusSlippage,
            )
            .catch(console.error);

        if (tx?.hash) {
            addPendingTx(tx?.hash);
            addTransactionByType({
                chainId: chainId,
                userAddress: userAddress || '',
                txHash: tx.hash,
                txType: 'Withdraw',
                txDescription: `Withdrawal of ${mainAsset.symbol}`,
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
                IS_LOCAL_ENV && console.debug('repriced');
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

    const tokensDisplay = (
        <FlexContainer
            alignItems='center'
            flexDirection='row'
            gap={5}
            style={{ flexShrink: 0 }}
        >
            {/* <TokenIcon
                token={token0}
                src={uriToHttp(token0.logoURI)}
                alt={token0.symbol}
                size={'xl'}
            /> */}
            <TokenIcon
                token={mainAsset}
                src={uriToHttp(mainAsset.logoURI)}
                alt={mainAsset.symbol}
                size={'xl'}
            />
            <p className={styles.poolName}>{mainAsset.symbol}</p>
        </FlexContainer>
    );

    // const withdrawDropdown = (
    //     <div className={styles.withdrawDropdownContainer}>
    //         <h3>Withdraw as</h3>

    //         <div className={styles.dropdownContainer} ref={dropdownRef}>
    //             <button
    //                 onClick={() =>
    //                     setShowWithdrawDropdown(!showWithdrawDropdown)
    //                 }
    //             >
    //                 ETH / USDC <RiArrowDropDownLine />
    //             </button>
    //             {showWithdrawDropdown && (
    //                 <section className={styles.dropdownContent}>
    //                     i sm dropdown content
    //                 </section>
    //             )}
    //         </div>
    //     </div>
    // );

    const pooledDisplay = (
        <section className={styles.pooledContent}>
            <div className={styles.pooledContentContainer}>
                Deposited {mainAsset.symbol}
                <div className={styles.alignCenter}>
                    {mainAssetBalanceDisplayQty}
                    <TokenIcon
                        token={mainAsset}
                        src={uriToHttp(mainAsset.logoURI)}
                        alt={mainAsset.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                {mainAsset.symbol} Removal Amount
                <div className={styles.alignCenter}>
                    {getFormattedNumber({
                        value:
                            removalPercentage *
                            0.01 *
                            parseFloat(mainAssetBalanceDisplayQty),
                    })}
                    <TokenIcon
                        token={mainAsset}
                        src={uriToHttp(mainAsset.logoURI)}
                        alt={mainAsset.symbol}
                        size={'s'}
                    />
                </div>
            </div>
        </section>
    );

    const minSlippageNum = 0.5;
    const maxSlippageNum = 100;

    const [slippageTolerance, setSlippageTolerance] = useState(minSlippageNum);
    const [tempSlippage, setTempSlippage] = useState<string>(
        slippageTolerance.toString(),
    );
    const [editSlippageTolerance, setEditSlippageTolerance] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [borderColor, setBorderColor] = useState(false);

    const inputRefSlip = useRef<HTMLInputElement>(null);

    const handleSlippageUpdate = (value: string) => {
        const numericValue = parseFloat(value);
        if (
            !isNaN(numericValue) &&
            numericValue >= minSlippageNum &&
            numericValue <= maxSlippageNum
        ) {
            setSlippageTolerance(numericValue);
            setTempSlippage(value);
            setErrorMessage('');
            setBorderColor(false);
            return true;
        } else {
            setErrorMessage(
                `Please enter a value between ${minSlippageNum} and ${maxSlippageNum}`,
            );
            setBorderColor(true);
            return false;
        }
    };

    const handleCloseEdit = () => {
        if (handleSlippageUpdate(tempSlippage)) {
            setEditSlippageTolerance(false);
        }
    };

    useEffect(() => {
        if (editSlippageTolerance && inputRefSlip.current) {
            inputRefSlip.current.focus();
        }
    }, [editSlippageTolerance]);

    useKeyPress('Escape', () => setEditSlippageTolerance(false));

    // calculate price of gas for vault withdrawal
    useEffect(() => {
        if (gasPriceInGwei && ethMainnetUsdPrice) {
            const gasPriceInDollarsNum =
                gasPriceInGwei *
                Number(NUM_GWEI_IN_WEI) *
                ethMainnetUsdPrice *
                Number(GAS_DROPS_ESTIMATE_VAULT_WITHDRAWAL);

            setWithdrawGasPriceinDollars(
                getFormattedNumber({
                    value: gasPriceInDollarsNum + VAULT_TX_L1_DATA_FEE_ESTIMATE,
                    isUSD: true,
                }),
            );
        }
    }, [gasPriceInGwei, ethMainnetUsdPrice]);

    const submittedButtonTitle = (
        <div className={styles.loading}>
            Submitting
            <span className={styles.dots}></span>
        </div>
    );

    return (
        <Modal
            usingCustomHeader
            onClose={onClose}
            isEscapeKeyEnabled={!editSlippageTolerance}
        >
            <ModalHeader
                onClose={onClose}
                title={'Withdraw'}
                // onBackButton={handleGoBack}
                // showBackButton={handleGoBack ? true: false}
            />

            <div className={styles.withdrawContainer}>
                {tokensDisplay}
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                {pooledDisplay}

                <div
                    className={styles.extraDetailsContainer}
                    style={{
                        border: borderColor ? '1px solid var(--other-red)' : '',
                    }}
                    onBlur={() => {
                        if (editSlippageTolerance) {
                            handleCloseEdit();
                        }
                    }}
                >
                    <div
                        className={styles.extraDetailsRow}
                        onClick={(e) => {
                            // Prevent clicks on the row from triggering clickaway
                            e.stopPropagation();
                        }}
                    >
                        <FlexContainer
                            flexDirection='row'
                            alignItems='center'
                            gap={4}
                            style={{ zIndex: '5' }}
                        >
                            <p>Slippage Tolerance</p>
                        </FlexContainer>
                        <div
                            className={styles.slipTolValueContainer}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className={styles.inputWrapper}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <input
                                    id='slippage_tolerance_input_field_vault_withdraw'
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === 'Escape'
                                        ) {
                                            handleCloseEdit();
                                        }
                                    }}
                                    onChange={(e) => {
                                        setTempSlippage(
                                            e.target.value.startsWith('.')
                                                ? '0' + e.target.value
                                                : e.target.value,
                                        );
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    type='number'
                                    step='0.1'
                                    value={tempSlippage}
                                    autoComplete='off'
                                    placeholder={minSlippageNum.toString()}
                                    aria-label='Enter Slippage Tolerance'
                                    disabled={!editSlippageTolerance}
                                    ref={inputRefSlip}
                                    min={minSlippageNum}
                                    max={maxSlippageNum}
                                />
                                <p>%</p>
                                <MdEdit
                                    size={18}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditSlippageTolerance(true);
                                        inputRefSlip.current?.select();
                                    }}
                                    color={
                                        editSlippageTolerance
                                            ? 'var(--accent1)'
                                            : ''
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <p className={styles.errorMessage}>
                    {errorMessage ?? errorMessage}
                </p>
                <div className={styles.gas_row}>
                    <FaGasPump size={15} /> {withdrawGasPriceinDollars ?? '…'}
                </div>

                <Button
                    idForDOM='approve_token_a_for_swap_module'
                    style={{ textTransform: 'none' }}
                    title={
                        errorMessage
                            ? 'Invalid slippage tolerance'
                            : showSubmitted
                              ? submittedButtonTitle
                              : 'Remove Liquidity'
                    }
                    disabled={
                        showSubmitted ||
                        balanceMainAsset === 0n ||
                        errorMessage !== ''
                    }
                    action={() => submitWithdraw()}
                    flat
                />
            </div>
        </Modal>
    );
}
