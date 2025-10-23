import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ArrowLeft, FileText, Star, TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

interface ContributorAnalyticsProps {
  contributor: Contributor;
  allContributors: Contributor[];
  divisions: Division[];
  departments: Department[];
  sections: Section[];
  onBack: () => void;
}

// Colors from your theme
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

export function ContributorAnalytics({
  contributor,
  allContributors,
  divisions,
  departments,
  sections,
  onBack
}: ContributorAnalyticsProps) {

  // Generate time series data for the contributor (contributions over time)
  const generateTimeSeriesData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Generate last 12 months of data
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const contributions = Math.floor(Math.random() * (contributor.caseCount / 3)) + 1;
      const stars = Math.floor(Math.random() * (contributor.totalStars / 3)) + 1;
      
      data.push({
        month: months[monthIndex],
        contributions,
        stars,
        cumulativeContributions: data.length > 0 
          ? data[data.length - 1].cumulativeContributions + contributions 
          : contributions
      });
    }
    
    return data;
  };

  // Get all contributors data for bar chart
  const getContributorsData = () => {
    return allContributors
      .sort((a, b) => b.caseCount - a.caseCount)
      .slice(0, 10) // Top 10 contributors
      .map(c => ({
        name: c.name.split(' ')[0], // First name only for cleaner chart
        cases: c.caseCount,
        stars: c.totalStars,
        isSelected: c.id === contributor.id
      }));
  };

  const timeSeriesData = generateTimeSeriesData();
  const contributorsData = getContributorsData();

  // Custom tooltip for charts
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

  // Get contributor's organizational info
  const division = divisions.find(d => d.id === contributor.divisionId);
  const department = departments.find(d => d.id === contributor.departmentId);
  const section = sections.find(s => s.id === contributor.sectionId);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={contributor.avatar} alt={contributor.name} />
                <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="mb-1">{contributor.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {division?.name} • {department?.name} • {section?.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <FileText className="w-3 h-3" />
              {contributor.caseCount} Cases
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Star className="w-3 h-3" />
              {contributor.totalStars} Stars
            </Badge>
          </div>
        </div>

        {/* Contribution Trends */}
        <Card className="backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Contribution Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              Cases and stars earned over the last 12 months
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  dataKey="month" 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Cases"
                />
                <Line 
                  type="monotone" 
                  dataKey="stars" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Stars"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeContributions" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Contributors Comparison */}
        <Card className="backdrop-blur-sm border-white/10 bg-card/80">
          <CardHeader>
            <h3 className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Top Contributors Comparison
            </h3>
            <p className="text-sm text-muted-foreground">
              Comparing cases and stars across top contributors
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={contributorsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis 
                  type="number"
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  width={80}
                  stroke="rgba(255, 255, 255, 0.7)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                />
                <Bar 
                  dataKey="cases" 
                  fill="#3b82f6" 
                  radius={[0, 4, 4, 0]}
                  name="Cases"
                >
                  {contributorsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isSelected ? '#370B2C' : '#3b82f6'}
                      opacity={entry.isSelected ? 1 : 0.8}
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="stars" 
                  fill="#f59e0b" 
                  radius={[0, 4, 4, 0]}
                  name="Stars"
                >
                  {contributorsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isSelected ? '#8b5cf6' : '#f59e0b'}
                      opacity={entry.isSelected ? 1 : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>



        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Cases</p>
                <p className="text-3xl font-semibold">{contributor.caseCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Stars</p>
                <p className="text-3xl font-semibold">{contributor.totalStars}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Avg. Rating</p>
                <p className="text-3xl font-semibold">
                  {(contributor.totalStars / contributor.caseCount).toFixed(1)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="backdrop-blur-sm border-white/10 bg-card/80">
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Rank</p>
                <p className="text-3xl font-semibold">
                  #{allContributors
                    .sort((a, b) => b.caseCount - a.caseCount)
                    .findIndex(c => c.id === contributor.id) + 1}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
