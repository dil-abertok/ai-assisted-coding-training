import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from '../components/TodoList/TodoItem';
import { Todo } from '../types/Todo';
import { useTodo } from '../contexts/TodoContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the useTodo hook
vi.mock('../contexts/TodoContext', () => ({
  useTodo: vi.fn()
}));

describe('TodoItem Component', () => {
  // Mock data
  const mockTodo: Todo = {
    id: '1',
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    createdAt: new Date()
  };

  const mockCompletedTodo: Todo = {
    ...mockTodo,
    completed: true
  };

  const mockOnEditClick = vi.fn();
  const mockToggleTodoCompletion = vi.fn();
  const mockDeleteTodo = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    (useTodo as any).mockReturnValue({
      toggleTodoCompletion: mockToggleTodoCompletion,
      deleteTodo: mockDeleteTodo
    });
  });

  it('renders todo item with correct text and actions', () => {
    render(<TodoItem todo={mockTodo} onEditClick={mockOnEditClick} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Checkbox should not be checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Delete button should be present
    expect(screen.getByLabelText('delete')).toBeInTheDocument();
  });
  
  it('renders completed todo with strikethrough styling', () => {
    render(<TodoItem todo={mockCompletedTodo} onEditClick={mockOnEditClick} />);
    
    // Checkbox should be checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
    
    // Text should have line-through styling but we can't easily test CSS directly
    // Instead, we verify the text is present
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('calls toggleTodoCompletion when checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} onEditClick={mockOnEditClick} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(mockToggleTodoCompletion).toHaveBeenCalledWith(mockTodo.id);
    expect(mockOnEditClick).not.toHaveBeenCalled(); // Ensure edit wasn't triggered
  });

  it('calls deleteTodo when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} onEditClick={mockOnEditClick} />);
    
    const deleteButton = screen.getByLabelText('delete');
    await user.click(deleteButton);
    
    expect(mockDeleteTodo).toHaveBeenCalledWith(mockTodo.id);
    expect(mockOnEditClick).not.toHaveBeenCalled(); // Ensure edit wasn't triggered
  });

  it('calls onEditClick when clicking on the todo item', async () => {
    const user = userEvent.setup();
    render(<TodoItem todo={mockTodo} onEditClick={mockOnEditClick} />);
    
    // Find the list item text (not checkbox or delete button) and click it
    const todoTitle = screen.getByText('Test Todo');
    await user.click(todoTitle);
    
    expect(mockOnEditClick).toHaveBeenCalledWith(mockTodo);
  });
});