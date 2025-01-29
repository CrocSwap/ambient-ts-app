import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';
import styles from './DotAnimation.module.css';

interface SectionsIF {
    ref: React.RefObject<HTMLDivElement>;
    page: JSX.Element;
    goToSectionRef: React.RefObject<HTMLDivElement>;
}

interface DotAnimationProps {
    activeIndex: number;
    sections: SectionsIF[];
    onClick: (index: number) => void;
    activateAutoScroll: boolean;
    setActivateAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
    handleUpClick: () => void;
    handleDownClick: () => void;
}

const DotAnimation: React.FC<DotAnimationProps> = ({
    activeIndex,
    sections,
    onClick,
    // activateAutoScroll,
    // setActivateAutoScroll,
    handleUpClick,
    handleDownClick,
}) => {
    const dotVariants = {
        //   hidden: { opacity: 0, width: '0px', height: '0px' },
        visible: {
            opacity: 1,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
        },
        exit: { opacity: 0, width: '0px', height: '0px' },
        active: {
            opacity: 1,
            width: '20px',
            height: '40px',
            borderRadius: '40%',
            transition: { duration: 0.5 },
        }, // Morph animation for active dot
    };

    return (
        <div className={styles.dots}>
            <GoChevronUp
                size={25}
                onClick={handleUpClick}
                color='var(--text3)'
                className={
                    activeIndex !== 0 ? styles.show_arrow : styles.disable_arrow
                }
            />
            <AnimatePresence initial={false}>
                {/* { activateAutoScroll ? (
          <FaPause
            color='var(--text3)'
            style={{ cursor: 'pointer' }}
            onClick={() => setActivateAutoScroll(false)}
          />
          
        ) : (
          <FaPlay
            color='var(--text3)'
            style={{ cursor: 'pointer' }}
            onClick={() => setActivateAutoScroll(true)}
          />
        )} */}

                {sections.map((_, index) => (
                    <motion.span
                        key={index}
                        className={`${styles.dot} ${
                            index === activeIndex ? styles.activeDot : ''
                        }`}
                        initial='hidden'
                        animate={index === activeIndex ? 'active' : 'visible'}
                        exit='exit'
                        variants={dotVariants}
                        onClick={() => onClick(index)}
                    />
                ))}
            </AnimatePresence>
            <GoChevronDown
                size={25}
                onClick={handleDownClick}
                color='var(--text3)'
                className={
                    activeIndex !== sections.length - 1
                        ? styles.show_arrow
                        : styles.disable_arrow
                }
            />
        </div>
    );
};

export default DotAnimation;
