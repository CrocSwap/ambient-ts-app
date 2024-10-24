import styles from './FutaLandingNav.module.css';

interface propsIF {
    scrollToSection: ScrollToSectionFn;
    activeSection: number;
}
type ScrollToSectionFn = (index: number) => void;

export default function FutaLandingNav(props: propsIF) {
    const { scrollToSection, activeSection } = props;

    console.log({ activeSection });

    return (
        <div className={styles.container}>
            <div className={styles.leftSection}>
                <div className={styles.verticalText}>
                    FULLY UNIVERSAL TICKER AUCTION
                </div>
            </div>
            <div className={styles.centerSection}>
                <div className={styles.mainText}>
                    <span className={styles.fuText}>FU</span>
                    <span>/</span>
                    <span className={styles.taText}>TA</span>
                </div>
                <div className={styles.enterButton}>
                    <button>/ENTER</button>
                    
                   
                </div>
            </div>
            <div className={styles.rightSection}>
                <div className={styles.numberList}>
                    {['00', '01', '02', '03', '04'].map((num, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToSection(index)}
                            style={{
                                color:
                                    index === activeSection
                                        ? '#AACFD1'
                                        : '#5C6F72',
                            }}
                        >
                            {num}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
