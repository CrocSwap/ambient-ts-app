import { ReactNode } from 'react';
import styles from './ContentContainer.module.css';

interface ContentContainerPropsIF {
    children: ReactNode;
    customWidth?: boolean;
    customWidthAuto?: boolean;
    isOnTradeRoute?: boolean;
}

export default function ContentContainer(props: ContentContainerPropsIF) {
    const {
        children,
        isOnTradeRoute,
        customWidth,
        customWidthAuto
    } = props;

    const customWidthStyle = customWidth ? styles.customWidth_container : null;
    const tradeRouteStyle = isOnTradeRoute ? styles.no_background : null;
    const swapRouteStyle = isOnTradeRoute ? null : styles.swap_route;
    const customWidthAutoStyle = customWidthAuto ? styles.customWidthAuto : styles.container;

    // TODO:   @Junior do we need the wrapper in the return below?  -Emily
    return (
        <main
            className={`$ ${customWidthStyle} ${customWidthAutoStyle} ${tradeRouteStyle} ${swapRouteStyle}`}
        >
            <section className={`${styles.window} ${tradeRouteStyle}`}>
                <div className={styles.main_content}>{children}</div>
            </section>
        </main>
    );
}
