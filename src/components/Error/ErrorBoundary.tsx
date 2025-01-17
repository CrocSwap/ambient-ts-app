import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
    fallback: ReactNode; // Component or content to display on error
    children: ReactNode; // Regular children
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Render the fallback UI
            return this.props.fallback;
        }

        // Render children if no error
        return this.props.children;
    }
}

export default ErrorBoundary;
