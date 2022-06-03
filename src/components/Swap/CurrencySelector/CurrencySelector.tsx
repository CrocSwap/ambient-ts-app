import styles from './CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../Global/Toggle/Toggle';
import { useState, ChangeEvent, SetStateAction } from 'react';
import { TokenIF } from '../../../utils/interfaces/TokenIF';
import { useModal } from '../../../components/Global/Modal/useModal';
import Modal from '../../../components/Global/Modal/Modal';
import TokenSelectContainer from '../../Global/TokenSelectContainer/TokenSelectContainer';
import { getAmbientTokens } from '../../../tempdata';

interface CurrencySelectorProps {
    tokenData: TokenIF;
    chainId: string;
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    nativeBalance: string;
    isWithdrawFromDexChecked: boolean;
    setIsWithdrawFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawToWalletChecked: boolean;
    setIsWithdrawToWalletChecked: React.Dispatch<SetStateAction<boolean>>;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    const {
        tokenData,
        chainId,
        direction,
        fieldId,
        updateOtherQuantity,
        isWithdrawFromDexChecked,
        setIsWithdrawFromDexChecked,
        isWithdrawToWalletChecked,
        setIsWithdrawToWalletChecked,
    } = props;
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isModalOpen, openModal, closeModal] = useModal();

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {fieldId === 'sell' ? 'Withdraw from DEX balance' : 'Withdraw to Wallet'}
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={36}
                    id='surplus_liquidity'
                />
            </div>
        </span>
    );

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
                tokenToUpdate={tokenToUpdate}
                chainId={chainId}
                tokenList={tempTokenList}
                closeModal={closeModal}
            />
        </Modal>
    ) : null;

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <CurrencyQuantity fieldId={fieldId} updateOtherQuantity={updateOtherQuantity} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src={tokenData.logoURI}
                        alt={tokenData.name}
                        width='30px'
                    />
                    <span className={styles.token_list_text}>{tokenData.symbol}</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'limit-sell' ? (
                    <span>Wallet: 69.420 | DEX: 0.00</span>
                ) : (
                    <span>
                        Wallet:{' '}
                        {props.sellToken && props.nativeBalance !== 'NaN'
                            ? props.nativeBalance
                            : '0'}{' '}
                        | Surplus: 0
                    </span>
                )}
                {fieldId === 'limit-sell' ? DexBalanceContent : WithdrawTokensContent}
            </div>
            {tokenSelectModalOrNull}
        </div>
    );
}
