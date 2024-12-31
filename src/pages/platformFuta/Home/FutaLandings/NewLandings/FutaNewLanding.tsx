import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFutaHomeContext } from '../../../../../contexts/Futa/FutaHomeContext';
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

export default function FutaNewLanding() {
    const {
        hasVideoPlayedOnce,
        setHasVideoPlayedOnce,
        showHomeVideoLocalStorage,
        skipLandingPage,
        showLandingPageTemp,
    } = useFutaHomeContext();
    const [activeSection, setActiveSection] = useState(0);
    const [showMainContent, setShowMainContent] = useState(false);
    const navigate = useNavigate();
    const sectionsRef = useRef<(HTMLDivElement | null)[]>(
        Array(TOTAL_SECTIONS).fill(null),
    );

    // Memoized navigation functions
    const navigateToNextSection = useCallback(() => {
        const nextSection = (activeSection + 1) % TOTAL_SECTIONS;
        setActiveSection(nextSection);
        scrollToSection(nextSection);
    }, [activeSection]);

    const navigateToPreviousSection = useCallback(() => {
        const previousSection =
            activeSection === 0 ? TOTAL_SECTIONS - 1 : activeSection - 1;
        setActiveSection(previousSection);
        scrollToSection(previousSection);
    }, [activeSection]);

    const handleScroll = useCallback(() => {
        // Function to determine which section is most in view
        const getCurrentSection = () => {
            const viewportHeight = window.innerHeight;
            // const scrollTop = window.scrollY;

            let maxVisibility = 0;
            let mostVisibleIndex = 0;

            sectionsRef.current.forEach((section, index) => {
                if (section) {
                    const rect = section.getBoundingClientRect();
                    const visibleHeight =
                        Math.min(rect.bottom, viewportHeight) -
                        Math.max(rect.top, 0);
                    const visibility = visibleHeight / viewportHeight;

                    if (visibility > maxVisibility) {
                        maxVisibility = visibility;
                        mostVisibleIndex = index;
                    }
                }
            });

            return mostVisibleIndex;
        };

        // Direct scroll event handler
        const onScroll = () => {
            const currentSection = getCurrentSection();
            setActiveSection(currentSection);
        };

        // Add scroll event listener
        window.addEventListener('scroll', onScroll, { passive: true });

        // Also keep the IntersectionObserver for backup
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntry = entries.reduce(
                    (max, entry) => {
                        return entry.intersectionRatio >
                            (max?.intersectionRatio || 0)
                            ? entry
                            : max;
                    },
                    null as IntersectionObserverEntry | null,
                );

                if (visibleEntry?.isIntersecting) {
                    const index = sectionsRef.current.findIndex(
                        (section) => section === visibleEntry.target,
                    );
                    if (index !== -1) {
                        setActiveSection(index);
                    }
                }
            },
            {
                threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                rootMargin: '-50% 0px -50% 0px',
            },
        );

        sectionsRef.current.forEach((section) => {
            if (section) observer.observe(section);
        });

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', onScroll);
            observer.disconnect();
        };
    }, []);

    // Also modify the scrollToSection to update activeSection immediately
    const scrollToSection = useCallback((index: number) => {
        setActiveSection(index); // Update active section immediately
        sectionsRef.current[index]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }, []);

    useEffect(() => {
        if (!showLandingPageTemp && skipLandingPage) {
            navigate('/auctions/');
        }
    }, [skipLandingPage, navigate, showLandingPageTemp]);

    // Memoized keyboard handler
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
                    navigateToNextSection();
                    break;
                case 'ArrowUp':
                case 'ArrowLeft':
                    event.preventDefault();
                    navigateToPreviousSection();
                    break;
            }
        },
        [
            showMainContent,
            navigate,
            navigateToNextSection,
            navigateToPreviousSection,
        ],
    );

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
        if (!showHomeVideoLocalStorage) {
            // If the user has chosen to skip, immediately show main content
            setShowMainContent(true);
            setHasVideoPlayedOnce(true);
        } else {
            // Otherwise, use the timer for the initial delay
            const timer = setTimeout(() => {
                setShowMainContent(true);
                setHasVideoPlayedOnce(true);
            }, INITIAL_DELAY);
            return () => clearTimeout(timer);
        }
    }, [showHomeVideoLocalStorage, setHasVideoPlayedOnce]);

    // Sections configuration
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
                    ref={(el) => (sectionsRef.current[index] = el)}
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
