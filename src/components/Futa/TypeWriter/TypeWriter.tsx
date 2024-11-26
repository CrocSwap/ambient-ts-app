import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './TypeWriter.module.css';

interface TypewriterProps {
    text: string;
    color?: string;
}

const Typewriter: React.FC<TypewriterProps> = (props: TypewriterProps) => {
    const { text, color } = props;
    const [displayText, setDisplayText] = useState<string>('');
    const [cursorVisible, setCursorVisible] = useState<boolean>(true);

    useEffect(() => {
        const typeText = async () => {
            for (let i = 0; i <= text.length; i++) {
                setDisplayText(text.substring(0, i));
                await new Promise((resolve) => setTimeout(resolve, 100)); // Adjust typing speed here
            }
        };

        typeText();
    }, [text]);

    useEffect(() => {
        const cursorBlink = setInterval(() => {
            setCursorVisible((prev) => !prev);
        }, 500); // Adjust cursor blink speed here

        return () => clearInterval(cursorBlink);
    }, []);

    return (
        <div className={styles.typewriterContainer}>
            <span
                className={styles.typewriterText}
                style={{ color: color ? color : '' }}
            >
                {displayText}
            </span>
            <motion.span
                className={styles.cursor}
                animate={{ opacity: cursorVisible ? 1 : 0 }}
                transition={{ duration: 0.5 }}
            >
                |
            </motion.span>
        </div>
    );
};

export default Typewriter;
