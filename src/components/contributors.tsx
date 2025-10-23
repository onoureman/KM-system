import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, FileText, Calendar, UserPlus, UserMinus } from 'lucide-react';

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

interface ContributorsProps {
  contributors: Contributor[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  onToggleFollow: (contributorId: string) => void;
  onViewProfile: (contributor: Contributor) => void;
}

export function Contributors({
  contributors,
  divisions,
  departments,
  sections,
  onToggleFollow,
  onViewProfile
}: ContributorsProps) {
  const getDivisionName = (divisionId: string) => {
    return divisions.find(d => d.id === divisionId)?.name || '';
  };

  const getDepartmentName = (departmentId: string) => {
    return departments.find(d => d.id === departmentId)?.name || '';
  };

  const getSectionName = (sectionId: string) => {
    return sections.find(s => s.id === sectionId)?.name || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  // Sort contributors by total stars (descending)
  const sortedContributors = [...contributors].sort((a, b) => b.totalStars - a.totalStars);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="mb-2">Contributors</h1>
        <p className="text-muted-foreground">
          {contributors.length} active contributor{contributors.length !== 1 ? 's' : ''} sharing knowledge
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedContributors.map((contributor) => (
          <Card key={contributor.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-4" onClick={() => onViewProfile(contributor)}>
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback>
                    {contributor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{contributor.name}</h3>
                  
                  <div className="space-y-1 text-sm text-muted-foreground mb-3">
                    <div>{getDivisionName(contributor.divisionId)}</div>
                    <div>{getDepartmentName(contributor.departmentId)}</div>
                    <div>{getSectionName(contributor.sectionId)}</div>
                  </div>

                  {contributor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {contributor.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 mb-4" onClick={() => onViewProfile(contributor)}>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{contributor.totalStars}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Total Stars</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium">{contributor.caseCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Cases</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {formatDate(contributor.joinDate)}</span>
                </div>

                <Button
                  size="sm"
                  variant={contributor.isFollowed ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFollow(contributor.id);
                  }}
                  className="h-8"
                >
                  {contributor.isFollowed ? (
                    <>
                      <UserMinus className="w-3 h-3 mr-1" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {contributors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No contributors found.
          </p>
        </div>
      )}
    </div>
  );
}