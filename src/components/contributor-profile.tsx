import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, FileText, Calendar, UserPlus, UserMinus, ArrowLeft, Eye, Edit, Heart, Trash2, MessageCircle, TrendingUp } from 'lucide-react';
import { ArticleCard } from './article-card';
import { ChatBox } from './chat-box';

interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  categoryColor: string;
  lastModified: string;
  views: number;
  isFavorite: boolean;
  author: string;
  authorAvatar: string;
  stars: number;
  tags: string[];
  divisionId: string;
  departmentId: string;
  sectionId: string;
  likes?: number;
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

interface ContributorProfileProps {
  contributor: Contributor;
  articles: Article[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  onBack: () => void;
  onToggleFollow: (contributorId: string) => void;
  onEditArticle: (article: Article) => void;
  onViewArticle: (article: Article) => void;
  onToggleFavorite: (articleId: string) => void;
  onDeleteArticle: (articleId: string) => void;
}

export function ContributorProfile({
  contributor,
  articles,
  divisions,
  departments,
  sections,
  onBack,
  onToggleFollow,
  onEditArticle,
  onViewArticle,
  onToggleFavorite,
  onDeleteArticle
}: ContributorProfileProps) {
  const [showChat, setShowChat] = useState(false);

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
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter articles by this contributor
  const contributorArticles = articles.filter(article => article.author === contributor.name);

  // Calculate enhanced statistics
  const averageStars = contributorArticles.length > 0 
    ? contributorArticles.reduce((sum, article) => sum + article.stars, 0) / contributorArticles.length 
    : 0;

  const totalViews = contributorArticles.reduce((sum, article) => sum + article.views, 0);
  const totalLikes = contributorArticles.reduce((sum, article) => sum + (article.likes || 0), 0);
  
  const recipientData = {
    id: contributor.id,
    name: contributor.name,
    avatar: contributor.avatar,
    isOnline: Math.random() > 0.5 // Random online status for demo
  };

  return (
    <>
      <div className="p-6 h-full overflow-y-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contributors
          </Button>
        </div>

        {/* Contributor Profile Header */}
        <Card className="mb-8 backdrop-blur-sm border-white/10 bg-card/80">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative mx-auto md:mx-0">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={contributor.avatar} alt={contributor.name} />
                  <AvatarFallback className="text-xl">
                    {contributor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {recipientData.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-card"></div>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4">
                  <div>
                    <h1 className="mb-2">{contributor.name}</h1>
                    <div className="space-y-1 text-muted-foreground mb-3">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <Badge variant="outline" className="text-xs">
                          {getDivisionName(contributor.divisionId)}
                        </Badge>
                      </div>
                      <div className="text-sm">{getDepartmentName(contributor.departmentId)}</div>
                      <div className="text-sm">{getSectionName(contributor.sectionId)}</div>
                    </div>
                    {contributor.bio && (
                      <p className="text-muted-foreground mb-4">{contributor.bio}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 justify-center md:justify-start">
                    <Button
                      variant={contributor.isFollowed ? "secondary" : "default"}
                      onClick={() => onToggleFollow(contributor.id)}
                      className="h-10"
                    >
                      {contributor.isFollowed ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowChat(true)}
                      className="h-10"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Enhanced Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="font-medium">{contributorArticles.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Cases</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium">{contributor.totalStars}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Stars</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">{averageStars.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{totalViews.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="font-medium">{totalLikes}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Total Likes</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-xs">{formatDate(contributor.joinDate).split(',')[0]}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Joined</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card className="mb-8 backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/40 backdrop-blur-sm rounded-lg border border-white/5">
                <div className="text-2xl font-medium text-primary mb-1">{contributorArticles.length}</div>
                <div className="text-sm text-muted-foreground">Cases Published</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {contributorArticles.length > 0 ? 'Active contributor' : 'New member'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/40 backdrop-blur-sm rounded-lg border border-white/5">
                <div className="text-2xl font-medium text-yellow-500 mb-1">{contributor.totalStars}</div>
                <div className="text-sm text-muted-foreground">Stars Collected</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {averageStars >= 4 ? 'Excellent quality' : averageStars >= 3 ? 'Good quality' : 'Building reputation'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted/40 backdrop-blur-sm rounded-lg border border-white/5">
                <div className="text-2xl font-medium text-blue-500 mb-1">{totalViews.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {totalViews > 1000 ? 'High impact' : totalViews > 100 ? 'Growing reach' : 'Getting started'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Section */}
        <div className="mb-6">
          <h2 className="mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Cases by {contributor.name} ({contributorArticles.length})
          </h2>
        </div>

        {contributorArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contributorArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onEdit={onEditArticle}
                onView={onViewArticle}
                onToggleFavorite={onToggleFavorite}
                onDelete={onDeleteArticle}
              />
            ))}
          </div>
        ) : (
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">
                {contributor.name} hasn't published any cases yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Be the first to engage when they start sharing their knowledge!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Box */}
      {showChat && (
        <ChatBox
          recipient={recipientData}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}