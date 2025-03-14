import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Briefcase,
  TrendingUp,
  BarChart2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export function AdminDashboard() {
  const stats = [
    {
      label: 'Total Users',
      value: '2,543',
      icon: Users,
      change: '+12%',
      color: 'bg-blue-500',
    },
    {
      label: 'Companies',
      value: '185',
      icon: Building2,
      change: '+5%',
      color: 'bg-green-500',
    },
    {
      label: 'Active Jobs',
      value: '432',
      icon: Briefcase,
      change: '+8%',
      color: 'bg-purple-500',
    },
    {
      label: 'Success Rate',
      value: '76%',
      icon: TrendingUp,
      change: '+3%',
      color: 'bg-yellow-500',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'New Company',
      name: 'Tech Corp',
      action: 'Registered',
      date: '2h ago',
    },
    {
      id: '2',
      type: 'New Job',
      name: 'Senior Developer',
      action: 'Posted',
      date: '5h ago',
    },
    {
      id: '3',
      type: 'Interview',
      name: 'John Doe',
      action: 'Completed',
      date: '1d ago',
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Button onClick={() => {}}>Generate Report</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-500 font-medium">
                    {stat.change}
                  </span>
                  <span className="text-gray-600 ml-2">from last month</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activities
              </h2>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{activity.name}</p>
                    <p className="text-sm text-gray-600">
                      {activity.type} - {activity.action}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.date}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Platform Analytics
              </h2>
              <Button variant="outline" size="sm">
                <BarChart2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { label: 'User Growth', value: 85 },
                { label: 'Job Success Rate', value: 92 },
                { label: 'Interview Completion', value: 78 },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">
                      {metric.label}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}