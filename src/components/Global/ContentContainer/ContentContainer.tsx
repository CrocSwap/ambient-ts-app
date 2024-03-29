import { ReactNode } from 'react';
import styles from './ContentContainer.module.css';

interface ContentContainerPropsIF {
    children: ReactNode;
    customWidth?: boolean;
    customWidthAuto?: boolean;
    isOnTradeRoute?: boolean;
    noPadding?: boolean;
    noStyle?: boolean;
}

export default function ContentContainer(props: ContentContainerPropsIF) {
    const {
        children,
        isOnTradeRoute,
        customWidth,
        customWidthAuto,
        noPadding,
        noStyle,
    } = props;

    const customWidthStyle = customWidth ? styles.customWidth_container : null;
    const tradeRouteStyle = isOnTradeRoute
        ? styles.no_background
        : styles.swap_bg;
    const swapRouteStyle = isOnTradeRoute ? null : styles.swap_route;
    const customWidthAutoStyle = customWidthAuto
        ? styles.customWidthAuto
        : styles.container;

    if (noStyle) return <>{children}</>;

    return (
        <section
            className={`$ ${customWidthStyle} ${customWidthAutoStyle} ${tradeRouteStyle} ${swapRouteStyle}`}
        >
            <section className={`${styles.window} ${tradeRouteStyle}`}>
                <div
                    className={`${styles.main_content} ${
                        !isOnTradeRoute && styles.swap_main_content
                    }`}
                    style={{ padding: noPadding ? '' : '8px 16px 16px 16px' }}
                >
                    {children}
                </div>
            </section>
        </section>
    );
}
