import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  PageLoadingSkeleton,
  DashboardSkeleton,
  AdminDashboardSkeleton,
  ProfileSkeleton,
  LoginSkeleton,
  CardsSkeleton,
  TableSkeleton,
  ActivitySkeleton,
  StatsSkeleton,
  DocumentCardsSkeleton,
} from '@/components/loading/PageLoadingSkeleton';

describe('PageLoadingSkeleton', () => {
  it('renders with loading spinner', () => {
    render(<PageLoadingSkeleton />);
    // The spinner has animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('has correct background class', () => {
    const { container } = render(<PageLoadingSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('bg-midnight');
  });

  it('is centered on screen', () => {
    const { container } = render(<PageLoadingSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});

describe('DashboardSkeleton', () => {
  it('renders with sidebar skeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    const sidebar = container.querySelector('aside');
    expect(sidebar).toBeInTheDocument();
  });

  it('renders stats row with 4 stat placeholders', () => {
    const { container } = render(<DashboardSkeleton />);
    const statsGrid = container.querySelector('.grid.grid-cols-2.lg\\:grid-cols-4');
    expect(statsGrid).toBeInTheDocument();
    // Each stat has a text-center class
    const stats = container.querySelectorAll('.grid.grid-cols-2.lg\\:grid-cols-4 > div');
    expect(stats.length).toBe(4);
  });

  it('renders activity items', () => {
    const { container } = render(<DashboardSkeleton />);
    // Activity column has lg:col-span-2
    const activityColumn = container.querySelector('.lg\\:col-span-2');
    expect(activityColumn).toBeInTheDocument();
  });

  it('has correct layout structure', () => {
    const { container } = render(<DashboardSkeleton />);
    const mainWrapper = container.firstChild as HTMLElement;
    expect(mainWrapper).toHaveClass('min-h-screen');
    expect(mainWrapper).toHaveClass('bg-midnight');
  });
});

describe('AdminDashboardSkeleton', () => {
  it('renders admin card', () => {
    const { container } = render(<AdminDashboardSkeleton />);
    // Admin card has backdrop-blur
    const card = container.querySelector('.backdrop-blur-md');
    expect(card).toBeInTheDocument();
  });

  it('renders stats grid with 4 items', () => {
    const { container } = render(<AdminDashboardSkeleton />);
    const statsGrid = container.querySelector('.grid.grid-cols-4');
    expect(statsGrid).toBeInTheDocument();
    const stats = container.querySelectorAll('.grid.grid-cols-4 > div, .grid.grid-cols-4 > *');
    // Skeletons inside stats grid
    expect(stats.length).toBeGreaterThanOrEqual(4);
  });

  it('renders table rows', () => {
    const { container } = render(<AdminDashboardSkeleton />);
    // Table skeleton has multiple rounded-lg skeletons
    const tableRows = container.querySelectorAll('.space-y-4 > div, .space-y-4 > *');
    expect(tableRows.length).toBeGreaterThan(0);
  });
});

describe('ProfileSkeleton', () => {
  it('renders avatar skeleton', () => {
    const { container } = render(<ProfileSkeleton />);
    // Avatar is a rounded-full skeleton
    const avatar = container.querySelector('.rounded-full');
    expect(avatar).toBeInTheDocument();
  });

  it('renders form field placeholders', () => {
    const { container } = render(<ProfileSkeleton />);
    // Form fields are in space-y-6
    const formFields = container.querySelector('.space-y-6');
    expect(formFields).toBeInTheDocument();
  });

  it('has centered layout', () => {
    const { container } = render(<ProfileSkeleton />);
    const card = container.querySelector('.max-w-2xl');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('mx-auto');
  });
});

describe('LoginSkeleton', () => {
  it('renders login card', () => {
    const { container } = render(<LoginSkeleton />);
    const card = container.querySelector('.max-w-md');
    expect(card).toBeInTheDocument();
  });

  it('renders icon placeholder', () => {
    const { container } = render(<LoginSkeleton />);
    // Icon placeholder is w-16 h-16
    const icon = container.querySelector('.w-16.h-16');
    expect(icon).toBeInTheDocument();
  });

  it('renders form input placeholders', () => {
    const { container } = render(<LoginSkeleton />);
    // Login has 2 form fields (email, password)
    const formSection = container.querySelector('.space-y-4');
    expect(formSection).toBeInTheDocument();
  });

  it('is centered on screen', () => {
    const { container } = render(<LoginSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
    expect(wrapper).toHaveClass('items-center');
    expect(wrapper).toHaveClass('justify-center');
  });
});

describe('CardsSkeleton', () => {
  it('renders default 3 cards', () => {
    const { container } = render(<CardsSkeleton />);
    const cards = container.querySelectorAll('.border.border-white\\/10.rounded-xl');
    expect(cards.length).toBe(3);
  });

  it('renders custom count of cards', () => {
    const { container } = render(<CardsSkeleton count={5} />);
    const cards = container.querySelectorAll('.border.border-white\\/10.rounded-xl');
    expect(cards.length).toBe(5);
  });

  it('has responsive grid layout', () => {
    const { container } = render(<CardsSkeleton />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('renders with count of 0', () => {
    const { container } = render(<CardsSkeleton count={0} />);
    const cards = container.querySelectorAll('.border.border-white\\/10.rounded-xl');
    expect(cards.length).toBe(0);
  });
});

describe('TableSkeleton', () => {
  it('renders default 5 rows', () => {
    const { container } = render(<TableSkeleton />);
    // Header + 5 rows (each row has a border class)
    const rows = container.querySelectorAll('.border.border-white\\/10');
    expect(rows.length).toBe(5);
  });

  it('renders custom number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} />);
    const dataRows = container.querySelectorAll('.border.border-white\\/10');
    expect(dataRows.length).toBe(3);
  });

  it('renders header row', () => {
    const { container } = render(<TableSkeleton />);
    const headerRow = container.querySelector('.bg-white\\/5');
    expect(headerRow).toBeInTheDocument();
  });

  it('has 5 columns per row', () => {
    const { container } = render(<TableSkeleton rows={1} />);
    const grid = container.querySelector('.grid-cols-5');
    expect(grid).toBeInTheDocument();
  });
});

describe('ActivitySkeleton', () => {
  it('renders default 5 activity items', () => {
    const { container } = render(<ActivitySkeleton />);
    const items = container.querySelectorAll('.flex.items-center.gap-4');
    expect(items.length).toBe(5);
  });

  it('renders custom count of items', () => {
    const { container } = render(<ActivitySkeleton count={3} />);
    const items = container.querySelectorAll('.flex.items-center.gap-4');
    expect(items.length).toBe(3);
  });

  it('each item has indicator dot', () => {
    const { container } = render(<ActivitySkeleton count={1} />);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });
});

describe('StatsSkeleton', () => {
  it('renders default 4 stat items', () => {
    const { container } = render(<StatsSkeleton />);
    const stats = container.querySelectorAll('.text-center');
    expect(stats.length).toBe(4);
  });

  it('renders custom count of stats', () => {
    const { container } = render(<StatsSkeleton count={3} />);
    const stats = container.querySelectorAll('.text-center');
    expect(stats.length).toBe(3);
  });

  it('has border styling', () => {
    const { container } = render(<StatsSkeleton />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('border-t');
    expect(wrapper).toHaveClass('border-b');
  });
});

describe('DocumentCardsSkeleton', () => {
  it('renders default 6 document cards', () => {
    const { container } = render(<DocumentCardsSkeleton />);
    const cards = container.querySelectorAll('.bg-white\\/5.backdrop-blur-md');
    expect(cards.length).toBe(6);
  });

  it('renders custom count of cards', () => {
    const { container } = render(<DocumentCardsSkeleton count={4} />);
    const cards = container.querySelectorAll('.bg-white\\/5.backdrop-blur-md');
    expect(cards.length).toBe(4);
  });

  it('has responsive grid layout', () => {
    const { container } = render(<DocumentCardsSkeleton />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('each card has footer with date and button area', () => {
    const { container } = render(<DocumentCardsSkeleton count={1} />);
    const footer = container.querySelector('.border-t.border-white\\/10');
    expect(footer).toBeInTheDocument();
  });
});
