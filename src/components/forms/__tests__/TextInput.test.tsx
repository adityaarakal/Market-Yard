/**
 * TextInput Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextInput from '../TextInput';

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput label="Test Label" value="" onChange={() => {}} id="test-input" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('displays the value', () => {
    render(<TextInput value="Test Value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('calls onChange when value changes', async () => {
    const handleChange = jest.fn();
    
    render(<TextInput value="" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('shows error message when error prop is provided', () => {
    render(
      <TextInput
        value=""
        onChange={() => {}}
        error="This is an error"
      />
    );
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<TextInput value="" onChange={() => {}} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('shows helper text when provided', () => {
    render(
      <TextInput
        value=""
        onChange={() => {}}
        helperText="Helper text"
      />
    );
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });
});

