import blocktower from '../../../assets/images/investors/blocktower.svg';
import jane from '../../../assets/images/investors/jane.svg';
import circle from '../../../assets/images/investors/circle.svg';
import tensai from '../../../assets/images/investors/tensai.png';
import naval from '../../../assets/images/investors/naval.svg';
import yunt from '../../../assets/images/investors/yunt.svg';
import susa from '../../../assets/images/investors/susa.svg';
import quantstamp from '../../../assets/images/investors/quantstamp.svg';
import hypotenuse from '../../../assets/images/investors/hypotenuse.svg';
import PositiveSum from '../../../assets/images/investors/positivesum.svg';
import motivate from '../../../assets/images/investors/motivate.svg';

import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import {
    InvestorsContainer,
    InvestorsContent,
    MobileContainer,
    InvestorRow,
} from '../../../styled/Components/Home';
import { FlexContainer, GridContainer, Text } from '../../../styled/Common';
export default function Investors() {
    const row1 = (
        <InvestorRow row={1}>
            <img src={blocktower} alt='block tower' />
        </InvestorRow>
    );

    const row2 = (
        <InvestorRow row={2}>
            <img src={jane} alt='jane street' />
            <img src={circle} alt='circle ' />
        </InvestorRow>
    );

    const row3 = (
        <InvestorRow row={3}>
            <img src={tensai} alt='tensai capital' />
            <img src={naval} alt='naval ravikant' />
        </InvestorRow>
    );

    const row4 = (
        <InvestorRow row={4}>
            <img src={yunt} alt='yunt capital' width='200px' />
            <img src={susa} alt='susa ' width='50px' />
            <img src={quantstamp} alt='quantstamp ' width='200px' />
            <img src={hypotenuse} alt='hypotenuse ' width='200px' />
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
            <img src={PositiveSum} alt='positivie sum' />
            <img src={motivate} alt='motivate ' />
        </InvestorRow>
    );
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const preSeedMobile = (
        <GridContainer gap={10} style={{ justifyItems: 'center' }}>
            <GridContainer gap={10} style={{ justifyItems: 'center' }}>
                <Text fontSize='header1'>Pre-Seed</Text>
            </GridContainer>
            <GridContainer numCols={2} gap={10}>
                <img src={PositiveSum} alt='positive sum' />
                <img src={motivate} alt='motivate' />
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
                    <img src={blocktower} alt='block tower' width='180px' />
                    <img src={jane} alt='jane street' width='180px' />
                    <img src={circle} alt='circle' width='180px' />
                    <img src={tensai} alt='tensai capital' width='180px' />
                    <img src={naval} alt='naval ravikant' width='180px' />
                    <img src={yunt} alt='yunt capital' width='200px' />
                    <img src={susa} alt='susa' width='50px' />
                    <img src={quantstamp} alt='quantstamp' width='200px' />
                    <img src={hypotenuse} alt='hypotenuse' width='200px' />
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
