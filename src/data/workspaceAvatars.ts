export interface WorkspaceAvatar {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  gradient: string;
  iconLibrary: string;
  iconName: string;
}

export const AVATAR_CATEGORIES = [
  'Business',
  'Technology',
  'Development',
  'Gaming',
  'Education',
  'Healthcare',
  'Finance',
  'Design',
  'Marketing',
  'Engineering',
  'Cloud',
  'DevOps',
  'AI',
  'Travel',
  'Food',
  'Retail',
  'Music',
  'Media',
  'Sports',
  'Lifestyle'
] as const;

export const ACCENT_COLORS = [
  { name: 'Emerald', value: '#10B981' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Slate', value: '#64748B' },
  { name: 'Amber', value: '#F59E0B' }
] as const;

const GRADIENTS = [
  'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)', // Purple → Indigo
  'linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)', // Blue → Cyan
  'linear-gradient(135deg, #10B981 0%, #22C55E 100%)', // Emerald → Green
  'linear-gradient(135deg, #F97316 0%, #EAB308 100%)', // Orange → Yellow
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)', // Pink → Purple
  'linear-gradient(135deg, #EF4444 0%, #F97316 100%)', // Red → Orange
  'linear-gradient(135deg, #64748B 0%, #6366F1 100%)', // Slate → Indigo
  'linear-gradient(135deg, #14B8A6 0%, #06B6D4 100%)', // Teal → Cyan
  'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)', // Amber → Orange
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)', // Purple → Pink
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)', // Cyan → Blue
  'linear-gradient(135deg, #22C55E 0%, #10B981 100%)', // Green → Emerald
  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', // Indigo → Purple
  'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)', // Pink → Rose
  'linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)', // Sky → Indigo
  'linear-gradient(135deg, #84CC16 0%, #22C55E 100%)', // Lime → Green
  'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)', // Pink → Pink
  'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%)', // Sky → Sky
  'linear-gradient(135deg, #A855F7 0%, #8B5CF6 100%)', // Purple → Purple
  'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)'  // Teal → Teal
];

