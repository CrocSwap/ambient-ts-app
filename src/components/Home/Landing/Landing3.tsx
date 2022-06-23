import styles from './Landing3.module.css';

interface circleItemProps {
    width: string;
    background: string;
    children: React.ReactNode;
    big?: boolean;
}

export default function Landing3() {
    const CircleItem = (props: circleItemProps) => {
        const { width, background, children, big } = props;

        return (
            <div
                className={styles.outer_circle}
                style={{ width: width, background: background, height: width }}
            >
                <div
                    className={styles.inner_circle}
                    style={{ width: width, height: width, fontSize: big ? 12 : 8 }}
                >
                    {children}
                </div>
            </div>
        );
    };

    const headerText = (
        <div className={styles.header_content}>
            <div className={styles.header_text}>
                <span className={styles.ambient_text}>ambient </span>
                runs the entire DEX inside a{' '}
                <span className={styles.highlight_text}>single smart contract</span>
            </div>
            {/* <div className={styles.amm_pools}>
                Individual AMM pools are lightweight data structures instead of separate smart
                contracts
            </div> */}
            {/* <div className={styles.efficiency}>
                This and other design decisions makes Ambient the most efficient Ethereum-based DEX
                in existence.
            </div> */}
        </div>
    );
    // eslint-disable-next-line
    const multiContractContent = (
        <div className={styles.multi_container}>
            <div className={styles.title}>Multi contract design</div>
            <div className={styles.title_secondary}>Multi contract design</div>
            <div className={styles.multi_content}>
                <div className={styles.row}>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>ETH</div>
                        <div>USDC</div>
                    </CircleItem>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>USDC</div>
                        <div>USDT</div>
                    </CircleItem>
                </div>
                <CircleItem width='105px' background='#CDC1FF'>
                    <div>Wallet</div>
                </CircleItem>
                <div className={styles.row}>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>ETH</div>
                        <div>BTC</div>
                    </CircleItem>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>XYZ</div>
                        <div>ABC</div>
                    </CircleItem>
                </div>
            </div>
        </div>
    );
    // eslint-disable-next-line
    const singleContractContent = (
        <div className={styles.multi_container}>
            <div className={styles.title}>Single contract design</div>
            <div className={styles.title_secondary}>Single contract design</div>
            <div className={styles.multi_content}>
                <CircleItem width='105px' background='#CDC1FF'>
                    <div>Wallet</div>
                </CircleItem>
                <div className={styles.row_close}>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>ETH</div>
                        <div>USDC</div>
                    </CircleItem>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>USDC</div>
                        <div>USDT</div>
                    </CircleItem>
                </div>
                <div className={styles.row_close}>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>ETH</div>
                        <div>BTC</div>
                    </CircleItem>
                    <CircleItem width='70px' background='#7371fc'>
                        <div>XYZ</div>
                        <div>ABC</div>
                    </CircleItem>
                </div>
            </div>
        </div>
    );
    return (
        <div className={styles.main_container}>
            {headerText}
            {/* <div className={styles.content_container}>
                {multiContractContent}
                {singleContractContent}
            </div> */}
        </div>
    );
}
