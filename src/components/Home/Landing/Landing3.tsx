import { useTranslation } from 'react-i18next';
import styles from './Landing3.module.css';

export default function Landing3() {
    const { t } = useTranslation();

    const headerText = (
        <div className={styles.header_content}>
            <div className={styles.header_text}>
                <span className={styles.ambient_text}>ambient </span>
                {t('slide3.part1')}{' '}
                <span className={styles.highlight_text}>{t('slide3.part2')}</span>
            </div>
            <div className={styles.amm_pools}>
                Individual AMM pools are lightweight data structures instead of separate smart
                contracts
            </div>
            <div className={styles.efficiency}>
                This and other design decisions makes Ambient the most efficient Ethereum-based DEX
                in existence.
            </div>
        </div>
    );

    const walletText = (
        <div className={styles.wallet_text}>
            <p>Wallet</p>
        </div>
    );
    // multi contract-----------------------

    const firstPool = (
        <div className={styles.pool_display_container}>
            <p>ETH</p>
            <p>USDC</p>
        </div>
    );
    const secondPool = (
        <div className={styles.pool_display_container}>
            <p>XYZ</p>
            <p>ABC</p>
        </div>
    );
    const thirdPool = (
        <div className={styles.pool_display_container}>
            <p>ETH</p>
            <p>BTC</p>
        </div>
    );
    const fourthPool = (
        <div className={styles.pool_display_container}>
            <p>ETH</p>
            <p>BTC</p>
        </div>
    );

    const multiContractDesign = (
        <div className={styles.multi_contract_container}>
            <h2>Multi contract design</h2>
            <h3>Multi Contract design</h3>

            <div className={styles.multi_contract_circles}>
                <div className={styles.row}>
                    {firstPool}
                    {secondPool}
                </div>
                {walletText}
                <div className={styles.row}>
                    {thirdPool}
                    {fourthPool}
                </div>
            </div>
        </div>
    );
    // ---------------end of multi contract

    const singleContractDesign = (
        <div className={styles.single_contract_container}>
            <h2>Single contract design</h2>
            <h3>Single contract design</h3>
            <div className={styles.single_contract_circles}>
                {walletText}
                <div className={styles.pool_circle_container}>
                    <div className={styles.pool_circle_content}>
                        <div className={styles.row}>
                            {firstPool}
                            {secondPool}
                        </div>
                        <div className={styles.row}>
                            {thirdPool}
                            {fourthPool}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className={styles.main_container}>
            {headerText}
            <div className={styles.content_container}>
                {multiContractDesign}
                {singleContractDesign}
            </div>
        </div>
    );
}
