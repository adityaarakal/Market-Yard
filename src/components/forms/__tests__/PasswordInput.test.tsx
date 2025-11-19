/**
 * PasswordInput Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PasswordInput from '../PasswordInput';

describe('PasswordInput', () => {
  it('renders with label', () => {
    render(<PasswordInput label="Password" value="" onChange={() => {}} id="password" />);
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('hides password by default', () => {
    render(<PasswordInput value="test123" onChange={() => {}} label="Password" id="password" />);
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('shows password when toggle is clicked', async () => {
    render(<PasswordInput value="test123" onChange={() => {}} label="Password" id="password" />);
    const toggleButton = screen.getByRole('button');
    await userEvent.click(toggleButton);
    
    const input = screen.getByLabelText('Password') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('calls onChange when value changes', async () => {
    const handleChange = jest.fn();
    render(<PasswordInput value="" onChange={handleChange} label="Password" id="password" />);
    
    const input = screen.getByLabelText('Password');
    await userEvent.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <PasswordInput
        value=""
        onChange={() => {}}
        error="Password is required"
        id="password"
      />
    );
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows strength indicator when enabled', () => {
    render(
      <PasswordInput
        value="weak"
        onChange={() => {}}
        showStrengthIndicator={true}
        id="password"
      />
    );
    // Strength indicator should be visible
    expect(screen.getByText(/weak|medium|strong/i)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<PasswordInput value="" onChange={() => {}} disabled label="Password" id="password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toBeDisabled();
  });

  it('shows helper text when provided', () => {
    render(
      <PasswordInput
        value=""
        onChange={() => {}}
        helperText="Must be at least 8 characters"
        id="password"
      />
    );
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });
});

