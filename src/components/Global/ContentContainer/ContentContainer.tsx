import { ReactNode } from 'react';
import styles from './ContentContainer.module.css';

interface ContentContainerPropsIF {
    children: ReactNode;
    customWidth?: boolean;
    customWidthAuto?: boolean;
    isOnTradeRoute?: boolean;
    padding?: string;
}

export default function ContentContainer(props: ContentContainerPropsIF) {
    const { children, isOnTradeRoute, customWidth, customWidthAuto, padding } =
        props;

    const customWidthStyle = customWidth ? styles.customWidth_container : null;
    const tradeRouteStyle = isOnTradeRoute
        ? styles.no_background
        : styles.swap_bg;
    const swapRouteStyle = isOnTradeRoute ? null : styles.swap_route;
    const customWidthAutoStyle = customWidthAuto
        ? styles.customWidthAuto
        : styles.container;

    const paddingStyle = padding ?? '0 1rem';

    // TODO:   @Junior do we need the wrapper in the return below?  -Emily
    return (
        <section
            className={`$ ${customWidthStyle} ${customWidthAutoStyle} ${tradeRouteStyle} ${swapRouteStyle}`}
        >
            <section className={`${styles.window} ${tradeRouteStyle}`}>
                <div
                    className={styles.main_content}
                    style={{ padding: paddingStyle }}
                >
                    {children}
                </div>
            </section>
        </section>
    );
}
