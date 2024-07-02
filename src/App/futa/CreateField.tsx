import { useState } from 'react';
import styles from './CreateField.module.css';

export interface CreateFieldPropsIF {
    inputId: string;
    label: string;
    charLimit?: number;
    updateRef: (val: string) => void;
    rows: number;
    box?: boolean;
}

export default function CreateField(props: CreateFieldPropsIF) {
    const { inputId, label, charLimit, updateRef, rows, box } = props;

    const [length, setLength] = useState<number>(0);

    function handleChange(input: string): void {
        updateRef(input);
        setLength(input.length);
    }

    function handleClick(): void {
        console.log('handled click!');
    }

    return (
        <div className={styles.form_item}>
            <div className={styles.form_item_top}>
                <label>{label}</label>
                <div className={styles.counter}>
                    {charLimit ? charLimit - length : ''}
                </div>
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
                    className={
                        styles[box ? 'text_input_disabled' : 'text_input']
                    }
                    onChange={(e) => handleChange(e.target.value)}
                    onClick={() => box && handleClick()}
                    maxLength={charLimit}
                    rows={rows}
                    spellCheck={false}
                    disabled={!!box}
                />
            )}
        </div>
    );
}
