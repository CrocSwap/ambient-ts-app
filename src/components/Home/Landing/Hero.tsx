// import logoText from '../../../assets/images/logos/logo_text.png';
import { FlexContainer, Text } from '../../../styled/Common';
import blastLogo from '../../../assets/images/logos/blast_logo.svg';
import scrollLogo from '../../../assets/images/logos/scroll_brand_logo.svg';
import logoText from '../../../assets/images/logos/logo_text.png';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import styles from './BackgroundImages.module.css';
import { HeroContainer } from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useContext } from 'react';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

export default function Hero() {
    const smallScreen = useMediaQuery('(max-width: 1200px)');
    const { isActiveNetworkBlast, isActiveNetworkScroll } =
        useContext(ChainDataContext);

    if (isActiveNetworkBlast) {
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
                    <FlexContainer
                        flexDirection={smallScreen ? 'column' : 'row'}
                        alignItems='center'
                        gap={8}
                        style={{ verticalAlign: 'middle' }}
                    >
                        <p
                            className={styles.ambient_blast_logo}
                            style={{ fontSize: '90px' }}
                        >
                            ambient
                        </p>
                        <Text
                            fontWeight='100'
                            // fontSize='header1'
                            color='text1'
                            align='center'
                            style={{
                                marginTop: '20px',
                                marginLeft: '15px',
                                fontSize: '30px',
                            }}
                        >
                            X
                        </Text>
                        <img
                            src={blastLogo}
                            alt=''
                            width='130px'
                            style={{ marginTop: '8px', maxWidth: '60%' }}
                        />
                    </FlexContainer>
                    <TradeNowButton fieldId='trade_now_btn_in_hero' />
                </FlexContainer>
            </HeroContainer>
        );
    } else if (isActiveNetworkScroll) {
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
                    <FlexContainer
                        flexDirection={smallScreen ? 'column' : 'row'}
                        alignItems='center'
                        gap={8}
                        style={{ verticalAlign: 'middle' }}
                    >
                        <p
                            className={styles.ambient_blast_logo}
                            style={{ fontSize: '110px' }}
                        >
                            ambient
                        </p>
                        <Text
                            fontWeight='100'
                            // fontSize='header1'
                            color='text1'
                            align='center'
                            style={{
                                marginTop: '20px',
                                marginLeft: '15px',
                                marginRight: '15px',
                                fontSize: '30px',
                            }}
                        >
                            X
                        </Text>
                        <img
                            src={scrollLogo}
                            alt=''
                            width='70px'
                            style={{ marginTop: '8px', maxWidth: '60%' }}
                        />
                    </FlexContainer>
                    <TradeNowButton fieldId='trade_now_btn_in_hero' />
                </FlexContainer>
            </HeroContainer>
        );
    } else {
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
                    <TradeNowButton fieldId='trade_now_btn_in_hero' />
                </FlexContainer>
            </HeroContainer>
        );
    }
}
