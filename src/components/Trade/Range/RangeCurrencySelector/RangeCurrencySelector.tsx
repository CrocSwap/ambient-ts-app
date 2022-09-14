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

interface RangeCurrencySelectorProps {
    fieldId: string;
    chainId: string;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    isTokenAEth: boolean;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
    tokenAWalletMinusTokenAQtyNum: number;
    tokenBWalletMinusTokenBQtyNum: number;
    tokenASurplusMinusTokenARemainderNum: number;
    tokenBSurplusMinusTokenBRemainderNum: number;
    tokenASurplusMinusTokenAQtyNum: number;
    tokenBSurplusMinusTokenBQtyNum: number;
    sellToken?: boolean;
    reverseTokens: () => void;
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
}

export default function RangeCurrencySelector(props: RangeCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        isTokenAEth,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        tokenAWalletMinusTokenAQtyNum,
        tokenBWalletMinusTokenBQtyNum,
        fieldId,
        sellToken,
        updateOtherQuantity,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        tokenASurplusMinusTokenARemainderNum,
        // tokenBSurplusMinusTokenBRemainderNum,
        tokenASurplusMinusTokenAQtyNum,
        tokenBSurplusMinusTokenBQtyNum,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        handleChangeClick,
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
            <IconWithTooltip title='Use Exchange Surplus' placement='bottom'>
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

    const walletBalanceNonLocaleString =
        isTokenASelector && tokenABalance !== ''
            ? parseFloat(tokenABalance).toString()
            : fieldId !== 'A' && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toString()
            : '0.00';

    const walletBalanceLocaleString = isTokenASelector
        ? tokenAWalletMinusTokenAQtyNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })
        : tokenBWalletMinusTokenBQtyNum.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    const surplusBalanceNonLocaleString =
        isTokenASelector && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toString()
            : fieldId === 'B' && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toString()
            : '0.00';

    const surplusBalanceLocaleString = isTokenASelector
        ? isWithdrawTokenAFromDexChecked
            ? isTokenAEth && tokenASurplusMinusTokenARemainderNum
                ? tokenASurplusMinusTokenARemainderNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
                : tokenASurplusMinusTokenAQtyNum.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })
            : parseFloat(tokenADexBalance || '0').toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : isWithdrawTokenBFromDexChecked
        ? !isTokenAEth && tokenBSurplusMinusTokenBQtyNum
            ? tokenBSurplusMinusTokenBQtyNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
            : tokenBSurplusMinusTokenBQtyNum.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
              })
        : parseFloat(tokenBDexBalance || '0').toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          });

    // console.log({ fieldId });
    // console.log({ isTokenADisabled });
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
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={thisToken.logoURI}
                        alt={`${thisToken.name} logo`}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{thisToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <div
                    className={styles.surplus_container}
                    style={{
                        color:
                            (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                            (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                ? '#555555'
                                : '#ebebff',
                    }}
                >
                    <IconWithTooltip title='Wallet Balance After Range Mint' placement='bottom'>
                        <div
                            className={styles.balance_with_pointer}
                            onClick={() => {
                                handleChangeClick(walletBalanceNonLocaleString);
                            }}
                        >
                            <div className={styles.wallet_logo}>
                                <MdAccountBalanceWallet
                                    size={20}
                                    color={
                                        (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                                        (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                            ? '#555555'
                                            : '#ebebff'
                                    }
                                />
                            </div>
                            <div>{walletBalanceLocaleString}</div>
                        </div>{' '}
                    </IconWithTooltip>
                    <IconWithTooltip title='Exchange Surplus After Range Mint' placement='bottom'>
                        <div
                            className={`${styles.balance_with_pointer} ${
                                (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                                (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                    ? null
                                    : styles.grey_logo
                            }`}
                            onClick={() => {
                                handleChangeClick(surplusBalanceNonLocaleString);
                            }}
                            style={{
                                color:
                                    (isTokenASelector && isWithdrawTokenAFromDexChecked) ||
                                    (!isTokenASelector && isWithdrawTokenBFromDexChecked)
                                        ? '#ebebff'
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
                            {surplusBalanceLocaleString}
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
