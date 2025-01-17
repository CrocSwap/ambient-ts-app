import React from 'react';

const GlobalErrorFallback: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>Something went wrong</h1>
            <p>
                We encountered an unexpected error. Please try refreshing the
                page.
            </p>
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
