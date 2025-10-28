import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { User, Save, Loader2 } from "lucide-react";

interface UserProfileTabProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    timezone: string;
    language: string;
  };
  originalEmail: string;
  onProfileChange: (key: string, value: any) => void;
  isLoading?: boolean;
  onSave: (profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    timezone: string;
    language: string;
  }, password?: string) => Promise<{ success: boolean; error?: Error }>;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  profile,
  originalEmail,
  onProfileChange,
  isLoading = false,
  onSave,
}) => {
  const [password, setPassword] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const emailChanged = profile.email !== originalEmail;

  const handleSaveClick = () => {
    if (emailChanged && !password) {
      return; // Password validation will show error
    }
    
    if (emailChanged) {
      setShowConfirmDialog(true);
    } else {
      handleConfirmSave();
    }
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setPasswordError('');
    const result = await onSave(profile, emailChanged ? password : undefined);
    if (result?.success) {
      setPassword('');
    } else if (result?.error) {
      setPasswordError(result.error.message);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">User Profile</h3>
        </div>
        <div className="grid gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg">
                {profile.firstName?.charAt(0) || 'A'}{profile.lastName?.charAt(0) || 'D'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" size="sm" disabled>
                Change Avatar
              </Button>
              <p className="text-sm text-muted-foreground mt-1">
                JPG, PNG or GIF. Max size 2MB.
              </p>
            </div>
          </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={profile.firstName}
              onChange={(e) => onProfileChange('firstName', e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={profile.lastName}
              onChange={(e) => onProfileChange('lastName', e.target.value)}
              placeholder="Enter last name"
            />
          </div>
        </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => onProfileChange('email', e.target.value)}
              placeholder="Enter email address"
            />
            {emailChanged && (
              <p className="text-sm text-muted-foreground mt-1">
                Email will be updated. You may need to verify the new email address.
              </p>
            )}
          </div>

          {emailChanged && (
            <div className="space-y-2">
              <Label htmlFor="password">Current Password *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                placeholder="Enter your current password to change email"
                required
                className={passwordError ? 'border-destructive' : ''}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              {!passwordError && (
                <p className="text-sm text-muted-foreground">
                  Password is required to change your email address
                </p>
              )}
            </div>
          )}

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            value={profile.phone}
            onChange={(e) => onProfileChange('phone', e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => onProfileChange('bio', e.target.value)}
            placeholder="Tell us about yourself"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              value={profile.timezone}
              onValueChange={(value) => onProfileChange('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <Select
              value={profile.language}
              onValueChange={(value) => onProfileChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSaveClick} 
            disabled={isLoading || (emailChanged && !password)}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Update</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to change your email from <strong>{originalEmail}</strong> to <strong>{profile.email}</strong>.
              <br /><br />
              You may need to verify your new email address. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave}>
              Update Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
