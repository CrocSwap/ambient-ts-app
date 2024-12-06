import { IoIosArrowDown } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import styles from './FutaLandingNav.module.css';

interface propsIF {
    scrollToSection: ScrollToSectionFn;
    activeSection: number;
}
type ScrollToSectionFn = (index: number) => void;

export default function FutaLandingNav(props: propsIF) {
    const navigate = useNavigate();

    const { scrollToSection, activeSection } = props;
    const sections = ['00', '01', '02', '03', '04'];

    const handleNextSection = () => {
        const nextIndex = (activeSection + 1) % sections.length;
        scrollToSection(nextIndex);
    };
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const futaText = (
        <div className={styles.centerSection}>
            <div className={styles.mainText}>
                <span className={styles.fuText}>FU</span>
                <span>/</span>
                <span className={styles.taText}>TA</span>
            </div>
            <div className={styles.enterButton}>
                <button onClick={() => navigate('/auctions')}>/ENTER</button>
            </div>
        </div>
    );

    return (
        <div className={styles.container} tabIndex={0}>
            <div className={styles.leftSection}>
                <div className={styles.verticalText}>
                    FULLY UNIVERSAL TICKER AUCTION
                </div>
                <div className={styles.desktopFuta}>{futaText}</div>
            </div>
            {showMobileVersion ? (
                futaText
            ) : (
                <IoIosArrowDown
                    size={120}
                    onClick={handleNextSection}
                    style={{ cursor: 'pointer' }}
                />
            )}

            <div className={styles.rightSection}>
                <div className={styles.numberList}>
                    {sections.map((num, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToSection(index)}
                            style={{
                                color: index === activeSection ? '#AACFD1' : '',
                            }}
                            className={styles.navButton}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
