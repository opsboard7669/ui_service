import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface ActionMenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  divider?: boolean;
}

interface ActionMenuProps {
  trigger: React.ReactNode;
  items: ActionMenuItem[];
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: 'left' | 'right';
  align?: 'start' | 'end';
  disabled?: boolean;
}

export default function ActionMenu({
  trigger,
  items,
  isOpen: controlledOpen,
  onOpenChange,
  position = 'right',
  align = 'end',
  disabled = false,
}: ActionMenuProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled && !item.loading) {
      item.onClick();
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(e as any);
    }
  };

  const handleItemKeyDown = (e: KeyboardEvent<HTMLButtonElement>, item: ActionMenuItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(item);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };

    const handleEscape = (e: Event) => {
      if ((e as unknown as KeyboardEvent).key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);

  const getPositionClasses = () => {
    const positionClasses = {
      left: 'left-0',
      right: 'right-0',
    };
    return positionClasses[position];
  };

  const getAlignClasses = () => {
    const alignClasses = {
      start: 'mt-1',
      end: 'bottom-full mb-1',
    };
    return alignClasses[align];
  };

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="inline-flex items-center justify-center p-1.5 hover:bg-white/5 rounded-md transition-all duration-200 text-secondary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {trigger}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.96, y: align === 'end' ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: align === 'end' ? 4 : -4 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={`absolute ${getPositionClasses()} ${getAlignClasses()} z-[100] min-w-[140px] max-w-[200px]`}
          >
            <div
              className="bg-[#0a0a0f]/98 backdrop-blur-md border border-white/8 rounded-lg shadow-lg overflow-hidden"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
              }}
            >
              <div className="py-1" role="menu">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const showDivider = item.divider && index > 0;
                  
                  return (
                    <div key={item.id}>
                      {showDivider && (
                        <div className="my-1 mx-2 h-px bg-white/6" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        onKeyDown={(e) => handleItemKeyDown(e, item)}
                        disabled={item.disabled || item.loading}
                        className={`w-full px-3 py-1.5 text-left text-[11px] font-medium transition-all duration-150 flex items-center gap-2.5 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed relative group/btn ${
                          item.destructive
                            ? 'text-red-400 hover:bg-red-500/8 hover:text-red-300'
                            : 'text-white/90 hover:bg-white/6 hover:text-white'
                        }`}
                        role="menuitem"
                      >
                        <Icon
                          size={13}
                          strokeWidth={2}
                          className={`flex-shrink-0 ${item.destructive ? 'text-red-400/80 group-hover/btn:text-red-300' : 'text-white/50 group-hover/btn:text-white/70'}`}
                        />
                        <span className="flex-1">{item.label}</span>
                        {item.loading && (
                          <div className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
