import { useState, useMemo, useEffect } from 'react';
import { KnowledgeSidebar } from './components/knowledge-sidebar';
import { ArticleCard } from './components/article-card';
import { ArticleEditor } from './components/article-editor';
import { ArticleViewer } from './components/article-viewer';
import { Contributors } from './components/contributors';
import { ContributorProfile } from './components/contributor-profile';
import { CaseFeed } from './components/case-feed';
import { ManagerApproval } from './components/manager-approval';
import { DirectorApproval } from './components/director-approval';
import { Dashboard } from './components/dashboard';
import { ContributorAnalytics } from './components/contributor-analytics';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { X, Plus, FileText, Keyboard, HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './components/ui/dialog';

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface Division {
  id: string;
  name: string;
  count: number;
}

interface Department {
  id: string;
  name: string;
  divisionId: string;
  count: number;
}

interface Section {
  id: string;
  name: string;
  departmentId: string;
  count: number;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadProgress?: number;
  isUploading?: boolean;
}

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  categoryColor: string;
  lastModified: string;
  createdAt: number; // Timestamp for sorting
  views: number;
  isFavorite: boolean;
  author: string;
  authorAvatar: string;
  stars: number;
  keywords: string[];
  divisionId: string;
  departmentId: string;
  sectionId: string;
  likes: number;
  isLiked: boolean;
  isSaved: boolean;
  comments: Comment[];
  attachments?: UploadedFile[];
  rootCause?: string;
  solution?: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedAt?: number; // Timestamp when approved
}

interface Contributor {
  id: string;
  name: string;
  avatar: string;
  divisionId: string;
  departmentId: string;
  sectionId: string;
  totalStars: number;
  caseCount: number;
  isFollowed: boolean;
  joinDate: string;
  bio?: string;
}

type ViewMode = 'list' | 'feed' | 'edit' | 'view' | 'new' | 'contributors' | 'contributor-profile' | 'manager-approval' | 'director-approval' | 'dashboard' | 'contributor-analytics';

// Mock data
const mockCategories: Category[] = [
  { id: '1', name: 'Documentation', count: 5, color: '#3b82f6' },
  { id: '2', name: 'Tutorials', count: 3, color: '#10b981' },
  { id: '3', name: 'FAQ', count: 7, color: '#f59e0b' },
  { id: '4', name: 'Best Practices', count: 2, color: '#8b5cf6' },
  { id: '5', name: 'Troubleshooting', count: 4, color: '#ef4444' },
];

const mockDivisions: Division[] = [
  { id: 'ct', name: 'CT', count: 0 },
  { id: 'fm', name: 'FM', count: 0 },
  { id: 'it', name: 'IT', count: 0 },
  { id: 'mpe', name: 'MP&E', count: 0 },
  { id: 'pbd', name: 'Program & Business Development', count: 0 },
  { id: 'finance', name: 'Finance', count: 0 },
  { id: 'hr', name: 'HR & Admin', count: 0 },
  { id: 'sbe', name: 'Strategy & Business Excellence', count: 0 },
  { id: 'mgmt', name: 'Management', count: 0 },
];

const mockDepartments: Department[] = [
  { id: 'rno', name: 'Radio Network Optimization', divisionId: 'ct', count: 0 },
  { id: 'bo', name: 'Back Office', divisionId: 'ct', count: 0 },
  { id: 'fo', name: 'Front Office', divisionId: 'ct', count: 0 },
  { id: 'comm-proc', name: 'Commercial Procurement', divisionId: 'finance', count: 0 },
  { id: 'accounting', name: 'Accounting', divisionId: 'finance', count: 0 },
  { id: 'contract', name: 'Contract', divisionId: 'finance', count: 0 },
  { id: 'tech-proc', name: 'Technical Procurement', divisionId: 'finance', count: 0 },
  { id: 'finance-dept', name: 'Finance', divisionId: 'finance', count: 0 },
  { id: 'fm-safety', name: 'FM Safety & Security', divisionId: 'fm', count: 0 },
  { id: 'fm-quality', name: 'FM Quality & Audit', divisionId: 'fm', count: 0 },
  { id: 'fm-support', name: 'FM Support', divisionId: 'fm', count: 0 },
  { id: 'fm-operation', name: 'FM Operation', divisionId: 'fm', count: 0 },
  { id: 'hr-admin', name: 'HR & Admin', divisionId: 'hr', count: 0 },
  { id: 'app-ops', name: 'Applications Operations', divisionId: 'it', count: 0 },
  { id: 'it-security', name: 'IT Network & Information Security', divisionId: 'it', count: 0 },
  { id: 'op-support', name: 'Operation Support', divisionId: 'it', count: 0 },
  { id: 'cloud-infra', name: 'Cloud & Infrastructure Operations', divisionId: 'it', count: 0 },
  { id: 'it-pmo', name: 'IT PMO', divisionId: 'it', count: 0 },
  { id: 'imp-ps', name: 'IMP P&S', divisionId: 'it', count: 0 },
  { id: 'mgmt-dept', name: 'Management', divisionId: 'mgmt', count: 0 },
  { id: 'engineering', name: 'Engineering', divisionId: 'mpe', count: 0 },
  { id: 'planning', name: 'Planning', divisionId: 'mpe', count: 0 },
  { id: 'mpe-program', name: 'MP&E Program', divisionId: 'mpe', count: 0 },
  { id: 'bus-dev', name: 'Business Development', divisionId: 'pbd', count: 0 },
  { id: 'corp-pmo', name: 'Corporate PMO', divisionId: 'pbd', count: 0 },
  { id: 'sbe-dept', name: 'Strategy & Business Excellence', divisionId: 'sbe', count: 0 },
  { id: 'rec-od', name: 'Rec & OD & LD', divisionId: 'hr', count: 0 },
  { id: 'total-rewards', name: 'Total Rewards & Employee Relations', divisionId: 'hr', count: 0 },
  { id: 'call-center', name: 'Call Center Project', divisionId: 'it', count: 0 },
  { id: 'it-dept', name: 'IT', divisionId: 'it', count: 0 },
  { id: 'ct-dept', name: 'CT', divisionId: 'ct', count: 0 },
  { id: 'digital-marketing', name: 'Digital Marketing', divisionId: 'pbd', count: 0 },
  { id: 'digital-service', name: 'Digital Service', divisionId: 'pbd', count: 0 },
  { id: 'strategy-planning', name: 'Strategy & Business Planning', divisionId: 'sbe', count: 0 },
  { id: 'fm-dept', name: 'FM', divisionId: 'fm', count: 0 },
  { id: 'administration', name: 'Administration', divisionId: 'hr', count: 0 },
  { id: 'pbd-dept', name: 'Program & Business Development', divisionId: 'pbd', count: 0 },
  { id: 'bus-excellence', name: 'Business Excellence', divisionId: 'sbe', count: 0 },
];

