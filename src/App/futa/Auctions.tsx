import AuctionCard from './AuctionCard';
import styles from './Auctions.module.css';

export interface auctionDataIF {
    name: string;
    symbol: string;
    desc: string;
    auctionPrice: number;
    comments: string[];
}

export default function Auctions() {
    const auctionData: auctionDataIF[] = [
        {
            name: 'Doge 2.0',
            symbol: 'Doge2',
            desc: 'Doge 2.0 is the next evolution of the original Dogecoin, promising even more memes and fun, with a focus on community-driven projects and charity donations.',
            auctionPrice: 123500,
            comments: ['Hi', 'Hi yourself'],
        },
        {
            name: 'CatZilla',
            symbol: 'CATZ',
            desc: 'CatZilla is the ultimate meme coin for cat lovers, featuring hilarious cat memes and NFTs, aiming to take down Dogecoin in the meme war',
            auctionPrice: 7890,
            comments: ['Doge sucks', 'CATZ forever', 'Hello world'],
        },
    ];

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
            <div>
                {auctionData.map((auc: auctionDataIF) => (
                    <AuctionCard key={JSON.stringify(auc)} auction={auc} />
                ))}
            </div>
        </section>
    );
}
