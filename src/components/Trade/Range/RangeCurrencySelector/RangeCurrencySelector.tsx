import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';

interface RangeCurrencySelectorProps {
    isUserLoggedIn: boolean | undefined;
    gasPriceInGwei: number | undefined;
    resetTokenQuantities: () => void;
    fieldId: string;
    chainId: string;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    isTokenAEth: boolean;
    isTokenBEth: boolean;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    tokenAQtyCoveredByWalletBalance: number;
    tokenBQtyCoveredByWalletBalance: number;
    tokenAQtyCoveredBySurplusBalance: number;
    tokenBQtyCoveredBySurplusBalance: number;
    tokenAWalletMinusTokenAQtyNum: number;
    tokenBWalletMinusTokenBQtyNum: number;
    tokenASurplusMinusTokenARemainderNum: number;
    tokenBSurplusMinusTokenBRemainderNum: number;
    tokenASurplusMinusTokenAQtyNum: number;
    tokenBSurplusMinusTokenBQtyNum: number;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenAQtyLocal: number;
    tokenBQtyLocal: number;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isAdvancedMode: boolean;
    disable?: boolean;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    handleChangeClick: (input: string) => void;

    isRangeCopied: boolean;
}

export default function RangeCurrencySelector(props: RangeCurrencySelectorProps) {
    const {
        isUserLoggedIn,
        gasPriceInGwei,
        resetTokenQuantities,
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        isTokenAEth,
        isTokenBEth,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        // tokenAWalletMinusTokenAQtyNum,
        // tokenBWalletMinusTokenBQtyNum,
        fieldId,
        sellToken,
        updateOtherQuantity,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        // tokenAQtyLocal,
        // tokenBQtyLocal,
        tokenBDexBalance,
        tokenAQtyCoveredByWalletBalance,
        tokenBQtyCoveredByWalletBalance,
        tokenAQtyCoveredBySurplusBalance,
        tokenBQtyCoveredBySurplusBalance,
        tokenASurplusMinusTokenARemainderNum,
        tokenBSurplusMinusTokenBRemainderNum,
        // tokenASurplusMinusTokenAQtyNum,
        // tokenBSurplusMinusTokenBQtyNum,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        handleChangeClick,

        isRangeCopied,
    } = props;

    const isTokenASelector = fieldId === 'A';

    const thisToken = isTokenASelector ? tokenPair.dataTokenA : tokenPair.dataTokenB;
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const [isModalOpen, openModal, closeModal] = useModal();

    useEffect(() => {
        if (parseFloat(tokenADexBalance) <= 0) {
            setIsWithdrawTokenAFromDexChecked(false);
        }
    }, [tokenADexBalance]);

    useEffect(() => {
        if (parseFloat(tokenBDexBalance) <= 0) {
            setIsWithdrawTokenBFromDexChecked(false);
        }
    }, [tokenBDexBalance]);

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token' centeredTitle>
            <TokenSelectContainer
                resetTokenQuantities={resetTokenQuantities}
                tokenPair={tokenPair}
                searchableTokens={searchableTokens}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                tokenToUpdate={fieldId}
                chainId={chainId}
                tokenList={tokensBank}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
                showManageTokenListContent={showManageTokenListContent}
                setShowManageTokenListContent={setShowManageTokenListContent}
                activeTokenListsChanged={activeTokenListsChanged}
                indicateActiveTokenListsChanged={indicateActiveTokenListsChanged}
            />
        </Modal>
    ) : null;

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            <IconWithTooltip title='Use Exchange Balance' placement='bottom'>
                {isTokenASelector ? (
                    <Toggle2
                        isOn={isWithdrawTokenAFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked)
                        }
                        id='withdraw_from_dex'
                        disabled={false}
                        // disabled={parseFloat(tokenADexBalance) <= 0}
                    />
                ) : (
                    <Toggle2
                        isOn={isWithdrawTokenBFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked)
                        }
                        id='withdraw_to_wallet'
                        disabled={false}
                        // disabled={parseFloat(tokenBDexBalance) <= 0}
                    />
                )}
            </IconWithTooltip>
        </span>
    );

    const walletBalanceNonLocaleString = isTokenASelector
        ? tokenABalance && gasPriceInGwei
            ? isTokenAEth
                ? (parseFloat(tokenABalance) - gasPriceInGwei * 500000 * 1e-9).toFixed(18)
                : tokenABalance
            : ''
        : tokenBBalance && gasPriceInGwei
        ? isTokenBEth
            ? (parseFloat(tokenBBalance) - gasPriceInGwei * 500000 * 1e-9).toFixed(18)
            : tokenBBalance
        : '';

    const walletBalanceLocaleString = isTokenASelector
        ? tokenABalance
            ? parseFloat(tokenABalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBBalance
        ? parseFloat(tokenBBalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const surplusBalanceNonLocaleString = isTokenASelector
        ? tokenADexBalance && gasPriceInGwei
            ? isTokenAEth
                ? (parseFloat(tokenADexBalance) - gasPriceInGwei * 500000 * 1e-9).toFixed(18)
                : tokenADexBalance
            : ''
        : tokenBDexBalance && gasPriceInGwei
        ? isTokenBEth
            ? (parseFloat(tokenBDexBalance) - gasPriceInGwei * 500000 * 1e-9).toFixed(18)
            : tokenBDexBalance
        : '';

    const surplusBalanceLocaleString = isTokenASelector
        ? tokenADexBalance
            ? parseFloat(tokenADexBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : '...'
        : tokenBDexBalance
        ? parseFloat(tokenBDexBalance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : '...';

    const tokenASurplusChange =
        tokenAQtyCoveredBySurplusBalance && isWithdrawTokenAFromDexChecked
            ? '(-' +
              tokenAQtyCoveredBySurplusBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const tokenAWalletBalanceChange =
        tokenAQtyCoveredByWalletBalance && tokenAQtyCoveredByWalletBalance > 0
            ? '(-' +
              tokenAQtyCoveredByWalletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const tokenBSurplusChange =
        tokenBQtyCoveredBySurplusBalance && isWithdrawTokenBFromDexChecked
            ? '(-' +
              tokenBQtyCoveredBySurplusBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    const tokenBWalletBalanceChange =
        tokenBQtyCoveredByWalletBalance && tokenBQtyCoveredByWalletBalance > 0
            ? '(-' +
              tokenBQtyCoveredByWalletBalance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              }) +
              ')'
            : '';

    // console.log({ fieldId });
    // console.log({ tokenBSurplusMinusTokenBRemainderNum });
    const isFieldDisabled =
        (isTokenASelector && isTokenADisabled) || (!isTokenASelector && isTokenBDisabled);

    return (
        <div className={styles.swapbox}>
            {sellToken && <span className={styles.direction}>Amounts</span>}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <RangeCurrencyQuantity
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                        disable={isFieldDisabled}
                        isAdvancedMode={isAdvancedMode}
                    />
                </div>
                <div
                    className={`${styles.token_select} ${isRangeCopied && styles.pulse_animation}`}
                    onClick={openModal}
                >
                    {thisToken.logoURI ? (
                        <img
                            className={styles.token_list_img}
                            src={thisToken.logoURI}
                            alt={thisToken.name + 'token logo'}
                            width='30px'
                        />
                    ) : (
                        <NoTokenIcon tokenInitial={thisToken.symbol.charAt(0)} width='30px' />
                    )}
                    <span className={styles.token_list_text}>{thisToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <div
                    className={styles.surplus_container}
                    style={{
                        color:
                            (isTokenASelector && !isWithdrawTokenAFromDexChecked) ||
                            (!isTokenASelector && !isWithdrawTokenBFromDexChecked) ||
                            (isTokenASelector &&
                                isTokenAEth === false &&
                                isWithdrawTokenAFromDexChecked &&
                                tokenASurplusMinusTokenARemainderNum &&
                                tokenASurplusMinusTokenARemainderNum < 0) ||
                            (!isTokenASelector &&
                                isTokenBEth === false &&
                                isWithdrawTokenBFromDexChecked &&
                                tokenBSurplusMinusTokenBRemainderNum &&
                                tokenBSurplusMinusTokenBRemainderNum < 0)
                                ? 'var(--text-highlight)'
                                : '#555555',
                    }}
                >
                    <IconWithTooltip title='Wallet Balance' placement='bottom'>
                        <div
                            className={styles.balance_with_pointer}
                            onClick={() => {
                                if (isTokenASelector) {
                                    setIsWithdrawTokenAFromDexChecked(false);
                                } else {
                                    setIsWithdrawTokenBFromDexChecked(false);
                                }
                                handleChangeClick(walletBalanceNonLocaleString);
                            }}
                        >
                            <div className={styles.wallet_logo}>
                                <MdAccountBalanceWallet
                                    size={20}
                                    color={
                                        (isTokenASelector && !isWithdrawTokenAFromDexChecked) ||
                                        (!isTokenASelector && !isWithdrawTokenBFromDexChecked) ||
                                        (isTokenASelector &&
                                            isTokenAEth === false &&
                                            isWithdrawTokenAFromDexChecked &&
                                            tokenASurplusMinusTokenARemainderNum &&
                                            tokenASurplusMinusTokenARemainderNum < 0) ||
                                        (!isTokenASelector &&
                                            isTokenBEth === false &&
                                            isWithdrawTokenBFromDexChecked &&
                                            tokenBSurplusMinusTokenBRemainderNum &&
                                            tokenBSurplusMinusTokenBRemainderNum < 0)
                                            ? 'var(--text-highlight)'
                                            : '#555555'
                                    }
                                />
                            </div>
                            <div className={styles.balance_column}>
                                <div>{isUserLoggedIn ? walletBalanceLocaleString : ''}</div>
                                <div
                                    style={{
                                        color: '#f6385b',
                                        fontSize: '9px',
                                    }}
                                >
                                    {isTokenASelector
                                        ? tokenAWalletBalanceChange
                                        : tokenBWalletBalanceChange}
                                </div>
                            </div>
                        </div>{' '}
                    </IconWithTooltip>
                    <IconWithTooltip title='Exchange Balance' placement='bottom'>
                        <div
                            className={`${styles.balance_with_pointer} ${
                                (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                                (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                    ? null
                                    : styles.grey_logo
                            }`}
                            onClick={() => {
                                if (isTokenASelector) {
                                    setIsWithdrawTokenAFromDexChecked(true);
                                } else {
                                    setIsWithdrawTokenBFromDexChecked(true);
                                }
                                handleChangeClick(surplusBalanceNonLocaleString);
                            }}
                            style={{
                                color:
                                    (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                                    (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                        ? 'var(--text-highlight)'
                                        : '#555555',
                            }}
                        >
                            <div
                                className={`${styles.wallet_logo} ${
                                    isTokenASelector
                                        ? isWithdrawTokenAFromDexChecked
                                            ? styles.enabled_logo
                                            : null
                                        : isWithdrawTokenBFromDexChecked
                                        ? styles.enabled_logo
                                        : null
                                }`}
                            >
                                <img src={ambientLogo} width='20' alt='surplus' />
                            </div>
                            <div className={styles.balance_column}>
                                <div> {isUserLoggedIn ? surplusBalanceLocaleString : ''}</div>
                                <div
                                    style={{
                                        color: '#f6385b',
                                    }}
                                >
                                    {isTokenASelector ? tokenASurplusChange : tokenBSurplusChange}
                                </div>
                            </div>
                        </div>
                    </IconWithTooltip>
                </div>
                {/* {fieldId === 'A' ? (
                            <span>Wallet: {walletBalance} | Surplus: 0.00</span>
                        ) : (
                            <span>Wallet: {walletBalance} | Surplus: 0.00</span>
                        )} */}
                {DexBalanceContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
