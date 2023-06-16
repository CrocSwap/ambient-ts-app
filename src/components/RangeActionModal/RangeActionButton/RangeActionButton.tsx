import Button from '../../Global/Button/Button';

interface RangeActionButtonIF {
    onClick: () => void;
    title: string;
    disabled?: boolean;
}

export default function RangeActionButton(props: RangeActionButtonIF) {
    const { onClick, title } = props;

    return (
        <div>
            <Button
                title={!props.disabled ? title : '...'}
                disabled={props.disabled}
                action={onClick}
                flat
            />
        </div>
    );
}
