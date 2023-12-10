import { useState } from 'react';
import styles from './DomDebugger.module.css';
/* eslint-disable @typescript-eslint/no-explicit-any */

interface propsIF {
    isActive?: boolean;
}

export default function DomDebugger(props: propsIF) {
    const [debugEnabled, setDebugEnabled] = useState(
        window.location.href.indexOf('localhost:') >= 0,
    );

    return (
        <>
            {debugEnabled && (
                <div
                    id='dom-debugger'
                    className={
                        styles.dom_debugger_wrapper + '  ' + styles.active
                    }
                ></div>
            )}
        </>
    );
}
