import { motion } from 'framer-motion';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import styles from './AuctionLoader.module.css';

const messages = [
    { text: '> CONNECTING TO SERVER...' },
    { text: '> GATHERING TICKER DATA...' },
    { text: '> FETCHING DATA...' },
];

const container = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.04,
        },
    },
};

const child = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

interface TypewriterEffectProps {
    text: string;
    onComplete: () => void;
}

interface AuctionLoaderProps {
    setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
    text,
    onComplete,
}) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, text.length * 50 + 500); // Adjusted timing
        return () => clearTimeout(timer);
    }, [text, onComplete]);

    return (
        <motion.div initial='hidden' animate='visible' variants={container}>
            {text.split('').map((char, index) => (
                <motion.span key={index} variants={child}>
                    {char}
                </motion.span>
            ))}
        </motion.div>
    );
};

const AuctionLoader: React.FC<AuctionLoaderProps> = ({ setIsLoading }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleComplete = () => {
        if (currentIndex < messages.length - 1) {
            setCurrentIndex((prevIndex) => prevIndex + 1);
        }
    };
    // Function to calculate the total animation time
    const calculateTotalAnimationTime = (messages: { text: string }[]) => {
        const delayPerCharacter = 50; // in ms
        const additionalDelay = 500; // in ms

        return messages.reduce((totalTime, message) => {
            const messageTime =
                message.text.length * delayPerCharacter + additionalDelay;
            return totalTime + messageTime;
        }, 0);
    };

    useEffect(() => {
        const totalTime = calculateTotalAnimationTime(messages);
        console.log(`Total animation time: ${totalTime} ms`);
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, totalTime + 1500);
        return () => clearTimeout(timer);
    }, [messages, setIsLoading]);

    return (
        <div className={styles.container}>
            {messages.slice(0, currentIndex + 1).map((message, index) => (
                <div key={index}>
                    <TypewriterEffect
                        text={message.text}
                        onComplete={handleComplete}
                    />
                </div>
            ))}
        </div>
    );
};

export default AuctionLoader;
