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

import { TokenIF, AllVaultsServerIF } from '../../../../../ambient-utils/types';
import Modal from '../../../../../components/Global/Modal/Modal';
import ModalHeader from '../../../../../components/Global/ModalHeader/ModalHeader';
import {
    ChangeEvent,
    KeyboardEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
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
import useOnClickOutside from '../../../../../utils/hooks/useOnClickOutside';

import { MdEdit } from 'react-icons/md';

interface propsIF {
    mainAsset: TokenIF;
    vault: AllVaultsServerIF;
    balanceMainAsset: bigint | undefined;
    mainAssetBalanceDisplayQty: string;
    onClose: () => void;
}
export default function VaultWithdraw(props: propsIF) {
    const {
        mainAsset,
        onClose,
        mainAssetBalanceDisplayQty,
        vault,
        balanceMainAsset,
    } = props;
    const [showSubmitted, setShowSubmitted] = useState(false);
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
            (balanceMainAsset * BigInt(removalPercentage)) / BigInt(100);

        const withdrawalQtyMainAssetBigintMinusSlippage =
            (withdrawalQtyMainAssetBigint *
                (BigInt(10000) - BigInt(slippageTolerance * 100))) /
            BigInt(10000);

        const balanceVault = await crocEnv
            .tempestVault(vault.address, vault.mainAsset)
            .balanceVault(userAddress);

        const withdrawalQtyVaultBalance =
            (balanceVault * BigInt(removalPercentage)) / BigInt(100);

        const tx = await crocEnv
            .tempestVault(vault.address, vault.mainAsset)
            .redeemZap(
                withdrawalQtyVaultBalance,
                withdrawalQtyMainAssetBigintMinusSlippage,
            )
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
            <div className={styles.seperator}>
                <span />
            </div>
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

    // const slipValue = getFormattedNumber({
    //     value: slippageTolerance,
    //     isPercentage: true,
    //     // suffix: '%',
    // });
    const [slippageTolerance, setSlippageTolerance] = useState(0.5);
    const [tempSlippage, setTempSlippage] = useState<string>(
        slippageTolerance.toString(),
    );
    const [editSlippageTolerance, setEditSlippageTolerance] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const validateAndSetSlippage = (value: string) => {
        const numericValue = parseFloat(value);

        if (isNaN(numericValue)) {
            setErrorMessage('');
            setTempSlippage('');
            return;
        }

        if (numericValue < 0.1) {
            setErrorMessage('Value cannot be less than 0.1.');
            setTempSlippage('0.1');
        } else if (numericValue > 100) {
            setErrorMessage('Value cannot be greater than 100.');
            setTempSlippage('100');
        } else {
            setErrorMessage('');
            setTempSlippage(value);
        }
    };



    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const numericValue = parseFloat(tempSlippage);
            if (!isNaN(numericValue) && numericValue >= 0.1 && numericValue <= 100) {
                setSlippageTolerance(numericValue);
                setErrorMessage('');
            } else {
                setErrorMessage('Press Enter only when the value is between 0.1 and 100.');
            }
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        validateAndSetSlippage(e.target.value); // Pass the value directly
    };
    
    
    const inputRefSlip = useRef<HTMLInputElement>(null);
    const handleFocusSlip = () => {
        if (inputRefSlip.current) {
            inputRefSlip.current.focus();
        }
    };

    const slipDropdownRef = useRef<HTMLDivElement>(null);


    const clickOutsideHandler = () => {
        setEditSlippageTolerance(false);
    };
    useOnClickOutside(slipDropdownRef, clickOutsideHandler);

    function handleEditClick() {
        setEditSlippageTolerance(true);
        handleFocusSlip();
    }

    useEffect(() => {
        if (editSlippageTolerance && inputRefSlip.current) {
            inputRefSlip.current.focus();
        }
    }, [editSlippageTolerance]);

    const extraDetailsDisplay = (
        <>
        <div className={styles.extraDetailsContainer}>
            <div className={styles.extraDetailsRow}>
                <FlexContainer
                    flexDirection='row'
                    alignItems='center'
                    gap={4}
                    style={{ zIndex: '5' }}
                    >
                    <p>Slippage Tolerance</p>
                    <TooltipComponent
                        title={'This can be changed in settings.'}
                        />
                </FlexContainer>
                <div
                    className={styles.slipTolValueContainer}
                    ref={slipDropdownRef}
                    >
                    {/* {getFormattedNumber({
                        value: slippageTolerance,
                        isPercentage: true,
                        suffix: '%',
                        })} */}
                 <input
                id='slippage_tolerance_input_field_vault_withdraw'
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                type='number'
                step='any'
                value={tempSlippage}
                autoComplete='off'
                placeholder='Enter Slippage Tolerance'
                aria-label='Enter Slippage Tolerance'
                disabled={!editSlippageTolerance}
                ref={inputRefSlip}
                min={0.1}
                max={100}
            />
                    <p>%</p>
                    <MdEdit
                        size={18}
                        onClick={handleEditClick}
                        color={editSlippageTolerance ? 'var(--accent1)' : ''}
                        />
                </div>
            </div>
         
            </div>
            <p className={styles.errorMessage}>{errorMessage ?? ''}</p>
               
                        </>
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
                <RemoveRangeWidth
                    removalPercentage={removalPercentage}
                    setRemovalPercentage={setRemovalPercentage}
                />
                {pooledDisplay}

                {extraDetailsDisplay}
                <div className={styles.gas_row}>
                    <FaGasPump size={15} /> {withdrawGasPriceinDollars ?? '…'}
                </div>

                <Button
                    idForDOM='approve_token_a_for_swap_module'
                    style={{ textTransform: 'none' }}
                    title={
                        showSubmitted
                            ? submittedButtonTitle
                            : 'Remove Liquidity'
                    }
                    disabled={showSubmitted || balanceMainAsset === 0n}
                    action={() => submitWithdraw()}
                    flat
                />
            </div>
        </Modal>
    );
}
