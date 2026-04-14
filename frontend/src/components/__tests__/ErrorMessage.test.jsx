import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import ErrorMessage from '../ErrorMessage.jsx';

describe('ErrorMessage', () => {
    it('renders the provided error text', () => {
        render(<ErrorMessage error="Something went wrong" />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
});
