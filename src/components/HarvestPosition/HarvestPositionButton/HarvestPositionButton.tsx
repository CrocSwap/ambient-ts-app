import Button from '../../Global/Button/Button';

interface IHarvestPositionButtonProps {
    harvestFn: () => void;
    title: string;
    disabled?: boolean;
}

export default function HarvestPositionButton(
    props: IHarvestPositionButtonProps,
) {
    const { harvestFn, title } = props;

    return (
        <div>
            <Button
                title={title}
                disabled={props.disabled}
                action={harvestFn}
                flat
            />
        </div>
    );
}
