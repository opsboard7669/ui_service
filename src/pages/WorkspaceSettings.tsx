import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { workspaceApi } from '../lib/api';
import { 
  Settings, 
  Users, 
  CreditCard, 
  Puzzle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import MembersContent from '../components/MembersContent';
import Dropdown, { DropdownOption } from '../components/Dropdown';
import WorkspaceIconPicker from '../components/WorkspaceIconPicker';
import WorkspaceAvatar from '../components/WorkspaceAvatar';
import { PrimaryButton, SecondaryButton } from '../components/Button';

interface WorkspaceSettings {
  name: string;
  description: string;
  companyName: string;
  industry: string;
  timezone: string;
  avatarId: string;
  accentColor: string;
}


const INDUSTRIES: DropdownOption[] = [
  { value: 'IT', label: 'IT' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Education', label: 'Education' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Other', label: 'Other' },
];

const TIMEZONES: DropdownOption[] = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
];

const SETTINGS_TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: Puzzle },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
];

export default function WorkspaceSettings() {
  const { currentWorkspace, userRole } = useWorkspace();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<WorkspaceSettings>({
    name: '',
    description: '',
    companyName: '',
    industry: 'Other',
    timezone: 'Asia/Kolkata',
    avatarId: 'business-rocket',
    accentColor: '#10B981',
  });

  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  // Check if user can edit settings (Owner or Admin)
  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN';

  // Fetch workspace settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['workspaceSettings', currentWorkspace?._id],
    queryFn: async () => {
      if (!currentWorkspace?._id) return null;
      const response = await workspaceApi.getSettings(currentWorkspace._id);
      return response.data?.data as WorkspaceSettings;
    },
    enabled: !!currentWorkspace?._id,
  });


  // Update form data when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: (data: WorkspaceSettings) => {
      return workspaceApi.updateSettings(currentWorkspace!._id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaceSettings'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace', currentWorkspace?._id] });
      toast.success('Workspace settings updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }
    if (!formData.industry) {
      toast.error('Industry is required');
      return;
    }
    if (!formData.timezone) {
      toast.error('Timezone is required');
      return;
    }
    if (formData.description.length > 500) {
      toast.error('Description must not exceed 500 characters');
      return;
    }
    if (formData.companyName.length > 100) {
      toast.error('Company name must not exceed 100 characters');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (settings) {
      setFormData(settings);
    }
  };

  const handleInputChange = (field: keyof WorkspaceSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-secondary text-sm">
          Manage your workspace configuration and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Navigation */}
        <div className="lg:w-56 flex-shrink-0">
          <nav className="space-y-1">
            {SETTINGS_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left relative ${
                    activeTab === tab.id
                      ? 'bg-[#2d4a3e]/20 text-white'
                      : 'text-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#2d4a3e] rounded-r-full" />
                  )}
                  <Icon size={16} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <GeneralSettings
              formData={formData}
              onInputChange={handleInputChange}
              onSave={handleSave}
              onCancel={handleCancel}
              isSaving={updateMutation.isPending}
              canEdit={canEdit}
              onIconPickerOpen={() => setIconPickerOpen(true)}
            />
          )}

          {activeTab === 'members' && (
            <MembersContent showHeader={false} showSummaryCard={false} />
          )}

          {activeTab === 'billing' && (
            <ComingSoon tabName="Billing" />
          )}

          {activeTab === 'integrations' && (
            <ComingSoon tabName="Integrations" />
          )}

          {activeTab === 'danger' && (
            <DangerZone />
          )}
        </div>
      </div>

      {/* Icon Picker Modal */}
      <WorkspaceIconPicker
        isOpen={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(avatarId, accentColor) => {
          setFormData(prev => ({ ...prev, avatarId, accentColor }));
        }}
        currentAvatarId={formData.avatarId}
        currentAccentColor={formData.accentColor}
      />
    </div>
  );
}

