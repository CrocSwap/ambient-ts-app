import styles from './ContentContainer.module.css';

interface ContentContainerProps {
    children: React.ReactNode;
    customWidth?: boolean;
    customWidthAuto?: boolean;
    isOnTradeRoute?: boolean;
}

export default function ContentContainer(props: ContentContainerProps) {
    const { isOnTradeRoute, customWidth, customWidthAuto } = props;

    const customWidthStyle = customWidth ? styles.customWidth_container : null;
    const tradeRouteStyle = isOnTradeRoute ? styles.no_background : null;
    const swapRouteStyle = isOnTradeRoute ? null : styles.swap_route;
    const customWidthAutoStyle = customWidthAuto ? styles.customWidthAuto : styles.container;

    return (
        <main
            className={`$ ${customWidthStyle} ${customWidthAutoStyle} ${tradeRouteStyle} ${swapRouteStyle}`}
        >
            <section className={`${styles.window} ${tradeRouteStyle} `}>
                <div className={styles.main_content}>{props.children}</div>
            </section>
        </main>
    );
}
