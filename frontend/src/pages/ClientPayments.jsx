import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Receipt, 
  Plus, 
  ArrowRight,
  Edit,
  Trash2,
  User,
  Phone,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "../components/ui/table";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PAYMENT_METHODS = ["نقدي", "تحويل بنكي", "شيك", "بطاقة ائتمان"];

const ClientPayments = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);
  const [deletePayment, setDeletePayment] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    method: "نقدي",
    note: ""
  });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [clientRes, paymentsRes] = await Promise.all([
        axios.get(`${API}/clients/${clientId}`),
        axios.get(`${API}/clients/${clientId}/payments`)
      ]);
      setClient(clientRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("خطأ في تحميل البيانات");
      if (err.response?.status === 404) {
        navigate("/clients");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      method: "نقدي",
      note: ""
    });
    setEditPayment(null);
  };

  const handleOpenModal = (payment = null) => {
    if (payment) {
      setEditPayment(payment);
      setFormData({
        date: payment.date,
        amount: payment.amount,
        method: payment.method || "نقدي",
        note: payment.note || ""
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (formData.amount <= 0) {
      toast.error("الرجاء إدخال مبلغ صحيح");
      return;
    }

    try {
      if (editPayment) {
        const res = await axios.put(`${API}/payments/${editPayment.id}`, formData);
        setPayments(payments.map(p => p.id === editPayment.id ? res.data : p));
        toast.success("تم تعديل القبض بنجاح");
      } else {
        const res = await axios.post(`${API}/payments`, {
          ...formData,
          client_id: clientId
        });
        setPayments([res.data, ...payments]);
        toast.success("تمت إضافة القبض بنجاح");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving payment:", err);
      toast.error("خطأ في حفظ القبض");
    }
  };

  const handleDeletePayment = async () => {
    if (!deletePayment) return;

    try {
      await axios.delete(`${API}/payments/${deletePayment.id}`);
      setPayments(payments.filter(p => p.id !== deletePayment.id));
      toast.success("تم حذف القبض بنجاح");
    } catch (err) {
      console.error("Error deleting payment:", err);
      toast.error("خطأ في حذف القبض");
    } finally {
      setDeletePayment(null);
    }
  };

  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Receipt className="w-12 h-12 text-[#003366] animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" data-testid="client-payments-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
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
            <Receipt className="w-8 h-8" />
            قبوضات العميل
          </h1>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-[#008d5f] hover:bg-[#26a17a] text-white"
          data-testid="add-payment-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة قبض جديد
        </Button>
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

      {/* Payments Table */}
      <Card className="border-t-4 border-t-[#008d5f]">
        <CardHeader>
          <CardTitle className="text-[#003366]">قائمة القبوضات</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">لا يوجد قبوضات بعد</p>
              <Button 
                onClick={() => handleOpenModal()}
                className="mt-4 bg-[#c2a356] hover:bg-[#d4b86a] text-[#003366]"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول قبض
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#008d5f] hover:bg-[#008d5f]">
                    <TableHead className="text-white text-right font-bold">رقم القبض</TableHead>
                    <TableHead className="text-white text-right font-bold">التاريخ</TableHead>
                    <TableHead className="text-white text-right font-bold">طريقة الدفع</TableHead>
                    <TableHead className="text-white text-right font-bold">ملاحظة</TableHead>
                    <TableHead className="text-white text-right font-bold">المبلغ ($)</TableHead>
                    <TableHead className="text-white text-right font-bold">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-slate-50" data-testid={`payment-row-${payment.id}`}>
                      <TableCell className="font-medium text-[#008d5f]">{payment.id}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-[#008d5f]/10 text-[#008d5f] rounded-full text-sm font-medium">
                          {payment.method}
                        </span>
                      </TableCell>
                      <TableCell>{payment.note || "—"}</TableCell>
                      <TableCell className="font-bold text-[#008d5f]">${payment.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(payment)}
                            className="text-[#008d5f] hover:text-[#008d5f] hover:bg-green-50"
                            data-testid={`edit-payment-${payment.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletePayment(payment)}
                            className="text-red-500 hover:text-red-500 hover:bg-red-50"
                            data-testid={`delete-payment-${payment.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-[#e6f7f0]">
                    <TableCell colSpan={4} className="font-bold text-[#008d5f]">
                      إجمالي القبوضات
                    </TableCell>
                    <TableCell className="font-bold text-[#008d5f]">
                      ${totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Payment Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#003366] flex items-center gap-2">
              {editPayment ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editPayment ? "تعديل القبض" : "إضافة قبض جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePayment}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="date" className="text-[#003366] font-semibold">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                  data-testid="payment-date-input"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-[#003366] font-semibold">المبلغ ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                  data-testid="payment-amount-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="method" className="text-[#003366] font-semibold">طريقة الدفع</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="payment-method-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method} value={method}>{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="note" className="text-[#003366] font-semibold">ملاحظة</Label>
                <Input
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="أدخل ملاحظة (اختياري)"
                  className="mt-1"
                  data-testid="payment-note-input"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-[#008d5f] hover:bg-[#26a17a] text-white"
                data-testid="save-payment-btn"
              >
                {editPayment ? "حفظ التعديلات" : "حفظ القبض"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePayment} onOpenChange={() => setDeletePayment(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#003366]">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف القبض "{deletePayment?.id}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>لا</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePayment}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-payment-btn"
            >
              نعم، حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientPayments;
