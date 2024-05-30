import { useState } from 'react';
import styles from './CreateField.module.css';

export interface CreateFieldPropsIF {
    inputId: string;
    label: string;
    charLimit: number;
    updateRef: (val: string) => void;
    rows: number;
}

export default function CreateField(props: CreateFieldPropsIF) {
    const { inputId, label, charLimit, updateRef, rows } = props;

    const [length, setLength] = useState<number>(0);

    function handleChange(input: string): void {
        updateRef(input);
        setLength(input.length);
    }

    return (
        <div className={styles.form_item}>
            <div className={styles.form_item_top}>
                <label>{label}</label>
                <div className={styles.counter}>{charLimit - length}</div>
            </div>
            {rows === 1 ? (
                <input
                    type='text'
                    className={styles.text_input}
                    onChange={(e) => handleChange(e.target.value)}
                />
            ) : (
                <textarea
                    id={inputId}
                    className={styles.text_input}
                    onChange={(e) => handleChange(e.target.value)}
                    maxLength={charLimit}
                    rows={rows}
                    spellCheck={false}
                />
            )}
        </div>
    );
}
