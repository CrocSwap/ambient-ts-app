import React, { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';
import img from '../../assets/images/backgrounds/background.png';
import { motion, AnimatePresence } from 'framer-motion';
import Landing1 from '../../components/Home/Landing/Landing1';
import Landing2 from '../../components/Home/Landing/Landing2';
import Landing3 from '../../components/Home/Landing/Landing3';
import Landing4 from '../../components/Home/Landing/Landing4';
import Landing5 from '../../components/Home/Landing/Landing5';
import Landing6 from '../../components/Home/Landing/Landing6';
import Section from '../../components/Home/Section/Section';
// import { FaPause, FaPlay } from 'react-icons/fa';
import Landing7 from '../../components/Home/Landing/Landing7';
import { GoChevronDown, GoChevronUp } from 'react-icons/go';

interface sectionsIF {
    ref: React.RefObject<HTMLDivElement>;
    page: JSX.Element;
    goToSectionRef: React.RefObject<HTMLDivElement>;
}

const Home: React.FC = () => {
    const section1 = useRef<HTMLDivElement>(null);
    const section2 = useRef<HTMLDivElement>(null);
    const section3 = useRef<HTMLDivElement>(null);
    const section4 = useRef<HTMLDivElement>(null);
    const section5 = useRef<HTMLDivElement>(null);
    const section6 = useRef<HTMLDivElement>(null);
    const section7 = useRef<HTMLDivElement>(null);

    const sections = [
        {
            ref: section1,
            page: <Landing1 />,
            goToSectionRef: section2,
        },
        {
            ref: section2,
            page: <Landing2 />,
            goToSectionRef: section3,
        },
        {
            ref: section3,
            page: <Landing3 />,
            goToSectionRef: section4,
        },
        {
            ref: section4,
            page: <Landing4 />,
            goToSectionRef: section5,
        },
        {
            ref: section7,
            page: <Landing7 />,
            goToSectionRef: section6,
        },
        {
            ref: section5,
            page: <Landing5 />,
            goToSectionRef: section6,
        },
        {
            ref: section6,
            page: <Landing6 />,
            goToSectionRef: section1,
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const scrollTo = (section: React.RefObject<HTMLDivElement>) => {
        if (section && section.current) {
            section.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDotClick = (index: number) => {
        setActiveIndex(index);
        scrollTo(sections[index].ref);
    };

    const handleUpClick = () => {
        const prevIndex =
            activeIndex === 0 ? sections.length - 1 : activeIndex - 1;
        setActiveIndex(prevIndex);
        scrollTo(sections[prevIndex].ref);
    };

    const handleDownClick = () => {
        const nextIndex =
            activeIndex === sections.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(nextIndex);
        scrollTo(sections[nextIndex].ref);
    };
    // TODO: UNCOMMENT THIS TO ACTIVATE AUTO SCROLL
    // this is just a temporary value to activate the automatic scroll for development purposes
    const [activateAutoScroll, setActivateAutoScroll] = useState(false);

    useEffect(() => {
        if (!activateAutoScroll) return;
        const interval = setInterval(() => {
            const nextIndex =
                activeIndex === sections.length - 1 ? 0 : activeIndex + 1;
            setActiveIndex(nextIndex);
            scrollTo(sections[nextIndex].ref);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [activeIndex, sections]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const section = sections.find(
                            (section) =>
                                (section.ref as React.RefObject<HTMLDivElement>)
                                    .current === entry.target,
                        );
                        if (section) {
                            const index = sections.indexOf(section);
                            setActiveIndex(index);
                            console.log({ index });
                        }
                    }
                });
            },
            { threshold: 0.5 },
        );

        sections.forEach((section) => {
            if (section.ref.current) {
                observer.observe(section.ref.current);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [sections]);

    return (
        <div>
            <div className={`container ${styles.container}`}>
                <DotAnimation
                    activeIndex={activeIndex}
                    sections={sections}
                    onClick={handleDotClick}
                    activateAutoScroll={activateAutoScroll}
                    setActivateAutoScroll={setActivateAutoScroll}
                    handleUpClick={handleUpClick}
                    handleDownClick={handleDownClick}
                />
                {sections.map(({ ref, page, goToSectionRef }, index) => (
                    <div ref={ref} key={index}>
                        <Section
                            image={img}
                            page={page}
                            goToSectionRef={goToSectionRef}
                            scrollTo={() => scrollTo(goToSectionRef)}
                        />
                    </div>
                ))}{' '}
            </div>
        </div>
    );
};

const DotAnimation: React.FC<{
    activeIndex: number;
    sections: sectionsIF[];
    onClick: (index: number) => void;
    activateAutoScroll: boolean;
    setActivateAutoScroll: React.Dispatch<React.SetStateAction<boolean>>;
    handleUpClick: () => void;
    handleDownClick: () => void;
}> = ({
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
export default Home;
