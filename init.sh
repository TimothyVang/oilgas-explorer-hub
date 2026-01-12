#!/bin/bash
# =============================================================================
# Oil & Gas Explorer Hub - Development Environment Setup
# =============================================================================
#
# This script sets up and starts the development environment for the
# Oil & Gas Explorer Hub application.
#
# Usage:
#   ./init.sh           # Install dependencies and start dev server
#   ./init.sh --install # Only install dependencies
#   ./init.sh --start   # Only start dev server (assumes deps installed)
#   ./init.sh --check   # Check environment status
#
# On Windows, run with Git Bash, WSL, or use: bash init.sh
# =============================================================================

set -e

# Colors for output (works in most terminals)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print with color
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Banner
echo ""
echo "============================================="
echo "  Oil & Gas Explorer Hub"
echo "  Development Environment Setup"
echo "============================================="
echo ""

# Check for Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed!"
        echo "Please install Node.js 18+ from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version $(node -v) detected. Version 18+ recommended."
    else
        print_success "Node.js $(node -v) detected"
    fi
}

# Check for npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed!"
        exit 1
    fi
    print_success "npm $(npm -v) detected"
}

# Check for Python (for checklist manager)
check_python() {
    if command -v python3 &> /dev/null; then
        print_success "Python $(python3 --version | cut -d' ' -f2) detected"
    elif command -v python &> /dev/null; then
        print_success "Python $(python --version | cut -d' ' -f2) detected"
    else
        print_warning "Python not found. Checklist manager requires Python 3.8+"
    fi
}

# Install dependencies
install_deps() {
    print_status "Installing npm dependencies..."

    if [ -d "node_modules" ]; then
        print_status "node_modules exists. Checking for updates..."
    fi

    npm install

    if [ $? -eq 0 ]; then
        print_success "Dependencies installed successfully!"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Check environment variables
check_env() {
    print_status "Checking environment configuration..."

    if [ -f ".env" ]; then
        print_success ".env file found"

        # Check for required variables
        if grep -q "VITE_SUPABASE_URL" .env; then
            print_success "VITE_SUPABASE_URL configured"
        else
            print_warning "VITE_SUPABASE_URL not found in .env"
        fi

        if grep -q "VITE_SUPABASE_ANON_KEY" .env; then
            print_success "VITE_SUPABASE_ANON_KEY configured"
        else
            print_warning "VITE_SUPABASE_ANON_KEY not found in .env"
        fi
    else
        print_warning ".env file not found!"
        echo "Create .env with your Supabase credentials:"
        echo "  VITE_SUPABASE_URL=your_supabase_url"
        echo "  VITE_SUPABASE_ANON_KEY=your_anon_key"
    fi
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    echo ""
    echo "============================================="
    echo "  Development server starting..."
    echo "  Access the app at: http://localhost:8080"
    echo "  Press Ctrl+C to stop"
    echo "============================================="
    echo ""

    npm run dev
}

# Build for production
build_prod() {
    print_status "Building for production..."
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Production build complete! Output in ./dist"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Run linting
run_lint() {
    print_status "Running ESLint..."
    npm run lint
}

# Show checklist status
show_checklist() {
    print_status "Checking project checklist..."
    if [ -f "checklist_manager.py" ]; then
        python checklist_manager.py 2>/dev/null || python3 checklist_manager.py 2>/dev/null || echo "Could not run checklist manager"
    else
        print_warning "checklist_manager.py not found"
    fi
}

# Check status only
check_status() {
    echo ""
    print_status "Checking development environment..."
    echo ""

    check_node
    check_npm
    check_python
    check_env

    echo ""
    if [ -d "node_modules" ]; then
        print_success "Dependencies installed"
    else
        print_warning "Dependencies not installed. Run: ./init.sh --install"
    fi

    echo ""
    show_checklist
}

# Main script logic
case "${1:-}" in
    --install)
        check_node
        check_npm
        install_deps
        ;;
    --start)
        check_node
        check_npm
        start_dev
        ;;
    --build)
        check_node
        check_npm
        build_prod
        ;;
    --lint)
        check_node
        check_npm
        run_lint
        ;;
    --check)
        check_status
        ;;
    --help|-h)
        echo "Usage: ./init.sh [option]"
        echo ""
        echo "Options:"
        echo "  (no option)  Install dependencies and start dev server"
        echo "  --install    Only install dependencies"
        echo "  --start      Only start dev server"
        echo "  --build      Build for production"
        echo "  --lint       Run ESLint"
        echo "  --check      Check environment status"
        echo "  --help       Show this help message"
        echo ""
        ;;
    *)
        # Default: full setup and start
        check_node
        check_npm
        check_python
        check_env
        install_deps
        echo ""
        start_dev
        ;;
esac
