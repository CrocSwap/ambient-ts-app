import styles from './SidebarLimitOrdersCard.module.css';

export default function SidebarLimitOrdersCard() {
    const tokenDisplay = (
        <div className={styles.token_container}>
            <img
                src='https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/2048px-Ethereum-icon-purple.svg.png'
                alt='token image'
            />
        </div>
    );
    return (
        <div className={styles.container}>
            <div>Pool</div>
            <div>Price</div>
            <div className={styles.status_display}>
                Amount
                {tokenDisplay}
            </div>
        </div>
    );
}
