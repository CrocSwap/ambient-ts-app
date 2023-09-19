import { ButtonBase } from './Form.styles';

interface propsIF {
    disabled?: boolean;
    title: string;
    action: () => void;
    flat?: boolean;
    customAriaLabel?: string;
    thin?: boolean;
    black?: boolean;
}

export default function Button(props: propsIF) {
    const {
        disabled,
        action,
        title,
        flat,
        customAriaLabel,

        thin,
    } = props;

    const ariaLabelToDisplay = disabled
        ? `Button is disabled. ${title}`
        : customAriaLabel
        ? customAriaLabel
        : '';
    return (
        <ButtonBase
            style={thin ? { height: '28px', width: '156px', padding: 0 } : {}}
            onClick={action}
            disabled={disabled}
            aria-label={ariaLabelToDisplay}
            tabIndex={0}
            flat={!!flat}
            width={thin ? '156px' : '100%'}
            height={thin ? '28px' : 'auto'}
        >
            {title}
        </ButtonBase>
    );
}
