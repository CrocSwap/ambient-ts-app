import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { FlexContainer, Text } from '../../../styled/Common';
import { StyledContainerProps } from '../../../styled/Common/Container';
import { textColors } from '../../../styled/Common/Types';

export default function FormFooter(props: {
    type: 'explicit' | 'component' | 'map';
}) {
    const [selected, setSelected] = useState(0);

    // Pros: Easy to read, easy to understand
    // Cons: Lots of code, lots of repetition
    const ExplicitFooter = (
        <>
            <FlexContainer
                height='56px'
                width='300px'
                outline='accent1'
                alignItems='center'
                rounded
                cursor='pointer'
                background={selected === 0 ? 'title-gradient' : undefined}
                color={selected === 0 ? 'text3' : undefined}
                onClick={() => setSelected(0)}
            >
                <Text margin='auto'>Item A</Text>
            </FlexContainer>
            <FlexContainer
                height='56px'
                width='300px'
                outline='accent2'
                alignItems='center'
                rounded
                cursor='pointer'
                background={selected === 1 ? 'title-gradient' : undefined}
                color={selected === 1 ? 'text3' : undefined}
                onClick={() => setSelected(1)}
            >
                <Text margin='auto'>Item B</Text>
            </FlexContainer>
            <FlexContainer
                height='56px'
                width='300px'
                outline='accent3'
                alignItems='center'
                rounded
                cursor='pointer'
                background={selected === 2 ? 'title-gradient' : undefined}
                color={selected === 2 ? 'text3' : undefined}
                onClick={() => setSelected(2)}
            >
                <Text margin='auto'>Item C</Text>
            </FlexContainer>
            <FlexContainer
                height='56px'
                width='300px'
                outline='accent4'
                alignItems='center'
                rounded
                cursor='pointer'
                background={selected === 3 ? 'title-gradient' : undefined}
                color={selected === 3 ? 'text3' : undefined}
                onClick={() => setSelected(3)}
            >
                <Text margin='auto'>Item D</Text>
            </FlexContainer>
        </>
    );

    // Pros: Less code, less repetition
    // Cons: Less flexible if you want to add unique info

    const colors: textColors[] = ['accent1', 'accent2', 'accent3', 'accent4'];
    const MapFooter = colors.map((color, i) => {
        return (
            <FlexContainer
                key={color}
                height='56px'
                width='300px'
                outline={color}
                alignItems='center'
                rounded
                cursor='pointer'
                background={selected === i ? 'title-gradient' : undefined}
                color={selected === i ? 'text3' : undefined}
                onClick={() => setSelected(i)}
            >
                <Text margin='auto'>Item</Text>
            </FlexContainer>
        );
    });

    // Pros: Less code, less repetition, more flexible
    // Cons: More abstraction, harder to understand

    interface ExtendedContainerProps extends StyledContainerProps {
        active?: boolean;
    }
    const FooterContainer = styled(FlexContainer)<ExtendedContainerProps>`
        height: 56px;
        width: 300px;
        align-items: center;
        border-radius: var(--border-radius);
        cursor: pointer;
        ${({ active }) => {
            if (active) {
                return `
                    background: var(--title-gradient);
                    color: var(--text3);
                `;
            }
        }}
    `;

    const ComponentFooter = (
        <>
            <FooterContainer
                outline='accent1'
                active={selected === 0}
                onClick={() => setSelected(0)}
            >
                <Text margin='auto'>Item A</Text>
            </FooterContainer>
            <FooterContainer
                outline='accent2'
                active={selected === 1}
                onClick={() => setSelected(1)}
            >
                <Text margin='auto'>Item B</Text>
            </FooterContainer>
            <FooterContainer
                outline='accent3'
                active={selected === 2}
                onClick={() => setSelected(2)}
            >
                <Text margin='auto'>Item C</Text>
            </FooterContainer>
            <FooterContainer
                outline='accent4'
                active={selected === 3}
                onClick={() => setSelected(3)}
            >
                <Text margin='auto'>Item D</Text>
            </FooterContainer>
        </>
    );

    const Footer = useMemo(() => {
        switch (props.type) {
            case 'explicit':
                return ExplicitFooter;
            case 'component':
                return ComponentFooter;
            case 'map':
                return MapFooter;
            default:
                return null;
        }
    }, [props.type, selected]);
    return (
        <FlexContainer
            colSpan='2'
            alignItems='center'
            flexDirection='column'
            gap={8}
        >
            {Footer}
        </FlexContainer>
    );
}
