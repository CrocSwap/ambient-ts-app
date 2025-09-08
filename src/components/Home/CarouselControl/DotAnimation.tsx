import React from 'react';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';
import styles from './DotAnimation.module.css';

interface SectionsIF {
    ref: React.RefObject<HTMLDivElement>;
    page: React.ReactNode;
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
            {sections.map((_, index) => (
                <span
                    key={index}
                    className={`${styles.dot} ${
                        index === activeIndex ? styles.activeDot : ''
                    }`}
                    onClick={() => onClick(index)}
                />
            ))}
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