const mockSections: Section[] = [
  { id: 'ct-section', name: 'CT', departmentId: 'ct-dept', count: 0 },
  { id: 'rno-h', name: 'RNO-H', departmentId: 'rno', count: 0 },
  { id: 'rno-e', name: 'RNO-E', departmentId: 'rno', count: 0 },
  { id: 'rno-section', name: 'RNO', departmentId: 'rno', count: 0 },
  { id: 'dt-pp', name: 'DT & PP', departmentId: 'rno', count: 0 },
  { id: 'ct-bo-ip', name: 'CT BO IP-Core', departmentId: 'bo', count: 0 },
  { id: 'ct-bo-access', name: 'CT BO Access', departmentId: 'bo', count: 0 },
  { id: 'ct-bo-transport', name: 'CT BO Transport', departmentId: 'bo', count: 0 },
  { id: 'ct-bo-core', name: 'CT BO Core', departmentId: 'bo', count: 0 },
  { id: 'ct-fo', name: 'CT FO', departmentId: 'fo', count: 0 },
  { id: 'ct-pm', name: 'CT PM', departmentId: 'ct-dept', count: 0 },
  { id: 'ct-sm', name: 'CT SM', departmentId: 'ct-dept', count: 0 },
  { id: 'ct-vacant', name: 'CT Vacant', departmentId: 'ct-dept', count: 0 },
  { id: 'contract-section', name: 'Contract', departmentId: 'contract', count: 0 },
  { id: 'comm-proc-section', name: 'Commercial Procurement', departmentId: 'comm-proc', count: 0 },
  { id: 'accounting-section', name: 'Accounting', departmentId: 'accounting', count: 0 },
  { id: 'ar', name: 'AR', departmentId: 'accounting', count: 0 },
  { id: 'ap', name: 'AP', departmentId: 'accounting', count: 0 },
  { id: 'finance-section', name: 'Finance', departmentId: 'finance-dept', count: 0 },
  { id: 'treasury', name: 'Treasury', departmentId: 'finance-dept', count: 0 },
  { id: 'tech-proc-section', name: 'Technical Procurement', departmentId: 'tech-proc', count: 0 },
  { id: 'tech-proc-vacant', name: 'Technical Procurement Vacant', departmentId: 'tech-proc', count: 0 },
  { id: 'fm-section', name: 'FM', departmentId: 'fm-dept', count: 0 },
  { id: 'audit', name: 'Audit', departmentId: 'fm-quality', count: 0 },
  { id: 'zone1-omd', name: 'Zone 1-OMD&KTN', departmentId: 'fm-operation', count: 0 },
  { id: 'zone1-ktm', name: 'Zone 1-KTM', departmentId: 'fm-operation', count: 0 },
  { id: 'zone2-4', name: 'Zone 2 & 4', departmentId: 'fm-operation', count: 0 },
  { id: 'data-center', name: 'Data Center', departmentId: 'fm-operation', count: 0 },
  { id: 'zone3', name: 'Zone 3', departmentId: 'fm-operation', count: 0 },
  { id: 'zone5', name: 'Zone 5', departmentId: 'fm-operation', count: 0 },
  { id: 'out-site', name: 'Out Site Plant', departmentId: 'fm-operation', count: 0 },
  { id: 'fuel-topup', name: 'Fuel & Top up', departmentId: 'fm-support', count: 0 },
  { id: 'power-support', name: 'Power Support', departmentId: 'fm-support', count: 0 },
  { id: 'spare-part', name: 'Spare part & Extra work', departmentId: 'fm-support', count: 0 },
  { id: 'quality', name: 'Quality', departmentId: 'fm-quality', count: 0 },
  { id: 'fm-quality-section', name: 'FM Quality & Audit', departmentId: 'fm-quality', count: 0 },
  { id: 'fm-safety-section', name: 'FM Safety & Security', departmentId: 'fm-safety', count: 0 },
  { id: 'rec-od-section', name: 'Rec & OD & LD', departmentId: 'rec-od', count: 0 },
  { id: 'transportation', name: 'Transportation', departmentId: 'administration', count: 0 },
  { id: 'protocol', name: 'Protocol', departmentId: 'administration', count: 0 },
  { id: 'hr-admin-section', name: 'HR & Admin', departmentId: 'hr-admin', count: 0 },
  { id: 'payroll', name: 'Payroll', departmentId: 'hr-admin', count: 0 },
  { id: 'total-rewards-section', name: 'Total Rewards & Employee Relations', departmentId: 'total-rewards', count: 0 },
  { id: 'employee-relations', name: 'Employee Relations', departmentId: 'total-rewards', count: 0 },
  { id: 'support-services', name: 'Support Services', departmentId: 'hr-admin', count: 0 },
  { id: 'call-center-section', name: 'Call Center Project', departmentId: 'call-center', count: 0 },
  { id: 'it-section', name: 'IT', departmentId: 'it-dept', count: 0 },
  { id: 'cloud-os', name: 'Cloud & OS Server Operations', departmentId: 'cloud-infra', count: 0 },
  { id: 'eus-qms', name: 'EUS & QMS', departmentId: 'app-ops', count: 0 },
  { id: 'dba', name: 'DBA', departmentId: 'app-ops', count: 0 },
  { id: 'it-network-security', name: 'IT Network Security Operations', departmentId: 'it-security', count: 0 },
  { id: 'info-security', name: 'Information Security', departmentId: 'it-security', count: 0 },
  { id: 'otf', name: 'OTF', departmentId: 'op-support', count: 0 },
  { id: 'vas-ops', name: 'VAS Operations', departmentId: 'app-ops', count: 0 },
  { id: 'enterprise-apps', name: 'Enterprise Applications Operations', departmentId: 'app-ops', count: 0 },
  { id: 'billing-ops', name: 'Billing Operations', departmentId: 'app-ops', count: 0 },
  { id: 'charging-ops', name: 'Charging Operations', departmentId: 'app-ops', count: 0 },
  { id: 'roaming-interconnect', name: 'Roaming & Interconnect Operations', departmentId: 'app-ops', count: 0 },
  { id: 'imp-ps-section', name: 'IMP P&S', departmentId: 'imp-ps', count: 0 },
  { id: 'it-network-planning', name: 'IT Network Planning', departmentId: 'planning', count: 0 },
  { id: 'infra-planning', name: 'Infrastructure Planning', departmentId: 'planning', count: 0 },
  { id: 'op-support-section', name: 'Operation Support', departmentId: 'op-support', count: 0 },
  { id: 'oss', name: 'OSS', departmentId: 'op-support', count: 0 },
  { id: 'bi-automation', name: 'BI & Automation', departmentId: 'op-support', count: 0 },
  { id: 'it-pmo-section', name: 'IT PMO', departmentId: 'it-pmo', count: 0 },
  { id: 'mgmt-section', name: 'Management', departmentId: 'mgmt-dept', count: 0 },
  { id: 'transport-impl', name: 'Transport Implementation', departmentId: 'engineering', count: 0 },
  { id: 'mpe-section', name: 'MP&E', departmentId: 'mpe-program', count: 0 },
  { id: 'transmission-planning', name: 'Transmission Planning', departmentId: 'planning', count: 0 },
  { id: 'radio-planning', name: 'Radio Planning', departmentId: 'planning', count: 0 },
  { id: 'ip-planning', name: 'IP Planning', departmentId: 'planning', count: 0 },
  { id: 'access', name: 'Access', departmentId: 'engineering', count: 0 },
  { id: 'site-acquisition', name: 'Site Acquisition', departmentId: 'engineering', count: 0 },
  { id: 'power', name: 'Power', departmentId: 'engineering', count: 0 },
  { id: 'civil', name: 'Civil', departmentId: 'engineering', count: 0 },
  { id: 'engineering-section', name: 'Engineering', departmentId: 'engineering', count: 0 },
  { id: 'mpe-program-section', name: 'MP&E Program', departmentId: 'mpe-program', count: 0 },
  { id: 'bus-dev-section', name: 'Business Development', departmentId: 'bus-dev', count: 0 },
  { id: 'pbd-section', name: 'Program & Business Development', departmentId: 'pbd-dept', count: 0 },
  { id: 'digital-marketing-section', name: 'Digital Marketing', departmentId: 'digital-marketing', count: 0 },
  { id: 'digital-service-section', name: 'Digital Service', departmentId: 'digital-service', count: 0 },
  { id: 'corp-pmo-section', name: 'Corporate PMO', departmentId: 'corp-pmo', count: 0 },
  { id: 'bus-performance', name: 'Business Performance', departmentId: 'sbe-dept', count: 0 },
  { id: 'internal-control', name: 'Internal control', departmentId: 'sbe-dept', count: 0 },
  { id: 'strategy-planning-section', name: 'Strategy & Business Planning', departmentId: 'strategy-planning', count: 0 },
  { id: 'bp-budgeting', name: 'BP & Budgeting', departmentId: 'strategy-planning', count: 0 },
  { id: 'bus-planning', name: 'Business Planning', departmentId: 'strategy-planning', count: 0 },
  { id: 'sbe-section', name: 'Strategy & Business Excellence', departmentId: 'bus-excellence', count: 0 },
  { id: 'strategy', name: 'Strategy', departmentId: 'bus-excellence', count: 0 },
];

