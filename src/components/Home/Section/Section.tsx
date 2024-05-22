import { useEffect, useRef } from 'react';
import styles from './Section.module.css';
interface SectionProps {
    image: string;
    page: React.ReactNode | JSX.Element;
    scrollTo: (ref: React.RefObject<HTMLDivElement>) => void;
    goToSectionRef: React.RefObject<HTMLDivElement>;
}

export default function Section({ image, page }: SectionProps) {
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
            style={{ background: image }}
        >
            {page}
        </div>
    );
}
