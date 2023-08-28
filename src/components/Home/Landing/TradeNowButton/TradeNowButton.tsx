import { FlexContainer } from '../../../../styled/Common';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
import { StyledLink, ButtonText } from './TradeNowButton.styles';

interface propsIF {
    inNav?: boolean;
}
const ContentContainer = ({ children, ...props }: any) => (
    <FlexContainer
        fullHeight
        fullWidth
        justifyContent='center'
        alignItems='center'
        rounded
        background='dark2'
        {...props}
    >
        {children}
    </FlexContainer>
);

export default function TradeNowButton(props: propsIF) {
    const { inNav } = props;
    const showMobileVersion = useMediaQuery('(max-width: 600px)');

    const mobileButton = (
        <StyledLink
            to='/trade'
            tabIndex={0}
            aria-label='Go to trade page button'
            inNav={inNav}
        >
            <ContentContainer>
                <ButtonText inNav={inNav}>Trade Now</ButtonText>
            </ContentContainer>
        </StyledLink>
    );
    if (showMobileVersion) return mobileButton;
    return (
        <StyledLink
            to='/trade/market'
            tabIndex={0}
            aria-label='Go to trade page button'
            inNav={inNav}
        >
            <ContentContainer>
                <ButtonText inNav={inNav}>Trade Now</ButtonText>
            </ContentContainer>
        </StyledLink>
    );
}
