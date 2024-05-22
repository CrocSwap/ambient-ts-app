import { FlexContainer } from '../../../styled/Common';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import styles from './LandingStyles.module.css';

interface PropsIF {
    label: string;
    text: string;
    link: string;
    linkLabel: string;
    icon: JSX.Element;
}
export default function LinkCard(props: PropsIF) {
    const { label, text, link, linkLabel, icon } = props;

    const showDesktopVersion = useMediaQuery('(min-width: 600px)');

    // if (showMobileVersion) return (
    //     <div className={styles.link_card_link_container}><a href="#">Github</a></div>

    // )

    return (
        <div className={styles.link_card_container}>
            <FlexContainer
                flexDirection='row'
                alignItems='center'
                justifyContent='space-between'
                width='100%'
            >
                <h3>{label}</h3>
                <div className={styles.link_card_icon_container}>{icon}</div>
            </FlexContainer>
            {showDesktopVersion && <p>{text}</p>}
            <div className={styles.link_card_link_container}>
                <a href={link} rel='noreferrer' target='_blank'>
                    {linkLabel}
                </a>
            </div>
        </div>
    );
}
