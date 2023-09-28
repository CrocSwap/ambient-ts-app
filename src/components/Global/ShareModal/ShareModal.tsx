import { FiCopy } from 'react-icons/fi';
import { ChangeEvent, useContext, useState } from 'react';
import { FaDiscord, FaTelegram, FaFacebook } from 'react-icons/fa';
import { AiFillTwitterCircle } from 'react-icons/ai';
import { useLocation } from 'react-router-dom';
import useCopyToClipboard from '../../../utils/hooks/useCopyToClipboard';
import { AppStateContext } from '../../../contexts/AppStateContext';
import { DISCORD_LINK } from '../../../constants';
import Modal from '../Modal/Modal';
import { FlexContainer, Text } from '../../../styled/Common';
import {
    IconButton,
    ShareUrl,
    ShareItem,
} from '../../../styled/Components/TradeModules';

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
        <ShareItem
            target='_blank'
            rel='noreferrer'
            href={link}
            aria-label={ariaLabel}
            tabIndex={0}
        >
            {icon}
            {name}
        </ShareItem>
    );
}

interface propsIF {
    onClose: () => void;
}
export default function ShareModal({ onClose }: propsIF) {
    const location = useLocation();
    // const currentUrl = location.href
    const currentPathname = location.pathname;

    const {
        snackbar: { open: openSnackbar },
    } = useContext(AppStateContext);

    const [linkToShare, setLinkToShare] = useState(
        `ambient.finance${currentPathname}`,
    );

    const socialLinksData = [
        {
            name: 'Twitter',
            icon: <AiFillTwitterCircle size={50} />,
            link: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
                linkToShare,
            )}`,
        },
        {
            name: 'Discord',
            icon: <FaDiscord size={50} />,
            link: `${DISCORD_LINK}`,
        },
        {
            name: 'Telegram',
            icon: <FaTelegram size={50} />,
            link: `https://telegram.me/share/url?url=${encodeURIComponent(
                linkToShare,
            )}`,
        },
        {
            name: 'Facebook',
            icon: <FaFacebook size={50} />,
            link: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                linkToShare,
            )}`,
        },
    ];

    const [_, copy] = useCopyToClipboard();

    function handleCopyAddress() {
        copy(linkToShare);
        openSnackbar(`${linkToShare} copied`, 'info');
    }

    const shareIconsContent = (
        <FlexContainer alignItems='center' gap={4}>
            {socialLinksData.map((link, idx) => (
                <SocialLink
                    name={link.name}
                    icon={link.icon}
                    link={link.link}
                    key={idx}
                />
            ))}
        </FlexContainer>
    );

    return (
        <Modal title='Share' onClose={onClose}>
            <FlexContainer flexDirection='column' gap={8} padding='16px'>
                {shareIconsContent}

                <Text color='text2'>URL:</Text>
                <FlexContainer
                    fullWidth
                    alignItems='center'
                    gap={8}
                    color='text2'
                >
                    <ShareUrl
                        type='text'
                        placeholder={`${linkToShare}`}
                        disabled={true}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setLinkToShare(e?.target.value)
                        }
                    />

                    <IconButton
                        onClick={handleCopyAddress}
                        tabIndex={0}
                        aria-label='Copy to clipboard'
                    >
                        <FiCopy size={25} />
                    </IconButton>
                </FlexContainer>
            </FlexContainer>
        </Modal>
    );
}
