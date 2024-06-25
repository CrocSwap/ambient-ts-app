import { FlexContainer, Text } from '../../../styled/Common';
import TradeNowButton from './TradeNowButton/TradeNowButton';
import styles from './BackgroundImages.module.css';
import { HeroContainer } from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import { useContext, useMemo } from 'react';
import { BrandContext } from '../../../contexts/BrandContext';
import { heroItem } from '../../../assets/branding/types';
import { ChainDataContext } from '../../../contexts/ChainDataContext';

export default function Hero() {
    const smallScreen: boolean = useMediaQuery('(max-width: 1200px)');
    const { hero, platformName } = useContext(BrandContext);
    const { isActiveNetworkPlume } = useContext(ChainDataContext);

    // recognized slugs for background image CSS classes
    type cssSlugs = 'purple_waves' | 'stars' | 'clouds';
    // slug to specify the desired background image
    const cssSlug = useMemo<cssSlugs>(() => {
        // declare an output variable
        let slug: cssSlugs;
        // router to map a background image from deployment config
        switch (platformName) {
            case 'futa':
                slug = 'stars';
                break;
            case 'plumeSepolia' || isActiveNetworkPlume:
                slug = 'clouds';
                break;
            case 'ambient':
            default:
                slug = 'purple_waves';
                break;
        }
        // return output variable
        return slug;
    }, [platformName]);

    // fn to turn hero banner metadata into JSX for DOM
    function makeHeroJSX(h: heroItem): JSX.Element {
        // declare an output variable
        let jsxOutput: JSX.Element;
        // router to apply the correct JSX template
        switch (h.processAs) {
            // process content as raw text
            case 'text':
                jsxOutput = (
                    <p
                        className={styles.ambient_blast_logo}
                        style={{ fontSize: '110px' }}
                    >
                        {h.content}
                    </p>
                );
                break;
            // process content as an image
            case 'image':
                jsxOutput = (
                    <img
                        src={h.content}
                        alt=''
                        width='70px'
                        style={{
                            marginTop: '8px',
                            maxWidth: '60%',
                        }}
                    />
                );
                break;
            // process content as a separator character
            case 'separator':
                jsxOutput = (
                    <Text
                        fontWeight='200'
                        // fontSize='800px'
                        color='text1'
                        align='center'
                        style={{
                            marginTop: '20px',
                            marginLeft: '15px',
                            marginRight: '15px',
                            fontSize: '30px',
                        }}
                    >
                        {h.content}
                    </Text>
                );
                break;
        }
        // return output variable with processed JSX
        return jsxOutput;
    }

    return (
        <HeroContainer
            justifyContent='center'
            alignItems='center'
            rounded
            fullHeight
            fullWidth
            id='hero'
            className={styles[cssSlug]}
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
                    {hero.map((h: heroItem) => makeHeroJSX(h))}
                </FlexContainer>
                <TradeNowButton fieldId='trade_now_btn_in_hero' />
            </FlexContainer>
        </HeroContainer>
    );
}
