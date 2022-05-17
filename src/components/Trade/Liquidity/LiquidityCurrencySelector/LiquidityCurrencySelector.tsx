import styles from './CurrencySelector.module.css';
import LiquidityCurrencyQuantity from '../LiquidityCurrencyQuantity/LiquidityCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import { useState, ChangeEvent } from 'react';

interface LiquidityCurrencySelectorProps {
    fieldId: string;
    direction: string;
    sellToken?: boolean;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LiquidityCurrencySelector(props: LiquidityCurrencySelectorProps) {
    const { direction, fieldId, updateOtherQuantity } = props;
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            Use DEX balance
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={40}
                    id='surplus_liquidity'
                />
            </div>
        </span>
    );

    const WithdrawTokensContent = (
        <span className={styles.surplus_toggle}>
            Withdraw tokens
            <div className={styles.toggle_container}>
                <Toggle
                    isOn={isChecked}
                    handleToggle={() => setIsChecked(!isChecked)}
                    Width={40}
                    id='tokens_withdrawal'
                />
            </div>
        </span>
    );

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <LiquidityCurrencyQuantity
                        fieldId={fieldId}
                        updateOtherQuantity={updateOtherQuantity}
                    />
                </div>
                <div className={styles.token_select}>
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
        </div>
    );
}
