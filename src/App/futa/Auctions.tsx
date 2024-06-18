import AuctionCard from './AuctionCard';
import styles from './Auctions.module.css';

export interface AuctionDataIF {
    author: string;
    name: string;
    ticker: string;
    desc: string;
    marketCap: number;
    comments: string[];
}

export default function Auctions() {
    const auctionData: AuctionDataIF[] = [
        {
            author: '0x10D1F681C0A27F35BF29F297613742E44F00C4F379',
            name: 'Doge 2.0',
            ticker: 'Doge2',
            desc: 'Doge 2.0 is the next evolution of the original Dogecoin, promising even more memes and fun, with a focus on community-driven projects and charity donations.',
            marketCap: 123500,
            comments: ['Hi', 'Hi yourself'],
        },
        {
            author: '6CE898EFE14D97B52F98DE3BE887028F7531E28ADB',
            name: 'CatZilla',
            ticker: 'CATZ',
            desc: 'CatZilla is the ultimate meme coin for cat lovers, featuring hilarious cat memes and NFTs, aiming to take down Dogecoin in the meme war',
            marketCap: 7890,
            comments: ['Doge sucks', 'CATZ forever', 'Hello world'],
        },
    ];

    return (
        <section className={styles.auctions_body}>
            <h2>Auctions</h2>
            <header className={styles.auction_header}>
                <div>Search Dropdown</div>
                <button>Desc</button>
                <button>Asc</button>
                <input type='text' placeholder='Search...' />
                <button>Create Token</button>
            </header>
            <div className={styles.auctions_main}>
                {auctionData.map((auc: AuctionDataIF) => (
                    <AuctionCard key={JSON.stringify(auc)} auction={auc} />
                ))}
            </div>
        </section>
    );
}
