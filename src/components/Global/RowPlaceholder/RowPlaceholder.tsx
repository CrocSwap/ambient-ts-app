import { memo } from 'react';
import styles from './RowPlaceholder.module.css';

interface RowPlaceholderPropsIF {
    id: string;
    showPair: boolean;
    showColumns: boolean;
    extraStyle: string;
}

const RowPlaceholder = (props: RowPlaceholderPropsIF) => {
    const { id, showColumns, showPair, extraStyle } = props;

    const timeElement = <p className='base_color'>Now</p>;

    const idElement = (
        <p className={`${styles.base_color} ${styles.mono_font} ${styles.hover_style}`}>{id}</p>
    );

    const walletElement = <p className={`owned_tx_contrast ${styles.hover_style} ${styles.id_style}`} >you</p>;

    return (
        <>
            <ul className={`${extraStyle} ${styles.border_left}`} id={id}>
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

export default memo(RowPlaceholder);
