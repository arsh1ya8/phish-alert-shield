
import React from 'react';
import { Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  userEmail: string;
  onSignOut: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ userEmail, onSignOut }) => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Shield className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-800">PhishShield</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center text-gray-600">
            <User className="h-4 w-4 mr-2" />
            <span>{userEmail}</span>
          </div>
          <Button
            onClick={onSignOut}
            variant="outline"
            size="sm"
            className="flex items-center"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        AI-powered phishing detection. Enter email details below for intelligent analysis.
      </p>
    </div>
  );
};

export default AppHeader;
