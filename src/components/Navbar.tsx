import { useNavigate } from 'react-router-dom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="w-full bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2 text-amber-600">
        <AutoStoriesIcon />
        <span className="font-bold text-stone-800 text-lg">Bookshelf</span>
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