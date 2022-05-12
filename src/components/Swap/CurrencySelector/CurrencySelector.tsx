import styles from 'CurrencySelector.module.css';
import CurrencyQuantity from '../CurrencyQuantity/CurrencyQauntity';
import { RiArrowDownSLine } from 'react-icons/ri';

interface CurrencySelectorProps {
    fieldId: string;
    direction: string;
}

export default function CurrencySelector(props: CurrencySelectorProps) {
    const { direction, fieldId } = props;

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <CurrencyQuantity fieldId={fieldId} />
                </div>
                <div className={styles.token_select} onClick={openModal}>
                    <img
                        className={styles.token_list_img}
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>ETH</span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'limit-sell' ? (
                    <span>Wallet: 69.420 | DEX: 0.00</span>
                ) : (
                    <span>Wallet: 0.00 | Surplus: 69.0</span>
                )}
                {fieldId === 'limit-sell' ? DexBalanceContent : WithdrawTokensContent}
            </div>
            {ModalOrNull}
        </div>
    );
}
