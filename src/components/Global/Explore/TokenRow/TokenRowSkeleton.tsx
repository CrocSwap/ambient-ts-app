import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import styles from './TokenRow.module.css';
export default function TokenRowSkeleton() {
    const desktopView = useMediaQuery('(min-width: 768px)');

    const displayItems = [
        // mobileScrenView ? null :
        {
            element: <div className={styles.tokenIcon}>...</div>,
        },
        desktopView
            ? {
                  element: <div>...</div>,
                  classname: styles.poolName,
              }
            : null,
        {
            element: <div>...</div>,
        },
        {
            element: <div>...</div>,
        },
        {
            element: <div>...</div>,
        },

        {
            element: <div>...</div>,

            classname: styles.tradeButton,
        },
    ];

    return (
        <div className={styles.gridContainer}>
            {displayItems
                .filter((item) => item !== null) // Filter out null values
                .map((item, idx) => (
                    <div
                        key={idx}
                        className={`${styles.gridItem} ${item?.classname} ${styles.skeletonItem}`}
                        // style={{background: 'yellow'}}
                    >
                        {item?.element}
                    </div>
                ))}
        </div>
    );
}
