import { useEffect, useRef } from 'react';
import styles from './Section.module.css';
interface SectionProps {
    page: React.ReactNode;
    scrollTo: (ref: React.RefObject<HTMLDivElement>) => void;
    goToSectionRef: React.RefObject<HTMLDivElement>;
    customBackground?: string;
}

export default function Section({ page, customBackground }: SectionProps) {
    const pageRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    } else {
                        entry.target.classList.remove('is-visible');
                    }
                });
            },
            { threshold: 0.5 }, // Trigger when 50% of the element is visible
        );

        if (pageRef.current) {
            observer.observe(pageRef.current);
        }

        return () => {
            if (pageRef.current) {
                observer.unobserve(pageRef.current);
            }
        };
    }, []);

    return (
        <div
            className={styles.section}
            ref={sectionRef}
            style={{ background: customBackground ? customBackground : '' }}
        >
            {page}
        </div>
    );
}
