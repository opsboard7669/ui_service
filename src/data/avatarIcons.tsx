import { Icon } from '@iconify/react';

// Icon mapping using Iconify - returns Icon component for each avatar ID
// This file is now simplified since icons are rendered directly using Iconify
export const AvatarIcons: Record<string, React.ReactNode> = {
  // Default fallback icon
  default: <Icon icon="solar:rocket-bold-duotone" width="100%" height="100%" />,
};

export default AvatarIcons;
