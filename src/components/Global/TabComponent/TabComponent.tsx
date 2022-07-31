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
    const { data } = props;
    const [selectedTab, setSelectedTab] = useState(data[0]);
    console.log(data.length);
    const firstTwoNavs = [...data].slice(0, 2);
    const remainingNavs = [...data].splice(2, data.length - 1);

    return <div className={styles.row}></div>;
}
