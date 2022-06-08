import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../Global/Toggle/Toggle';
import {
    // useState,
    ChangeEvent,
    SetStateAction,
} from 'react';
import { TokenIF, TokenPairIF } from '../../../utils/interfaces/exports';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../Global/TokenSelectContainer/TokenSelectContainer';
import { getAmbientTokens } from '../../../tempdata';

interface CurrencySelectorProps {
    tokenPair: TokenPairIF;
    tokensBank: Array<TokenIF>;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    nativeBalance: string;
    tokenABalance: string;
    tokenBBalance: string;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawToWalletChecked: boolean;
    setIsWithdrawToWalletChecked: React.Dispatch<SetStateAction<boolean>>;
    handleChangeEvent: (evt: ChangeEvent<HTMLInputElement>) => void;
    reverseTokens: () => void;
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    const {
        tokenPair,
        tokensBank,
        chainId,
        direction,
        fieldId,
        handleChangeEvent,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
        tokenABalance,
        tokenBBalance,
        reverseTokens,
    } = props;
    // const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isModalOpen, openModal, closeModal] = useModal();

    const thisToken = fieldId === 'sell' ? tokenPair.dataTokenA : tokenPair.dataTokenB;

    // const DexBalanceContent = (
    //     <span className={styles.surplus_toggle}>
    //         {fieldId === 'sell' ? 'Withdraw from DEX balance' : 'Withdraw to Wallet'}
    //         <div className={styles.toggle_container}>
    //             <Toggle
    //                 isOn={isChecked}
    //                 handleToggle={() => setIsChecked(!isChecked)}
    //                 Width={36}
    //                 id='surplus_liquidity'
    //             />
    //         </div>
    //     </span>
    // );

    const WithdrawTokensContent = (
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

    const tokenToUpdate = fieldId === 'sell' ? 'A' : 'B';

    const tempTokenList = getAmbientTokens();

    const tokenSelectModalOrNull = isModalOpen ? (
        <Modal onClose={closeModal} title='Select Token'>
            <TokenSelectContainer
                tokenPair={tokenPair}
                tokensBank={tokensBank}
                tokenToUpdate={tokenToUpdate}
                chainId={chainId}
                tokenList={tempTokenList}
                closeModal={closeModal}
                reverseTokens={reverseTokens}
            />
        </Modal>
    ) : null;

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
                    <CurrencyQuantity fieldId={fieldId} handleChangeEvent={handleChangeEvent} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={thisToken.logoURI}
                        alt={thisToken.name}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{thisToken.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: {walletBalance} | Surplus: 0</span>
                {/* {fieldId === 'limit-sell' ? DexBalanceContent : WithdrawTokensContent} */}
                {WithdrawTokensContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
