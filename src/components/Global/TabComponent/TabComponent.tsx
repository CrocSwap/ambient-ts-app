import styles from './TabComponent.module.css';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemEnterAnimation } from '../../../utils/others/FramerMotionAnimations';

type tabData = {
    label: string;
    content: React.ReactNode;
};

interface TabProps {
    data: tabData[];
    rightTabOptions?: React.ReactNode;
}

export default function TabComponent(props: TabProps) {
    return <div className={styles.row}></div>;
}
