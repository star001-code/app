import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FileText, 
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

const CITIES = ["أربيل", "دهوك", "سليمانية", "نينوى", "أنبار", "بغداد", "البصرة"];

const ClientReceipts = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editReceipt, setEditReceipt] = useState(null);
  const [deleteReceipt, setDeleteReceipt] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    driver: "",
    car: "",
    city: "أربيل",
    note: "",
    amount: 0
  });

  useEffect(() => {
    fetchData();
  }, [clientId]);

  const fetchData = async () => {
    try {
      const [clientRes, receiptsRes] = await Promise.all([
        axios.get(`${API}/clients/${clientId}`),
        axios.get(`${API}/clients/${clientId}/receipts`)
      ]);
      setClient(clientRes.data);
      setReceipts(receiptsRes.data);
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
      driver: "",
      car: "",
      city: "أربيل",
      note: "",
      amount: 0
    });
    setEditReceipt(null);
  };

  const handleOpenModal = (receipt = null) => {
    if (receipt) {
      setEditReceipt(receipt);
      setFormData({
        date: receipt.date,
        driver: receipt.driver,
        car: receipt.car,
        city: receipt.city,
        note: receipt.note || "",
        amount: receipt.amount
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSaveReceipt = async (e) => {
    e.preventDefault();
    if (!formData.driver.trim() || !formData.car.trim()) {
      toast.error("الرجاء إدخال اسم السائق ورقم السيارة");
      return;
    }

    try {
      if (editReceipt) {
        const res = await axios.put(`${API}/receipts/${editReceipt.id}`, formData);
        setReceipts(receipts.map(r => r.id === editReceipt.id ? res.data : r));
        toast.success("تم تعديل الوصل بنجاح");
      } else {
        const res = await axios.post(`${API}/receipts`, {
          ...formData,
          client_id: clientId
        });
        setReceipts([res.data, ...receipts]);
        toast.success("تمت إضافة الوصل بنجاح");
      }
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving receipt:", err);
      toast.error("خطأ في حفظ الوصل");
    }
  };

  const handleDeleteReceipt = async () => {
    if (!deleteReceipt) return;

    try {
      await axios.delete(`${API}/receipts/${deleteReceipt.id}`);
      setReceipts(receipts.filter(r => r.id !== deleteReceipt.id));
      toast.success("تم حذف الوصل بنجاح");
    } catch (err) {
      console.error("Error deleting receipt:", err);
      toast.error("خطأ في حذف الوصل");
    } finally {
      setDeleteReceipt(null);
    }
  };

  const totalAmount = receipts.reduce((sum, r) => sum + (r.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-[#003366] animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" data-testid="client-receipts-page">
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
            <FileText className="w-8 h-8" />
            وصولات العميل
          </h1>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-[#003366] hover:bg-[#004b95] text-white"
          data-testid="add-receipt-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة وصل جديد
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

      {/* Receipts Table */}
      <Card className="border-t-4 border-t-[#003366]">
        <CardHeader>
          <CardTitle className="text-[#003366]">قائمة الوصولات</CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">لا يوجد وصولات بعد</p>
              <Button 
                onClick={() => handleOpenModal()}
                className="mt-4 bg-[#c2a356] hover:bg-[#d4b86a] text-[#003366]"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول وصل
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#003366] hover:bg-[#003366]">
                    <TableHead className="text-white text-right font-bold">رقم الوصل</TableHead>
                    <TableHead className="text-white text-right font-bold">التاريخ</TableHead>
                    <TableHead className="text-white text-right font-bold">اسم السائق</TableHead>
                    <TableHead className="text-white text-right font-bold">رقم السيارة</TableHead>
                    <TableHead className="text-white text-right font-bold">المحافظة</TableHead>
                    <TableHead className="text-white text-right font-bold">ملاحظة</TableHead>
                    <TableHead className="text-white text-right font-bold">المبلغ ($)</TableHead>
                    <TableHead className="text-white text-right font-bold">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id} className="hover:bg-slate-50" data-testid={`receipt-row-${receipt.id}`}>
                      <TableCell className="font-medium text-[#003366]">{receipt.id}</TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell>{receipt.driver}</TableCell>
                      <TableCell>{receipt.car}</TableCell>
                      <TableCell>{receipt.city}</TableCell>
                      <TableCell>{receipt.note || "—"}</TableCell>
                      <TableCell className="font-bold">${receipt.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(receipt)}
                            className="text-[#008d5f] hover:text-[#008d5f] hover:bg-green-50"
                            data-testid={`edit-receipt-${receipt.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteReceipt(receipt)}
                            className="text-red-500 hover:text-red-500 hover:bg-red-50"
                            data-testid={`delete-receipt-${receipt.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-[#fffbea]">
                    <TableCell colSpan={6} className="font-bold text-[#003366]">
                      إجمالي الوصولات
                    </TableCell>
                    <TableCell className="font-bold text-[#003366]">
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

      {/* Add/Edit Receipt Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#003366] flex items-center gap-2">
              {editReceipt ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editReceipt ? "تعديل الوصل" : "إضافة وصل جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveReceipt}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="date" className="text-[#003366] font-semibold">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1"
                  data-testid="receipt-date-input"
                />
              </div>
              <div>
                <Label htmlFor="driver" className="text-[#003366] font-semibold">اسم السائق *</Label>
                <Input
                  id="driver"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  placeholder="أدخل اسم السائق"
                  className="mt-1"
                  data-testid="receipt-driver-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="car" className="text-[#003366] font-semibold">رقم السيارة *</Label>
                <Input
                  id="car"
                  value={formData.car}
                  onChange={(e) => setFormData({ ...formData, car: e.target.value })}
                  placeholder="أدخل رقم السيارة"
                  className="mt-1"
                  data-testid="receipt-car-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-[#003366] font-semibold">المحافظة</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="mt-1" data-testid="receipt-city-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map(city => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
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
                  data-testid="receipt-note-input"
                />
              </div>
              <div>
                <Label htmlFor="amount" className="text-[#003366] font-semibold">المبلغ ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="mt-1"
                  data-testid="receipt-amount-input"
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
                className="bg-[#003366] hover:bg-[#004b95] text-white"
                data-testid="save-receipt-btn"
              >
                {editReceipt ? "حفظ التعديلات" : "حفظ الوصل"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReceipt} onOpenChange={() => setDeleteReceipt(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#003366]">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف الوصل "{deleteReceipt?.id}"؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>لا</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReceipt}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-receipt-btn"
            >
              نعم، حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ClientReceipts;
