import blocktower from '../../../assets/images/investors/blocktower.svg';
import circle from '../../../assets/images/investors/circle.svg';
import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
import jane from '../../../assets/images/investors/jane.svg';
import motivate from '../../../assets/images/investors/motivate.svg';
import naval from '../../../assets/images/investors/naval.svg';
import PositiveSum from '../../../assets/images/investors/positivesum.svg';
import quantstamp from '../../../assets/images/investors/quantstamp.svg';
import susa from '../../../assets/images/investors/susa.svg';
import tensai from '../../../assets/images/investors/tensai.png';
import yunt from '../../../assets/images/investors/yunt.svg';

import { FlexContainer, GridContainer, Text } from '../../../styled/Common';
import {
    InvestorRow,
    InvestorsContainer,
    InvestorsContent,
    MobileContainer,
} from '../../../styled/Components/Home';
import { useMediaQuery } from '../../../utils/hooks/useMediaQuery';
export default function Investors() {
    const row1 = (
        <InvestorRow row={1}>
            <img src={blocktower} alt='block tower' loading='lazy' />
        </InvestorRow>
    );

    const row2 = (
        <InvestorRow row={2}>
            <img src={jane} alt='jane street' loading='lazy' />
            <img src={circle} alt='circle ' loading='lazy' />
        </InvestorRow>
    );

    const row3 = (
        <InvestorRow row={3}>
            <img src={tensai} alt='tensai capital' loading='lazy' />
            <img src={naval} alt='naval ravikant' loading='lazy' />
        </InvestorRow>
    );

    const row4 = (
        <InvestorRow row={4}>
            <img src={yunt} alt='yunt capital' width='200px' loading='lazy' />
            <img src={susa} alt='susa ' width='50px' loading='lazy' />
            <img
                src={quantstamp}
                alt='quantstamp '
                width='200px'
                loading='lazy'
            />
            <img
                src={hypotenuse}
                alt='hypotenuse '
                width='200px'
                loading='lazy'
            />
        </InvestorRow>
    );
    const row5 = (
        <InvestorRow row={5}>
            {[
                'Julian Koh',
                'llllvvuu',
                'Dogetoshi',
                'afkbyte',
                'Jai Prasad',
                'Don Ho',
            ].map((name, i) => (
                <Text
                    color='text1'
                    fontSize='header2'
                    font='font-family'
                    key={i}
                >
                    {name}
                </Text>
            ))}
        </InvestorRow>
    );
    const row6 = (
        <InvestorRow row={6} style={{ height: '62px' }}>
            <Text fontSize='header1' fontWeight='400'>
                Pre-Seed
            </Text>
        </InvestorRow>
    );
    const row7 = (
        <InvestorRow row={7}>
            <img src={PositiveSum} alt='positivie sum' loading='lazy' />
            <img src={motivate} alt='motivate ' loading='lazy' />
        </InvestorRow>
    );
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const preSeedMobile = (
        <GridContainer gap={10} style={{ justifyItems: 'center' }}>
            <GridContainer gap={10} style={{ justifyItems: 'center' }}>
                <Text fontSize='header1'>Pre-Seed</Text>
            </GridContainer>
            <GridContainer numCols={2} gap={10}>
                <img src={PositiveSum} alt='positive sum' loading='lazy' />
                <img src={motivate} alt='motivate' loading='lazy' />
            </GridContainer>
        </GridContainer>
    );

    const mobileVersion = (
        <>
            <MobileContainer id='MobileContainer' gap={10} padding='16px 32px'>
                <FlexContainer
                    id='MobileContent'
                    justifyContent='center'
                    alignItems='center'
                    gap={8}
                    wrap
                >
                    <img
                        src={blocktower}
                        alt='block tower'
                        width='180px'
                        loading='lazy'
                    />
                    <img
                        src={jane}
                        alt='jane street'
                        width='180px'
                        loading='lazy'
                    />
                    <img
                        src={circle}
                        alt='circle'
                        width='180px'
                        loading='lazy'
                    />
                    <img
                        src={tensai}
                        alt='tensai capital'
                        width='180px'
                        loading='lazy'
                    />
                    <img
                        src={naval}
                        alt='naval ravikant'
                        width='180px'
                        loading='lazy'
                    />
                    <img
                        src={yunt}
                        alt='yunt capital'
                        width='200px'
                        loading='lazy'
                    />
                    <img src={susa} alt='susa' width='50px' loading='lazy' />
                    <img
                        src={quantstamp}
                        alt='quantstamp'
                        width='200px'
                        loading='lazy'
                    />
                    <img
                        src={hypotenuse}
                        alt='hypotenuse'
                        width='200px'
                        loading='lazy'
                    />
                    <span>Julian Koh</span>
                    <span>llllvvuu</span>
                    <span>Dogetoshi</span>
                    <span>afkbyte</span>
                    <span>Jai Prasad</span>
                    <span>Don Ho</span>
                </FlexContainer>
            </MobileContainer>
            {preSeedMobile}
        </>
    );
    if (showMobileVersion) return mobileVersion;

    return (
        <InvestorsContainer>
            <Text
                color='text1'
                fontWeight='400'
                fontSize='header1'
                style={{ textAlign: 'center' }}
            >
                Our Investors
            </Text>
            <InvestorsContent
                flexDirection='column'
                margin='16px auto 0 auto'
                gap={16}
            >
                {row1}
                {row2}
                {row3}
                {row4}
                {row5}
                {row6}
                {row7}
            </InvestorsContent>
        </InvestorsContainer>
    );
}
