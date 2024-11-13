import {
    getFormattedNumber,
    uriToHttp,
} from '../../../../../ambient-utils/dataLayer';
import TokenIcon from '../../../../../components/Global/TokenIcon/TokenIcon';
import RemoveRangeWidth from '../../../../../components/RangeActionModal/RemoveRangeWidth/RemoveRangeWidth';
import { FlexContainer } from '../../../../../styled/Common';
import styles from './VaultWithdraw.module.css';
import TooltipComponent from '../../../../../components/Global/TooltipComponent/TooltipComponent';
import Button from '../../../../../components/Form/Button';

import { TokenIF, VaultIF } from '../../../../../ambient-utils/types';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import { useContext, useEffect, useState } from 'react';
import { FaGasPump } from 'react-icons/fa';
import {
    NUM_GWEI_IN_WEI,
    GAS_DROPS_ESTIMATE_VAULT_WITHDRAWAL,
    IS_LOCAL_ENV,
} from '../../../../../ambient-utils/constants';
import {
    ChainDataContext,
    CrocEnvContext,
    ReceiptContext,
    UserDataContext,
} from '../../../../../contexts';
import {
    TransactionError,
    isTransactionReplacedError,
    isTransactionFailedError,
} from '../../../../../utils/TransactionError';
import Toggle from '../../../../../components/Form/Toggle';

interface Props {
    mainAsset: TokenIF;
    secondaryAsset: TokenIF;
    vault: VaultIF;
    balanceMainAsset: bigint | undefined;
    mainAssetBalanceDisplayQty: string;
    secondaryAssetBalanceDisplayQty: string;
    onClose: () => void;
}
export default function VaultWithdraw(props: Props) {
    const {
        mainAsset,
        onClose,
        mainAssetBalanceDisplayQty,
        secondaryAssetBalanceDisplayQty,
        vault,
        balanceMainAsset,
        secondaryAsset
    } = props;
    const [showSubmitted, setShowSubmitted] = useState(false);
    const [isZapOn, setIsZapOn] = useState(true);

    const [removalPercentage, setRemovalPercentage] = useState(100);
    const { gasPriceInGwei } = useContext(ChainDataContext);
    const { ethMainnetUsdPrice, crocEnv } = useContext(CrocEnvContext);
    const { userAddress } = useContext(UserDataContext);

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
            (balanceMainAsset * BigInt(removalPercentage)) / BigInt(101);

        const balanceVault = await crocEnv
            .tempestVault(vault.address, vault.mainAsset)
            .balanceVault(userAddress);

        const withdrawalQtyVaultBalance =
            (balanceVault * BigInt(removalPercentage)) / BigInt(100);

        const tx = await crocEnv
            .tempestVault(vault.address, vault.mainAsset)
            .redeemZap(withdrawalQtyVaultBalance, withdrawalQtyMainAssetBigint)
            .catch(console.error);

        if (tx?.hash) {
            addPendingTx(tx?.hash);
            addTransactionByType({
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

    // const [showWithdrawDropdown, setShowWithdrawDropdown] = useState(false);

    // const dropdownRef = useRef<HTMLDivElement>(null);

    // const clickOutsideHandler = () => {
    //     setShowWithdrawDropdown(false);
    // };

    // useOnClickOutside(dropdownRef, clickOutsideHandler);

    const tokensDisplay = (
        <FlexContainer
            alignItems='center'
            flexDirection='row'
            gap={5}
            style={{ flexShrink: 0 }}
        >
            {!isZapOn && <TokenIcon
                token={secondaryAsset}
                src={uriToHttp(secondaryAsset.logoURI)}
                alt={secondaryAsset.symbol}
                size={'xl'}
            />}
            <TokenIcon
                token={mainAsset}
                src={uriToHttp(mainAsset.logoURI)}
                alt={mainAsset.symbol}
                size={'xl'}
            />
            <p className={styles.poolName}>{ !isZapOn && secondaryAsset.symbol + ' / '}{mainAsset.symbol}</p>
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
    const mainDetailsDisplay = (
        <>
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
        </>
    )

    const secondaryDetailsDisplay = (
        <>
            <div className={styles.pooledContentContainer}>
                Deposited {secondaryAsset.symbol}
                <div className={styles.alignCenter}>
                    {secondaryAssetBalanceDisplayQty}
                    <TokenIcon
                        token={secondaryAsset}
                        src={uriToHttp(secondaryAsset.logoURI)}
                        alt={secondaryAsset.symbol}
                        size={'s'}
                    />
                </div>
            </div>
            <div className={styles.pooledContentRight}>
                {secondaryAsset.symbol} Removal Amount
                <div className={styles.alignCenter}>
                    {getFormattedNumber({
                        value:
                            removalPercentage *
                            0.01 *
                            parseFloat(secondaryAssetBalanceDisplayQty),
                    })}
                    <TokenIcon
                        token={secondaryAsset}
                        src={uriToHttp(secondaryAsset.logoURI)}
                        alt={secondaryAsset.symbol}
                        size={'s'}
                    />
                </div>
            </div>
        </>
    )

    const pooledDisplay = (
        <section className={styles.pooledContent}>
            {mainDetailsDisplay}
         {!isZapOn &&   <div className={styles.seperator}>
                <span />
            </div>}
            {!isZapOn && secondaryDetailsDisplay}
        </section>
    );
    const extraDetailsDisplay = (
        <div className={styles.extraDetailsContainer}>
            <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Slippage Tolerance</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>0.5%</p>
            </div>
            {/* <div className={styles.extraDetailsRow}>
                <FlexContainer flexDirection='row' alignItems='center' gap={4}>
                    <p>Network Fee</p>
                    <TooltipComponent title={'item.tooltipTitle'} />
                </FlexContainer>
                <p>~{withdrawGasPriceinDollars ?? '…'}</p>
            </div> */}
        </div>
    );

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
                    value: gasPriceInDollarsNum,
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
        <Modal usingCustomHeader onClose={onClose}>
            <ModalHeader
                onClose={onClose}
                title={'Withdraw'}
                // onBackButton={handleGoBack}
                // showBackButton={handleGoBack ? true: false}
            />

            <div className={styles.withdrawContainer}>
                {tokensDisplay}
                <div className={styles.zapContainer}>
                    <p>Zap In</p>

                    <Toggle
                        isOn={isZapOn}
                        handleToggle={() => setIsZapOn(!isZapOn)}
                        Width={36}
                        id='zap_toggle_vault_withdraw'
                        disabled={false}
                    />
                </div>
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                {pooledDisplay}

                { extraDetailsDisplay}
                <div className={styles.gas_row}>
                    <FaGasPump size={15} /> {withdrawGasPriceinDollars ?? '…'}
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        idForDOM='approve_token_a_for_swap_module'
                        style={{ textTransform: 'none' }}
                        title={
                            showSubmitted
                                ? submittedButtonTitle
                                : 'Remove Liquidity'
                        }
                        disabled={showSubmitted}
                        action={() => submitWithdraw()}
                        flat
                    />
                </div>
            </div>
        </Modal>
    );
}
