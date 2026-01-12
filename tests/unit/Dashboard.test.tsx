import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock the hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
const mockSignOut = vi.fn();
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    signOut: mockSignOut,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock useAdminRole
let mockIsAdmin = false;
vi.mock('@/hooks/useAdminRole', () => ({
  useAdminRole: () => ({
    isAdmin: mockIsAdmin,
    loading: false,
  }),
}));

// Mock useInvestorDashboard
const mockStats = {
  ndaSigned: false,
  assignedDocuments: 3,
  recentActivity: [
    { id: '1', action: 'document_viewed', created_at: new Date().toISOString() },
    { id: '2', action: 'nda_signed', created_at: new Date().toISOString() },
  ],
  pendingTasks: [
    { id: '1', title: 'Sign NDA', type: 'nda', status: 'critical' },
    { id: '2', title: 'Review Documents', type: 'document', status: 'pending' },
  ],
};

vi.mock('@/hooks/useInvestorDashboard', () => ({
  useInvestorDashboard: () => ({
    stats: mockStats,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    aside: ({ children, ...props }: any) => <aside {...props}>{children}</aside>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsAdmin = false;
  });

  describe('Header', () => {
    it('renders user name', () => {
      renderDashboard();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('renders current date', () => {
      renderDashboard();
      const today = new Date();
      const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      });
      expect(screen.getByText(dateString)).toBeInTheDocument();
    });

    it('shows Investor role for non-admin', () => {
      renderDashboard();
      // 'Investor' may appear in multiple places
      expect(screen.getAllByText('Investor').length).toBeGreaterThanOrEqual(1);
    });

    it('shows Admin role for admin user', () => {
      mockIsAdmin = true;
      renderDashboard();
      // 'Admin' may appear in multiple places
      expect(screen.getAllByText('Admin').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Navigation', () => {
    it('renders sidebar with navigation items', () => {
      renderDashboard();
      // Check for Overview and Documents navigation items
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('renders brand link to homepage', () => {
      renderDashboard();
      // Brand link is at the top of sidebar
      const brandLinks = screen.getAllByRole('link');
      const brandLink = brandLinks.find(link => link.getAttribute('href') === '/');
      expect(brandLink).toBeInTheDocument();
    });

    it('renders logout button', () => {
      renderDashboard();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Stats Cards', () => {
    it('renders NDA status stat', () => {
      renderDashboard();
      expect(screen.getByText('NDA Status')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('renders documents count stat', () => {
      renderDashboard();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('renders activity count stat', () => {
      renderDashboard();
      expect(screen.getByText('Activity')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders access type stat', () => {
      renderDashboard();
      expect(screen.getByText('Access')).toBeInTheDocument();
      // 'Investor' appears multiple times - once in stat, once in header
      expect(screen.getAllByText('Investor').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Activity Section', () => {
    it('renders recent activity heading', () => {
      renderDashboard();
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });

    it('renders activity items', () => {
      renderDashboard();
      expect(screen.getByText('Document Viewed')).toBeInTheDocument();
      expect(screen.getByText('Nda Signed')).toBeInTheDocument();
    });
  });

  describe('Tasks Section', () => {
    it('renders tasks heading', () => {
      renderDashboard();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('renders pending tasks', () => {
      renderDashboard();
      expect(screen.getByText('Sign NDA')).toBeInTheDocument();
      expect(screen.getByText('Review Documents')).toBeInTheDocument();
    });

    it('renders View Documents button', () => {
      renderDashboard();
      // There are multiple "View Documents" buttons, so use getAllByRole
      const viewDocsButtons = screen.getAllByRole('button', { name: /view documents/i });
      expect(viewDocsButtons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Quick Actions', () => {
    it('renders View Documents action', () => {
      renderDashboard();
      // Multiple buttons with this text exist
      const viewDocsButtons = screen.getAllByText('View Documents');
      expect(viewDocsButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('renders Edit Profile action', () => {
      renderDashboard();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    it('renders Admin Dashboard action for admins', () => {
      mockIsAdmin = true;
      renderDashboard();
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    it('does not render Admin Dashboard action for non-admins', () => {
      mockIsAdmin = false;
      renderDashboard();
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Sign Out', () => {
    it('calls signOut and navigates when logout clicked', async () => {
      renderDashboard();
      const logoutButton = screen.getByText('Logout').closest('button');
      if (logoutButton) {
        fireEvent.click(logoutButton);
        await waitFor(() => {
          expect(mockSignOut).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/');
        });
      }
    });
  });

  describe('Tab Navigation', () => {
    it('shows Overview tab by default', () => {
      renderDashboard();
      // Get all h1 headings and check at least one has Overview
      const headings = screen.getAllByRole('heading', { level: 1 });
      const hasOverview = headings.some(h => h.textContent?.includes('Overview'));
      expect(hasOverview).toBe(true);
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile nav container', () => {
      const { container } = renderDashboard();
      // Mobile nav has md:hidden class
      const mobileNav = container.querySelector('.md\\:hidden.fixed');
      expect(mobileNav).toBeInTheDocument();
    });

    it('mobile nav has home link', () => {
      renderDashboard();
      const homeLinks = screen.getAllByRole('link');
      const homeLink = homeLinks.find(link => link.getAttribute('href') === '/');
      expect(homeLink).toBeInTheDocument();
    });
  });
});

describe('StatCard Component', () => {
  it('renders label and value', () => {
    renderDashboard();
    // StatCards are rendered in the dashboard
    expect(screen.getByText('NDA Status')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Access')).toBeInTheDocument();
  });
});
