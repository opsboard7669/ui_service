import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import WorkspaceAvatar from './WorkspaceAvatar';
import { 
  WORKSPACE_AVATARS, 
  ACCENT_COLORS, 
  getRandomAvatar,
  searchAvatars,
  filterAvatarsByCategory,
  getAvatarById
} from '../data/workspaceAvatars';

interface WorkspaceAvatarPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarId: string, accentColor: string) => void;
  currentAvatarId?: string;
  currentAccentColor?: string;
}

const FAVORITES_KEY = 'workspace-avatar-favorites';

// Updated categories as requested
const UPDATED_CATEGORIES = [
  'All',
  'Business',
  'Technology',
  'Design',
  'Education',
  'Healthcare',
  'Gaming',
  'Cloud',
  'DevOps',
  'Finance',
  'AI',
  'Travel',
  'Food',
  'Music'
] as const;

export default function WorkspaceAvatarPicker({
  isOpen,
  onClose,
  onSelect,
  currentAvatarId = 'business-rocket',
  currentAccentColor = '#10B981'
}: WorkspaceAvatarPickerProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(currentAvatarId);
  const [selectedAccentColor, setSelectedAccentColor] = useState(currentAccentColor);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavorites, setShowFavorites] = useState(false);
  const [hoveredAvatar, setHoveredAvatar] = useState<string | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (avatarId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(avatarId)) {
      newFavorites.delete(avatarId);
    } else {
      newFavorites.add(avatarId);
    }
    saveFavorites(newFavorites);
  };

  const handleRandomAvatar = () => {
    const randomAvatar = getRandomAvatar();
    setSelectedAvatarId(randomAvatar.id);
  };

  const filteredAvatars = useMemo(() => {
    let result = WORKSPACE_AVATARS;

    // Filter by favorites first
    if (showFavorites) {
      result = result.filter(avatar => favorites.has(avatar.id));
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      result = filterAvatarsByCategory(selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      result = searchAvatars(searchQuery);
    }

    return result;
  }, [searchQuery, selectedCategory, favorites, showFavorites]);

  const currentAvatar = getAvatarById(selectedAvatarId);

  const handleSelect = () => {
    onSelect(selectedAvatarId, selectedAccentColor);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <motion.div
            className="bg-[#0f0f14] backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col"
            style={{
              width: '720px',
              maxWidth: '720px',
              maxHeight: '680px',
              borderRadius: '20px'
            }}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Choose Workspace Avatar</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/10 text-secondary hover:text-white transition-all"
                  aria-label="Close"
                >
                  <Icon icon="solar:close-circle-bold" width={18} height={18} />
                </button>
              </div>
            </div>

            {/* Preview Section - Ultra compact */}
            <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <WorkspaceAvatar
                      avatarId={selectedAvatarId}
                      accentColor={selectedAccentColor}
                      size={24}
                      showGlow={false}
                    />
                    <span className="text-[9px] text-secondary mt-0.5">Sidebar</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <WorkspaceAvatar
                      avatarId={selectedAvatarId}
                      accentColor={selectedAccentColor}
                      size={20}
                      showGlow={false}
                    />
                    <span className="text-[9px] text-secondary mt-0.5">Switcher</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <WorkspaceAvatar
                      avatarId={selectedAvatarId}
                      accentColor={selectedAccentColor}
                      size={28}
                      showGlow={false}
                    />
                    <span className="text-[9px] text-secondary mt-0.5">Settings</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{currentAvatar?.name}</div>
                  <div className="text-[10px] text-secondary">{currentAvatar?.category}</div>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Icon icon="solar:magnifer-bold" width={14} height={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search avatars..."
                    style={{ height: '36px' }}
                    className="w-full pl-9 pr-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-secondary/40 focus:outline-none focus:border-[#2d4a3e] focus:ring-1 focus:ring-[#2d4a3e]/20 transition-all text-xs"
                  />
                </div>
                <button
                  onClick={handleRandomAvatar}
                  className="flex items-center justify-center w-9 h-9 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 rounded-lg text-white transition-all duration-200"
                  title="Random Avatar"
                >
                  <Icon icon="solar:shuffle-bold" width={16} height={16} />
                </button>
                {favorites.size > 0 && (
                  <button
                    onClick={() => setShowFavorites(!showFavorites)}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                      showFavorites 
                        ? 'bg-[#10B981] text-white' 
                        : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 text-white'
                    }`}
                    title="Show Favorites"
                  >
                    <Icon icon={showFavorites ? "solar:heart-bold" : "solar:heart-linear"} width={16} height={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Categories - Wrapped */}
            <div className="px-4 pb-2 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {UPDATED_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all duration-200 ${
                      selectedCategory === category
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 text-secondary hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Grid - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4" style={{ minHeight: '70px', maxHeight: '150px' }}>
              <div className="grid grid-cols-10 gap-1.5 pb-2">
                {filteredAvatars.map((avatar) => {
                  const isSelected = selectedAvatarId === avatar.id;
                  const isFavorite = favorites.has(avatar.id);
                  return (
                    <motion.button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onMouseEnter={() => setHoveredAvatar(avatar.id)}
                      onMouseLeave={() => setHoveredAvatar(null)}
                    >
                      <WorkspaceAvatar
                        avatarId={avatar.id}
                        accentColor={selectedAccentColor}
                        size={46}
                        isSelected={isSelected}
                      />
                      
                      {/* Favorite button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(avatar.id);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
                        style={{ backdropFilter: 'blur(4px)' }}
                      >
                        <Icon 
                          icon={isFavorite ? "solar:heart-bold" : "solar:heart-linear"}
                          width={12}
                          height={12}
                          className={isFavorite ? 'text-[#EC4899]' : 'text-white'}
                        />
                      </button>

                      {/* Tooltip on hover */}
                      {hoveredAvatar === avatar.id && (
                        <motion.div
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-md text-[11px] text-white whitespace-nowrap z-10"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                        >
                          {avatar.name}
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {filteredAvatars.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-secondary">No avatars found matching your search.</p>
                </div>
              )}
            </div>

            {/* Accent Color Selection */}
            <div className="px-4 py-2 border-t border-white/10 flex-shrink-0">
              <h3 className="text-[10px] font-medium text-white mb-1.5">Accent Color</h3>
              <div className="flex flex-wrap gap-1.5">
                {ACCENT_COLORS.map((color) => {
                  const isSelected = selectedAccentColor === color.value;
                  return (
                    <motion.button
                      key={color.name}
                      onClick={() => setSelectedAccentColor(color.value)}
                      className={`relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f14] scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                          <Icon icon="solar:star-bold" width={10} height={10} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/10 flex items-center justify-end gap-2 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10 rounded-lg text-white text-xs font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSelect}
                className="px-3 py-1.5 bg-[#10B981] hover:bg-[#0d9668] rounded-lg text-white text-xs font-medium transition-all duration-200 shadow-lg shadow-[#10B981]/20"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Select Avatar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
