import { memo } from 'react';
import styles from '../Transactions.module.css';

interface propsIF {
    id: string;
    showPair: boolean;
    showColumns: boolean;
}

const TransactionsRowPlaceholder = (props: propsIF) => {
    const { id, showColumns, showPair } = props;

    const timeElement = <p className='base_color'>Now</p>;

    const idElement = (
        <p className={`${styles.base_color} ${styles.mono_font}`}>{id}</p>
    );

    const walletElement = <p className={`${styles.gradient_text}`}>you</p>;

    return (
        <>
            <ul
                className={`${styles.row_container} ${styles.border_left}`}
                id={id}
            >
                {showPair && <li>{timeElement}</li>}
                <li>{idElement}</li>
                {!showColumns && <li>{walletElement}</li>}
                {showColumns && (
                    <li>
                        {idElement}
                        {walletElement}
                    </li>
                )}
            </ul>
        </>
    );
};

export default memo(TransactionsRowPlaceholder);
