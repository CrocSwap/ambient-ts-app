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

interface MobileSidebarItemPropsIF {
    children: React.ReactNode;
}

export default function MobileSidebarItem(props: MobileSidebarItemPropsIF) {
    const { children } = props;
    const style = { margin: '8px 0', cursor: 'pointer' };

    return (
        <motion.div variants={variants} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <div style={style}>{children}</div>
        </motion.div>
    );
}
