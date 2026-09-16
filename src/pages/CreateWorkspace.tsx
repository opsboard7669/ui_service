import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreateWorkspace() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { createWorkspace } = useWorkspace();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setLoading(true);
    try {
      await createWorkspace(name.trim(), description.trim());
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in createWorkspace
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell h-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
      <div className="glass-card card-hover w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="heading-xl gradient-text mb-2">Create Workspace</h1>
          <p className="text-secondary text-sm md:text-base">Set up your first workspace to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label htmlFor="workspaceName" className="label-field text-sm md:text-base">
              Workspace Name *
            </label>
            <input
              id="workspaceName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              className="input-field px-4 py-3 text-sm md:text-base"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="label-field text-sm md:text-base">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your workspace..."
              rows={3}
              className="input-field px-4 py-3 resize-none text-sm md:text-base"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-btn disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm md:text-base"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}
