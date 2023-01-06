import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import Toggle2 from '../../../Global/Toggle/Toggle2';
import ambientLogo from '../../../../assets/images/logos/ambient_logo.svg';
import { MdAccountBalanceWallet } from 'react-icons/md';
import IconWithTooltip from '../../../Global/IconWithTooltip/IconWithTooltip';
import NoTokenIcon from '../../../Global/NoTokenIcon/NoTokenIcon';
import { SoloTokenSelect } from '../../../../components/Global/TokenSelectContainer/SoloTokenSelect';
import { getRecentTokensParamsIF } from '../../../../App/hooks/useRecentTokens';
import { useSoloSearch } from '../../../Global/TokenSelectContainer/hooks/useSoloSearch';

interface RangeCurrencySelectorProps {
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
    isRangeCopied: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
    handleChangeClick: (input: string) => void;
    verifyToken: (addr: string, chn: string) => boolean;
    getTokensByName: (searchName: string, chn: string, exact: boolean) => TokenIF[];
    getTokenByAddress: (addr: string, chn: string) => TokenIF | undefined;
    importedTokensPlus: TokenIF[];
    getRecentTokens: (options?: getRecentTokensParamsIF | undefined) => TokenIF[];
    addRecentToken: (tkn: TokenIF) => void;
    tokenAorB: string;
}

export default function RangeCurrencySelector(props: RangeCurrencySelectorProps) {
    const {
        provider,
        isUserLoggedIn,
        gasPriceInGwei,
        // resetTokenQuantities,
        tokenPair,
        tokensBank,
        setImportedTokens,
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
        // activeTokenListsChanged,
        // indicateActiveTokenListsChanged,
        handleChangeClick,
        isRangeCopied,
        verifyToken,
        getTokensByName,
        getTokenByAddress,
        importedTokensPlus,
        getRecentTokens,
        addRecentToken,
        tokenAorB,
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

    const [isTokenModalOpen, openTokenModal, closeTokenModal] = useModal();
    const [showSoloSelectTokenButtons, setShowSoloSelectTokenButtons] = useState(true);
    const [outputTokens, validatedInput, setInput, searchType] = useSoloSearch(
        chainId,
        tokensBank,
        verifyToken,
        getTokenByAddress,
        getTokensByName,
    );

    const handleInputClear = () => {
        setInput('');
        const soloTokenSelectInput = document.getElementById(
            'solo-token-select-input',
        ) as HTMLInputElement;
        soloTokenSelectInput.value = '';
    };

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
                    onClick={() => openTokenModal()}
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
                        provider={provider}
                        closeModal={closeTokenModal}
                        chainId={chainId}
                        importedTokens={importedTokensPlus}
                        setImportedTokens={setImportedTokens}
                        getTokensByName={getTokensByName}
                        getTokenByAddress={getTokenByAddress}
                        verifyToken={verifyToken}
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
                    />
                </Modal>
            )}
        </div>
    );
}
