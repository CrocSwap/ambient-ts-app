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

    return (
        <div className={styles.form_item}>
            <div className={styles.form_item_top}>
                <label>{label}</label>
                <div className={styles.counter}>{charLimit - length}</div>
            </div>
            <textarea
                id={inputId}
                onChange={(e) => {
                    updateRef(e.target.value);
                    setLength(e.target.value.length);
                }}
                maxLength={charLimit}
                rows={rows}
                spellCheck={false}
            />
        </div>
    );
}
