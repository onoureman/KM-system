import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Plus, Search, Tag, FileText, ChevronDown, Building, Users, Map, UserCheck, Grid3X3, List, Bookmark, Clock, BarChart3, History, CheckCircle2, ClipboardCheck, Eye } from 'lucide-react';
import logoImage from 'figma:asset/943bf50a3ad577b347ed90569b0499e8b48c91aa.png';

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

interface Article {
  id: string;
  title: string;
  lastModified: string;
  isSaved: boolean;
  category: string;
  categoryColor: string;
  status?: 'draft' | 'pending_manager' | 'pending_director' | 'approved' | 'rejected';
}

interface KnowledgeSidebarProps {
  categories: Category[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  articles: Article[];
  selectedCategory: string | null;
  selectedDivision: string | null;
  selectedDepartment: string | null;
  selectedSection: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  onDivisionSelect: (divisionId: string | null) => void;
  onDepartmentSelect: (departmentId: string | null) => void;
  onSectionSelect: (sectionId: string | null) => void;
  onNewArticle: () => void;
  onViewContributors: () => void;
  onViewSavedCase: (article: Article) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'feed' | 'list';
  onViewModeChange: (mode: 'feed' | 'list') => void;
  showSavedOnly?: boolean;
  onToggleSaved?: () => void;
  onViewDashboard?: () => void;
  recentCases?: Article[];
  currentView?: string;
  onViewManagerApproval?: () => void;
  onViewDirectorApproval?: () => void;
}

export function KnowledgeSidebar({
  categories,
  divisions,
  departments,
  sections,
  articles,
  selectedCategory,
  selectedDivision,
  selectedDepartment,
  selectedSection,
  onCategorySelect,
  onDivisionSelect,
  onDepartmentSelect,
  onSectionSelect,
  onNewArticle,
  onViewContributors,
  onViewSavedCase,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  showSavedOnly = false,
  onToggleSaved,
  onViewDashboard,
  recentCases = [],
  currentView = 'feed',
  onViewManagerApproval,
  onViewDirectorApproval
}: KnowledgeSidebarProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isDivisionOpen, setIsDivisionOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [isSectionOpen, setIsSectionOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(true);
  const [isApprovalOpen, setIsApprovalOpen] = useState(true);

  // Filter departments based on selected division
  const filteredDepartments = selectedDivision 
    ? departments.filter(dept => dept.divisionId === selectedDivision)
    : departments;

  // Filter sections based on selected department
  const filteredSections = selectedDepartment 
    ? sections.filter(section => section.departmentId === selectedDepartment)
    : sections;

  // Calculate approval workflow counts
  const pendingManagerCount = articles.filter(a => a.status === 'pending_manager').length;
  const pendingDirectorCount = articles.filter(a => a.status === 'pending_director').length;
  const approvedCount = articles.filter(a => a.status === 'approved').length;

  return (
    <div className="w-64 bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <img 
            src={logoImage} 
            alt="Company Logo" 
            className="w-16 h-16 object-contain"
          />
          <h2 className="font-medium">i-case System</h2>
        </div>
        
        <Button 
          onClick={onNewArticle}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="pl-10"
          />
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-1 bg-muted/40 backdrop-blur-sm rounded-lg p-1 border border-white/5">
          <Button
            variant={viewMode === 'feed' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => onViewModeChange('feed')}
          >
            <List className="w-4 h-4 mr-2" />
            Feed
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => onViewModeChange('list')}
          >
            <Grid3X3 className="w-4 h-4 mr-2" />
            Grid
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-2">
            <Button
              variant={(currentView === 'feed' || currentView === 'list') && !showSavedOnly ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onCategorySelect(null)}
            >
              <FileText className="w-4 h-4 mr-2" />
              All Cases
            </Button>
            
            <Button
              variant={showSavedOnly ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={onToggleSaved}
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Cases
            </Button>

            {onViewDashboard && (
              <Button
                variant={currentView === 'dashboard' ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={onViewDashboard}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}

            <Button
              variant={currentView === 'contributors' ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={onViewContributors}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Contributors
            </Button>
          </div>
        </div>

        {/* Approval Workflow */}
        <div className="px-4 pb-4 border-b border-sidebar-border">
          <Collapsible open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Approval Workflow</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {pendingManagerCount + pendingDirectorCount}
                  </Badge>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isApprovalOpen ? 'rotate-180' : ''}`} />
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 space-y-1">
              {onViewManagerApproval && (
                <Button
                  variant={currentView === 'manager-approval' ? 'default' : 'ghost'}
                  className="w-full justify-between text-xs"
                  onClick={onViewManagerApproval}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5" />
                    Manager Review
                  </span>
                  {pendingManagerCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      {pendingManagerCount}
                    </Badge>
                  )}
                </Button>
              )}
              {onViewDirectorApproval && (
                <Button
                  variant={currentView === 'director-approval' ? 'default' : 'ghost'}
                  className="w-full justify-between text-xs"
                  onClick={onViewDirectorApproval}
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Director Review
                  </span>
                  {pendingDirectorCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {pendingDirectorCount}
                    </Badge>
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full justify-between text-xs"
                disabled
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5" />
                  Published Cases
                </span>
                {approvedCount > 0 && (
                  <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                    {approvedCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Recent Cases */}
        {recentCases.length > 0 && (
          <div className="px-4 pb-4 border-b border-sidebar-border">
            <Collapsible open={isRecentOpen} onOpenChange={setIsRecentOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-2">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Recent Cases</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {recentCases.length}
                    </Badge>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isRecentOpen ? 'rotate-180' : ''}`} />
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <ScrollArea className="max-h-48">
                  <div className="space-y-1">
                    {recentCases.map((article) => (
                      <div
                        key={article.id}
                        className="p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors border border-transparent hover:border-white/5"
                        onClick={() => onViewSavedCase(article)}
                      >
                        <div className="flex items-start gap-2">
                          <div 
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                            style={{ backgroundColor: article.categoryColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{article.title}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {article.lastModified}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Organizational Filters */}
        <div className="px-4 pb-4">
          {/* Divisions */}
          <Collapsible open={isDivisionOpen} onOpenChange={setIsDivisionOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Division</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDivisionOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              <Button
                variant={selectedDivision === null ? "default" : "ghost"}
                className="w-full justify-start text-xs"
                onClick={() => {
                  onDivisionSelect(null);
                  onDepartmentSelect(null);
                  onSectionSelect(null);
                }}
              >
                All Divisions
              </Button>
              {divisions.map((division) => (
                <Button
                  key={division.id}
                  variant={selectedDivision === division.id ? "default" : "ghost"}
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    onDivisionSelect(division.id);
                    onDepartmentSelect(null);
                    onSectionSelect(null);
                  }}
                >
                  {division.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Departments */}
          <Collapsible open={isDepartmentOpen} onOpenChange={setIsDepartmentOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDepartmentOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2 max-h-40 overflow-y-auto">
              <Button
                variant={selectedDepartment === null ? "default" : "ghost"}
                className="w-full justify-start text-xs"
                onClick={() => {
                  onDepartmentSelect(null);
                  onSectionSelect(null);
                }}
              >
                All Departments
              </Button>
              {filteredDepartments.map((department) => (
                <Button
                  key={department.id}
                  variant={selectedDepartment === department.id ? "default" : "ghost"}
                  className="w-full justify-start text-xs"
                  onClick={() => {
                    onDepartmentSelect(department.id);
                    onSectionSelect(null);
                  }}
                >
                  {department.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Sections */}
          <Collapsible open={isSectionOpen} onOpenChange={setIsSectionOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <div className="flex items-center gap-2">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Section</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isSectionOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2 max-h-40 overflow-y-auto">
              <Button
                variant={selectedSection === null ? "default" : "ghost"}
                className="w-full justify-start text-xs"
                onClick={() => onSectionSelect(null)}
              >
                All Sections
              </Button>
              {filteredSections.map((section) => (
                <Button
                  key={section.id}
                  variant={selectedSection === section.id ? "default" : "ghost"}
                  className="w-full justify-start text-xs"
                  onClick={() => onSectionSelect(section.id)}
                >
                  {section.name}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Categories</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 mt-2">
              <Button
                variant={selectedCategory === null ? "default" : "ghost"}
                className="w-full justify-start text-xs"
                onClick={() => onCategorySelect(null)}
              >
                All Categories
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  className="w-full justify-between text-xs"
                  onClick={() => onCategorySelect(category.id)}
                >
                  <span className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}