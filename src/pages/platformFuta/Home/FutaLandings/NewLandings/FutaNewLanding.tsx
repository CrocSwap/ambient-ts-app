import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '../../../../../utils/hooks/useMediaQuery';
import FadingTextGrid from '../../Animations/FadingTextGrid';
import FutaLandingNav from '../FutaLandingNav';
import FutaLanding from './FutaLanding1';
import FutaLanding2 from './FutaLanding2';
import FutaLanding3 from './FutaLanding3';
import FutaLanding4 from './FutaLanding4';
import FutaLanding5 from './FutaLanding5';
import styles from './FutaNewLanding.module.css';

const INITIAL_DELAY = 7000;
const TOTAL_SECTIONS = 5;
const SCROLL_THRESHOLD = 5; // Pixels to scroll before triggering section change

export default function FutaNewLanding() {
    const [hasVideoPlayedOnce, setHasVideoPlayedOnce] = useState(false);
    const [showLandingPageTemp] = useState(false);
    const [showHomeVideoLocalStorage] = useState(() => {
        const saved = localStorage.getItem('showHomeVideoLocalStorage');
        return saved === null ? true : saved === 'true';
    });
    const [skipLandingPage] = useState(() => {
        const saved = localStorage.getItem('skipLandingPage');
        return saved === null ? false : saved === 'true';
    });
    const [activeSection, setActiveSection] = useState(0);
    const [showMainContent, setShowMainContent] = useState(false);
    const navigate = useNavigate();
    const sectionsRef = useRef<(HTMLDivElement | null)[]>(
        Array(TOTAL_SECTIONS).fill(null),
    );
    const lastScrollPosition = useRef(0);
    const isScrollingRef = useRef(false);

    const scrollToSection = useCallback((index: number) => {
        if (index < 0 || index >= TOTAL_SECTIONS) return;

        setActiveSection(index);
        const section = sectionsRef.current[index];
        if (section) {
            isScrollingRef.current = true;
            section.scrollIntoView({ behavior: 'smooth' });
            // Reset after animation
            setTimeout(() => {
                isScrollingRef.current = false;
                lastScrollPosition.current = window.scrollY;
            }, 1000);
        }
    }, []);

    const isMobileVersion = useMediaQuery('(max-width: 500px)');

    const handleScroll = useCallback(() => {
        if (isMobileVersion) return;
        if (isScrollingRef.current) return;

        const handleScrollAction = () => {
            const currentScroll = window.scrollY;
            const scrollDifference = currentScroll - lastScrollPosition.current;

            // Get the current section's position
            const currentSectionEl = sectionsRef.current[activeSection];
            if (!currentSectionEl) return;

            const currentSectionTop = currentSectionEl.offsetTop;
            const distanceFromSection = Math.abs(
                currentScroll - currentSectionTop,
            );

            if (distanceFromSection > SCROLL_THRESHOLD) {
                // Determine scroll direction and next section
                if (
                    scrollDifference > 0 &&
                    activeSection < TOTAL_SECTIONS - 1
                ) {
                    // Scrolling down
                    scrollToSection(activeSection + 1);
                } else if (scrollDifference < 0 && activeSection > 0) {
                    // Scrolling up
                    scrollToSection(activeSection - 1);
                } else {
                    // Snap back to current section if at edges
                    scrollToSection(activeSection);
                }
            }
        };

        // Update last scroll position
        if (!isScrollingRef.current) {
            requestAnimationFrame(() => {
                handleScrollAction();
                lastScrollPosition.current = window.scrollY;
            });
        }
    }, [activeSection, scrollToSection]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    // Initialize last scroll position
    useEffect(() => {
        lastScrollPosition.current = window.scrollY;
    }, []);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            switch (event.key) {
                case 'Enter':
                    if (!showMainContent) {
                        setShowMainContent(true);
                        setHasVideoPlayedOnce(true);
                    } else {
                        navigate('/auctions/');
                    }
                    break;
                case 'ArrowDown':
                case 'ArrowRight':
                    event.preventDefault();
                    if (activeSection < TOTAL_SECTIONS - 1) {
                        scrollToSection(activeSection + 1);
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    event.preventDefault();
                    if (activeSection > 0) {
                        scrollToSection(activeSection - 1);
                    }
                    break;
            }
        },
        [activeSection, showMainContent, navigate, scrollToSection],
    );

    useEffect(() => {
        if (!showLandingPageTemp && skipLandingPage) {
            navigate('/auctions/');
        }
    }, [skipLandingPage, navigate, showLandingPageTemp]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (!showHomeVideoLocalStorage) {
            setShowMainContent(true);
            setHasVideoPlayedOnce(true);
        } else {
            const timer = setTimeout(() => {
                setShowMainContent(true);
                setHasVideoPlayedOnce(true);
            }, INITIAL_DELAY);
            return () => clearTimeout(timer);
        }
    }, [showHomeVideoLocalStorage, setHasVideoPlayedOnce]);

    const sections = [
        <FutaLanding key='section1' />,
        <FutaLanding2 key='section2' />,
        <FutaLanding3 key='section3' />,
        <FutaLanding4 key='section4' />,
        <FutaLanding5 key='section5' />,
    ];

    if (!showMainContent && !hasVideoPlayedOnce) {
        return <FadingTextGrid setShowMainContent={setShowMainContent} />;
    }

    return (
        <div className={styles.container}>
            {sections.map((SectionComponent, index) => (
                <div
                    key={index}
                    className={styles.content}
                    ref={(el) => {
                        sectionsRef.current[index] = el;
                    }}
                >
                    {SectionComponent}
                </div>
            ))}
            <FutaLandingNav
                scrollToSection={scrollToSection}
                activeSection={activeSection}
            />
        </div>
    );
}
