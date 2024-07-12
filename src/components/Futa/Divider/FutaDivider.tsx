import React from 'react';
import { motion } from 'framer-motion';

interface DividerProps {
    count: number;
    vertical?: boolean;
}

const FutaDivider: React.FC<DividerProps> = ({ count, vertical }) => {
    const dividers = Array.from({ length: count }, (_, index) => (
        <motion.div
            key={index}
            initial={vertical ? { height: 0 } : { width: 0 }}
            animate={vertical ? { height: '100%' } : { width: '100%' }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{
                height: vertical ? '100%' : '1px',
                width: vertical ? '1px' : '100%',
                backgroundColor: '#424649',
            }}
        />
    ));

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: vertical ? 'row' : 'column',
                gap: '4px',
                width: vertical ? 'auto' : '100%',
                height: vertical ? '100%' : 'auto',
                pointerEvents: 'none',
            }}
        >
            {dividers}
        </div>
    );
};

FutaDivider.defaultProps = {
    count: 1,
};

export default FutaDivider;
