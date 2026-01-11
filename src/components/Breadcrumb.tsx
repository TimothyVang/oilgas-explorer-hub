import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbItem {
  label: string;
  path: string;
}

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/login": "Login",
  "/dashboard": "Dashboard",
  "/profile": "Profile",
  "/admin": "Admin",
  "/investor-documents": "Documents",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
};

export const Breadcrumb = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Don't show breadcrumb on home page
  if (location.pathname === "/") return null;

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", path: "/" },
  ];

  let currentPath = "";
  pathnames.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
    breadcrumbs.push({ label, path: currentPath });
  });

  const currentPage = breadcrumbs[breadcrumbs.length - 1];
  const parentPages = breadcrumbs.slice(0, -1);

  // Mobile: Show dropdown with parent pages
  if (isMobile) {
    return (
      <div className="flex items-center gap-1">
        {parentPages.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/[0.08] text-xs">
              <Home className="w-3 h-3" />
              <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background border-border min-w-[140px]">
              {parentPages.map((crumb) => (
                <DropdownMenuItem key={crumb.path} asChild>
                  <Link
                    to={crumb.path}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    {crumb.path === "/" && <Home className="w-3.5 h-3.5" />}
                    {crumb.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <ChevronRight className="w-3 h-3 text-gray-500" />
        <span className="text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full text-xs">
          {currentPage.label}
        </span>
      </div>
    );
  }

  // Desktop: Show full breadcrumb trail
  return (
    <ol className="flex items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isFirst = index === 0;

        return (
          <li key={crumb.path} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 mx-0.5" />
            )}
            {isLast ? (
              <span className="text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full text-xs">
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.path}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors px-1.5 py-0.5 rounded-full hover:bg-white/[0.08] text-xs"
              >
                {isFirst && <Home className="w-3 h-3" />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default Breadcrumb;