import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface Props {
    children: JSX.Element;
    width?: 'fit-content' | '100%';
}

export const Reveal = ({ children }: Props) => {
    const mainControls = useAnimation();
    const slideControls = useAnimation();

    //   const ref = useRef(null);
    //   const isInView = useInView(ref, { once: true });
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '-100px 0px',
    });
    useEffect(() => {
        if (inView) {
            slideControls.start('visible');
            mainControls.start('visible');
        } else {
            slideControls.start('hidden');
            mainControls.start('hidden');
        }
    }, [inView, mainControls, slideControls]);

    return (
        <div ref={ref} style={{ position: 'relative', overflow: 'hidden' }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial='hidden'
                animate={mainControls}
                transition={{ duration: 0.5, delay: 0.25 }}
            >
                {children}
            </motion.div>
            <motion.div
                variants={{
                    hidden: { left: 0 },
                    visible: { left: '100%' },
                }}
                initial='hidden'
                animate={slideControls}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                style={{
                    position: 'absolute',
                    top: 4,
                    bottom: 4,
                    left: 0,
                    right: 0,
                    background: 'var(--brand)',
                    zIndex: 20,
                }}
            />
        </div>
    );
};
