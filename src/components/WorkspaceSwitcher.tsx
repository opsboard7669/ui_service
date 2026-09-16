import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspaceAvatar from './WorkspaceAvatar';

export default function WorkspaceSwitcher() {
  const { currentWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/8 hover:border-white/15 transition-all text-white w-full group"
      >
        <WorkspaceAvatar
          avatarId={currentWorkspace.avatarId || 'business-rocket'}
          accentColor={currentWorkspace.accentColor || '#10B981'}
          size={32}
          className="rounded-lg"
        />
        <div className="flex-1 text-left min-w-0">
          <span className="font-semibold text-sm truncate block">{currentWorkspace.name}</span>
          <span className="text-[10px] text-secondary truncate block">Workspace</span>
        </div>
        <ChevronDown size={14} className={`text-secondary transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="mt-2 relative z-50"
          >
            <div className="bg-[#0f0f14] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <div className="p-2">
                <div className="px-3 py-2 mb-1">
                  <p className="text-[11px] text-secondary uppercase tracking-wider font-semibold">Workspaces</p>
                </div>
                {workspaces.map((workspace) => (
                  <button
                    key={workspace._id}
                    onClick={() => {
                      switchWorkspace(workspace._id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left mb-1 group ${
                      workspace._id === currentWorkspace._id
                        ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white border border-primary/30 shadow-md'
                        : 'text-secondary hover:bg-white/8 hover:text-white border border-transparent'
                    }`}
                  >
                    <WorkspaceAvatar
                      avatarId={workspace.avatarId || 'business-rocket'}
                      accentColor={workspace.accentColor || '#10B981'}
                      size={32}
                      className={`rounded-lg ${
                        workspace._id === currentWorkspace._id
                          ? 'border-2 border-primary/40'
                          : 'border border-white/10'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium truncate block">{workspace.name}</span>
                      {workspace.isDefault && (
                        <span className="text-[10px] text-secondary/70 block">Default workspace</span>
                      )}
                    </div>
                    {workspace._id === currentWorkspace._id && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
                <div className="border-t border-white/10 my-2"></div>
                <button
                  onClick={() => {
                    navigate('/create-workspace');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left text-secondary hover:bg-white/8 hover:text-white border border-transparent group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                    <Plus size={14} className="group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-sm font-medium">Create New Workspace</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
