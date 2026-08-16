export interface ShowcaseCardItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  badgeColor?: string;
  description: string;
  videoUrl: string;
  startTime?: number;
  durationText: string;
  category: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  metrics?: {
    views?: string;
    likes?: string;
    resolution?: string;
    fps?: string;
  };
}
