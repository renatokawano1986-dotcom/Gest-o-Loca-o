import React, { useState, useEffect } from "react";
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  FileCheck, 
  HelpCircle, 
  Plus, 
  Receipt, 
  RefreshCw,
  Calculator,
  Calendar,
  Zap,
  Droplets,
  Wifi,
  Wrench,
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  PieChart as PieChartIcon,
  Activity,
  FileText,
  Check,
  ListFilter,
  Building,
  Info,
  Download,
  Upload,
  Sparkles,
  Edit3,
  X
} from "lucide-react";
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Faturamento, Contrato, Despesa, AdvancedFinancialCalculation, Imovel, Repasse } from "../types";

const CURRENT_SYSTEM_TIME = "2026-05-21";

const formatBrl = (val: number) => {
  return "R$ " + (val || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface FinancialModuleProps {
  faturamentos: Faturamento[];
  contratos: Contrato[];
  despesas: Despesa[];
  imoveis?: Imovel[];
  onInvoiceCreatedOrPaid: () => void;
}

export default function FinancialModule({
  faturamentos = [],
  contratos = [],
  despesas = [],
  imoveis = [],
  onInvoiceCreatedOrPaid
}: FinancialModuleProps) {
  
  // Navigation tabs for the financial section
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'custos' | 'boletos' | 'repasses' | 'integracao'>('dashboard');

  // Landlord Payouts States
  const [repassesList, setRepassesList] = useState<Repasse[]>([]);
  const [payoutSimulation, setPayoutSimulation] = useState<any[]>([]);
  const [loadingPayouts, setLoadingPayouts] = useState<boolean>(false);
  const [adminFeePercentage, setAdminFeePercentage] = useState<number>(10);
  const [schedulingPayout, setSchedulingPayout] = useState<any | null>(null);
  const [payoutScheduleDate, setPayoutScheduleDate] = useState<string>("");
  const [payoutCustomPixKey, setPayoutCustomPixKey] = useState<string>("");

  // Filter indicators
  const [selectedImovelFilter, setSelectedImovelFilter] = useState<string>("");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("all");

  // FORM state to register a new Monthly Cost
  const [costImovelId, setCostImovelId] = useState<string>("");
  const [costCategory, setCostCategory] = useState<'AGUA' | 'LUZ' | 'INTERNET' | 'MANUTENCAO' | 'OUTROS'>('LUZ');
  const [costAmount, setCostAmount] = useState<string>("");
  const [costMonthYear, setCostMonthYear] = useState<string>("2026-05");
  const [costDate, setCostDate] = useState<string>("2026-05-15");
  const [costDescription, setCostDescription] = useState<string>("");
  const [savingCost, setSavingCost] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // AI OCR Bill Upload States
  const [analyzingBill, setAnalyzingBill] = useState<boolean>(false);
  const [uploadedBillName, setUploadedBillName] = useState<string>("");
  const [uploadedFileBase64, setUploadedFileBase64] = useState<string>("");
  const [costAiComentario, setCostAiComentario] = useState<string>("");
  const [dragActiveBill, setDragActiveBill] = useState<boolean>(false);

  // Reclassification / Editing States
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editImovelId, setEditImovelId] = useState<string>("");
  const [editCategory, setEditCategory] = useState<'AGUA' | 'LUZ' | 'INTERNET' | 'MANUTENCAO' | 'OUTROS'>('LUZ');
  const [editAmount, setEditAmount] = useState<string>("");
  const [editMonthYear, setEditMonthYear] = useState<string>("");
  const [editDate, setEditDate] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editAiComentario, setEditAiComentario] = useState<string>("");

  // Editing Faturamento States
  const [editingFaturamento, setEditingFaturamento] = useState<Faturamento | null>(null);

  // Helper to load active default contract parameters from localStorage
  const getActiveDefaultModelParams = () => {
    try {
      const saved = localStorage.getItem("proptechos_contract_models");
      if (saved) {
        const models = JSON.parse(saved);
        const def = models.find((m: any) => m.isDefault) || models[0];
        if (def) {
          return { finePercent: def.finePercent, interestMonthlyPercent: def.interestMonthlyPercent };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return { finePercent: 10, interestMonthlyPercent: 2 }; // default fallbacks
  };

  const getInitialParams = () => getActiveDefaultModelParams();
  
  const [calcFinePercent, setCalcFinePercent] = useState<number>(() => getInitialParams().finePercent);
  const [calcInterestPercent, setCalcInterestPercent] = useState<number>(() => getInitialParams().interestMonthlyPercent);

  // Sync parameters whenever user requests reload from default
  const handleReloadParamsFromDefault = () => {
    const params = getActiveDefaultModelParams();
    setCalcFinePercent(params.finePercent);
    setCalcInterestPercent(params.interestMonthlyPercent);
  };

  // Original Manual Interactive Calculator state
  const [calcBaseRent, setCalcBaseRent] = useState<number>(3200);
  const [calcDelayDays, setCalcDelayDays] = useState<number>(11);
  const [calcResult, setCalcResult] = useState<AdvancedFinancialCalculation | null>({
    baseRent: 3200,
    delayInDays: 11,
    fine: 320.00,
    interest: 11.73,
    totalDue: 3531.73
  });

  // Original Billing Invoice generation form states
  const [selectedContrato, setSelectedContrato] = useState<string>("");
  const [invoiceBaseRent, setInvoiceBaseRent] = useState<number>(3200);
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>("2026-05-10");
  const [submittingInvoice, setSubmittingInvoice] = useState<boolean>(false);

  // Pro-rata Calculator New Feature States
  const [prorataContractId, setProrataContractId] = useState<string>("");
  const [prorataType, setProrataType] = useState<'ENTRADA' | 'SAIDA'>('ENTRADA');
  const [prorataDate, setProrataDate] = useState<string>("2026-06-01");
  const [prorataBaseRent, setProrataBaseRent] = useState<number>(3000);
  const [prorataDueDate, setProrataDueDate] = useState<string>("2026-06-10");
  const [prorataDays, setProrataDays] = useState<number>(10);
  const [prorataIncludeMonthly, setProrataIncludeMonthly] = useState<boolean>(true);
  const [prorataResult, setProrataResult] = useState<{
    daysRent: number;
    monthlyRent: number;
    total: number;
    description: string;
  } | null>({
    daysRent: 1000,
    monthlyRent: 3000,
    total: 4000,
    description: "Cálculo Inicial Esperando Contrato..."
  });

  // API Integration state parameters
  const [apiPsp, setApiPsp] = useState<string>("asaas");
  const [apiEnv, setApiEnv] = useState<string>("sandbox");
  const [apiClientId, setApiClientId] = useState<string>("prod_client_id_99182390");
  const [apiClientSecret, setApiClientSecret] = useState<string>("sk_live_aba882c9183def0a87a11");
  const [apiPixKey, setApiPixKey] = useState<string>(contratos[0]?.imovel?.proprietario?.pixKey || "financeiro@condomais.com");
  const [apiLogs, setApiLogs] = useState<Array<{ id: string; timestamp: string; type: 'API_REQUEST' | 'API_RESPONSE' | 'WEBHOOK_RECEIVED' | 'DATABASE_UPDATE'; title: string; detail: string; status: 'SUCCESS' | 'INFO' }>>([
    {
      id: "log-init",
      timestamp: new Date().toLocaleTimeString(),
      type: "DATABASE_UPDATE",
      title: "Inicialização de Subsistema",
      detail: "Subsistema de emulação Open Finance & PIX Dinâmico inicializado em modo Sandbox local.",
      status: "SUCCESS"
    }
  ]);
  const [simulatedSelectedInvoiceId, setSimulatedSelectedInvoiceId] = useState<string>("");
  const [simulatedCalculatedTotal, setSimulatedCalculatedTotal] = useState<number>(3500);

  const fetchPayoutData = async () => {
    setLoadingPayouts(true);
    try {
      const rResp = await fetch("/api/financial/repasses");
      if (rResp.ok) {
        const rData = await rResp.json();
        setRepassesList(rData);
      }
      
      const sResp = await fetch("/api/financial/repasses/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxaAdministrativaPercent: adminFeePercentage })
      });
      if (sResp.ok) {
        const sData = await sResp.json();
        setPayoutSimulation(sData);
      }
    } catch (e) {
      console.error("Erro ao carregar dados de repasses:", e);
    } finally {
      setLoadingPayouts(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "repasses") {
      fetchPayoutData();
    }
  }, [activeSubTab, adminFeePercentage, faturamentos]);

  // Filter faturamentos and despesas dynamically based on selections
  const filteredFaturamentos = faturamentos.filter(fat => {
    const associatedContract = contratos.find(c => c.id === fat.contratoId);
    const matchesImovel = !selectedImovelFilter || (associatedContract && associatedContract.imovelId === selectedImovelFilter);
    const matchesMonth = selectedMonthFilter === "all" || fat.dataVencimento.startsWith(selectedMonthFilter);
    return matchesImovel && matchesMonth;
  });

  const filteredDespesas = despesas.filter(desp => {
    const matchesImovel = !selectedImovelFilter || desp.imovelId === selectedImovelFilter;
    const matchesMonth = selectedMonthFilter === "all" || desp.mesAno === selectedMonthFilter;
    return matchesImovel && matchesMonth;
  });

  // KPI Calculations
  const receitasRealizadasRaw = filteredFaturamentos
    .filter(f => f.status === "PAGO")
    .reduce((sum, f) => sum + (f.valorPago || f.valorBase), 0);

  // Invoices either paid or unpaid total calculated value
  const faturadoPrevistoSum = filteredFaturamentos.reduce((sum, f) => {
    if (f.status === "PAGO") {
      return sum + (f.valorPago || f.valorBase);
    }
    // Calculate pending with pro-rata if overdue
    const isOverdue = new Date(f.dataVencimento) < new Date(CURRENT_SYSTEM_TIME);
    if (isOverdue) {
      const delayDays = Math.floor((new Date(CURRENT_SYSTEM_TIME).getTime() - new Date(f.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
      const fine = f.valorBase * 0.10;
      const juros = (0.01 / 30) * delayDays * f.valorBase;
      return sum + (f.valorBase + fine + juros);
    }
    return sum + f.valorBase;
  }, 0);

  const receitasPendentesRaw = faturadoPrevistoSum - receitasRealizadasRaw;

  // Costs / Expenses Sum
  const custosTotaisRaw = filteredDespesas.reduce((sum, d) => sum + d.valor, 0);

  // Net Balance
  const saldoLiquidoRealizado = receitasRealizadasRaw - custosTotaisRaw;
  const saldoLiquidoPrevisto = faturadoPrevistoSum - custosTotaisRaw;

  // Margin percentages
  const margemRealizada = receitasRealizadasRaw > 0 
    ? (saldoLiquidoRealizado / receitasRealizadasRaw) * 100 
    : 0;

  // Original simulator fee calculation
  const handleCalculateFees = () => {
    const base = Number(calcBaseRent) || 0;
    const delay = Number(calcDelayDays) || 0;

    if (delay <= 0) {
      setCalcResult({
        baseRent: base,
        delayInDays: 0,
        fine: 0,
        interest: 0,
        totalDue: base
      });
      return;
    }

    const fine = base * (calcFinePercent / 100);
    const interest = ((calcInterestPercent / 100) / 30) * delay * base;
    const totalDue = base + fine + interest;

    setCalcResult({
      baseRent: base,
      delayInDays: delay,
      fine: parseFloat(fine.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      totalDue: parseFloat(totalDue.toFixed(2))
    });
  };

  // Original Manual invoice creator
  const handleCreateBilling = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContrato) return;

    setSubmittingInvoice(true);
    try {
      const due = new Date(invoiceDueDate);
      const systemToday = new Date(CURRENT_SYSTEM_TIME);
      const delayMs = systemToday.getTime() - due.getTime();
      const delayDays = delayMs > 0 ? Math.floor(delayMs / (1000 * 60 * 60 * 24)) : 0;

      const response = await fetch("/api/financial/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseRent: invoiceBaseRent,
          delayInDays: delayDays,
          saveInvoice: true,
          contratoId: selectedContrato,
          dataVencimento: invoiceDueDate
        })
      });

      if (response.ok) {
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setSelectedContrato("");
        setSuccessMessage("Novo boleto de cobrança emitido com sucesso!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Erro ao criar boleto.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Auto recalculate prorata whenever dependencies change
  React.useEffect(() => {
    const rent = Number(prorataBaseRent) || 0;
    const days = Number(prorataDays) || 0;
    const dailyValue = rent / 30;
    const prorataPart = dailyValue * days;
    const extraRent = prorataType === 'ENTRADA' && prorataIncludeMonthly ? rent : 0;
    const total = prorataPart + extraRent;

    let desc = "";
    if (prorataType === 'ENTRADA') {
      desc = `Cálculo de Entrada Proporcional:\nEstadia de ocupação inicial de ${days} dias (${days} x R$ ${dailyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/dia) no valor de R$ ${prorataPart.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (prorataIncludeMonthly) {
        desc += ` somado à mensalidade padrão antecipada de R$ ${rent.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, totalizando R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      } else {
        desc += `, totalizando R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
      }
    } else {
      desc = `Cálculo de Saída Proporcional:\nEstadia final de ${days} dias até a desocupação do imóvel (${days} x R$ ${dailyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/dia), totalizando R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`;
    }

    setProrataResult({
      daysRent: parseFloat(prorataPart.toFixed(2)),
      monthlyRent: extraRent,
      total: parseFloat(total.toFixed(2)),
      description: desc
    });
  }, [prorataBaseRent, prorataDays, prorataType, prorataIncludeMonthly]);

  const handleProrataContractChange = (contractId: string) => {
    setProrataContractId(contractId);
    if (!contractId) return;
    const matched = contratos.find(c => c.id === contractId);
    if (matched) {
      const valorAluguel = matched.imovel?.valorAluguel || 3000;
      setProrataBaseRent(valorAluguel);
      
      const diaVenc = matched.diaVencimento || 10;
      const today = new Date();
      const yr = today.getFullYear();
      const mt = String(today.getMonth() + 1).padStart(2, '0');
      
      const defaultStartDate = `${yr}-${mt}-01`;
      const formattedDueDate = `${yr}-${mt}-${String(diaVenc).padStart(2, '0')}`;
      
      setProrataDate(defaultStartDate);
      setProrataDueDate(formattedDueDate);
      setProrataDays(diaVenc); // Ex direct: dia 1 ao 10 = 10 dias inclusive
    }
  };

  const handleProrataDateOrDueDateChange = (newProrataDate: string, newDueDate: string) => {
    setProrataDate(newProrataDate);
    setProrataDueDate(newDueDate);
    
    try {
      const dStart = new Date(newProrataDate);
      const dEnd = new Date(newDueDate);
      
      if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
        const diffTime = dEnd.getTime() - dStart.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays >= 0) {
          // Add 1 to be inclusive (e.g. from 1 to 10 is 10 days inclusive as requested)
          setProrataDays(diffDays + 1);
        } else {
          setProrataDays(Math.max(1, Math.abs(diffDays)));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmitProrataInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prorataContractId || !prorataResult) return;
    setSubmittingInvoice(true);
    try {
      const totalProportionalVal = prorataResult.total;
      
      const response = await fetch("/api/financial/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseRent: totalProportionalVal,
          delayInDays: 0,
          saveInvoice: true,
          contratoId: prorataContractId,
          dataVencimento: prorataDueDate
        })
      });

      if (response.ok) {
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setProrataContractId("");
        setSuccessMessage(`Boleto Proporcional (R$ ${totalProportionalVal.toFixed(2)}) emitido com sucesso para o contrato!`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch(err) {
      console.error(err);
      setErrorMessage("Erro ao emitir fatura de pro-rata.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setSubmittingInvoice(false);
    }
  };

  // Original manual pay invoice
  const handlePayInvoice = async (invoiceId: string, amount: number) => {
    try {
      const response = await fetch(`/api/financial/pay/${invoiceId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorPago: amount })
      });
      if (response.ok) {
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setSuccessMessage("Pagamento do boleto compensado com sucesso!");
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Drag and Drop handlers for Bill Analysis
  const handleDragBill = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActiveBill(true);
    } else if (e.type === "dragleave") {
      setDragActiveBill(false);
    }
  };

  const handleDropBill = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveBill(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleAnalyzeBill(e.dataTransfer.files[0]);
    }
  };

  const handleBillFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleAnalyzeBill(e.target.files[0]);
    }
  };

  const handleAnalyzeBill = async (file: File) => {
    try {
      setAnalyzingBill(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const fileDataUrl = await readFileAsDataURL(file);
      const base64Data = fileDataUrl.includes(",") ? fileDataUrl.split(',')[1] : fileDataUrl;
      
      const response = await fetch("/api/financial/analyze-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível processar a conta.");
      }

      const result = await response.json();
      
      // Auto pre-fill the form with visual feedback
      if (result.imovelId) setCostImovelId(result.imovelId);
      if (result.categoria) setCostCategory(result.categoria);
      if (result.valor) setCostAmount(result.valor.toString());
      if (result.mesAno) setCostMonthYear(result.mesAno);
      if (result.dataDespesa) setCostDate(result.dataDespesa);
      if (result.descricao) setCostDescription(result.descricao);
      if (result.aiComentario) setCostAiComentario(result.aiComentario);

      setUploadedBillName(file.name);
      setUploadedFileBase64(fileDataUrl);

      setSuccessMessage("Conta digitalizada com sucesso pela inteligência artificial! O imóvel e valores foram auto-preenchidos e a avaliação de consumo foi registrada na caixa de custos.");
      setTimeout(() => setSuccessMessage(null), 6000);

    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erro ao ler e classificar conta: " + err.message);
    } finally {
      setAnalyzingBill(false);
    }
  };

  // Post new monthly cost
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!costImovelId || !costAmount || !costDate) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSavingCost(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/financial/expenses", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           imovelId: costImovelId,
           mesAno: costMonthYear,
           categoria: costCategory,
           valor: parseFloat(costAmount),
           dataDespesa: costDate,
           descricao: costDescription,
           arquivoNome: uploadedBillName,
           arquivoBase64: uploadedFileBase64,
           aiComentario: costAiComentario
         })
      });

      if (response.ok) {
        setSuccessMessage(`Custo de ${getCategoryLabel(costCategory)} registrado e imputado com sucesso!`);
        setCostAmount("");
        setCostDescription("");
        setCostImovelId("");
        setUploadedBillName("");
        setUploadedFileBase64("");
        setCostAiComentario("");
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Erro ao registrar o custo.");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Erro de conectividade com o servidor.");
    } finally {
      setSavingCost(false);
    }
  };

  // Update existing cost (reclassification)
  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpenseId || !editImovelId || !editAmount || !editDate) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios da reclassificação.");
      return;
    }

    setSavingCost(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/financial/expenses/${editingExpenseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imovelId: editImovelId,
          mesAno: editMonthYear,
          categoria: editCategory,
          valor: parseFloat(editAmount),
          dataDespesa: editDate,
          descricao: editDescription,
          aiComentario: editAiComentario
        })
      });

      if (response.ok) {
        setSuccessMessage("Custo mensal reclassificado com sucesso!");
        setEditingExpenseId(null);
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Erro ao reclassificar despesa.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Erro ao se conectar com o servidor.");
    } finally {
      setSavingCost(false);
    }
  };

  // Delete cost
  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este custo mensal? Esta exclusão será considerada definitiva.")) return;

    try {
      const response = await fetch(`/api/financial/expenses/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSuccessMessage("Custo mensal removido com sucesso!");
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage("Não foi possível excluir o custo.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete faturamento
  const handleDeleteFaturamento = async (id: string) => {
    if (!window.confirm("Tem certeza que deseja de forma definitiva excluir esta cobrança/faturamento? Esta exclusão será considerada definitiva e irreversível.")) return;

    try {
      const response = await fetch(`/api/financial/invoices/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSuccessMessage("Faturamento/cobrança removido com sucesso de forma definitiva!");
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage("Não foi possível excluir o faturamento.");
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Erro de rede ao conectar com o servidor.");
    }
  };

  // REPASSES INTEGRATION HANDLERS
  const handleTriggerAutomatedPayouts = async () => {
    setLoadingPayouts(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/financial/repasses/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taxaAdministrativaPercent: adminFeePercentage })
      });
      if (response.ok) {
        const data = await response.json();
        setSuccessMessage(data.message || "Automação de repasses Pix executada com sucesso!");
        await fetchPayoutData();
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 5005);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Erro ao executar a automação de repasses.");
        setTimeout(() => setErrorMessage(null), 5005);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Erro de rede ao conectar com o servidor.");
      setTimeout(() => setErrorMessage(null), 5005);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleInstantPayout = async (simulationItem: any) => {
    setLoadingPayouts(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let repasseId = simulationItem.repasseId;
      
      // If it hasn't been created in backend yet, we trigger automated process first
      if (!simulationItem.alreadyProcessed) {
        const trigResp = await fetch("/api/financial/repasses/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxaAdministrativaPercent: adminFeePercentage })
        });
        if (trigResp.ok) {
          const trigData = await trigResp.json();
          const newRep = trigData.processed?.find((r: any) => r.faturamentoId === simulationItem.faturamentoId);
          if (newRep) {
            repasseId = newRep.id;
          }
        }
      }
      
      if (!repasseId) {
        const listResp = await fetch("/api/financial/repasses");
        if (listResp.ok) {
          const list = await listResp.json();
          const found = list.find((r: any) => r.faturamentoId === simulationItem.faturamentoId);
          if (found) repasseId = found.id;
        }
      }
      
      if (!repasseId) {
        throw new Error("Não foi possível gerar-localizar o log de repasse.");
      }

      const response = await fetch(`/api/financial/repasses/${repasseId}/payout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixKey: simulationItem.proprietarioPixKey })
      });

      if (response.ok) {
        setSuccessMessage(`Pix de repasse no valor de ${formatBrl(simulationItem.valorLiquido)} enviado para ${simulationItem.proprietarioNome || "proprietário"}!`);
        await fetchPayoutData();
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 5005);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Erro ao liquidar repasse via Pix.");
        setTimeout(() => setErrorMessage(null), 5005);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Erro de transferência de repasse.");
      setTimeout(() => setErrorMessage(null), 5005);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleOpenScheduleModal = (item: any) => {
    setSchedulingPayout(item);
    setPayoutScheduleDate(new Date().toISOString().split("T")[0]);
    setPayoutCustomPixKey(item.proprietarioPixKey || "");
  };

  const handleSaveSchedulePayout = async () => {
    if (!schedulingPayout) return;
    setLoadingPayouts(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let repasseId = schedulingPayout.repasseId;
      
      if (!schedulingPayout.alreadyProcessed) {
        const trigResp = await fetch("/api/financial/repasses/trigger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taxaAdministrativaPercent: adminFeePercentage })
        });
        if (trigResp.ok) {
          const trigData = await trigResp.json();
          const newRep = trigData.processed?.find((r: any) => r.faturamentoId === schedulingPayout.faturamentoId);
          if (newRep) repasseId = newRep.id;
        }
      }
      
      if (!repasseId) {
        const listResp = await fetch("/api/financial/repasses");
        if (listResp.ok) {
          const list = await listResp.json();
          const found = list.find((r: any) => r.faturamentoId === schedulingPayout.faturamentoId);
          if (found) repasseId = found.id;
        }
      }

      if (!repasseId) {
        throw new Error("Não foi possível gerar-localizar o log de repasse.");
      }

      const response = await fetch(`/api/financial/repasses/${repasseId}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: payoutScheduleDate,
          customPixKey: payoutCustomPixKey
        })
      });

      if (response.ok) {
        setSuccessMessage(`Repasse agendado com sucesso para ${payoutScheduleDate}!`);
        setSchedulingPayout(null);
        await fetchPayoutData();
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 5005);
      } else {
        const err = await response.json();
        setErrorMessage(err.error || "Erro ao agendar repasse.");
        setTimeout(() => setErrorMessage(null), 5005);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Erro no agendamento do Pix.");
      setTimeout(() => setErrorMessage(null), 5005);
    } finally {
      setLoadingPayouts(false);
    }
  };

  const handleDeleteRepasseLog = async (id: string) => {
    if (!window.confirm("Confirmar exclusão definitiva do log de transação de repasse do histórico?")) return;
    setLoadingPayouts(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await fetch(`/api/financial/repasses/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSuccessMessage("Log de transação de repasse excluído!");
        await fetchPayoutData();
        if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setErrorMessage("Erro ao deletar log de repasse.");
        setTimeout(() => setErrorMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
      setErrorMessage("Erro ao se conectar com o servidor.");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setLoadingPayouts(false);
    }
  };

  // Helpers for category styling and translation
  const getCategoryLabel = (cat: string) => {
    const mapping: Record<string, string> = {
      AGUA: "Água / Saneamento",
      LUZ: "Luz / Energia Elétrica",
      INTERNET: "Internet / Conectividade",
      MANUTENCAO: "Manutenção Geral",
      OUTROS: "Outros Custos"
    };
    return mapping[cat] || cat;
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "AGUA": return <Droplets className="h-4 w-4 text-sky-600" />;
      case "LUZ": return <Zap className="h-4 w-4 text-amber-500" />;
      case "INTERNET": return <Wifi className="h-4 w-4 text-indigo-500" />;
      case "MANUTENCAO": return <Wrench className="h-4 w-4 text-emerald-600" />;
      default: return <Coins className="h-4 w-4 text-slate-500" />;
    }
  };

  const getBoletoStatusBadge = (status: 'PENDENTE' | 'PAGO' | 'ATRASADO', dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date(CURRENT_SYSTEM_TIME) && status === "PENDENTE";
    
    if (status === "PAGO") {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
          Compensado
        </span>
      );
    }
    if (isOverdue) {
      return (
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 animate-pulse">
          Atrasado
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200">
        Pendente
      </span>
    );
  };

  // Recharts Monthly Revenue vs Expenses Data compilation
  // Gather chronologically grouped values from January to December 2026
  const getChartData = () => {
    const months = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
    const monthLabelsMap: Record<string, string> = {
      "2026-01": "Jan/26",
      "2026-02": "Fev/26",
      "2026-03": "Mar/26",
      "2026-04": "Abr/26",
      "2026-05": "Mai/26",
      "2026-06": "Jun/26",
    };

    return months.map(m => {
      // Revenues in this month (PAGO faturamentos with dueDate matching month)
      const matchingFaturamentos = faturamentos.filter(fat => {
        const associatedContract = contratos.find(c => c.id === fat.contratoId);
        const isSelectedImovel = !selectedImovelFilter || (associatedContract && associatedContract.imovelId === selectedImovelFilter);
        return isSelectedImovel && fat.dataVencimento.startsWith(m);
      });

      const receitasPago = matchingFaturamentos
        .filter(f => f.status === "PAGO")
        .reduce((sum, f) => sum + (f.valorPago || f.valorBase), 0);

      const faturamentoTotalPrevisto = matchingFaturamentos.reduce((sum, f) => {
        if (f.status === "PAGO") return sum + (f.valorPago || f.valorBase);
        const isOverdue = new Date(f.dataVencimento) < new Date(CURRENT_SYSTEM_TIME);
        if (isOverdue) {
          const delayDays = Math.floor((new Date(CURRENT_SYSTEM_TIME).getTime() - new Date(f.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
          return sum + f.valorBase + (f.valorBase * 0.10) + ((0.01 / 30) * delayDays * f.valorBase);
        }
        return sum + f.valorBase;
      }, 0);

      // Expenses in this month
      const matchingExpenses = despesas.filter(desp => {
        const isSelectedImovel = !selectedImovelFilter || desp.imovelId === selectedImovelFilter;
        return isSelectedImovel && desp.mesAno === m;
      });
      const custos = matchingExpenses.reduce((sum, d) => sum + d.valor, 0);

      const netReal = receitasPago - custos;

      return {
        name: monthLabelsMap[m] || m,
        "Receita Realizada (Entradas)": parseFloat(receitasPago.toFixed(2)),
        "Receita Prevista": parseFloat(faturamentoTotalPrevisto.toFixed(2)),
        "Custos Operacionais (Saídas)": parseFloat(custos.toFixed(2)),
        "Fluxo de Caixa Líquido": parseFloat(netReal.toFixed(2))
      };
    });
  };

  const chartData = getChartData();

  // Categories Distribution Chart Data
  const categoriesList = ["AGUA", "LUZ", "INTERNET", "MANUTENCAO", "OUTROS"];
  const categoriesColors = {
    AGUA: "#0284c7",       // State-sky-620
    LUZ: "#f59e0b",        // Amber-500
    INTERNET: "#6366f1",   // Indigo-500
    MANUTENCAO: "#10b981", // Emerald-500
    OUTROS: "#64748b"      // Slate-500
  };

  const costDistributionData = categoriesList.map(cat => {
    const val = filteredDespesas
      .filter(d => d.categoria === cat)
      .reduce((sum, d) => sum + d.valor, 0);
    return {
      name: getCategoryLabel(cat),
      value: parseFloat(val.toFixed(2)),
      color: categoriesColors[cat as keyof typeof categoriesColors]
    };
  }).filter(item => item.value > 0);

  // Contract list with tenant name for drop downs
  const getContractDescription = (cid: string) => {
    const match = contratos.find(c => c.id === cid);
    if (!match) return cid;
    const name = match.inquilino?.nome || "Inquilino Sem Nome";
    const shortenedAddress = match.imovel ? match.imovel.endereco.split(',')[0] : "Imóvel";
    return `${cid} (${name.split(' ')[0]} - ${shortenedAddress})`;
  };

  return (
    <div className="space-y-6" id="financial-module-root">
      
      {/* Interactive Control Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">Gestão de Orçamentação & Custos</h2>
            <p className="text-[11px] text-gray-400 font-medium">Análise de rentabilidade e fluxo entre receitas e despesas por contrato</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3.5">
          {/* Properties Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Filtrar por Imóvel</span>
            <select
              value={selectedImovelFilter}
              onChange={(e) => setSelectedImovelFilter(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">Todos os Imóveis</option>
              {imoveis.map(i => (
                <option key={i.id} value={i.id}>
                  {i.tipo} — {i.endereco.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Mês</span>
            <select
              value={selectedMonthFilter}
              onChange={(e) => setSelectedMonthFilter(e.target.value)}
              className="py-1.5 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">Filtro Temporal (Todos)</option>
              <option value="2026-01">Janeiro / 2026</option>
              <option value="2026-02">Fevereiro / 2026</option>
              <option value="2026-03">Março / 2026</option>
              <option value="2026-04">Abril / 2026</option>
              <option value="2026-05">Maio / 2026</option>
              <option value="2026-06">Junho / 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error & Success Event Toast Banners */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <div>{successMessage}</div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Sub-Navigation Tabs inside Financial section */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <PieChartIcon className="h-4 w-4" />
            Análise do Administrador
          </button>
          
          <button
            onClick={() => setActiveSubTab('custos')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'custos'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
            id="tab-custos-mensais"
          >
            <Coins className="h-4 w-4" />
            Lançamento de Custos Mensais
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              {filteredDespesas.length} custos
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('boletos')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'boletos'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Receipt className="h-4 w-4" />
            Emissão Manual & Mora Estrita
          </button>

          <button
            onClick={() => setActiveSubTab('repasses')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'repasses'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            Repasses aos Proprietários
            <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              Automado
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('integracao')}
            className={`pb-3.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeSubTab === 'integracao'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Zap className="h-4 w-4 text-indigo-500" />
            🔌 Conexão API Bancária
            <span className="bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
              Real-time
            </span>
          </button>
        </nav>
      </div>

      {/* TAB 1: DASHBOARD DE GESTÃO ANALÍTICA */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6" id="fin-tab-dashboard">
          
          {/* Bento-style KPI statistics grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI Card 1: Revenue realized */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">Entradas Reais (Caixa)</span>
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-950 tracking-tight">R$ {receitasRealizadasRaw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Total de cobranças quitadas compensadas</p>
              </div>
            </div>

            {/* KPI Card 2: Revenue pending */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-wider">Pendências (Previsto)</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-950 tracking-tight">R$ {receitasPendentesRaw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Contas enviadas aguardando quitação</p>
              </div>
            </div>

            {/* KPI Card 3: Outflow Costs */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-wider">Custos Mensais (Saídas)</span>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <ArrowDownRight className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-950 tracking-tight">R$ {custosTotaisRaw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                <p className="text-[10px] text-gray-400 font-medium">Água, luz, internet, manutenção, outros</p>
              </div>
            </div>

            {/* KPI Card 4: Net Balance */}
            <div 
              style={{ color: '#040000' }}
              className={`p-5 rounded-2xl border shadow-2xs space-y-2 transition ${
                saldoLiquidoRealizado >= 0 
                  ? 'bg-emerald-50/20 border-emerald-100' 
                  : 'bg-rose-50/20 border-rose-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <span 
                  style={{ color: '#52d056', backgroundColor: '#87dea2' }}
                  className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider px-1.5 py-0.5 rounded"
                >
                  Resultado Líquido
                </span>
                <div className={`p-1.5 rounded-lg ${saldoLiquidoRealizado >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div>
                <h3 
                  style={{ color: '#1ed146' }}
                  className="text-2xl font-black tracking-tight"
                >
                  R$ {saldoLiquidoRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                  Margem: <strong className="font-extrabold">{margemRealizada.toFixed(1)}%</strong>
                </p>
              </div>
            </div>

          </div>

          {/* Analytical Charts Block */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Cash Flow Over Time Line/Area Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <div>
                  <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">DRE Semestral (Entradas vs Custos)</h4>
                  <p className="text-[11px] text-gray-400 font-medium">Ativos liquidados em regime de caixa comparados às despesas operacionais</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-indigo-600 rounded-full inline-block"></span> Entradas</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 bg-amber-500 rounded-full inline-block"></span> Saídas</span>
                </div>
              </div>

              <div className="h-[280px] w-full text-xs">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Insira custos ou faturamentos para popular gráficos.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenues" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px" }}
                        labelStyle={{ color: "#f8fafc", fontWeight: "bold" }}
                        itemStyle={{ color: "#cbd5e1" }}
                      />
                      <Area type="monotone" dataKey="Receita Realizada (Entradas)" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenues)" />
                      <Area type="monotone" dataKey="Custos Operacionais (Saídas)" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpenses)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Expenses Category share block & percentage representation */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
              <div>
                <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Composição de Gastos</h4>
                <p className="text-[11px] text-gray-400 font-medium">Distribuição percentual dos custos operacionais inseridos</p>
              </div>

              {costDistributionData.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center text-gray-400 text-xs space-y-1.5 py-12 bg-slate-50 rounded-xl">
                  <Info className="h-6 w-6 text-gray-300" />
                  <p>Sem gastos registrados no escopo selecionado.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-1">
                  
                  {/* Visually stunning horizontal progress meters */}
                  <div className="space-y-3">
                    {costDistributionData.map(item => {
                      const percentage = custosTotaisRaw > 0 ? (item.value / custosTotaisRaw) * 100 : 0;
                      return (
                        <div key={item.name} className="space-y-1 text-xs">
                          <div className="flex justify-between items-center text-gray-600 font-semibold">
                            <span className="flex items-center gap-1.5 uppercase text-[10px]">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                              {item.name}
                            </span>
                            <span className="font-mono text-gray-800">
                              R$ {item.value.toFixed(2)} ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%`, backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3 bg-indigo-50/40 border border-indigo-100/30 rounded-xl text-[10px] text-indigo-950 space-y-1">
                    <span className="font-bold flex items-center gap-1 uppercase tracking-tight"><Info className="h-3.5 w-3.5" /> Metas de Custos Recomendadas</span>
                    <p className="text-gray-500">De acordo com a Lei de Locação n° 8.245, gastos rotativos extraordinários e de manutenção periódica não devem exceder 15% do valor total bruto de aluguel faturado.</p>
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* DRE Extrato of Consolidated operations */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs space-y-4">
            <div>
              <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Extrato Financeiro Concentrado de Entradas e Saídas</h4>
              <p className="text-[11px] text-gray-400 font-medium">Visualização cronológica consolidada de receitas quitadas e pagamentos de manutenção e consumo</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="min-w-full text-xs text-left" id="consolidated-financial-table">
                <thead className="bg-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3">Lançamento / Data</th>
                    <th className="px-4 py-3">Vínculo Contrato</th>
                    <th className="px-4 py-3">Especificação / Categoria</th>
                    <th className="px-4 py-3">Fluxo</th>
                    <th className="px-4 py-3 text-right">Valor Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  
                  {/* Map over both faturamentos and despesas in unified list sorted by date */}
                  {[
                    ...filteredFaturamentos.filter(f => f.status === "PAGO").map(f => ({
                      uniqueKey: `fat-${f.id}`,
                      date: f.dataPagamento || f.dataVencimento,
                      relacionadoId: f.contratoId,
                      label: "Recebimento de Aluguel (Boleto Quitado)",
                      category: "Aluguel",
                      isExpense: false,
                      value: f.valorPago || f.valorBase
                    })),
                    ...filteredDespesas.map(d => ({
                      uniqueKey: `desp-${d.id}`,
                      date: d.dataDespesa,
                      relacionadoId: d.imovelId,
                      label: d.descricao || `Custo Operacional de ${getCategoryLabel(d.categoria)}`,
                      category: getCategoryLabel(d.categoria),
                      isExpense: true,
                      value: d.valor
                    }))
                  ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(row => (
                    <tr key={row.uniqueKey} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-3 font-mono font-bold text-gray-900 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        {row.date.split('-').reverse().join('/')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-mono text-[10px] rounded">
                          {row.isExpense ? `Imóvel: ${row.relacionadoId}` : `Contrato: ${row.relacionadoId}`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{row.label}</div>
                        <span className="text-[10px] text-gray-400">{row.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        {row.isExpense ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100">
                            SAÍDA (Custo)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-100">
                            ENTRADA (Receita)
                          </span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-extrabold ${row.isExpense ? "text-red-600" : "text-emerald-600"}`}>
                        {row.isExpense ? "-" : "+"} R$ {row.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}

                  {filteredFaturamentos.filter(f => f.status === "PAGO").length === 0 && filteredDespesas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        Nenhum lançamento financeiro compensado para o filtro selecionado.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: INSERÇÃO E LANÇAMENTO DE CUSTOS MENSAIS */}
      {activeSubTab === 'custos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="fin-tab-custos">
          
          {/* Cost Category register form */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Plus className="h-5 w-5 text-indigo-600 animate-bounce" />
              <h3 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Lançar Custo Mensal Novo</h3>
            </div>
            
            {/* Drag & Drop Upload Zone for bills / invoice accounts */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                ⚡ Digitalização Inteligente (IA)
              </label>
              <div 
                onDragEnter={handleDragBill}
                onDragOver={handleDragBill}
                onDragLeave={handleDragBill}
                onDrop={handleDropBill}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                  dragActiveBill 
                    ? "border-indigo-500 bg-indigo-50/20 scale-[0.98]" 
                    : "border-gray-200 hover:border-indigo-400 hover:bg-slate-50/50"
                }`}
              >
                <label htmlFor="bill-upload-input" className="cursor-pointer block">
                  <input 
                    id="bill-upload-input"
                    type="file" 
                    className="hidden" 
                    onChange={handleBillFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 text-xs">
                    {analyzingBill ? (
                      <div className="flex flex-col items-center gap-2 text-indigo-850 font-bold py-2">
                        <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                        <span>Espere... A IA está lendo o boleto</span>
                        <span className="text-[9px] text-slate-400 font-medium leading-none">Cruzando endereços e avaliando consumo...</span>
                      </div>
                    ) : (
                      <>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-indigo-600 hover:text-indigo-800">
                          Digitalizar Conta por IA
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Arraste arquivos de conta de luz, água ou conserto aqui para preenchimento automático.
                        </span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              
              {uploadedBillName && (
                <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-150 rounded-xl text-xs">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-emerald-800 truncate" title={uploadedBillName}>
                      {uploadedBillName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedBillName("");
                      setUploadedFileBase64("");
                      setCostAiComentario("");
                    }}
                    className="text-[9px] bg-white border border-emerald-200 py-0.5 px-2 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-emerald-700 transition font-bold cursor-pointer"
                  >
                    Excluir
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 text-xs font-medium text-gray-700">
              
              {/* Target property select */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Imóvel Relacionado *</label>
                <select
                  value={costImovelId}
                  onChange={(e) => setCostImovelId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="">Selecione o imóvel...</option>
                  {imoveis.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.tipo} — {i.endereco.split(',')[0]} {i.isBuilding ? "🏢" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1 mb-2">Selecione o imóvel cadastrado para lançar esta despesa</p>

                {costImovelId && imoveis.find(i => i.id === costImovelId)?.isBuilding && (
                  <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-800 text-[11px] leading-relaxed animate-in fade-in duration-150 font-medium">
                    <span className="block font-bold uppercase tracking-wider mb-0.5 text-[9px] text-emerald-700">🏢 Custo do Prédio Geral</span>
                    Trata-se de imóvel único (prédio com múltiplos apartamentos). Portanto, os lançamentos de custo mensal tratam do prédio como um todo e não de cada unidade individual. Esta despesa será apontada como custo geral de operação do edifício.
                  </div>
                )}
              </div>

              {/* Categorias */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categoria do Custo *</label>
                <select
                  value={costCategory}
                  onChange={(e) => setCostCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                >
                  <option value="LUZ">Luz / Energia Elétrica ⚡</option>
                  <option value="AGUA">Água / Saneamento 💧</option>
                  <option value="INTERNET">Internet / Conectividade 🌐</option>
                  <option value="MANUTENCAO">Manutenção Geral 🛠️</option>
                  <option value="OUTROS">Outros Custos 🪙</option>
                </select>
              </div>

              {/* Amount form entry */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Valor do Custo (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-gray-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={costAmount}
                    onChange={(e) => setCostAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-extrabold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Year and month selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mês de Referência *</label>
                  <input
                    type="month"
                    value={costMonthYear}
                    onChange={(e) => setCostMonthYear(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                {/* Expanse pay date */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Data Pagamento *</label>
                  <input
                    type="date"
                    value={costDate}
                    onChange={(e) => setCostDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-medium"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Descrição / Justificativa</label>
                <textarea
                  placeholder="Ex: Conta de luz vencida ou conserto emergencial do encanamento de cobre realizado"
                  value={costDescription}
                  onChange={(e) => setCostDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                />
              </div>

              {/* Caixa de Avaliação Mensal de Custos */}
              <div className="bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 space-y-1">
                <label className="block text-[11px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  Caixa de Avaliação Mensal de Custos
                </label>
                <textarea
                  placeholder="Se houver pontos de atenção da IA sobre flutuações tarifárias ou consumo fora de padrão, eles serão exibidos aqui pós-upload comercial..."
                  value={costAiComentario}
                  onChange={(e) => setCostAiComentario(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-xs leading-relaxed text-indigo-950/90 focus:outline-none font-medium placeholder:text-gray-400"
                />
                <span className="text-[9px] text-indigo-600 font-semibold block leading-tight">
                  Este comentário consolidará o histórico deste lançamento e o padrão medido.
                </span>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={savingCost || !costImovelId || !costAmount}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-2xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingCost ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Registrando custo...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Cadastrar Custo de Operação
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Costs historical listing ledger */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-950 uppercase tracking-tight">Razão Auxiliar de Custos Mensais</h3>
                <p className="text-[11px] text-gray-400 font-medium">Lista de todos os custos inseridos manualmente para as contas extraordinárias</p>
              </div>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Total Custos: <strong>{filteredDespesas.length} item(s)</strong>
              </span>
            </div>

            {filteredDespesas.length === 0 ? (
              <div className="p-16 text-center text-gray-400 space-y-2 bg-slate-50 rounded-2xl">
                <Coins className="h-8 w-8 mx-auto text-gray-300 animate-pulse" />
                <p className="text-xs font-semibold">Nenhum custo mensal registrado neste filtro.</p>
                <p className="text-[11px] text-gray-400">Insira contas utilizando o formulário ao lado para realizar o monitoramento.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDespesas.map(desp => (
                  <div key={desp.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/40 hover:bg-white hover:border-indigo-100 transition flex flex-col gap-3 text-xs text-left">
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-white rounded-lg border border-gray-100 shadow-3xs shrink-0 self-start mt-0.5">
                        {getCategoryIcon(desp.categoria)}
                      </div>
                      
                      <div className="space-y-1.5 flex-1 select-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-gray-900 text-sm">
                            R$ {desp.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            {getCategoryLabel(desp.categoria)}
                          </span>
                          <span className="text-[9px] bg-slate-100 text-slate-800 font-mono px-1.5 py-0.2 rounded font-bold">
                            Mês Ref: {desp.mesAno}
                          </span>
                        </div>
                        
                        <p className="font-semibold text-gray-700 leading-tight">
                          {desp.descricao || "Custo extraordinário lançado"}
                        </p>
                        
                        <p className="text-[10px] text-gray-400 font-medium font-sans">
                          Imóvel Relacionado: <strong className="text-indigo-600 font-bold">{(imoveis.find(i => i.id === desp.imovelId)?.endereco || desp.imovelId).split(' - ')[0]}</strong> {imoveis.find(i => i.id === desp.imovelId)?.isBuilding && <span className="ml-1.5 px-1.5 py-0.5 text-[8.5px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-sans font-medium">🏢 Custo Geral do Prédio</span>} • Pago/Lançado em {desp.dataDespesa.split('-').reverse().join('/')}
                        </p>

                        {/* File attachment preview & download fallback capability */}
                        {desp.arquivoNome && (
                          <div className="pt-1 flex items-center gap-1.5 font-sans">
                            <span className="text-[10px] text-gray-400 font-bold">Anexo original:</span>
                            <a
                              href={desp.arquivoBase64 || "#"}
                              download={desp.arquivoNome}
                              onClick={(e) => {
                                if (!desp.arquivoBase64) {
                                  e.preventDefault();
                                  alert("Este documento está salvo no faturamento em memória para o ciclo corrente.");
                                }
                              }}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold font-mono text-[9px] rounded-md transition"
                              title="Clique para baixar a nota/recibo fiscal associado"
                            >
                              <Download className="h-3 w-3 text-indigo-600 shrink-0" />
                              {desp.arquivoNome}
                            </a>
                          </div>
                        )}

                        {/* Beautiful Sparkled AI Commentary Area (Caixa de Avaliação Mensal de Custos) */}
                        {desp.aiComentario && (
                          <div className="mt-2.5 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-[11px] leading-relaxed text-indigo-950 font-medium space-y-1">
                            <div className="flex items-center gap-1 text-[9.5px] text-indigo-700 font-extrabold uppercase tracking-tight font-sans">
                              <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                              Avaliação Mensal de Custos (IA Condo+)
                            </div>
                            <p className="font-sans leading-relaxed">{desp.aiComentario}</p>
                          </div>
                        )}

                        {/* Inline actions footer for editing/reclassification */}
                        <div className="pt-1.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpenseId(desp.id);
                              setEditImovelId(desp.imovelId);
                              setEditCategory(desp.categoria);
                              setEditAmount(desp.valor.toString());
                              setEditMonthYear(desp.mesAno);
                              setEditDate(desp.dataDespesa);
                              setEditDescription(desp.descricao || "");
                              setEditAiComentario(desp.aiComentario || "");
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-indigo-600 bg-indigo-50/45 border border-indigo-100/50 hover:bg-indigo-100/55 hover:text-indigo-800 transition rounded-lg text-[9.5px] uppercase font-bold cursor-pointer"
                          >
                            <Edit3 className="h-3 w-3 shrink-0" /> Reclassificar / Editar
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(desp.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-red-600 hover:bg-red-50/50 transition rounded-lg text-[9.5px] uppercase font-bold cursor-pointer"
                            title="Remover custo permanente"
                          >
                            <Trash2 className="h-3 w-3 shrink-0" /> Excluir
                          </button>
                        </div>

                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-2xl text-[10.5px] text-orange-900 space-y-1">
              <span className="font-bold flex items-center gap-1 uppercase tracking-tight"><Info className="h-3.5 w-3.5" /> Nota de Repasse e Lei n° 8.245 (Lei do Inquilinato)</span>
              <p className="text-orange-900/80 font-medium">De acordo com o Artigo 22, despesas ordinárias de condomínio, água e eletricidade de consumo direto constituem obrigação do locatário. Já obras de reforma estrutural extraordinária constituem obrigação exclusiva do locador. O administrador deve concentrar tais saídas para cálculo de margem real de retorno do imóvel.</p>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CALCULADORA DE MORA E EMISSÃO DE BOLETOS */}
      {activeSubTab === 'boletos' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="fin-tab-boletos">
          
          {/* Interactive Pro-Rata Calculator & Registered invoice generation side cards */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Step-by-Step interactive fee calculator */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Calculadora de Encargos de Mora</h4>
              </div>
              <p className="text-xs text-gray-400">Insira valores para calcular a multa e os juros contratuais aplicados sob atrasos legais no Condo+.</p>
              
              <div className="space-y-3.5 text-xs text-gray-700">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ALUGUEL BASE ($V_b$)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2.5 text-gray-400 font-bold">R$</span>
                    <input
                      type="number"
                      value={calcBaseRent}
                      onChange={(e) => setCalcBaseRent(Number(e.target.value))}
                      className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Edit Fine and Interest rates manually */}
                <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-2.5 rounded-lg border border-slate-150 shadow-3xs">
                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Multa Base (%)</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalcFinePercent(prev => Math.max(0, prev - 1))}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black rounded text-[11px] cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={calcFinePercent}
                        onChange={(e) => setCalcFinePercent(Math.max(0, Number(e.target.value)))}
                        className="w-12 text-center p-1 border border-gray-200 bg-white rounded font-bold text-gray-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setCalcFinePercent(prev => prev + 1)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black rounded text-[11px] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[9px] font-black text-slate-500 uppercase tracking-wider">Juros ao Mês (%)</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setCalcInterestPercent(prev => Math.max(0, prev - 0.5))}
                        className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black rounded text-[11px] cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step="0.5"
                        value={calcInterestPercent}
                        onChange={(e) => setCalcInterestPercent(Math.max(0, Number(e.target.value)))}
                        className="w-12 text-center p-1 border border-gray-200 bg-white rounded font-bold text-gray-800 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setCalcInterestPercent(prev => prev + 0.5)}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black rounded text-[11px] cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleReloadParamsFromDefault}
                    className="text-[9px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <RefreshCw className="h-2.5 w-2.5 shrink-0" />
                    Resetar p/ Padrão do Contrato
                  </button>

                  <span className="text-[8px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    Sincronizado c/ Contrato Padrão
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">DIAS DE ATRASO ($d$)</label>
                  <input
                    type="number"
                    value={calcDelayDays}
                    onChange={(e) => setCalcDelayDays(Number(e.target.value))}
                    placeholder="Dias em atraso"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 shadow-2xs"
                  />
                </div>

                <button
                  onClick={handleCalculateFees}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white hover:text-white font-bold rounded-lg text-xs transition cursor-pointer font-sans"
                >
                  Executar Pro-Rata Die
                </button>
              </div>

              {calcResult && (
                <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-2.5 shadow-2xs animate-in slide-in-from-top-2 duration-150">
                  <span className="font-bold text-indigo-950 uppercase text-[9px] tracking-wider block border-b border-indigo-100/50 pb-1.5 flex items-center justify-between">
                    <span>Demonstrativo de Cálculo de Mora</span>
                    <span className="px-1.5 py-0.2 rounded text-[7.5px] bg-indigo-100/80 font-mono text-indigo-700">Ativa</span>
                  </span>
                  
                  <div className="space-y-1.5 text-gray-600 font-medium">
                    <div className="flex justify-between">
                      <span>Aluguel de Entrada ($V_b$):</span>
                      <span className="font-mono text-gray-800 font-bold">R$ {calcResult.baseRent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-yellow-850">
                      <span>Multa contratual ($M = {calcFinePercent}\%$):</span>
                      <span className="font-mono font-black">R$ {calcResult.fine.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-700">
                      <span>Juros Pró-rata ($J = {calcInterestPercent}\%/30 \times d$):</span>
                      <span className="font-mono font-black">R$ {calcResult.interest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-indigo-200/50 pt-1.5 text-indigo-950 text-sm font-extrabold bg-indigo-50/20 px-1 rounded">
                      <span>Total Atualizado ($V_t$):</span>
                      <span className="font-mono text-indigo-700 font-black">R$ {calcResult.totalDue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-white rounded border border-indigo-100/30 text-[10px] text-indigo-900 font-mono text-center">
                    V_t = V_b + ({calcResult.delayInDays > 0 ? `${calcFinePercent}%` : "0%"}) + ({calcInterestPercent}%/30 * {calcResult.delayInDays} * V_b)
                  </div>
                </div>
              )}
            </div>

            {/* Generate real billing invoice for specific contract */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Emissão Manual de Faturamento</h4>
              </div>

              <form onSubmit={handleCreateBilling} className="space-y-3.5 text-xs text-gray-700">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contrato de Destino</label>
                  <select
                    value={selectedContrato}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedContrato(val);
                      const matched = contratos.find(c => c.id === val);
                      if (matched?.imovel) {
                        setInvoiceBaseRent(matched.imovel.valorAluguel);
                      }
                    }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                    required
                  >
                    <option value="">Selecione o contrato...</option>
                    {contratos.map(c => (
                      <option key={c.id} value={c.id}>
                        Inq: {c.inquilino?.nome?.split(' ')[0]} — {c.imovel?.endereco.slice(0, 25)}...
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Valor do Boleto Base</label>
                  <input
                    type="number"
                    value={invoiceBaseRent}
                    onChange={(e) => setInvoiceBaseRent(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Vencimento Planejado</label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-650"
                    required
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Vencimentos anteriores à data do sistema (21/05/2026) sofrerão mora.</p>
                </div>

                <button
                  type="submit"
                  disabled={submittingInvoice || !selectedContrato}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer"
                >
                  {submittingInvoice ? "Registrando Boleto..." : "Registrar Boleto Novo"}
                </button>
              </form>
            </div>

            {/* NOVO CARD: Calculadora & Emissor de Pro-rata (Entrada e Saída) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight">Pro-rata de Entrada / Saída</h4>
              </div>
              <p className="text-xs text-gray-400 leading-normal">
                Calcule e emita o aluguel proporcional considerando a data de posse inicial ou encerramento do contrato de forma justa.
              </p>

              <form onSubmit={handleEmitProrataInvoice} className="space-y-4 text-xs text-gray-700">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Contrato Selecionado</label>
                  <select
                    value={prorataContractId}
                    onChange={(e) => handleProrataContractChange(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Selecione o contrato...</option>
                    {contratos.map(c => (
                      <option key={c.id} value={c.id}>
                        Inq: {c.inquilino?.nome?.split(' ')[0]} — {c.imovel?.endereco?.split(' - ')[0]?.substring(0, 20)}... (Dia {c.diaVencimento})
                      </option>
                    ))}
                  </select>
                </div>

                {prorataContractId && (
                  <div className="space-y-3.5 animate-in fade-in duration-200 text-left">
                    {/* Prorata Type selector toggle */}
                    <div className="space-y-1">
                      <span className="block font-bold text-gray-700 text-[10px] uppercase text-gray-400">Vigência de Cobrança</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setProrataType('ENTRADA')}
                          className={`py-2 px-3 border rounded-lg font-bold text-center transition ${prorataType === 'ENTRADA' ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 cursor-pointer"}`}
                        >
                          Entrada (Moradia)
                        </button>
                        <button
                          type="button"
                          onClick={() => setProrataType('SAIDA')}
                          className={`py-2 px-3 border rounded-lg font-bold text-center transition ${prorataType === 'SAIDA' ? "bg-indigo-50 border-indigo-300 text-indigo-700 shadow-3xs" : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 cursor-pointer"}`}
                        >
                          Saída (Desocupação)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Aluguel Base</label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-gray-400 font-bold">R$</span>
                          <input
                            type="number"
                            value={prorataBaseRent}
                            onChange={(e) => setProrataBaseRent(Number(e.target.value))}
                            className="w-full pl-7 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Dias Proporcionais</label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setProrataDays(prev => Math.max(1, prev - 1))}
                            className="px-2 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-black rounded text-[11px] cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={prorataDays}
                            onChange={(e) => setProrataDays(Math.max(1, Number(e.target.value)))}
                            className="w-10 text-center p-1.5 border border-gray-200 bg-white rounded font-bold text-gray-800 text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setProrataDays(prev => prev + 1)}
                            className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-black rounded text-[11px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {prorataType === 'ENTRADA' ? "Entrada Efetiva" : "Data da Desocupação"}
                        </label>
                        <input
                          type="date"
                          value={prorataDate}
                          onChange={(e) => handleProrataDateOrDueDateChange(e.target.value, prorataDueDate)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-650"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">Próx. Vencimento</label>
                        <input
                          type="date"
                          value={prorataDueDate}
                          onChange={(e) => handleProrataDateOrDueDateChange(prorataDate, e.target.value)}
                          className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-650"
                        />
                      </div>
                    </div>

                    {prorataType === 'ENTRADA' && (
                      <label className="flex items-center gap-2 bg-indigo-50/45 p-2.5 border border-indigo-100/50 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          checked={prorataIncludeMonthly}
                          onChange={(e) => setProrataIncludeMonthly(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="text-left">
                          <span className="font-bold text-indigo-950 block text-[10.5px]">Incluir o aluguel mensal</span>
                          <span className="text-[9px] text-gray-400 block font-medium">Fração do 1º período + mensalidade cheia</span>
                        </div>
                      </label>
                    )}

                    {prorataResult && (
                      <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100 text-xs space-y-2.5 shadow-2xs animate-fade-in text-left">
                        <span className="font-bold text-indigo-950 uppercase text-[9px] tracking-wider block border-b border-indigo-100/50 pb-1.5 flex justify-between items-center">
                          <span>Demonstrativo Pró-rata {prorataType === 'ENTRADA' ? "Admissão " : "Desocupação"}</span>
                          <span className="px-1.5 py-0.2 rounded text-[7.5px] bg-indigo-100/80 font-mono text-indigo-700">Calculado</span>
                        </span>

                        <div className="space-y-1.5 text-[11px] text-gray-600 font-medium">
                          <div className="flex justify-between">
                            <span>Aluguel Base (Contrato):</span>
                            <span className="font-mono text-gray-800 font-bold">R$ {prorataBaseRent.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Valor de 1 dia (Base / 30):</span>
                            <span className="font-mono text-gray-800 font-bold">R$ {(prorataBaseRent / 30).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-indigo-900 font-bold">
                            <span>Fração proporcional ({prorataDays} dias):</span>
                            <span className="font-mono">R$ {prorataResult.daysRent.toFixed(2)}</span>
                          </div>
                          {prorataType === 'ENTRADA' && prorataIncludeMonthly && (
                            <div className="flex justify-between text-emerald-800 font-bold pb-1 border-b border-indigo-100/20">
                              <span>Mensalidade Base Somada:</span>
                              <span className="font-mono text-emerald-700">+ R$ {prorataResult.monthlyRent.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-indigo-200/50 pt-1.5 text-indigo-950 text-sm font-extrabold bg-indigo-50/20 px-1 rounded">
                            <span>Total Líquido Cobrado:</span>
                            <span className="font-mono text-indigo-700 font-black text-xs sm:text-sm">R$ {prorataResult.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-white rounded border border-indigo-100/30 text-[9.5px] text-indigo-900 font-mono leading-relaxed whitespace-pre-line text-left">
                          {prorataResult.description}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submittingInvoice}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-1.5 uppercase shadow-xs active:scale-98"
                    >
                      {submittingInvoice ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Emitindo Faturamento...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Gerar & Emitir Boleto Proporcional</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>

          </div>

          {/* Invoice Registry list */}
          <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-950 tracking-tight">Registro de Cobranças (Boleto Gateway)</h3>
                <p className="text-xs text-gray-400">Boleto integrador e compensação emulada em gateway de pagamento</p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                Data Hoje: <strong className="text-indigo-600">21/05/2026</strong>
              </span>
            </div>

            {filteredFaturamentos.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Receipt className="h-10 w-10 mx-auto text-gray-300 animate-pulse" />
                <p className="text-xs">Não há cobranças geradas para o escopo selecionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFaturamentos.map(fat => {
                  const isOverdue = new Date(fat.dataVencimento) < new Date(CURRENT_SYSTEM_TIME) && fat.status === "PENDENTE";
                  const delayDays = isOverdue ? Math.floor((new Date(CURRENT_SYSTEM_TIME).getTime() - new Date(fat.dataVencimento).getTime()) / (1000 * 60 * 60 * 24)) : 0;
                  
                  const fine = isOverdue ? fat.valorBase * 0.10 : (fat.multaAplicada || 0);
                  const juros = isOverdue ? (0.01 / 30) * delayDays * fat.valorBase : (fat.jurosAplicados || 0);
                  const totalAmount = fat.valorBase + fine + juros;

                  return (
                    <div 
                      key={fat.id}
                      className={`p-4 rounded-xl border transition ${
                        isOverdue 
                          ? "bg-red-50/10 border-red-100 hover:border-red-200" 
                          : (fat.status === "PAGO" ? "bg-emerald-50/10 border-emerald-100 hover:border-emerald-200" : "bg-gray-50/20 border-gray-100 hover:border-gray-200")
                      }`}
                    >
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        
                        <div className="space-y-1.5 flex-1 text-xs text-gray-600 font-medium">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] bg-slate-100 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded">
                              ID: {fat.externalId || fat.id}
                            </span>
                            {getBoletoStatusBadge(fat.status, fat.dataVencimento)}
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded font-bold font-mono">
                              Contrato: {fat.contratoId}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-gray-800 mt-1">
                            Faturamento de Locação — {getContractDescription(fat.contratoId)}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] text-gray-500 font-medium pt-1">
                            <div>
                              <span>Vencimento</span>
                              <span className="block text-gray-700 font-bold flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3.5 w-3.5 text-gray-400 inline" />
                                {fat.dataVencimento.split('-').reverse().join('/')}
                              </span>
                            </div>
                            <div>
                              <span>Aluguel Base</span>
                              <span className="block text-gray-700 font-bold mt-0.5">
                                R$ {fat.valorBase.toFixed(2)}
                              </span>
                            </div>
                            {fat.status === "PAGO" ? (
                              <div>
                                <span>Pago Em</span>
                                <span className="block text-emerald-600 font-extrabold mt-0.5">
                                  {fat.dataPagamento?.split('-').reverse().join('/')}
                                </span>
                              </div>
                            ) : (
                              <div>
                                <span>Atraso Real</span>
                                <span className={`block font-extrabold mt-0.5 ${isOverdue ? "text-red-650 font-black" : "text-gray-600"}`}>
                                  {isOverdue ? `${delayDays} dias` : "Em dia"}
                                </span>
                              </div>
                            )}
                          </div>

                          {(isOverdue || fat.multaAplicada > 0 || fat.jurosAplicados > 0) && (
                            <div className="mt-2.5 p-2 bg-gray-105 border border-gray-150 rounded text-[10px] text-gray-500 flex flex-wrap gap-x-4">
                              <span>Multa (10%): <strong>R$ {fine.toFixed(2)}</strong></span>
                              <span>Juros (1%/30 ao dia): <strong>R$ {juros.toFixed(2)}</strong></span>
                              {fat.valorPago && (
                                <span>Valor Pago Final: <strong className="text-emerald-700">R$ {fat.valorPago.toFixed(2)}</strong></span>
                              )}
                            </div>
                          )}

                        </div>

                        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-gray-150 pt-2 md:pt-0 shrink-0">
                          
                          <div className="text-right mr-2">
                            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Total Devido</span>
                            <span className={`text-lg font-black ${fat.status === "PAGO" ? "text-emerald-700" : (isOverdue ? "text-red-700" : "text-indigo-700")}`}>
                              R$ {(fat.valorPago || totalAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {fat.status === "PENDENTE" && (
                            <button
                              onClick={() => handlePayInvoice(fat.id, totalAmount)}
                              className={`mt-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition flex items-center gap-1 cursor-pointer ${
                                isOverdue 
                                  ? "bg-red-600 hover:bg-red-700" 
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                            >
                              <FileCheck className="h-4 w-4 shrink-0" />
                              Quitar Boleto
                            </button>
                          )}

                          <div className="flex gap-2 mt-1.5 items-center">
                            <button
                              onClick={() => setEditingFaturamento(fat)}
                              className="p-1 px-2 border border-gray-200 hover:border-indigo-100 text-slate-500 hover:text-indigo-650 hover:bg-indigo-50/50 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Editar Faturamento"
                            >
                              <Edit3 className="h-3 w-3" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteFaturamento(fat.id)}
                              className="p-1 px-2 border border-gray-200 hover:border-rose-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Excluir cobrança de forma definitiva"
                            >
                              <Trash2 className="h-3 w-3" />
                              Excluir
                            </button>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 4: REPASSES AOS PROPRIETÁRIOS (AUTOMATED LANDLORD PAYOUTS) */}
      {activeSubTab === 'repasses' && (
        <div className="space-y-6 animate-in fade-in duration-250" id="fin-tab-repasses">
          
          {/* Main Informational Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-slate-900 p-6 rounded-2xl text-white shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                  Processamento e Automação de Repasses
                </span>
                <h3 className="text-lg font-black tracking-tight leading-tight flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                  Divisão de Lançamento & Repasses aos Proprietários
                </h3>
                <p className="text-xs text-emerald-100/90 leading-normal max-w-4xl">
                  Gere e liquide automaticamente as obrigações a repassar aos proprietários (Landlords) baseando-se nas mensalidades efetivamente quitadas pelos inquilinos. A taxa administrativa padrão é retida automaticamente para a conta do administrador.
                </p>
              </div>
              
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/10 shrink-0">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-emerald-200">Taxa de Adm. Padrão</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-16 bg-white/15 text-white font-bold text-center text-sm py-1 rounded-lg border border-white/20 focus:outline-none focus:border-emerald-400"
                      value={adminFeePercentage}
                      onChange={(e) => setAdminFeePercentage(Math.max(0, parseFloat(e.target.value) || 0))}
                    />
                    <span className="text-sm font-bold text-emerald-300">%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-wrap gap-3 items-center justify-between">
              <p className="text-[11px] text-emerald-200 font-medium">
                * O processo identifica faturamentos de status <strong className="text-white">PAGO</strong>, deduz a taxa (Ex: {adminFeePercentage}%) e direciona ao PIX registrado.
              </p>
              <button
                onClick={handleTriggerAutomatedPayouts}
                disabled={loadingPayouts}
                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingPayouts ? "animate-spin" : ""}`} />
                Processar Todos os Repasses Pendentes (Automático)
              </button>
            </div>
          </div>

          {/* Quick Stats Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="repass-stats-dashboard">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Total Repassado (Sucedido)</span>
                <span className="text-2xl font-black text-slate-900 block mt-1">
                  {formatBrl(repassesList.filter(r => r.status === "PAGO").reduce((sum, r) => sum + r.valorLiquido, 0))}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                  ✓ {repassesList.filter(r => r.status === "PAGO").length} Pix enviados com sucesso
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Receita de Taxa (Retida Adm)</span>
                <span className="text-2xl font-black text-indigo-700 block mt-1">
                  {formatBrl(repassesList.filter(r => r.status === "PAGO").reduce((sum, r) => sum + r.valorTaxaAdm, 0))}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-1">
                  ⚡ Rendimento médio retido
                </span>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">Repasses Pendentes & Falhos</span>
                <span className="text-2xl font-black text-rose-600 block mt-1">
                  {payoutSimulation.filter(s => !s.alreadyProcessed || s.repasseStatus === "FALHO" || s.repasseStatus === "PENDENTE").length}
                </span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-1">
                  ⚠ Carece de chave PIX ou processamento
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl text-rose-600 font-bold">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="payout-panel-columns">
            
            {/* COLUMN 1: PENDING INVOICES PAYOUT SIMULATION */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4" id="simulation-list-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Faturamentos de Aluguel Recebidos
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">Consulte as faturas quitadas esperando divisão e transferência Pix</p>
                </div>
                <button 
                  onClick={fetchPayoutData}
                  className="p-1.5 hover:bg-slate-50 border border-gray-200 rounded-lg text-slate-500 hover:text-indigo-600 transition"
                  title="Atualizar Dados"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loadingPayouts ? "animate-spin" : ""}`} />
                </button>
              </div>

              {loadingPayouts && payoutSimulation.length === 0 ? (
                <div className="py-12 text-center text-xs font-bold text-gray-400 space-y-2">
                  <RefreshCw className="h-7 w-7 text-emerald-600 animate-spin mx-auto" />
                  <p>Processando simulação dinâmica de taxas de repasse...</p>
                </div>
              ) : payoutSimulation.length === 0 ? (
                <div className="py-12 border border-dashed border-gray-100 rounded-xl text-center text-xs font-semibold text-gray-400 space-y-1">
                  <Receipt className="h-8 w-8 mx-auto text-gray-300" />
                  <p>Nenhuma fatura quitada pendente no histórico.</p>
                  <p className="text-[10px] text-gray-300 font-normal">Marque cobranças como PAGO no boletador para liberar repasse.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {payoutSimulation.map((item, index) => {
                    const hasPix = !!item.proprietarioPixKey;
                    const logStatus = item.repasseStatus;

                    return (
                      <div 
                        key={index}
                        className={`p-4 border rounded-xl space-y-3 transition-all ${
                          logStatus === "PAGO" 
                            ? "border-emerald-100 bg-emerald-50/20" 
                            : logStatus === "AGENDADO"
                            ? "border-amber-100 bg-amber-50/20"
                            : "border-gray-100 hover:border-gray-250 hover:bg-slate-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 border-b border-dashed border-gray-100 pb-2">
                          <div>
                            <span className="text-[11px] font-bold text-slate-800 block">
                              {item.proprietarioNome || "Proprietário sem cadastro"}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              Imóvel: {item.imovelAddress}
                            </span>
                          </div>
                          
                          <div>
                            {logStatus === "PAGO" ? (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-full uppercase">
                                Pago / Liquidado
                              </span>
                            ) : logStatus === "AGENDADO" ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-extrabold rounded-full uppercase">
                                Agendado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[9px] font-extrabold rounded-full uppercase">
                                Pendente
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Calculation Specs Row */}
                        <div className="grid grid-cols-3 gap-2 bg-white/40 p-2 rounded-lg text-center text-xs">
                          <div>
                            <span className="text-[9px] text-gray-400 block leading-tight font-extrabold">ORIGINAL PAGO</span>
                            <span className="font-bold text-slate-700 block mt-0.5">{formatBrl(item.valorOriginal)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-indigo-400 block leading-tight font-bold font-sans">TAXA ADM ({item.taxaAdministrativaPercent}%)</span>
                            <span className="font-bold text-indigo-600 block mt-0.5">-{formatBrl(item.valorTaxaAdm)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-emerald-500 block leading-tight font-extrabold">REP. LÍQUIDO</span>
                            <span className="font-extrabold text-emerald-650 block mt-0.5">{formatBrl(item.valorLiquido)}</span>
                          </div>
                        </div>

                        {/* Pix Key and Actions */}
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-gray-400 font-semibold font-mono">Chave Pix Proprietário:</span>
                            {hasPix ? (
                              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded leading-none">{item.proprietarioPixKey}</span>
                            ) : (
                              <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-1 leading-none border border-rose-100">
                                <AlertTriangle className="h-3 w-3 shrink-0" /> Sem Chave PIX
                              </span>
                            )}
                          </div>

                          {logStatus !== "PAGO" && (
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleOpenScheduleModal(item)}
                                className="px-3 py-1 border border-gray-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                              >
                                <Calendar className="h-3 w-3 shrink-0 text-slate-500" />
                                {logStatus === "AGENDADO" ? "Re-agendar Pix" : "Agendar Repasse"}
                              </button>

                              <button
                                onClick={() => handleInstantPayout(item)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold transition shadow-sm hover:shadow active:scale-95 flex items-center gap-1 cursor-pointer"
                              >
                                <ArrowUpRight className="h-3 w-3 shrink-0" />
                                Transferir Pix Já
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* COLUMN 2: HISTORICAL TRANSACTION LOGS / AUDITOR LIST */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4" id="logs-transaction-card">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    Histórico & Logs de Transferências
                  </h4>
                  <p className="text-[11px] text-gray-400 font-medium">Registro para auditoria e prestação de contas de repasses efetuados</p>
                </div>
              </div>

              {repassesList.length === 0 ? (
                <div className="py-16 border border-dashed border-gray-100 rounded-xl text-center text-xs font-semibold text-gray-400 space-y-1">
                  <FileCheck className="h-8 w-8 mx-auto text-gray-300" />
                  <p>Sem histórico de transações de repasses registrado ainda.</p>
                  <p className="text-[10px] text-gray-300 font-normal">Execute liquidações Pix na coluna ao lado para iniciar históricos.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {repassesList.map((log) => {
                    const isFailed = log.status === "FALHO";
                    const isScheduleOnly = log.status === "AGENDADO";

                    return (
                      <div 
                        key={log.id}
                        className={`p-3.5 border rounded-xl text-xs space-y-2 transition ${
                          isFailed 
                            ? "border-red-150 bg-red-50/25" 
                            : isScheduleOnly 
                            ? "border-amber-150 bg-amber-50/25" 
                            : "border-slate-100 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-extrabold text-slate-800 block">
                              {log.nomeProprietario}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Pix: <strong className="font-mono">{log.pixKey || "Chave não informada"}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {log.status === "PAGO" && (
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-extrabold rounded-full uppercase shrink-0">
                                Sucedido (Pix)
                              </span>
                            )}
                            {log.status === "AGENDADO" && (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold rounded-full uppercase shrink-0">
                                Agendado: {log.dataRepasse}
                              </span>
                            )}
                            {log.status === "FALHO" && (
                              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-extrabold rounded-full uppercase shrink-0">
                                Falho (Pendente)
                              </span>
                            )}

                            <button
                              onClick={() => handleDeleteRepasseLog(log.id)}
                              className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1 rounded transition cursor-pointer"
                              title="Remover Log do histórico"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Values Summary of Log */}
                        <div className="flex items-center justify-between py-1 border-t border-b border-slate-50 text-[11px] font-medium text-slate-650">
                          <span>
                            Líquido: <strong className="text-slate-900 font-extrabold">{formatBrl(log.valorLiquido)}</strong> (Taxa Adm: {formatBrl(log.valorTaxaAdm)})
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">
                            {log.dataRepasse || ""}
                          </span>
                        </div>

                        {/* Transaction ID Hash or Error Prompt */}
                        {log.hashTransacao && (
                          <div className="flex items-center justify-between text-[9px] text-slate-450 font-mono bg-slate-50 p-1.5 rounded">
                            <span>Autenticação Pix End-to-End:</span>
                            <span className="text-slate-750 font-extrabold uppercase">{log.hashTransacao}</span>
                          </div>
                        )}

                        {isFailed && (
                          <div className="text-[10px] text-red-600 font-bold bg-red-50 rounded p-2 flex flex-col gap-1.5 border border-red-100">
                            <span className="flex items-center gap-1 shrink-0"><AlertTriangle className="h-3.5 w-3.5" /> Falha: {log.errorMessage}</span>
                            <button
                              onClick={() => handleOpenScheduleModal({
                                repasseId: log.id,
                                faturamentoId: log.faturamentoId,
                                proprietarioPixKey: log.pixKey,
                                isFailedRetry: true,
                                alreadyProcessed: true
                              })}
                              className="self-end px-2.5 py-0.5 bg-red-600 text-white hover:bg-red-700 rounded text-[9px] font-extrabold tracking-wide transition uppercase cursor-pointer"
                            >
                              Fornecer Chave PIX & Re-tentar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

          {/* SCHEDULE AND EDIT PIX OVERLAY MODAL */}
          {schedulingPayout && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in duration-150 text-slate-900">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-indigo-500" />
                    Agendar / Modificar Chave de Repasse Pix
                  </h4>
                  <button 
                    onClick={() => setSchedulingPayout(null)}
                    className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3.5 text-xs text-slate-700">
                  <div className="p-3 bg-indigo-50/50 rounded-xl space-y-1.5">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-500">Destinatário:</span>
                      <span className="font-bold text-slate-800">{schedulingPayout.proprietarioNome || "Proprietário"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-500">Repasse Líquido:</span>
                      <span className="font-extrabold text-emerald-600">{formatBrl(schedulingPayout.valorLiquido)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">
                      Data de Programação do Payout Pix
                    </label>
                    <input 
                      type="date"
                      className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
                      value={payoutScheduleDate}
                      onChange={(e) => setPayoutScheduleDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">
                      Chave Pix Destinatária (CPF, Cnpj, E-mail, Celular ou Aleatória)
                    </label>
                    <input 
                      type="text"
                      placeholder="Ex: CPF ou email"
                      className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
                      value={payoutCustomPixKey}
                      onChange={(e) => setPayoutCustomPixKey(e.target.value)}
                    />
                    <p className="text-[9px] text-gray-400 italic font-medium">Preencha com muita atenção. Esta chave será registrada de forma persistente para o proprietário.</p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setSchedulingPayout(null)}
                    className="px-4 py-2 border border-gray-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleSaveSchedulePayout}
                    className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer"
                  >
                    Salvar e Registrar Agendamento
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 4: INTEGRAÇÃO API BANCÁRIA DINÂMICA (Ideal para não programadores) */}
      {activeSubTab === 'integracao' && (
        <div className="space-y-6 animate-in fade-in duration-200" id="fin-tab-integracao">
          
          {/* Main Informational Header */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-md space-y-3">
            <span className="px-2.5 py-0.5 bg-indigo-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider">
              Guia Completo de Integração de Cobranças
            </span>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              🔌 Como este aplicativo se conecta ao seu banco em Produção?
            </h3>
            <p className="text-xs text-indigo-200 leading-normal max-w-4xl">
              Prezado parceiro, entendemos que você não é programador! Na tecnologia de meios de pagamento, os bancos e instituições de pagamento <strong>não se conectam de forma manual</strong>. Eles se comunicam em milissegundos através de chamadas seguras conhecidas como <strong>APIs (Application Programming Interfaces)</strong> e retornam dados em tempo real chamados de <strong>Webhooks</strong>. Abaixo, explicamos e mostramos de forma interativa como o processo funciona.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left columns (Form + Sandbox simulator) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Step 1: Configuration Form Mocker */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-3">
                  <Info className="h-4 w-4" />
                  1. Seus Dados de Conexão com o Banco (PSP)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-700">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-black font-extrabold">Provedor de Pagamento (PSP)</label>
                    <select 
                      value={apiPsp} 
                      onChange={(e) => setApiPsp(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-600 outline-none"
                    >
                      <option value="asaas">ASAAS Gateway (Altamente Recomendado)</option>
                      <option value="efi">Efí / Gerencianet (Especialista em Pix)</option>
                      <option value="inter">Banco Inter PJ (Sem Tarifas Pix)</option>
                      <option value="mercado_pago">Mercado Pago API</option>
                      <option value="pjbank">PJBank Soluções</option>
                      <option value="manual">Outro banco privado (Via Open Finance)</option>
                    </select>
                    <p className="text-[10px] text-black font-semibold leading-tight">Escolha a instituição financeira oficial onde os valores de aluguel serão depositados.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-black font-extrabold">Ambiente de Operação</label>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setApiEnv("sandbox")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition border ${apiEnv === "sandbox" ? "bg-amber-50 text-amber-800 border-amber-300 shadow-3xs" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                      >
                        🧪 Sandbox (Testes)
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setApiEnv("producao")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition border ${apiEnv === "producao" ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-3xs animate-pulse" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
                      >
                        🟢 Produção (Real)
                      </button>
                    </div>
                    <p className="text-[10px] text-black font-semibold leading-tight">Em Sandbox os testes são emulados (sem dinheiro real). Em Produção, dinheiro real é transacionado.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-black font-extrabold">API Key / Client ID</label>
                    <input 
                      type="text" 
                      value={apiClientId} 
                      onChange={(e) => setApiClientId(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                    <p className="text-[10px] text-black font-semibold leading-none">Chave pública de identificação do cliente no banco.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase text-black font-extrabold">API SecretKey / Token</label>
                    <input 
                      type="password" 
                      value={apiClientSecret} 
                      onChange={(e) => setApiClientSecret(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-[11px] text-gray-800 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                    <p className="text-[10px] text-black font-semibold leading-none">Nunca compartilhar essa chave! Ela autoriza a emissão de cobranças.</p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-[10px] uppercase text-black font-extrabold">Sua Chave Pix Destino (Recebedor)</label>
                    <input 
                      type="text" 
                      value={apiPixKey} 
                      onChange={(e) => setApiPixKey(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-850 focus:ring-1 focus:ring-indigo-600 outline-none"
                      placeholder="E-mail, CPF/CNPJ, Telefone ou Chave Aleatória"
                    />
                    <p className="text-[10px] text-black font-semibold leading-tight">A conta vinculada a esta Chave Pix receberá as transferências instantâneas efetuadas pelos inquilinos.</p>
                  </div>
                </div>

                {/* Integration Status Badge */}
                <div className="p-3.5 bg-indigo-50 border border-indigo-150 rounded-xl flex items-center justify-between text-indigo-900 text-xs">
                  <span className="font-semibold flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-ping"></span>
                    Mecanismo Inteligente Pronto para Pareamento
                  </span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setApiLogs(prev => [
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toLocaleTimeString(),
                          type: "DATABASE_UPDATE",
                          title: "Parâmetros Salvos",
                          detail: `Novas credenciais de comunicação salvas para ${apiPsp.toUpperCase()} no ambiente de ${apiEnv.toUpperCase()}. Banco pronto para consultas de faturamento.`,
                          status: "SUCCESS"
                        },
                        ...prev
                      ]);
                    }}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-lg cursor-pointer transition shadow-2xs"
                  >
                    Salvar Credenciais
                  </button>
                </div>
              </div>

              {/* Step 2: Educational Diagram Flow */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs space-y-4">
                <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  2. Entendendo o Ciclo de Vida da Cobrança de Forma Visual
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                  
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center space-y-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">1</span>
                    <strong className="text-[11px] text-gray-900 font-semibold block leading-tight">Escolha da Data</strong>
                    <p className="text-[10px] text-gray-400 leading-tight">Inquilino acessa o portal e escolhe o dia em que vai pagar na "Data Prática".</p>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center space-y-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">2</span>
                    <strong className="text-[11px] text-gray-900 font-semibold block leading-tight">Cálculo e Requisição</strong>
                    <p className="text-[10px] text-gray-400 leading-tight">O sistema calcula juros e multa *na hora* e pede ao Banco a geração de um novo Pix.</p>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center space-y-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">3</span>
                    <strong className="text-[11px] text-gray-900 font-semibold block leading-tight">Código Dinâmico</strong>
                    <p className="text-[10px] text-gray-400 leading-tight">O Banco responde com a chave Copia & Cola e o QR Code exatos para aquele valor atualizado.</p>
                  </div>

                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex flex-col items-center space-y-1">
                    <span className="w-6 h-6 bg-indigo-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center">4</span>
                    <strong className="text-[11px] text-gray-900 font-semibold block leading-tight">Compensação Automática</strong>
                    <p className="text-[10px] text-gray-400 leading-tight">Assim que pago por ele, o banco envia para nós um Webhook que muda o status para pago imediatamente.</p>
                  </div>

                </div>
              </div>

              {/* Step 3: Interactive Sandbox simulation buttons */}
              <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
                  <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 text-indigo-600" />
                    3. Simulador Interativo do Desenvolvedor (Teste você mesmo!)
                  </h4>
                  <span className="text-[9px] bg-indigo-50 text-indigo-855 font-bold uppercase tracking-wider px-2 py-0.5 rounded">Fidelidade Real</span>
                </div>

                <div className="bg-gray-50 border border-gray-150 p-4 rounded-xl space-y-4">
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    Selecione uma das faturas criadas no sistema abaixo para simular as chamadas ocorridas por baixo dos panos na API real do seu banco:
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-gray-500">Selecione a faturamanto para testar:</label>
                      <select 
                        value={simulatedSelectedInvoiceId}
                        onChange={(e) => {
                          setSimulatedSelectedInvoiceId(e.target.value);
                          const fat = faturamentos.find(f => f.id === e.target.value);
                          if (fat) setSimulatedCalculatedTotal(fat.valorBase);
                        }}
                        className="w-full p-2.5 bg-white border border-gray-200 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        <option value="">Selecione uma cobrança...</option>
                        {faturamentos.map(f => (
                          <option key={f.id} value={f.id}>
                            {f.status === "PAGO" ? "🔵 [PAGA] " : "🔴 [PENDENTE] "} 
                            Fatura de Vencimento {f.dataVencimento.split('-').reverse().join('/')} ({formatBrl(f.valorBase)})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!simulatedSelectedInvoiceId}
                        onClick={() => {
                          const fat = faturamentos.find(f => f.id === simulatedSelectedInvoiceId);
                          if (fat) {
                            // Calculate values at current system time to simulate delay
                            const isOverdue = new Date(fat.dataVencimento) < new Date(CURRENT_SYSTEM_TIME);
                            let valFinal = fat.valorBase;
                            let fineVal = 0;
                            let interestVal = 0;
                            let delayDays = 0;
                            if (isOverdue) {
                              delayDays = Math.floor((new Date(CURRENT_SYSTEM_TIME).getTime() - new Date(fat.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
                              fineVal = fat.valorBase * 0.10;
                              interestVal = (0.01 / 30) * delayDays * fat.valorBase;
                              valFinal = fat.valorBase + fineVal + interestVal;
                            }

                            setSimulatedCalculatedTotal(valFinal);

                            const reqLog = {
                              id: `req-${Date.now()}`,
                              timestamp: new Date().toLocaleTimeString(),
                              type: "API_REQUEST" as const,
                              title: `POST /v2/pix/cobranca/${fat.id}`,
                              detail: `PAYLOAD ENVIADO AO BANCO:\n{\n  "calendario": { "expiracao": 1800 },\n  "devedor": { "cpf": "${contratos.find(c => c.id === fat.contratoId)?.inquilino?.cpf || "000.000.000-00"}", "nome": "${contratos.find(c => c.id === fat.contratoId)?.inquilino?.nome || "Inquilino"}" },\n  "valor": {\n    "original": "${fat.valorBase.toFixed(2)}",\n    "acrescimos": {\n      "multa": "${fineVal.toFixed(2)}",\n      "juros": "${interestVal.toFixed(2)}"\n    },\n    "cobrado": "${valFinal.toFixed(2)}"\n  },\n  "chave_recebedora": "${apiPixKey}"\n}`,
                              status: "INFO" as const
                            };

                            const respLog = {
                              id: `resp-${Date.now()}`,
                              timestamp: new Date().toLocaleTimeString(),
                              type: "API_RESPONSE" as const,
                              title: `HTTP 201 CREATED - Resposta do Banco (${apiPsp.toUpperCase()})`,
                              detail: `PAYLOAD RETORNADO PELO BANCO:\n{\n  "txid": "TXID_${Math.floor(Math.random() * 900000) + 100000}",\n  "recalculado": ${isOverdue ? "true" : "false"},\n  "valor_devido": "${valFinal.toFixed(2)}",\n  "pixCopiaECola": "00020101021226870014br.gov.bcb.pix/v2/cob/${fat.id}?value=${valFinal.toFixed(2)}",\n  "qrCodeBase64": "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwY..."\n}`,
                              status: "SUCCESS" as const
                            };

                            setApiLogs(prev => [reqLog, respLog, ...prev]);
                          }
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-sm flex items-center gap-1 shrink-0"
                      >
                        <Zap className="h-4 w-4" />
                        Gerar PIX Atualizado (Requisição)
                      </button>

                      <button
                        type="button"
                        disabled={!simulatedSelectedInvoiceId || (faturamentos.find(f => f.id === simulatedSelectedInvoiceId)?.status === "PAGO")}
                        onClick={async () => {
                          const fat = faturamentos.find(f => f.id === simulatedSelectedInvoiceId);
                          if (fat) {
                            const isOverdue = new Date(fat.dataVencimento) < new Date(CURRENT_SYSTEM_TIME);
                            let valFinal = fat.valorBase;
                            let fineVal = 0;
                            let interestVal = 0;
                            let delayDays = 0;
                            if (isOverdue) {
                              delayDays = Math.floor((new Date(CURRENT_SYSTEM_TIME).getTime() - new Date(fat.dataVencimento).getTime()) / (1000 * 60 * 60 * 24));
                              fineVal = fat.valorBase * 0.10;
                              interestVal = (0.01 / 30) * delayDays * fat.valorBase;
                              valFinal = fat.valorBase + fineVal + interestVal;
                            }

                            // Trigger real database mutation so they see it reflect in tables
                            try {
                              const res = await fetch(`/api/financial/pay/${fat.id}`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ valorPago: valFinal })
                              });
                              if (res.ok) {
                                if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();

                                const webLog = {
                                  id: `web-${Date.now()}`,
                                  timestamp: new Date().toLocaleTimeString(),
                                  type: "WEBHOOK_RECEIVED" as const,
                                  title: `WEBHOOK ENVIADO PELO BANCO: pagamento.compensado`,
                                  detail: `MENSAGEM ENTRANTE DO BOLETO / PIX:\n{\n  "evento": "pix.finalizado",\n  "data_transacao": "${new Date().toISOString()}",\n  "canal": "PIX_DINAMICO",\n  "identificacao": "${fat.externalId || fat.id}",\n  "valor_pago": "${valFinal.toFixed(2)}",\n  "detalhes": {\n    "nome_pagante": "${contratos.find(c => c.id === fat.contratoId)?.inquilino?.nome || "Inquilino"}",\n    "instituicao_pagante": "Banco Itaú S.A."\n  }\n}`,
                                  status: "SUCCESS" as const
                                };

                                const dbLog = {
                                  id: `db-${Date.now()}`,
                                  timestamp: new Date().toLocaleTimeString(),
                                  type: "DATABASE_UPDATE" as const,
                                  title: `BANCO DE DADOS ATUALIZADO`,
                                  detail: `✓ O status da Fatura ${fat.externalId || fat.id} foi sincronizado para PAGO. O painel financeiro foi re-calculado no valor de R$ ${valFinal.toFixed(2)}. Notificações de confirmação encaminhadas por WhatsApp/E-mail de forma autônoma.`,
                                  status: "SUCCESS" as const
                                };

                                setApiLogs(prev => [dbLog, webLog, ...prev]);
                              }
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-sm flex items-center gap-1 shrink-0"
                      >
                        <FileCheck className="h-4 w-4" />
                        Simular Evento Webhook (Pago)
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400 italic">
                    * Ao clicar em "Simular Evento Webhook", você enviará o sinal emitido pelo banco simulando que o inquilino pagou. O status da fatura será modificado para "Compensado" na aba anterior e o valor total de receitas do Administrador será atualizado na hora!
                  </p>
                </div>
              </div>

            </div>

            {/* Right column: Black Console Logs displaying API Requests */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-900 rounded-2xl shadow-md border border-slate-800 flex flex-col h-[580px] overflow-hidden">
                
                {/* Console header */}
                <div className="bg-slate-800 px-4 py-3 border-b border-slate-705 flex justify-between items-center text-xs shrink-0 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></span>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                    <strong className="font-mono text-[10px] text-slate-300 ml-1">PIX_API_LOGGER.EXE</strong>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setApiLogs([
                        {
                          id: `log-${Date.now()}`,
                          timestamp: new Date().toLocaleTimeString(),
                          type: "DATABASE_UPDATE",
                          title: "Logs limpos",
                          detail: "Console limpo pelo usuário. Pronto para gravação de novos eventos de API.",
                          status: "INFO"
                        }
                      ]);
                    }}
                    className="text-slate-400 hover:text-white font-mono text-[9px] font-bold uppercase transition"
                  >
                    Clear Console
                  </button>
                </div>

                {/* Console list */}
                <div className="flex-1 p-4 font-mono overflow-y-auto space-y-3.5 text-[10px] scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900 leading-normal">
                  {apiLogs.map(log => (
                    <div key={log.id} className="space-y-1 select-text border-b border-slate-800/40 pb-2 animate-in fade-in duration-100">
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>[{log.timestamp}]</span>
                        <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[8px] ${
                          log.type === "API_REQUEST" 
                            ? "bg-blue-900/40 text-blue-300 border border-blue-800/35"
                            : log.type === "API_RESPONSE"
                              ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/35"
                              : log.type === "WEBHOOK_RECEIVED"
                                ? "bg-purple-900/40 text-purple-300 border border-purple-800/35"
                                : "bg-slate-800 text-slate-300"
                        }`}>
                          {log.type}
                        </span>
                      </div>
                      
                      <div className="font-bold text-slate-200">
                        {log.title}
                      </div>

                      <pre className="text-slate-400 text-[9.5px] whitespace-pre-wrap font-mono select-all bg-slate-950 p-2 rounded border border-slate-850/30 overflow-x-auto max-h-48">
                        {log.detail}
                      </pre>
                    </div>
                  ))}
                </div>

                {/* Console footer state */}
                <div className="bg-slate-950 px-4 py-2 border-t border-slate-850 select-none flex justify-between items-center text-[9px] text-slate-500 font-mono">
                  <span>SSL CODES: AES-256-GCM READY</span>
                  <span className="text-emerald-500 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    LOGS ONLINE (SANDBOX)
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* RECLASSIFICATION / EXPENSE EDITING MODAL */}
      {editingExpenseId && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-155 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
              <h4 className="font-bold text-sm text-gray-950 uppercase tracking-tight flex items-center gap-1.5 font-sans">
                <Edit3 className="h-4.5 w-4.5 text-indigo-600 shrink-0" /> 
                Reclassificar / Editar Custo
              </h4>
              <button 
                type="button"
                onClick={() => setEditingExpenseId(null)}
                className="text-gray-400 hover:text-gray-600 font-extrabold text-sm focus:outline-none cursor-pointer p-1 rounded-lg hover:bg-slate-50 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="space-y-4 text-xs font-semibold text-gray-700 text-left select-none">
              
              {/* Imóvel */}
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Imóvel Relacionado *</label>
                <select
                  value={editImovelId}
                  onChange={(e) => setEditImovelId(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-800"
                  required
                >
                  {imoveis.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.tipo} — {i.endereco.split(',')[0]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Categoria *</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-800"
                  required
                >
                  <option value="LUZ">Luz / Energia Elétrica ⚡</option>
                  <option value="AGUA">Água / Saneamento 💧</option>
                  <option value="INTERNET">Internet / Conectividade 🌐</option>
                  <option value="MANUTENCAO">Manutenção Geral 🛠️</option>
                  <option value="OUTROS">Outros Custos 🪙</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Valor do Custo (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-extrabold text-xs text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Mês Referência *</label>
                  <input
                    type="month"
                    value={editMonthYear}
                    onChange={(e) => setEditMonthYear(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Data Pagamento *</label>
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-xs text-gray-500"
                    required
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-[10px] font-bold text-black uppercase tracking-wider mb-1 font-sans">Descrição</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800"
                />
              </div>

              {/* Caixa de Avaliação */}
              <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100 space-y-1">
                <label className="block text-[10px] font-bold text-indigo-750 uppercase tracking-wider flex items-center gap-1 font-sans">
                  <Sparkles className="h-3 w-3 text-indigo-600 shrink-0" /> 
                  Caixa de Avaliação de Custos (Comentário)
                </label>
                <textarea
                  value={editAiComentario}
                  onChange={(e) => setEditAiComentario(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-white border border-indigo-200 rounded-lg text-indigo-950 text-xs font-semibold leading-relaxed"
                />
                <span className="text-[8.5px] text-indigo-650 block leading-tight font-sans">
                  Ajuste a avaliação automática da inteligência artificial caso queira inserir outra anotação.
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExpenseId(null)}
                  className="flex-1 py-2.5 border border-slate-205 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCost}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 transition text-xs cursor-pointer"
                >
                  {savingCost ? "Salvando..." : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FATURAMENTO MODAL */}
      {editingFaturamento && (
        <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-gray-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
              <h3 className="font-bold text-gray-950 text-xs flex items-center gap-1.5 text-indigo-950 font-sans">
                <Edit3 className="h-4 w-4 text-indigo-600" />
                Editar Detalhes de Cobrança / Faturamento
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingFaturamento(null)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Valor do Aluguel Base (R$)</label>
                <input
                  type="number"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  value={editingFaturamento.valorBase || 0}
                  onChange={e => setEditingFaturamento({...editingFaturamento, valorBase: Number(e.target.value)})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Data de Vencimento</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingFaturamento.dataVencimento || ""}
                    onChange={e => setEditingFaturamento({...editingFaturamento, dataVencimento: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Situação do Pagamento</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-bold cursor-pointer"
                    value={editingFaturamento.status || "PENDENTE"}
                    onChange={e => setEditingFaturamento({...editingFaturamento, status: e.target.value as any})}
                  >
                    <option value="PENDENTE">Aberto / Pendente</option>
                    <option value="PAGO">Pago / Liquidado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>

              {editingFaturamento.status === "PAGO" && (
                <div className="p-3 bg-emerald-50/45 border border-emerald-100 rounded-xl space-y-2 animate-fade-in">
                  <span className="block text-[9px] font-black text-emerald-950 uppercase tracking-wide">Liquidação de Recebimento</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-emerald-800">Data de Liquidação</label>
                      <input
                        type="date"
                        className="w-full p-1.5 border border-emerald-250 rounded-lg text-emerald-950 bg-white"
                        value={editingFaturamento.dataPagamento || ""}
                        onChange={e => setEditingFaturamento({...editingFaturamento, dataPagamento: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-emerald-800">Valor Pago Final (R$)</label>
                      <input
                        type="number"
                        className="w-full p-1.5 border border-emerald-250 rounded-lg text-emerald-950 bg-white"
                        value={editingFaturamento.valorPago || 0}
                        onChange={e => setEditingFaturamento({...editingFaturamento, valorPago: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Multa Aplicada (R$)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingFaturamento.multaAplicada || 0}
                    onChange={e => setEditingFaturamento({...editingFaturamento, multaAplicada: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Juros Aplicados (R$)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingFaturamento.jurosAplicados || 0}
                    onChange={e => setEditingFaturamento({...editingFaturamento, jurosAplicados: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl font-bold">
              <button
                type="button"
                onClick={() => setEditingFaturamento(null)}
                className="px-4 py-2 border border-indigo-200 bg-white text-gray-700 hover:bg-slate-50 rounded-lg text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/faturamentos/${editingFaturamento.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editingFaturamento)
                    });
                    if (response.ok) {
                      setSuccessMessage("Cobrança salva com sucesso no sistema!");
                      setEditingFaturamento(null);
                      if (onInvoiceCreatedOrPaid) onInvoiceCreatedOrPaid();
                      setTimeout(() => setSuccessMessage(null), 4000);
                    } else {
                      const err = await response.json();
                      alert(err.error || "Erro ao salvar alterações da cobrança.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Erro ao conectar com o servidor.");
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
