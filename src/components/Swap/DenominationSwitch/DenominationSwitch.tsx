// START: Import Local Files
import styles from './DenominationSwitch.module.css';
import {
    useAppDispatch,
    useAppSelector,
} from '../../../utils/hooks/reduxToolkit';
import { toggleDidUserFlipDenom } from '../../../utils/state/tradeDataSlice';
import { memo } from 'react';

function DenominationSwitch() {
    const dispatch = useAppDispatch();

    const tradeData = useAppSelector((state) => state.tradeData);

    const isDenomBase = tradeData.isDenomBase;
    const baseTokenSymbol = tradeData.baseToken.symbol;
    const quoteTokenSymbol = tradeData.quoteToken.symbol;

    return (
        <div className={styles.denomination_switch}>
            <button
                className={
                    !isDenomBase
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {baseTokenSymbol}
            </button>
            <button
                className={
                    isDenomBase
                        ? styles.active_button
                        : styles.non_active_button
                }
                onClick={(e) => {
                    dispatch(toggleDidUserFlipDenom());
                    e.stopPropagation();
                }}
            >
                {quoteTokenSymbol}
            </button>
        </div>
    );
}

export default memo(DenominationSwitch);
