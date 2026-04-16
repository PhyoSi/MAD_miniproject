import { render, screen } from '@testing-library/react-native';

import EmptyState from '@/src/components/EmptyState';

describe('YourComponent (EmptyState)', () => {
  it('renders title and description text', () => {
    render(<EmptyState title="No sessions yet" description="Log your first practice session." />);

    expect(screen.getByText('No sessions yet')).toBeTruthy();
    expect(screen.getByText('Log your first practice session.')).toBeTruthy();
  });
});
