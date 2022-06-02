import { ChangeEvent, SetStateAction } from 'react';
import styles from './RangeCurrencySelector.module.css';
import RangeCurrencyQuantity from '../RangeCurrencyQuantity/RangeCurrencyQuantity';
import { RiArrowDownSLine } from 'react-icons/ri';
import Toggle from '../../../Global/Toggle/Toggle';
import { TokenIF } from '../../../../utils/interfaces/TokenIF';

interface RangeCurrencySelectorProps {
    fieldId: string;
    tokenData: TokenIF;
    updateOtherQuantity: (evt: ChangeEvent<HTMLInputElement>) => void;
    isWithdrawTokenAFromDexChecked: boolean;
    setIsWithdrawTokenAFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    isWithdrawTokenBFromDexChecked: boolean;
    setIsWithdrawTokenBFromDexChecked: React.Dispatch<SetStateAction<boolean>>;
    sellToken?: boolean;
}

export default function RangeCurrencySelector(props: RangeCurrencySelectorProps) {
    const {
        tokenData,
        isWithdrawTokenAFromDexChecked,
        setIsWithdrawTokenAFromDexChecked,
        isWithdrawTokenBFromDexChecked,
        setIsWithdrawTokenBFromDexChecked,
        fieldId,
        sellToken,
        updateOtherQuantity,
    } = props;

    console.log(tokenData);

    const DexBalanceContent = (
        <span className={styles.surplus_toggle}>
            {'Use DEX Balance'}
            <div className={styles.toggle_container}>
                {fieldId === 'A' ? (
                    <Toggle
                        isOn={isWithdrawTokenAFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenAFromDexChecked(!isWithdrawTokenAFromDexChecked)
                        }
                        Width={36}
                        id='withdraw_from_dex'
                    />
                ) : (
                    <Toggle
                        isOn={isWithdrawTokenBFromDexChecked}
                        handleToggle={() =>
                            setIsWithdrawTokenBFromDexChecked(!isWithdrawTokenBFromDexChecked)
                        }
                        Width={36}
                        id='withdraw_to_wallet'
                    />
                )}
            </div>
        </span>
    );

    return (
        <div className={styles.swapbox}>
            {sellToken && <span className={styles.direction}>Amounts</span>}
            <div className={styles.swapbox_top}>
                <div className={styles.swap_input}>
                    <RangeCurrencyQuantity
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
                    <span className={styles.token_list_text}>
                        {fieldId === 'A' ? 'ETH' : 'DAI'}
                    </span>
                    <RiArrowDownSLine size={27} />
                </div>
            </div>
            <div className={styles.swapbox_bottom}>
                <span>Wallet: 69.420 | DEX: 0.00</span>

                {DexBalanceContent}
            </div>
        </div>
    );
}
