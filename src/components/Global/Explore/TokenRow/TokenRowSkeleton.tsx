import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './TokenRow.module.css';
interface PropsIF {
    isVaultPage?: boolean;
}
export default function TokenRowSkeleton(props: PropsIF) {
    const { isVaultPage } = props;
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
        <div
            className={`${styles.gridContainer} ${isVaultPage ? styles.vaultContainer : ''}`}
        >
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
