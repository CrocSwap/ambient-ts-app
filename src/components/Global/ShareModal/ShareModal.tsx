import styles from './ShareModal.module.css';
import { FiCopy } from 'react-icons/fi';
import { useContext, useState } from 'react';
import { FaDiscord, FaTelegram, FaFacebook } from 'react-icons/fa';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { useLocation } from 'react-router-dom';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';

interface SocialLinkPropsIF {
    // eslint-disable-next-line
    icon: any;
    link: string;
    name: string;
}
function SocialLink(props: SocialLinkPropsIF) {
    const { icon, link, name } = props;

    const ariaLabel = `share swap on ${name}`;

    return (
        <a
            target='_blank'
            rel='noreferrer'
            href={link}
            className={styles.social_link_container}
            aria-label={ariaLabel}
            tabIndex={0}
        >
            {icon}
            {name}
        </a>
    );
}
export default function ShareModal() {
    const location = useLocation();
    // const currentUrl = location.href
    const currentPathname = location.pathname;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const [linkToShare, setLinkToShare] = useState(
        `ambient-finance.netlify.app${currentPathname}`,
    );

    const linkToShareTruncated = linkToShare.slice(0, 50) + '...';
    const socialLinksData = [
        {
            name: 'Twitter',
            icon: <AiFillTwitterCircle size={50} />,
            link: `https://twitter.com/intent/tweet?text=ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Discord',
            icon: <FaDiscord size={50} />,
            link: `ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Telegram',
            icon: <FaTelegram size={50} />,
            link: `https://telegram.me/share/url?url=ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Facebook',
            icon: <FaFacebook size={50} />,
            link: `https://www.facebook.com/sharer/sharer.php?u=ambient-finance.netlify.app${currentPathname}`,
        },
    ];

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(linkToShare);
        openSnackbar(`${linkToShare} copied`, 'info');
    }

    const shareIconsContent = (
        <section className={styles.share_links_container}>
            {socialLinksData.map((link, idx) => (
                <SocialLink
                    name={link.name}
                    icon={link.icon}
                    link={link.link}
                    key={idx}
                />
            ))}
        </section>
    );

    return (
        <div className={styles.option_control_container}>
            {shareIconsContent}

            <p className={styles.control_title}>URL:</p>
            <p className={styles.url_link}>
                <input
                    type='text'
                    placeholder={`${linkToShareTruncated}`}
                    disabled={true}
                    onChange={(e) => setLinkToShare(e?.target.value)}
                />

                <button
                    onClick={handleCopyAddress}
                    className={styles.copy_button}
                    tabIndex={0}
                    aria-label='Copy to clipboard'
                >
                    <FiCopy size={25} />
                </button>
            </p>
        </div>
    );
}
