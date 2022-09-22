import styles from './RangeShare.module.css';
import { useState } from 'react';
import { motion } from 'framer-motion';

type OptionIF = {
    slug: string;
    name: string;
    checked: boolean;
};

interface RangeShareProps {
    handleShareOptionChange: (option: string) => void;
    shareOptions: {
        slug: string;
        name: string;
        checked: boolean;
    }[];
}

interface RangeShareOptionControlPropsIF {
    option: OptionIF;
    handleShareOptionChange: (option: string) => void;
}

function RangeShareOptionControl(props: RangeShareOptionControlPropsIF) {
    const { option, handleShareOptionChange } = props;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.custom_control}
        >
            <input
                id={`customCheck1-share-${option.slug}`}
                className={`${styles.ckb} ${styles.ckb_primary}`}
                type='checkbox'
                checked={option.checked}
                onChange={() => handleShareOptionChange(option.slug)}
            />
            <label htmlFor={`customCheck1-${option.slug}`}>{option.name}</label>
        </motion.div>
    );
}
export default function RangeShare(props: RangeShareProps) {
    const { shareOptions, handleShareOptionChange } = props;

    return (
        <div className={styles.container}>
            {shareOptions.map((option) => (
                <RangeShareOptionControl
                    key={option.slug}
                    option={option}
                    handleShareOptionChange={handleShareOptionChange}
                />
            ))}
        </div>
    );
}
