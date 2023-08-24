import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import { HeroContainer } from './Hero.styles';

export default function Hero() {
    return (
        <HeroContainer id='hero'>
            <div>
                <img src={logoText} alt='ambient' />
                <TradeNowButton />
            </div>
        </HeroContainer>
    );
}
