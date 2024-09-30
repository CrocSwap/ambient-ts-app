import React, { useState, useEffect } from 'react';
import styles from './Animations.module.css';
import useMediaQuery from '../../../../utils/hooks/useMediaQuery';
export default function TerminalAnimation() {
    const [input, setInput] = useState<string>('');
    const [output, setOutput] = useState<string[]>([]);
    const [showCursor, setShowCursor] = useState<boolean>(true);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const command = 'futa';
    const showMobileVersion = useMediaQuery('(max-width: 768px)');

    const outputLinesMobile = [
        ' ',
        ' ',
        ' ',
        '#######  ###  ##   ######   ######  ',
        '#######   ##  ##   ######  #######  ',
        '##   #   ###  ##   # ## #  ###  ##  ',
        '####     ##   ##     ##    ##   ##  ',
        '##       ##   ##     ##    ## ####  ',
        '##       ### ###     ##    ##   ##  ',
        '##        ######     ##     ##  ##  ',
        '                                    ',
        '                                 ',
        '                                ',
        'Starting program initialization...',
        'Loading base network configuration...',
        'Connecting to Ethereum Virtual Machine (EVM)...',
        'EVM connection established.',
        'Compiling Solidity smart contracts...',
        'Solidity version 0.8.6 detected.',
        'Contract compilation in progress...',
        'DELAY',
        ' ',
        'Contract Futa.sol compiled successfully.',
        'Contract FutaFactory.sol compiled successfully.',
        'Deploying contracts to the network...',
        'DELAY',
        'Futa contract deployed at address:',
        '0x1234567890abcdef1234567890abcdef12345678',
        'FutaFactory contract deployed at address:',
        '0xabcdef1234567890abcdef1234567890abcdef12',
        'Initializing contract instances...',
        'Contract instances initialized.',
        'Performing initial setup and configuration...',
        'Setting up Futa with initial parameters...',
        'Set UniqueTicker true',
        'Set LockedLiquidity true',
        'Set Ruggable false',
        'DELAY',
        ' ',
        'Futa setup complete.',
        'Initializing FutaFactory contract',
        ' with total supply...',
        'Total supply set to 69000000000 tokens.',
        'DELAY',
        ' ',
        'FutaFactory contract initialization complete.',
        'Starting main program execution...',
        'Executing Futa main function...',
        'DELAY',
        ' ',
        'Main function executed successfully.',
        'Token contract transfer function test...',
        'Running memes as public goods...',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
    ];

    const outputLinesDesktop = [
        ' ',
        ' ',
        ' ',
        '000000000000000000000000     0                   0     0000000000000000000000         00            ',
        '00000000000000000000000     00                  00   0000000000000000000000         00000           ',
        '0000                      0000                0000             0000                00000            ',
        '0000                      0000                0000             0000               00000   0         ',
        '0000                      0000                0000             0000              00000   000        ',
        '000000000000000000        0000                0000             0000            000000   000000      ',
        '0000000000000000          00000               0000             0000           00000      00000      ',
        '0000                       0000              00000             0000          00000         00000    ',
        '0000                       000000           00000              0000         00000           00000   ',
        '0000                        0000000       000000               0000        00000             00000  ',
        '0000                          00000000000000000                0000      000000               00000 ',
        '0000                             00000000000                   0000     00000                  00000',
        ' ',
        ' ',
        'Starting program initialization...',
        'Loading base network configuration...',
        'Connecting to Ethereum Virtual Machine (EVM)...',
        'EVM connection established.',
        'Compiling Solidity smart contracts...',
        'Solidity version 0.8.6 detected.',
        'Contract compilation in progress...',
        'DELAY',
        ' ',
        'Contract Futa.sol compiled successfully.',
        'Contract FutaFactory.sol compiled successfully.',
        'Deploying contracts to the network...',
        'DELAY',
        'Futa contract deployed at address 0x1234567890abcdef1234567890abcdef12345678',
        'FutaFactory contract deployed at address 0xabcdef1234567890abcdef1234567890abcdef12',
        'Initializing contract instances...',
        'Contract instances initialized.',
        'Performing initial setup and configuration...',
        'Setting up Futa with initial parameters...',
        'Set UniqueTicker true',
        'Set LockedLiquidity true',
        'Set Ruggable false',
        'DELAY',
        ' ',
        'Futa setup complete.',
        'Initializing FutaFactory contract with total supply...',
        'Total supply set to 69000000000 tokens.',
        'DELAY',
        ' ',
        'FutaFactory contract initialization complete.',
        'Starting main program execution...',
        'Executing Futa main function...',
        'DELAY',
        ' ',
        'Main function executed successfully.',
        'Token contract transfer function test...',
        'Running memes as public goods...',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
        ' ',
    ];

    const outputLines = showMobileVersion
        ? outputLinesMobile
        : outputLinesDesktop;

    const typingSpeed = 100; // Speed in milliseconds for typing the command
    const lineSpeed = 20; // Speed in milliseconds for displaying each line
    const typingDelay = 400; // Delay in milliseconds before typing starts
    const lineDelay = 800; // Special delay in milliseconds
    const endDelay = 3500; // Delay before starting the flash and disappear animations
    const X = 20; // Number of last frames to display

    useEffect(() => {
        let inputTimer: NodeJS.Timeout;

        const startTyping = () => {
            if (input.length < command.length) {
                inputTimer = setTimeout(() => {
                    setInput(command.slice(0, input.length + 1));
                    startTyping();
                }, typingSpeed);
            } else {
                setShowCursor(false);
                const outputTimers: NodeJS.Timeout[] = [];
                let delay = 0;

                outputLines.forEach((line, index) => {
                    if (line === 'DELAY') {
                        delay += lineDelay;
                    } else {
                        outputTimers.push(
                            setTimeout(
                                () => {
                                    setOutput((prevOutput) => {
                                        const newOutput = [...prevOutput, line];
                                        return newOutput.slice(-X);
                                    });
                                    if (index === outputLines.length - 1) {
                                        setTimeout(() => {
                                            setIsFinished(true);
                                        }, endDelay);
                                    }
                                },
                                lineSpeed * (index + 1) + delay,
                            ),
                        );
                    }
                });

                return () => outputTimers.forEach(clearTimeout);
            }
        };

        const startTypingTimer = setTimeout(startTyping, typingDelay);

        return () => {
            clearTimeout(startTypingTimer);
            clearTimeout(inputTimer);
        };
    }, [input, command]);

    const terminalStyle: React.CSSProperties = {
        color: '#62EBF1', // Change the text color to #62EBF1
        fontFamily: 'Roboto Mono',
        padding: '70px 70px 70px 100px',
        borderRadius: '5px',
        width: '100%', // Set width to 100%
        height: 'calc(100vh - 56px)',
        animation: isFinished
            ? 'flash 1s forwards, disappear 0.5s 1s forwards'
            : 'none',
    };

    const promptStyle: React.CSSProperties = {
        marginBottom: '10px',
    };

    const usernameStyle: React.CSSProperties = {
        color: '#62EBF1', // Change the username color to #62EBF1
    };

    const tildeStyle: React.CSSProperties = {
        color: '#29585D', // Change the tilde color to #29585D
    };

    const outputStyle: React.CSSProperties = {
        marginTop: '10px',
        whiteSpace: 'pre', // Ensure whitespace is preserved
    };

    const fontSizeStyle: React.CSSProperties = {
        ['--font-size-prompt' as string]: '24px', // Set prompt font size to 24px
        ['--font-size-output' as string]: '20px', // Set output font size to 20px
    };

    const cursorStyle: React.CSSProperties = {
        display: 'inline-block',
        width: '10px',
        backgroundColor: '#62EBF1', // Change the cursor color to match text
        animation: 'blink 0.7s step-end infinite',
    };

    return (
        <div
            style={{ ...terminalStyle, ...fontSizeStyle }}
            className={styles.terminalContainer}
        >
            <div
                style={{ ...promptStyle, fontSize: 'var(--font-size-prompt)' }}
            >
                <span style={usernameStyle}>anon@on-chain:</span>
                <span style={tildeStyle}>~</span>$ <span>{input}</span>
                {showCursor && <span style={cursorStyle}>&nbsp;</span>}
            </div>
            <div
                style={{ ...outputStyle, fontSize: 'var(--font-size-output)' }}
                className={styles.output}
            >
                {output.map((line, index) => (
                    <div key={index}>{line}</div>
                ))}
            </div>
        </div>
    );
}

// Add the CSS for the animations
const styleSheet = document.styleSheets[0];
const keyframesBlink = `@keyframes blink {
     from, to { background-color: #E1EEEE; }
     50% { background-color: transparent; }
   }`;
const keyframesFlash = `@keyframes flash {
     0%, 10%, 40%, 50%, 65%, 85% { opacity: 1; }
     5%, 30%, 45%, 55%, 75%, 90% { opacity: 0; }
   }`;
const keyframesDisappear = `@keyframes disappear {
     to { opacity: 0; }
   }`;

styleSheet.insertRule(keyframesBlink, styleSheet.cssRules.length);
styleSheet.insertRule(keyframesFlash, styleSheet.cssRules.length);
styleSheet.insertRule(keyframesDisappear, styleSheet.cssRules.length);
