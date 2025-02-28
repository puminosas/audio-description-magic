
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center space-x-2">
      <div className="sound-wave scale-75">
        <div className="bar animate-pulse-sound-1"></div>
        <div className="bar animate-pulse-sound-2"></div>
        <div className="bar animate-pulse-sound-3"></div>
        <div className="bar animate-pulse-sound-4"></div>
      </div>
      <span className="text-xl font-bold matrix-text">AudioDescriptions</span>
    </Link>
  );
};

export default Logo;
