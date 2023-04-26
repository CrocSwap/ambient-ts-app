import styles from './Footer.module.css';
import { BsGithub, BsTwitter, BsMedium } from 'react-icons/bs';
import { FaDiscord } from 'react-icons/fa';
interface FooterItemProps {
    title: string | JSX.Element;
    content: string;
    link: string;
}
export default function Footer() {
    const footerData = [
        {
            title: 'Terms of Service',
            content: 'Our rules for using the platform',
            link: '/tos',
        },
        {
            title: 'Privacy Policy',
            content: 'View our policies around data',
            link: '/privacy',
        },
        {
            title: 'Docs',
            content: 'View our documentation',
            link: 'https://crocswap.gitbook.io/crocswap-docs/',
        },

        {
            title: (
                <>
                    <BsGithub size={15} /> Github
                </>
            ),
            content: 'View our smart contracts, SDK, and more',
            link: 'https://github.com/CrocSwap',
        },
        {
            title: (
                <>
                    <BsTwitter size={15} /> Twitter
                </>
            ),
            content: 'Keep up with the latest on twitter',
            link: 'https://twitter.com/crocswap',
        },
        {
            title: (
                <>
                    <FaDiscord size={15} /> Discord
                </>
            ),
            content: 'Join the community ',
            link: 'https://discord.com/invite/crocswap',
        },
        {
            title: (
                <>
                    <BsMedium size={15} /> Medium
                </>
            ),
            content: 'Read the latest from our team on Medium',
            link: 'https://crocswap.medium.com/',
        },
    ];

    const FooterItem = (props: FooterItemProps) => {
        const { title, content, link } = props;

        return (
            <a
                href={link}
                className={styles.footer_item_container}
                target='_blank'
                rel='noreferrer'
            >
                <h3>{title}</h3>
                <p>{content}</p>
            </a>
        );
    };

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
                    {footerData.slice(2, 4).map((data) => (
                        <FooterItem
                            title={data.title}
                            content={data.content}
                            link={data.link}
                            key={data.content}
                        />
                    ))}
                </div>
                <div className={styles.row}>
                    {footerData.slice(4, 7).map((data) => (
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
