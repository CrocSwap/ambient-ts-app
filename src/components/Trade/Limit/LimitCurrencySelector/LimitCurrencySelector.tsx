import styles from './LimitCurrencySelector.module.css';
import LimitCurrencyQuantity from '../LimitCurrencyQuantity/LimitCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import {
    useState,
    // ChangeEvent
} from 'react';

interface LimitCurrencySelectorProps {
    fieldId: string;
    direction: string;
    sellToken?: boolean;

    // updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
}

export default function LimitCurrencySelector(props: LimitCurrencySelectorProps) {
    const { fieldId, sellToken, direction } = props;
    const [isChecked, setIsChecked] = useState<boolean>(false);

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            Use DEX balance
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

    return (
        <div className={styles.swapbox}>
            <span className={styles.direction}>{direction}</span>
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <LimitCurrencyQuantity fieldId={fieldId} />
                </div>
                <div className={styles.token_select}>
                    <img
                        className={styles.token_list_img}
                        src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/480px-Ethereum-icon-purple.svg.png'
                        alt='ethreum'
                        width='30px'
                    />
                    <span className={styles.token_list_text}>
                        {props.sellToken === true ? 'ETH' : 'DAI'}
                    </span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                {fieldId === 'buy' ? <span>Wallet: 69.420 | DEX: 0.00</span> : null}
                {fieldId === 'buy' && DexBalanceContent}
            </div>
        </div>
    );
}
