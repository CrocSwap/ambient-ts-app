// START: Import React and Dongles
import { ChangeEvent, SetStateAction } from 'react';
import { RiArrowDownSLine } from 'react-icons/ri';

// START: Import React Functional Components
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';
import Toggle from '../../../Global/Toggle/Toggle';

// START: Import Local Files
import styles from './LimitCurrencySelector.module.css';
import { TokenIF, TokenPairIF } from '../../../../utils/interfaces/exports';
import Modal from '../../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../../Global/TokenSelectContainer/TokenSelectContainer';
import { useModal } from '../../../../components/Global/Modal/useModal';

// interface for component props
interface LimitCurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    reverseTokens: () => void;
    tokenABalance: string;
    tokenBBalance: string;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawToWalletChecked: boolean;
    setIsWithdrawToWalletChecked: React.Dispatch<SetStateAction<boolean>>;
}

// central react functional component
export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        fieldId,
        direction,
        handleChangeEvent,
        reverseTokens,
        tokenABalance,
        tokenBBalance,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
    } = props;

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    const [isModalOpen, openModal, closeModal] = useModal();

    const tokenToUpdate = fieldId === 'sell' ? 'A' : 'B';

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                tokenToUpdate={tokenToUpdate}
                chainId={chainId}
                tokenList={tokensBank}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
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
            {fieldId === 'sell' ? 'Use DEX balance' : 'Withdraw to Wallet'}
            <div className={styles.toggle_container}>
                {fieldId === 'sell' ? (
                    <Toggle
                        isOn={isWithdrawFromDexChecked}
                        handleToggle={() => setIsWithdrawFromDexChecked(!isWithdrawFromDexChecked)}
                        Width={36}
                        id='sell_token_withdrawal'
                    />
                ) : (
                    <Toggle
                        isOn={isWithdrawToWalletChecked}
                        handleToggle={() =>
                            setIsWithdrawToWalletChecked(!isWithdrawToWalletChecked)
                        }
                        Width={36}
                        id='buy_token_withdrawal'
                    />
                )}
            </div>
        </span>
    );

    const walletBalance =
        props.sellToken && tokenABalance !== 'NaN'
            ? tokenABalance
            : !props.sellToken && tokenBBalance !== 'NaN'
            ? tokenBBalance
            : '0';

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
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
                {fieldId === 'sell' ? (
                    <span>Wallet: {walletBalance} | DEX: 0.00</span>
                ) : (
                    <span>Wallet: {walletBalance} | DEX: 0.00</span>
                )}
                {fieldId === 'buy' || fieldId === 'sell' ? DexBalanceContent : null}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
