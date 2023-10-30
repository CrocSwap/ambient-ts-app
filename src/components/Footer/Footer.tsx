import { useMediaQuery } from '@mui/material';
import styles from './Footer.module.css';
import { BsGithub, BsTwitter, BsMedium } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import {
    CORPORATE_LINK,
    DISCORD_LINK,
    DOCS_LINK,
    GITHUB_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../constants';
import { useTermsAgreed } from '../../App/hooks/useTermsAgreed';
import { GiAlligatorClip } from 'react-icons/gi';
interface FooterItemProps {
    title: string | JSX.Element;
    content: string;
    link: string;
}
export default function Footer() {
    const [, , termsUrls] = useTermsAgreed();

    interface footerItemsIF {
        title: JSX.Element;
        content: string;
        link: string;
    }

    const footerData: footerItemsIF[] = [
        {
            title: <>Terms of Service</>,
            content: 'Our rules for using the platform',
            link: `${window.location.origin}/${termsUrls.tos}`,
        },
        {
            title: <>Privacy Policy</>,
            content: 'View our policies around data',
            link: `${window.location.origin}/${termsUrls.privacy}`,
        },
        {
            title: <>Docs</>,
            content: 'View our documentation',
            link: DOCS_LINK,
        },
        {
            title: (
                <>
                    <BsGithub size={15} /> GitHub
                </>
            ),
            content: 'View our smart contracts, SDK, and more',
            link: GITHUB_LINK,
        },
        {
            title: (
                <>
                    <GiAlligatorClip size={15} /> About Us
                </>
            ),
            content: 'Learn more about parent company Crocodile Labs',
            link: CORPORATE_LINK,
        },
        {
            title: (
                <>
                    <BsTwitter size={15} /> Twitter
                </>
            ),
            content: 'Keep up with the latest on twitter',
            link: TWITTER_LINK,
        },
        {
            title: (
                <>
                    <FaDiscord size={15} /> Discord
                </>
            ),
            content: 'Join the community ',
            link: DISCORD_LINK,
        },
        {
            title: (
                <>
                    <BsMedium size={15} /> Medium
                </>
            ),
            content: 'Read the latest from our team on Medium',
            link: MEDIUM_LINK,
        },
    ];

    const mobileButton = (
        <Link
            to={'/trade'}
            tabIndex={0}
            aria-label='Go to trade page button'
            className={styles.started_button}
        >
            Trade Now
        </Link>
    );

    const FooterItem = (props: FooterItemProps) => {
        const { title, content, link } = props;
        return (
            <a
                href={link}
                className={styles.footer_item_container}
                target='_blank'
                rel={link === CORPORATE_LINK ? 'noreferrer me' : 'noreferrer'}
            >
                <h3>{title}</h3>
                <p>{content}</p>
            </a>
        );
    };
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const mobileItems = (
        <div className={styles.mobile_version}>
            {footerData.map((data) => (
                <FooterItem
                    title={data.title}
                    content={data.content}
                    link={data.link}
                    key={data.content}
                />
            ))}
            {mobileButton}
        </div>
    );
    if (showMobileVersion)
        return <div className={styles.mobile_bg}>{mobileItems}</div>;
    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <div className={styles.row}>
                    {footerData.slice(0, 2).map((data) => (
                        <FooterItem
                            title={data.title}
                            content={data.content}
                            link={data.link}
                            key={data.content}
                        />
                    ))}
                </div>
                <div className={styles.row}>
                    {footerData.slice(2, 5).map((data) => (
                        <FooterItem
                            title={data.title}
                            content={data.content}
                            link={data.link}
                            key={data.content}
                        />
                    ))}
                </div>
                <div className={styles.row}>
                    {footerData.slice(5, 8).map((data) => (
                        <FooterItem
                            title={data.title}
                            content={data.content}
                            link={data.link}
                            key={data.content}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
