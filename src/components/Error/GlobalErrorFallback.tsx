import React from 'react';

interface GlobalErrorFallbackProps {
    error: Error | null;
}

const GlobalErrorFallback: React.FC<GlobalErrorFallbackProps> = ({ error }) => {
    const handleCopyError = () => {
        if (error) {
            navigator.clipboard.writeText(error.stack || error.message).then(
                () => {
                    alert('Error details copied to clipboard!');
                },
                () => {
                    alert('Failed to copy error details.');
                },
            );
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Something went wrong</h1>
            {error && <pre style={{ color: 'red' }}>{error.message}</pre>}
            <button
                onClick={handleCopyError}
                style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer',
                }}
            >
                Copy Error Details
            </button>
            <button
                onClick={() => window.location.reload()}
                style={{
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                }}
            >
                Refresh Page
            </button>
        </div>
    );
};

export default GlobalErrorFallback;
