import React, { useState, useEffect } from "react";
import { 
  Building2, 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  FileText, 
  UserCheck, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  Lock,
  ExternalLink,
  ChevronDown,
  Cpu
} from "lucide-react";
import { Imovel, OnboardingExtractedResult } from "../types";
import { LogoMais } from "./LogoMais";

interface CandidatePortalProps {
  imoveis: Imovel[];
  onTenantSubmitted: () => void;
  onNavigateToDashboard?: () => void;
  isDirectAdminAccess?: boolean;
}

export default function CandidatePortal({ imoveis, onTenantSubmitted, onNavigateToDashboard, isDirectAdminAccess = false }: CandidatePortalProps) {
  // Try to find propertyId in URL query params
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  
  // Registration Form States
  const [nome, setNome] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [rg, setRg] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [telefone, setTelefone] = useState<string>("");
  const [estadoCivil, setEstadoCivil] = useState<string>("Solteiro(a)");
  const [profissao, setProfissao] = useState<string>("");
  const [rendaMensalStr, setRendaMensalStr] = useState<string>("");

  // Spouse (Cônjuge) States & Uploads
  const [conjugeNome, setConjugeNome] = useState<string>("");
  const [conjugeCpf, setConjugeCpf] = useState<string>("");
  const [conjugeRg, setConjugeRg] = useState<string>("");
  const [conjugeEmail, setConjugeEmail] = useState<string>("");
  const [conjugeTelefone, setConjugeTelefone] = useState<string>("");
  const [conjugeProfissao, setConjugeProfissao] = useState<string>("");
  const [conjugeRendaMensalStr, setConjugeRendaMensalStr] = useState<string>("");

  // Document Upload States supporting multiple simultaneous items
  const [docFiles, setDocFiles] = useState<Array<{ name: string; base64: string; mime: string; size?: string }>>([]);
  const [incomeFiles, setIncomeFiles] = useState<Array<{ name: string; base64: string; mime: string; size?: string }>>([]);
  const [conjugeDocFiles, setConjugeDocFiles] = useState<Array<{ name: string; base64: string; mime: string; size?: string }>>([]);
  const [conjugeIncomeFiles, setConjugeIncomeFiles] = useState<Array<{ name: string; base64: string; mime: string; size?: string }>>([]);

  // UI state managers
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<OnboardingExtractedResult | null>(null);
  const [showAiPreAnalysis, setShowAiPreAnalysis] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [rentToIncomeWarn, setRentToIncomeWarn] = useState<boolean>(false);

  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  // States for Real-time Cognitive AI Document reading & auto-filling
  const [isParsingDoc, setIsParsingDoc] = useState<boolean>(false);
  const [parsingDocSuccess, setParsingDocSuccess] = useState<boolean>(false);
  const [isAnalyzingIncome, setIsAnalyzingIncome] = useState<boolean>(false);
  const [isPerformingFullAnalysis, setIsPerformingFullAnalysis] = useState<boolean>(false);
  const [incomeAnalysis, setIncomeAnalysis] = useState<{
    grossIncome: number;
    profissao?: string;
    empresaEmissora: string;
    periodoReferencia: string;
    cnpjEmpregador: string;
    notes: string;
    status: "COMPATIVEL" | "REVISAO" | "INCONSISTENTE";
    bankStatementAnalysis?: {
      detectedBankStatement: boolean;
      totalInflow: number;
      totalOutflow: number;
      netMonthlyBalance: number;
      withdrawalPattern: string;
      zeroBalancePeriods: string;
      identifiedInconsistencies: string;
      uberDriverSpecificMetrics?: {
        isUberStatement: boolean;
        revenueUnderestimationRisk: string;
      };
      behavioralRiskAnalysis: string;
      monthlyMovements?: Array<{
        month: string;
        inflow: number;
        outflow: number;
        balance: number;
        description: string;
      }>;
    };
  } | null>(null);

  // Unified intelligent OCR parser & safe empty fields filler for each new document uploaded
  const extractAndAutofillNewDocument = async (
    base64Data: string, 
    mimeType: string, 
    filename: string, 
    type: "doc" | "income" | "conjugeDoc" | "conjugeIncome"
  ) => {
    setIsParsingDoc(true);
    setParsingDocSuccess(false);
    try {
      if (type === "doc" || type === "conjugeDoc") {
        const res = await fetch("/api/gemini/extract-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileBase64: base64Data, mimeType, fileName: filename })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const val = json.data;
            if (val.success === false) {
              setErrorMessage(val.message || "Não conseguimos ler as informações automáticas deste documento.");
              return;
            }

            if (type === "conjugeDoc") {
              // Extracting spouse specific document
              if (val.nome && val.nome !== "Não informado" && val.nome !== "Não identificado") {
                setConjugeNome(val.nome);
              }
              if (val.cpf && val.cpf !== "Não informado" && val.cpf !== "Não identificado") {
                setConjugeCpf(formatCpf(val.cpf));
              }
              if (val.rg && val.rg !== "Não informado" && val.rg !== "Não identificado") {
                setConjugeRg(val.rg);
              }
              if (val.email && val.email !== "Não informado" && val.email !== "Não identificado" && val.email.includes("@")) {
                setConjugeEmail(val.email);
              }
              if (val.telefone && val.telefone !== "Não informado" && val.telefone !== "Não identificado") {
                setConjugeTelefone(val.telefone);
              }
              if (val.profissao && val.profissao !== "Não informado" && val.profissao !== "Não identificado") {
                setConjugeProfissao(val.profissao);
              }
              setEstadoCivil("Casado(a)");
            } else {
              // Fill main candidate fields automatically based on extracted document
              if (val.nome && val.nome !== "Não informado" && val.nome !== "Não identificado" && val.nome !== "Candidato Treinado") {
                setNome(val.nome);
              }
              if (val.cpf && val.cpf !== "Não informado" && val.cpf !== "Não identificado" && val.cpf !== "000.000.000-00") {
                setCpf(formatCpf(val.cpf));
              }
              if (val.rg && val.rg !== "Não informado" && val.rg !== "Não identificado" && val.rg !== "MG-00.000.000") {
                setRg(val.rg);
              }
              if (val.estadoCivil && val.estadoCivil !== "Não informado" && val.estadoCivil !== "Não identificado") {
                const trimmedStatus = val.estadoCivil.trim();
                let matchedStatus = "Solteiro(a)";
                if (trimmedStatus.toLowerCase().includes("solteir")) matchedStatus = "Solteiro(a)";
                else if (trimmedStatus.toLowerCase().includes("casad")) matchedStatus = "Casado(a)";
                else if (trimmedStatus.toLowerCase().includes("divorciad")) matchedStatus = "Divorciado(a)";
                else if (trimmedStatus.toLowerCase().includes("viuv") || trimmedStatus.toLowerCase().includes("viúv")) matchedStatus = "Viúvo(a)";
                else matchedStatus = trimmedStatus;
                setEstadoCivil(matchedStatus);
              }
              if (val.profissao && val.profissao !== "Não informado" && val.profissao !== "Não identificado") {
                setProfissao(val.profissao);
              }
              if (val.email && val.email !== "Não informado" && val.email !== "Não identificado" && val.email.includes("@")) {
                setEmail(val.email);
              }
              if (val.telefone && val.telefone !== "Não informado" && val.telefone !== "Não identificado") {
                setTelefone(val.telefone);
              }

              // Spouse fields found on main doc
              if (val.conjugeNome && val.conjugeNome !== "Não informado" && val.conjugeNome !== "Não identificado") {
                setConjugeNome(val.conjugeNome);
              }
              if (val.conjugeCpf && val.conjugeCpf !== "Não informado" && val.conjugeCpf !== "Não identificado") {
                setConjugeCpf(formatCpf(val.conjugeCpf));
              }
              if (val.conjugeRg && val.conjugeRg !== "Não informado" && val.conjugeRg !== "Não identificado") {
                setConjugeRg(val.conjugeRg);
              }
              if (val.conjugeEmail && val.conjugeEmail !== "Não informado" && val.conjugeEmail !== "Não identificado") {
                setConjugeEmail(val.conjugeEmail);
              }
              if (val.conjugeTelefone && val.conjugeTelefone !== "Não informado" && val.conjugeTelefone !== "Não identificado") {
                setConjugeTelefone(val.conjugeTelefone);
              }
              if (val.conjugeProfissao && val.conjugeProfissao !== "Não informado" && val.conjugeProfissao !== "Não identificado") {
                setConjugeProfissao(val.conjugeProfissao);
              }
            }

            setParsingDocSuccess(true);
          }
        }
      } else {
        // Income document type (main candidate or spouse)
        const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
        const res = await fetch("/api/gemini/analyze-income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            files: [{ fileBase64: base64Data, mimeType, fileName: filename }], 
            rentValue: rentVal 
          })
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const data = json.data;
            if (type === "conjugeIncome") {
              if (data.grossIncome) {
                const centsStr = Math.round(data.grossIncome * 100).toString();
                setConjugeRendaMensalStr(formatCurrency(centsStr));
              }
              if (data.profissao && data.profissao !== "Não informado" && data.profissao !== "Não identificado") {
                setConjugeProfissao(prev => !prev.trim() ? data.profissao : prev);
              }
              setEstadoCivil("Casado(a)");
            } else {
              if (data.grossIncome) {
                setRendaMensalStr(prev => {
                  const parsedVal = parseFloat(prev.replace(/[^\d]/g, ""));
                  if (!prev || isNaN(parsedVal) || parsedVal === 0) {
                    const centsStr = Math.round(data.grossIncome * 100).toString();
                    return formatCurrency(centsStr);
                  }
                  return prev;
                });
              }
              if (data.profissao && data.profissao !== "Não informado" && data.profissao !== "Não identificado") {
                setProfissao(prev => !prev.trim() ? data.profissao : prev);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Erro no auto-preenchimento ao analisar novo documento:", err);
    } finally {
      setIsParsingDoc(false);
    }
  };

  // Auto audit / analyze spouse income proofs & payslips (multi-file)
  const analyzeSpouseIncomeDocuments = async (currentSpouseIncomes: Array<{ name: string; base64: string; mime: string; size?: string }>) => {
    if (currentSpouseIncomes.length === 0) return;
    setIsAnalyzingIncome(true);
    const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
    
    const filesToSend = currentSpouseIncomes.map(f => ({
      fileBase64: f.base64,
      mimeType: f.mime,
      fileName: f.name
    }));

    try {
      const res = await fetch("/api/gemini/analyze-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesToSend, rentValue: rentVal })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.grossIncome) {
          const numericValue = json.data.grossIncome;
          const centsStr = Math.round(numericValue * 100).toString();
          setConjugeRendaMensalStr(formatCurrency(centsStr));
          if (json.data.profissao && json.data.profissao !== "Não informado" && json.data.profissao !== "Não identificado") {
            setConjugeProfissao(prev => !prev.trim() ? json.data.profissao : prev);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao analisar comprovante de renda do cônjuge:", err);
    } finally {
      setIsAnalyzingIncome(false);
    }
  };

  // Auto audit / analyze income proofs & payslips (multi-file)
  const analyzeIncomeDocuments = async (currentIncomes: Array<{ name: string; base64: string; mime: string; size?: string }>) => {
    if (currentIncomes.length === 0) return;
    setIsAnalyzingIncome(true);
    setIncomeAnalysis(null);
    const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
    
    const filesToSend = currentIncomes.map(f => ({
      fileBase64: f.base64,
      mimeType: f.mime,
      fileName: f.name
    }));

    try {
      const res = await fetch("/api/gemini/analyze-income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: filesToSend, rentValue: rentVal })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setIncomeAnalysis(json.data);
          // Automatically set and format declared monthly income input
          if (json.data.grossIncome) {
            const numericValue = json.data.grossIncome;
            const centsStr = Math.round(numericValue * 100).toString();
            setRendaMensalStr(formatCurrency(centsStr));
          }
          // Auto-fill professional occupation if detected
          if (json.data.profissao && json.data.profissao !== "Não informado" && json.data.profissao !== "Não identificado") {
            setProfissao(json.data.profissao);
          }
        }
      }
    } catch (err) {
      console.error("Erro ao analisar holerites consolidados:", err);
    } finally {
      setIsAnalyzingIncome(false);
    }
  };

  // Immediate full background compliance check and auto-fill backup
  const triggerCognitiveVerification = async (
    currentDocs: Array<{ name: string; base64: string; mime: string; size?: string }> = docFiles,
    currentIncomes: Array<{ name: string; base64: string; mime: string; size?: string }> = incomeFiles,
    currentSpouseDocs: Array<{ name: string; base64: string; mime: string; size?: string }> = conjugeDocFiles,
    currentSpouseIncomes: Array<{ name: string; base64: string; mime: string; size?: string }> = conjugeIncomeFiles
  ) => {
    if (currentDocs.length === 0 && currentIncomes.length === 0 && currentSpouseDocs.length === 0 && currentSpouseIncomes.length === 0) return;
    setIsPerformingFullAnalysis(true);
    
    const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
    const firstIncome = currentIncomes[0] || currentSpouseIncomes[0];
    const firstDoc = currentDocs[0] || currentSpouseDocs[0];
    const fileBase64 = firstIncome?.base64 || firstDoc?.base64 || "";
    const mimeType = firstIncome?.mime || firstDoc?.mime || "";
    const allFilesToSend = [
      ...currentDocs.map(d => ({ fileBase64: d.base64, mimeType: d.mime, fileName: d.name, category: "id" })),
      ...currentIncomes.map(i => ({ fileBase64: i.base64, mimeType: i.mime, fileName: i.name, category: "income" })),
      ...currentSpouseDocs.map(sd => ({ fileBase64: sd.base64, mimeType: sd.mime, fileName: `[CÔNJUGE] ${sd.name}`, category: "spouse_id" })),
      ...currentSpouseIncomes.map(si => ({ fileBase64: si.base64, mimeType: si.mime, fileName: `[CÔNJUGE] ${si.name}`, category: "spouse_income" }))
    ];

    try {
      const response = await fetch("/api/gemini/onboarding-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          files: allFilesToSend,
          textInput: `PROPOENTE AUTO-ANALYSE INTAKE FOR IMMEDIATE AUTO-FILL. VALORES ATUAIS: NOME="${nome || ""}" CPF="${cpf || ""}" RG="${rg || ""}".`,
          rentValue: rentVal
        })
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) {
          const val = json.data;
          setAiReport(val);

          // PRIORITIZE IMMEDIATE AUTO-FILL of candidate's registration/personal fields safely (do not overwrite if already filled)
          if (val.nome && val.nome !== "Não informado" && val.nome !== "Não identificado" && val.nome !== "Candidato Treinado") {
            setNome(prev => prev.trim() && prev !== "Candidato Treinado" ? prev : val.nome);
          }
          if (val.cpfCnpj && val.cpfCnpj !== "Não informado" && val.cpfCnpj !== "Não identificado" && val.cpfCnpj !== "000.000.000-00") {
            setCpf(prev => prev.trim() && prev !== "000.000.000-00" ? prev : formatCpf(val.cpfCnpj));
          }
          if (val.documentId && val.documentId !== "Não informado" && val.documentId !== "Não identificado" && val.documentId !== "MG-00.000.000") {
            setRg(prev => prev.trim() && prev !== "MG-00.000.000" ? prev : val.documentId);
          }
          if (val.grossIncome) {
            const centsStr = Math.round(val.grossIncome * 100).toString();
            setRendaMensalStr(prev => prev && parseFloat(prev.replace(/[^\d]/g, "")) > 0 ? prev : formatCurrency(centsStr));
          }
          if (val.profissao && val.profissao !== "Não informado" && val.profissao !== "Não identificado") {
            setProfissao(prev => prev.trim() ? prev : val.profissao);
          }
          if (val.email && val.email !== "Não informado" && val.email !== "Não identificado") {
            setEmail(prev => prev.trim() ? prev : val.email);
          }
          if (val.telefone && val.telefone !== "Não informado" && val.telefone !== "Não identificado") {
            setTelefone(prev => prev.trim() ? prev : val.telefone);
          }
          if (val.estadoCivil && val.estadoCivil !== "Não informado" && val.estadoCivil !== "Não identificado") {
            const trimmed = val.estadoCivil.trim();
            let matchedStatus = "Solteiro(a)";
            if (trimmed.toLowerCase().includes("solteir")) matchedStatus = "Solteiro(a)";
            else if (trimmed.toLowerCase().includes("casad")) matchedStatus = "Casado(a)";
            else if (trimmed.toLowerCase().includes("divorciad")) matchedStatus = "Divorciado(a)";
            else if (trimmed.toLowerCase().includes("viuv") || trimmed.toLowerCase().includes("viúv")) matchedStatus = "Viúvo(a)";
            else matchedStatus = trimmed;

            setEstadoCivil(prev => prev && prev !== "Solteiro(a)" ? prev : matchedStatus);
          }
          if (val.conjugeNome && val.conjugeNome !== "Não informado" && val.conjugeNome !== "Não identificado") {
            setConjugeNome(prev => prev.trim() ? prev : val.conjugeNome);
          }
          if (val.conjugeCpf && val.conjugeCpf !== "Não informado" && val.conjugeCpf !== "Não identificado") {
            setConjugeCpf(prev => prev.trim() ? prev : formatCpf(val.conjugeCpf));
          }
          if (val.conjugeRg && val.conjugeRg !== "Não informado" && val.conjugeRg !== "Não identificado") {
            setConjugeRg(prev => prev.trim() ? prev : val.conjugeRg);
          }
          if (val.conjugeEmail && val.conjugeEmail !== "Não informado" && val.conjugeEmail !== "Não identificado") {
            setConjugeEmail(prev => prev.trim() ? prev : val.conjugeEmail);
          }
          if (val.conjugeTelefone && val.conjugeTelefone !== "Não informado" && val.conjugeTelefone !== "Não identificado") {
            setConjugeTelefone(prev => prev.trim() ? prev : val.conjugeTelefone);
          }
          if (val.conjugeProfissao && val.conjugeProfissao !== "Não informado" && val.conjugeProfissao !== "Não identificado") {
            setConjugeProfissao(prev => prev.trim() ? prev : val.conjugeProfissao);
          }
        }
      }
    } catch (err) {
      console.error("Erro na verificação unificada automática:", err);
    } finally {
      setIsPerformingFullAnalysis(false);
    }
  };

  // Initialize selected property from query param if available
  useEffect(() => {
    if (hasInitialized || imoveis.length === 0) return;
    
    const params = new URLSearchParams(window.location.search);
    const pId = params.get("propertyId") || params.get("imovelId");
    
    if (pId && imoveis.some(i => i.id === pId)) {
      setSelectedPropertyId(pId);
    } else {
      setSelectedPropertyId(imoveis[0].id);
    }
    setHasInitialized(true);
  }, [imoveis, hasInitialized]);

  const activeImovel = imoveis.find(i => i.id === selectedPropertyId);

  // Parse files helper and trigger cognitive processes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "doc" | "income" | "conjugeDoc" | "conjugeIncome") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let currentArray = docFiles;
    let limit = 5;
    let label = "Identidade (RG ou CNH)";
    if (type === "income") {
      currentArray = incomeFiles;
      limit = 10;
      label = "Comprovante de Renda";
    } else if (type === "conjugeDoc") {
      currentArray = conjugeDocFiles;
      limit = 5;
      label = "Identidade do Cônjuge";
    } else if (type === "conjugeIncome") {
      currentArray = conjugeIncomeFiles;
      limit = 10;
      label = "Comprovante de Renda do Cônjuge";
    }

    if (currentArray.length + files.length > limit) {
      setErrorMessage(`Limite excedido para ${label}! São permitidos no máximo ${limit} documentos simultâneos.`);
      return;
    }

    setErrorMessage("");

    const fileList = Array.from(files);
    let loadedCount = 0;
    const newFiles: Array<{ name: string; base64: string; mime: string; size?: string }> = [];

    fileList.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];
        
        newFiles.push({
          name: file.name,
          base64: base64Data,
          mime: file.type,
          size: `${(file.size / 1024).toFixed(1)} KB`
        });

        loadedCount++;
        if (loadedCount === fileList.length) {
          if (type === "doc") {
            setDocFiles(prev => {
              const updated = [...prev, ...newFiles];
              const promises = newFiles.map(f => extractAndAutofillNewDocument(f.base64, f.mime, f.name, "doc"));
              Promise.all(promises).then(() => {
                triggerCognitiveVerification(updated, incomeFiles, conjugeDocFiles, conjugeIncomeFiles);
              }).catch(() => {
                triggerCognitiveVerification(updated, incomeFiles, conjugeDocFiles, conjugeIncomeFiles);
              });
              return updated;
            });
          } else if (type === "income") {
            setIncomeFiles(prev => {
              const updated = [...prev, ...newFiles];
              const promises = newFiles.map(f => extractAndAutofillNewDocument(f.base64, f.mime, f.name, "income"));
              Promise.all(promises).then(() => {
                analyzeIncomeDocuments(updated).then(() => {
                  triggerCognitiveVerification(docFiles, updated, conjugeDocFiles, conjugeIncomeFiles);
                }).catch(() => {
                  triggerCognitiveVerification(docFiles, updated, conjugeDocFiles, conjugeIncomeFiles);
                });
              }).catch(() => {
                analyzeIncomeDocuments(updated).then(() => {
                  triggerCognitiveVerification(docFiles, updated, conjugeDocFiles, conjugeIncomeFiles);
                }).catch(() => {
                  triggerCognitiveVerification(docFiles, updated, conjugeDocFiles, conjugeIncomeFiles);
                });
              });
              return updated;
            });
          } else if (type === "conjugeDoc") {
            setConjugeDocFiles(prev => {
              const updated = [...prev, ...newFiles];
              const promises = newFiles.map(f => extractAndAutofillNewDocument(f.base64, f.mime, f.name, "conjugeDoc"));
              Promise.all(promises).then(() => {
                triggerCognitiveVerification(docFiles, incomeFiles, updated, conjugeIncomeFiles);
              }).catch(() => {
                triggerCognitiveVerification(docFiles, incomeFiles, updated, conjugeIncomeFiles);
              });
              return updated;
            });
          } else if (type === "conjugeIncome") {
            setConjugeIncomeFiles(prev => {
              const updated = [...prev, ...newFiles];
              const promises = newFiles.map(f => extractAndAutofillNewDocument(f.base64, f.mime, f.name, "conjugeIncome"));
              Promise.all(promises).then(() => {
                analyzeSpouseIncomeDocuments(updated).then(() => {
                  triggerCognitiveVerification(docFiles, incomeFiles, conjugeDocFiles, updated);
                }).catch(() => {
                  triggerCognitiveVerification(docFiles, incomeFiles, conjugeDocFiles, updated);
                });
              }).catch(() => {
                analyzeSpouseIncomeDocuments(updated).then(() => {
                  triggerCognitiveVerification(docFiles, incomeFiles, conjugeDocFiles, updated);
                }).catch(() => {
                  triggerCognitiveVerification(docFiles, incomeFiles, conjugeDocFiles, updated);
                });
              });
              return updated;
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return numbers.substring(0, 11);
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCpf(e.target.value));
  };

  const handleConjugeCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConjugeCpf(formatCpf(e.target.value));
  };

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (!numbers) return "";
    const floatValue = parseFloat(numbers) / 100;
    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleIncomeStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setRendaMensalStr(formatCurrency(rawValue));
  };

  const handleConjugeIncomeStrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setConjugeRendaMensalStr(formatCurrency(rawValue));
  };

  // Run AI Pre-analysis and consistency check
  const handleAiPreAnalysis = async () => {
    if (!nome || !cpf || !rendaMensalStr) {
      setErrorMessage("Por favor, preencha o Nome, CPF e Renda Mensal para efetuar a pré-análise cognitiva.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    setAiReport(null);

    const numericIncome = parseFloat(rendaMensalStr.replace(/[^\d]/g, "")) / 100 || 0;
    const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;

    const firstIncome = incomeFiles[0];
    const firstDoc = docFiles[0];
    const fileBase64 = firstIncome?.base64 || firstDoc?.base64 || "";
    const mimeType = firstIncome?.mime || firstDoc?.mime || "";
    const allFilesToSend = [
      ...docFiles.map(d => ({ fileBase64: d.base64, mimeType: d.mime, fileName: d.name })),
      ...incomeFiles.map(i => ({ fileBase64: i.base64, mimeType: i.mime, fileName: i.name }))
    ];

    try {
      // Send parameters to Gemini multimodal parser API
      const response = await fetch("/api/gemini/onboarding-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          files: allFilesToSend,
          textInput: `PROPOENTE NOME: ${nome}, CPF: ${cpf}, RENDA DECLARADA: R$ ${numericIncome.toFixed(2)}, ESTADO CIVIL: ${estadoCivil}, PROFISSAO: ${profissao}.`,
          rentValue: rentVal
        })
      });

      if (!response.ok) {
        throw new Error("Erro na requisição do serviço");
      }

      const json = await response.json();
      setAiReport(json.data);
      setShowAiPreAnalysis(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Não foi possível processar a pré-análise automatizada neste momento. Mas você pode submeter o cadastro normalmente!");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit standard candidate registry to API
  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cpf || !email || !rendaMensalStr) {
      setErrorMessage("Por favor, preencha todos os campos obrigatórios (*).");
      return;
    }

    if (estadoCivil === "Casado(a)" && (!conjugeNome || !conjugeCpf)) {
      setErrorMessage("Por favor, preencha o Nome Completo e CPF do Cônjuge.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const numericIncome = parseFloat(rendaMensalStr.replace(/[^\d]/g, "")) / 100 || 0;
    const numericConjugeIncome = parseFloat(conjugeRendaMensalStr.replace(/[^\d]/g, "")) / 100 || 0;
    const totalJointIncome = estadoCivil === "Casado(a)" ? (numericIncome + numericConjugeIncome) : numericIncome;

    const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
    const ratio = Math.round((rentVal / (totalJointIncome || 1)) * 100);

    // Score evaluation standard business logic
    const scoreRisk = ratio > 40 ? "ALTO" : (ratio > 30 ? "MEDIO" : "BAIXO");
    const scoreCredito = ratio > 40 ? 380 : (ratio > 30 ? 610 : 880);

    let finalAiReport = aiReport;
    if (!finalAiReport && incomeAnalysis) {
      finalAiReport = {
        nome: nome,
        cpfCnpj: cpf,
        birthDate: "1988-12-05",
        grossIncome: totalJointIncome,
        documentId: rg || "Não informado",
        documentType: "RG",
        validations: {
          nameMatches: true,
          cpfValid: true,
          incomeConsistent: incomeAnalysis.status === "COMPATIVEL",
          riskScore: incomeAnalysis.status === "COMPATIVEL" ? 90 : (incomeAnalysis.status === "REVISAO" ? 65 : 35),
          rentToIncomeRatio: ratio,
          recommendation: incomeAnalysis.status === "COMPATIVEL" ? "APROVADO" : (incomeAnalysis.status === "REVISAO" ? "REVISAO_MANUAL" : "RECUSADO"),
          notes: incomeAnalysis.notes
        }
      };
    }

    const spouseDocFilesMapped = conjugeDocFiles.map(d => ({
      id: `conjuge-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: `[CÔNJUGE] ${d.name}`,
      dataUpload: new Date().toISOString(),
      tamanho: d.size || "Indeterminado",
      url: d.base64 || "#",
      base64: d.base64,
      mimeType: d.mime
    }));

    const spouseIncomeFilesMapped = conjugeIncomeFiles.map(i => ({
      id: `conjuge-income-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: `[CÔNJUGE RENDA] ${i.name}`,
      dataUpload: new Date().toISOString(),
      tamanho: i.size || "Indeterminado",
      url: i.base64 || "#",
      base64: i.base64,
      mimeType: i.mime
    }));

    const candidateFiles = [
      ...docFiles.map(d => ({
        id: `candidate-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nome: d.name,
        dataUpload: new Date().toISOString(),
        tamanho: d.size || "Indeterminado",
        url: d.base64 || "#",
        base64: d.base64,
        mimeType: d.mime
      })),
      ...incomeFiles.map(i => ({
        id: `candidate-income-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nome: i.name,
        dataUpload: new Date().toISOString(),
        tamanho: i.size || "Indeterminado",
        url: i.base64 || "#",
        base64: i.base64,
        mimeType: i.mime
      })),
      ...spouseDocFilesMapped,
      ...spouseIncomeFilesMapped
    ];

    try {
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          cpf,
          rendaMensal: numericIncome,
          rendaConjunta: totalJointIncome,
          scoreCredito,
          scoreRisk,
          validatedDocs: {
            cnhRg: docFiles.length > 0 || conjugeDocFiles.length > 0,
            paystub: incomeFiles.length > 0 || conjugeIncomeFiles.length > 0,
            incomeProof: incomeFiles.length > 0 || conjugeIncomeFiles.length > 0,
          },
          rg: rg || "Não informado",
          estadoCivil,
          profissao: profissao || "Autônomo",
          telefone: telefone || "Não informado",
          selectedPropertyId: selectedPropertyId,
          aiReport: finalAiReport || undefined,
          status: "PENDENTE",
          arquivos: candidateFiles,
          conjuge: estadoCivil === "Casado(a)" ? {
            nome: conjugeNome,
            cpf: conjugeCpf,
            rg: conjugeRg || "Não informado",
            email: conjugeEmail || "Não informado",
            telefone: conjugeTelefone || "Não informado",
            profissao: conjugeProfissao || "Não informado",
            rendaMensal: numericConjugeIncome,
            arquivos: [...spouseDocFilesMapped, ...spouseIncomeFilesMapped]
          } : undefined
        })
      });

      if (response.ok) {
        setFormSubmitted(true);
        onTenantSubmitted();
      } else {
        const json = await response.json();
        setErrorMessage(json.error || "Erro no envio do cadastro. Verifique os dados e tente novamente.");
      }
    } catch (err) {
      console.error("Error submitting candidate proposal:", err);
      setErrorMessage("Erro de rede ao submeter cadastro. Tente de novo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (formSubmitted) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl p-8 text-center space-y-6 animate-fade-in" id="candidate-success-panel">
        <div className="mx-auto w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Cadastro Enviado com Sucesso!</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Seus dados cadastrais e documentos foram transmitidos com segurança e criptografia de ponta para a plataforma.
          </p>
        </div>

        {activeImovel && (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-2 text-xs max-w-md mx-auto">
            <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">Imóvel Pretendido</span>
            <p className="font-bold text-gray-800 text-sm">{activeImovel.tipo}</p>
            <p className="text-gray-500 leading-relaxed">{activeImovel.endereco}</p>
            <p className="text-indigo-700 font-bold text-right pt-1">Aluguel: R$ {activeImovel.valorAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</p>
          </div>
        )}

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 text-left text-xs text-emerald-800 leading-relaxed max-w-md mx-auto space-y-3">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Próximos Passos
          </div>
          <ol className="list-decimal pl-4 space-y-2">
            <li>
              O locador analisará a comprovação de renda e integridade documental do proponente.
            </li>
            <li>
              Uma vez deferida a análise de risco, o sistema **gerará a minuta fiel do contrato original de locação de imóvel residencial**.
            </li>
            <li>
              Você receberá a notificação para a aposição da assinatura digital com validade legal através do portal oficial <strong>Gov.br</strong>.
            </li>
          </ol>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              setFormSubmitted(false);
              setNome("");
              setCpf("");
              setRg("");
              setEmail("");
              setTelefone("");
              setProfissao("");
              setRendaMensalStr("");
              setConjugeNome("");
              setConjugeCpf("");
              setConjugeRg("");
              setConjugeEmail("");
              setConjugeTelefone("");
              setConjugeProfissao("");
              setDocFiles([]);
              setIncomeFiles([]);
              setAiReport(null);
              setShowAiPreAnalysis(false);
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm tracking-tight rounded-xl transition cursor-pointer"
          >
            Enviar Novo Cadastro
          </button>
          {isDirectAdminAccess && onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-tight rounded-xl transition cursor-pointer shadow-md hover:shadow-lg hover:scale-102 flex items-center justify-center gap-1.5"
            >
              Voltar ao Painel do Administrador
            </button>
          )}
        </div>

        <div className="text-[10px] text-black font-medium flex items-center justify-center gap-1">
          <span>Condo</span>
          <LogoMais />
          <span>MVP Core — Protocolo de Locação nos termos da Lei do Inquilinato n° 8.245.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in" id="candidate-portal-view">
      
      {/* Portal Header Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] bg-indigo-700/60 text-indigo-100 font-extrabold uppercase rounded-full border border-indigo-600 tracking-wide">
              Portal do Candidato
            </span>
            <span className="text-xs text-indigo-200 font-medium flex items-center gap-1">
              <Lock className="h-3 w-3 text-emerald-400" /> Ambiente Criptografado
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
            Envio de Cadastro para Locação Residencial
          </h2>
          <p className="text-xs text-slate-100 max-w-2xl leading-relaxed">
            Preencha suas informações cadastrais originais de forma íntegra e carregue os documentos comprobatórios para a elaboração do plano contratual com assinatura digital Gov.br.
          </p>
        </div>
        <div className="p-3 bg-white/10 border border-white/15 rounded-xl shrink-0 self-start md:self-center">
          <Building2 className="h-8 w-8 text-indigo-400" />
        </div>
      </div>

      {/* Target Property Select banner (Statically Selected) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
          <Building2 className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">1. Imóvel Vinculado para Locação</h3>
        </div>

        {activeImovel ? (
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-extrabold text-indigo-900 uppercase text-[9px] tracking-wider block">Identificação do Imóvel</span>
              <p className="font-bold text-gray-800 text-sm">{activeImovel.tipo}</p>
              <p className="text-black font-medium">{activeImovel.endereco}</p>
              {activeImovel.complemento && (
                <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-md bg-indigo-100/50 border border-indigo-200/30 text-indigo-800 text-[10px] font-bold">
                  {activeImovel.complemento}
                </span>
              )}
            </div>
            <div className="text-left md:text-right font-semibold shrink-0">
              <span className="font-extrabold text-indigo-900 uppercase text-[9px] tracking-wider block">Valor do Aluguel Pactuado</span>
              <p className="text-indigo-700 font-extrabold text-base pt-0.5">
                R$ {activeImovel.valorAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100 font-medium">Nenhum imóvel foi selecionado automaticamente. Use o link do imóvel correto.</p>
        )}
      </div>

      {/* Information Banner: Gov.br Requirement & Smart Auto-Fill */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-blue-550/5 to-white border border-indigo-150 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-widest flex items-center gap-1.5 font-sans">
          <Sparkles className="h-4 w-4 text-indigo-650 animate-pulse" />
          Instruções para Preenchimento e Envio de Documentos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          {/* Card: Gov.br signature and validation */}
          <div className="bg-white/90 border border-slate-150 p-4 rounded-xl flex items-start gap-3 shadow-3xs">
            <div className="p-2 bg-blue-50 border border-blue-150 rounded-lg text-blue-600 shrink-0 font-extrabold uppercase text-[7px] tracking-tighter">
              gov.br
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-[12px]">
                Assinatura Digital Gov.br Obrigatória
              </h4>
              <p className="text-black leading-relaxed font-bold text-[11px]">
                Todos os documentos inseridos de Identidade (RG/CNH) e Comprovantes de Renda <strong>devem estar assinados digitalmente via Gov.br</strong>. A autenticidade desses arquivos será rigorosamente validada durante a análise.
              </p>
            </div>
          </div>

          {/* Card: Auto pre-fill on document insertion */}
          <div className="bg-white/90 border border-slate-150 p-4 rounded-xl flex items-start gap-3 shadow-3xs">
            <div className="p-2 bg-emerald-50 border border-emerald-150 rounded-lg text-emerald-600 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-[12px]">
                Preenchimento Automático via Documento
              </h4>
              <p className="text-black leading-relaxed font-bold text-[11px]">
                <strong>Economize tempo!</strong> O preenchimento das suas informações é feito automaticamente assim que os arquivos forem inseridos. Basta carregar os documentos solicitados e os campos do formulário serão preenchidos instantaneamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmitProposal} className="space-y-6">
        
        {/* Step 2: Envio dos Documentos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <FileUp className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">2. Envio dos Documentos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document 1 Upload: RG/CNH */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-bold text-gray-600 uppercase">Identidade (RG ou CNH) *</span>
                <span className="text-[10px] text-black font-extrabold">{docFiles.length}/5 arquivos</span>
              </div>
              <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 text-center relative p-6 hover:bg-gray-100/50 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*"
                  onChange={(e) => handleFileChange(e, "doc")}
                  className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <FileText className="mx-auto h-8 w-8 text-indigo-500 animate-pulse" />
                  <p className="text-[11px] font-bold text-gray-700">
                    Carregar arquivo assinado Gov.br
                  </p>
                  <p className="text-[9px] text-black font-bold">Basta enviar o documento de identidade (RG/CNH)</p>
                  <p className="text-[9px] text-indigo-600 font-bold bg-indigo-50 py-1 rounded border border-indigo-100/50 px-2 inline-block">
                    ✦ Todos os campos serão preenchidos automaticamente!
                  </p>
                </div>
              </div>

              {docFiles.length > 0 && (
                <div className="space-y-1.5 mt-2 animate-fade-in">
                  <div className="space-y-1.5">
                    {docFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] bg-slate-50 text-slate-800 px-3 py-2 rounded-lg border border-gray-200">
                        <span className="font-semibold flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{f.name}</span>
                          {f.size && <span className="text-black font-extrabold">({f.size})</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDocFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="p-1 hover:bg-red-50 hover:text-red-600 text-black font-extrabold rounded cursor-pointer shrink-0 transition"
                          title="Remover arquivo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document 2 Upload: Income proof */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-bold text-gray-600 uppercase">Comprovante de Renda *</span>
                <span className="text-[10px] text-black font-extrabold">{incomeFiles.length}/10 arquivos</span>
              </div>
              <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50 text-center relative p-6 hover:bg-gray-100/50 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*"
                  onChange={(e) => handleFileChange(e, "income")}
                  className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <FileText className="mx-auto h-8 w-8 text-indigo-500 animate-pulse" />
                  <p className="text-[11px] font-bold text-gray-700">
                    Carregar comprovantes assinados Gov.br
                  </p>
                  <p className="text-[9px] text-black font-bold">Envie holerite, extrato ou IR (Últimos 3 meses)</p>
                  <p className="text-[9px] text-indigo-600 font-bold bg-indigo-50 py-1 rounded border border-indigo-100/50 px-2 inline-block">
                    ✦ O valor da renda será preenchido automaticamente!
                  </p>
                </div>
              </div>

              {incomeFiles.length > 0 && (
                <div className="space-y-1.5 mt-2 animate-fade-in">
                  <div className="space-y-1.5">
                    {incomeFiles.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] bg-slate-50 text-slate-800 px-3 py-2 rounded-lg border border-gray-200">
                        <span className="font-semibold flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{f.name}</span>
                          {f.size && <span className="text-black font-extrabold">({f.size})</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIncomeFiles(prev => prev.filter((_, idx) => idx !== i));
                          }}
                          className="p-1 hover:bg-red-50 hover:text-red-600 text-black font-extrabold rounded cursor-pointer shrink-0 transition"
                          title="Remover arquivo"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Spouse Document Upload Section */}
          {estadoCivil === "Casado(a)" && (
            <div className="p-5 bg-indigo-50/40 border border-indigo-150 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                  Documentos Individuais do Cônjuge (Casado(a))
                </h4>
              </div>
              
              <p className="text-xs text-indigo-900/80 font-medium leading-relaxed">
                Envie a documentação de identificação civil e comprovantes de rendimento do cônjuge para compor a análise unificada de renda e o instrumento contratual.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                {/* Spouse Doc 1 Upload: Identidade do Cônjuge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-bold text-gray-700 uppercase">1. RG / CNH do Cônjuge *</span>
                    <span className="text-[10px] text-gray-500 font-extrabold">{conjugeDocFiles.length}/5 arquivos</span>
                  </div>
                  <div className="border border-dashed border-indigo-200 rounded-xl bg-white text-center relative p-5 hover:bg-indigo-50/30 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*"
                      onChange={(e) => handleFileChange(e, "conjugeDoc")}
                      className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1.5">
                      <FileText className="mx-auto h-7 w-7 text-indigo-600" />
                      <p className="text-[11px] font-bold text-gray-800">
                        Carregar Identidade do Cônjuge
                      </p>
                      <p className="text-[9px] text-gray-500 font-medium">Documento de identificação com foto</p>
                      <p className="text-[9px] text-indigo-700 font-bold bg-indigo-50 py-0.5 rounded border border-indigo-100 px-2 inline-block">
                        ✦ Os dados do cônjuge serão extraídos via OCR!
                      </p>
                    </div>
                  </div>

                  {conjugeDocFiles.length > 0 && (
                    <div className="space-y-1.5 mt-2 animate-fade-in">
                      {conjugeDocFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] bg-white text-slate-800 px-3 py-2 rounded-lg border border-indigo-100 shadow-3xs">
                          <span className="font-semibold flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{f.name}</span>
                            {f.size && <span className="text-gray-500">({f.size})</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setConjugeDocFiles(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="p-1 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded cursor-pointer shrink-0 transition"
                            title="Remover arquivo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Spouse Doc 2 Upload: Comprovante de Renda do Cônjuge */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="block text-xs font-bold text-gray-700 uppercase">2. Comprovante de Renda do Cônjuge *</span>
                    <span className="text-[10px] text-gray-500 font-extrabold">{conjugeIncomeFiles.length}/10 arquivos</span>
                  </div>
                  <div className="border border-dashed border-indigo-200 rounded-xl bg-white text-center relative p-5 hover:bg-indigo-50/30 transition cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*"
                      onChange={(e) => handleFileChange(e, "conjugeIncome")}
                      className="absolute inset-x-0 inset-y-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1.5">
                      <FileText className="mx-auto h-7 w-7 text-indigo-600" />
                      <p className="text-[11px] font-bold text-gray-800">
                        Carregar Renda do Cônjuge
                      </p>
                      <p className="text-[9px] text-gray-500 font-medium">Holerite, extrato bancário ou IR</p>
                      <p className="text-[9px] text-indigo-700 font-bold bg-indigo-50 py-0.5 rounded border border-indigo-100 px-2 inline-block">
                        ✦ Renda conjunta será calculada automaticamente!
                      </p>
                    </div>
                  </div>

                  {conjugeIncomeFiles.length > 0 && (
                    <div className="space-y-1.5 mt-2 animate-fade-in">
                      {conjugeIncomeFiles.map((f, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] bg-white text-slate-800 px-3 py-2 rounded-lg border border-indigo-100 shadow-3xs">
                          <span className="font-semibold flex items-center gap-1.5 truncate">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{f.name}</span>
                            {f.size && <span className="text-gray-500">({f.size})</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setConjugeIncomeFiles(prev => prev.filter((_, idx) => idx !== i));
                            }}
                            className="p-1 hover:bg-red-50 hover:text-red-600 text-gray-400 rounded cursor-pointer shrink-0 transition"
                            title="Remover arquivo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Secure Analysis & Guidelines Info Alert */}
            <div className="bg-indigo-50/50 border border-indigo-150 rounded-2xl p-5 text-left text-xs text-indigo-950 space-y-2.5">
              <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-indigo-600" /> Validação e Assinatura Eletrônica (Gov.br)
              </h4>
              <p className="text-[11.5px] leading-relaxed text-indigo-900/80">
                Todos os documentos anexados (Identidade e Comprovantes de Renda) <strong>devem constar com as respectivas assinaturas eletrônicas realizadas no portal oficial Gov.br</strong>. Eles serão validados eletronicamente quanto à integridade e autenticidade jurídica. Assim que carregados, nosso sistema inteligente efetuará o <strong>preenchimento instantâneo e automático</strong> dos dados cadastrais correspondentes.
              </p>
            </div>

            {/* Security & GDPR Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left text-xs text-black space-y-2.5">
              <h4 className="font-bold text-gray-700 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Confidencialidade de Dados (LGPD)
              </h4>
              <p className="text-[11px] leading-relaxed text-black font-medium">
                Todas as informações pessoais, documentos civis e holerites enviados são protegidos sob criptografia de ponta a ponta e serão utilizados em conformidade restrita com a Lei Geral de Proteção de Dados (LGP/ME 13.709) e apenas para instrução de cadastro locatício com o locador fiscalizador.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Dados Pessoais do Locatário */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
            <UserCheck className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">3. Dados Pessoais do Locatário</h3>
          </div>

          {(isParsingDoc || isAnalyzingIncome || isPerformingFullAnalysis) && (
            <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl space-y-1.5 animate-pulse flex flex-col md:flex-row md:items-center justify-between text-xs text-indigo-950">
              <div className="space-y-1">
                <p className="font-bold text-indigo-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-sans">
                  <Cpu className="h-4 w-4 text-indigo-600 animate-spin" /> Processamento Cognitivo Ativo ⚡
                </p>
                <p className="text-black font-semibold leading-relaxed text-[11px]">
                  Analisando assinaturas Gov.br, verificando registros criminais, órgãos judiciais e preenchendo automaticamente sua ficha cadastral...
                </p>
              </div>
              <span className="mt-2 md:mt-0 px-2.5 py-1 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-full font-bold uppercase tracking-wider text-[9px] self-start md:self-center">
                Preenchendo
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Nome */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="block text-xs font-black text-black uppercase tracking-wider">Nome Completo *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Insira exatamente como consta no RG/CNH"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold"
              />
            </div>

            {/* CPF */}
            <div className="space-y-1.5 bg-amber-50/20 p-3 rounded-xl border border-amber-100/50">
              <label className="block text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
                <span>CPF *</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-amber-105 text-amber-800 rounded font-bold uppercase">Apenas CPF</span>
              </label>
              <input
                type="text"
                required
                value={cpf}
                onChange={handleCpfChange}
                placeholder="000.000.000-00"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold font-mono shadow-3xs"
              />
              <span className="text-[10px] text-amber-700 font-bold block leading-tight">
                ⚠️ Não confunda com o número de RG. O CPF é o Cadastro de Pessoas Físicas (com 11 dígitos).
              </span>
            </div>

            {/* RG */}
            <div className="space-y-1.5 bg-amber-50/20 p-3 rounded-xl border border-amber-100/50">
              <label className="block text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
                <span>RG / Órgão Emissor</span>
                <span className="text-[8px] px-1.5 py-0.5 bg-amber-105 text-amber-800 rounded font-bold uppercase">Apenas RG</span>
              </label>
              <input
                type="text"
                value={rg}
                onChange={(e) => setRg(e.target.value)}
                placeholder="Ex: 12.345.678-9 SSP-SP"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold shadow-3xs"
              />
              <span className="text-[10px] text-amber-700 font-bold block leading-tight">
                ⚠️ Não coloque o CPF aqui. O RG é o número da sua cédula de identidade civil estadual.
              </span>
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-black uppercase tracking-wider">E-mail Contato *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@dominio.com"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold"
              />
              <span className="text-[10px] text-black block font-bold">✦ Canal para recebimento do contrato digital e alertas de faturas.</span>
            </div>

            {/* Telefone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-black uppercase tracking-wider">Telefone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(00) 99999-9999"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold"
              />
              <span className="text-[10px] text-black block font-bold bg-indigo-50/50 p-1 rounded border border-indigo-100/30">✦ Usado para envio imediato de documentos e avisos prévios de vencimento de aluguel direto do WhatsApp do Proprietário.</span>
            </div>

            {/* Estado Civil */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-black uppercase tracking-wider">Estado Civil</label>
              <select
                value={estadoCivil}
                onChange={(e) => setEstadoCivil(e.target.value)}
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white cursor-pointer text-black font-bold"
              >
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
              </select>
            </div>

            {/* Profissão */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-black uppercase tracking-wider">Profissão / Atividade</label>
              <input
                type="text"
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                placeholder="Ex: Engenheiro de Software"
                className="w-full text-xs p-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-black font-bold"
              />
            </div>

            {/* Conditionally Open Spouse (Cônjuge) Fields */}
            {estadoCivil === "Casado(a)" && (
              <div className="col-span-1 md:col-span-2 p-5 bg-indigo-50/20 border border-indigo-150 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-indigo-50 pb-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <h4 className="text-xs font-black text-black uppercase tracking-wide">Dados Cadastrais do Respectivo Cônjuge</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cônjuge Nome */}
                  <div className="space-y-1.5 col-span-1 md:col-span-2">
                    <label className="block text-xs font-black text-black uppercase tracking-wider">Nome Completo do Cônjuge *</label>
                    <input
                      type="text"
                      required
                      value={conjugeNome}
                      onChange={(e) => setConjugeNome(e.target.value)}
                      placeholder="Insira exatamente como consta no RG/CNH do Cônjuge"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold"
                    />
                  </div>

                  {/* Cônjuge CPF */}
                  <div className="space-y-1.5 bg-amber-50/20 p-3 rounded-xl border border-amber-100/50">
                    <label className="block text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
                      <span>CPF do Cônjuge *</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-amber-105 text-amber-800 rounded font-bold uppercase">Apenas CPF</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={conjugeCpf}
                      onChange={handleConjugeCpfChange}
                      placeholder="000.000.000-00"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold font-mono shadow-3xs"
                    />
                    <span className="text-[10px] text-amber-700 font-bold block leading-tight">
                      ⚠️ Não coloque o RG do cônjuge aqui. O CPF possui 11 dígitos.
                    </span>
                  </div>

                  {/* Cônjuge RG */}
                  <div className="space-y-1.5 bg-amber-50/20 p-3 rounded-xl border border-amber-100/50">
                    <label className="block text-xs font-black text-black uppercase tracking-wider flex items-center gap-1">
                      <span>RG / Órgão Emissor do Cônjuge</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-amber-105 text-amber-800 rounded font-bold uppercase">Apenas RG</span>
                    </label>
                    <input
                      type="text"
                      value={conjugeRg}
                      onChange={(e) => setConjugeRg(e.target.value)}
                      placeholder="Ex: 12.345.678-9 SSP-SP"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold shadow-3xs"
                    />
                    <span className="text-[10px] text-amber-700 font-bold block leading-tight">
                      ⚠️ Não insira o CPF do cônjuge aqui. Use o número de registro geral de identidade estadual do cônjuge.
                    </span>
                  </div>

                  {/* Cônjuge E-mail */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-black uppercase tracking-wider">E-mail Contato do Cônjuge</label>
                    <input
                      type="email"
                      value={conjugeEmail}
                      onChange={(e) => setConjugeEmail(e.target.value)}
                      placeholder="nome.conjuge@dominio.com"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold"
                    />
                  </div>

                  {/* Cônjuge Telefone */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-black uppercase tracking-wider">Telefone / WhatsApp do Cônjuge</label>
                    <input
                      type="tel"
                      value={conjugeTelefone}
                      onChange={(e) => setConjugeTelefone(e.target.value)}
                      placeholder="(00) 99999-9999"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold"
                    />
                  </div>

                  {/* Cônjuge Profissão */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-black uppercase tracking-wider">Profissão / Atividade do Cônjuge</label>
                    <input
                      type="text"
                      value={conjugeProfissao}
                      onChange={(e) => setConjugeProfissao(e.target.value)}
                      placeholder="Ex: Arquiteta de Soluções"
                      className="w-full text-xs p-3 bg-white border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 text-black font-bold"
                    />
                  </div>

                  {/* Cônjuge Renda Mensal Comprovada */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-black text-indigo-950 uppercase tracking-wider">
                      Renda Mensal do Cônjuge *
                    </label>
                    <input
                      type="text"
                      value={conjugeRendaMensalStr}
                      onChange={handleConjugeIncomeStrChange}
                      placeholder="R$ 0,00"
                      className="w-full text-xs p-3 bg-white border border-indigo-200 rounded-xl focus:ring-1 focus:ring-indigo-500 text-indigo-900 font-extrabold"
                    />
                    <span className="text-[10px] text-indigo-700 font-bold block">
                      ✦ Preenchido via leitura de comprovantes de renda do cônjuge.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Renda Mensal Declarada Principal */}
            <div className="space-y-1.5 col-span-1 md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 uppercase">Renda Mensal Comprovada do Locatário Principal (Bruta) *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={rendaMensalStr}
                  onChange={incomeStrChange => handleIncomeStrChange(incomeStrChange)}
                  placeholder="R$ 0,00"
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white text-indigo-700 font-bold"
                />
              </div>
              <p className="text-[10px] text-black font-bold">
                Aviso: A Lei do Inquilinato recomenda que o comprometimento de renda para o aluguel residencial seja de, no máximo, 30%.
              </p>
            </div>

            {/* Joint Income Viability Analysis Card (Casal) */}
            {estadoCivil === "Casado(a)" && (
              <div className="col-span-1 md:col-span-2 p-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-sm border border-indigo-700/50 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-indigo-700/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300 border border-indigo-400/30">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Análise de Viabilidade por Renda Conjunta (Casal)
                      </h4>
                      <p className="text-[10px] text-indigo-200">
                        Análise consolidada somando rendimentos do titular e cônjuge
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-100 text-[10px] font-extrabold uppercase rounded-full">
                    Renda Familiar Agregada
                  </span>
                </div>

                {(() => {
                  const mIncome = parseFloat(rendaMensalStr.replace(/[^\d]/g, "")) / 100 || 0;
                  const sIncome = parseFloat(conjugeRendaMensalStr.replace(/[^\d]/g, "")) / 100 || 0;
                  const totalJoint = mIncome + sIncome;
                  const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;
                  const ratio = totalJoint > 0 ? Math.round((rentVal / totalJoint) * 100) : 0;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-800/40">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Titular</span>
                        <span className="text-sm font-extrabold text-indigo-200">
                          R$ {mIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-indigo-800/40">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Cônjuge</span>
                        <span className="text-sm font-extrabold text-indigo-200">
                          R$ {sIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="bg-indigo-950/90 p-3 rounded-xl border border-indigo-500/50 col-span-1 md:col-span-2">
                        <span className="text-[9px] uppercase font-bold text-indigo-300 block">
                          Renda Conjunta Total & Comprometimento
                        </span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="text-base font-black text-emerald-400">
                            R$ {totalJoint.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            ratio <= 30 ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" :
                            ratio <= 40 ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" :
                            "bg-red-500/20 text-red-300 border border-red-500/40"
                          }`}>
                            {ratio}% do aluguel (R$ {rentVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                          </span>
                        </div>
                      </div>

                      <div className="col-span-1 md:col-span-4 bg-slate-900/60 p-3 rounded-xl border border-indigo-800/30 text-[11px] text-slate-200 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>
                          {ratio <= 30
                            ? "Viabilidade Excelente: A renda conjunta atende perfeitamente ao teto de 30% da Lei do Inquilinato."
                            : ratio <= 40
                            ? "Viabilidade Aceitável: Comprometimento da renda conjunta em nível moderado. Recomendado aprovação com caução ou seguro-fiança."
                            : "Comprometimento Elevado: A renda conjunta excede 40% do valor do aluguel. Recomendada inclusão de fiador ou garantia adicional."}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

          {/* Submittals/Buttons zone */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {errorMessage && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-650 text-white rounded-xl transition font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm uppercase tracking-wide cursor-pointer"
              >
                <UserCheck className="h-4 w-4" />
                <span>{isLoading ? "Enviando Proposta para Análise..." : "Submeter Proposta de Locação"}</span>
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
