import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Lock, CheckCircle } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

const SettingsPage = () => {
  const { user, updateUser } = useAuthStore();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const updateProfileMutation = useMutation({
    mutationFn: () => authService.updateProfile({ name: profileData.name }),
    onSuccess: (data) => {
      updateUser(data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    onSuccess: () => {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordSuccess(true);
      setPasswordError('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: () => {
      setPasswordError('Current password is incorrect. Please try again.');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-50 rounded-lg">
            <User className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Profile Information</h2>
            <p className="text-sm text-gray-500">Update your display name.</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            type="text"
            value={profileData.name}
            onChange={(e) =>
              setProfileData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Your full name"
          />

          <Input
            label="Email address"
            type="email"
            value={user?.email || ''}
            disabled
            helperText="Email cannot be changed."
          />

          {profileSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                Profile updated successfully.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={updateProfileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Password section */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-violet-50 rounded-lg">
            <Lock className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-500">
              Keep your account secure with a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            value={passwordData.currentPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                currentPassword: e.target.value,
              }))
            }
            placeholder="Enter current password"
          />

          <Input
            label="New password"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                newPassword: e.target.value,
              }))
            }
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm new password"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) =>
              setPasswordData((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            placeholder="Repeat new password"
          />

          {passwordError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-600">{passwordError}</p>
            </div>
          )}

          {passwordSuccess && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-lg">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-medium">
                Password changed successfully.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={changePasswordMutation.isPending}
            >
              Change Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Account info */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-50 rounded-lg">
            <User className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Account Information</h2>
            <p className="text-sm text-gray-500">Your account details.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.name}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.email}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Member since</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'N/A'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;