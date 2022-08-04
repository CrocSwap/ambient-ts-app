import styles from './Investors.module.css';

import blocktowerImage from '../../../assets/images/Investors/Blocktower.png';
import amberImage from '../../../assets/images/Investors/amber.png';
import tensaiImage from '../../../assets/images/Investors/tensai.png';
import navalImage from '../../../assets/images/Investors/naval.png';
import yuntImage from '../../../assets/images/Investors/yunt.png';
import yuntImage2 from '../../../assets/images/Investors/yunt2.png';
import zachImage from '../../../assets/images/Investors/zach.png';
import berachainImage from '../../../assets/images/Investors/berachin1.svg';
import berachainImage2 from '../../../assets/images/Investors/berachin2.svg';
import susaImage from '../../../assets/images/Investors/susa.svg';
import hypotenuseImage from '../../../assets/images/Investors/hypotenuse.svg';
import grugImage from '../../../assets/images/Investors/grug.svg';

import { motion, useViewportScroll, useTransform } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface RowAnimateProps {
    children?: React.ReactNode;
    speed: number;
}

function RowAnimate(props: RowAnimateProps) {
    const { scrollYProgress } = useViewportScroll();
    const yValue = useTransform(scrollYProgress, [0, 0.5, 1], [0, 50, 100 * props.speed]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ y: yValue }}
        >
            {props.children}
        </motion.div>
    );
}

export default function Investors() {
    const { t } = useTranslation();

    const blockTower = (
        <div className={styles.center}>
            <img src={blocktowerImage} alt='blocktower' />
        </div>
    );
    const amber = (
        <div className={styles.center}>
            <img src={amberImage} alt='blocktower' />
        </div>
    );

    const arthur = <div className={styles.arthur}>Arthur Hayes</div>;
    const tensai = (
        <div className={styles.center_logo}>
            <img src={tensaiImage} alt='blocktower' />
            <div className={styles.tensai_text}>Tensai Capital</div>
        </div>
    );
    const naval = (
        <div className={styles.center_logo}>
            <img src={navalImage} alt='blocktower' />
            <div className={styles.tensai_text}>Naval Rakitant</div>
        </div>
    );
    const yunt = (
        <div className={styles.center_logo}>
            <img src={yuntImage} alt='Yunt capital' />
            <img src={yuntImage2} alt='Yunt capital' />
        </div>
    );
    const berachain = (
        <div className={styles.center_logo}>
            <img src={berachainImage} alt='berachain' />
            <img src={berachainImage2} alt='berachain' />
            <div className={styles.berachain_text}>Berachain</div>
        </div>
    );
    const zachxbt = (
        <div className={styles.center_logo}>
            <img src={zachImage} alt='zachxbt' />
            <div className={styles.zach_text}>zachxbt</div>
        </div>
    );
    const susa = (
        <div className={styles.center_logo}>
            <img src={susaImage} alt='susa ventures' />
            <div className={styles.susa_text}>
                <span>SUSA</span> VENTURES
            </div>
        </div>
    );

    const hypotenuse = (
        <div className={styles.center_logo}>
            <img src={hypotenuseImage} alt='hypotenuse labs' />
            <div className={styles.hypotenuse_text}>Hypotenuse Labs</div>
        </div>
    );
    const julian = (
        <div className={styles.center}>
            <div className={styles.julian_text}>Julian Koh</div>
        </div>
    );
    const llllvvuu = (
        <div className={styles.center}>
            <div className={styles.llllvvuu_text}>llllvvuu</div>
        </div>
    );
    const dogetoshi = (
        <div className={styles.center}>
            <div className={styles.afkbyte_text}>afkbyte</div>
        </div>
    );
    const afkbyte = (
        <div className={styles.center}>
            <div className={styles.dogetoshi_text}>Dogetoshi</div>
        </div>
    );
    const grug = (
        <div className={styles.center_logo}>
            <img src={grugImage} alt='grug capital' />
            <div className={styles.dogetoshi_text}>Grug Capital</div>
        </div>
    );

    return (
        <div className={styles.container}>
            <div className={styles.blur_background}></div>

            <div className={styles.title}>{t('ourInvestorsTitle')}</div>
            <div className={styles.content}>
                <RowAnimate speed={-1.2}>
                    <div className={styles.row1}>{blockTower}</div>
                </RowAnimate>

                <RowAnimate speed={-1.6}>
                    <div className={styles.row2}>
                        {amber}
                        {arthur}
                    </div>
                </RowAnimate>
                <RowAnimate speed={-1.4}>
                    <div className={styles.row2}>
                        {tensai}
                        {naval}
                    </div>
                </RowAnimate>
                <RowAnimate speed={-1.2}>
                    <div className={styles.row5}>
                        {yunt}
                        {zachxbt}
                        {berachain}
                        {susa}
                        {hypotenuse}
                    </div>
                </RowAnimate>
                <RowAnimate speed={-1}>
                    <div className={styles.row5}>
                        {julian}
                        {llllvvuu}
                        {grug}
                        {dogetoshi}
                        {afkbyte}
                    </div>
                </RowAnimate>
            </div>
            <div className={styles.investor}></div>
        </div>
    );
}
