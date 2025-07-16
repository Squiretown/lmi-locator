import React, { useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarUpdate,
  size = 'lg'
}) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24', 
    lg: 'h-32 w-32'
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      if (currentAvatar) {
        const oldPath = currentAvatar.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ profile_image: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      toast.success('Avatar updated successfully');
    } catch (error: any) {
      toast.error('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      uploadAvatar(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }
      uploadAvatar(file);
    }
  };

  const removeAvatar = async () => {
    if (!user || !currentAvatar) return;

    setUploading(true);
    try {
      const fileName = currentAvatar.split('/').pop();
      if (fileName) {
        await supabase.storage.from('avatars').remove([`${user.id}/${fileName}`]);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ profile_image: null })
        .eq('user_id', user.id);

      if (error) throw error;

      onAvatarUpdate('');
      toast.success('Avatar removed');
    } catch (error: any) {
      toast.error('Error removing avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative group">
        <Avatar className={`${sizeClasses[size]} border-2 border-muted`}>
          <AvatarImage src={currentAvatar} />
          <AvatarFallback className="text-lg font-semibold">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div
          className={`absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
            dragActive ? 'opacity-100 bg-primary/20' : ''
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="flex space-x-2">
          <label htmlFor="avatar-upload">
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload'}
              </span>
            </Button>
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          {currentAvatar && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={uploading}
            >
              <X className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG or GIF. Max size 2MB.
        </p>
      </div>
    </div>
  );
};