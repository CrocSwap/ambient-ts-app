import styles from './FutaLanding5.module.css';

import {
    DISCORD_LINK,
    DOCS_LINK,
    TWITTER_LINK,
} from '../../../../../ambient-utils/constants';
export default function FutaLanding5() {
    const BRAND_KIT_LINK = 'https://futa-brand-kit.netlify.app/';

    return (
        <div className={styles.container}>
            <h3>/Links</h3>
            <div className={styles.content}>
                <a href={TWITTER_LINK} target='_blank' rel='noreferrer'>
                    X Profile
                </a>
                <a href={DISCORD_LINK} target='_blank' rel='noreferrer'>
                    Discord communication
                </a>
                <a href={DOCS_LINK} target='_blank' rel='noreferrer'>
                    Documentation
                </a>
                <a href={BRAND_KIT_LINK} target='_blank' rel='noreferrer'>
                    Brand Kit
                </a>
            </div>
        </div>
    );
}