// General Settings Component
function GeneralSettings({
  formData,
  onInputChange,
  onSave,
  onCancel,
  isSaving,
  canEdit,
  onIconPickerOpen,
}: {
  formData: WorkspaceSettings;
  onInputChange: (field: keyof WorkspaceSettings, value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
  canEdit: boolean;
  onIconPickerOpen: () => void;
}) {
  const handleSubmit = (e: React.FormEvent) => {
    onSave(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Logo Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-white">Workspace Icon</h2>
        <div className="flex items-start gap-8">
          <div className="flex-shrink-0">
            <WorkspaceAvatar
              avatarId={formData.avatarId}
              accentColor={formData.accentColor}
              size={72}
              onClick={() => canEdit && onIconPickerOpen()}
            />
          </div>
          <div className="flex-1 space-y-3 pt-2">
            <div>
              <button
                type="button"
                disabled={!canEdit}
                onClick={onIconPickerOpen}
                className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-white/10 rounded-lg text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-white/20"
              >
                Change Icon
              </button>
            </div>
            <p className="text-sm text-secondary">
              Click the icon to choose a new workspace icon and color
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Information */}
      <div className="space-y-6">
        <h2 className="text-sm font-medium text-white">Workspace Information</h2>
        
        <div className="space-y-6">
          {/* Workspace Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Workspace Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder="Enter workspace name"
              disabled={!canEdit}
              className="w-full h-11 px-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-secondary/40 focus:outline-none focus:border-[#2d4a3e] focus:ring-1 focus:ring-[#2d4a3e]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              required
            />
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Company Name
            </label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => onInputChange('companyName', e.target.value)}
              placeholder="Enter company name"
              disabled={!canEdit}
              maxLength={100}
              className="w-full h-11 px-4 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-secondary/40 focus:outline-none focus:border-[#2d4a3e] focus:ring-1 focus:ring-[#2d4a3e]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <p className="text-sm text-secondary">
              {formData.companyName.length}/100 characters
            </p>
          </div>

          {/* Industry and Timezone Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Industry <span className="text-red-400">*</span>
              </label>
              <Dropdown
                options={INDUSTRIES}
                value={formData.industry}
                onChange={(value) => onInputChange('industry', value)}
                placeholder="Select industry"
                disabled={!canEdit}
                size="md"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Timezone <span className="text-red-400">*</span>
              </label>
              <Dropdown
                options={TIMEZONES}
                value={formData.timezone}
                onChange={(value) => onInputChange('timezone', value)}
                placeholder="Select timezone"
                disabled={!canEdit}
                size="md"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onInputChange('description', e.target.value)}
              placeholder="Enter workspace description"
              disabled={!canEdit}
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white placeholder-secondary/40 focus:outline-none focus:border-[#2d4a3e] focus:ring-1 focus:ring-[#2d4a3e]/20 transition-all duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            />
            <p className="text-sm text-secondary">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <SecondaryButton
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            disabled={isSaving}
            loading={isSaving}
            className="px-6 py-2.5 text-sm"
          >
            Save Changes
          </PrimaryButton>
        </div>
      )}

      {!canEdit && (
        <div className="bg-[#242424] border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-400">
            Only workspace owners and admins can edit workspace settings
          </p>
        </div>
      )}
    </form>
  );
}

// Coming Soon Placeholder Component
function ComingSoon({ tabName }: { tabName: string }) {
  return (
    <div className="bg-[#242424] border border-white/10 rounded-xl p-12 text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center">
          <div className="text-2xl">🚧</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-white">
            {tabName}
          </h3>
          <p className="text-secondary text-sm max-w-md">
            This feature will be available in a future release.
          </p>
        </div>
      </div>
    </div>
  );
}

// Danger Zone Component
function DangerZone() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-white">Danger Zone</h3>
      <div className="bg-[#242424] border border-red-500/20 rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-white">Transfer Ownership</h4>
            <p className="text-sm text-secondary">Transfer workspace ownership to another member.</p>
          </div>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm font-medium opacity-50 cursor-not-allowed transition-all"
          >
            Transfer
          </button>
        </div>
        <div className="border-t border-white/10 pt-6 flex items-start justify-between gap-6">
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium text-white">Delete Workspace</h4>
            <p className="text-sm text-secondary">Permanently delete this workspace and all its data.</p>
          </div>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium opacity-50 cursor-not-allowed transition-all"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
