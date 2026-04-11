import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavbarBrand from '../../Navbar/NavbarBrand.jsx';

vi.mock('../../components/stylesheets/Navbar/NavbarBrand.css', () => ({}));

describe('NavbarBrand component', () => {
    it('renders the StudySync title', () => {
        render(<MemoryRouter><NavbarBrand /></MemoryRouter>);
        expect(screen.getByText('StudySync')).toBeInTheDocument();
    });

    it('links to the home page', () => {
        render(<MemoryRouter><NavbarBrand /></MemoryRouter>);
        expect(screen.getByText('StudySync').closest('a')).toHaveAttribute('href', '/');
    });

    it('applies the navbar-title class', () => {
        render(<MemoryRouter><NavbarBrand /></MemoryRouter>);
        expect(screen.getByText('StudySync').closest('a')).toHaveClass('navbar-title');
    });
});