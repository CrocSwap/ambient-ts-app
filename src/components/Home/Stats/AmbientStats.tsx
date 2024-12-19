import { useContext } from 'react';
import { Fade } from 'react-reveal';
import { ChainDataContext } from '../../../contexts';
import {
    HomeContent,
    HomeTitle,
    StatCardContainer,
    StatContainer,
    StatValue,
} from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';

interface StatCardProps {
    title: string;
    value: string | number;
}

function StatCard(props: StatCardProps) {
    const { title, value } = props;

    const ariaDescription = `${title} is ${value}`;
    return (
        <StatCardContainer
            flexDirection='column'
            justifyContent='center'
            gap={8}
            alignItems='center'
            background='dark2'
            aria-label={ariaDescription}
            tabIndex={0}
        >
            <HomeTitle style={{ fontWeight: '100' }}>{title}</HomeTitle>
            <StatValue
                fontWeight='300'
                fontSize='header2'
                color='text1'
                font='mono'
            >
                {value}
            </StatValue>
        </StatCardContainer>
    );
}

export default function Stats() {
    const { totalTvlString, totalVolumeString, totalFeesString } =
        useContext(ChainDataContext);

    const statCardData = [
        {
            title: 'Total Value Locked',
            value: totalTvlString ? totalTvlString : '…',
        },
        {
            title: 'Total Volume',
            value: totalVolumeString ? totalVolumeString : '…',
        },
        {
            title: 'Total Fees',
            value: totalFeesString ? totalFeesString : '…',
        },
    ];
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const statsTitle = 'Ambient Finance Stats';

    const mobileWrapper = (
        <Fade up>
            <HomeTitle aria-label={statsTitle} tabIndex={0}>
                {statsTitle}
            </HomeTitle>
            <HomeContent>
                {statCardData.map((card, idx) => (
                    <StatCard key={idx} title={card.title} value={card.value} />
                ))}
            </HomeContent>
        </Fade>
    );

    return (
        <StatContainer flexDirection='column' gap={16} padding='16px 0'>
            {showMobileVersion ? (
                mobileWrapper
            ) : (
                <>
                    <HomeTitle aria-label={statsTitle} tabIndex={0}>
                        {statsTitle}
                    </HomeTitle>
                    <HomeContent>
                        {statCardData.map((card, idx) => (
                            <StatCard
                                key={idx}
                                title={card.title}
                                value={card.value}
                            />
                        ))}
                    </HomeContent>
                </>
            )}
        </StatContainer>
    );
}
