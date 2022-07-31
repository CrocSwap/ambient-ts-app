import styles from './TabComponent.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemEnterAnimation } from '../../../utils/others/FramerMotionAnimations';

interface TabComponentProps {
    children: React.ReactNode;
}

export default function TabComponent(props: TabComponentProps) {
    return <div className={styles.row}>{props.children}</div>;
}
