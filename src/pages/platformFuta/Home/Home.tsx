import React, { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';

import Section from '../../../components/Home/Section/Section';
import FutaLanding1 from './FutaLandings/FutaLanding1';
import FutaLanding2 from './FutaLandings/FutaLanding2';
import FutaLanding3 from './FutaLandings/FutaLanding3';
import FutaLanding4 from './FutaLandings/FutaLanding4';
import Hero from './Hero/Hero';
import DotAnimation from '../../../components/Home/CarouselControl/DotAnimation';
import { useFutaHomeContext } from '../../../contexts/Futa/FutaHomeContext';

function Home() {
    const {
        setIsActionButtonVisible,
        setShowTerminal,
        hasVideoPlayedOnce,
        setHasVideoPlayedOnce,
    } = useFutaHomeContext();

    useEffect(() => {
        if (!hasVideoPlayedOnce) {
            const timer = setTimeout(() => {
                setShowTerminal(false);
                setHasVideoPlayedOnce(true);
                setIsActionButtonVisible(true);
            }, 12000); // 11 seconds

            return () => clearTimeout(timer);
        } else {
            setIsActionButtonVisible(true);
        }
    }, [hasVideoPlayedOnce, setHasVideoPlayedOnce]);

    const section0 = useRef<HTMLDivElement>(null);
    const section1 = useRef<HTMLDivElement>(null);
    const section2 = useRef<HTMLDivElement>(null);
    const section3 = useRef<HTMLDivElement>(null);
    const section4 = useRef<HTMLDivElement>(null);
    const section5 = useRef<HTMLDivElement>(null);

    const sections = [
        {
            ref: section0,
            page: <Hero onLearnClick={() => scrollTo(section1)} />,
            goToSectionRef: section1,
        },
        {
            ref: section1,
            page: <FutaLanding1 />,
            goToSectionRef: section2,
        },
        {
            ref: section2,
            page: <FutaLanding2 />,
            goToSectionRef: section3,
        },
        {
            ref: section3,
            page: <FutaLanding3 />,
            goToSectionRef: section4,
        },
        {
            ref: section4,
            page: <FutaLanding4 />,
            goToSectionRef: section5,
        },
    ];

    const [activeIndex, setActiveIndex] = useState(0);

    const scrollTo = (section: React.RefObject<HTMLDivElement>) => {
        if (section && section.current) {
            section.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleDotClick = (index: number) => {
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
    }, [activeIndex, sections, activateAutoScroll]);

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
                            page={page}
                            goToSectionRef={goToSectionRef}
                            scrollTo={() => scrollTo(goToSectionRef)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Home;
