import { RootState } from '../../utils/state/store';
import { useSelector, useDispatch } from 'react-redux';
import { decrement, increment } from '../../utils/state/counterSlice';

//  Important!  This file currently has example code for how to interact
//  ... with data from RTK using TypeScript syntax.  Please use it for
//  ... reference.  Anyone who needs this file can delete it and this
//  ... this note when needed.

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
