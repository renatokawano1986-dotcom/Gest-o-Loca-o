import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  UserCheck, 
  FileText, 
  DollarSign, 
  MessageSquare,
  ShieldAlert,
  Terminal,
  Grid,
  Smartphone,
  Users,
  Cog,
  Smile,
  Move,
  Palette
} from "lucide-react";

import { Proprietario, Imovel, Inquilino, Contrato, Faturamento, Despesa } from "./types";
import Dashboard from "./components/Dashboard";
import OnboardingKyc from "./components/OnboardingKyc";
import ContractManagement from "./components/ContractManagement";
import FinancialModule from "./components/FinancialModule";
import ChatCopilot from "./components/ChatCopilot";
import CandidatePortal from "./components/CandidatePortal";
import TenantPortal from "./components/TenantPortal";
import { LogoMais } from "./components/LogoMais";
import InstallPwaModal from "./components/InstallPwaModal";
import { AILearningCenter } from "./components/AILearningCenter";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isCandidateMode, setIsCandidateMode] = useState<boolean>(false);
  const [isTenantMode, setIsTenantMode] = useState<boolean>(false);
  const [isAdminDirectAccess, setIsAdminDirectAccess] = useState<boolean>(() => {
    return sessionStorage.getItem("candidate_portal_admin_access") === "true";
  });
  
  // PWA & Mobile Install Helper state
  const [isPwaModalOpen, setIsPwaModalOpen] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);

  // Layout draggable sections state
  const [dragAndDropEnabled, setDragAndDropEnabled] = useState<boolean>(false);

  // Font custom color configuration states (persist automatically as default)
  const [isCustomColorEnabled, setIsCustomColorEnabled] = useState<boolean>(() => {
    return localStorage.getItem("condomais_custom_color_active") === "true";
  });
  const [customTextColor, setCustomTextColor] = useState<string>(() => {
    return localStorage.getItem("condomais_custom_color_hex") || "#4f46e5";
  });
  const [applyToInputs, setApplyToInputs] = useState<boolean>(() => {
    const saved = localStorage.getItem("condomais_custom_color_apply_inputs");
    return saved === null ? true : saved === "true";
  });
  const [applyToAllText, setApplyToAllText] = useState<boolean>(() => {
    const saved = localStorage.getItem("condomais_custom_color_apply_all");
    return saved === null ? true : saved === "true";
  });
  const [showColorPickerDropdown, setShowColorPickerDropdown] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem("condomais_custom_color_active", String(isCustomColorEnabled));
  }, [isCustomColorEnabled]);

  useEffect(() => {
    localStorage.setItem("condomais_custom_color_hex", customTextColor);
  }, [customTextColor]);

  useEffect(() => {
    localStorage.setItem("condomais_custom_color_apply_inputs", String(applyToInputs));
  }, [applyToInputs]);

  useEffect(() => {
    localStorage.setItem("condomais_custom_color_apply_all", String(applyToAllText));
  }, [applyToAllText]);
  const [layoutSections, setLayoutSections] = useState<Array<{
    id: string;
    title: string;
    currentTab: "dashboard" | "operacional" | "inquilino" | "database" | "contracts" | "billing";
    order: number;
  }>>(() => {
    const saved = localStorage.getItem("condomais_layout_sections");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.some(s => s.id === "smart-inspection-section")) {
            parsed.push({ id: "smart-inspection-section", title: "Vistoria de Entrada vs. Saída por IA", currentTab: "inquilino" as const, order: 10 });
          }
          return parsed;
        }
      } catch (e) {
        console.error("Error loading layout sections", e);
      }
    }
    return [
      { id: 'kpi-stats-section', title: 'Resumo de Indicadores (KPIs)', currentTab: 'dashboard' as const, order: 0 },
      { id: 'property-inventory-section', title: 'Lista de Imóveis para Locação', currentTab: 'dashboard' as const, order: 1 },
      { id: 'parceiros-proprietarios-section', title: 'Proprietários & Coparlamentares', currentTab: 'dashboard' as const, order: 2 },
      { id: 'candidate-access-section', title: 'Acesso para Candidatos (Links)', currentTab: 'dashboard' as const, order: 3 },
      { id: 'notifications-direct-section', title: 'Painel de Envio de Notificações', currentTab: 'operacional' as const, order: 4 },
      { id: 'status-ecossistema-section', title: 'Status do Ecossistema', currentTab: 'operacional' as const, order: 5 },
      { id: 'candidates-evaluation-section', title: 'Avaliação de Candidaturas e Análise de Risco', currentTab: 'inquilino' as const, order: 6 },
      { id: 'smart-inspection-section', title: 'Vistoria de Entrada vs. Saída por IA', currentTab: 'inquilino' as const, order: 7 },
      { id: 'people-database-section', title: 'Banco de Dados de Pessoas', currentTab: 'database' as const, order: 8 },
      { id: 'contract-management-section', title: 'Gestão de Contratos de Locação', currentTab: 'contracts' as const, order: 9 },
      { id: 'financial-module-section', title: 'Cobranças & Finanças (Faturamento)', currentTab: 'billing' as const, order: 10 },
    ];
  });

  const handleUpdateSections = (newSections: typeof layoutSections) => {
    setLayoutSections(newSections);
    localStorage.setItem("condomais_layout_sections", JSON.stringify(newSections));
  };

  const handleSectionDropOnTab = (sectionId: string, targetTab: "dashboard" | "operacional" | "inquilino" | "database" | "contracts" | "billing") => {
    const updated = layoutSections.map(s => {
      if (s.id === sectionId) {
        // find max order inside targetTab
        const maxOrder = layoutSections
          .filter(x => x.currentTab === targetTab)
          .reduce((max, item) => item.order > max ? item.order : max, -1);
        return {
          ...s,
          currentTab: targetTab,
          order: maxOrder + 1
        };
      }
      return s;
    });
    handleUpdateSections(updated);
    setActiveTab(targetTab); // Switch to the dropped tab
  };

  useEffect(() => {
    const checkMobile = () => {
      const isMobileUA = /iphone|ipad|ipod|android|blackberry|mini|windows\sphone/g.test(navigator.userAgent.toLowerCase());
      const isMobileWidth = window.innerWidth < 768;
      setIsMobileDevice(isMobileUA || isMobileWidth);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  
  // Database state synchronized from backend
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [inquilinos, setInquilinos] = useState<Inquilino[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [faturamentos, setFaturamentos] = useState<Faturamento[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [apiConfigured, setApiConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronize state from dynamic in-memory database on backend
  const syncDatabase = async () => {
    try {
      const response = await fetch("/api/db");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await response.json();
          setProprietarios(json.proprietarios || []);
          setImoveis(json.imoveis || []);
          setInquilinos(json.inquilinos || []);
          setContratos(json.contratos || []);
          setFaturamentos(json.faturamentos || []);
          setDespesas(json.despesas || []);
          setApiConfigured(json.apiConfigured);
        } else {
          console.warn("Expected JSON response from /api/db, but received different content type or HTML fallback.");
        }
      }
    } catch (err) {
      console.error("Failed to sync database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncDatabase();
    
    // Check if '?candidate=true' or '?tenant=true' is in the URL or the hash parameters
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
    if (params.get("candidate") === "true" || hashParams.get("candidate") === "true" || window.location.hash.includes("candidate=true")) {
      setIsCandidateMode(true);
    } else if (params.get("tenant") === "true" || hashParams.get("tenant") === "true" || window.location.hash.includes("tenant=true")) {
      setIsTenantMode(true);
    }
  }, []);

  const handleEnterCandidateMode = (propertyId?: string) => {
    sessionStorage.setItem("candidate_portal_admin_access", "true");
    setIsAdminDirectAccess(true);
    setIsCandidateMode(true);
    const url = new URL(window.location.href);
    url.searchParams.set("candidate", "true");
    if (propertyId) {
      url.searchParams.set("propertyId", propertyId);
    } else {
      url.searchParams.delete("propertyId");
    }
    url.searchParams.delete("tenant");
    window.history.pushState({}, "", url.toString());
  };

  const handleResetDb = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/db/reset", { method: "POST" });
      if (response.ok) {
        await syncDatabase();
      }
    } catch (err) {
      console.error("Failed to reset database:", err);
    } finally {
      setLoading(false);
    }
  };

  const colorStyle = isCustomColorEnabled ? (
    <style dangerouslySetInnerHTML={{ __html: `
      ${applyToInputs ? `
        input, select, textarea, select option, [contenteditable="true"] {
          color: ${customTextColor} !important;
        }
        input::placeholder, textarea::placeholder {
          color: ${customTextColor} !important;
          opacity: 0.75 !important;
        }
      ` : ""}
      ${applyToAllText ? `
        p, span, h1, h2, h3, h4, h5, h6, strong, em, b, i, li, a, td, th, label, div.text-slate-100, div.text-slate-200, div.text-slate-300, div.text-slate-400, div.text-slate-250 {
          color: ${customTextColor} !important;
        }
      ` : ""}
    ` }} />
  ) : null;

  if (isTenantMode) {
    return (
      <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col font-sans animate-fade-in" id="tenant-portal-root">
        {colorStyle}
        {/* Simplified Tenant Header optimized for mobile devices */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xs py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center bg-slate-900 gap-3">
            
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1 leading-none">
                  Inquilino<LogoMais /> <span className="text-[10px] bg-indigo-900/50 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded leading-none m-1">INQUILINO</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">Portal de Acesso do Morador</span>
              </div>
            </div>

            {/* Install PWA helper trigger */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsPwaModalOpen(true)}
                className="px-2.5 py-1.5 bg-indigo-950/40 hover:bg-slate-800 border border-indigo-850 text-indigo-300 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Instalar Condo+ no Celular"
              >
                <Smartphone className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">Salvar no Celular</span>
                <span className="inline sm:hidden">Instalar App</span>
              </button>
            </div>

          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
          <TenantPortal 
            inquilinos={inquilinos}
            contratos={contratos}
            faturamentos={faturamentos}
            onSyncDb={syncDatabase}
            onTriggerInstall={() => setIsPwaModalOpen(true)}
          />
        </main>

        <footer className="bg-slate-900 border-t border-slate-850 py-6 text-center text-xs text-slate-500 font-medium animate-fade-in">
          <p>© 2026 Inquilino<LogoMais /> Inc. • Portal do Morador em conformidade com a Lei do Inquilinato n° 8.245.</p>
        </footer>

        {/* PWA Home-Screen Installation instructions modal */}
        <InstallPwaModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />

      </div>
    );
  }

  if (isCandidateMode) {
    return (
      <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col font-sans animate-fade-in" id="candidate-portal-root">
        {colorStyle}
        {/* Simplified Candidate Header optimized for mobile devices */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-xs py-3 sm:py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center bg-slate-900 gap-3 animate-fade-in">
            
            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1 leading-none">
                    Condo<LogoMais /> <span className="text-[10px] bg-indigo-900/50 text-indigo-300 font-extrabold px-1.5 py-0.5 rounded leading-none m-1">CANDIDATO</span>
                  </h1>
                  <span className="text-[10px] text-slate-400 font-medium tracking-wide">Portal Seguro de Cadastro de Inquilinos</span>
                </div>
              </div>
              {isAdminDirectAccess && (
                <button
                  onClick={() => {
                    setIsCandidateMode(false);
                    setActiveTab("dashboard");
                    sessionStorage.removeItem("candidate_portal_admin_access");
                    setIsAdminDirectAccess(false);
                    window.history.pushState({}, "", window.location.pathname);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-650 text-[11px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  ← Voltar ao Painel ADM
                </button>
              )}
            </div>

          </div>
        </header>

        {/* Content Portal */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CandidatePortal 
            imoveis={imoveis} 
            onTenantSubmitted={syncDatabase} 
            isDirectAdminAccess={isAdminDirectAccess}
            onNavigateToDashboard={() => {
              setIsCandidateMode(false);
              setActiveTab("dashboard");
              sessionStorage.removeItem("candidate_portal_admin_access");
              setIsAdminDirectAccess(false);
              window.history.pushState({}, "", window.location.pathname);
            }} 
          />
        </main>

        <footer className="bg-slate-900 border-t border-slate-850 py-6 text-center text-xs text-slate-500 font-medium">
          <p>© 2026 Condo<LogoMais /> Inc. • Cadastro criptografado em conformidade com a LGPD e Lei do Inquilinato n° 8.245.</p>
        </footer>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-100 flex flex-col font-sans" id="proptech-os-root">
      {colorStyle}
      
      {/* Top Professional Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo Group */}
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1 leading-none">
                  Condo<LogoMais /> <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900 font-extrabold px-1.5 py-0.5 rounded leading-none m-1">ADM</span>
                </h1>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">Gestão do Locador & Proprietário</span>
              </div>
            </div>

            {/* API Status Badge & Web App install button */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Drag n drop configuration toggle */}
              <button
                onClick={() => setDragAndDropEnabled(prev => !prev)}
                className={`px-2.5 py-1.5 border text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  dragAndDropEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-600 hover:bg-amber-500/35"
                    : "bg-slate-800/60 text-slate-350 border-slate-700 hover:bg-slate-750/65"
                }`}
                title="Ativar/Desativar Ajuste de Seções (Arrastar & Soltar)"
              >
                <Move className={`h-4 w-4 shrink-0 ${dragAndDropEnabled ? "animate-bounce text-amber-400" : "text-indigo-400"}`} />
                <span className="hidden sm:inline">
                  {dragAndDropEnabled ? "Arrastar Ativo" : "Permitir Arrastar"}
                </span>
                <span className="inline sm:hidden">Layout</span>
              </button>

              {/* Font Color Picker Popover Trigger (next to layout button) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPickerDropdown(prev => !prev)}
                  className={`px-2.5 py-1.5 border text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                    isCustomColorEnabled
                      ? "bg-indigo-600/35 text-indigo-300 border-indigo-505 hover:bg-indigo-600/50"
                      : "bg-slate-800/60 text-slate-350 border-slate-700 hover:bg-slate-750/65"
                  }`}
                  title="Configurar Cor das Fontes (Campos e Textos)"
                >
                  <Palette className={`h-4 w-4 shrink-0 ${isCustomColorEnabled ? "text-indigo-400" : "text-slate-400"}`} />
                  <span className="hidden sm:inline">Cor das Fontes</span>
                  <span className="inline sm:hidden">Cores</span>
                </button>

                {showColorPickerDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 z-50 space-y-3.5 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1">
                        <Palette className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span>Estilo das Fontes & Cores</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowColorPickerDropdown(false)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 uppercase font-bold"
                      >
                        Fechar
                      </button>
                    </div>

                    {/* Active Toggle Switch */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-850/50">
                      <div className="space-y-0.5">
                        <span className="text-[10.5px] font-bold text-slate-250 block">Ativar Cor Personalizada</span>
                        <span className="text-[9px] text-slate-500 leading-none block">Liga ou desliga esta função</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCustomColorEnabled}
                          onChange={(e) => setIsCustomColorEnabled(e.target.checked)}
                          className="sr-only peer text-indigo-600 focus:ring-0"
                        />
                        <div className="w-8 h-4.5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    {/* Selectable Hex Color Picker and Preset Palettes */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Escolha a Cor das Fontes</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          disabled={!isCustomColorEnabled}
                          className="w-10 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer disabled:opacity-40"
                          title="Selecione cor livre"
                        />
                        <input
                          type="text"
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          disabled={!isCustomColorEnabled}
                          className="flex-1 text-xs p-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-bold font-mono text-center disabled:opacity-45 disabled:text-slate-600"
                        />
                      </div>

                      {/* Preset Mini-Palettes */}
                      <div className="grid grid-cols-6 gap-1.5 pt-1">
                        {[
                          "#4f46e5", // Indigo default
                          "#10b981", // Emerald
                          "#ef4444", // Red
                          "#f59e0b", // Amber
                          "#06b6d4", // Cyan
                          "#ec4899", // Pink
                          "#8b5cf6", // Purple
                          "#f97316", // Orange
                          "#14b8a6", // Teal
                          "#000000", // Full Dark / Black
                          "#1e293b", // Slate Deep
                          "#a8a29e", // Soft Stone
                        ].map(hex => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => {
                              if (isCustomColorEnabled) setCustomTextColor(hex);
                            }}
                            disabled={!isCustomColorEnabled}
                            className={`h-5 w-full rounded border transition-all cursor-pointer disabled:opacity-30 ${
                              customTextColor === hex ? "border-white ring-1 ring-indigo-500 scale-105" : "border-slate-800 hover:scale-103"
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Checkboxes for application areas */}
                    <div className="space-y-1.5 pt-1.5 border-t border-slate-800">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Áreas de Aplicação</label>
                      
                      <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={applyToInputs}
                          onChange={(e) => setApplyToInputs(e.target.checked)}
                          disabled={!isCustomColorEnabled}
                          className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer disabled:opacity-30"
                        />
                        <span className={isCustomColorEnabled ? "" : "opacity-40"}>Campos de Preenchimento (Inputs)</span>
                      </label>

                      <label className="flex items-center gap-2 text-[10px] text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={applyToAllText}
                          onChange={(e) => setApplyToAllText(e.target.checked)}
                          disabled={!isCustomColorEnabled}
                          className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer disabled:opacity-30"
                        />
                        <span className={isCustomColorEnabled ? "" : "opacity-40"}>Textos Gerais do App (H1-H6, P, Span)</span>
                      </label>
                    </div>

                    <div className="text-[9px] text-slate-500 leading-normal border-t border-slate-800/60 pt-2 font-medium">
                      💡 Essa cor permanecerá como padrão do aplicativo até que você a altere ou desative.
                    </div>
                  </div>
                )}
              </div>

              {/* Install PWA helper trigger */}
              <button
                onClick={() => setIsPwaModalOpen(true)}
                className="px-2.5 py-1.5 bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-900 text-indigo-300 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Instalar Condo+ no Celular"
              >
                <Smartphone className="h-4 w-4 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">Salvar no Celular</span>
                <span className="inline sm:hidden">Instalar App</span>
              </button>

              <button
                onClick={() => {
                  setIsTenantMode(true);
                  const url = new URL(window.location.href);
                  url.searchParams.set("tenant", "true");
                  url.searchParams.delete("candidate");
                  window.history.pushState({}, "", url.toString());
                }}
                className="px-2.5 py-1.5 bg-emerald-950/50 border border-emerald-800 text-emerald-300 hover:bg-emerald-900/50 text-xs font-black rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Acessar Área do Inquilino"
              >
                <UserCheck className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Portal do Inquilino</span>
                <span className="inline sm:hidden">Inquilino</span>
              </button>

              {apiConfigured ? (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/45 text-emerald-300 rounded-xl border border-emerald-800/80 text-xs font-semibold">
                  <Cpu className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Cérebro Gemini: Ativo</span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/45 text-amber-300 rounded-xl border border-amber-800/80 text-xs font-semibold">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                  <span>Modo Local Seguro</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Global Status Warning banner explains API Key location if needed */}
      {!apiConfigured && (
        <div className="bg-amber-950/80 border-b border-amber-900/60 px-4 py-2.5 text-xs text-amber-200 font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
              <span>A chave <strong>GEMINI_API_KEY</strong> não está configurada nos Segredos do AI Studio. O sistema opera por emulação local inteligente para testes ideais.</span>
            </span>
            <span className="text-[10px] text-amber-400/80">Habilite a chave de IA no painel para auditorias robustas.</span>
          </div>
        </div>
      )}

      {/* Primary Tab Navigation Panel (Desktop only) */}
      <div className="bg-slate-900 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1 text-xs font-bold uppercase overflow-x-auto scrollbar-none">
            
            <button
              onClick={() => setActiveTab("dashboard")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "dashboard");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "dashboard" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-dashboard"
            >
              <Grid className="h-4 w-4" />
              Painel Geral
            </button>
 
            <button
              onClick={() => setActiveTab("operacional")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "operacional");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "operacional" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-operacional"
            >
              <Cog className="h-4 w-4" />
              Chamada Operacional
            </button>
 
            <button
              onClick={() => setActiveTab("inquilino")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "inquilino");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "inquilino" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-inquilino"
            >
              <Smile className="h-4 w-4" />
              Inquilino
            </button>

            <button
              onClick={() => setActiveTab("database")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "database");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "database" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-database"
            >
              <Users className="h-4 w-4" />
              Banco de Dados de Pessoas
            </button>

            <button
              onClick={() => setActiveTab("contracts")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "contracts");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "contracts" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-contracts"
            >
              <FileText className="h-4 w-4" />
              Gestão de Contratos
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              onDragOver={(e) => {
                if (dragAndDropEnabled) {
                  e.preventDefault();
                  e.currentTarget.classList.add("bg-indigo-950/80", "border-indigo-400");
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
              }}
              onDrop={(e) => {
                e.currentTarget.classList.remove("bg-indigo-950/80", "border-indigo-400");
                if (dragAndDropEnabled) {
                  const sectionId = e.dataTransfer.getData("text/plain");
                  if (sectionId) {
                    handleSectionDropOnTab(sectionId, "billing");
                  }
                }
              }}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "billing" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-billing"
            >
              <DollarSign className="h-4 w-4" />
              Cobrança & Mora
            </button>

            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "copilot" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-copilot"
            >
              <MessageSquare className="h-4 w-4 hover:animate-bounce" />
              Copiloto IA
            </button>

            <button
              onClick={() => setActiveTab("ai-learning")}
              className={`px-4 py-4 border-b-2 font-semibold flex items-center gap-1.5 transition ${
                activeTab === "ai-learning" 
                  ? "border-indigo-500 text-indigo-400 font-extrabold" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
              id="tab-ai-learning"
            >
              <Cpu className="h-4 w-4 hover:animate-spin" />
              Treinamento IA
            </button>

          </nav>
        </div>
      </div>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider animate-pulse">Sincronizando Banco de Dados Relacional...</p>
          </div>
        ) : (
          <div className="transition duration-200 animate-in fade-in">
            {activeTab === "dashboard" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="dashboard"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "operacional" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="operacional"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "inquilino" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="inquilino"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "database" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="database"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "contracts" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="contracts"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "billing" && (
              <Dashboard 
                proprietarios={proprietarios}
                proprietariosCount={proprietarios.length}
                imoveis={imoveis}
                inquilinos={inquilinos}
                contratos={contratos}
                faturamentos={faturamentos}
                despesas={despesas}
                onResetDb={handleResetDb}
                onSyncDb={syncDatabase}
                onNavigate={(tab) => setActiveTab(tab)}
                viewMode="billing"
                dragAndDropEnabled={dragAndDropEnabled}
                layoutSections={layoutSections}
                onUpdateSections={handleUpdateSections}
                onEnterCandidateMode={handleEnterCandidateMode}
              />
            )}

            {activeTab === "copilot" && (
              <ChatCopilot 
                onDatabaseMutation={syncDatabase}
              />
            )}

            {activeTab === "ai-learning" && (
              <AILearningCenter />
            )}
          </div>
        )}
      </main>

      {/* Minimal clean footer with bottom spacing on mobile to avoid overlapping navigation bar */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 pb-24 md:pb-6 text-center text-xs text-slate-500 font-medium">
        <p>© 2026 Condo<LogoMais /> Inc. • Orquestrações Imobiliárias Inteligentes sob a Lei do Inquilinato n° 8.245.</p>
      </footer>

      {/* Sticky Bottom Navigation for Mobile Devices */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 md:hidden flex justify-around items-center py-2 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.5)] select-none">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'dashboard' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <Grid className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Painel</span>
        </button>
        <button
          onClick={() => setActiveTab("operacional")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'operacional' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <Cog className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Operacional</span>
        </button>
        <button
          onClick={() => setActiveTab("inquilino")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'inquilino' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <Smile className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Inquilino</span>
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'database' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <Users className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Pessoas</span>
        </button>
        <button
          onClick={() => setActiveTab("contracts")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'contracts' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <FileText className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Contratos</span>
        </button>
        <button
          onClick={() => setActiveTab("billing")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'billing' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <DollarSign className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Cobranças</span>
        </button>
        <button
          onClick={() => setActiveTab("copilot")}
          className={`flex flex-col items-center justify-center flex-1 py-1 px-2.5 transition active:scale-95 cursor-pointer ${activeTab === 'copilot' ? 'text-indigo-400 font-black' : 'text-slate-400 font-bold'}`}
        >
          <MessageSquare className="h-5 w-5 mb-0.5" />
          <span className="text-[9.5px] tracking-tight">Copiloto</span>
        </button>
      </nav>

      {/* PWA Home-Screen Installation instructions modal */}
      <InstallPwaModal isOpen={isPwaModalOpen} onClose={() => setIsPwaModalOpen(false)} />

    </div>
  );
}
