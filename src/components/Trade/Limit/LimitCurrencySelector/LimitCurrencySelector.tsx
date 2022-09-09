// START: Import React and Dongles
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';
import Toggle2 from '../../../Global/Toggle/Toggle2';

// interface for component props
interface LimitCurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    setImportedTokens: Dispatch<SetStateAction<TokenIF[]>>;
    searchableTokens: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenABalance: string;
    tokenBBalance: string;
    tokenADexBalance: string;
    tokenBDexBalance: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    handleChangeClick?: (value: string) => void;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: Dispatch<SetStateAction<boolean>>;
    isSaveAsDexSurplusChecked: boolean;
    setIsSaveAsDexSurplusChecked: Dispatch<SetStateAction<boolean>>;
    activeTokenListsChanged: boolean;
    indicateActiveTokenListsChanged: Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        setImportedTokens,
        searchableTokens,
        chainId,
        fieldId,
        // direction,
        handleChangeEvent,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        tokenADexBalance,
        tokenBDexBalance,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        // isSaveAsDexSurplusChecked,
        setIsSaveAsDexSurplusChecked,
        activeTokenListsChanged,
        indicateActiveTokenListsChanged,
        handleChangeClick,
    } = props;

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;
    const [showManageTokenListContent, setShowManageTokenListContent] = useState(false);

    const [isModalOpen, openModal, closeModal] = useModal();

    const tokenToUpdate = fieldId === 'sell' ? 'A' : 'B';

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token' centeredTitle>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                setImportedTokens={setImportedTokens}
                searchableTokens={searchableTokens}
                tokenToUpdate={tokenToUpdate}
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

    // IMPORTANT!  The Limit Order module is the one only transaction configurator
    // ... in the app which has an input field with no token selector.  For that
    // ... reason, `LimitCurrencySelector.tsx` file needs to be coded separately
    // ... from its counterparts in the Swap/Market/Range modules, even if we use
    // ... a common element for those modules in the future.

    const tokenSelect = (
        <div className={styles.token_select} onClick={openModal}>
            <img
                className={styles.token_list_img}
                src={thisToken.logoURI}
                alt={thisToken.name + 'token logo'}
                width='30px'
            />
            <span className={styles.token_list_text}>{thisToken.symbol}</span>
            <RiArrowDownSLine size={27} />
        </div>
    );

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {fieldId === 'sell' ? 'Use Surplus' : null}
            {/* {fieldId === 'sell' ? 'Use Surplus' : 'Add to Surplus'} */}

            {fieldId === 'sell' ? (
                <Toggle2
                    isOn={isWithdrawFromDexChecked}
                    handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                    id='sell_token_withdrawal'
                    disabled={parseFloat(tokenADexBalance) <= 0}
                />
            ) : null}
            {/* {fieldId === 'sell' ? (
                <Toggle2
                    isOn={isWithdrawFromDexChecked}
                    handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                    id='sell_token_withdrawal'
                    disabled={parseFloat(tokenADexBalance) <= 0}
                />
            ) : (
                <Toggle2
                    isOn={isSaveAsDexSurplusChecked}
                    handleToggle={() => setIsSaveAsDexSurplusChecked(!isSaveAsDexSurplusChecked)}
                    id='buy_token_withdrawal'
                />
            )} */}
        </span>
    );

    const walletBalanceNonLocaleString =
        props.sellToken && tokenABalance !== ''
            ? parseFloat(tokenABalance).toString()
            : !props.sellToken && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toString()
            : '0';

    const walletBalanceLocaleString =
        props.sellToken && tokenABalance !== ''
            ? parseFloat(tokenABalance).toLocaleString()
            : !props.sellToken && tokenBBalance !== ''
            ? parseFloat(tokenBBalance).toLocaleString()
            : '0';

    const surplusBalanceNonLocaleString =
        props.sellToken && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toString()
            : !props.sellToken && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toString()
            : '0';

    const surplusBalanceLocaleString =
        props.sellToken && tokenADexBalance !== ''
            ? parseFloat(tokenADexBalance).toLocaleString()
            : !props.sellToken && tokenBDexBalance !== ''
            ? parseFloat(tokenBDexBalance).toLocaleString()
            : '0';

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}> </span>
            {/* <span className={styles.direction}>{direction}</span> */}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <LimitCurrencyQuantity
                        fieldId={fieldId}
                        handleChangeEvent={handleChangeEvent}
                    />
                </div>
                {fieldId === 'buy' || fieldId === 'sell' ? tokenSelect : null}
            </div>
            <div className={styles.swapbox_bottom}>
                <div className={styles.surplus_container}>
                    <div
                        className={styles.balance_with_pointer}
                        onClick={() => {
                            props.sellToken && handleChangeClick
                                ? handleChangeClick(walletBalanceNonLocaleString)
                                : setIsSaveAsDexSurplusChecked(false);
                        }}
                    >
                        Wallet: {walletBalanceLocaleString}{' '}
                    </div>{' '}
                    |{' '}
                    <div
                        className={styles.balance_with_pointer}
                        onClick={() => {
                            props.sellToken && handleChangeClick
                                ? handleChangeClick(surplusBalanceNonLocaleString)
                                : setIsSaveAsDexSurplusChecked(true);
                        }}
                    >
                        Surplus: {surplusBalanceLocaleString}
                    </div>
                </div>
                {/* {fieldId === 'sell' ? (
                    <span>Wallet: {walletBalance} | Surplus: 0</span>
                ) : (
                    <span>Wallet: {walletBalance} | Surplus: 0</span>
                )} */}
                {fieldId === 'buy' || fieldId === 'sell' ? DexBalanceContent : null}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
