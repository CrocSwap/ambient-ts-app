import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import Toggle2 from '../../../Global/Toggle/Toggle2';

interface RangeCurrencySelectorProps {
    fieldId: string;
    chainId: string;
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: Dispatch<SetStateAction<boolean>>;
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
        tokenBDexBalance,
        isTokenADisabled,
        isTokenBDisabled,
        isAdvancedMode,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        handleChangeClick,
    } = props;

    const thisToken = fieldId === 'A' ? tokenPair.dataTokenA : tokenPair.dataTokenB;
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
            {'Use Surplus'}
            {fieldId === 'A' ? (
                <Toggle2
                    isOn={isWithdrawTokenAFromDexChecked}
                    handleToggle={() =>
                        setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked)
                    }
                    id='withdraw_from_dex'
                    disabled={parseFloat(tokenADexBalance) <= 0}
                />
            ) : (
                <Toggle2
                    isOn={isWithdrawTokenBFromDexChecked}
                    handleToggle={() =>
                        setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked)
                    }
                    id='withdraw_to_wallet'
                    disabled={parseFloat(tokenBDexBalance) <= 0}
                />
            )}
        </span>
    );

    // const walletBalanceNum =
    //     fieldId === 'A' && tokenABalance !== ''
    //         ? parseFloat(tokenABalance)
    //         : fieldId === 'B' && tokenBBalance !== ''
    //         ? parseFloat(tokenBBalance)
    //         : 0;

    const walletBalanceNonLocaleString =
        fieldId === 'A' && tokenABalance !== ''
            ? parseFloat(tokenABalance).toString()
            : fieldId !== 'A' && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toString()
            : '0';

    const walletBalanceLocaleString =
        fieldId === 'A' && tokenABalance !== ''
            ? parseFloat(tokenABalance).toLocaleString()
            : fieldId !== 'A' && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toLocaleString()
            : '0';

    const surplusBalanceNonLocaleString =
        fieldId === 'A' && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toString()
            : fieldId === 'B' && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toString()
            : '0';

    const surplusBalanceLocaleString =
        fieldId === 'A' && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toLocaleString()
            : fieldId === 'B' && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toLocaleString()
            : '0';

    // console.log({ fieldId });
    // console.log({ isTokenADisabled });
    const isFieldDisabled =
        (fieldId === 'A' && isTokenADisabled) || (fieldId === 'B' && isTokenBDisabled);

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
                        alt='ethereum logo'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{thisToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <div className={styles.surplus_container}>
                    <div
                        className={styles.balance_with_pointer}
                        onClick={() => {
                            handleChangeClick(walletBalanceNonLocaleString);
                        }}
                    >
                        Wallet: {walletBalanceLocaleString}{' '}
                    </div>{' '}
                    |{' '}
                    <div
                        className={styles.balance_with_pointer}
                        onClick={() => {
                            handleChangeClick(surplusBalanceNonLocaleString);
                        }}
                    >
                        Surplus: {surplusBalanceLocaleString}
                    </div>
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
