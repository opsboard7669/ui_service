import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { getAvatarById } from '../data/workspaceAvatars';

interface WorkspaceAvatarProps {
  avatarId?: string;
  accentColor?: string;
  size?: number;
  onClick?: () => void;
  className?: string;
  isSelected?: boolean;
  showGlow?: boolean;
}

export default function WorkspaceAvatar({
  avatarId = 'business-rocket',
  accentColor = '#10B981',
  size = 72,
  onClick,
  className = '',
  isSelected = false,
  showGlow = true
}: WorkspaceAvatarProps) {
  const avatar = getAvatarById(avatarId);
  const iconLibrary = avatar?.iconLibrary || 'solar';
  const iconName = avatar?.iconName || 'rocket-bold-duotone';

  return (
    <motion.div
      className={`relative overflow-hidden cursor-pointer ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '20px',
        background: avatar?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: isSelected && showGlow
          ? `0 0 0 3px ${accentColor}, 0 8px 24px ${accentColor}40, 0 0 40px ${accentColor}20`
          : showGlow
          ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.1)'
          : '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glassmorphism overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
          backdropFilter: 'blur(10px)',
        }}
      />
      
      {/* Inner highlight */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)',
        }}
      />
      
      {/* Iconify Icon */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
          <Icon 
            icon={`${iconLibrary}:${iconName}`} 
            width="100%" 
            height="100%" 
          />
        </div>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: accentColor,
            boxShadow: `0 2px 8px ${accentColor}60`
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </motion.div>
      )}
    </motion.div>
  );
}
