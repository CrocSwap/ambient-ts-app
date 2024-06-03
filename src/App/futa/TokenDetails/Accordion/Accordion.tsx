import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Accordion.module.css';

interface AccordionProps {
    children: React.ReactNode;
    headerContent: React.ReactNode;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Accordion(props: AccordionProps) {
    const { headerContent, children, isOpen, setIsOpen } = props;

    const header = (
        <motion.header
            initial={false}
            onClick={() => setIsOpen(!isOpen)}
            className={styles.header}
        >
            {headerContent}
        </motion.header>
    );

    return (
        <div className={styles.accordionContainer}>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key='content'
                        initial='collapsed'
                        animate='open'
                        exit='collapsed'
                        variants={{
                            open: { opacity: 1, height: 'auto', top: '-100%' },
                            collapsed: { opacity: 0, height: 0, top: '-100%' },
                        }}
                        transition={{
                            duration: 0.8,
                            ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                        className={styles.content}
                    >
                        {isOpen && header}

                        {children}
                    </motion.section>
                )}
            </AnimatePresence>
            {!isOpen && header}
        </div>
    );
}
