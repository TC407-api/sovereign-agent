import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Home Page', () => {
  test('displays hello world', () => {
    render(<Home />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
