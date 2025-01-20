import { useMediaQuery } from '../../../../utils/hooks/useMediaQuery';
import styles from './PoolRow.module.css';

export default function PoolRowSkeleton() {
    const desktopView = useMediaQuery('(min-width: 768px)');

    const displayItems = [
        !desktopView
            ? null
            : {
                  element: <div className={styles.tokenIcon}>...</div>,
              },
        {
            element: <div>...</div>,

            classname: styles.poolName,
        },
        {
            element: <div>...</div>,
        },

        {
            element: <div>...</div>,
        },
        {
            element: <div>...</div>,
        },
        desktopView
            ? {
                  element: <div>...</div>,
              }
            : null,
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
