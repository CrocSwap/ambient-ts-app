import { FaDiscord, FaGithub, FaTwitter } from 'react-icons/fa';
import { FaMedium } from 'react-icons/fa6';

import { FlexContainer } from '../../../styled/Common';
import styles from './LandingStyles.module.css';
import LinkCard from './LinkCard';
import { IoDocumentTextSharp } from 'react-icons/io5';
import { FiTool } from 'react-icons/fi';

const linksData = [
    {
        label: 'Twitter',
        text: 'Follow the latest from Ambient Finance',
        link: '#',
        linkLabel: '@ambient_finance',
        icon: <FaTwitter />,
    },
    {
        label: 'Discord',
        text: 'Join in the discussion',
        link: '#',
        linkLabel: 'discord.gg/ambient-finance',
        icon: <FaDiscord />,
    },
    {
        label: 'Blog',
        text: 'Find our industry leading articles',
        link: '#',
        linkLabel: 'medium',
        icon: <FaMedium />,
    },
    {
        label: 'Docs',
        text: 'Dive into the details',
        link: '#',
        linkLabel: 'Documentation',
        icon: <IoDocumentTextSharp />,
    },
    {
        label: 'SDK',
        text: 'Seemlessly integrate with Ambient Finance',
        link: '#',
        linkLabel: 'Typescript SDK',
        icon: <FiTool />,
    },
    {
        label: 'Github',
        text: 'View our code',
        link: '#',
        linkLabel: 'Github',
        icon: <FaGithub />,
    },
    {
        label: 'Terms of Service',
        text: 'Our rules for using the platform',
        link: '#',
        linkLabel: 'TOS',
        icon: <IoDocumentTextSharp />,
    },
    {
        label: 'Privacy Policy',
        text: 'View our policies around data',
        link: '#',
        linkLabel: 'Privacy Policy',
        icon: <IoDocumentTextSharp />,
    },
    {
        label: 'Whitepaper',
        text: 'Read our influential whitepaper here',
        link: '#',
        linkLabel: 'whitepaper',
        icon: <IoDocumentTextSharp />,
    },
    {
        label: 'Brand Kit',
        text: 'Download our brand kit',
        link: '#',
        linkLabel: 'Brand Kit',
        icon: <IoDocumentTextSharp />,
    },
];

export default function Landing6() {
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
