import { CSSProperties, ReactNode } from 'react';
import styles from './ContentContainer.module.css';

interface ContentContainerPropsIF {
    children: ReactNode;
    isOnTradeRoute?: boolean;
    style?: CSSProperties; // Allow custom inline styles
}

export default function ContentContainer(props: ContentContainerPropsIF) {
    const {
        children,
        isOnTradeRoute,
        style
    } = props;

    const tradeRouteStyle = isOnTradeRoute
        ? styles.trade_route
        : styles.swap_route
    

    return (
        <section className={tradeRouteStyle} style={style}>
            <div className={styles.container} >
                <div className={styles.main_content}>
                    {children}
                </div>
            </div>
        </section>
    );
}
