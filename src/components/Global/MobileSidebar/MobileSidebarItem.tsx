import React from 'react';
import { motion } from 'framer-motion';

const variants = {
    open: {
        y: 0,
        opacity: 1,
        transition: {
            y: { stiffness: 1000, velocity: -100 },
        },
    },
    closed: {
        y: 50,
        opacity: 0,
        transition: {
            y: { stiffness: 1000 },
        },
    },
};

const colors = ['#fef6e4', '#f582ae', '#8bd3dd', '#b8c1ec', '#ff8906'];

interface MobileSidebarItemPropsIF {
    children: React.ReactNode;
    id: number;
}

export default function MobileSidebarItem(props: MobileSidebarItemPropsIF) {
    const { children, id } = props;
    const style = { border: `3px solid ${colors[id]}` };

    return (
        <motion.li variants={variants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <div style={style}>{children}</div>
        </motion.li>
    );
}
