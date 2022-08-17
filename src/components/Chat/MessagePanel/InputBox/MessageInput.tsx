import { BsSlashSquare } from 'react-icons/bs';
import { FiSmile } from 'react-icons/fi';
import styles from './MessageInput.module.css';

export default function MessageInput() {
    return (
        <div className={styles.input_box}>
            <input
                type='text'
                id='box'
                placeholder='Enter message...'
                className={styles.input_text}
            />
            <BsSlashSquare />
            <FiSmile />
        </div>
    );
}
