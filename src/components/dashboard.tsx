import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  Star, 
  Users, 
  TrendingUp,
  BookmarkCheck,
  Activity,
  Building2
} from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Article {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  views: number;
  likes: number;
  comments: any[];
  stars: number;
  isFavorite: boolean;
  isSaved: boolean;
  departmentId: string;
}

interface Category {
  id: string;
  name: string;
  count: number;
  color: string;
}

interface Contributor {
  id: string;
  name: string;
  caseCount: number;
  totalStars: number;
}

interface Department {
  id: string;
  name: string;
  divisionId: string;
  count: number;
}

interface DashboardProps {
  articles: Article[];
  categories: Category[];
  contributors: Contributor[];
  departments: Department[];
  onViewContributorAnalytics?: (contributor: Contributor) => void;
}

export function Dashboard({ articles, categories, contributors, departments, onViewContributorAnalytics }: DashboardProps) {
  // Calculate statistics
  const totalCases = articles.length;
  const totalViews = articles.reduce((sum, article) => sum + article.views, 0);
  const totalLikes = articles.reduce((sum, article) => sum + article.likes, 0);
  const totalComments = articles.reduce((sum, article) => sum + article.comments.length, 0);
  const totalFavorites = articles.filter(a => a.isFavorite).length;
  const totalSaved = articles.filter(a => a.isSaved).length;
  const avgStars = articles.length > 0 
    ? (articles.reduce((sum, a) => sum + a.stars, 0) / articles.length).toFixed(1)
    : '0';

  // Most viewed cases
  const mostViewedCases = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  // Most liked cases
  const mostLikedCases = [...articles]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 5);

  // Top contributors
  const topContributors = [...contributors]
    .sort((a, b) => b.caseCount - a.caseCount)
    .slice(0, 5);

  // Calculate contributions by department
  const departmentContributions = departments.map(dept => {
    const deptCases = articles.filter(a => a.departmentId === dept.id);
    return {
      name: dept.name,
      contributions: deptCases.length,
      id: dept.id
    };
  })
  .filter(d => d.contributions > 0) // Only show departments with contributions
  .sort((a, b) => b.contributions - a.contributions)
  .slice(0, 15); // Top 15 departments

  // Chart colors
  const CHART_COLORS = [
    '#370B2C',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ef4444',
    '#06b6d4',
    '#ec4899',
    '#14b8a6',
  ];

  // Custom tooltip for department chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-sm bg-card/95 border border-white/10 p-3 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const stats = [
    {
      title: 'Total Cases',
      value: totalCases.toString(),
      icon: FileText,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: 'Total Likes',
      value: totalLikes.toLocaleString(),
      icon: Heart,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)'
    },
    {
      title: 'Total Comments',
      value: totalComments.toLocaleString(),
      icon: MessageCircle,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: 'Favorites',
      value: totalFavorites.toString(),
      icon: Star,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: 'Saved Cases',
      value: totalSaved.toString(),
      icon: BookmarkCheck,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    {
      title: 'Avg. Rating',
      value: avgStars,
      icon: TrendingUp,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      title: 'Contributors',
      value: contributors.length.toString(),
      icon: Users,
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your i-case system statistics and performance
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="backdrop-blur-sm border-white/10 bg-card/80">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                    </div>
                    <div 
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: stat.bgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories Distribution */}
        <Card className="backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Categories Distribution
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => {
                const percentage = totalCases > 0 ? (category.count / totalCases) * 100 : 0;
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {category.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: category.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Contributions by Department */}
        <Card className="backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Contributions by Department
            </h3>
            <p className="text-sm text-muted-foreground">
              Top {departmentContributions.length} departments by case count
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(400, departmentContributions.length * 40)}>
              <BarChart data={departmentContributions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  type="number"
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={200}
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="contributions" 
                  radius={[0, 4, 4, 0]}
                  name="Cases"
                >
                  {departmentContributions.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      opacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Most Viewed Cases */}
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardHeader>
              <h3 className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Most Viewed Cases
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostViewedCases.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: article.categoryColor + '20', 
                            color: article.categoryColor 
                          }}
                        >
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">{article.views}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Most Liked Cases */}
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardHeader>
              <h3 className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Most Liked Cases
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostLikedCases.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-white/5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-500 font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className="text-xs"
                          style={{ 
                            backgroundColor: article.categoryColor + '20', 
                            color: article.categoryColor 
                          }}
                        >
                          {article.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                      <Heart className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{article.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Contributors */}
        <Card className="backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Contributors
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topContributors.map((contributor, index) => (
                <div 
                  key={contributor.id}
                  className="flex items-center gap-3 p-4 rounded-lg bg-muted/20 border border-white/5 hover:bg-muted/30 hover:border-white/10 transition-all cursor-pointer group"
                  onClick={() => onViewContributorAnalytics?.(contributor)}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-semibold group-hover:bg-primary/30 transition-colors">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-primary transition-colors">{contributor.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {contributor.caseCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {contributor.totalStars}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
