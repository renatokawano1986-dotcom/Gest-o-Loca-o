import React, { useState, useEffect } from "react";
import { 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Cpu, 
  Info,
  DollarSign,
  Trash2,
  FileText
} from "lucide-react";
import { OnboardingExtractedResult, Imovel } from "../types";

interface OnboardingKycProps {
  imoveis: Imovel[];
  onTenantAdded: () => void;
  onNavigate: (tab: string) => void;
}

interface OnboardingFile {
  fileName: string;
  mimeType: string;
  fileBase64: string;
  size?: string;
}

export default function OnboardingKyc({ imoveis, onTenantAdded, onNavigate }: OnboardingKycProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>(imoveis[0]?.id || "");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  
  // Custom manual or uploaded inputs supporting up to 20 simultaneous files
  const [textInput, setTextInput] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<OnboardingFile[]>([]);
  const [fileLimitWarning, setFileLimitWarning] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    source: string;
    warning?: string;
    data: OnboardingExtractedResult;
  } | null>(null);

  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // States to gather editable contact inputs before saving
  const [editableEmail, setEditableEmail] = useState<string>("");
  const [editableTelefone, setEditableTelefone] = useState<string>("");
  const [editableNome, setEditableNome] = useState<string>("");
  const [editableCpf, setEditableCpf] = useState<string>("");
  const [editableIncome, setEditableIncome] = useState<number>(0);
  const [editableDocId, setEditableDocId] = useState<string>("");
  const [editableDocType, setEditableDocType] = useState<string>("RG");
  const [editableEstadoCivil, setEditableEstadoCivil] = useState<string>("Solteiro(a)");

  useEffect(() => {
    if (result && result.data) {
      const generatedEmail = `${result.data.nome.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      setEditableEmail(generatedEmail);
      setEditableTelefone("");
      setEditableNome(result.data.nome);
      setEditableCpf(result.data.cpfCnpj);
      setEditableIncome(result.data.grossIncome);
      setEditableDocId(result.data.documentId);
      setEditableDocType(result.data.documentType || "RG");
      setEditableEstadoCivil(result.data.estadoCivil || "Solteiro(a)");
    }
  }, [result]);

  const activeImovel = imoveis.find(i => i.id === selectedProperty) || imoveis[0];
  const rentVal = activeImovel ? activeImovel.valorAluguel : 3000;

  // Handle local files upload (supporting multiple simultaneous uploads)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileLimitWarning(null);

    const currentFilesCount = uploadedFiles.length;
    const remainingSlots = 20 - currentFilesCount;
    
    if (remainingSlots <= 0) {
      setFileLimitWarning("Limite máximo de 20 documentos já foi atingido.");
      return;
    }

    const filesToProcess = (Array.from(files) as File[]).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setFileLimitWarning(`Limite de 20 documentos atingido. Apenas os primeiros ${remainingSlots} arquivos foram considerados.`);
    }

    const processedList: OnboardingFile[] = [];
    let loadCount = 0;

    for (const file of filesToProcess) {
      const reader = new FileReader();
      const fileSizeKb = Math.round(file.size / 1024);
      const formattedSize = fileSizeKb > 1024 
        ? `${(fileSizeKb / 1024).toFixed(1)} MB` 
        : `${fileSizeKb} KB`;

      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Chunk = base64.split(",")[1]; // extract base64 chunk
        
        processedList.push({
          fileName: file.name,
          mimeType: file.type,
          fileBase64: base64Chunk,
          size: formattedSize
        });

        loadCount++;
        if (loadCount === filesToProcess.length) {
          setUploadedFiles(prev => {
            const combined = [...prev, ...processedList];
            return combined.slice(0, 20); // strict safety limit of 20
          });
        }
      };
      reader.readAsDataURL(file);
    }
    // Clear input so same file can be selection-triggered again
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFileLimitWarning(null);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setFileLimitWarning(null);
  };

  const executeAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setSavedSuccess(false);

    try {
      const filesPayload = uploadedFiles.map(f => ({
        fileBase64: f.fileBase64,
        mimeType: f.mimeType,
        fileName: f.fileName
      }));

      const response = await fetch("/api/gemini/onboarding-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: filesPayload,
          textInput: textInput || "Identidades e comprovantes de renda anexados.",
          rentValue: rentVal
        })
      });

      const json = await response.json();
      setResult(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveToTenantDb = async () => {
    if (!result) return;
    setSaving(true);

    try {
      const val = result.data;
      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: editableNome || val.nome,
          email: editableEmail || `${(editableNome || val.nome).toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          telefone: editableTelefone || "Não informado",
          cpf: editableCpf || val.cpfCnpj,
          estadoCivil: editableEstadoCivil,
          rg: editableDocId,
          profissao: val.profissao || "Autônomo",
          rendaMensal: Number(editableIncome) || val.grossIncome,
          scoreCredito: val.validations.riskScore * 10, // scale risk score to credit bureau value
          scoreRisk: val.validations.recommendation === "APROVADO" ? "BAIXO" : (val.validations.recommendation === "REVISAO_MANUAL" ? "MEDIO" : "ALTO"),
          validatedDocs: {
            cnhRg: !!editableDocId,
            paystub: val.validations.incomeConsistent,
            incomeProof: val.validations.incomeConsistent,
          },
          aiReport: {
            ...val,
            nome: editableNome || val.nome,
            cpfCnpj: editableCpf || val.cpfCnpj,
            grossIncome: Number(editableIncome) || val.grossIncome,
            documentId: editableDocId || val.documentId,
            documentType: editableDocType || val.documentType
          },
          status: "PENDENTE",
          arquivos: uploadedFiles.map(f => ({
            id: `candidate-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            nome: f.fileName,
            dataUpload: new Date().toISOString(),
            tamanho: f.fileSize || "1.2 MB",
            url: f.fileBase64 || "#",
            base64: f.fileBase64,
            mimeType: f.mimeType
          }))
        })
      });

      if (response.ok) {
        setSavedSuccess(true);
        onTenantAdded();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Houve um erro ao registrar perfil.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="onboarding-kyc-view">
      
      {/* Parameters Panel */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Cpu className="h-4 w-4" /> Análise de Cadastro
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Validação Multimodal de Cadastro</h3>
          <p className="text-xs text-black font-semibold">Analise documentos e renda do inquilino em tempo real contra parâmetros de locação.</p>
        </div>

        {/* Property Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-bold text-gray-700 uppercase animate-fade-in">1. Imóvel Pretendido</label>
            <button
              type="button"
              onClick={() => {
                const link = `${window.location.origin}/?candidate=true&propertyId=${selectedProperty}`;
                navigator.clipboard.writeText(link);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="text-[10px] text-indigo-700 font-extrabold bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition"
            >
              {copiedLink ? "✓ Link Copiado!" : "🔗 Copiar Link para Candidato"}
            </button>
          </div>
          <select 
            value={selectedProperty} 
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          >
            {imoveis.map(imovel => (
              <option key={imovel.id} value={imovel.id}>
                {imovel.tipo} — {imovel.endereco.split(" - ")[0]} (Aluguel: R$ {imovel.valorAluguel})
              </option>
            ))}
          </select>
        </div>

        {/* Document upload field */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-gray-700 uppercase">2. Documento do Inquilino</label>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Até 20 arquivos simultâneos
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Multi-file drag-and-drop / file selector */}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                  <FileUp className="w-8 h-8 mb-2.5 text-gray-400 animate-bounce" />
                  <p className="mb-0.5 text-xs text-gray-500 font-semibold">Clique para carregar documentos</p>
                  <p className="text-[10px] text-gray-400">Arraste ou selecione até 20 fotos, PDFs ou comprovantes para cruzamento de dados</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/*" 
                  multiple 
                  onChange={handleFileChange} 
                />
              </label>
            </div>
            
            {fileLimitWarning && (
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-medium text-amber-800 flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{fileLimitWarning}</span>
              </div>
            )}

            {/* Uploaded Files grid / list */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 pb-1.5 border-b border-gray-100">
                  <span>Documentos Selecionados ({uploadedFiles.length} de 20)</span>
                  <button 
                    type="button" 
                    onClick={clearAllFiles} 
                    className="text-rose-600 hover:text-rose-800 text-[10px] uppercase font-mono tracking-wider transition cursor-pointer"
                  >
                    Limpar Todos
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {uploadedFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100/80 transition-all gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                        <div className="truncate">
                          <p className="font-bold text-slate-800 truncate leading-snug">{file.fileName}</p>
                          <p className="text-[9px] text-slate-400 font-mono font-medium">
                            {file.size || "10 KB"} • {file.mimeType.split("/")[1]?.toUpperCase() || "DOC"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Remover documento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Parameters description */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase">
            3. Metadados Adicionais / Informações do Proponente
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Forneça dados extras se julgar necessário. Ex: CPF legítimo para consulta externa ou holerite digitado."
            rows={3}
            className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={executeAnalysis}
          disabled={loading || (!textInput && uploadedFiles.length === 0)}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-200 disabled:text-gray-400 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Gemini Analisando Documento...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Executar Análise de Risco com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Result Panel */}
      <div className="space-y-6">
        
        {/* If result is ready */}
        {result ? (
          <div className="bg-white border p-6 rounded-xl shadow-sm space-y-6 animate-fade-in relative overflow-hidden">
            
            {/* Recommendation Ribbon indicator */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              result.data.validations.recommendation === "APROVADO" 
                ? "bg-emerald-500" 
                : result.data.validations.recommendation === "REVISAO_MANUAL" 
                  ? "bg-amber-500" 
                  : "bg-red-500"
            }`} />

            {/* Header Result */}
            <div className="flex justify-between items-start pt-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600 block w-max mb-1">
                  Dados Retornados da IA
                </span>
                <h4 className="text-lg font-bold text-gray-900 tracking-tight">Resultado da Análise de Cadastro</h4>
              </div>
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                result.data.validations.recommendation === "APROVADO" 
                  ? "bg-emerald-50 text-emerald-700" 
                  : result.data.validations.recommendation === "REVISAO_MANUAL" 
                    ? "bg-amber-50 text-amber-700" 
                    : "bg-red-50 text-red-700"
              }`}>
                {result.data.validations.recommendation === "APROVADO" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {result.data.validations.recommendation === "REVISAO_MANUAL" && <AlertTriangle className="h-3.5 w-3.5" />}
                {result.data.validations.recommendation === "RECUSADO" && <XCircle className="h-3.5 w-3.5" />}
                {result.data.validations.recommendation}
              </span>
            </div>

            {/* Extracted Details Grid (Fully Editable Controls) */}
            <div className="bg-indigo-50/10 p-4 rounded-xl border border-indigo-100/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs font-sans text-black shadow-2xs">
              <div className="sm:col-span-2 text-[10px] text-indigo-950 font-extrabold uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-100/40 pb-2 mb-0.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse shrink-0" />
                <span>Dados do Perfil Técnico Extraídos via OCR/IA</span>
              </div>
              
              <div className="space-y-1 block">
                <label className="block text-[10px] uppercase font-bold text-slate-700">Nome Completo do Candidato</label>
                <input
                  type="text"
                  required
                  value={editableNome}
                  onChange={(e) => setEditableNome(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:ring-1 focus:ring-indigo-500 font-bold text-black"
                  placeholder="Nome Completo"
                />
              </div>

              <div className="space-y-1 block">
                <label className="block text-[10px] uppercase font-bold text-slate-700">CPF do Candidato</label>
                <input
                  type="text"
                  required
                  value={editableCpf}
                  onChange={(e) => setEditableCpf(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-black"
                  placeholder="Ex: 000.000.000-00"
                />
              </div>

              <div className="space-y-1 block">
                <label className="block text-[10px] uppercase font-bold text-slate-700">Renda Mensal Comprovada (R$)</label>
                <input
                  type="number"
                  required
                  value={editableIncome || ""}
                  onChange={(e) => {
                    const parsedValue = parseFloat(e.target.value) || 0;
                    setEditableIncome(parsedValue);
                  }}
                  className="w-full text-xs p-2 bg-white border border-slate-205 rounded-lg focus:ring-1 focus:ring-indigo-505 font-mono font-bold text-indigo-700 focus:text-indigo-900"
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-1 block">
                <label className="block text-[10px] uppercase font-bold text-slate-705">Documento de Identidade ({editableDocType})</label>
                <div className="flex gap-1.5">
                  <select
                    value={editableDocType}
                    onChange={(e) => setEditableDocType(e.target.value)}
                    className="p-2 text-xs bg-white border border-slate-205 rounded-lg font-bold cursor-pointer text-slate-800"
                  >
                    <option value="RG">RG</option>
                    <option value="CNH">CNH</option>
                    <option value="Outro">Outro</option>
                  </select>
                  <input
                    type="text"
                    required
                    value={editableDocId}
                    onChange={(e) => setEditableDocId(e.target.value)}
                    className="flex-1 text-xs p-2 bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-indigo-505 font-bold text-black"
                    placeholder="Número"
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="block text-[10px] uppercase font-bold text-slate-705">Estado Civil do Candidato</label>
                <select
                  value={editableEstadoCivil}
                  onChange={(e) => setEditableEstadoCivil(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-lg focus:ring-1 focus:ring-indigo-505 font-bold text-black"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>
            </div>

            {/* Calculations and Risk indicators */}
            <div className="space-y-3">
              <h5 className="text-xs font-black text-black uppercase tracking-wider">Validação de Regras de Crédito</h5>
              
              <div className="grid grid-cols-2 gap-4">
                
                {/* Score */}
                <div className="p-3 rounded-lg border border-gray-150 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-black font-bold">
                    <span>Comprometimento Renda</span>
                    <span className="font-bold text-indigo-600">
                      {Math.round((rentVal / (editableIncome || 1)) * 100)}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${Math.round((rentVal / (editableIncome || 1)) * 100) > 30 ? "bg-red-500" : "bg-indigo-600"}`}
                      style={{ width: `${Math.min(Math.round((rentVal / (editableIncome || 1)) * 100), 100)}%` }}
                    />
                  </div>
                  <span className="block text-[10px] text-black font-extrabold">Limite de segurança: 30%</span>
                </div>

                {/* Risk scoring */}
                <div className="p-3 rounded-lg border border-gray-150 bg-white space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-black font-bold">
                    <span>Pontuação de Crédito (IA)</span>
                    <span className="font-bold text-indigo-600">{result.data.validations.riskScore}/100</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${result.data.validations.riskScore < 50 ? "bg-red-500" : "bg-emerald-500"}`}
                      style={{ width: `${result.data.validations.riskScore}%` }}
                    />
                  </div>
                  <span className="block text-[10px] text-black font-extrabold">Fidelidade cadastral</span>
                </div>

              </div>

              {/* Rationale and AI notes */}
              <div className="p-3 bg-indigo-50/20 rounded-lg border border-indigo-150 text-xs text-black font-medium space-y-1">
                <div className="font-black text-indigo-950 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-indigo-600 animate-pulse animate-duration-1000" /> Notas Diagnósticas Gemini
                </div>
                <p className="leading-relaxed text-[11.5px] text-black font-semibold">{result.data.validations.notes}</p>
              </div>

              {/* Editable Tenant Contact Fields */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-3.5">
                <div className="flex items-center gap-1.5 font-black text-black uppercase tracking-wider text-[10px]">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Canais de Contato para Remessa e Notificações</span>
                </div>
                <p className="text-[10px] text-black leading-snug font-bold">
                  Para que o ecossistema Condo faça o envio automático de contratos, links e lembretes de cobrança direto do seu WhatsApp e E-mail, defina os contatos do morador abaixo:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-black font-extrabold">E-mail do Inquilino</label>
                    <input
                      type="email"
                      required
                      value={editableEmail}
                      onChange={(e) => setEditableEmail(e.target.value)}
                      placeholder="inquilino@dominio.com"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-705">Telefone / WhatsApp</label>
                    <input
                      type="tel"
                      required
                      value={editableTelefone}
                      onChange={(e) => setEditableTelefone(e.target.value)}
                      placeholder="+55 (11) 99999-9999"
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Model information badge */}
            <div className="flex items-center gap-2 justify-between border-t border-gray-100 pt-4">
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Cpu className="h-3 w-3" /> Motor Ativo: <strong className="text-gray-600">{result.source === "gemini-api" ? "Gemini 3.5 Flash (Ao Vivo)" : "Emulação Local (Contingência de API)"}</strong>
              </span>

              {savedSuccess ? (
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <CheckCircle2 className="h-4 w-4" /> Salvo no Banco!
                  <button 
                    onClick={() => onNavigate("contracts")}
                    className="flex items-center gap-0.5 px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                  >
                    Ir para Contratos <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const payload = {
                          tipoDocumento: editableDocType === "CNH" ? "CNH" : "RG",
                          nomeArquivoPattern: uploadedFiles[0]?.fileName?.replace(/\.[^/.]+$/, "") || "modelo_documento",
                          conteudoTextoPattern: editableNome,
                          dadosSaneados: {
                            nome: editableNome,
                            rg: editableDocId,
                            cpf: editableCpf,
                            email: editableEmail,
                            endereco: "Endereço verificado no gabarito",
                            rendaMensal: Number(editableIncome),
                            aiComentario: "Registro cadastrado via Calibragem Rápida na tela de Onboarding. Perfil de proponente verificado."
                          },
                          observacoesTreinamento: `Calibrado automaticamente com base no arquivo ${uploadedFiles[0]?.fileName || 'onboarding'}`
                        };
                        const res = await fetch("/api/ai-training-patterns", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload)
                        });
                        if (res.ok) {
                          alert(`Sucesso! Este documento (${uploadedFiles[0]?.fileName}) agora é um Gabarito Oficial de IA de contingência rápida.`);
                        } else {
                          const err = await res.json();
                          alert(err.error || "Erro ao calibrar.");
                        }
                      } catch (e) {
                        alert("Erro ao calibrar.");
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition font-bold text-xs rounded-lg"
                    title="Adiciona este documento de onboarding como padrão de inteligência para preenchimentos futuros ultra-rápidos"
                  >
                    <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                    Treinar IA com Este Doc
                  </button>
                  <button
                    onClick={saveToTenantDb}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition font-bold text-xs rounded-lg"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    {saving ? "Salvando..." : "Gravar Inquilino para Contrato"}
                  </button>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="bg-white border p-12 rounded-xl shadow-sm text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-50 text-gray-300 rounded-full">
              <Cpu className="h-10 w-10 animate-pulse" />
            </div>
            <div className="max-w-xs space-y-1.5">
              <h4 className="font-bold text-gray-700">Aguardando Execução</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Insira as configurações na coluna ao lado e processe com inteligência artificial para extrair os dados e pontuará os créditos.
              </p>
            </div>
          </div>
        )}

        {/* Informative Step Box card */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-xl text-white space-y-4 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[9px] bg-indigo-800 text-indigo-200 uppercase font-semibold rounded">Fórmulas do Negócio</span>
            <span className="text-[10px] text-indigo-300">Análise de Cadastro</span>
          </div>
          <h4 className="font-bold text-sm tracking-tight text-white">Como a IA avalia a Renda?</h4>
          <p className="text-xs text-indigo-200 leading-relaxed">
            O motor cognitivo cruzará os dados do holerite extraído com o valor do aluguel pretendido do imóvel que você selecionou. Caso a renda bruta total de compras seja menor do que o triplo do aluguel (~33%), o sistema classificará automaticamente como <strong className="text-white">REVISÃO MANUAL</strong> ou <strong className="text-white">RECUSADO</strong>.
          </p>
        </div>

      </div>

    </div>
  );
}
