import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
// import Toggle2 from '../../../Global/Toggle/Toggle2';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../../../components/Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import { DefaultTooltip } from '../../../Global/StyledTooltip/StyledTooltip';
import ExchangeBalanceExplanation from '../../../Global/Informational/ExchangeBalanceExplanation';
import { AiOutlineQuestionCircle } from 'react-icons/ai';
import { tokenMethodsIF } from '../../../../App/hooks/useToken';

// import { useSoloSearch } from '../../../Global/TokenSelectContainer/hooks/useSoloSearch';

interface propsIF {
    provider?: ethers.providers.Provider;
    isUserLoggedIn: boolean | undefined;
    gasPriceInGwei: number | undefined;
    resetTokenQuantities: () => void;
    fieldId: string;
    chainId: string;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
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
    tokenAInputQty: string;
    tokenBInputQty: string;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    isTokenADisabled: boolean;
    isTokenBDisabled: boolean;
    isAdvancedMode: boolean;
    disable?: boolean;
    activeTokenListsChanged: boolean;
    isRangeCopied: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    handleChangeClick: (input: string) => void;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    tokenAorB: string;
    outputTokens: TokenIF[];
    validatedInput: string;
    setInput: Dispatch<SetStateAction<string>>;
    searchType: string;
    openGlobalPopup: (
        content: React.ReactNode,
        popupTitle?: string,
        popupPlacement?: string,
    ) => void;
    uTokens: tokenMethodsIF;
}

