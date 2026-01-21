import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientReceipts from "./pages/ClientReceipts";
import ClientPayments from "./pages/ClientPayments";
import ClientAccount from "./pages/ClientAccount";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <div className="App" dir="rtl">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId/receipts" element={<ClientReceipts />} />
            <Route path="clients/:clientId/payments" element={<ClientPayments />} />
            <Route path="clients/:clientId/account" element={<ClientAccount />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
