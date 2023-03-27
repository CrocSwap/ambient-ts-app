import styles from './Game.module.css';
import { useState, useEffect } from 'react';
import daiImage from '../../../assets/images/memory-game/dai.png';
import ethereumImage from '../../../assets/images/memory-game/ethereum.png';
import shibaImage from '../../../assets/images/memory-game/shiba.png';
import tetherImage from '../../../assets/images/memory-game/tether.png';
import usdcImage from '../../../assets/images/memory-game/usdc.png';
import wbtcImage from '../../../assets/images/memory-game/wbtc.png';
import GameCard from '../GameCard/GameCard';

type gameItem = {
    src: string;
    matched: boolean;
    id: number;
};

const cardImages = [
    { src: daiImage, matched: false },
    { src: ethereumImage, matched: false },
    { src: shibaImage, matched: false },
    { src: tetherImage, matched: false },
    { src: usdcImage, matched: false },
    { src: wbtcImage, matched: false },
];

export default function Game() {
    const [cards, setCards] = useState<gameItem[]>([]);
    const [turns, setTurns] = useState(0);
    const [choiceOne, setChoiceOne] = useState<gameItem | null>(null);
    const [choiceTwo, setChoiceTwo] = useState<gameItem | null>(null);
    const [disabled, setDisabled] = useState(false);

    //  shuffle cards
    const shuffleCards = () => {
        const shuffledCards = [...cardImages, ...cardImages]
            .sort(() => Math.random() - 0.5)
            .map((card) => ({ ...card, id: Math.random() }));

        setChoiceOne(null);
        setChoiceTwo(null);
        setCards(shuffledCards);
        setTurns(0);
    };

    // handle a choice
    // eslint-disable-next-line
    const handleChoice = (card: any) => {
        choiceOne ? setChoiceTwo(card) : setChoiceOne(card);
    };

    // compare 2 selected cards
    useEffect(() => {
        if (choiceOne && choiceTwo) {
            setDisabled(true);
            if (choiceOne.src === choiceTwo.src) {
                setCards((prevCards) => {
                    return prevCards.map((card) => {
                        if (card.src === choiceOne.src) {
                            return { ...card, matched: true };
                        } else {
                            return card;
                        }
                    });
                });
                resetTurn();
            } else {
                setTimeout(() => resetTurn(), 1000);
            }
        }
    }, [choiceOne, choiceTwo]);

    // reset choices & increate turn
    const resetTurn = () => {
        setChoiceOne(null);
        setChoiceTwo(null);
        setTurns((prevTurns) => prevTurns + 1);
        setDisabled(false);
    };

    // start a new game automatically
    useEffect(() => {
        shuffleCards();
    }, []);

    return (
        <div className={styles.game_container}>
            <div className={styles.card_grid}>
                {cards.map((card) => (
                    <GameCard
                        card={card}
                        key={card.id}
                        handleChoice={handleChoice}
                        flipped={
                            card === choiceOne ||
                            card === choiceTwo ||
                            card.matched
                        }
                        disabled={disabled}
                    />
                ))}
            </div>
            <div>Turns : {turns}</div>
        </div>
    );
}
