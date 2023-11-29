import { ContainerProps, ContainerStyles } from './Container';
import { css } from 'styled-components/macro';

export interface BreakpointProps {
    xs?: ContainerProps;
    sm?: ContainerProps;
    md?: ContainerProps;
    lg?: ContainerProps;
    xl?: ContainerProps;
    xxl?: ContainerProps;
}

const breakpoints = ['500px', '640px', '768px', '1024px', '1280px', '1536px'];
export const Breakpoint = (props: BreakpointProps) => {
    const { xs, sm, md, lg, xl, xxl } = props;
    const breakpointProps = [xs, sm, md, lg, xl, xxl]; // These map by order 1:1
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
