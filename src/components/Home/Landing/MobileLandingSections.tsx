import styles from './BackgroundImages.module.css';

import logoText from '../../../assets/images/logos/logo_text.png';

import Footer from '../../Footer/Footer';
import liquidityImage from '../../../assets/images/home/liquidity.png';
import orderImage from '../../../assets/images/home/orders.png';
import { Fade } from 'react-reveal';

import Stats from '../Stats/AmbientStats';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import TopPools from '../TopPools/TopPools';
import Investors from './Investors';
import { useEffect, useState } from 'react';
import {
    MobileBg1,
    MobileBg2,
    MobileBg3,
    MobileBg4,
    MobileMainContainer,
    MobileMainLogo,
    MobileCard,
} from '../../../styled/Components/Home';
import { FlexContainer, Text } from '../../../styled/Common';

export default function MobileLandingSections() {
    const [isIPhone, setIsIPhone] = useState(false);
    useEffect(() => {
        const userAgent = window.navigator.userAgent;
        const isiPhone = /iPhone|iOS/i.test(userAgent);
        setIsIPhone(isiPhone);
    }, []);

    const heroSection = (
        <FlexContainer
            id='hero'
            flexDirection='column'
            alignItems='center'
            scrollSnapAlign='center'
            gap={16}
            padding='0 0 16px 0'
            fullHeight
        >
            <>
                <MobileMainLogo
                    justifyContent='center'
                    alignItems='center'
                    fullWidth
                    className={styles.home_wallpaper_mobile}
                >
                    <img src={logoText} alt='ambient' />
                </MobileMainLogo>
                <div style={{ padding: '20px' }}>
                    <TopPools noTitle gap='8px' />
                </div>
            </>
            <TradeNowButton />
        </FlexContainer>
    );

    const statsSection = (
        <MobileCard
            flexDirection='column'
            fullWidth
            id='toppools'
            scrollSnapAlign='center'
        >
            <MobileBg4 className={styles.home4} />
            <Stats />
        </MobileCard>
    );

    const secondRow = (
        <MobileCard
            flexDirection='column'
            id='zerotoone'
            scrollSnapAlign='center'
        >
            <MobileBg1 className={styles.home2} />
            <Fade up>
                <h1 tabIndex={0}>Zero-to-One Decentralized Trading Protocol</h1>
                <Text
                    tabIndex={0}
                    color='text2'
                    style={{ fontSize: '20px', lineHeight: '30px' }}
                >
                    Faster, Easier, and Cheaper
                </Text>
                <Text color='text2' fontWeight='100' tabIndex={0}>
                    Ambient runs the entire DEX inside a single smart contract,
                    allowing for low-fee transactions, greater liquidity
                    rewards, and a fairer trading experience.
                </Text>
            </Fade>
        </MobileCard>
    );

    const thirdRow = (
        <MobileCard
            flexDirection='column'
            position='relative'
            id='deep'
            scrollSnapAlign='center'
        >
            <MobileBg2 className={styles.home2} />
            <Fade up>
                <img
                    src={liquidityImage}
                    alt='concentrated and ambient liquidity'
                    width='260px'
                />
                <Text
                    tabIndex={0}
                    style={{ fontSize: '20px', lineHeight: '30px' }}
                >
                    Deep, Diversified Liquidity
                </Text>
                <Text color='text2' fontWeight='100' tabIndex={0}>
                    Ambient is built for diversified, sustainable liquidity that
                    fixes the broken LP economics of AMMs. It is also the only
                    DEX to support concentrated (‘V3’), ambient (‘V2’) and
                    knock-out liquidity in the same liquidity pool.
                </Text>
            </Fade>
        </MobileCard>
    );

    const fourthRow = (
        <MobileCard
            flexDirection='column'
            position='relative'
            id='limitorders'
            scrollSnapAlign='center'
        >
            <MobileBg3 className={styles.home3} />
            <Fade up>
                <img
                    src={orderImage}
                    alt='range and limit orders'
                    width='200px'
                />

                <Text
                    style={{ fontSize: '20px', lineHeight: '30px' }}
                    tabIndex={0}
                >
                    Bridge the Gap Between Trading and LP’ing
                </Text>
                <Text tabIndex={0} color='text2' fontWeight='100'>
                    Make your LP position a trading position – and vice versa –
                    using our range and limit orders.
                </Text>
                <Text tabIndex={0} color='text2' fontWeight='100'>
                    Ambient combines liquidity in a single pool, allowing for
                    greater rewards for liquidity providers, and less impact for
                    traders.
                </Text>
            </Fade>
        </MobileCard>
    );

    const fifthRow = (
        <MobileCard
            flexDirection='column'
            position='relative'
            id='beeterthandex'
            scrollSnapAlign='center'
        >
            <MobileBg4 className={styles.home4} />
            <Fade up>
                <Text
                    style={{ fontSize: '20px', lineHeight: '30px' }}
                    tabIndex={0}
                >
                    Better than CEX
                </Text>
                <Text tabIndex={0} color='text2' fontWeight='100'>
                    Built for traders and market makers of all kinds, Ambient
                    introduces novel DeFi-native features and an array of
                    quality-of-life improvements allowing for a best-in-class
                    user experience.
                </Text>
            </Fade>
        </MobileCard>
    );

    const investorsSections = (
        <MobileCard
            flexDirection='column'
            position='relative'
            id='investors'
            scrollSnapAlign='center'
            style={{ paddingTop: '56px' }}
        >
            <Fade up>
                <Text
                    color='text1'
                    fontWeight='400'
                    fontSize='header1'
                    align='center'
                >
                    Investors
                </Text>
                <Investors />
            </Fade>
        </MobileCard>
    );

    const footerSection = (
        <MobileCard
            flexDirection='column'
            fullWidth
            fullHeight
            scrollSnapAlign='center'
            background='dark1'
            id='footer'
        >
            <div className={styles.bg_footer} />
            <Fade up>
                <Footer />
            </Fade>
        </MobileCard>
    );

    return (
        <MobileMainContainer isIPhone={isIPhone} id='MainContainer'>
            {heroSection}
            {statsSection}
            {secondRow}
            {thirdRow}
            {fourthRow}
            {fifthRow}
            {investorsSections}
            {footerSection}
        </MobileMainContainer>
    );
}
