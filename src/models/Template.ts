export interface Template {
  id: string;
  name: string;
  category: 'Modern' | 'Classic' | 'Creative' | 'Executive';
  role: string[];
  atsSafe: boolean;
  description: string;
  thumbnailUrl?: string;
  layoutConfig?: {
    fontFamily: string;
    primaryColor: string;
    spacing: 'compact' | 'normal' | 'comfortable';
  };
}
