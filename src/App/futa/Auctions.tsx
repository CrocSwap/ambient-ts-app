import styles from './Auctions.module.css';

export default function Auctions() {
    return (
        <section className={styles.auctions_main}>
            Auctions
            <header className={styles.auction_header}>
                <div>Search Dropdown</div>
                <button>Desc</button>
                <button>Asc</button>
                <input type='text' placeholder='Search...' />
                <button>Create Token</button>
            </header>
        </section>
    );
}
