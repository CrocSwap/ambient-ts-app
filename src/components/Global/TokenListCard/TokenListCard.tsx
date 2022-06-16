import styles from './TokenListCard.module.css';
import { useState } from 'react';
import { MdOutlineSettings } from 'react-icons/md';
import Toggle from '../../Global/Toggle/Toggle';

interface TokenListCardProps {
    children: React.ReactNode;
}

export default function TokenListCard(props: TokenListCardProps) {
    return <div className={styles.row}>{props.children}</div>;
}
