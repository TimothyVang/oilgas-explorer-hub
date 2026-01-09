import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

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

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb"
      className="fixed top-20 left-0 right-0 z-40 px-4 md:px-8 py-3"
    >
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-1 text-sm bg-white/[0.05] backdrop-blur-xl border border-white/[0.08] rounded-full px-4 py-2 w-fit shadow-lg">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li key={crumb.path} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-gray-500 mx-1" />
                )}
                {isLast ? (
                  <span className="text-white font-medium px-2 py-1 bg-primary/20 rounded-full border border-primary/30">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.path}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors px-2 py-1 rounded-full hover:bg-white/[0.08]"
                  >
                    {isFirst && <Home className="w-3.5 h-3.5" />}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </motion.nav>
  );
};

export default Breadcrumb;