const mockContributors: Contributor[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'it',
    departmentId: 'app-ops',
    sectionId: 'enterprise-apps',
    totalStars: 23,
    caseCount: 8,
    isFollowed: false,
    joinDate: '2023-01-15',
    bio: 'Senior Developer specializing in React and enterprise applications'
  },
  {
    id: '2',
    name: 'Mike Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTc5MjE1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'ct',
    departmentId: 'bo',
    sectionId: 'ct-bo-core',
    totalStars: 35,
    caseCount: 12,
    isFollowed: true,
    joinDate: '2022-11-03',
    bio: 'Core Systems Architect with expertise in API design'
  },
  {
    id: '3',
    name: 'Lisa Wang',
    avatar: 'https://images.unsplash.com/photo-1754298949882-216a1c92dbb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc3dvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3ODM5MDU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'hr',
    departmentId: 'hr-admin',
    sectionId: 'hr-admin-section',
    totalStars: 18,
    caseCount: 6,
    isFollowed: false,
    joinDate: '2023-03-22',
    bio: 'HR specialist focused on process optimization and security'
  },
  {
    id: '4',
    name: 'Ahmed Hassan',
    avatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzgzNDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'mpe',
    departmentId: 'engineering',
    sectionId: 'power',
    totalStars: 42,
    caseCount: 15,
    isFollowed: true,
    joinDate: '2022-08-17',
    bio: 'Power Systems Engineer with 10+ years experience'
  },
  {
    id: '5',
    name: 'Maria Santos',
    avatar: 'https://images.unsplash.com/photo-1742119971773-57e0131095b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVtYmVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTIzNzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'finance',
    departmentId: 'accounting',
    sectionId: 'ar',
    totalStars: 29,
    caseCount: 9,
    isFollowed: false,
    joinDate: '2023-02-10',
    bio: 'Senior Accountant specializing in receivables management'
  },
  {
    id: '6',
    name: 'David Kim',
    avatar: 'https://images.unsplash.com/photo-1706613749339-a70071f2229f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc1NzgzMTU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    divisionId: 'fm',
    departmentId: 'fm-operation',
    sectionId: 'data-center',
    totalStars: 31,
    caseCount: 11,
    isFollowed: true,
    joinDate: '2022-12-05',
    bio: 'Data Center Operations Manager with cloud infrastructure expertise'
  }
];

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: `# Getting Started with React

React is a powerful JavaScript library for building user interfaces. In this guide, we'll walk through the fundamentals of React development.

## Prerequisites

Before starting with React, you should have:
- Basic knowledge of HTML, CSS, and JavaScript
- Node.js installed on your computer
- A code editor (VS Code recommended)

## Creating Your First App

1. Install Create React App globally:
   \`\`\`bash
   npm install -g create-react-app
   \`\`\`

2. Create a new React application:
   \`\`\`bash
   npx create-react-app my-app
   cd my-app
   npm start
   \`\`\`

## Understanding Components

Components are the building blocks of React applications. They let you split the UI into independent, reusable pieces.

### Functional Components

\`\`\`jsx
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

This is the modern way to write React components using functions.

## Next Steps

- Learn about JSX syntax
- Understand props and state
- Explore React hooks
- Build your first interactive component`,
    category: 'Tutorials',
    categoryColor: '#10b981',
    lastModified: '2 days ago',
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    views: 127,
    isFavorite: true,
    author: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 4,
    keywords: ['react', 'javascript', 'tutorial', 'beginner'],
    divisionId: 'it',
    departmentId: 'app-ops',
    sectionId: 'enterprise-apps',
    likes: 24,
    isLiked: false,
    isSaved: true,
    rootCause: 'New developers need guidance on React fundamentals',
    status: 'approved',
    approvedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // Approved 2 days ago - show as NEW
    attachments: [
      {
        id: '1',
        name: 'React_Getting_Started_Guide.pdf',
        size: 2456789,
        type: 'application/pdf',
        url: '#'
      },
      {
        id: '2',
        name: 'sample_component.jsx',
        size: 15432,
        type: 'text/javascript',
        url: '#'
      },
      {
        id: '3',
        name: 'react_architecture_diagram.png',
        size: 892345,
        type: 'image/png',
        url: '#'
      }
    ],
    comments: [
      {
        id: '1',
        author: 'Mike Rodriguez',
        authorAvatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTc5MjE1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Great tutorial! Very helpful for beginners.',
        timestamp: '2 hours ago',
        likes: 3,
        isLiked: false
      },
      {
        id: '2',
        author: 'Lisa Wang',
        authorAvatar: 'https://images.unsplash.com/photo-1754298949882-216a1c92dbb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc3dvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3ODM5MDU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Thanks for sharing! Will bookmark this for our team.',
        timestamp: '1 hour ago',
        likes: 1,
        isLiked: true
      }
    ]
  },
  {
    id: '2',
    title: 'API Documentation Standards',
    content: `# API Documentation Standards

Good API documentation is crucial for developer adoption and success. Here are our standards for creating excellent API docs.

## Structure

Every API endpoint should include:
- Clear description of purpose
- Request/response examples
- Parameter definitions
- Error codes and messages
- Rate limiting information

## Examples

Always provide working code examples in multiple languages:

\`\`\`javascript
// JavaScript example
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer token'
  }
})
.then(response => response.json())
.then(data => console.log(data));
\`\`\`

## Best Practices

1. Keep examples simple but realistic
2. Include common error scenarios
3. Update docs when APIs change
4. Test all code examples
5. Use consistent formatting`,
    category: 'Documentation',
    categoryColor: '#3b82f6',
    lastModified: '1 week ago',
    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 1 week ago
    views: 89,
    isFavorite: false,
    author: 'Current User',
    authorAvatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTc5MjE1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 5,
    keywords: ['api', 'documentation', 'standards'],
    divisionId: 'ct',
    departmentId: 'bo',
    sectionId: 'ct-bo-core',
    likes: 18,
    isLiked: true,
    isSaved: false,
    rootCause: 'Inconsistent API documentation across teams',
    status: 'pending_manager',
    rejectionReason: 'Please add more code examples in Python and Java. The current examples are too basic.',
    attachments: [
      {
        id: '4',
        name: 'API_Documentation_Template.docx',
        size: 1234567,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '#'
      },
      {
        id: '5',
        name: 'postman_collection.json',
        size: 45678,
        type: 'application/json',
        url: '#'
      }
    ],
    comments: [
      {
        id: '3',
        author: 'Ahmed Hassan',
        authorAvatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzgzNDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Excellent standards! We should adopt these practices.',
        timestamp: '3 hours ago',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: '3',
    title: 'How to Reset Your Password',
    content: `# How to Reset Your Password

If you've forgotten your password or need to change it for security reasons, follow these steps:

## Method 1: Password Reset Email

1. Go to the login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email for the reset link
5. Click the link and follow instructions
6. Create a new strong password

## Method 2: Account Settings

If you're already logged in:

1. Go to Account Settings
2. Click "Security" tab
3. Select "Change Password"
4. Enter your current password
5. Create a new password
6. Confirm the new password
7. Click "Update Password"

## Password Requirements

Your new password must:
- Be at least 8 characters long
- Include uppercase and lowercase letters
- Contain at least one number
- Include a special character (!@#$%^&*)

## Troubleshooting

**Not receiving the reset email?**
- Check your spam/junk folder
- Ensure you entered the correct email
- Wait 5 minutes and try again

**Reset link expired?**
- Request a new reset email
- Links expire after 1 hour for security

## Security Tips

- Never share your password
- Use a unique password for this account
- Consider using a password manager
- Enable two-factor authentication`,
    category: 'FAQ',
    categoryColor: '#f59e0b',
    lastModified: '3 days ago',
    createdAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
    views: 245,
    isFavorite: false,
    author: 'Lisa Wang',
    authorAvatar: 'https://images.unsplash.com/photo-1754298949882-216a1c92dbb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc3dvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3ODM5MDU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 3,
    keywords: ['password', 'security', 'account', 'faq'],
    rootCause: 'Users frequently forget passwords and need assistance',
    status: 'approved',
    approvedAt: Date.now() - (3 * 24 * 60 * 60 * 1000), // Approved 3 days ago - show as NEW
    divisionId: 'hr',
    departmentId: 'hr-admin',
    sectionId: 'hr-admin-section',
    likes: 12,
    isLiked: false,
    isSaved: true,
    attachments: [
      {
        id: '6',
        name: 'password_reset_flowchart.pdf',
        size: 567890,
        type: 'application/pdf',
        url: '#'
      }
    ],
    comments: []
  },
  {
    id: '4',
    title: 'Power System Maintenance Guidelines',
    content: `# Power System Maintenance Guidelines

Proper maintenance of power systems is crucial for ensuring reliable operation and extending equipment life.

## Daily Checks

- Monitor system voltage and current readings
- Check for any visible damage or overheating
- Verify all safety systems are operational
- Document all readings in maintenance log

## Weekly Maintenance

1. **Battery Systems**
   - Check electrolyte levels
   - Clean terminals and connections  
   - Test backup systems

2. **Generator Systems**
   - Check fuel levels
   - Test automatic start systems
   - Inspect cooling systems

## Monthly Tasks

- Perform load testing
- Check all electrical connections
- Review and update maintenance schedules
- Calibrate monitoring equipment

## Safety Protocols

Always follow lockout/tagout procedures when working on electrical systems. Ensure proper PPE is worn at all times.

## Emergency Procedures

In case of system failure:
1. Implement emergency shutdown procedures
2. Switch to backup systems if available
3. Contact emergency response team
4. Document incident details`,
    category: 'Best Practices',
    categoryColor: '#8b5cf6',
    lastModified: '1 day ago',
    createdAt: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
    views: 156,
    isFavorite: false,
    author: 'Ahmed Hassan',
    authorAvatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzgzNDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 5,
    keywords: ['power', 'maintenance', 'safety', 'guidelines'],
    rootCause: 'Power systems require regular maintenance to prevent failures',
    solution: 'Implement comprehensive maintenance schedule with safety protocols',
    status: 'pending_director',
    divisionId: 'mpe',
    departmentId: 'engineering',
    sectionId: 'power',
    likes: 31,
    isLiked: true,
    isSaved: false,
    attachments: [
      {
        id: '7',
        name: 'Power_System_Maintenance_Checklist.xlsx',
        size: 234567,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '#'
      },
      {
        id: '8',
        name: 'safety_protocols.pdf',
        size: 1890123,
        type: 'application/pdf',
        url: '#'
      },
      {
        id: '9',
        name: 'equipment_diagrams.zip',
        size: 5678901,
        type: 'application/zip',
        url: '#'
      }
    ],
    comments: [
      {
        id: '4',
        author: 'David Kim',
        authorAvatar: 'https://images.unsplash.com/photo-1706613749339-a70071f2229f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc1NzgzMTU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Safety protocols are spot on. Very comprehensive guide.',
        timestamp: '5 hours ago',
        likes: 8,
        isLiked: true
      },
      {
        id: '5',
        author: 'Maria Santos',
        authorAvatar: 'https://images.unsplash.com/photo-1742119971773-57e0131095b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVtYmVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTIzNzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Will share this with our maintenance team.',
        timestamp: '4 hours ago',
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: '5',
    title: 'Accounts Receivable Best Practices',
    content: `# Accounts Receivable Best Practices

Effective accounts receivable management is essential for maintaining healthy cash flow and building strong customer relationships.

## Invoice Management

### Prompt Invoicing
- Send invoices immediately upon delivery/completion
- Use automated invoicing systems when possible
- Include clear payment terms and due dates

### Invoice Accuracy
- Double-check all calculations and details
- Include proper purchase order references
- Provide detailed descriptions of services/products

## Collection Strategies

### Follow-up Schedule
- Day 1: Send invoice
- Day 30: First reminder (friendly)
- Day 45: Second reminder (firmer tone)
- Day 60: Phone call
- Day 75: Final notice
- Day 90: Collections agency/legal action

### Communication Tips
- Be professional but persistent
- Keep detailed records of all communications
- Offer payment plans when appropriate
- Focus on maintaining customer relationships

## Key Metrics to Track

1. **Days Sales Outstanding (DSO)**
2. **Collection effectiveness index**
3. **Aging reports**
4. **Bad debt percentages**

## Technology Solutions

Consider implementing:
- Automated reminder systems
- Online payment portals
- Credit monitoring services
- Integration with accounting software`,
    category: 'Best Practices',
    categoryColor: '#8b5cf6',
    lastModified: '4 days ago',
    createdAt: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
    views: 78,
    isFavorite: true,
    author: 'Maria Santos',
    authorAvatar: 'https://images.unsplash.com/photo-1742119971773-57e0131095b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwbWVtYmVyJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3OTIzNzQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 4,
    keywords: ['accounting', 'receivables', 'cash-flow', 'finance'],
    rootCause: 'Poor accounts receivable management affecting cash flow',
    status: 'approved',
    approvedAt: Date.now() - (4 * 24 * 60 * 60 * 1000), // Approved 4 days ago - show as NEW
    divisionId: 'finance',
    departmentId: 'accounting',
    sectionId: 'ar',
    likes: 15,
    isLiked: false,
    isSaved: true,
    attachments: [
      {
        id: '10',
        name: 'AR_Best_Practices_Template.xlsx',
        size: 345678,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '#'
      },
      {
        id: '11',
        name: 'collection_letter_templates.docx',
        size: 123456,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '#'
      }
    ],
    comments: [
      {
        id: '6',
        author: 'Sarah Chen',
        authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Very practical tips. DSO calculations are particularly useful.',
        timestamp: '6 hours ago',
        likes: 4,
        isLiked: true
      }
    ]
  },
  {
    id: '6',
    title: 'Data Center Operations Troubleshooting',
    content: `# Data Center Operations Troubleshooting

This guide covers common data center operational issues and their resolution procedures.

## Environmental Issues

### Temperature Management
**Problem**: Overheating in server racks
**Solutions**:
- Check HVAC system functionality
- Verify airflow patterns
- Clean air filters
- Adjust cooling setpoints
- Check for blocked vents

### Humidity Control
**Problem**: Humidity levels outside acceptable range
**Solutions**:
- Calibrate humidity sensors
- Check humidification/dehumidification systems
- Inspect ductwork for leaks
- Review environmental monitoring logs

## Power Systems

### UPS Alarms
**Problem**: UPS system showing faults
**Troubleshooting Steps**:
1. Check input power quality
2. Verify battery health and connections
3. Review load distribution
4. Test bypass systems
5. Contact vendor support if needed

### PDU Issues
**Problem**: Power distribution problems
**Solutions**:
- Check circuit breaker status
- Verify power monitoring systems
- Test outlet functionality
- Review power consumption reports

## Network Connectivity

### Switch Problems
- Check physical connections
- Verify port configurations
- Review spanning tree topology
- Monitor traffic patterns

### Fiber Optic Issues
- Inspect fiber connections for damage
- Clean fiber optic connectors
- Test signal strength
- Check patch panel organization

## Emergency Procedures

1. **Power Loss**: Implement emergency shutdown procedures
2. **Fire Alert**: Follow evacuation protocols
3. **Security Breach**: Contact security immediately
4. **Equipment Failure**: Isolate affected systems`,
    category: 'Troubleshooting',
    categoryColor: '#ef4444',
    lastModified: '6 days ago',
    createdAt: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 days ago
    views: 203,
    isFavorite: false,
    author: 'David Kim',
    authorAvatar: 'https://images.unsplash.com/photo-1706613749339-a70071f2229f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc1NzgzMTU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 4,
    keywords: ['data-center', 'troubleshooting', 'operations', 'infrastructure'],
    rootCause: 'Common data center issues causing downtime',
    solution: 'Comprehensive troubleshooting guide with preventive measures',
    status: 'approved',
    approvedAt: Date.now() - (6 * 24 * 60 * 60 * 1000), // Approved 6 days ago - show as NEW
    divisionId: 'fm',
    departmentId: 'fm-operation',
    sectionId: 'data-center',
    likes: 27,
    isLiked: true,
    isSaved: false,
    attachments: [
      {
        id: '12',
        name: 'datacenter_troubleshooting_flowchart.pdf',
        size: 1234567,
        type: 'application/pdf',
        url: '#'
      },
      {
        id: '13',
        name: 'network_monitoring_scripts.zip',
        size: 789012,
        type: 'application/zip',
        url: '#'
      },
      {
        id: '14',
        name: 'ups_maintenance_log.xlsx',
        size: 456789,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        url: '#'
      }
    ],
    comments: [
      {
        id: '7',
        author: 'Ahmed Hassan',
        authorAvatar: 'https://images.unsplash.com/photo-1629507208649-70919ca33793?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHBvcnRyYWl0fGVufDF8fHx8MTc1NzgzNDQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Excellent troubleshooting guide. The power systems section is gold.',
        timestamp: '1 day ago',
        likes: 6,
        isLiked: false
      },
      {
        id: '8',
        author: 'Mike Rodriguez',
        authorAvatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTc5MjE1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'The network connectivity section helped us resolve an issue yesterday!',
        timestamp: '20 hours ago',
        likes: 9,
        isLiked: true
      }
    ]
  },
  {
    id: '9',
    title: 'Database Migration Best Practices',
    content: `# Database Migration Best Practices

This guide covers essential practices for safe database migrations.`,
    category: 'Best Practices',
    categoryColor: '#8b5cf6',
    lastModified: '2 weeks ago',
    createdAt: Date.now() - (14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    views: 45,
    isFavorite: false,
    author: 'Current User',
    authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 0,
    keywords: ['database', 'migration', 'deployment'],
    divisionId: 'it',
    departmentId: 'app-ops',
    sectionId: 'enterprise-apps',
    likes: 0,
    isLiked: false,
    isSaved: false,
    rootCause: 'Database migrations causing production issues',
    status: 'rejected',
    rejectionReason: 'This case lacks sufficient detail and does not provide enough practical examples. Please expand on rollback procedures and include real-world scenarios. Also, the testing section needs more comprehensive coverage.',
    comments: []
  },
  {
    id: '7',
    title: 'Enterprise Application Deployment',
    content: `# Enterprise Application Deployment

This document outlines the standard procedures for deploying enterprise applications in our environment.

## Pre-Deployment Checklist

### Code Review
- [ ] All code changes peer-reviewed
- [ ] Security scan completed
- [ ] Performance testing passed
- [ ] Documentation updated

### Environment Preparation
- [ ] Target environment verified
- [ ] Database migrations tested
- [ ] Configuration files updated
- [ ] Rollback plan prepared

## Deployment Process

### 1. Staging Deployment
Deploy to staging environment first:
\`\`\`bash
# Example deployment commands
./deploy.sh staging
./run-tests.sh staging
./validate-deployment.sh staging
\`\`\`

### 2. Production Deployment
After staging validation:
\`\`\`bash
# Production deployment
./deploy.sh production
./health-check.sh production
./monitor-deployment.sh production
\`\`\`

### 3. Post-Deployment Validation
- Monitor application logs
- Verify all services are running
- Test critical user workflows
- Check performance metrics

## Rollback Procedures

If issues are detected:
1. Stop new deployments
2. Assess impact and severity
3. Execute rollback plan
4. Notify stakeholders
5. Investigate root cause

## Best Practices

- Always deploy during maintenance windows
- Use feature flags for gradual rollouts
- Maintain comprehensive monitoring
- Document all changes and procedures
- Test rollback procedures regularly`,
    category: 'Documentation',
    categoryColor: '#3b82f6',
    lastModified: '5 days ago',
    createdAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
    views: 91,
    isFavorite: true,
    author: 'Sarah Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 5,
    keywords: ['deployment', 'enterprise', 'devops', 'applications'],
    rootCause: 'Need standardized deployment procedures to reduce failures',
    status: 'approved',
    approvedAt: Date.now() - (5 * 24 * 60 * 60 * 1000), // Approved 5 days ago - show as NEW
    divisionId: 'it',
    departmentId: 'app-ops',
    sectionId: 'enterprise-apps',
    likes: 33,
    isLiked: false,
    isSaved: true,
    attachments: [
      {
        id: '15',
        name: 'deployment_checklist.pdf',
        size: 678901,
        type: 'application/pdf',
        url: '#'
      },
      {
        id: '16',
        name: 'deployment_scripts.zip',
        size: 2345678,
        type: 'application/zip',
        url: '#'
      },
      {
        id: '17',
        name: 'rollback_procedures.docx',
        size: 345678,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        url: '#'
      }
    ],
    comments: [
      {
        id: '9',
        author: 'David Kim',
        authorAvatar: 'https://images.unsplash.com/photo-1706613749339-a70071f2229f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMHBob3RvfGVufDF8fHx8MTc1NzgzMTU3Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Feature flags approach is brilliant. Great rollback procedures.',
        timestamp: '8 hours ago',
        likes: 7,
        isLiked: true
      }
    ]
  },
  {
    id: '8',
    title: 'Core Systems Integration Patterns',
    content: `# Core Systems Integration Patterns

This guide covers proven patterns for integrating core business systems effectively.

## Integration Patterns

### 1. Point-to-Point Integration
Simple direct connections between systems.

**When to use**:
- Small number of systems
- Simple data flows
- Low complexity requirements

**Pros**: Simple, fast to implement
**Cons**: Difficult to maintain with many systems

### 2. Hub and Spoke
Central integration hub manages all connections.

**When to use**:
- Multiple systems need to communicate
- Central control required
- Standardized message formats

### 3. Enterprise Service Bus (ESB)
Middleware layer handles all integrations.

**Benefits**:
- Protocol transformation
- Message routing
- Service orchestration
- Monitoring and management

## API Design Principles

### RESTful APIs
- Use standard HTTP methods
- Stateless operations
- Resource-based URLs
- Standard status codes

### Example API Design
\`\`\`
GET /api/customers/{id}
POST /api/customers
PUT /api/customers/{id}
DELETE /api/customers/{id}
\`\`\`

## Error Handling

### Retry Strategies
- Exponential backoff
- Circuit breaker pattern
- Dead letter queues
- Idempotency considerations

### Monitoring
- API response times
- Error rates
- System availability
- Data quality metrics

## Security Considerations

- API authentication (OAuth 2.0)
- Data encryption in transit
- Input validation
- Rate limiting
- Audit logging`,
    category: 'Documentation',
    categoryColor: '#3b82f6',
    lastModified: '1 week ago',
    createdAt: Date.now() - (8 * 24 * 60 * 60 * 1000), // 8 days ago
    views: 134,
    isFavorite: false,
    author: 'Mike Rodriguez',
    authorAvatar: 'https://images.unsplash.com/photo-1672685667592-0392f458f46f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBtYW4lMjBoZWFkc2hvdHxlbnwxfHx8fDE3NTc5MjE1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    stars: 4,
    keywords: ['integration', 'api', 'architecture', 'systems'],
    rootCause: 'Complex system integrations need standardized patterns',
    status: 'approved',
    approvedAt: Date.now() - (10 * 24 * 60 * 60 * 1000), // Approved 10 days ago - not new
    divisionId: 'ct',
    departmentId: 'bo',
    sectionId: 'ct-bo-core',
    likes: 21,
    isLiked: true,
    isSaved: false,
    attachments: [
      {
        id: '18',
        name: 'integration_patterns_diagram.png',
        size: 1234567,
        type: 'image/png',
        url: '#'
      },
      {
        id: '19',
        name: 'api_design_guidelines.pdf',
        size: 567890,
        type: 'application/pdf',
        url: '#'
      },
      {
        id: '20',
        name: 'system_integration_examples.zip',
        size: 3456789,
        type: 'application/zip',
        url: '#'
      }
    ],
    comments: [
      {
        id: '10',
        author: 'Lisa Wang',
        authorAvatar: 'https://images.unsplash.com/photo-1754298949882-216a1c92dbb5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzc3dvbWFuJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU3ODM5MDU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        content: 'Hub and spoke pattern explanation is very clear.',
        timestamp: '12 hours ago',
        likes: 3,
        isLiked: false
      }
    ]
  }
];

export default function App() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [divisions, setDivisions] = useState<Division[]>(mockDivisions);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [sections, setSections] = useState<Section[]>(mockSections);
  const [contributors, setContributors] = useState<Contributor[]>(mockContributors);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [displayMode, setDisplayMode] = useState<'feed' | 'list'>('feed');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedContributor, setSelectedContributor] = useState<Contributor | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [recentCases, setRecentCases] = useState<string[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Filter articles based on all filters and sort by newest first (only show approved)
  const filteredArticles = useMemo(() => {
    return articles
      .filter(article => {
        const matchesCategory = !selectedCategory || article.category === selectedCategory;
        const matchesDivision = !selectedDivision || article.divisionId === selectedDivision;
        const matchesDepartment = !selectedDepartment || article.departmentId === selectedDepartment;
        const matchesSection = !selectedSection || article.sectionId === selectedSection;
        const matchesSaved = !showSavedOnly || article.isSaved;
        const matchesSearch = !searchQuery || 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
        const isApproved = article.status === 'approved'; // Only show approved cases in feed
        
        return matchesCategory && matchesDivision && matchesDepartment && matchesSection && matchesSaved && matchesSearch && isApproved;
      })
      .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
  }, [articles, selectedCategory, selectedDivision, selectedDepartment, selectedSection, searchQuery, showSavedOnly]);

  // Get recent cases articles
  const recentCasesArticles = useMemo(() => {
    return recentCases.map(id => articles.find(a => a.id === id)).filter(Boolean) as Article[];
  }, [recentCases, articles]);

  // Track recently viewed cases
  useEffect(() => {
    if (selectedArticle && viewMode === 'view') {
      setRecentCases(prev => {
        const filtered = prev.filter(id => id !== selectedArticle.id);
        return [selectedArticle.id, ...filtered].slice(0, 5); // Keep only 5 recent
      });
    }
  }, [selectedArticle, viewMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
        return;
      }

      // N for new case
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNewArticle();
        toast.info('Creating new case (Keyboard shortcut: N)');
      }

      // C for contributors
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleViewContributors();
        toast.info('Viewing contributors (Keyboard shortcut: C)');
      }

      // D for dashboard
      if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setViewMode('dashboard');
        toast.info('Viewing dashboard (Keyboard shortcut: D)');
      }

      // S for saved cases
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSavedOnly(!showSavedOnly);
        if (viewMode !== 'feed' && viewMode !== 'list') {
          setViewMode('feed');
          setDisplayMode('feed');
        }
        toast.info(!showSavedOnly ? 'Showing saved cases (Keyboard shortcut: S)' : 'Showing all cases');
      }

      // ESC to clear filters or go back
      if (e.key === 'Escape') {
        if (viewMode === 'view' || viewMode === 'edit' || viewMode === 'new') {
          setViewMode('feed');
        } else if (selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) {
          handleClearFilters();
        }
      }

      // ? for keyboard shortcuts help
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, showSavedOnly, selectedCategory, selectedDivision, selectedDepartment, selectedSection, searchQuery]);

  const handleNewArticle = () => {
    setSelectedArticle(null);
    setViewMode('new');
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setViewMode('edit');
  };

  const handleViewArticle = (article: Article) => {
    // Increment view count
    setArticles(prev => prev.map(a => 
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
    setSelectedArticle(article);
    setViewMode('view');
  };

  const handleClearFilters = () => {
    const filterCount = [selectedCategory, selectedDivision, selectedDepartment, selectedSection, showSavedOnly, searchQuery].filter(Boolean).length;
    setSelectedCategory(null);
    setSelectedDivision(null);
    setSelectedDepartment(null);
    setSelectedSection(null);
    setShowSavedOnly(false);
    setSearchQuery('');
    toast.success('All filters cleared', {
      description: `${filterCount} filter${filterCount !== 1 ? 's' : ''} removed`
    });
  };

  const handleSaveArticle = (articleData: Partial<Article>) => {
    if (articleData.id) {
      // Update existing article
      setArticles(prev => prev.map(a => 
        a.id === articleData.id ? { ...a, ...articleData } : a
      ));
      toast.success('Case updated and sent for review', {
        description: 'Your case will be reviewed by the manager'
      });
    } else {
      // Create new article with pending_manager status
      const newArticle: Article = {
        id: Date.now().toString(),
        createdAt: Date.now(),
        views: 0,
        isFavorite: false,
        author: 'Current User',
        authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        stars: 0,
        divisionId: 'it',
        departmentId: 'it-dept',
        sectionId: 'it-section',
        likes: 0,
        isLiked: false,
        isSaved: false,
        comments: [],
        status: 'pending_manager', // New cases go to manager review
        ...articleData as Article
      };
      setArticles(prev => [newArticle, ...prev]);
      
      // Update category count
      const categoryName = articleData.category;
      if (categoryName) {
        setCategories(prev => prev.map(cat => 
          cat.name === categoryName 
            ? { ...cat, count: cat.count + 1 }
            : cat
        ));
      }
      toast.success('Case submitted for manager review', {
        description: 'Your case will go through the approval workflow'
      });
    }
    setViewMode('feed');
  };

  const handleToggleFavorite = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setArticles(prev => prev.map(a => 
      a.id === articleId ? { ...a, isFavorite: !a.isFavorite } : a
    ));
    if (article) {
      toast.success(
        article.isFavorite ? 'Removed from favorites' : 'Added to favorites',
        { description: article.title }
      );
    }
  };

  const handleDeleteArticle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    if (article) {
      setArticles(prev => prev.filter(a => a.id !== articleId));
      
      // Update category count
      setCategories(prev => prev.map(cat => 
        cat.name === article.category 
          ? { ...cat, count: Math.max(0, cat.count - 1) }
          : cat
      ));
      toast.success('Case deleted successfully', {
        description: `"${article.title}" has been removed`
      });
      
      // If we're viewing the deleted article, go back to feed
      if (selectedArticle?.id === articleId) {
        setViewMode('feed');
        setSelectedArticle(null);
      }
    }
  };

  const handlePreviewArticle = (articleData: Partial<Article>) => {
    setSelectedArticle(articleData as Article);
    setViewMode('view');
  };

  const handleViewContributors = () => {
    setViewMode('contributors');
  };

  const handleToggleFollow = (contributorId: string) => {
    setContributors(prev => prev.map(contributor => 
      contributor.id === contributorId 
        ? { ...contributor, isFollowed: !contributor.isFollowed }
        : contributor
    ));
    
    // Update selected contributor if viewing their profile
    if (selectedContributor && selectedContributor.id === contributorId) {
      setSelectedContributor(prev => 
        prev ? { ...prev, isFollowed: !prev.isFollowed } : null
      );
    }
  };

  const handleViewContributorProfile = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setViewMode('contributor-profile');
  };

  const handleViewContributorAnalytics = (contributor: Contributor) => {
    setSelectedContributor(contributor);
    setViewMode('contributor-analytics');
  };

  const handleViewProfileFromFeed = (authorName: string) => {
    const contributor = contributors.find(c => c.name === authorName);
    if (contributor) {
      setSelectedContributor(contributor);
      setViewMode('contributor-profile');
    }
  };

  const handleViewSavedCase = (article: Article) => {
    // Increment view count
    setArticles(prev => prev.map(a => 
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
    setSelectedArticle(article);
    setViewMode('view');
  };

  const handleLike = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setArticles(prev => prev.map(a => 
      a.id === articleId 
        ? { 
            ...a, 
            isLiked: !a.isLiked,
            likes: a.isLiked ? a.likes - 1 : a.likes + 1
          }
        : a
    ));
    // No toast for likes - too noisy for quick interactions
  };

  const handleSave = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    setArticles(prev => prev.map(a => 
      a.id === articleId 
        ? { ...a, isSaved: !a.isSaved }
        : a
    ));
    if (article) {
      toast.success(
        article.isSaved ? 'Removed from saved cases' : 'Case saved',
        { description: article.title }
      );
    }
  };

  const handleComment = (articleId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      authorAvatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGhlYWRzaG90fGVufDF8fHx8MTc1NzkxODIyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      content,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };

    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? { ...article, comments: [...article.comments, newComment] }
        : article
    ));
    toast.success('Comment posted successfully');
  };

  const handleCommentLike = (articleId: string, commentId: string) => {
    setArticles(prev => prev.map(article => 
      article.id === articleId 
        ? {
            ...article,
            comments: article.comments.map(comment =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !comment.isLiked,
                    likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                  }
                : comment
            )
          }
        : article
    ));
  };

  const handleViewModeChange = (mode: 'feed' | 'list') => {
    setDisplayMode(mode);
    setViewMode(mode === 'feed' ? 'feed' : 'list');
  };

  const renderMainContent = () => {
    switch (viewMode) {
      case 'new':
      case 'edit':
        return (
          <ArticleEditor
            article={selectedArticle || undefined}
            categories={categories}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onSave={handleSaveArticle}
            onCancel={() => setViewMode('list')}
            onPreview={handlePreviewArticle}
          />
        );
      
      case 'view':
        return selectedArticle ? (
          <ArticleViewer
            article={selectedArticle}
            onBack={() => setViewMode('list')}
            onEdit={() => {
              setViewMode('edit');
            }}
            onToggleFavorite={() => {
              if (selectedArticle.id) {
                handleToggleFavorite(selectedArticle.id);
                setSelectedArticle(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
              }
            }}
            onLike={(articleId) => {
              handleLike(articleId);
              setSelectedArticle(prev => prev ? {
                ...prev,
                isLiked: !prev.isLiked,
                likes: prev.isLiked ? (prev.likes || 0) - 1 : (prev.likes || 0) + 1
              } : null);
            }}
            onSave={(articleId) => {
              handleSave(articleId);
              setSelectedArticle(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
            }}
            onComment={(articleId, content) => {
              handleComment(articleId, content);
              // Update the selected article with the new comment
              const article = articles.find(a => a.id === articleId);
              if (article) {
                setSelectedArticle({ ...article, comments: article.comments });
              }
            }}
            onCommentLike={(articleId, commentId) => {
              handleCommentLike(articleId, commentId);
              // Update the selected article with the updated comments
              const article = articles.find(a => a.id === articleId);
              if (article) {
                setSelectedArticle({ ...article, comments: article.comments });
              }
            }}
          />
        ) : null;

      case 'contributors':
        return (
          <Contributors
            contributors={contributors}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onToggleFollow={handleToggleFollow}
            onViewProfile={handleViewContributorProfile}
          />
        );

      case 'contributor-profile':
        return selectedContributor ? (
          <ContributorProfile
            contributor={selectedContributor}
            articles={articles}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onBack={() => setViewMode('contributors')}
            onToggleFollow={handleToggleFollow}
            onEditArticle={handleEditArticle}
            onViewArticle={handleViewArticle}
            onToggleFavorite={handleToggleFavorite}
            onDeleteArticle={handleDeleteArticle}
          />
        ) : null;
      
      case 'dashboard':
        return (
          <Dashboard
            articles={articles}
            categories={categories}
            contributors={contributors}
            departments={departments}
            onViewContributorAnalytics={handleViewContributorAnalytics}
          />
        );
      
      case 'contributor-analytics':
        return selectedContributor ? (
          <ContributorAnalytics
            contributor={selectedContributor}
            allContributors={contributors}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onBack={() => setViewMode('dashboard')}
          />
        ) : null;
      
      case 'manager-approval':
        return (
          <ManagerApproval
            articles={articles}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onApprove={(articleId) => {
              setArticles(prev => prev.map(a => 
                a.id === articleId ? { ...a, status: 'pending_director' as const } : a
              ));
              toast.success('Case approved', {
                description: 'Case has been forwarded to director for review'
              });
            }}
            onReject={(articleId, reason) => {
              setArticles(prev => prev.map(a => 
                a.id === articleId ? { ...a, status: 'rejected' as const, rejectionReason: reason } : a
              ));
              toast.error('Case rejected', {
                description: 'The author will be notified of the rejection'
              });
            }}
            onBack={() => setViewMode('feed')}
          />
        );
      
      case 'director-approval':
        return (
          <DirectorApproval
            articles={articles}
            divisions={divisions}
            departments={departments}
            sections={sections}
            onApprove={(articleId) => {
              setArticles(prev => prev.map(a => 
                a.id === articleId ? { ...a, status: 'approved' as const, approvedAt: Date.now() } : a
              ));
              toast.success('Case approved and published', {
                description: 'Case is now visible to all users'
              });
            }}
            onReject={(articleId, reason) => {
              setArticles(prev => prev.map(a => 
                a.id === articleId ? { ...a, status: 'pending_manager' as const, rejectionReason: reason } : a
              ));
              toast.info('Case sent back to manager', {
                description: 'Manager will review the feedback and resubmit'
              });
            }}
            onBack={() => setViewMode('feed')}
          />
        );
      
      case 'feed':
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Filter Chips */}
              {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-2">
                      {selectedCategory}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                    </Badge>
                  )}
                  {selectedDivision && (
                    <Badge variant="secondary" className="gap-2">
                      {divisions.find(d => d.id === selectedDivision)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDivision(null)} />
                    </Badge>
                  )}
                  {selectedDepartment && (
                    <Badge variant="secondary" className="gap-2">
                      {departments.find(d => d.id === selectedDepartment)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDepartment(null)} />
                    </Badge>
                  )}
                  {selectedSection && (
                    <Badge variant="secondary" className="gap-2">
                      {sections.find(s => s.id === selectedSection)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSection(null)} />
                    </Badge>
                  )}
                  {showSavedOnly && (
                    <Badge variant="secondary" className="gap-2">
                      Saved Only
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setShowSavedOnly(false)} />
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
              
              <div className="mb-6 text-center">
                <h1 className="mb-2">Cases Feed</h1>
                <p className="text-muted-foreground">
                  {filteredArticles.length} case{filteredArticles.length !== 1 ? 's' : ''} found
                  {selectedDivision && ` in ${divisions.find(d => d.id === selectedDivision)?.name}`}
                  {selectedDepartment && ` - ${departments.find(d => d.id === selectedDepartment)?.name}`}
                  {selectedSection && ` - ${sections.find(s => s.id === selectedSection)?.name}`}
                  {selectedCategory && ` (${selectedCategory})`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
              
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-muted-foreground">No cases found</h3>
                    <p className="text-muted-foreground mb-4">
                      {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) 
                        ? "Try adjusting your filters or search query."
                        : "Get started by creating your first case."}
                    </p>
                  </div>
                  {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) ? (
                    <Button onClick={handleClearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  ) : (
                    <Button onClick={handleNewArticle}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Case
                    </Button>
                  )}
                </div>
              ) : (
                <CaseFeed
                  articles={filteredArticles}
                  onLike={handleLike}
                  onSave={handleSave}
                  onComment={handleComment}
                  onCommentLike={handleCommentLike}
                  onEdit={handleEditArticle}
                  onView={handleViewArticle}
                  onToggleFavorite={handleToggleFavorite}
                  onDelete={handleDeleteArticle}
                  onViewProfile={handleViewProfileFromFeed}
                />
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Filter Chips */}
              {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-2">
                      {selectedCategory}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory(null)} />
                    </Badge>
                  )}
                  {selectedDivision && (
                    <Badge variant="secondary" className="gap-2">
                      {divisions.find(d => d.id === selectedDivision)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDivision(null)} />
                    </Badge>
                  )}
                  {selectedDepartment && (
                    <Badge variant="secondary" className="gap-2">
                      {departments.find(d => d.id === selectedDepartment)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDepartment(null)} />
                    </Badge>
                  )}
                  {selectedSection && (
                    <Badge variant="secondary" className="gap-2">
                      {sections.find(s => s.id === selectedSection)?.name}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSection(null)} />
                    </Badge>
                  )}
                  {showSavedOnly && (
                    <Badge variant="secondary" className="gap-2">
                      Saved Only
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setShowSavedOnly(false)} />
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-2">
                      Search: {searchQuery}
                      <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Clear All
                  </Button>
                </div>
              )}

              <div className="mb-6">
                <h1 className="mb-2">i-case System</h1>
                <p className="text-muted-foreground">
                  {filteredArticles.length} case{filteredArticles.length !== 1 ? 's' : ''} found
                  {selectedDivision && ` in ${divisions.find(d => d.id === selectedDivision)?.name}`}
                  {selectedDepartment && ` - ${departments.find(d => d.id === selectedDepartment)?.name}`}
                  {selectedSection && ` - ${sections.find(s => s.id === selectedSection)?.name}`}
                  {selectedCategory && ` (${selectedCategory})`}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
              </div>
              
              {filteredArticles.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="mb-2 text-muted-foreground">No cases found</h3>
                    <p className="text-muted-foreground mb-4">
                      {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) 
                        ? "Try adjusting your filters or search query."
                        : "Get started by creating your first case."}
                    </p>
                  </div>
                  {(selectedCategory || selectedDivision || selectedDepartment || selectedSection || showSavedOnly || searchQuery) ? (
                    <Button onClick={handleClearFilters} variant="outline">
                      Clear All Filters
                    </Button>
                  ) : (
                    <Button onClick={handleNewArticle}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Case
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredArticles.map((article) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      onEdit={handleEditArticle}
                      onView={handleViewArticle}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDeleteArticle}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="size-full flex gradient-bg">
      <Toaster position="top-right" />
      
      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <DialogContent className="max-w-md backdrop-blur-sm border-white/10 bg-card/95">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate quickly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Navigation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New Case</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">N</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contributors</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">C</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dashboard</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">D</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saved Cases</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">S</kbd>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Actions</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Go Back / Clear Filters</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Show Shortcuts</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Buttons */}
      {(viewMode === 'feed' || viewMode === 'list') && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
          <Button
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full shadow-lg backdrop-blur-sm border-white/10 bg-card/80 hover:bg-primary/20"
            onClick={() => setShowKeyboardShortcuts(true)}
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={handleNewArticle}
            title="New Case (N)"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      )}
      <KnowledgeSidebar
        categories={categories}
        divisions={divisions}
        departments={departments}
        sections={sections}
        articles={articles}
        selectedCategory={selectedCategory}
        selectedDivision={selectedDivision}
        selectedDepartment={selectedDepartment}
        selectedSection={selectedSection}
        onCategorySelect={(categoryId) => {
          setSelectedCategory(categoryId);
          setShowSavedOnly(false);
          if (viewMode !== 'feed' && viewMode !== 'list') {
            setViewMode('feed');
            setDisplayMode('feed');
          }
        }}
        onDivisionSelect={setSelectedDivision}
        onDepartmentSelect={setSelectedDepartment}
        onSectionSelect={setSelectedSection}
        onNewArticle={handleNewArticle}
        onViewContributors={handleViewContributors}
        onViewSavedCase={handleViewSavedCase}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={displayMode}
        onViewModeChange={handleViewModeChange}
        showSavedOnly={showSavedOnly}
        onToggleSaved={() => {
          setShowSavedOnly(!showSavedOnly);
          if (viewMode !== 'feed' && viewMode !== 'list') {
            setViewMode('feed');
            setDisplayMode('feed');
          }
        }}
        onViewDashboard={() => setViewMode('dashboard')}
        recentCases={recentCasesArticles}
        currentView={viewMode}
        onViewManagerApproval={() => setViewMode('manager-approval')}
        onViewDirectorApproval={() => setViewMode('director-approval')}
      />
      
      <div className="flex-1 overflow-auto">
        {renderMainContent()}
      </div>
    </div>
  );
}