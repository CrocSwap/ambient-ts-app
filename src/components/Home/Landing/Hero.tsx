import { useContext, useMemo } from 'react';
import { heroItem } from '../../../assets/branding/types';
import { BrandContext } from '../../../contexts/BrandContext';
import { FlexContainer, Text } from '../../../styled/Common';
import { HeroContainer } from '../../../styled/Components/Home';
import useMediaQuery from '../../../utils/hooks/useMediaQuery';
import styles from './BackgroundImages.module.css';
import TradeNowButton from './TradeNowButton/TradeNowButton';

export default function Hero() {
    const smallScreen: boolean = useMediaQuery('(max-width: 1200px)');
    const { platformName, cobrandingLogo } = useContext(BrandContext);

    const hero: heroItem[] = cobrandingLogo
        ? [
              { content: 'ambient', processAs: 'text' },
              { content: 'x', processAs: 'separator' },
              { content: cobrandingLogo, processAs: 'image' },
          ]
        : [{ content: 'ambient', processAs: 'text' }];

    // recognized slugs for background image CSS classes
    type cssSlugs = 'purple_waves';
    // slug to specify the desired background image
    const cssSlug = useMemo<cssSlugs>(() => {
        // declare an output variable
        let slug: cssSlugs;
        // router to map a background image from deployment config
        switch (platformName) {
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
                        fontWeight='400'
                        fontSize='header2'
                        color='text1'
                        align='center'
                        style={{
                            marginTop: '20px',
                            marginLeft: '15px',
                            marginRight: '15px',
                            fontSize: '70px',
                            padding: '0 20px',
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
