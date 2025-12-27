
export enum IssueType {
  POTHOLE = 'Infrastructure: Pothole',
  WASTE = 'Environment: Waste/Litter',
  LIGHTING = 'Utility: Broken Streetlight',
  FLOODING = 'Safety: Flooding',
  ACCESSIBILITY = 'Safety: Accessibility Barrier',
  TRAFFIC_SIGNAL = 'Utility: Traffic Signal Malfunction',
  VANDALISM = 'Public: Art Vandalism',
  OTHER = 'Other'
}

export enum Severity {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum Status {
  PENDING = 'Pending',
  REVIEWING = 'Reviewing',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved'
}

export type Language = 'English' | 'Español' | 'Hindi' | 'Tamil';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinedDate: number;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

export interface AIAnalysis {
  issueType: IssueType;
  severity: Severity;
  priorityScore: number;
  citizenSummary: string;
  authorityAction: string;
  detectedDuplicatesCount: number;
  likelyDuplicateId?: string;
}

export interface IssueReport {
  id: string;
  timestamp: number;
  description: string;
  image?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  analysis?: AIAnalysis;
  status: Status;
  citizenId: string;
  comments?: Comment[];
  upvotes?: number;
  upvotedBy?: string[];
}

export interface ImpactStats {
  totalResolved: number;
  avgResponseTime: string;
  communityBenefitScore: number;
  citizenSatisfaction: number;
}
