import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  BarChart3, 
  ArrowRight,
  User,
  Phone,
  Building2,
  FileText,
  Receipt,
  TrendingUp,
  TrendingDown,
  Wallet
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ClientAccount = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
  }, [clientId]);

  const fetchAccountData = async () => {
    try {
      const res = await axios.get(`${API}/clients/${clientId}/account`);
      setAccountData(res.data);
    } catch (err) {
      console.error("Error fetching account data:", err);
      toast.error("خطأ في تحميل كشف الحساب");
      if (err.response?.status === 404) {
        navigate("/clients");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-[#003366] animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!accountData) {
    return null;
  }

  const { client, total_receipts, total_payments, balance, receipts, payments } = accountData;

  // Combine and sort all transactions by date
  const allTransactions = [
    ...receipts.map(r => ({ ...r, type: 'receipt', typeLabel: 'وصل' })),
    ...payments.map(p => ({ ...p, type: 'payment', typeLabel: 'قبض' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="animate-fadeIn" data-testid="client-account-page">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/clients")}
          className="mb-2 text-[#003366] hover:text-[#004b95] -mr-2"
          data-testid="back-to-clients-btn"
        >
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة للعملاء
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-[#003366] flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          كشف حساب العميل
        </h1>
      </div>

      {/* Client Info Card */}
      {client && (
        <Card className="mb-6 border-t-4 border-t-[#c2a356]" data-testid="client-info-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003366] to-[#008d5f] text-white flex items-center justify-center text-2xl font-bold">
                {client.name?.charAt(0) || "؟"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#003366] flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {client.name}
                </h2>
                {client.company && (
                  <p className="text-slate-600 flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {client.company}
                  </p>
                )}
                {client.phone && (
                  <p className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-t-4 border-t-[#003366]" data-testid="total-receipts-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">إجمالي الوصولات</p>
                <p className="text-2xl font-bold text-[#003366]">${total_receipts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#003366] rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#c2a356]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-[#008d5f]" data-testid="total-payments-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">إجمالي القبوضات</p>
                <p className="text-2xl font-bold text-[#008d5f]">${total_payments.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#008d5f] rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${balance >= 0 ? 'border-t-[#c2a356]' : 'border-t-red-500'}`} data-testid="balance-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">الرصيد المتبقي</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#c2a356]' : 'text-red-500'}`}>
                  ${balance.toLocaleString()}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {balance > 0 ? "مستحق على العميل" : balance < 0 ? "مستحق للعميل" : "الحساب متوازن"}
                </p>
              </div>
              <div className={`w-12 h-12 ${balance >= 0 ? 'bg-[#c2a356]' : 'bg-red-500'} rounded-xl flex items-center justify-center`}>
                <Wallet className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={() => navigate(`/clients/${clientId}/receipts`)}
          className="bg-[#003366] hover:bg-[#004b95] text-white"
          data-testid="go-to-receipts-btn"
        >
          <FileText className="w-4 h-4 ml-2" />
          إدارة الوصولات ({receipts.length})
        </Button>
        <Button
          onClick={() => navigate(`/clients/${clientId}/payments`)}
          className="bg-[#008d5f] hover:bg-[#26a17a] text-white"
          data-testid="go-to-payments-btn"
        >
          <Receipt className="w-4 h-4 ml-2" />
          إدارة القبوضات ({payments.length})
        </Button>
      </div>

      {/* Transactions Table */}
      <Card className="border-t-4 border-t-[#003366]">
        <CardHeader>
          <CardTitle className="text-[#003366]">سجل العمليات</CardTitle>
        </CardHeader>
        <CardContent>
          {allTransactions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">لا يوجد عمليات بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#003366] hover:bg-[#003366]">
                    <TableHead className="text-white text-right font-bold">النوع</TableHead>
                    <TableHead className="text-white text-right font-bold">الرقم</TableHead>
                    <TableHead className="text-white text-right font-bold">التاريخ</TableHead>
                    <TableHead className="text-white text-right font-bold">التفاصيل</TableHead>
                    <TableHead className="text-white text-right font-bold">المبلغ ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.map((transaction, index) => (
                    <TableRow key={`${transaction.type}-${transaction.id}`} className="hover:bg-slate-50">
                      <TableCell>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.type === 'receipt' 
                            ? 'bg-[#003366]/10 text-[#003366]' 
                            : 'bg-[#008d5f]/10 text-[#008d5f]'
                        }`}>
                          {transaction.type === 'receipt' ? (
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              وصل
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Receipt className="w-3 h-3" />
                              قبض
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        {transaction.type === 'receipt' ? (
                          <span className="text-sm text-slate-600">
                            {transaction.driver} - {transaction.car} - {transaction.city}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-600">
                            {transaction.method} {transaction.note && `- ${transaction.note}`}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className={`font-bold ${
                        transaction.type === 'receipt' ? 'text-[#003366]' : 'text-[#008d5f]'
                      }`}>
                        {transaction.type === 'receipt' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Summary */}
      <Card className="mt-6 border-t-4 border-t-[#c2a356] print:block">
        <CardHeader>
          <CardTitle className="text-[#003366]">ملخص الحساب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">عدد الوصولات</p>
              <p className="text-lg font-bold text-[#003366]">{receipts.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">عدد القبوضات</p>
              <p className="text-lg font-bold text-[#008d5f]">{payments.length}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">إجمالي المبالغ المستحقة</p>
              <p className="text-lg font-bold text-[#003366]">${total_receipts.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-slate-500">إجمالي المبالغ المدفوعة</p>
              <p className="text-lg font-bold text-[#008d5f]">${total_payments.toLocaleString()}</p>
            </div>
          </div>
          <div className={`mt-4 p-4 rounded-lg ${balance >= 0 ? 'bg-[#c2a356]/10' : 'bg-red-50'}`}>
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">الرصيد النهائي</span>
              <span className={`font-bold text-2xl ${balance >= 0 ? 'text-[#c2a356]' : 'text-red-500'}`}>
                ${balance.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAccount;
