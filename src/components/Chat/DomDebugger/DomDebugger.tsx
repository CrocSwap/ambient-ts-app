import { useEffect, useState } from 'react';
import { getLS } from '../ChatUtils';
import styles from './DomDebugger.module.css';
import { clearDomDebug } from './DomDebuggerUtils';
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function DomDebugger() {
    const [debugEnabled, setDebugEnabled] = useState(false);
    useEffect(() => {
        const lsVal = getLS('debugEnabled');
        if (lsVal) {
            setDebugEnabled(window.location.href.indexOf('localhost:') >= 0);
        }
    }, []);

    return (
        <>
            {debugEnabled && (
                <div
                    id='dom-debugger'
                    className={
                        styles.dom_debugger_wrapper + '  ' + styles.active
                    }
                >
                    {' '}
                    <div
                        className={styles.dom_debug_clear}
                        onClick={clearDomDebug}
                    >
                        clear
                    </div>
                    <div className={styles.dom_debug_nodes_wrapper}></div>
                </div>
            )}
        </>
    );
}
