import coverImage from '../../../assets/images/memory-game/cover.png';
import styles from './GameCard.module.css';

type gameItem = {
    src: string;
    matched: boolean;
    id: number;
};
interface GameCardProps {
    card: gameItem;
    flipped: boolean;
    disabled: boolean;
    handleChoice: (params: gameItem) => void;
}

export default function GameCard(props: GameCardProps) {
    const handleClick = () => {
        if (!disabled) {
            handleChoice(card);
        }
    };
    const { card, flipped, disabled, handleChoice } = props;
    return (
        <div className={styles.card}>
            <div className={flipped ? styles.flipped : ''}>
                <img className={styles.front} src={card.src} alt='card front' />
                <img
                    src={coverImage}
                    alt='card back'
                    className={styles.back}
                    onClick={handleClick}
                />
            </div>
        </div>
    );
}
