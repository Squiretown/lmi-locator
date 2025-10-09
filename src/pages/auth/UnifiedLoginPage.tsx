import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Users, UserCheck, Mail, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react';
import LoginForm from './components/LoginForm';
import SignupForm from './components/SignupForm';
import MagicLinkForm from './components/MagicLinkForm';
import PasswordResetForm from './components/PasswordResetForm';

interface UnifiedLoginPageProps {
  mode: 'professional' | 'client';
  title: string;
  subtitle: string;
  showSignup: boolean;
  switchToLink: string;
  switchToText: string;
  switchToLinkText: string;
  metaTitle?: string;
  metaDescription?: string;
  icon: 'users' | 'userCheck';
  showBackToHome?: boolean;
  showTabIcons?: boolean;
}

const UnifiedLoginPage: React.FC<UnifiedLoginPageProps> = ({
  mode,
  title,
  subtitle,
  showSignup,
  switchToLink,
  switchToText,
  switchToLinkText,
  metaTitle,
  metaDescription,
  icon,
  showBackToHome = false,
  showTabIcons = false,
}) => {
  const [activeTab, setActiveTab] = useState('login');
  const location = useLocation();
  const navigate = useNavigate();

  // Derive base path from mode
  const basePath = mode === 'professional' ? '/login' : '/client-login';

  // Valid tabs based on mode
  const validTabs = showSignup 
    ? ['login', 'signup', 'magic', 'reset']
    : ['login', 'magic', 'reset'];

  // Set the active tab based on URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && validTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location, showSignup]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`${basePath}?tab=${value}`, { replace: true });
  };

  // Select icon component
  const IconComponent = icon === 'users' ? Users : UserCheck;
  const SwitchIcon = icon === 'users' ? UserCheck : Users;

  return (
    <>
      {(metaTitle || metaDescription) && (
        <Helmet>
          {metaTitle && <title>{metaTitle}</title>}
          {metaDescription && <meta name="description" content={metaDescription} />}
        </Helmet>
      )}
      
      <div className="min-h-screen flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {subtitle}
            </p>
            
            {/* Cross-link to other login type */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <SwitchIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{switchToText}</span>
              <Link 
                to={switchToLink} 
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {switchToLinkText}
              </Link>
            </div>
          </div>
          
          <div className="bg-card shadow-lg rounded-xl px-8 pt-6 pb-8 border">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className={`grid grid-cols-${showSignup ? '4' : '3'} mb-6`}>
                <TabsTrigger 
                  value="login" 
                  className={showTabIcons ? "flex items-center gap-2" : ""}
                >
                  {showTabIcons && <KeyRound className="h-4 w-4" />}
                  <span className={showTabIcons ? "hidden sm:inline" : ""}>Login</span>
                </TabsTrigger>
                
                {showSignup && (
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                )}
                
                <TabsTrigger 
                  value="magic"
                  className={showTabIcons ? "flex items-center gap-2" : ""}
                >
                  {showTabIcons && <Mail className="h-4 w-4" />}
                  <span className={showTabIcons ? "hidden sm:inline" : ""}>Magic Link</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="reset"
                  className={showTabIcons ? "flex items-center gap-2" : ""}
                >
                  {showTabIcons && <ArrowLeft className="h-4 w-4" />}
                  <span className={showTabIcons ? "hidden sm:inline" : ""}>Reset</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              
              {showSignup && (
                <TabsContent value="signup">
                  <SignupForm />
                </TabsContent>
              )}
              
              <TabsContent value="magic">
                <MagicLinkForm />
              </TabsContent>
              
              <TabsContent value="reset">
                <PasswordResetForm />
              </TabsContent>
            </Tabs>
            
            {/* Client-specific help text */}
            {mode === 'client' && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Don't have an account?
                </p>
                <Link 
                  to="/contact" 
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
                >
                  Contact us to connect with a professional
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="text-xs text-muted-foreground mt-2">
                  Clients are invited by real estate professionals
                </p>
              </div>
            )}
          </div>
          
          {/* Back to Home link */}
          {showBackToHome && (
            <div className="text-center">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UnifiedLoginPage;
