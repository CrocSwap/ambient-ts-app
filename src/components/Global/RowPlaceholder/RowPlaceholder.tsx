import { memo, useContext } from 'react';
import { TradeTableContext } from '../../../contexts/TradeTableContext';
import styles from './RowPlaceholder.module.css';

interface RowPlaceholderPropsIF {
    rowStyle: string;
    time: React.ReactNode;
    id: React.ReactNode;
    wallet: React.ReactNode;
    price?: React.ReactNode;
    side?: React.ReactNode;
    type?: React.ReactNode;
    value?: React.ReactNode;
    min?: React.ReactNode;
    max?: React.ReactNode;
}

const RowPlaceholder = (props: RowPlaceholderPropsIF) => {
    const { rowStyle, time, id, wallet, price, side, type, value, min, max } =
        props;
    const { showAllData } = useContext(TradeTableContext);

    return (
        <>
            <ul className={`${rowStyle} ${showAllData && styles.border_left}`}>
                {[time, id, wallet, price, side, type, value, min, max].map(
                    (item, idx) => (
                        <>{item && <li key={idx}>{item}</li>}</>
                    ),
                )}
            </ul>
        </>
    );
};

export default memo(RowPlaceholder);
