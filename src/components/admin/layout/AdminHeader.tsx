
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white h-14 flex items-center justify-between px-6 border-b border-gray-800">
      {/* Left side - Logo and navigation */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-white font-semibold text-lg">LMICHECK.COM</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <button 
            onClick={() => navigate('/product')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Product
          </button>
          <button 
            onClick={() => navigate('/resources')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Resources
          </button>
          <button 
            onClick={() => navigate('/pricing')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button 
            onClick={() => navigate('/customers')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Customers
          </button>
          <button 
            onClick={() => navigate('/blog')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Blog
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Contact
          </button>
        </nav>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/')}
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <Home className="w-4 h-4 mr-2" />
          Home
        </Button>
        
        <Button 
          variant="default" 
          size="sm"
          className="bg-gray-800 hover:bg-gray-700 text-white"
        >
          Admin Panel
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-gray-800"
        >
          <User className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
