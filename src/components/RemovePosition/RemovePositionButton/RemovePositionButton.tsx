import Button from '../../Global/Button/Button';

export default function RemovePositionButton() {
    return (
        <div>
            <Button title='Remove Liquidity' action={() => console.log('position removed')} />{' '}
        </div>
    );
}
