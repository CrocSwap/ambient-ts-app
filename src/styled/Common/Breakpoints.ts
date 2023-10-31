import { ContainerProps, ContainerStyles } from './Container';
import { css } from 'styled-components/macro';

export interface BreakpointProps {
    sm?: ContainerProps;
    md?: ContainerProps;
    lg?: ContainerProps;
    xl?: ContainerProps;
    xxl?: ContainerProps;
}

export const Breakpoint = (props: BreakpointProps) => {
    const { sm, md, lg, xl, xxl } = props;
    const breakpoints = ['640px', '768px', '1024px', '1280px', '1536px'];
    const breakpointProps = [sm, md, lg, xl, xxl]; // These map by order 1:1
    return css`
        ${breakpointProps.map((breakpointStyles, i) => {
            if (breakpointStyles)
                return css`
                    @media (min-width: ${breakpoints[i]}) {
                        ${ContainerStyles(breakpointStyles)}
                    }
                `;
        })}
    `;
};
