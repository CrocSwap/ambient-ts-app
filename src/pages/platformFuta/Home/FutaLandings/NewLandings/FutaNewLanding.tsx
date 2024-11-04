import { useEffect, useRef, useState } from 'react';
import FutaLandingNav from '../FutaLandingNav';
import FutaLanding from './FutaLanding1';
import FutaLanding2 from './FutaLanding2';
import FutaLanding3 from './FutaLanding3';
import FutaLanding4 from './FutaLanding4';
import FutaLanding5 from './FutaLanding5';
import styles from './FutaNewLanding.module.css';
import FadingTextGrid from '../../Animations/FadingTextGrid';


export default function FutaNewLanding() {
    const [activeSection, setActiveSection] = useState(0);
    const [showMainContent, setShowMainContent] = useState(false);

    const sectionsRef = useRef<(HTMLDivElement | null)[]>(Array(5).fill(null));

    const scrollToSection = (index: number) => {
        sectionsRef.current[index]?.scrollIntoView({
            behavior: 'smooth',
        });
    };

    const handleScroll = () => {
        sectionsRef.current.forEach((section, index) => {
            if (section) {
                const { top, bottom } = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                if (top >= 0 && bottom <= windowHeight) {
                    setActiveSection(index);
                }
            }
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setShowMainContent(true), 7000); // Show main content after 10 seconds
        return () => clearTimeout(timer); // Clear the timer on component unmount
    }, []);

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
                    <FutaLandingNav scrollToSection={scrollToSection} activeSection={activeSection} />
                </div>
            ))}
        </div>
    );
}
