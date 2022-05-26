import Button from '../../Global/Button/Button';

export default function RemoveRangeButton() {
    return (
        <div>
            <Button title='Remove Liquidity' action={() => console.log('position removed')} />{' '}
        </div>
    );
}
