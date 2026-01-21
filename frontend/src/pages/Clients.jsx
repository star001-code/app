import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Users, 
  Plus, 
  Search, 
  FileText, 
  Receipt, 
  BarChart3,
  Trash2,
  X,
  Phone,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteClient, setDeleteClient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    company: ""
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/clients`);
      setClients(res.data);
    } catch (err) {
      console.error("Error fetching clients:", err);
      toast.error("خطأ في تحميل العملاء");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("الرجاء إدخال اسم العميل");
      return;
    }

    try {
      const res = await axios.post(`${API}/clients`, formData);
      setClients([res.data, ...clients]);
      setShowAddModal(false);
      setFormData({ name: "", phone: "", company: "" });
      toast.success(`تمت إضافة العميل "${res.data.name}" بنجاح`);
    } catch (err) {
      console.error("Error adding client:", err);
      toast.error("خطأ في إضافة العميل");
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClient) return;

    try {
      await axios.delete(`${API}/clients/${deleteClient.id}`);
      setClients(clients.filter(c => c.id !== deleteClient.id));
      toast.success(`تم حذف العميل "${deleteClient.name}" بنجاح`);
    } catch (err) {
      console.error("Error deleting client:", err);
      toast.error("خطأ في حذف العميل");
    } finally {
      setDeleteClient(null);
    }
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.includes(searchTerm)
  );

  const getInitial = (name) => {
    return name?.trim().charAt(0) || "؟";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-12 h-12 text-[#003366] animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">جاري تحميل العملاء...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn" data-testid="clients-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#003366] flex items-center gap-3">
            <Users className="w-8 h-8" />
            العملاء
          </h1>
          <p className="text-slate-600 mt-1">إدارة عملاء الشركة</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#003366] hover:bg-[#004b95] text-white"
          data-testid="add-client-btn"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة عميل جديد
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="ابحث عن عميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 border-slate-300 focus:border-[#c2a356] focus:ring-[#c2a356]"
            data-testid="search-clients-input"
          />
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">
              {searchTerm ? "لا يوجد عملاء مطابقين للبحث" : "لا يوجد عملاء بعد"}
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowAddModal(true)}
                className="mt-4 bg-[#c2a356] hover:bg-[#d4b86a] text-[#003366]"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول عميل
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card 
              key={client.id} 
              className="border-t-4 border-t-[#004b95] hover:shadow-lg transition-all duration-200 group"
              data-testid={`client-card-${client.id}`}
            >
              <CardContent className="p-5">
                {/* Delete Button */}
                <button
                  onClick={() => setDeleteClient(client)}
                  className="absolute top-3 left-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  data-testid={`delete-client-${client.id}`}
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Client Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#003366] to-[#008d5f] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {getInitial(client.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#003366] text-lg truncate">{client.name}</h3>
                    {client.company && (
                      <p className="text-slate-600 text-sm flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3" />
                        {client.company}
                      </p>
                    )}
                    {client.phone && (
                      <p className="text-slate-500 text-sm flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {client.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">ID: {client.id}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/clients/${client.id}/receipts`)}
                    className="flex-1 bg-[#003366] hover:bg-[#004b95] text-white"
                    data-testid={`receipts-btn-${client.id}`}
                  >
                    <FileText className="w-4 h-4 ml-1" />
                    وصولات
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/clients/${client.id}/payments`)}
                    className="flex-1 bg-[#008d5f] hover:bg-[#26a17a] text-white"
                    data-testid={`payments-btn-${client.id}`}
                  >
                    <Receipt className="w-4 h-4 ml-1" />
                    قبوضات
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/clients/${client.id}/account`)}
                    className="flex-1 bg-[#c2a356] hover:bg-[#d4b86a] text-[#003366]"
                    data-testid={`account-btn-${client.id}`}
                  >
                    <BarChart3 className="w-4 h-4 ml-1" />
                    كشف حساب
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#003366] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              إضافة عميل جديد
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddClient}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name" className="text-[#003366] font-semibold">
                  اسم العميل *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  className="mt-1"
                  data-testid="client-name-input"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-[#003366] font-semibold">
                  رقم الهاتف (اختياري)
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                  className="mt-1"
                  data-testid="client-phone-input"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-[#003366] font-semibold">
                  اسم الشركة (اختياري)
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="أدخل اسم الشركة"
                  className="mt-1"
                  data-testid="client-company-input"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-[#003366] hover:bg-[#004b95] text-white"
                data-testid="save-client-btn"
              >
                حفظ العميل
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteClient} onOpenChange={() => setDeleteClient(null)}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#003366]">تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل تريد حذف العميل "{deleteClient?.name}"؟
              <br />
              سيتم نقله إلى سلة المحذوفات.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>لا</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-delete-btn"
            >
              نعم، حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