export const WORKSPACE_AVATARS: WorkspaceAvatar[] = [
  // Business
  { id: 'business-rocket', name: 'Rocket', category: 'Business', keywords: ['startup', 'launch', 'growth'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'rocket-bold-duotone' },
  { id: 'business-briefcase', name: 'Briefcase', category: 'Business', keywords: ['work', 'office', 'professional'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'bag-bold-duotone' },
  { id: 'business-building', name: 'Building', category: 'Business', keywords: ['office', 'company', 'corporate'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'buildings-bold-duotone' },
  { id: 'business-chart', name: 'Chart', category: 'Business', keywords: ['analytics', 'growth', 'data'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'chart-bold-duotone' },
  { id: 'business-target', name: 'Target', category: 'Business', keywords: ['goal', 'objective', 'success'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'target-bold-duotone' },
  
  // Technology
  { id: 'tech-cpu', name: 'CPU', category: 'Technology', keywords: ['processor', 'computer', 'hardware'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'cpu-bold-duotone' },
  { id: 'tech-chip', name: 'Chip', category: 'Technology', keywords: ['microchip', 'circuit', 'tech'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'chip-bold-duotone' },
  { id: 'tech-server', name: 'Server', category: 'Technology', keywords: ['data', 'hosting', 'cloud'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'server-bold-duotone' },
  { id: 'tech-database', name: 'Database', category: 'Technology', keywords: ['storage', 'data', 'sql'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'database-bold-duotone' },
  { id: 'tech-network', name: 'Network', category: 'Technology', keywords: ['connection', 'internet', 'web'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'wifi-bold-duotone' },
  
  // Development
  { id: 'dev-code', name: 'Code', category: 'Development', keywords: ['programming', 'script', 'software'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'code-bold-duotone' },
  { id: 'dev-terminal', name: 'Terminal', category: 'Development', keywords: ['cli', 'command', 'shell'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'terminal-bold-duotone' },
  { id: 'dev-git', name: 'Git', category: 'Development', keywords: ['version', 'repository', 'branch'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'git-branch-bold-duotone' },
  { id: 'dev-bug', name: 'Bug', category: 'Development', keywords: ['debug', 'fix', 'issue'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'bug-bold-duotone' },
  { id: 'dev-api', name: 'API', category: 'Development', keywords: ['interface', 'rest', 'graphql'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'api-bold-duotone' },
  
  // Gaming
  { id: 'game-controller', name: 'Controller', category: 'Gaming', keywords: ['play', 'gaming', 'console'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'gamepad-bold-duotone' },
  { id: 'game-joystick', name: 'Joystick', category: 'Gaming', keywords: ['arcade', 'retro', 'game'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'joystick-bold-duotone' },
  { id: 'game-dice', name: 'Dice', category: 'Gaming', keywords: ['luck', 'random', 'board'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'dice-bold-duotone' },
  { id: 'game-trophy', name: 'Trophy', category: 'Gaming', keywords: ['win', 'achievement', 'rank'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'medal-star-bold-duotone' },
  { id: 'game-puzzle', name: 'Puzzle', category: 'Gaming', keywords: ['challenge', 'brain', 'logic'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'puzzle-piece-bold-duotone' },
  
  // Education
  { id: 'edu-book', name: 'Book', category: 'Education', keywords: ['learn', 'study', 'read'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'book-bookmark-bold-duotone' },
  { id: 'edu-graduation', name: 'Graduation', category: 'Education', keywords: ['degree', 'school', 'university'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'graduation-cap-bold-duotone' },
  { id: 'edu-pencil', name: 'Pencil', category: 'Education', keywords: ['write', 'draw', 'create'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'pen-bold-duotone' },
  { id: 'edu-backpack', name: 'Backpack', category: 'Education', keywords: ['school', 'student', 'class'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'backpack-bold-duotone' },
  { id: 'edu-blackboard', name: 'Blackboard', category: 'Education', keywords: ['teach', 'classroom', 'lesson'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'board-bold-duotone' },
  
  // Healthcare
  { id: 'health-heart', name: 'Heart', category: 'Healthcare', keywords: ['medical', 'care', 'health'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'heart-bold-duotone' },
  { id: 'health-cross', name: 'Cross', category: 'Healthcare', keywords: ['medical', 'hospital', 'aid'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'hospital-bold-duotone' },
  { id: 'health-pill', name: 'Pill', category: 'Healthcare', keywords: ['medicine', 'pharmacy', 'drug'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'medicine-bold-duotone' },
  { id: 'health-stethoscope', name: 'Stethoscope', category: 'Healthcare', keywords: ['doctor', 'nurse', 'checkup'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'stethoscope-bold-duotone' },
  { id: 'health-dna', name: 'DNA', category: 'Healthcare', keywords: ['genetics', 'biology', 'science'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'dna-bold-duotone' },
  
  // Finance
  { id: 'finance-dollar', name: 'Dollar', category: 'Finance', keywords: ['money', 'currency', 'cash'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'money-bold-duotone' },
  { id: 'finance-chart-line', name: 'Chart Line', category: 'Finance', keywords: ['stock', 'market', 'trend'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'chart-2-bold-duotone' },
  { id: 'finance-piggy', name: 'Piggy Bank', category: 'Finance', keywords: ['savings', 'bank', 'money'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'piggy-bank-bold-duotone' },
  { id: 'finance-credit-card', name: 'Credit Card', category: 'Finance', keywords: ['payment', 'banking', 'card'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'card-bold-duotone' },
  { id: 'finance-coins', name: 'Coins', category: 'Finance', keywords: ['wealth', 'investment', 'profit'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'coins-bold-duotone' },
  
  // Design
  { id: 'design-palette', name: 'Palette', category: 'Design', keywords: ['color', 'art', 'creative'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'palette-bold-duotone' },
  { id: 'design-brush', name: 'Brush', category: 'Design', keywords: ['paint', 'art', 'draw'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'paint-brush-bold-duotone' },
  { id: 'design-pen', name: 'Pen', category: 'Design', keywords: ['write', 'draw', 'ink'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'pen-new-square-bold-duotone' },
  { id: 'design-ruler', name: 'Ruler', category: 'Design', keywords: ['measure', 'precision', 'layout'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'ruler-pen-bold-duotone' },
  { id: 'design-layers', name: 'Layers', category: 'Design', keywords: ['stack', 'composition', 'design'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'layers-bold-duotone' },
  
  // Marketing
  { id: 'marketing-megaphone', name: 'Megaphone', category: 'Marketing', keywords: ['announce', 'promote', 'advertise'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'megaphone-bold-duotone' },
  { id: 'marketing-bullhorn', name: 'Bullhorn', category: 'Marketing', keywords: ['broadcast', 'news', 'media'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'speaker-bold-duotone' },
  { id: 'marketing-tag', name: 'Tag', category: 'Marketing', keywords: ['label', 'brand', 'tag'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'tag-bold-duotone' },
  { id: 'marketing-star', name: 'Star', category: 'Marketing', keywords: ['featured', 'rating', 'review'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'star-bold-duotone' },
  { id: 'marketing-billboard', name: 'Billboard', category: 'Marketing', keywords: ['ad', 'display', 'banner'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'advertising-bold-duotone' },
  
  // Engineering
  { id: 'eng-wrench', name: 'Wrench', category: 'Engineering', keywords: ['tool', 'fix', 'repair'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'wrench-bold-duotone' },
  { id: 'eng-gear', name: 'Gear', category: 'Engineering', keywords: ['mechanical', 'machine', 'part'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'settings-bold-duotone' },
  { id: 'eng-hammer', name: 'Hammer', category: 'Engineering', keywords: ['build', 'construct', 'tool'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'hammer-bold-duotone' },
  { id: 'eng-blueprint', name: 'Blueprint', category: 'Engineering', keywords: ['plan', 'design', 'architecture'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'document-text-bold-duotone' },
  { id: 'eng-ruler', name: 'Ruler', category: 'Engineering', keywords: ['measure', 'precision', 'tool'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'ruler-bold-duotone' },
  
  // Cloud
  { id: 'cloud-server', name: 'Cloud Server', category: 'Cloud', keywords: ['hosting', 'storage', 'compute'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'cloud-bold-duotone' },
  { id: 'cloud-upload', name: 'Cloud Upload', category: 'Cloud', keywords: ['sync', 'backup', 'storage'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'cloud-upload-bold-duotone' },
  { id: 'cloud-download', name: 'Cloud Download', category: 'Cloud', keywords: ['fetch', 'retrieve', 'sync'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'cloud-download-bold-duotone' },
  { id: 'cloud-sync', name: 'Cloud Sync', category: 'Cloud', keywords: ['synchronize', 'update', 'realtime'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'refresh-circle-bold-duotone' },
  { id: 'cloud-lock', name: 'Cloud Lock', category: 'Cloud', keywords: ['security', 'private', 'secure'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'lock-bold-duotone' },
  
  // DevOps
  { id: 'devops-pipeline', name: 'Pipeline', category: 'DevOps', keywords: ['ci', 'cd', 'automation'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'alt-arrow-right-bold-duotone' },
  { id: 'devops-container', name: 'Container', category: 'DevOps', keywords: ['docker', 'kubernetes', 'deploy'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'box-bold-duotone' },
  { id: 'devops-deploy', name: 'Deploy', category: 'DevOps', keywords: ['release', 'production', 'ship'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'rocket-linear-bold-duotone' },
  { id: 'devops-monitor', name: 'Monitor', category: 'DevOps', keywords: ['observe', 'track', 'metrics'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'monitor-bold-duotone' },
  { id: 'devops-scale', name: 'Scale', category: 'DevOps', keywords: ['growth', 'expand', 'load'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'maximize-bold-duotone' },
  
  // AI
  { id: 'ai-brain', name: 'Brain', category: 'AI', keywords: ['neural', 'intelligence', 'ml'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'brain-bold-duotone' },
  { id: 'ai-robot', name: 'Robot', category: 'AI', keywords: ['automation', 'bot', 'smart'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'robot-bold-duotone' },
  { id: 'ai-chip', name: 'AI Chip', category: 'AI', keywords: ['processor', 'neural', 'compute'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'cpu-bolt-bold-duotone' },
  { id: 'ai-network', name: 'Neural Network', category: 'AI', keywords: ['deep', 'learning', 'nodes'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'network-bold-duotone' },
  { id: 'ai-spark', name: 'Spark', category: 'AI', keywords: ['idea', 'innovation', 'smart'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'sparkles-bold-duotone' },
  
  // Travel
  { id: 'travel-plane', name: 'Plane', category: 'Travel', keywords: ['flight', 'air', 'travel'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'plane-bold-duotone' },
  { id: 'travel-map', name: 'Map', category: 'Travel', keywords: ['location', 'navigation', 'route'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'map-bold-duotone' },
  { id: 'travel-compass', name: 'Compass', category: 'Travel', keywords: ['direction', 'navigate', 'explore'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'compass-bold-duotone' },
  { id: 'travel-suitcase', name: 'Suitcase', category: 'Travel', keywords: ['luggage', 'trip', 'vacation'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'suitcase-bold-duotone' },
  { id: 'travel-globe', name: 'Globe', category: 'Travel', keywords: ['world', 'international', 'global'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'globe-bold-duotone' },
  
  // Food
  { id: 'food-pizza', name: 'Pizza', category: 'Food', keywords: ['restaurant', 'delivery', 'meal'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'pizza-bold-duotone' },
  { id: 'food-burger', name: 'Burger', category: 'Food', keywords: ['fast', 'food', 'meal'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'hamburger-bold-duotone' },
  { id: 'food-coffee', name: 'Coffee', category: 'Food', keywords: ['cafe', 'drink', 'brew'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'coffee-cup-bold-duotone' },
  { id: 'food-cake', name: 'Cake', category: 'Food', keywords: ['dessert', 'sweet', 'birthday'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'cake-bold-duotone' },
  { id: 'food-utensils', name: 'Utensils', category: 'Food', keywords: ['dining', 'restaurant', 'meal'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'fork-knife-bold-duotone' },
  
  // Retail
  { id: 'retail-cart', name: 'Cart', category: 'Retail', keywords: ['shopping', 'ecommerce', 'buy'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'cart-minimalist-bold-duotone' },
  { id: 'retail-store', name: 'Store', category: 'Retail', keywords: ['shop', 'retail', 'business'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'shop-2-bold-duotone' },
  { id: 'retail-tag', name: 'Price Tag', category: 'Retail', keywords: ['sale', 'discount', 'offer'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'tag-price-bold-duotone' },
  { id: 'retail-bag', name: 'Shopping Bag', category: 'Retail', keywords: ['purchase', 'buy', 'shop'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'shopping-bag-bold-duotone' },
  { id: 'retail-receipt', name: 'Receipt', category: 'Retail', keywords: ['purchase', 'transaction', 'order'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'receipt-bold-duotone' },
  
  // Music
  { id: 'music-note', name: 'Music Note', category: 'Music', keywords: ['song', 'audio', 'sound'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'music-note-bold-duotone' },
  { id: 'music-headphones', name: 'Headphones', category: 'Music', keywords: ['audio', 'listen', 'sound'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'headphones-bold-duotone' },
  { id: 'music-mic', name: 'Microphone', category: 'Music', keywords: ['record', 'sing', 'audio'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'microphone-bold-duotone' },
  { id: 'music-guitar', name: 'Guitar', category: 'Music', keywords: ['instrument', 'play', 'band'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'guitar-bold-duotone' },
  { id: 'music-vinyl', name: 'Vinyl', category: 'Music', keywords: ['record', 'album', 'classic'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'record-bold-duotone' },
  
  // Media
  { id: 'media-camera', name: 'Camera', category: 'Media', keywords: ['photo', 'video', 'film'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'camera-bold-duotone' },
  { id: 'media-film', name: 'Film', category: 'Media', keywords: ['movie', 'video', 'cinema'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'film-bold-duotone' },
  { id: 'media-tv', name: 'TV', category: 'Media', keywords: ['television', 'broadcast', 'screen'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'tv-bold-duotone' },
  { id: 'media-radio', name: 'Radio', category: 'Media', keywords: ['audio', 'broadcast', 'music'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'radio-bold-duotone' },
  { id: 'media-play', name: 'Play Button', category: 'Media', keywords: ['video', 'stream', 'watch'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'play-bold-duotone' },
  
  // Sports
  { id: 'sports-ball', name: 'Ball', category: 'Sports', keywords: ['game', 'play', 'sport'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'football-bold-duotone' },
  { id: 'sports-trophy', name: 'Trophy', category: 'Sports', keywords: ['win', 'champion', 'award'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'cup-star-bold-duotone' },
  { id: 'sports-medal', name: 'Medal', category: 'Sports', keywords: ['award', 'achievement', 'gold'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'medal-bold-duotone' },
  { id: 'sports-whistle', name: 'Whistle', category: 'Sports', keywords: ['referee', 'game', 'sport'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'whistle-bold-duotone' },
  { id: 'sports-racket', name: 'Racket', category: 'Sports', keywords: ['tennis', 'badminton', 'game'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'tennis-bold-duotone' },
  
  // Lifestyle
  { id: 'lifestyle-home', name: 'Home', category: 'Lifestyle', keywords: ['house', 'living', 'domestic'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'home-bold-duotone' },
  { id: 'lifestyle-heart', name: 'Heart', category: 'Lifestyle', keywords: ['love', 'life', 'wellness'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'heart-angle-bold-duotone' },
  { id: 'lifestyle-sun', name: 'Sun', category: 'Lifestyle', keywords: ['weather', 'day', 'bright'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'sun-bold-duotone' },
  { id: 'lifestyle-moon', name: 'Moon', category: 'Lifestyle', keywords: ['night', 'sleep', 'dream'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'moon-bold-duotone' },
  { id: 'lifestyle-star', name: 'Star', category: 'Lifestyle', keywords: ['wish', 'dream', 'magic'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'star-fall-bold-duotone' },
  
  // Additional avatars to reach 100+
  { id: 'business-handshake', name: 'Handshake', category: 'Business', keywords: ['deal', 'partner', 'agreement'], gradient: GRADIENTS[15], iconLibrary: 'solar', iconName: 'hand-stars-bold-duotone' },
  { id: 'business-presentation', name: 'Presentation', category: 'Business', keywords: ['slides', 'meeting', 'talk'], gradient: GRADIENTS[16], iconLibrary: 'solar', iconName: 'presentation-graph-bold-duotone' },
  { id: 'tech-laptop', name: 'Laptop', category: 'Technology', keywords: ['computer', 'portable', 'work'], gradient: GRADIENTS[17], iconLibrary: 'solar', iconName: 'laptop-bold-duotone' },
  { id: 'tech-smartphone', name: 'Smartphone', category: 'Technology', keywords: ['mobile', 'phone', 'app'], gradient: GRADIENTS[18], iconLibrary: 'solar', iconName: 'smartphone-bold-duotone' },
  { id: 'dev-laptop-code', name: 'Laptop Code', category: 'Development', keywords: ['programming', 'coding', 'dev'], gradient: GRADIENTS[19], iconLibrary: 'solar', iconName: 'laptop-minimalistic-bold-duotone' },
  { id: 'game-vr', name: 'VR Headset', category: 'Gaming', keywords: ['virtual', 'reality', 'immersive'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'glasses-circle-bold-duotone' },
  { id: 'game-keyboard', name: 'Keyboard', category: 'Gaming', keywords: ['esports', 'pro', 'gaming'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'keyboard-bold-duotone' },
  { id: 'edu-microscope', name: 'Microscope', category: 'Education', keywords: ['science', 'lab', 'research'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'microscope-bold-duotone' },
  { id: 'edu-globe', name: 'Globe Edu', category: 'Education', keywords: ['world', 'geography', 'learn'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'globe-hemisphere-west-bold-duotone' },
  { id: 'health-bandage', name: 'Bandage', category: 'Healthcare', keywords: ['first aid', 'injury', 'heal'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'bandage-bold-duotone' },
  { id: 'finance-bank', name: 'Bank', category: 'Finance', keywords: ['institution', 'money', 'vault'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'bank-bold-duotone' },
  { id: 'finance-wallet', name: 'Wallet', category: 'Finance', keywords: ['money', 'cash', 'personal'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'wallet-bold-duotone' },
  { id: 'design-crop', name: 'Crop Tool', category: 'Design', keywords: ['edit', 'image', 'photo'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'crop-bold-duotone' },
  { id: 'design-eye', name: 'Eye Dropper', category: 'Design', keywords: ['color', 'pick', 'sample'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'eye-bold-duotone' },
  { id: 'marketing-email', name: 'Email', category: 'Marketing', keywords: ['newsletter', 'campaign', 'mail'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'letter-bold-duotone' },
  { id: 'marketing-social', name: 'Social Media', category: 'Marketing', keywords: ['network', 'share', 'viral'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'share-network-bold-duotone' },
  { id: 'eng-screwdriver', name: 'Screwdriver', category: 'Engineering', keywords: ['tool', 'fix', 'repair'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'screwdriver-bold-duotone' },
  { id: 'eng-saw', name: 'Saw', category: 'Engineering', keywords: ['cut', 'wood', 'construction'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'saw-bold-duotone' },
  { id: 'cloud-folder', name: 'Cloud Folder', category: 'Cloud', keywords: ['storage', 'files', 'documents'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'folder-bold-duotone' },
  { id: 'devops-kubernetes', name: 'Kubernetes', category: 'DevOps', keywords: ['k8s', 'orchestration', 'containers'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'circle-bold-duotone' },
  { id: 'devops-docker', name: 'Docker', category: 'DevOps', keywords: ['container', 'ship', 'deploy'], gradient: GRADIENTS[15], iconLibrary: 'solar', iconName: 'box-bold-duotone' },
  { id: 'ai-ml', name: 'Machine Learning', category: 'AI', keywords: ['ml', 'model', 'training'], gradient: GRADIENTS[16], iconLibrary: 'solar', iconName: 'graph-up-bold-duotone' },
  { id: 'ai-vision', name: 'Computer Vision', category: 'AI', keywords: ['image', 'recognition', 'ai'], gradient: GRADIENTS[17], iconLibrary: 'solar', iconName: 'eye-scan-bold-duotone' },
  { id: 'travel-car', name: 'Car', category: 'Travel', keywords: ['drive', 'road', 'trip'], gradient: GRADIENTS[18], iconLibrary: 'solar', iconName: 'car-bold-duotone' },
  { id: 'travel-train', name: 'Train', category: 'Travel', keywords: ['rail', 'transit', 'journey'], gradient: GRADIENTS[19], iconLibrary: 'solar', iconName: 'train-bold-duotone' },
  { id: 'food-icecream', name: 'Ice Cream', category: 'Food', keywords: ['dessert', 'sweet', 'cold'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'ice-cream-bold-duotone' },
  { id: 'food-sushi', name: 'Sushi', category: 'Food', keywords: ['japanese', 'fish', 'meal'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'fish-bold-duotone' },
  { id: 'retail-shoe', name: 'Shoe', category: 'Retail', keywords: ['fashion', 'footwear', 'style'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'shoe-bold-duotone' },
  { id: 'retail-glasses', name: 'Glasses', category: 'Retail', keywords: ['fashion', 'accessory', 'style'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'glasses-bold-duotone' },
  { id: 'music-piano', name: 'Piano', category: 'Music', keywords: ['instrument', 'keys', 'classic'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'piano-keys-bold-duotone' },
  { id: 'music-drums', name: 'Drums', category: 'Music', keywords: ['percussion', 'beat', 'rhythm'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'drum-bold-duotone' },
  { id: 'media-projector', name: 'Projector', category: 'Media', keywords: ['presentation', 'display', 'screen'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'projector-screen-bold-duotone' },
  { id: 'media-speaker', name: 'Speaker', category: 'Media', keywords: ['audio', 'sound', 'music'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'speaker-bold-duotone' },
  { id: 'sports-basketball', name: 'Basketball', category: 'Sports', keywords: ['hoop', 'nba', 'game'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'basketball-bold-duotone' },
  { id: 'sports-soccer', name: 'Soccer', category: 'Sports', keywords: ['football', 'goal', 'game'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'football-bold-duotone' },
  { id: 'lifestyle-tree', name: 'Tree', category: 'Lifestyle', keywords: ['nature', 'environment', 'green'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'tree-bold-duotone' },
  { id: 'lifestyle-flower', name: 'Flower', category: 'Lifestyle', keywords: ['nature', 'garden', 'beauty'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'flower-bold-duotone' },
  { id: 'business-conference', name: 'Conference', category: 'Business', keywords: ['meeting', 'event', 'summit'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'users-group-rounded-bold-duotone' },
  { id: 'business-deal', name: 'Deal', category: 'Business', keywords: ['contract', 'agreement', 'signed'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'file-check-bold-duotone' },
  { id: 'tech-tablet', name: 'Tablet', category: 'Technology', keywords: ['ipad', 'touch', 'mobile'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'tablet-bold-duotone' },
  { id: 'tech-watch', name: 'Smart Watch', category: 'Technology', keywords: ['wearable', 'time', 'fitness'], gradient: GRADIENTS[15], iconLibrary: 'solar', iconName: 'watch-bold-duotone' },
  { id: 'dev-github', name: 'GitHub', category: 'Development', keywords: ['code', 'repository', 'git'], gradient: GRADIENTS[16], iconLibrary: 'mdi', iconName: 'github' },
  { id: 'dev-vscode', name: 'VS Code', category: 'Development', keywords: ['editor', 'ide', 'coding'], gradient: GRADIENTS[17], iconLibrary: 'solar', iconName: 'code-2-bold-duotone' },
  { id: 'game-console', name: 'Game Console', category: 'Gaming', keywords: ['playstation', 'xbox', 'gaming'], gradient: GRADIENTS[18], iconLibrary: 'solar', iconName: 'gamepad-2-bold-duotone' },
  { id: 'game-arcade', name: 'Arcade', category: 'Gaming', keywords: ['retro', 'classic', 'games'], gradient: GRADIENTS[19], iconLibrary: 'solar', iconName: 'gameboy-bold-duotone' },
  { id: 'edu-atom', name: 'Atom', category: 'Education', keywords: ['science', 'physics', 'chemistry'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'atom-bold-duotone' },
  { id: 'edu-flask', name: 'Flask', category: 'Education', keywords: ['science', 'lab', 'chemistry'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'flask-bold-duotone' },
  { id: 'health-thermometer', name: 'Thermometer', category: 'Healthcare', keywords: ['temperature', 'fever', 'check'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'thermometer-bold-duotone' },
  { id: 'health-mask', name: 'Mask', category: 'Healthcare', keywords: ['protection', 'safety', 'health'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'mask-happy-bold-duotone' },
  { id: 'finance-graph', name: 'Graph', category: 'Finance', keywords: ['chart', 'analytics', 'data'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'graph-up-bold-duotone' },
  { id: 'finance-calculator', name: 'Calculator', category: 'Finance', keywords: ['math', 'compute', 'numbers'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'calculator-bold-duotone' },
  { id: 'design-vector', name: 'Vector', category: 'Design', keywords: ['svg', 'illustration', 'graphic'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'vector-bold-duotone' },
  { id: 'design-pixel', name: 'Pixel', category: 'Design', keywords: ['bitmap', 'image', 'art'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'grid-2-bold-duotone' },
  { id: 'marketing-seo', name: 'SEO', category: 'Marketing', keywords: ['search', 'optimization', 'ranking'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'search-bold-duotone' },
  { id: 'marketing-analytics', name: 'Analytics', category: 'Marketing', keywords: ['data', 'metrics', 'insights'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'chart-bold-duotone' },
  { id: 'eng-blueprint-tech', name: 'Blueprint Tech', category: 'Engineering', keywords: ['plan', 'technical', 'diagram'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'file-bold-duotone' },
  { id: 'eng-circuit', name: 'Circuit', category: 'Engineering', keywords: ['electronic', 'board', 'hardware'], gradient: GRADIENTS[11], iconLibrary: 'solar', iconName: 'cpu-bolt-bold-duotone' },
  { id: 'cloud-backup', name: 'Cloud Backup', category: 'Cloud', keywords: ['archive', 'save', 'protect'], gradient: GRADIENTS[12], iconLibrary: 'solar', iconName: 'archive-bold-duotone' },
  { id: 'devops-logs', name: 'Logs', category: 'DevOps', keywords: ['monitoring', 'debug', 'trace'], gradient: GRADIENTS[13], iconLibrary: 'solar', iconName: 'document-text-bold-duotone' },
  { id: 'devops-alerts', name: 'Alerts', category: 'DevOps', keywords: ['notification', 'warning', 'monitor'], gradient: GRADIENTS[14], iconLibrary: 'solar', iconName: 'danger-triangle-bold-duotone' },
  { id: 'ai-nlp', name: 'NLP', category: 'AI', keywords: ['language', 'text', 'processing'], gradient: GRADIENTS[15], iconLibrary: 'solar', iconName: 'translate-bold-duotone' },
  { id: 'ai-chatbot', name: 'Chatbot', category: 'AI', keywords: ['assistant', 'ai', 'conversation'], gradient: GRADIENTS[16], iconLibrary: 'solar', iconName: 'chat-dots-bold-duotone' },
  { id: 'travel-boat', name: 'Boat', category: 'Travel', keywords: ['ship', 'sail', 'water'], gradient: GRADIENTS[17], iconLibrary: 'solar', iconName: 'boat-bold-duotone' },
  { id: 'travel-camp', name: 'Camping', category: 'Travel', keywords: ['tent', 'outdoor', 'nature'], gradient: GRADIENTS[18], iconLibrary: 'solar', iconName: 'tent-bold-duotone' },
  { id: 'food-barbecue', name: 'Barbecue', category: 'Food', keywords: ['grill', 'bbq', 'meat'], gradient: GRADIENTS[19], iconLibrary: 'solar', iconName: 'fire-bold-duotone' },
  { id: 'food-wine', name: 'Wine', category: 'Food', keywords: ['drink', 'alcohol', 'vineyard'], gradient: GRADIENTS[0], iconLibrary: 'solar', iconName: 'wine-bold-duotone' },
  { id: 'retail-watch', name: 'Watch Retail', category: 'Retail', keywords: ['timepiece', 'luxury', 'fashion'], gradient: GRADIENTS[1], iconLibrary: 'solar', iconName: 'watch-bold-duotone' },
  { id: 'retail-perfume', name: 'Perfume', category: 'Retail', keywords: ['fragrance', 'beauty', 'luxury'], gradient: GRADIENTS[2], iconLibrary: 'solar', iconName: 'perfume-bold-duotone' },
  { id: 'music-saxophone', name: 'Saxophone', category: 'Music', keywords: ['jazz', 'instrument', 'brass'], gradient: GRADIENTS[3], iconLibrary: 'solar', iconName: 'saxophone-bold-duotone' },
  { id: 'music-violin', name: 'Violin', category: 'Music', keywords: ['classical', 'strings', 'orchestra'], gradient: GRADIENTS[4], iconLibrary: 'solar', iconName: 'music-notes-bold-duotone' },
  { id: 'media-microphone-pro', name: 'Pro Microphone', category: 'Media', keywords: ['studio', 'recording', 'audio'], gradient: GRADIENTS[5], iconLibrary: 'solar', iconName: 'mic-bold-duotone' },
  { id: 'media-headset', name: 'Headset', category: 'Media', keywords: ['gaming', 'audio', 'communication'], gradient: GRADIENTS[6], iconLibrary: 'solar', iconName: 'headphones-round-bold-duotone' },
  { id: 'sports-golf', name: 'Golf', category: 'Sports', keywords: ['club', 'course', 'sport'], gradient: GRADIENTS[7], iconLibrary: 'solar', iconName: 'golf-club-bold-duotone' },
  { id: 'sports-tennis', name: 'Tennis', category: 'Sports', keywords: ['racket', 'court', 'sport'], gradient: GRADIENTS[8], iconLibrary: 'solar', iconName: 'tennis-ball-bold-duotone' },
  { id: 'lifestyle-mountain', name: 'Mountain', category: 'Lifestyle', keywords: ['hike', 'nature', 'adventure'], gradient: GRADIENTS[9], iconLibrary: 'solar', iconName: 'mountains-bold-duotone' },
  { id: 'lifestyle-beach', name: 'Beach', category: 'Lifestyle', keywords: ['ocean', 'sand', 'vacation'], gradient: GRADIENTS[10], iconLibrary: 'solar', iconName: 'sea-wave-bold-duotone' }
];

export function getRandomAvatar(): WorkspaceAvatar {
  const randomIndex = Math.floor(Math.random() * WORKSPACE_AVATARS.length);
  return WORKSPACE_AVATARS[randomIndex];
}

export function getAvatarById(id: string): WorkspaceAvatar | undefined {
  return WORKSPACE_AVATARS.find(avatar => avatar.id === id);
}

export function filterAvatarsByCategory(category: string): WorkspaceAvatar[] {
  return WORKSPACE_AVATARS.filter(avatar => avatar.category === category);
}

export function searchAvatars(query: string): WorkspaceAvatar[] {
  const lowerQuery = query.toLowerCase();
  return WORKSPACE_AVATARS.filter(avatar =>
    avatar.name.toLowerCase().includes(lowerQuery) ||
    avatar.category.toLowerCase().includes(lowerQuery) ||
    avatar.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
  );
}
