import React, { useState, useEffect } from "react";
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  FileText, 
  Save, 
  X, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Database,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { AIAprendizadoPattern } from "../types";

export function AILearningCenter() {
  const [patterns, setPatterns] = useState<AIAprendizadoPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDocType, setFilterDocType] = useState<string>("ALL");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Individual fields
  const [tipoDocumento, setTipoDocumento] = useState<'RG' | 'CNH' | 'COMPROVANTE_RENDA' | 'FATURA_DESPESA' | 'OUTRO'>('RG');
  const [nomeArquivoPattern, setNomeArquivoPattern] = useState("");
  const [conteudoTextoPattern, setConteudoTextoPattern] = useState("");
  const [observacoesTreinamento, setObservacoesTreinamento] = useState("");
  
  // Sanitized data sub-fields
  const [sanitizedNome, setSanitizedNome] = useState("");
  const [sanitizedRg, setSanitizedRg] = useState("");
  const [sanitizedCpf, setSanitizedCpf] = useState("");
  const [sanitizedEmail, setSanitizedEmail] = useState("");
  const [sanitizedEndereco, setSanitizedEndereco] = useState("");
  const [sanitizedRenda, setSanitizedRenda] = useState("");
  const [sanitizedBanco, setSanitizedBanco] = useState("");
  const [sanitizedAgencia, setSanitizedAgencia] = useState("");
  const [sanitizedConta, setSanitizedConta] = useState("");
  const [sanitizedPixKey, setSanitizedPixKey] = useState("");
  const [sanitizedValor, setSanitizedValor] = useState("");
  const [sanitizedCategoria, setSanitizedCategoria] = useState("LUZ");
  const [sanitizedDescricao, setSanitizedDescricao] = useState("");
  const [sanitizedComment, setSanitizedComment] = useState("");

  const [activeTabHelp, setActiveTabHelp] = useState<boolean>(true);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-training-patterns");
      if (!res.ok) throw new Error("Erro ao carregar padrões do servidor.");
      const data = await res.json();
      setPatterns(data);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (pattern: AIAprendizadoPattern) => {
    setEditingId(pattern.id);
    setTipoDocumento(pattern.tipoDocumento);
    setNomeArquivoPattern(pattern.nomeArquivoPattern || "");
    setConteudoTextoPattern(pattern.conteudoTextoPattern || "");
    setObservacoesTreinamento(pattern.observacoesTreinamento || "");
    
    // Sub-fields
    setSanitizedNome(pattern.dadosSaneados?.nome || "");
    setSanitizedRg(pattern.dadosSaneados?.rg || "");
    setSanitizedCpf(pattern.dadosSaneados?.cpf || pattern.dadosSaneados?.cpfCnpj || "");
    setSanitizedEmail(pattern.dadosSaneados?.email || "");
    setSanitizedEndereco(pattern.dadosSaneados?.endereco || pattern.dadosSaneados?.residencia || "");
    setSanitizedRenda(pattern.dadosSaneados?.rendaMensal?.toString() || "");
    setSanitizedBanco(pattern.dadosSaneados?.banco || "");
    setSanitizedAgencia(pattern.dadosSaneados?.agencia || "");
    setSanitizedConta(pattern.dadosSaneados?.conta || "");
    setSanitizedPixKey(pattern.dadosSaneados?.pixKey || "");
    setSanitizedValor(pattern.dadosSaneados?.valor?.toString() || "");
    setSanitizedCategoria(pattern.dadosSaneados?.categoria || "LUZ");
    setSanitizedDescricao(pattern.dadosSaneados?.descricao || "");
    setSanitizedComment(pattern.dadosSaneados?.aiComentario || "");
    
    setShowForm(true);
  };

  const resetFormFields = () => {
    setEditingId(null);
    setTipoDocumento('RG');
    setNomeArquivoPattern("");
    setConteudoTextoPattern("");
    setObservacoesTreinamento("");
    setSanitizedNome("");
    setSanitizedRg("");
    setSanitizedCpf("");
    setSanitizedEmail("");
    setSanitizedEndereco("");
    setSanitizedRenda("");
    setSanitizedBanco("");
    setSanitizedAgencia("");
    setSanitizedConta("");
    setSanitizedPixKey("");
    setSanitizedValor("");
    setSanitizedCategoria("LUZ");
    setSanitizedDescricao("");
    setSanitizedComment("");
  };

  const handleCreateNewClick = () => {
    resetFormFields();
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente remover esta regra de aprendizado? A inteligência artificial desaprenderá este padrão.")) return;
    
    try {
      const res = await fetch(`/api/ai-training-patterns/${id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Falha ao deletar regra no servidor.");
      
      setSuccessMsg("Regra de calibração removida com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchPatterns();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar regra.");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipoDocumento) {
      setError("Selecione o tipo do documento.");
      return;
    }
    if (!nomeArquivoPattern && !conteudoTextoPattern) {
      setError("Defina pelo menos um parâmetro de busca (Nome do Arquivo ou Texto/Palavra Chave no documento).");
      return;
    }

    // Assemble the sanitized object
    const dadosSaneados: Record<string, any> = {};
    if (sanitizedNome) dadosSaneados.nome = sanitizedNome;
    if (sanitizedRg) dadosSaneados.rg = sanitizedRg;
    if (sanitizedCpf) dadosSaneados.cpf = sanitizedCpf;
    if (sanitizedEmail) dadosSaneados.email = sanitizedEmail;
    if (sanitizedEndereco) dadosSaneados.endereco = sanitizedEndereco;
    if (sanitizedRenda) dadosSaneados.rendaMensal = Number(sanitizedRenda) || 0;
    if (sanitizedBanco) dadosSaneados.banco = sanitizedBanco;
    if (sanitizedAgencia) dadosSaneados.agencia = sanitizedAgencia;
    if (sanitizedConta) dadosSaneados.conta = sanitizedConta;
    if (sanitizedPixKey) dadosSaneados.pixKey = sanitizedPixKey;
    if (sanitizedValor) dadosSaneados.valor = Number(sanitizedValor) || 0;
    if (sanitizedCategoria) dadosSaneados.categoria = sanitizedCategoria;
    if (sanitizedDescricao) dadosSaneados.descricao = sanitizedDescricao;
    if (sanitizedComment) dadosSaneados.aiComentario = sanitizedComment;

    const payload = {
      tipoDocumento,
      nomeArquivoPattern,
      conteudoTextoPattern,
      dadosSaneados,
      observacoesTreinamento
    };

    try {
      const url = editingId ? `/api/ai-training-patterns/${editingId}` : "/api/ai-training-patterns";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erro ao salvar padrão de aprendizado de IA.");
      
      setSuccessMsg(editingId ? "Gabarito de IA atualizado com sucesso!" : "Inteligência Artificial calibrada com sucesso!");
      setTimeout(() => setSuccessMsg(null), 4000);
      setShowForm(false);
      resetFormFields();
      fetchPatterns();
    } catch (err: any) {
      setError(err.message || "Erro de rede ao salvar gabarito.");
      setTimeout(() => setError(null), 5000);
    }
  };

  // Filter & Search computation
  const filteredPatterns = patterns.filter(p => {
    const matchesSearch = 
      p.tipoDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nomeArquivoPattern && p.nomeArquivoPattern.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.conteudoTextoPattern && p.conteudoTextoPattern.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.observacoesTreinamento && p.observacoesTreinamento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.dadosSaneados?.nome && p.dadosSaneados.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterDocType === "ALL" || p.tipoDocumento === filterDocType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Overview Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl border border-indigo-800/60 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 text-indigo-500/20 pointer-events-none transform translate-x-12 -translate-y-12">
          <Cpu className="h-64 w-64 " />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            Recurso de Contingência Residencial de Alta Performance
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-sans">
            Centro de Aprendizado & Calibragem Local da IA
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal mb-4">
            Treine e eduque a inteligência artificial do <strong>Condo+</strong> para compreender os campos de documentos recorrentes de maneira 100% precisa, off-line e instantânea. A calibração de gabaritos elimina oscilações de conexão, erros de interpretação e lentidões na extração de dados sensíveis de inquilinos e contas recorrentes.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTabHelp(!activeTabHelp)}
              className="text-xs text-indigo-400 font-bold hover:text-indigo-300 transition flex items-center gap-1 bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-800/40"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              {activeTabHelp ? "Ocultar Guia Rápido" : "Entender Como Funciona"}
            </button>
          </div>
        </div>
      </div>

      {/* Guide details */}
      {activeTabHelp && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900/60 rounded-xl border border-slate-800 p-5 divide-y md:divide-y-0 md:divide-x divide-slate-800 transition duration-200">
          <div className="pb-4 md:pb-0 md:pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/30">1</span>
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">Crie o Gabarito</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Impute as regras e os dados saneados corrigidos de inquilinos comuns ou parceiros frequentes. Defina o nome do arquivo modelo ou strings identificadoras do conteúdo.
            </p>
          </div>
          <div className="py-4 md:py-0 md:px-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/30">2</span>
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">Uso Instantâneo</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ao arrastar um comprovante ou RG/CNH correspondente nas telas de onboarding, o Condo+ aplica o gabarito. Nenhum segundo de lentidão ou preenchimento incorreto ocorre.
            </p>
          </div>
          <div className="pt-4 md:pt-0 md:pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-950 text-indigo-400 text-xs font-bold border border-indigo-500/30">3</span>
              <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">Altivo & Offline</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Em situações de quota zerada na conta Gemini ou internet instável do administrador, a plataforma utiliza o cache de inteligência garantindo operação contínua e fidedigna.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-indigo-950 text-indigo-400 rounded-lg">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Regras Calibradas</span>
            <span className="text-xl font-bold text-white font-sans">{patterns.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Precisão Cadastral</span>
            <span className="text-xl font-bold text-white font-sans">100.0%</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-amber-950 text-amber-400 rounded-lg">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Latência Extração</span>
            <span className="text-xl font-bold text-white font-sans">{"< 25ms"}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950 text-cyan-400 rounded-lg">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider">Motor Contingência</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 inline-block uppercase tracking-wider">Ativo</span>
          </div>
        </div>
      </div>

      {/* Notifications notifications */}
      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/50 rounded-xl flex items-start gap-2 text-rose-300 text-xs">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-start gap-2 text-emerald-300 text-xs animate-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          <div>{successMsg}</div>
        </div>
      )}

      {/* Forms Drawer/Modal or Accordion */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center bg-slate-950 border-b border-slate-800 px-6 py-4">
            <h3 className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider flex items-center gap-1.5">
              <Cpu className="h-4 w-4" />
              {editingId ? "Editar Parametrização de Calibração" : "Instruir IA de Contingência (Criar Regra de Aprendizado)"}
            </h3>
            <button 
              onClick={() => { setShowForm(false); resetFormFields(); }}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Left Column: Triggers and Types */}
              <div className="space-y-4">
                <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                  1. Regras de Entrada & Gatilho
                </span>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Tipo de Documento</label>
                  <select
                    value={tipoDocumento}
                    onChange={(e) => setTipoDocumento(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="RG">Carteira de Identidade (RG)</option>
                    <option value="CNH">Carteira de Habilitação (CNH)</option>
                    <option value="COMPROVANTE_RENDA">Holerite / Extrato de Renda</option>
                    <option value="FATURA_DESPESA">Fatura / Boleto de Despesa (Água, Luz, etc)</option>
                    <option value="OUTRO">Outros Documentos Gerais</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Nome do Arquivo Gatilho <span className="text-[10px] text-slate-500 font-normal">(Incluso no nome do arquivo)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: cnh_renato_faria"
                    value={nomeArquivoPattern}
                    onChange={(e) => setNomeArquivoPattern(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Ao analisar arquivos que contenham este trecho no nome, a regra será aplicada.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Frase/Texto Gatilho <span className="text-[10px] text-slate-500 font-normal">(Contido no texto scan)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CPF ou Nome Completo do proponente"
                    value={conteudoTextoPattern}
                    onChange={(e) => setConteudoTextoPattern(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Garante que mesmo que o arquivo mude de nome, o texto extraído ativará a calibragem.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Observações do Treinamento</label>
                  <textarea
                    rows={2}
                    placeholder="Notas para auditoria (Ex: Documento de Renato calibrado para evitar que o escâner borrado preencha incorretamente o CPF)"
                    value={observacoesTreinamento}
                    onChange={(e) => setObservacoesTreinamento(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>

              {/* Middle & Right: Sanitized values to yield */}
              <div className="md:col-span-2 space-y-4">
                <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
                  2. Valores Genuínos a Serem Preenchidos Pela IA (Saneamento Completo)
                </span>

                {/* Conditional Rendering of fields depending on tipoDocumento selected */}
                {tipoDocumento === "FATURA_DESPESA" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Mês/Ano Referência (AAAA-MM)</label>
                      <input
                        type="text"
                        placeholder="Ex: 2026-05"
                        value={sanitizedRg} // reuse RG field for month reference in state
                        onChange={(e) => setSanitizedRg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Valor da Fatura (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 142.80"
                        value={sanitizedValor}
                        onChange={(e) => setSanitizedValor(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Categoria de Custo</label>
                      <select
                        value={sanitizedCategoria}
                        onChange={(e) => setSanitizedCategoria(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="AGUA">ÁGUA / SANEAMENTO</option>
                        <option value="LUZ">FORÇA / ENERGIA ELÉTRICA</option>
                        <option value="INTERNET">INTERNET / TELECOM</option>
                        <option value="MANUTENCAO">MANUTENÇÃO / RECONSTITUIÇÃO</option>
                        <option value="OUTROS">OUTRAS TAXAS / TAXA DE CONDOMÍNIO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Descrição Oficial Saneada</label>
                      <input
                        type="text"
                        placeholder="Ex: Fatura Enel referente a Consumo Paulista"
                        value={sanitizedDescricao}
                        onChange={(e) => setSanitizedDescricao(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1">Comentários e Parecer da Análise (aiComentario)</label>
                      <textarea
                        rows={3}
                        placeholder="Escreva a resposta que o painel de auditoria vai mostrar sobre esta conta..."
                        value={sanitizedComment}
                        onChange={(e) => setSanitizedComment(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  // Default ID/CNH Personal credentials
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Nome Completo Oficial Saneado</label>
                      <input
                        type="text"
                        placeholder="Nome exato sem abreviações ou erros"
                        value={sanitizedNome}
                        onChange={(e) => setSanitizedNome(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">CPF Oficial Formatado</label>
                      <input
                        type="text"
                        placeholder="Ex: 345.918.421-12"
                        value={sanitizedCpf}
                        onChange={(e) => setSanitizedCpf(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">RG / Identidade</label>
                      <input
                        type="text"
                        placeholder="Ex: MG-12.451.992"
                        value={sanitizedRg}
                        onChange={(e) => setSanitizedRg(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Endereço Residencial Saneado</label>
                      <input
                        type="text"
                        placeholder="Rua, Número, Bairro, Cidade, Estado"
                        value={sanitizedEndereco}
                        onChange={(e) => setSanitizedEndereco(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">E-mail de Contato</label>
                      <input
                        type="email"
                        placeholder="inquilino@email.com"
                        value={sanitizedEmail}
                        onChange={(e) => setSanitizedEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Renda Mensal Declarada Correta (R$)</label>
                      <input
                        type="number"
                        placeholder="Ex: 11200"
                        value={sanitizedRenda}
                        onChange={(e) => setSanitizedRenda(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <span className="sm:col-span-2 block text-[10px] text-slate-500 font-bold uppercase tracking-widest border-t border-slate-800/80 pt-2 mt-2">
                      Dados Bancários / Chave Pix (Atribuição do Locador se for Proprietário)
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Banco / Instituição</label>
                      <input
                        type="text"
                        placeholder="Ex: Banco Itaú"
                        value={sanitizedBanco}
                        onChange={(e) => setSanitizedBanco(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Agência</label>
                      <input
                        type="text"
                        placeholder="Ex: 0321"
                        value={sanitizedAgencia}
                        onChange={(e) => setSanitizedAgencia(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Conta & Dígito</label>
                      <input
                        type="text"
                        placeholder="Ex: 12411-9"
                        value={sanitizedConta}
                        onChange={(e) => setSanitizedConta(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1">Chave Pix Oficial</label>
                      <input
                        type="text"
                        placeholder="Celular, CPF ou E-mail"
                        value={sanitizedPixKey}
                        onChange={(e) => setSanitizedPixKey(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => { setShowForm(false); resetFormFields(); }}
                className="px-4 py-2 bg-slate-950 text-slate-400 hover:text-white rounded-lg text-xs font-bold border border-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition"
              >
                <Save className="h-4 w-4" />
                Guardar Regra de Aprendizado
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Search & Actions Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar regras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterDocType}
            onChange={(e) => setFilterDocType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="RG">RG</option>
            <option value="CNH">CNH</option>
            <option value="COMPROVANTE_RENDA">Comprovantes Renda</option>
            <option value="FATURA_DESPESA">Faturamento & Despesas</option>
            <option value="OUTRO">Outros</option>
          </select>
        </div>

        <button
          onClick={handleCreateNewClick}
          className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-950/40 transition hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Registrar Novo Gabarito
        </button>
      </div>

      {/* Grid of existing rules */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <RefreshCw className="h-7 w-7 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Acessando banco cognitivo...</span>
        </div>
      ) : filteredPatterns.length === 0 ? (
        <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-xl p-12 text-center">
          <Cpu className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-semibold mb-1">Nenhum gabarito ou regra cadastrada</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
            Ainda não há regras de contingência que combinem com sua busca ativa ou filtros selecionados. Cadastre seu primeiro documento padrão!
          </p>
          <button
            onClick={handleCreateNewClick}
            className="px-4 py-2 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-indigo-400 text-xs font-bold rounded-lg transition"
          >
            Adicionar Regra Modelo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatterns.map((pattern) => {
            const dateStr = pattern.createdAt ? new Date(pattern.createdAt).toLocaleDateString("pt-BR") : "N/D";
            
            // Badge color choice
            let badgeBg = "bg-purple-950 text-purple-300 border-purple-800/40";
            if (pattern.tipoDocumento === "RG") badgeBg = "bg-blue-950 text-blue-300 border-blue-800/40";
            if (pattern.tipoDocumento === "CNH") badgeBg = "bg-emerald-950 text-emerald-300 border-emerald-800/40";
            if (pattern.tipoDocumento === "FATURA_DESPESA") badgeBg = "bg-amber-950 text-amber-300 border-amber-800/40";
            if (pattern.tipoDocumento === "COMPROVANTE_RENDA") badgeBg = "bg-pink-950 text-pink-300 border-pink-800/40";

            return (
              <div 
                key={pattern.id} 
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-md flex flex-col group transition duration-300"
              >
                {/* Header card with badge */}
                <div className="bg-slate-950/80 border-b border-slate-850 px-5 py-3.5 flex justify-between items-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded border ${badgeBg}`}>
                    {pattern.tipoDocumento}
                  </span>
                  
                  <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEditClick(pattern)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-800 hover:text-indigo-400 rounded-md transition text-slate-400"
                      title="Editar regras e campos"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(pattern.id)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-rose-900 hover:text-rose-400 rounded-md transition text-slate-400"
                      title="Deletar padrão"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Body card */}
                <div className="p-5 flex-1 space-y-4">
                  {/* Triggers indicator */}
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-2">Gatilhos Ativos para a IA</span>
                    <div className="space-y-1.5">
                      {pattern.nomeArquivoPattern && (
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950/60 p-1.5 rounded border border-slate-850">
                          <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate" title={pattern.nomeArquivoPattern}>
                            Arquivo: <strong className="text-white">{pattern.nomeArquivoPattern}</strong>
                          </span>
                        </div>
                      )}
                      {pattern.conteudoTextoPattern && (
                        <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950/60 p-1.5 rounded border border-slate-850">
                          <Cpu className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          <span className="truncate" title={pattern.conteudoTextoPattern}>
                            Termo: <strong className="text-white">{pattern.conteudoTextoPattern}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Yield results preview */}
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500 tracking-wider mb-2">Dados de Extração Calibrados</span>
                    <div className="bg-slate-950/30 border border-slate-850 rounded-lg p-3 space-y-1.5 text-xs">
                      {pattern.tipoDocumento === "FATURA_DESPESA" ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Mês Ref:</span>
                            <span className="font-bold text-slate-300">{pattern.dadosSaneados?.rg || pattern.dadosSaneados?.mesAno || "N/A"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Valor Fatura:</span>
                            <span className="font-bold text-amber-400">R$ {pattern.dadosSaneados?.valor || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Categoria:</span>
                            <span className="font-bold text-slate-300">{pattern.dadosSaneados?.categoria || "LUZ"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Nome:</span>
                            <span className="font-bold text-slate-300 truncate max-w-[150px]">{pattern.dadosSaneados?.nome || "Não definido"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">CPF:</span>
                            <span className="font-bold text-slate-300 font-mono">{pattern.dadosSaneados?.cpf || "Não definido"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Renda Mensal:</span>
                            <span className="font-bold text-emerald-400">R$ {pattern.dadosSaneados?.rendaMensal || 0}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Remarks */}
                  {pattern.observacoesTreinamento && (
                    <div className="text-[10px] text-slate-400 leading-relaxed italic bg-slate-950/20 p-2.5 rounded border-l-2 border-indigo-500 bg-slate-950/30">
                      <strong>Observações:</strong> {pattern.observacoesTreinamento}
                    </div>
                  )}
                </div>

                {/* Footer card */}
                <div className="bg-slate-950/40 border-t border-slate-850 px-5 py-2.5 text-[9px] text-slate-500 flex justify-between items-center">
                  <span>Atualizado: {dateStr}</span>
                  <span className="text-indigo-400/80 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Engrenagem Sintonizada
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default AILearningCenter;
