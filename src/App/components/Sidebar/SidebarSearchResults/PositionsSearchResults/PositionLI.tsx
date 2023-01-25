import styles from '../SidebarSearchResults.module.css';

export default function PositionLI() {
    return (
        <div className={styles.card_container}>
            <div>Pool</div>
            <div>Price</div>
            <div>Qty</div>
        </div>
    );
}