export default function RangeCurrencySelector(props: propsIF) {
    const {
        provider,
        isUserLoggedIn,
        gasPriceInGwei,
        tokenPair,
        setImportedTokens,
        chainId,
        isTokenAEth,
        isTokenBEth,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        fieldId,
        sellToken,
        updateOtherQuantity,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenAInputQty,
        tokenBInputQty,
        tokenBDexBalance,
        tokenAQtyCoveredByWalletBalance,
        tokenBQtyCoveredByWalletBalance,
        tokenAQtyCoveredBySurplusBalance,
        tokenBQtyCoveredBySurplusBalance,
        tokenASurplusMinusTokenARemainderNum,
        tokenBSurplusMinusTokenBRemainderNum,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        handleChangeClick,
        isRangeCopied,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        tokenAorB,
        outputTokens,
        validatedInput,
        setInput,
        searchType,
        openGlobalPopup,
        uTokens
    } = props;

    const isTokenASelector = fieldId === 'A';

    const thisToken = isTokenASelector ? tokenPair.dataTokenA : tokenPair.dataTokenB;

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

    const isFieldDisabled =
        (isTokenASelector && isTokenADisabled) || (!isTokenASelector && isTokenBDisabled);

    const modalCloseCustom = (): void => setInput('');

    const [isTokenModalOpen, openTokenModal, closeTokenModal] = useModal(modalCloseCustom);
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] = useState(true);

    const handleInputClear = (): void => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

    const displayWalletMaxButton = isTokenASelector
        ? !isWithdrawTokenAFromDexChecked && walletBalanceNonLocaleString !== '0.0'
        : !isWithdrawTokenBFromDexChecked && walletBalanceNonLocaleString !== '0.0';

    const walletBalanceMaxButton = displayWalletMaxButton ? (
        <button
            className={`${styles.max_button} ${styles.max_button_enable}`}
            onClick={() => {
                handleChangeClick(walletBalanceNonLocaleString);
                console.log('max button clicked');
            }}
        >
            Max
        </button>
    ) : (
        <p className={styles.max_button} />
    );

    const displaySurplusMaxButton = isTokenASelector
        ? isWithdrawTokenAFromDexChecked && surplusBalanceNonLocaleString !== '0.0'
        : isWithdrawTokenBFromDexChecked && surplusBalanceNonLocaleString !== '0.0';

    const surplusMaxButton =
        displaySurplusMaxButton ? (
            <button
                className={`${styles.max_button} ${styles.max_button_enable}`}
                onClick={() => {
                    handleChangeClick(surplusBalanceNonLocaleString);
                    console.log('clicked');
                }}
            >
                Max
            </button>
        ) : (
            <p className={styles.max_button} />
        );
    const exchangeBalanceTitle = (
        <p
            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            onClick={() =>
                openGlobalPopup(<ExchangeBalanceExplanation />, 'Exchange Balance', 'right')
            }
        >
            Exchange Balance <AiOutlineQuestionCircle size={14} />
        </p>
    );

    const surplusContent = (
        <div className={styles.main_surplus_container}>
            <DefaultTooltip
                interactive
                title={exchangeBalanceTitle}
                placement={'bottom'}
                arrow
                enterDelay={100}
                leaveDelay={200}
            >
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
                    }}
                    style={{
                        color:
                            (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                            (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                ? 'var(--text-highlight)'
                                : '#555555',
                    }}
                >
                    {surplusMaxButton}
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
                </div>
            </DefaultTooltip>
        </div>
    );

    const walletContent = (
        <div className={styles.main_wallet_container}>
            <IconWithTooltip
                title='Wallet Balance'
                placement='bottom'
                style={{ display: 'flex', alignItems: 'center' }}
            >
                <div
                    className={styles.balance_with_pointer}
                    onClick={() => {
                        if (isTokenASelector) {
                            setIsWithdrawTokenAFromDexChecked(false);
                        } else {
                            setIsWithdrawTokenBFromDexChecked(false);
                        }
                        // handleChangeClick(walletBalanceNonLocaleString);
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
                {walletBalanceMaxButton}
            </IconWithTooltip>
        </div>
    );

    const surplusContainerColorStyle =
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
            : '#555555';

    const swapboxBottomOrNull = !isUserLoggedIn ? (
        // || (isUserLoggedIn && !userHasEnteredAmount) ? (
        <div className={styles.swapbox_bottom} />
    ) : (
        <div className={styles.swapbox_bottom} style={{ color: surplusContainerColorStyle }}>
            {walletContent}
            {surplusContent}
        </div>
    );

    return (
        <div className={styles.swapbox}>
            {sellToken && <span className={styles.direction}>Amounts</span>}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input} id='range_sell_qty'>
                    <RangeCurrencyQuantity
                        value={tokenAorB === 'A' ? tokenAInputQty : tokenBInputQty}
                        thisToken={thisToken}
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                        disable={isFieldDisabled}
                        isAdvancedMode={isAdvancedMode}
                    />
                </div>
                <div
                    className={`${styles.token_select} ${isRangeCopied && styles.pulse_animation}`}
                    onClick={() => openTokenModal()}
                    id='range_token_selector'
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
            {swapboxBottomOrNull}
            {isTokenModalOpen && (
                <Modal
                    onClose={closeTokenModal}
                    title='Select Token'
                    centeredTitle
                    handleBack={handleInputClear}
                    showBackButton={false}
                    footer={null}
                >
                    <SoloTokenSelect
                        modalCloseCustom={modalCloseCustom}
                        provider={provider}
                        closeModal={closeTokenModal}
                        chainId={chainId}
                        importedTokens={importedTokensPlus}
                        setImportedTokens={setImportedTokens}
                        showSoloSelectTokenButtons={showSoloSelectTokenButtons}
                        setShowSoloSelectTokenButtons={setShowSoloSelectTokenButtons}
                        outputTokens={outputTokens}
                        validatedInput={validatedInput}
                        setInput={setInput}
                        searchType={searchType}
                        addRecentToken={addRecentToken}
                        getRecentTokens={getRecentTokens}
                        isSingleToken={false}
                        tokenAorB={tokenAorB}
                        reverseTokens={reverseTokens}
                        tokenPair={tokenPair}
                        uTokens={uTokens}
                    />
                </Modal>
            )}
        </div>
    );
}
