import { RootState } from '../../utils/state/store';
import { useSelector, useDispatch } from 'react-redux';
import { decrement, increment } from '../../utils/state/counterSlice';

export default function TestPage() {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <main>
            <div>
                <button aria-label='Increment value' onClick={() => dispatch(increment())}>
                    Increment
                </button>
                <span>{count}</span>
                <button aria-label='Decrement value' onClick={() => dispatch(decrement())}>
                    Decrement
                </button>
            </div>
        </main>
    );
}
