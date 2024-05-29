import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa';
import { FaMedium } from 'react-icons/fa6';

import styles from './LandingStyles.module.css';
import LinkCard from './LinkCard';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { FiTool } from 'react-icons/fi';
import {
    DISCORD_LINK,
    DOCS_LINK,
    MEDIUM_LINK,
    TWITTER_LINK,
} from '../../../ambient-utils/constants';
import { useTermsAgreed } from '../../../App/hooks/useTermsAgreed';

export default function Landing6() {
    const [, , termsUrls] = useTermsAgreed();

    const linksData = [
        {
            label: 'Twitter',
            text: 'Follow the latest from Ambient Finance',
            link: TWITTER_LINK,
            linkLabel: '@ambient_finance',
            icon: <FaTwitter />,
        },
        {
            label: 'Discord',
            text: 'Join in the discussion',
            link: DISCORD_LINK,
            linkLabel: 'discord.gg/ambient-finance',
            icon: <FaDiscord />,
        },
        {
            label: 'Blog',
            text: 'Find our industry leading articles',
            link: MEDIUM_LINK,
            linkLabel: 'medium',
            icon: <FaMedium />,
        },
        {
            label: 'Docs',
            text: 'Dive into the details',
            link: DOCS_LINK,
            linkLabel: 'Documentation',
            icon: <IoDocumentTextSharp />,
        },
        {
            label: 'SDK',
            text: 'Seemlessly integrate with Ambient Finance',
            link: 'https://github.com/CrocSwap/sdk',
            linkLabel: 'Typescript SDK',
            icon: <FiTool />,
        },
        {
            label: 'Github',
            text: 'View our code',
            link: 'https://github.com/CrocSwap',
            linkLabel: 'Github',
            icon: <FaGithub />,
        },
        {
            label: 'Terms of Service',
            text: 'Our rules for using the platform',
            link: `${window.location.origin}/${termsUrls.tos}`,
            linkLabel: 'TOS',
            icon: <IoDocumentTextSharp />,
        },
        {
            label: 'Privacy Policy',
            text: 'View our policies around data',
            link: `${window.location.origin}/${termsUrls.privacy}`,
            linkLabel: 'Privacy Policy',
            icon: <IoDocumentTextSharp />,
        },
        {
            label: 'Whitepaper',
            text: 'Read our influential whitepaper here',
            link: 'https://crocswap-whitepaper.netlify.app/',
            linkLabel: 'whitepaper',
            icon: <IoDocumentTextSharp />,
        },
        // {
        //     label: 'Brand Kit',
        //     text: 'Download our brand kit',
        //     link: '#',
        //     linkLabel: 'Brand Kit',
        //     icon: <IoDocumentTextSharp />,
        // },
    ];
    return (
        <div className={styles.sub_container}>
            <h2>Links</h2>

            <div className={styles.links_container}>
                {linksData.map((item, idx) => (
                    <LinkCard
                        key={item.label + idx}
                        label={item.label}
                        text={item.text}
                        link={item.link}
                        linkLabel={item.linkLabel}
                        icon={item.icon}
                    />
                ))}
            </div>
        </div>
    );
}
