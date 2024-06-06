import { useEffect, useState } from 'react';
import styles from './PlaceholderPage.module.css';

interface Props {
    pageName: string;
}
export default function PlaceholderPage(props: Props) {
    const { pageName } = props;

    const [text, setText] = useState('');
    const fullText =
        'Page is currently in progress. Thank you for your patience!';
    const typingSpeed = 100; // Adjust typing speed here

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.slice(0, index));
            index++;
            if (index > fullText.length) {
                index = 0; // Reset index to start over
                setText('');
            }
        }, typingSpeed);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.container}>
            <h1>FUTA {pageName}</h1>
            <h3 style={{ height: '100px' }}>{text}</h3>
        </div>
    );
}
