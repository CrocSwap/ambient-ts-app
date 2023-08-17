import { memo } from 'react';
import styles from './RowPlaceholder.module.css';

interface RowPlaceholderPropsIF {
    id: string;
    showColumns?: boolean;
    showTimestamp?: boolean;
    extraStyle: string;
}

const RowPlaceholder = (props: RowPlaceholderPropsIF) => {
    const { id, showColumns, showTimestamp, extraStyle } = props;

    const timeElement = <p className='base_color'>Now</p>;

    const idElement = (
        <p
            className={`${styles.base_color} ${styles.mono_font} ${styles.hover_style}`}
        >
            {id}
        </p>
    );

    const walletElement = (
        <p className={`primary_color ${styles.hover_style} ${styles.id_style}`}>
            you
        </p>
    );

    return (
        <>
            <ul className={`${extraStyle} ${styles.border_left}`} id={id}>
                {showTimestamp && <li>{timeElement}</li>}
                {!showColumns && <li>{idElement}</li>}
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
