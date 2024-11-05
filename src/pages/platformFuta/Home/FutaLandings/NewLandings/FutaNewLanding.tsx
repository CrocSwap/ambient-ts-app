import { useEffect, useRef, useState, useCallback } from 'react';
import FutaLandingNav from '../FutaLandingNav';
import FutaLanding from './FutaLanding1';
import FutaLanding2 from './FutaLanding2';
import FutaLanding3 from './FutaLanding3';
import FutaLanding4 from './FutaLanding4';
import FutaLanding5 from './FutaLanding5';
import styles from './FutaNewLanding.module.css';
import FadingTextGrid from '../../Animations/FadingTextGrid';
import { useNavigate } from 'react-router-dom';

const INITIAL_DELAY = 7000;
const TOTAL_SECTIONS = 5;

export default function FutaNewLanding() {
    const [activeSection, setActiveSection] = useState(0);
    const [showMainContent, setShowMainContent] = useState(false);
    const navigate = useNavigate();
    const sectionsRef = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_SECTIONS).fill(null));

    // Memoized navigation functions
    const navigateToNextSection = useCallback(() => {
        const nextSection = (activeSection + 1) % TOTAL_SECTIONS;
        setActiveSection(nextSection);
        scrollToSection(nextSection);
    }, [activeSection]);

    const navigateToPreviousSection = useCallback(() => {
        const previousSection = activeSection === 0 ? TOTAL_SECTIONS - 1 : activeSection - 1;
        setActiveSection(previousSection);
        scrollToSection(previousSection);
    }, [activeSection]);

    // Memoized scroll handler
    const handleScroll = useCallback(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = sectionsRef.current.findIndex(
                            (section) => section === entry.target
                        );
                        if (index !== -1) {
                            setActiveSection(index);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        return () => {
            sectionsRef.current.forEach((section) => {
                if (section) observer.disconnect();
            });
        };
    }, []);

    // Memoized keyboard handler
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        switch (event.key) {
            case 'Enter':
                if (!showMainContent) {
                    setShowMainContent(true);
                } else {
                    navigate('/auctions/');
                }
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                navigateToNextSection();
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                navigateToPreviousSection();
                break;
        }
    }, [showMainContent, navigate, navigateToNextSection, navigateToPreviousSection]);

    // Scroll to section utility
    const scrollToSection = useCallback((index: number) => {
        sectionsRef.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    // Event listeners setup
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const cleanup = handleScroll();
        return cleanup;
    }, [handleScroll]);

    // Initial delay for showing main content
    useEffect(() => {
        const timer = setTimeout(() => setShowMainContent(true), INITIAL_DELAY);
        return () => clearTimeout(timer);
    }, []);

    // Sections configuration
    const sections = [
        <FutaLanding key="section1" />,
        <FutaLanding2 key="section2" />,
        <FutaLanding3 key="section3" />,
        <FutaLanding4 key="section4" />,
        <FutaLanding5 key="section5" />,
    ];

    if (!showMainContent) {
        return <FadingTextGrid />;
    }

    return (
        <div className={styles.container} style={{ position: 'relative' }}>
            <div className={styles.crt} />
            {sections.map((SectionComponent, index) => (
                <div
                    key={index}
                    className={styles.content}
                    ref={(el) => (sectionsRef.current[index] = el)}
                >
                    {SectionComponent}
                    <FutaLandingNav 
                        scrollToSection={scrollToSection} 
                        activeSection={activeSection}
                    />
                </div>
            ))}
        </div>
    );
}