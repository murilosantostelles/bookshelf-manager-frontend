import { useNavigate, useLocation, Link } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
    { path: '/livros', label: 'Livros', icon: <MenuBookIcon fontSize="small" /> },
  ];

  return (
    <nav className="w-full bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-amber-600">
          <AutoStoriesIcon />
          <span className="font-bold text-stone-800 text-lg">Bookshelf</span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'bg-amber-50 text-amber-600'
                  : 'text-stone-500 hover:text-amber-600 hover:bg-stone-50'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-600 transition-colors"
      >
        <LogoutIcon fontSize="small" />
        Sair
      </button>
    </nav>
  );
};

export default Navbar;