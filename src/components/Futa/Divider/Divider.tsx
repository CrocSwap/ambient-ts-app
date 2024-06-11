import React from 'react';
import { motion } from 'framer-motion';
interface DividerProps {
    count: number;
}
const Divider: React.FC<DividerProps> = ({ count }) => {
    const dividers = Array.from({ length: count }, (_, index) => (
        <motion.div
            key={index}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
                height: '1px',
                backgroundColor: 'var(--dark3)',
            }}
        />
    ));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                width: '100%',
            }}
        >
            {dividers}
        </div>
    );
};

Divider.defaultProps = {
    count: 1,
};

export default Divider;
