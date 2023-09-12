import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import styles from './BackgroundImages.module.css';
import { FlexContainer } from '../../../styled/Common';
import { HeroContainer } from '../../../styled/Components/Home';

export default function Hero() {
    return (
        <HeroContainer
            justifyContent='center'
            alignItems='center'
            rounded
            fullHeight
            fullWidth
            id='hero'
            className={styles.home_wallpaper}
        >
            <FlexContainer
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
                gap={32}
            >
                <img src={logoText} alt='ambient' />
                <TradeNowButton />
            </FlexContainer>
        </HeroContainer>
    );
}
