import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  BookOpen,
  Home,
  Library,
  Users,
  LogOut,
  Moon,
  Sun,
  Bell,
} from "lucide-react"
import { Button } from "../ui/button"
import { useAuthStore } from "../../store/authStore"
import { useTheme } from "../theme-provider"

export function MainLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, setTheme } = useTheme()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Books Catalog", path: "/books", icon: BookOpen },
    { name: "My Lendings", path: "/lendings", icon: Library },
    { name: "Notifications", path: "/notifications", icon: Bell },
  ]
  console.log(user)
  if (user?.permissions?.includes("Admin")) {
    navItems.push({
      name: "Manage Books",
      path: "/admin/books",
      icon: BookOpen,
    })
    navItems.push({ name: "Manage Users", path: "/admin/users", icon: Users })
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <BookOpen className="mr-2 h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">CTSE Library</span>
        </div>
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="grid gap-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
        <div className="border-t p-4">
          <div className="mb-4 flex items-center justify-between px-2">
            <div className="overflow-hidden pr-2 text-sm">
              <p className="truncate font-medium">{user?.username}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-background/95 px-8 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h1 className="text-lg font-semibold">
            {navItems.find(
              (item) =>
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path))
            )?.name || "Dashboard"}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto bg-muted/20 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
