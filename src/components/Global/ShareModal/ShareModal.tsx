import styles from './ShareModal.module.css';
import { FiCopy } from 'react-icons/fi';
import { useState } from 'react';
import { FaDiscord, FaTelegram, FaFacebook } from 'react-icons/fa';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { useLocation } from 'react-router-dom';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import SnackbarComponent from '../../../components/Global/SnackbarComponent/SnackbarComponent';
interface SocialLinkPropsIF {
    // eslint-disable-next-line
    icon: any;
    link: string;
    name: string;
}
function SocialLink(props: SocialLinkPropsIF) {
    const { icon, link, name } = props;
    return (
        <a target='_blank' rel='noreferrer' href={link} className={styles.social_link_container}>
            {icon}
            {name}
        </a>
    );
}
export default function ShareModal() {
    const location = useLocation();
    // const currentUrl = location.href
    const currentPathname = location.pathname;

    const [linkToShare, setLinkToShare] = useState(`ambient-finance.netlify.app${currentPathname}`);

    const linkToShareTruncated = linkToShare.slice(0, 50) + '...';
    const socialLinksData = [
        {
            name: 'Telegram',
            icon: <FaTelegram size={50} />,
            link: `https://telegram.me/share/url?url=ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Twitter',
            icon: <AiFillTwitterCircle size={50} />,
            link: `https://twitter.com/intent/tweet?text=ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Facebook',
            icon: <FaFacebook size={50} />,
            link: `https://www.facebook.com/sharer/sharer.php?u=ambient-finance.netlify.app${currentPathname}`,
        },
        {
            name: 'Discord',
            icon: <FaDiscord size={50} />,
            link: `ambient-finance.netlify.app${currentPathname}`,
        },
    ];

    const [openSnackbar, setOpenSnackbar] = useState(false);

    const [value, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(linkToShare);
        setOpenSnackbar(true);
    }

    const snackbarContent = (
        <SnackbarComponent
            severity='info'
            setOpenSnackbar={setOpenSnackbar}
            openSnackbar={openSnackbar}
        >
            {value} copied
        </SnackbarComponent>
    );
    // -------------------------Swap SHARE FUNCTIONALITY---------------------------
    // const [shareOptions, setShareOptions] = useState([
    //     { slug: 'first', name: 'Include Swap 1', checked: false },
    //     { slug: 'second', name: 'Include Swap 2', checked: false },
    //     { slug: 'third', name: 'Include Swap 3', checked: false },
    //     { slug: 'fourth', name: 'Include Swap 4', checked: false },
    // ]);

    // const handleShareOptionChange = (slug: string) => {
    //     const copyShareOptions = [...shareOptions];
    //     const modifiedShareOptions = copyShareOptions.map((option) => {
    //         if (slug === option.slug) {
    //             option.checked = !option.checked;
    //         }

    //         return option;
    //     });

    //     setShareOptions(modifiedShareOptions);
    // };

    // const shareOptionsDisplay = (
    //     <div className={styles.option_control_container}>
    //         {shareIconsContent}
    //         <div className={styles.options_control_display_container}>
    //             <p className={styles.control_title}>Options</p>
    //             <ul>
    //                 {shareOptions.map((option, idx) => (
    //                     <SwapShareControl
    //                         key={idx}
    //                         option={option}
    //                         handleShareOptionChange={handleShareOptionChange}
    //                     />
    //                 ))}
    //             </ul>
    //         </div>
    //         <p className={styles.control_title}>URL:</p>
    //         <p className={styles.url_link}>
    //             {`https://ambient-finance.netlify.app${linkToShare}`}
    //             <div style={{ cursor: 'pointer' }}>
    //                 <FiCopy color='#cdc1ff' />
    //             </div>
    //         </p>
    //     </div>
    // );

    const shareIconsContent = (
        <section className={styles.share_links_container}>
            {socialLinksData.map((link, idx) => (
                <SocialLink name={link.name} icon={link.icon} link={link.link} key={idx} />
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

                <div style={{ cursor: 'pointer' }} onClick={handleCopyAddress}>
                    <FiCopy color='#cdc1ff' size={25} />
                </div>
            </p>
            {snackbarContent}
        </div>
    );
}
