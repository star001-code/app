import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Users, 
  FileText, 
  Receipt, 
  TrendingUp,
  Truck,
  ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    clients_count: 0,
    receipts_count: 0,
    payments_count: 0,
    total_receipts: 0,
    total_payments: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`);
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "عدد العملاء",
      value: stats.clients_count,
      icon: Users,
      color: "bg-[#003366]",
      iconColor: "text-[#c2a356]"
    },
    {
      title: "عدد الوصولات",
      value: stats.receipts_count,
      icon: FileText,
      color: "bg-[#004b95]",
      iconColor: "text-white"
    },
    {
      title: "عدد القبوضات",
      value: stats.payments_count,
      icon: Receipt,
      color: "bg-[#008d5f]",
      iconColor: "text-white"
    },
    {
      title: "إجمالي الوصولات",
      value: `$${stats.total_receipts.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-[#c2a356]",
      iconColor: "text-[#003366]"
    },
    {
      title: "إجمالي القبوضات",
      value: `$${stats.total_payments.toLocaleString()}`,
      icon: Receipt,
      color: "bg-[#26a17a]",
      iconColor: "text-white"
    },
    {
      title: "الرصيد المتبقي",
      value: `$${stats.balance.toLocaleString()}`,
      icon: TrendingUp,
      color: stats.balance >= 0 ? "bg-[#003366]" : "bg-red-600",
      iconColor: "text-[#c2a356]"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Truck className="w-12 h-12 text-[#003366] animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" data-testid="dashboard-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#003366] flex items-center gap-3">
          <Truck className="w-8 h-8" />
          لوحة التحكم
        </h1>
        <p className="text-slate-600 mt-1">مرحباً بك في نظام إدارة شركة الغدير</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className="border-t-4 border-t-[#c2a356] hover:shadow-lg transition-shadow"
            data-testid={`stat-card-${index}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#003366]">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="border-t-4 border-t-[#003366]">
        <CardHeader>
          <CardTitle className="text-[#003366]">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => navigate("/clients")}
              className="bg-[#003366] hover:bg-[#004b95] text-white"
              data-testid="go-to-clients-btn"
            >
              <Users className="w-4 h-4 ml-2" />
              إدارة العملاء
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-slate-500">
        <p>📍 زاخو – إبراهيم الخليل • 📞 07504084359 • 📧 starzeki001@gmail.com</p>
        <p className="mt-1">© 2026 شركة الغدير للنقل والتخليص الكمركي – جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
};

export default Dashboard;
