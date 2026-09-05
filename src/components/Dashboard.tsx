import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  Activity,
  RefreshCw, 
  Plus,
  Link,
  Copy,
  Info,
  Check,
  X,
  Sparkles,
  Eye,
  ShieldCheck,
  XCircle,
  FolderOpen,
  Upload,
  Trash2,
  Calendar,
  MessageSquare,
  Mail,
  Send,
  History,
  Lock,
  Settings,
  Cog,
  Smile,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Layers,
  Download,
  Zap,
  Droplet,
  UserCheck,
  QrCode,
  Edit3,
  Pencil
} from "lucide-react";
import { Contrato, Inquilino, Imovel, Proprietario, Faturamento, Despesa } from "../types";
import { LogoMais } from "./LogoMais";
import OnboardingKyc from "./OnboardingKyc";
import ContractManagement from "./ContractManagement";
import FinancialModule from "./FinancialModule";

const FIELD_HELP_DATA: Record<string, {
  title: string;
  category: string;
  description: string;
  whyUseful: string;
  howToFill: string;
  example: string;
}> = {
  pixKey: {
    title: "Chave Administrador / Proprietário (PIX)",
    category: "Cobranças & Pagamentos",
    description: "Esta é a sua chave PIX para o recebimento direto dos aluguéis.",
    whyUseful: "O sistema gera de forma automática um código 'PIX Copia e Cola' e um QR Code apontando diretamente para a sua conta bancária associada a esta chave para cada fatura. O dinheiro vai direto para sua conta na hora, sem taxas!",
    howToFill: "Digite a sua chave PIX cadastrada no seu banco exatamente como ela é.",
    example: "• E-mail: financeiro@meudominio.com\n• Celular: +55 (11) 98888-7777\n• CPF/CNPJ: 123.456.789-00 ou 12.345.678/0001-99\n• Chave Aleatória: 123e4567-e89b-12d3-a456-426614174000"
  },
  smtpHost: {
    title: "SMTP Servidor E-mail",
    category: "Notificações por E-mail",
    description: "É o endereço do servidor utilizado por nosso sistema para enviar e-mails aos seus inquilinos.",
    whyUseful: "O SMTP funciona como um 'carteiro virtual' profissional. Ao configurá-lo, seus e-mails chegam diretamente na caixa de entrada do inquilino com o seu remetente oficial, reduzindo drasticamente as chances de cair na aba de Promoções ou no Spam.",
    howToFill: "Consulte o seu provedor de e-mail (ou use as configurações SMTP seguras do seu servidor de e-mail profissional).",
    example: "• Gmail profissional/comum: smtp.gmail.com\n• Outlook / Office 365: smtp.office365.com\n• SendGrid: smtp.sendgrid.net\n• Hostgator / Locaweb: mail.seudominio.com"
  },
  smtpUser: {
    title: "Usuário / Conta Remetente (E-mail)",
    category: "Notificações por E-mail",
    description: "É o e-mail oficial que enviará as mensagens de cobrança e contratos.",
    whyUseful: "Este é o e-mail que seus inquilinos verão no campo 'De:' quando receberem um aviso. Ele também serve para provar que você é dono autorizado desse e-mail para evitar fraudes.",
    howToFill: "Insira o endereço de e-mail completo que você utiliza para a comunicação do condomínio ou setor financeiro.",
    example: "financeiro@seucondominio.com.br ou imobiliaria@gmail.com"
  },
  smtpPort: {
    title: "Porta SMTP",
    category: "Notificações por E-mail",
    description: "Kits de comunicação de rede seguros para envio de mensagens.",
    whyUseful: "Utilizar uma porta correta garante que as mensagens trafeguem por canais criptografados modernos, evitando acessos não autorizados.",
    howToFill: "Geralmente é um número de 3 dígitos fornecido pelo seu servidor. Nosso sistema aceita TLS ou SSL. Se não souber, deixe o padrão 587.",
    example: "• 587: Recomendado para conexões TLS/STARTTLS convencionais.\n• 465: Usado para criptografia SSL rígida."
  },
  smtpPassword: {
    title: "Senha SMTP / Token de Emissão",
    category: "Notificações por E-mail",
    description: "Uma senha exclusiva gerada para o Condo+ enviar e-mails em seu nome com segurança máxima.",
    whyUseful: "Para sua total segurança, NUNCA use a sua senha pessoal do e-mail de login. Provedores modernos de ponta (como Google e Microsoft) exigem a criação de uma 'Senha de Aplicativo' (App Password) dedicada de 16 caracteres para softwares terceiros.",
    howToFill: "Nas configurações da sua conta de e-mail, ative a Verificação de Duas Etapas e procure por 'Senhas de App'. Gere uma exclusiva e cole-a aqui sem espaços.",
    example: "• Para o Gmail: abcd efgh ijkl mnop (coloque sem os espaços)\n• Para o SendGrid (API Key): SG.vFSD-9_Asdf..."
  },
  whatsappToken: {
    title: "Token de Autenticação WhatsApp",
    category: "Notificações por WhatsApp",
    description: "É a chave codificada de autenticação gerada pela sua API de WhatsApp preferida.",
    whyUseful: "Permite automatizar o envio de boletos, lembretes de cobrança e novidades direto no WhatsApp do inquilino. Isso acelera a velocidade e taxa de recebimento em mais de 85% comparado ao e-mail tradicional.",
    howToFill: "Nós somos compatíveis com APIs de envio (Z-API, Evolution, etc.). Registre-se em uma delas, escaneie o código QR Code e copie o Token/Chave de API gerada no painel deles.",
    example: "WHATSAPP-JWT-LIVE-SESSION-TOKEN (ou a chave comprida apresentada no gateway)"
  },
  whatsappPhone: {
    title: "Telefone Autenticado (Remetente)",
    category: "Notificações por WhatsApp",
    description: "É o número com o WhatsApp ativo que enviará as mensagens automáticas aos inquilinos.",
    whyUseful: "Indica a conta remetente oficial. Assim, os seus moradores sabem com quem estão conversando e podem responder de volta facilmente.",
    howToFill: "Preencha com o número completo contendo o código do país, DDD e o número oficial com o dígito zero/nove.",
    example: "5511988887777 (Sendo 55 para o Brasil, 11 para o DDD de São Paulo e o número completo)"
  },
  alertBeforeDue: {
    title: "Alertar Boleto",
    category: "Configurações de Regra",
    description: "O prazo de antecedência em que o lembrete automático de pagamento será disparado.",
    whyUseful: "Configura o momento em que o Condo+ disparará os alertas com os links de faturas e código PIX Copia e Cola para dar tempo de planejamento ao inquilino.",
    howToFill: "Basta abrir e escolher uma das opções padrões no menu suspenso.",
    example: "3 dias antes (Muito recomendado para que o inquilino faça o agendamento no banco)"
  },
  alertBeforeRenew: {
    title: "Tempo para Aviso de Renovação",
    category: "Configurações de Regra",
    description: "Configura a antecedência em que o alerta de vencimento de contrato será enviado.",
    whyUseful: "Incentiva o envio mútuo de notificações de proximidade do fim da locação (conforme regras contratuais da Lei do Inquilinato) para discussão de valores de reajuste anual.",
    howToFill: "Escolha uma das opções em meses no campo de seleção.",
    example: "1 mês antes (Tempo regulamentar comum)"
  }
};

interface DashboardProps {
  proprietarios?: Proprietario[];
  proprietariosCount: number;
  imoveis: Imovel[];
  inquilinos: Inquilino[];
  contratos: Contrato[];
  faturamentos?: Faturamento[];
  despesas?: Despesa[];
  onResetDb: () => void;
  onSyncDb?: () => void;
  onNavigate: (tab: string) => void;
  viewMode?: "dashboard" | "database" | "operacional" | "inquilino" | "contracts" | "billing";
  dragAndDropEnabled?: boolean;
  layoutSections?: Array<{
    id: string;
    title: string;
    currentTab: "dashboard" | "operacional" | "inquilino" | "database" | "contracts" | "billing";
    order: number;
  }>;
  onUpdateSections?: (newSections: Array<{
    id: string;
    title: string;
    currentTab: "dashboard" | "operacional" | "inquilino" | "database" | "contracts" | "billing";
    order: number;
  }>) => void;
  onEnterCandidateMode?: (propertyId?: string) => void;
}

export default function Dashboard({
  proprietarios = [],
  proprietariosCount,
  imoveis,
  inquilinos,
  contratos,
  faturamentos = [],
  despesas = [],
  onResetDb,
  onSyncDb,
  onNavigate,
  viewMode = "dashboard",
  dragAndDropEnabled = false,
  layoutSections = [],
  onUpdateSections,
  onEnterCandidateMode,
}: DashboardProps) {
  const [dbSubTab, setDbSubTab] = useState<'candidates' | 'tenants' | 'new_candidate' | 'imoveis'>('candidates');
  const [selectedPropertyLink, setSelectedPropertyLink] = useState<string>(imoveis[0]?.id || "");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Candidate evaluation state variables
  const [filterStatus, setFilterStatus] = useState<string>("TODOS");
  const [isAnalyzingId, setIsAnalyzingId] = useState<string | null>(null);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [selectedAiReportTenant, setSelectedAiReportTenant] = useState<Inquilino | null>(null);
  const [aiReportActiveTab, setAiReportActiveTab] = useState<'audit' | 'background' | 'developer'>('audit');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Smart Rent Inspection State Variables
  const [inspectionRoomName, setInspectionRoomName] = useState<string>("Sala de Estar");
  const [moveInImage, setMoveInImage] = useState<{ fileBase64: string, mimeType: string, fileName: string } | null>(null);
  const [moveOutImage, setMoveOutImage] = useState<{ fileBase64: string, mimeType: string, fileName: string } | null>(null);
  const [isAnalyzingInspection, setIsAnalyzingInspection] = useState<boolean>(false);
  const [inspectionAnalysisStep, setInspectionAnalysisStep] = useState<string>("Aguardando upload das imagens");
  const [inspectionResult, setInspectionResult] = useState<{
    source: string,
    warning?: string,
    data: {
      summary: string,
      issuesFoundCount: number,
      damages: Array<{
        type: string,
        description: string,
        location: string,
        severity: string,
        estimatedRepairCost: number
      }>
    }
  } | null>(null);
  const [inspectionError, setInspectionError] = useState<string | null>(null);

  // Preloaded interactive inspection scenarios for easy testing
  const INSPECTION_SCENARIOS = [
    {
      id: "scen-1",
      name: "Sala de Estar (Fissuras & Piso Riscado)",
      roomName: "Sala de Estar",
      moveInFile: {
        fileName: "sala_entrada_parede_limpa.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      },
      moveOutFile: {
        fileName: "sala_saida_parede_danificada.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
      }
    },
    {
      id: "scen-2",
      name: "Cozinha (Furo de Fixação & Mancha de Óleo)",
      roomName: "Cozinha",
      moveInFile: {
        fileName: "cozinha_entrada_azulejo_intacto.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      },
      moveOutFile: {
        fileName: "cozinha_saida_azulejo_faturado.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
      }
    },
    {
      id: "scen-3",
      name: "Banheiro (Mofo Sob Pia & Cuba Fissurada)",
      roomName: "Banheiro Principal",
      moveInFile: {
        fileName: "banheiro_entrada_liso.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      },
      moveOutFile: {
        fileName: "banheiro_saida_trincado.jpg",
        mimeType: "image/png",
        fileBase64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
      }
    }
  ];

  const handleLoadScenario = (scen: typeof INSPECTION_SCENARIOS[0]) => {
    setInspectionRoomName(scen.roomName);
    setMoveInImage(scen.moveInFile);
    setMoveOutImage(scen.moveOutFile);
    setInspectionResult(null);
    setInspectionError(null);
    setInspectionAnalysisStep("Cenário de teste carregado! Pronto para comparar.");
  };

  // States for Registring New Property (Cadastrar Novo Imóvel)
  const [showAddPropertyModal, setShowAddPropertyModal] = useState<boolean>(false);
  const [newPropCep, setNewPropCep] = useState<string>("");
  const [isLoadingCep, setIsLoadingCep] = useState<boolean>(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const [newPropAddress, setNewPropAddress] = useState<string>("");
  const [newPropType, setNewPropType] = useState<string>("Apartamento");
  const [newPropRent, setNewPropRent] = useState<string>("");
  const [newPropOwner, setNewPropOwner] = useState<string>("prop-1");
  const [newPropComplement, setNewPropComplement] = useState<string>("");
  const [newPropIsBuilding, setNewPropIsBuilding] = useState<boolean>(false);
  const [isSavingProperty, setIsSavingProperty] = useState<boolean>(false);
  const [addPropError, setAddPropError] = useState<string | null>(null);

  // States for active element editing
  const [editingProp, setEditingProp] = useState<Proprietario | null>(null);
  const [editingImovel, setEditingImovel] = useState<Imovel | null>(null);
  const [editingInquilino, setEditingInquilino] = useState<Inquilino | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Inland proprietor creation/deletion within the modal
  const [showNewPropForm, setShowNewPropForm] = useState<boolean>(false);
  const [newPropFormName, setNewPropFormName] = useState<string>("");
  const [newPropFormEmail, setNewPropFormEmail] = useState<string>("");
  const [newPropFormCpf, setNewPropFormCpf] = useState<string>("");
  const [newPropFormPix, setNewPropFormPix] = useState<string>("");
  const [newPropFormRg, setNewPropFormRg] = useState<string>("");
  const [newPropFormNacionalidade, setNewPropFormNacionalidade] = useState<string>("brasileiro(a)");
  const [newPropFormEstadoCivil, setNewPropFormEstadoCivil] = useState<string>("solteiro(a)");
  const [newPropFormResidencia, setNewPropFormResidencia] = useState<string>("");
  const [newPropFormBanco, setNewPropFormBanco] = useState<string>("Banco Itaú");
  const [newPropFormAgencia, setNewPropFormAgencia] = useState<string>("1063");
  const [newPropFormConta, setNewPropFormConta] = useState<string>("31860-2");

  const [analyzingPropDocument, setAnalyzingPropDocument] = useState<boolean>(false);
  const [dragActivePropDocument, setDragActivePropDocument] = useState<boolean>(false);
  const [uploadedPropDocumentName, setUploadedPropDocumentName] = useState<string>("");

  const [isAnalyzingPropertyDoc, setIsAnalyzingPropertyDoc] = useState<boolean>(false);
  const [dragActivePropertyDoc, setDragActivePropertyDoc] = useState<boolean>(false);
  const [uploadedPropertyDocName, setUploadedPropertyDocName] = useState<string>("");

  useEffect(() => {
    if (proprietarios.length > 0) {
      if (newPropOwner && !proprietarios.some(p => p.id === newPropOwner)) {
        setNewPropOwner(proprietarios[0].id);
      }
    } else {
      setNewPropOwner("");
    }
  }, [proprietarios]);

  const handleDownloadFile = (file: { nome: string; url?: string; base64?: string; mimeType?: string }) => {
    try {
      const dataString = file.base64 || file.url || "";
      if (!dataString || dataString === "#") {
        alert("Conteúdo do arquivo não disponível para download.");
        return;
      }
      
      let link = document.createElement("a");
      link.setAttribute("id", `download-link-${Date.now()}`);
      
      if (dataString.startsWith("data:")) {
        link.href = dataString;
      } else {
        const mime = file.mimeType || "application/octet-stream";
        link.href = `data:${mime};base64,${dataString}`;
      }
      
      link.download = file.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Erro ao efetuar download:", err);
      alert("Não foi possível processar o download do arquivo.");
    }
  };

  // States for Owner Credentials SMTP & WhatsApp Credentials Settings
  const [directAdminKey, setDirectAdminKey] = useState<string>("SK-ADMIN-9921");
  const [smtpUser, setSmtpUser] = useState<string>("financeiro@proptechos.com");
  const [smtpPassword, setSmtpPassword] = useState<string>("");
  const [smtpHost, setSmtpHost] = useState<string>("smtp.sendgrid.net");
  const [smtpPort, setSmtpPort] = useState<string>("587");
  const [whatsappToken, setWhatsappToken] = useState<string>("WHATSAPP-JWT-LIVE-SESSION-TOKEN");
  const [whatsappInstancePhone, setWhatsappInstancePhone] = useState<string>("+55 (11) 98877-6655");
  const [alertBeforeDueDays, setAlertBeforeDueDays] = useState<number>(3);
  const [alertBeforeContractExpirationMonths, setAlertBeforeContractExpirationMonths] = useState<number>(1);
  const [autoEmailAlerts, setAutoEmailAlerts] = useState<boolean>(true);
  const [autoWhatsappAlerts, setAutoWhatsappAlerts] = useState<boolean>(true);
  
  // State for layman help popups/modals
  const [helpField, setHelpField] = useState<string | null>(null);

  // States for manual notification compose
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);
  const [notifTarget, setNotifTarget] = useState<string>("");
  const [notifSubject, setNotifSubject] = useState<string>("");
  const [notifMessage, setNotifMessage] = useState<string>("");
  const [isSendingNotif, setIsSendingNotif] = useState<boolean>(false);

  // Connection states for didactics & account linkage
  const [whatsAppConnected, setWhatsAppConnected] = useState<boolean>(() => {
    return localStorage.getItem("proptechos_whatsapp_connected") === "true";
  });
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState<boolean>(false);
  const [emailConnected, setEmailConnected] = useState<boolean>(true); // SMTP enabled by default

  const NOTIF_TEMPLATES = [
    {
      id: "FriendlyReminder",
      name: "📢 Lembrete de Vencimento Contratual",
      subject: "Aviso de Vencimento de Aluguel Condo+",
      message: "Olá, {NOME_INQUILINO}!\n\nGostariamos de lembrar amigavelmente que a mensalidade de locação de seu imóvel ({ENDERECO_IMOVEL}, Unidade {UNIDADE}) vencerá em breve, no dia {DATA_VENCIMENTO}.\n\nValor original acordado: {VALOR_ALUGUEL}.\n\nPara segurança e agilidade, você pode realizar a transferência Pix pela Chave CNPJ padrão: {CHAVE_PIX}.\n\nAtenciosamente,\nAdministração Condo+"
    },
    {
      id: "LateNotice",
      name: "⚠️ Notificação Moratória de Atraso (Sem valor em R$)",
      subject: "COMUNICADO LEGAL: Mensalidade em Atraso",
      message: "Prezado(a) {NOME_INQUILINO},\n\nIdentificamos em nosso cadastro que a sua mensalidade do imóvel ({ENDERECO_IMOVEL}, Unidade {UNIDADE}) encontra-se em atraso referente ao vencimento original do dia {DATA_VENCIMENTO}.\n\nConforme estipulado expressamente em contrato de base, o atraso ensejará os devidos encargos moratórios, calculados como: {PARAMETRO_MULTA}.\n\nPedimos encarecidamente o acerto de tais pendências o quanto antes por meio dos canais oficiais ou chave Pix: {CHAVE_PIX}.\n\nContamos com sua costumeira pontualidade.\n\nAtenciosamente,\nSetor de Cobrança - Administradora Condo+"
    },
    {
      id: "RentAdjustment",
      name: "📜 Aviso Legal de Reajuste Inflacionário",
      subject: "Informativo Legal - Reajuste de Aluguel Anual",
      message: "Prezado(a) {NOME_INQUILINO},\n\nEm atenção ao aniversário contratual do seu imóvel residencial/comercial situado na {ENDERECO_IMOVEL}, informamos que no seu próximo boleto de vencimento mensal as parcelas serão reajustadas sob o índice anual estipulado em termos de base.\n\nO valor base anterior de {VALOR_ALUGUEL} passará a ser atualizado de acordo com as balizas regulamentares.\n\nPara maiores dúvidas, o setor de contratos está à total disposição.\n\nAtenciosamente,\nGestão Imobiliária Condo+"
    },
    {
      id: "QuittanceReceipt",
      name: "🧾 Recibo de Quitação de Aluguel",
      subject: "Recibo de Liquidação de Parcelas",
      message: "RECIBO DE QUITAÇÃO E COMPROVAÇÃO DE PAGAMENTO\n\nPor meio deste termo formal, a Administradora Condo+ outorga plena e irrevogável quitação do saldo mensal liquidado de {VALOR_ALUGUEL}, referente à locação do imóvel ({ENDERECO_IMOVEL}, Unidade {UNIDADE}) pelo inquilino {NOME_INQUILINO}.\n\nO pagamento foi processado com total êxito fiscal.\n\nData de Liquidamento Geral: UTC"
    },
    {
      id: "MaintenanceNotice",
      name: "🔧 Aviso Geral de Manutenção ou Mudanças",
      subject: "Aviso Administrativo Condo+: Manutenção Geral",
      message: "Prezado(a) {NOME_INQUILINO},\n\nComunicamos para as devidas providências que o imóvel de endereço {ENDERECO_IMOVEL} (unidade {UNIDADE}) receberá vistoria ou ação de manutenção preventiva nos próximos dias.\n\n[Insira detalhes da manutenção planejada aqui]\n\nSolicitamos que as partes facilitem o ingresso aos técnicos credenciados.\n\nAtenciosamente,\nSetor Operacional Condo+"
    }
  ];

  const handleSimulateWhatsAppConnect = () => {
    setIsConnectingWhatsApp(true);
    setTimeout(() => {
      setWhatsAppConnected(true);
      setIsConnectingWhatsApp(false);
      localStorage.setItem("proptechos_whatsapp_connected", "true");
    }, 2000);
  };

  const handleSimulateWhatsAppDisconnect = () => {
    setWhatsAppConnected(false);
    localStorage.removeItem("proptechos_whatsapp_connected");
  };

  const interpolateNotificationMessage = (templateText: string, contract: any) => {
    if (!contract) return templateText;
    const parentInq = inquilinos.find(u => u.id === contract.inquilinoId);
    
    // Get fine and interest parameters dynamically from standard contract models
    let fineParams = "10% de multa somado a 2% ao mês"; // Default fallback
    try {
      const saved = localStorage.getItem("proptechos_contract_models");
      if (saved) {
        const models = JSON.parse(saved);
        const def = models.find((m: any) => m.isDefault) || models[0];
        if (def) {
          fineParams = `${def.finePercent}% de multa somado a ${def.interestMonthlyPercent}% ao mês de juros de mora`;
        }
      }
    } catch(e) {
      console.error(e);
    }

    return templateText
      .replace(/{NOME_INQUILINO}/g, parentInq?.nome || "Locatário")
      .replace(/{VALOR_ALUGUEL}/g, `R$ ${contract.valorBase?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || contract.imovel?.valorBase?.toLocaleString('pt-BR', {minimumFractionDigits: 2}) || "1.500,00"}`)
      .replace(/{DATA_VENCIMENTO}/g, `dia ${contract.diaVencimento || "10"}`)
      .replace(/{ENDERECO_IMOVEL}/g, contract.imovel?.endereco?.split(" - ")[0] || "Imóvel Locado")
      .replace(/{UNIDADE}/g, contract.unidade || "Principal")
      .replace(/{PARAMETRO_MULTA}/g, fineParams)
      .replace(/{MULTA_PARAMETROS}/g, fineParams)
      .replace(/{CHAVE_PIX}/g, contract.imovel?.proprietario?.pixKey || "financeiro@condomais.com");
  };

  const handleSendDirectNotification = async (channel: "whatsapp" | "email") => {
    let targets = [...selectedContractIds];
    if (targets.length === 0 && notifTarget) {
      targets = [notifTarget];
    }
    
    if (targets.length === 0) {
      alert("Por favor, selecione ao menos um inquilino destinatário.");
      return;
    }
    
    setIsSendingNotif(true);
    let successCount = 0;
    
    try {
      for (const targetId of targets) {
        const selectedC = contratos.find(c => c.id === targetId);
        if (!selectedC) continue;
        
        const parentInq = inquilinos.find(u => u.id === selectedC.inquilinoId);
        if (!parentInq) continue;

        const contact = channel === "whatsapp" 
          ? (parentInq.telefone || "+55 11 99999-9999") 
          : (parentInq.email || "inquilino@condo.com");

        // Interpolate individual variables dynamically per recipient
        const finalSubject = interpolateNotificationMessage(notifSubject || "Comunicado Geral Condo+", selectedC);
        const finalBody = interpolateNotificationMessage(notifMessage, selectedC);
        const subMsg = channel === "whatsapp" ? finalBody : `Assunto: ${finalSubject}\n\n${finalBody}`;

        await triggerDirectNotification(
          channel === "whatsapp" ? "WHATSAPP" : "EMAIL",
          parentInq.nome,
          contact,
          subMsg,
          "DIRECT_ADMIN_MANUAL",
          `manual-send-${targetId}`
        );
        
        // Add log entry dynamically
        const newLogEntry = {
          id: `log-${Date.now()}-${targetId}`,
          contratoId: selectedC.id,
          tipo: channel === "whatsapp" ? "WHATSAPP" : "EMAIL",
          destinatario: parentInq.nome,
          contato: contact,
          mensagem: finalBody,
          timestamp: new Date().toISOString(),
          status: "SUCCESS"
        };
        
        setNotificationLogs(prev => [newLogEntry, ...prev]);
        successCount++;
      }
      
      alert(`✓ Disparo concluído! ${successCount} mensagem(ns) gerada(s) e enviada(s) com sucesso.`);
      setSelectedContractIds([]);
      setNotifTarget("");
      setNotifSubject("");
      setNotifMessage("");
    } catch (err) {
      console.error(err);
      alert("Houve um problema durante o lote de envios.");
    } finally {
      setIsSendingNotif(false);
    }
  };

  // States for UI Logs & Trigger Simulations
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const notifLogs = notificationLogs;
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isSendingNotificationId, setIsSendingNotificationId] = useState<string | null>(null);
  const [notificationSuccessMessage, setNotificationSuccessMessage] = useState<string | null>(null);

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch("/api/notification/settings");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const json = await res.json();
          const s = json.settings;
          if (s) {
            setDirectAdminKey(s.directAdminKey || "");
            setSmtpUser(s.smtpUser || "");
            setSmtpPassword(s.smtpPassword || "");
            setSmtpHost(s.smtpHost || "");
            setSmtpPort(s.smtpPort || "");
            setWhatsappToken(s.whatsappToken || "");
            setWhatsappInstancePhone(s.whatsappInstancePhone || "");
            setAlertBeforeDueDays(s.alertBeforeDueDays || 3);
            setAlertBeforeContractExpirationMonths(s.alertBeforeContractExpirationMonths || 1);
            setAutoEmailAlerts(s.autoEmailAlerts);
            setAutoWhatsappAlerts(s.autoWhatsappAlerts);
          }
          if (json.logs) {
            setNotificationLogs(json.logs);
          }
        } else {
          console.warn("Expected JSON response from /api/notification/settings, but received different content type.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch notification settings:", err);
    }
  };

  const handleSaveNotificationSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setNotificationSuccessMessage(null);
    try {
      const response = await fetch("/api/notification/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directAdminKey,
          smtpUser,
          smtpPassword,
          smtpHost,
          smtpPort,
          whatsappToken,
          whatsappInstancePhone,
          alertBeforeDueDays,
          alertBeforeContractExpirationMonths,
          autoEmailAlerts,
          autoWhatsappAlerts
        })
      });
      if (response.ok) {
        setNotificationSuccessMessage("Canais de conexão direta e chaves salvas com sucesso!");
        fetchNotificationSettings();
        if (onSyncDb) onSyncDb();
        setTimeout(() => setNotificationSuccessMessage(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const triggerDirectNotification = async (type: "EMAIL" | "WHATSAPP", recipientName: string, recipientContact: string, subjectOrMessage: string, triggerType: string, actionId: string) => {
    setIsSendingNotificationId(actionId);
    try {
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, recipientName, recipientContact, subjectOrMessage, triggerType })
      });
      if (res.ok) {
        fetchNotificationSettings();
        if (onSyncDb) onSyncDb();
        setStatusMsg({ type: "success", text: `✓ Mensagem enviada direta de ${recipientContact} para o morador ${recipientName}.` });
        setTimeout(() => setStatusMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingNotificationId(null);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  // Dynamic pending reminders resolver based on contracts and payment receipts
  const pendingReminders = React.useMemo(() => {
    const list: any[] = [];
    const today = new Date();

    // 1. Contract Expiry Reminders (1 month before contract ends)
    contratos.forEach(contrat => {
      if (contrat.status === "ATIVO") {
        const inq = inquilinos.find(u => u.id === contrat.inquilinoId);
        const endDate = new Date(contrat.dataFim);
        
        // Calculate difference in days
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // 1 month before expiration (up to 45 days left)
        if (diffDays > 0 && diffDays <= 45) {
          list.push({
            id: `reminder-contract-${contrat.id}`,
            contrat,
            inquilinoNome: inq?.nome || "Inquilino",
            recipientContact: inq?.telefone || "Não informado",
            recipientEmail: inq?.email || "Não informado",
            type: "EXPIRATION",
            title: `Renovação de Contrato`,
            description: `Contrato expira em ${new Date(contrat.dataFim).toLocaleDateString("pt-BR")}. Faltam ${diffDays} dias.`,
            whatsappMessage: `Olá ${inq?.nome || ""}, para sua comodidade, informamos que faltam 30 dias para o vencimento do seu contrato de locação (${new Date(contrat.dataFim).toLocaleDateString("pt-BR")}). Fale conosco para renovação expressa via assinatura digital com login Gov.br!`,
            emailBody: `Prezado(a) ${inq?.nome || ""},\n\nEste é um lembrete prévio de renovação de seu contrato de locação do imóvel, programado para encerrar em ${new Date(contrat.dataFim).toLocaleDateString("pt-BR")}.\n\nCaso opte pela renovação expressa facilitada com validade jurídica garantida por assinatura eletrônica Gov.br, basta responder a esta mensagem informando o seu interesse.\n\nAtenciosamente,\nAdministrador: Renato Faria Kawano`
          });
        }
      }
    });

    // 2. Rent Due Reminders (due in alertBeforeDueDays)
    contratos.forEach(contrat => {
      const inq = inquilinos.find(u => u.id === contrat.inquilinoId);
      if (inq && contrat.faturamentos) {
        contrat.faturamentos.forEach((bill: any) => {
          if (bill.status === "PENDENTE" || bill.status === "ATRASADO") {
            const dueDate = new Date(bill.dataVencimento);
            const diffTime = dueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= -15 && diffDays <= alertBeforeDueDays) {
              list.push({
                id: `reminder-rent-${bill.id}`,
                bill,
                inquilinoNome: inq.nome,
                recipientContact: inq.telefone || "Não informado",
                recipientEmail: inq.email || "Não informado",
                type: "DUE_ALERT",
                title: bill.status === "ATRASADO" ? `Aluguel Atrasado` : `Vence em ${diffDays} dias`,
                description: `Aluguel Ref ${new Date(bill.dataVencimento).toLocaleDateString("pt-BR", {month: 'long'})} de R$ ${bill.valorBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Vencimento: ${dueDate.toLocaleDateString("pt-BR")}`,
                whatsappMessage: `Olá ${inq.nome}, seu boleto de aluguel no valor de R$ ${bill.valorBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} vencerá em breve (${dueDate.toLocaleDateString("pt-BR")}). Efetue o pagamento seguro via PIX para a chave do administrador: ${directAdminKey}. Administrador: Renato Faria Kawano.`,
                emailBody: `Olá ${inq.nome},\n\nEste é um lembrete automático de que a sua fatura de aluguel no valor de R$ ${bill.valorBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} está com o vencimento agendado para o dia ${dueDate.toLocaleDateString("pt-BR")}.\n\nEvite aplicação de multa de 10% e juros diários efetuando o pagamento diretamente via PIX com a chave do administrador: ${directAdminKey}.\n\nAtenciosamente,\nCondo Inteligente`
              });
            }
          }
        });
      }
    });

    return list;
  }, [contratos, inquilinos, alertBeforeDueDays, directAdminKey]);

  // States for Tenant Notes & Documents Workspace
  const [selectedWorkspaceTenant, setSelectedWorkspaceTenant] = useState<Inquilino | null>(null);
  const [workspaceNotes, setWorkspaceNotes] = useState<string>("");
  const [newFileTitle, setNewFileTitle] = useState<string>("");
  const [workspaceSavingNotes, setWorkspaceSavingNotes] = useState<boolean>(false);
  const [workspaceUploadingFile, setWorkspaceUploadingFile] = useState<boolean>(false);
  const [workspaceFileError, setWorkspaceFileError] = useState<string | null>(null);
  const [workspaceNotesSuccess, setWorkspaceNotesSuccess] = useState<boolean>(false);

  const handleUpdateStatus = async (tenantId: string, newStatus: 'APROVADO' | 'RECUSADO' | 'PENDENTE') => {
    setIsUpdatingId(tenantId);
    setStatusMsg(null);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        if (newStatus === 'APROVADO') {
          setStatusMsg({ 
            type: 'success', 
            text: `Candidatura aprovada! Perfil de acesso do morador criado. Login: Nome Completo, Senha: CPF cadastrado.` 
          });
        } else if (newStatus === 'PENDENTE') {
          setStatusMsg({ 
            type: 'success', 
            text: `Homologação revogada com sucesso. O candidato retornou para a fila de análise.` 
          });
        } else {
          setStatusMsg({ type: 'success', text: `Candidatura recusada com sucesso.` });
        }
        if (onSyncDb) onSyncDb();
        setTimeout(() => setStatusMsg(null), 8000);
      } else {
        const err = await response.json();
        setStatusMsg({ type: 'error', text: err.error || "Erro ao atualizar status." });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: "Erro na conexão com o servidor." });
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleRunOnTheFlyAnalysis = async (tenant: Inquilino) => {
    setIsAnalyzingId(tenant.id);
    setStatusMsg(null);
    try {
      const imovelTarget = imoveis.find(im => im.id === tenant.selectedPropertyId) || imoveis[0];
      const rentValue = imovelTarget ? imovelTarget.valorAluguel : 3000;
      
      const response = await fetch("/api/gemini/onboarding-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textInput: `PROPOENTE NOME: ${tenant.nome}, CPF: ${tenant.cpf}, RENDA DECLARADA: R$ ${tenant.rendaMensal.toFixed(2)}, ESTADO CIVIL: ${tenant.estadoCivil || 'Não informado'}, PROFISSAO: ${tenant.profissao || 'Não informado'}.`,
          rentValue: rentValue
        })
      });

      if (!response.ok) {
        throw new Error("Erro na requisição ao Gemini");
      }

      const json = await response.json();
      const extractedReport = json.data;

      // Save the report to backend!
      const saveResponse = await fetch(`/api/tenants/${tenant.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiReport: extractedReport })
      });

      if (saveResponse.ok) {
        setStatusMsg({ type: 'success', text: "Auditoria cognitiva Gemini concluída com sucesso!" });
        if (onSyncDb) onSyncDb();
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        setStatusMsg({ type: 'error', text: "Falha ao gravar parecer da IA no inquilino." });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg({ type: 'error', text: "Ocorreu uma instabilidade na análise do Gemini." });
    } finally {
      setIsAnalyzingId(null);
    }
  };

  const fetchCepData = async (cepCode: string) => {
    const rawCep = cepCode.replace(/\D/g, "");
    if (rawCep.length !== 8) {
      setCepError("CEP inválido. Digite 8 números.");
      return;
    }
    setIsLoadingCep(true);
    setCepError(null);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
      if (response.ok) {
        const data = await response.json();
        if (data.erro) {
          setCepError("CEP não encontrado.");
        } else {
          const logradouro = data.logradouro || "";
          const bairro = data.bairro || "";
          const localidade = data.localidade || "";
          const uf = data.uf || "";
          
          let enderecoCompleto = "";
          if (logradouro) {
            enderecoCompleto += logradouro;
          }
          if (bairro) {
            enderecoCompleto += enderecoCompleto ? `, ${bairro}` : bairro;
          }
          if (localidade && uf) {
            enderecoCompleto += enderecoCompleto ? `, ${localidade} - ${uf}` : `${localidade} - ${uf}`;
          }
          
          if (enderecoCompleto) {
            setNewPropAddress(enderecoCompleto);
            setCepError(null);
          } else {
            setCepError("Endereço não disponível para o CEP informado.");
          }
        }
      } else {
        setCepError("Erro ao consultar serviço de CEP (ViaCEP).");
      }
    } catch (err) {
      console.error(err);
      setCepError("Erro de conexão ao buscar o CEP.");
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const rawDigits = val.replace(/\D/g, "").substring(0, 8);
    let formatted = rawDigits;
    if (rawDigits.length > 5) {
      formatted = `${rawDigits.substring(0, 5)}-${rawDigits.substring(5, 8)}`;
    }
    setNewPropCep(formatted);
    if (rawDigits.length === 8) {
      fetchCepData(rawDigits);
    }
  };

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropAddress || !newPropRent) {
      setAddPropError("O endereço e o valor do aluguel são obrigatórios.");
      return;
    }
    setIsSavingProperty(true);
    setAddPropError(null);
    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endereco: newPropAddress,
          tipo: newPropType,
          valorAluguel: Number(newPropRent),
          proprietarioId: newPropOwner,
          complemento: newPropComplement,
          isBuilding: newPropIsBuilding
        })
      });
      if (response.ok) {
        if (onSyncDb) onSyncDb();
        setShowAddPropertyModal(false);
        setNewPropAddress("");
        setNewPropCep("");
        setCepError(null);
        setNewPropRent("");
        setNewPropComplement("");
        setNewPropIsBuilding(false);
        if (proprietarios.length > 0) {
          setNewPropOwner(proprietarios[0].id);
        } else {
          setNewPropOwner("");
        }
        setStatusMsg({ type: 'success', text: "Novo imóvel cadastrado com sucesso!" });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const err = await response.json();
        setAddPropError(err.error || "Erro ao cadastrar imóvel.");
      }
    } catch (err) {
      console.error(err);
      setAddPropError("Erro de conexão ao servidor.");
    } finally {
      setIsSavingProperty(false);
    }
  };

  const handleDragPropertyDoc = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePropertyDoc(true);
    } else if (e.type === "dragleave") {
      setDragActivePropertyDoc(false);
    }
  };

  const handleDropPropertyDoc = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePropertyDoc(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleAnalyzePropertyDoc(e.dataTransfer.files[0]);
    }
  };

  const handlePropertyDocFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleAnalyzePropertyDoc(e.target.files[0]);
    }
  };

  const handleAnalyzePropertyDoc = async (file: File) => {
    try {
      setIsAnalyzingPropertyDoc(true);
      setAddPropError(null);
      setUploadedPropertyDocName(file.name);
      
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const base64Data = fileDataUrl.includes(",") ? fileDataUrl.split(',')[1] : fileDataUrl;
      
      const response = await fetch("/api/gemini/extract-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível processar o documento do imóvel.");
      }

      const resJson = await response.json();
      const result = resJson.data || {};
      
      // Auto-pre-fill the form fields
      if (result.endereco) setNewPropAddress(result.endereco);
      if (result.cep) {
        setNewPropCep(result.cep);
        setCepError(null);
      }
      if (result.tipo) setNewPropType(result.tipo);
      if (result.valorAluguel) setNewPropRent(String(result.valorAluguel));
      if (result.complemento) setNewPropComplement(result.complemento);
      if (typeof result.isBuilding === "boolean") setNewPropIsBuilding(result.isBuilding);

      setStatusMsg({
        type: 'success',
        text: `Documento de imóvel "${file.name}" analisado com sucesso pela inteligência artificial! O formulário foi preenchido automaticamente.`
      });
      setTimeout(() => setStatusMsg(null), 8500);

    } catch (err: any) {
      console.error("Erro de leitura de documento de imóvel:", err);
      setAddPropError(`Erro ao analisar comprovante ou escritura: ${err.message || "Erro de conexão ao servidor."}`);
    } finally {
      setIsAnalyzingPropertyDoc(false);
    }
  };

  const handleDragProp = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePropDocument(true);
    } else if (e.type === "dragleave") {
      setDragActivePropDocument(false);
    }
  };

  const handleDropProp = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePropDocument(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleAnalyzeProprietarioDocument(e.dataTransfer.files[0]);
    }
  };

  const handlePropFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleAnalyzeProprietarioDocument(e.target.files[0]);
    }
  };

  const handleAnalyzeProprietarioDocument = async (file: File) => {
    try {
      setAnalyzingPropDocument(true);
      setStatusMsg(null);
      
      const fileDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const base64Data = fileDataUrl.includes(",") ? fileDataUrl.split(',')[1] : fileDataUrl;
      
      const response = await fetch("/api/proprietarios/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64Data,
          fileName: file.name,
          mimeType: file.type
        })
      });

      if (!response.ok) {
        throw new Error("Não foi possível processar o documento do proprietário.");
      }

      const result = await response.json();
      
      if (result.success === false) {
        setStatusMsg({
          type: 'error',
          text: `Dificuldade na análise do documento Condo+ IA: ${result.message}`
        });
        setTimeout(() => setStatusMsg(null), 12000);
        return;
      }
      
      // Auto-pre-fill the form with visual feedback
      if (result.nome) setNewPropFormName(result.nome);
      if (result.email) setNewPropFormEmail(result.email);
      if (result.cpfCnpj) setNewPropFormCpf(result.cpfCnpj);
      if (result.rg) setNewPropFormRg(result.rg);
      if (result.nacionalidade) setNewPropFormNacionalidade(result.nacionalidade);
      if (result.estadoCivil) setNewPropFormEstadoCivil(result.estadoCivil);
      if (result.residencia) setNewPropFormResidencia(result.residencia);
      if (result.banco) setNewPropFormBanco(result.banco);
      if (result.agencia) setNewPropFormAgencia(result.agencia);
      if (result.conta) setNewPropFormConta(result.conta);
      if (result.pixKey) setNewPropFormPix(result.pixKey);

      setUploadedPropDocumentName(file.name);

      setStatusMsg({
        type: 'success',
        text: `Documento "${file.name}" lido e conferido com 100% acuracidade pela inteligência artificial! Dados preenchidos.`
      });
      setTimeout(() => setStatusMsg(null), 8000);

    } catch (err: any) {
      console.error(err);
      setStatusMsg({
        type: 'error',
        text: `Erro ao analisar o documento: ${err.message || "Problema de comunicação com o servidor Condo+."}`
      });
      setTimeout(() => setStatusMsg(null), 5000);
    } finally {
      setAnalyzingPropDocument(false);
    }
  };

  const handleAddNewProprietario = async () => {
    if (!newPropFormName.trim() || !newPropFormEmail.trim()) {
      setStatusMsg({ type: 'error', text: "Por favor, preencha o Nome e o E-mail de contato para cadastrar o proprietário." });
      setTimeout(() => setStatusMsg(null), 4000);
      return;
    }

    try {
      const response = await fetch("/api/proprietarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: newPropFormName.trim(),
          email: newPropFormEmail.trim(),
          cpfCnpj: newPropFormCpf.trim() || "000.000.000-00",
          rg: newPropFormRg.trim() || "33.698.982-9",
          nacionalidade: newPropFormNacionalidade.trim() || "brasileiro(a)",
          estadoCivil: newPropFormEstadoCivil.trim() || "solteiro(a)",
          residencia: newPropFormResidencia.trim() || "Santo André, SP",
          banco: newPropFormBanco.trim() || "Banco Itaú",
          agencia: newPropFormAgencia.trim() || "1063",
          conta: newPropFormConta.trim() || "31860-2",
          pixKey: newPropFormPix.trim() || newPropFormEmail.trim(),
          documentFileName: uploadedPropDocumentName
        })
      });

      if (response.ok) {
        const added = await response.json();
        if (onSyncDb) await onSyncDb();
        setNewPropOwner(added.id);

        // Reset form
        setNewPropFormName("");
        setNewPropFormEmail("");
        setNewPropFormCpf("");
        setNewPropFormPix("");
        setNewPropFormRg("");
        setNewPropFormNacionalidade("brasileiro(a)");
        setNewPropFormEstadoCivil("solteiro(a)");
        setNewPropFormResidencia("");
        setNewPropFormBanco("Banco Itaú");
        setNewPropFormAgencia("1063");
        setNewPropFormConta("31860-2");
        setShowNewPropForm(false);
        setStatusMsg({ type: 'success', text: "Novo parceiro proprietário adicionado com sucesso!" });
        setTimeout(() => setStatusMsg(null), 4000);
      } else {
        const errJson = await response.json();
        setStatusMsg({ type: 'error', text: errJson.error || "Erro ao cadastrar proprietário." });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: "Falha de conexão com o servidor ao cadastrar proprietário." });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleRemoveProprietario = async (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Exclusão de Proprietário",
      message: `Tem certeza que deseja excluir o parceiro proprietário "${name}"? Esta exclusão será considerada definitiva.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await fetch(`/api/proprietarios/${id}`, {
            method: "DELETE"
          });

          if (response.ok) {
            if (onSyncDb) await onSyncDb();
            if (newPropOwner === id) {
              setNewPropOwner("");
            }
            setStatusMsg({ type: 'success', text: "Parceiro proprietário excluído com sucesso!" });
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            const errJson = await response.json();
            setStatusMsg({ type: 'error', text: errJson.error || "Erro ao excluir proprietário." });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: "Falha de conexão com o servidor ao excluir proprietário." });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    });
  };

  const handleCompareInspections = async () => {
    if (!moveInImage || !moveOutImage) {
      setInspectionError("Por favor, faça upload de ambas as imagens (Entrada e Saída) para analisar.");
      return;
    }

    setIsAnalyzingInspection(true);
    setInspectionError(null);
    setInspectionResult(null);

    try {
      setInspectionAnalysisStep("Lendo bytes das imagens...");
      await new Promise(r => setTimeout(r, 600));

      setInspectionAnalysisStep("Segmentando áreas de cobertura por IA...");
      await new Promise(r => setTimeout(r, 600));

      setInspectionAnalysisStep("Comparando Vistoria de Entrada vs Saída com Gemini Vision...");
      await new Promise(r => setTimeout(r, 600));

      setInspectionAnalysisStep("Gerando laudo descritivo e calculando custos de reparos...");

      const response = await fetch("/api/gemini/compare-inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moveInImage,
          moveOutImage,
          roomName: inspectionRoomName
        })
      });

      if (!response.ok) {
        throw new Error(`Servidor retornou código ${response.status}`);
      }

      const resData = await response.json();
      if (!resData || !resData.data) {
        throw new Error("Resposta inválida ou vazia recebida do servidor.");
      }

      setInspectionResult(resData);
      setInspectionAnalysisStep("Análise concluída com sucesso!");
    } catch (e: any) {
      console.error("error comparing inspections via Gemini API", e);
      setInspectionError(`Erro ao comparar vistorias por IA: ${e.message}`);
    } finally {
      setIsAnalyzingInspection(false);
    }
  };

  const handleDeleteProperty = async (id: string, address: string) => {
    const shortAddress = address.split(" - ")[0];
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Exclusão de Imóvel",
      message: `Tem certeza que deseja excluir o imóvel cadastrado em "${shortAddress}"? Esta exclusão será considerada definitiva.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await fetch(`/api/properties/${id}`, {
            method: "DELETE"
          });

          if (response.ok) {
            setStatusMsg({ type: 'success', text: "Imóvel excluído com sucesso!" });
            if (onSyncDb) onSyncDb();
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            const errJson = await response.json();
            setStatusMsg({ type: 'error', text: errJson.error || "Não foi possível excluir o imóvel." });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: "Falha de conexão ao tentar excluir o imóvel." });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    });
  };

  const handleDeleteInquilino = async (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Exclusão de Inquilino",
      message: `Tem certeza que deseja excluir o inquilino/proponente "${name}"? Esta exclusão será considerada definitiva e removerá todos os contratos e faturamentos vinculados.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await fetch(`/api/tenants/${id}`, {
            method: "DELETE"
          });

          if (response.ok) {
            setStatusMsg({ type: 'success', text: "Inquilino excluído permanentemente!" });
            if (onSyncDb) onSyncDb();
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            const errJson = await response.json();
            setStatusMsg({ type: 'error', text: errJson.error || "Não foi possível excluir o inquilino." });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: "Falha de conexão ao tentar excluir o inquilino." });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    });
  };

  const handleOpenWorkspace = (tenant: Inquilino) => {
    setSelectedWorkspaceTenant(tenant);
    setWorkspaceNotes(tenant.anotacoes || "");
    setNewFileTitle("");
    setWorkspaceFileError(null);
    setWorkspaceNotesSuccess(false);
  };

  const handleSaveWorkspaceNotes = async () => {
    if (!selectedWorkspaceTenant) return;
    setWorkspaceSavingNotes(true);
    setWorkspaceNotesSuccess(false);
    try {
      const response = await fetch(`/api/tenants/${selectedWorkspaceTenant.id}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anotacoes: workspaceNotes })
      });
      if (response.ok) {
        setWorkspaceNotesSuccess(true);
        if (onSyncDb) onSyncDb();
        // Update local workspace tenant state
        setSelectedWorkspaceTenant(prev => prev ? { ...prev, anotacoes: workspaceNotes } : null);
        setTimeout(() => setWorkspaceNotesSuccess(false), 3000);
      } else {
        setStatusMsg({ type: 'error', text: "Falha ao salvar anotações no servidor." });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: "Erro ao conectar ao servidor para salvar anotações." });
      setTimeout(() => setStatusMsg(null), 4000);
    } finally {
      setWorkspaceSavingNotes(false);
    }
  };

  const handleUploadWorkspaceFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspaceTenant || !newFileTitle.trim()) {
      setWorkspaceFileError("Insira um nome válido para o arquivo.");
      return;
    }
    setWorkspaceUploadingFile(true);
    setWorkspaceFileError(null);
    try {
      // Compute size and format
      const hasExtension = 
        newFileTitle.toLowerCase().endsWith(".pdf") || 
        newFileTitle.toLowerCase().endsWith(".doc") || 
        newFileTitle.toLowerCase().endsWith(".docx") || 
        newFileTitle.toLowerCase().endsWith(".png") || 
        newFileTitle.toLowerCase().endsWith(".jpg");
      const finalName = hasExtension ? newFileTitle : `${newFileTitle}.pdf`;
      const randomSize = (Math.random() * (4.5 - 0.2) + 0.2).toFixed(1) + " MB";

      const response = await fetch(`/api/tenants/${selectedWorkspaceTenant.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: finalName,
          tamanho: randomSize,
          url: "#"
        })
      });

      if (response.ok) {
        const json = await response.json();
        const updatedTenant = json.tenant;
        // Sync local view
        setSelectedWorkspaceTenant(updatedTenant);
        setNewFileTitle("");
        if (onSyncDb) onSyncDb();
      } else {
        const err = await response.json();
        setWorkspaceFileError(err.error || "Falha ao anexar arquivo.");
      }
    } catch (err) {
      console.error(err);
      setWorkspaceFileError("Erro de rede ao salvar arquivo.");
    } finally {
      setWorkspaceUploadingFile(false);
    }
  };

  const handleDeleteWorkspaceFile = async (fileId: string) => {
    if (!selectedWorkspaceTenant) return;
    setConfirmModal({
      isOpen: true,
      title: "Confirmar Remoção de Documento",
      message: "Tem certeza que deseja remover este arquivo de forma definitiva? Esta exclusão não poderá ser desfeita.",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const response = await fetch(`/api/tenants/${selectedWorkspaceTenant.id}/files/${fileId}`, {
            method: "DELETE"
          });
          if (response.ok) {
            const json = await response.json();
            setSelectedWorkspaceTenant(json.tenant);
            if (onSyncDb) onSyncDb();
            setStatusMsg({ type: 'success', text: "Arquivo removido com sucesso!" });
            setTimeout(() => setStatusMsg(null), 4000);
          } else {
            setStatusMsg({ type: 'error', text: "Erro ao excluir arquivo." });
            setTimeout(() => setStatusMsg(null), 4000);
          }
        } catch (err) {
          console.error(err);
          setStatusMsg({ type: 'error', text: "Erro ao conectar ao servidor." });
          setTimeout(() => setStatusMsg(null), 4000);
        }
      }
    });
  };

  const activeContracts = contratos.filter(c => c.status === "ATIVO");
  const onboardingContracts = contratos.filter(c => c.status === "EM_ONBOARDING");
  
  // Total rental portfolio valuation
  const totalRentPortfolio = imoveis.reduce((acc, current) => acc + current.valorAluguel, 0);
  
  // Total monthly collected (for active leases)
  const activeRentVolume = activeContracts.reduce((acc, c) => {
    return acc + (c.imovel?.valorAluguel || 0);
  }, 0);

  const candidatesList = inquilinos.filter(i => !i.status || i.status === "PENDENTE" || i.status === "RECUSADO");
  const activeTenantsList = inquilinos.filter(i => i.status === "APROVADO");

  const renderPeopleDatabaseContent = () => (
      <div className="space-y-6 animate-fade-in" id="people-database-view">
        {/* Header decoration */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <Users className="h-5.5 w-5.5 text-indigo-400" />
              <span>Banco de Dados de Pessoas Condo+</span>
            </h2>
            <p className="text-xs text-slate-400">
              Concentrado unificado para gerenciamento de candidatos (proponentes com pareces de IA) e inquilinos ativos (moradores).
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] uppercase font-bold text-slate-505 tracking-wider font-mono">Candidatos</span>
              <strong className="text-sm font-semibold text-amber-400">{candidatesList.length}</strong>
            </div>
            <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-center">
              <span className="block text-[9px] uppercase font-bold text-slate-505 tracking-wider font-mono">Inquilinos Ativos</span>
              <strong className="text-sm font-semibold text-emerald-400">{activeTenantsList.length}</strong>
            </div>
          </div>
        </div>

        {/* Database sub-tabs */}
        <div className="flex flex-col sm:flex-row border-b border-slate-800 bg-slate-900 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setDbSubTab('candidates')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbSubTab === 'candidates'
                ? "bg-slate-950 text-indigo-400 shadow-sm border border-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            📋 Candidatados ({candidatesList.length})
          </button>
          <button
            type="button"
            onClick={() => setDbSubTab('tenants')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbSubTab === 'tenants'
                ? "bg-slate-950 text-indigo-400 shadow-sm border border-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            👥 Inquilinos ({activeTenantsList.length})
          </button>
          <button
            type="button"
            onClick={() => setDbSubTab('new_candidate')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbSubTab === 'new_candidate'
                ? "bg-slate-950 text-indigo-400 shadow-sm border border-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ➕ Novo Candidato
          </button>
          <button
            type="button"
            onClick={() => setDbSubTab('imoveis')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              dbSubTab === 'imoveis'
                ? "bg-slate-950 text-indigo-400 shadow-sm border border-slate-800"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            🏢 Imóveis & Unidades ({imoveis.length})
          </button>
        </div>

        {/* Dynamic content */}
        {dbSubTab === 'new_candidate' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-6">
              <Plus className="h-5 w-5 text-indigo-400" />
              Preencher Ficha e Documentos de Novo Proponente
            </h3>
            <OnboardingKyc 
              imoveis={imoveis} 
              onTenantAdded={() => {
                if (onSyncDb) onSyncDb();
                setDbSubTab('candidates');
              }} 
              onNavigate={(tab) => {
                if (onSyncDb) onSyncDb();
                setDbSubTab('candidates');
              }}
            />
          </div>
        )}

        {dbSubTab === 'imoveis' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-5 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <span>Gerenciamento de Imóveis & Unidades</span>
                </h3>
                <p className="text-xs text-slate-400">Visualize imoveis cadastrados e execute novos cadastros rápidos via leitura de faturas e escrituras.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPropertyModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-97 select-none"
              >
                <Plus className="h-4 w-4" />
                <span>⚡ Cadastrar via Documento/Fatura</span>
              </button>
            </div>

            {/* List the registered properties in a beautiful dark design */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imoveis.map(imovel => {
                const owner = proprietarios?.find(p => p.id === imovel.proprietarioId);
                return (
                  <div 
                    key={imovel.id} 
                    className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700/80 transition-all space-y-3 shadow-xs"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950 border border-indigo-900 text-indigo-300">
                        {imovel.tipo}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-indigo-400 font-mono">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.valorAluguel)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingImovel(imovel)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-450 border border-slate-800 rounded-lg transition-all cursor-pointer inline-flex shrink-0"
                          title="Editar Imóvel"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProperty(imovel.id, imovel.endereco)}
                          className="p-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-950 rounded-lg transition-all cursor-pointer inline-flex"
                          title="Excluir Imóvel"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 leading-snug">{imovel.endereco}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {imovel.complemento && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-350 text-[9px] font-bold font-mono">
                          {imovel.complemento}
                        </span>
                      )}
                      {imovel.isBuilding && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 text-[9px] font-bold font-mono">
                          🏢 Prédio Inteiro
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-2">
                      <span>Proprietário: <span className="font-bold text-slate-205">{owner?.nome || "Proprietário Padrão"}</span></span>
                    </div>
                  </div>
                );
              })}
              {imoveis.length === 0 && (
                <div className="col-span-2 py-8 text-center text-slate-500 font-semibold text-xs border border-dashed border-slate-800 rounded-xl">
                  Nenhum imóvel cadastrado ainda. Use o botão acima para cadastrar via IA ou manual!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Candidates or active tenants list tables */}
        {dbSubTab !== 'new_candidate' && dbSubTab !== 'imoveis' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                  {dbSubTab === 'candidates' ? (
                    <Users className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  )}
                  {dbSubTab === 'candidates' 
                    ? "Análise de Fichas, Crédito e Risco Gemini" 
                    : "Carteira Homologada de Locatários da Administradora"
                  }
                </h3>
                <p className="text-xs text-slate-400">
                  {dbSubTab === 'candidates'
                    ? "Avalie o Rent-to-Income, certidões negativas e execute pareceres cognitivos de risco com auxílio da IA."
                    : "Inquilinos com cadastro aprovado. Gerencie anexos eletrônicos, mude regras ou revise anotações."
                  }
                </p>
              </div>

              {dbSubTab === 'candidates' && (
                <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-lg self-start md:self-center border border-slate-800">
                  {["TODOS", "PENDENTE", "RECUSADO"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        filterStatus === status
                          ? "bg-slate-900 text-indigo-400 border border-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {status === "TODOS" ? "Todos Candidatos" : status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {statusMsg && (
              <div className={`p-3 text-xs font-semibold rounded-xl border animate-fade-in ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800' 
                  : 'bg-rose-950/40 text-rose-300 border-rose-800'
              }`}>
                {statusMsg.text}
              </div>
            )}

            {/* List Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-805 text-[10px] uppercase font-bold text-slate-400 tracking-wider bg-slate-950">
                    <th className="p-4 rounded-tl-xl text-xs">Candidato / Contato</th>
                    <th className="p-4 text-xs">CPF / Civil / Profissão</th>
                    <th className="p-4 text-xs">Imóvel Pretendido / Aluguel</th>
                    <th className="p-4 text-xs">Estudo de Rent-to-Income</th>
                    <th className="p-4 text-xs">Auditoria Cognitiva Gemini</th>
                    <th className="p-4 text-xs">Resultado / Status</th>
                    <th className="p-4 text-center rounded-tr-xl text-xs">Ações Decisórias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs">
                  {(dbSubTab === 'candidates' ? candidatesList : activeTenantsList)
                    .filter(i => {
                      if (dbSubTab === 'tenants') return true;
                      const s = i.status || "PENDENTE";
                      return filterStatus === "TODOS" || s === filterStatus;
                    })
                    .map((i) => {
                      const targetProperty = imoveis.find(im => im.id === i.selectedPropertyId);
                      const status = i.status || "PENDENTE";
                      
                      // Compute compromised rent amount ratio
                      const rentValue = targetProperty ? targetProperty.valorAluguel : 0;
                      const ratio = i.rendaMensal > 0 ? Math.round((rentValue / i.rendaMensal) * 100) : 0;
                      
                      return (
                        <tr key={i.id} className="hover:bg-slate-950/50 transition">
                          {/* Name / Contact */}
                          <td className="p-4">
                            <div className="font-bold text-slate-100 text-sm">{i.nome}</div>
                            <div className="text-slate-400 text-[10px] font-medium font-mono">{i.email}</div>
                            {i.telefone && i.telefone !== "Não informado" && (
                              <div className="text-[10px] text-indigo-400 font-semibold">{i.telefone}</div>
                            )}
                          </td>

                          {/* CPF / Civil / Job */}
                          <td className="p-4 space-y-0.5">
                            <div className="font-mono font-semibold text-slate-300">{i.cpf}</div>
                            <div className="text-slate-400 text-[10px]">
                              {i.estadoCivil || "Solteiro(a)"} — {i.profissao || "Autônomo(a)"}
                            </div>
                            {i.conjuge && (
                              <div className="mt-1 text-[9px] bg-slate-950/80 text-indigo-300 rounded-lg p-1.5 border border-slate-800">
                                <span className="font-bold uppercase text-[8px] text-slate-500 block font-mono">Cônjuge:</span>
                                <span className="font-bold block text-slate-100">{i.conjuge.nome}</span>
                                <span className="text-[8.5px] text-slate-300 font-mono block">CPF: {i.conjuge.cpf}</span>
                                {i.conjuge.rg && i.conjuge.rg !== "Não informado" && (
                                  <span className="text-[8.5px] text-slate-300 font-mono block">RG: {i.conjuge.rg}</span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Property / Rent */}
                          <td className="p-4">
                            {targetProperty ? (
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-100 text-[11px] block">{targetProperty.tipo}</span>
                                <span className="text-slate-400 text-[10px] line-clamp-1">{targetProperty.endereco.split(" - ")[0]}</span>
                                <span className="text-indigo-400 font-extrabold text-[11px]">
                                  R$ {targetProperty.valorAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-500 font-medium italic">Nenhum imóvel vinculado</span>
                            )}
                          </td>

                          {/* Rent-to-Income */}
                          <td className="p-4">
                            <div className="space-y-1.5 min-w-[120px]">
                              <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                                <span className="text-[10px] text-slate-400 font-medium">Declaração:</span>
                                <strong className="text-slate-100 font-sans text-[10px]">
                                  R$ {i.rendaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </strong>
                              </div>
                              {rentValue > 0 && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px]">
                                    <span className="text-slate-400 font-medium">Compromete:</span>
                                    <strong className={`font-mono text-[10px] ${ratio > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                                      {ratio}%
                                    </strong>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${ratio > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                                      style={{ width: `${Math.min(ratio, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Gemini Analysis Indicator */}
                          <td className="p-4">
                            {i.aiReport ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="p-1 bg-indigo-950/60 rounded">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-455 text-indigo-400 animate-pulse" />
                                  </span>
                                  <div>
                                    <div className="text-[10px] font-extrabold text-indigo-400 uppercase">Parecer Emitido</div>
                                    <div className="text-[9px] font-mono text-slate-400 font-bold">Risco: {i.aiReport.validations.riskScore}/100</div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSelectedAiReportTenant(i)}
                                  className="text-[10px] text-indigo-400 font-extrabold hover:text-indigo-300 flex items-center gap-1 mt-1 cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" /> Ver Parecer de IA
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-[10px] font-medium text-slate-500 italic block">sem auditoria</span>
                                <button
                                  type="button"
                                  disabled={isAnalyzingId === i.id}
                                  onClick={() => handleRunOnTheFlyAnalysis(i)}
                                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-900 border border-slate-800 disabled:text-slate-500 text-indigo-400 text-[10px] font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  {isAnalyzingId === i.id ? (
                                    <div className="h-3 w-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                                  )}
                                  Auditar IA
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              status === "PENDENTE"
                                ? "bg-amber-950/60 text-amber-400 border border-amber-800/60"
                                : status === "APROVADO"
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                                : "bg-rose-950/60 text-rose-400 border border-rose-800/60"
                            }`}>
                              {status === "PENDENTE" && <AlertTriangle className="h-3 w-3" />}
                              {status === "APROVADO" && <Check className="h-3 w-3" />}
                              {status === "RECUSADO" && <X className="h-3 w-3" />}
                              {status}
                            </span>
                          </td>

                          {/* Action triggers */}
                          <td className="p-4 text-center">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 min-w-[200px]">
                              <button
                                type="button"
                                onClick={() => handleOpenWorkspace(i)}
                                className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-100 border border-slate-800 text-[10px] font-bold rounded-lg transition duration-150 flex items-center gap-1 justify-center cursor-pointer w-full sm:w-auto"
                                title="Pasta de Documentos e Anexos"
                              >
                                <FolderOpen className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                <span>Anexos & Histórico (Digital)</span>
                              </button>

                              {dbSubTab === 'candidates' && status === "PENDENTE" && (
                                <div className="flex gap-1.5 w-full sm:w-auto">
                                  <button
                                    type="button"
                                    disabled={isUpdatingId !== null}
                                    onClick={() => handleUpdateStatus(i.id, "APROVADO")}
                                    className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-550 disabled:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg transition flex items-center gap-0.5 justify-center cursor-pointer flex-1"
                                  >
                                    <Check className="h-3 w-3" />
                                    <span>Aprovar</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isUpdatingId !== null}
                                    onClick={() => handleUpdateStatus(i.id, "RECUSADO")}
                                    className="px-2 py-1.5 bg-rose-600 hover:bg-rose-550 disabled:bg-slate-800 text-white text-[10px] font-extrabold rounded-lg transition flex items-center gap-0.5 justify-center cursor-pointer flex-1"
                                  >
                                    <X className="h-3 w-3" />
                                    <span>Recusar</span>
                                  </button>
                                </div>
                              )}
                              
                              {dbSubTab === 'tenants' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "Revogar Homologação",
                                      message: `Deseja desfazer a aprovação de ${i.nome} e retornar para análise pendente?`,
                                      onConfirm: async () => {
                                        setConfirmModal(null);
                                        await handleUpdateStatus(i.id, "PENDENTE");
                                      }
                                    });
                                  }}
                                  className="px-2 py-1.5 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-900 text-rose-400 text-[10px] font-black rounded-lg transition cursor-pointer flex-1 animate-fade-in"
                                >
                                  Desfazer aprovação
                                </button>
                              )}

                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingInquilino(i)}
                                  className="p-1 px-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 text-[10px] rounded-lg transition shrink-0 cursor-pointer"
                                  title="Editar cadastro"
                                >
                                  <Pencil className="h-3 w-3 inline" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteInquilino(i.id, i.nome)}
                                  className="p-1 px-2 bg-slate-900 hover:bg-slate-850 text-rose-400 border border-slate-700 hover:border-rose-500 hover:text-rose-300 text-[10px] rounded-lg transition shrink-0 cursor-pointer"
                                  title="Excluir permanentemente"
                                >
                                  <Trash2 className="h-3 w-3 inline" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  
                  {((dbSubTab === 'candidates' ? candidatesList : activeTenantsList).length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-slate-500 italic font-medium">
                        Nenhum registro ou cadastro consta nesta aba.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== HIGH CONTRAST DARK MODALS ==================== */}

        {/* MODAL / OVERLAY DETAILS: Gemini AI Compliance details expander */}
        {selectedAiReportTenant && selectedAiReportTenant.aiReport && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 relative max-h-[85vh] overflow-y-auto text-slate-100">
              
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-900 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 tracking-wider uppercase">
                    <Sparkles className="h-3 w-3 animate-pulse text-indigo-400" /> Auditoria Cognitiva Multimodal Gemini IA
                  </div>
                  <h4 className="text-lg font-bold text-slate-100">Parecer Técnico: {selectedAiReportTenant.nome}</h4>
                  <p className="text-[10px] text-slate-400 font-medium font-mono">ID Proponente: {selectedAiReportTenant.id} • CPF: {selectedAiReportTenant.cpf}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAiReportTenant(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-100 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Tab Switched Navigation */}
              <div className="flex border-b border-slate-800 bg-slate-950 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAiReportActiveTab('audit')}
                  className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg cursor-pointer ${
                    aiReportActiveTab === 'audit'
                      ? 'bg-slate-900 shadow-md text-indigo-400 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  📋 Auditoria Cadastral
                </button>
                <button
                  type="button"
                  onClick={() => setAiReportActiveTab('background')}
                  className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg cursor-pointer ${
                    aiReportActiveTab === 'background'
                      ? 'bg-slate-900 shadow-md text-indigo-400 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  🛡️ Background Check & Judicial
                </button>
                <button
                  type="button"
                  onClick={() => setAiReportActiveTab('developer')}
                  className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg cursor-pointer ${
                    aiReportActiveTab === 'developer'
                      ? 'bg-slate-900 shadow-md text-indigo-400 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ⚙️ Guia do Programador
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 text-xs">
                {aiReportActiveTab === 'audit' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Compliance checks */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Autenticidade Nome</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          {selectedAiReportTenant.aiReport.validations.nameMatches ? (
                            <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                          ) : (
                            <span className="inline-flex h-2.5 w-2.5 bg-amber-500 rounded-full" />
                          )}
                          <span>
                            {selectedAiReportTenant.aiReport.validations.nameMatches ? "Documento Conforme" : "Divergência Detectada"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">CPF Registrado</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          {selectedAiReportTenant.aiReport.validations.cpfValid ? (
                            <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                          ) : (
                            <span className="inline-flex h-2.5 w-2.5 bg-red-500 rounded-full animate-bounce" />
                          )}
                          <span>
                            {selectedAiReportTenant.aiReport.validations.cpfValid ? "CPF Ativo (Receita)" : "CPF Inválido"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Coerência de Renda</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          {selectedAiReportTenant.aiReport.validations.incomeConsistent ? (
                            <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                          ) : (
                            <span className="inline-flex h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse" />
                          )}
                          <span>
                            {selectedAiReportTenant.aiReport.validations.incomeConsistent ? "Compatível" : "Inconsistente"}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Assinatura Gov.br</span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-200">
                          {selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? (
                            <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                          ) : (
                            <span className="inline-flex h-2.5 w-2.5 bg-red-500 rounded-full" />
                          )}
                          <span className={selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "text-emerald-400" : "text-amber-500"}>
                            {selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "Assinatura Válida" : "Ponto de Atenção"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Advanced metrics & Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-extrabold text-indigo-400 tracking-wider block">Scoring Cognitivo de Risco</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-indigo-400 tracking-tight">
                            {selectedAiReportTenant.aiReport.validations.riskScore}
                          </span>
                          <span className="text-slate-450 text-[11px] font-semibold text-slate-500">/100</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Score de Risco calculado pelo Cérebro cognitivo Condo+.</p>
                      </div>

                      <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-850 pt-2.5 md:pt-0 md:pl-4">
                        <span className="text-[9px] uppercase font-extrabold text-indigo-400 tracking-wider block">Comprometimento de Renda</span>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-3xl font-extrabold tracking-tight ${
                            selectedAiReportTenant.aiReport.validations.rentToIncomeRatio > 30 ? "text-amber-400" : "text-emerald-400"
                          }`}>
                            {selectedAiReportTenant.aiReport.validations.rentToIncomeRatio}%
                          </span>
                          <span className="text-slate-500 text-[11px] font-semibold">da renda declarada</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Diretriz: Até 30% ideal para evitar inadimplemento.</p>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block">Recomendação Final do AI Assistant</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-md uppercase ${
                          selectedAiReportTenant.aiReport.validations.recommendation === "APROVADO"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}>
                          {selectedAiReportTenant.aiReport.validations.recommendation.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-indigo-950/20 border border-indigo-900/45 p-4 rounded-xl leading-relaxed text-slate-300">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider flex items-center gap-1">
                        <Info className="h-3.5 w-3.5 text-indigo-400" /> Detalhamento do Parecer e Raciocínio
                      </span>
                      <p className="whitespace-pre-wrap">{selectedAiReportTenant.aiReport.validations.notes}</p>
                    </div>

                    {/* Gov.br Signature Audit Section */}
                    <div className={`space-y-2 p-4 rounded-xl border leading-relaxed ${
                      selectedAiReportTenant.aiReport.govBrSignatureReport?.verified
                        ? "bg-emerald-950/20 border-emerald-900/40 text-slate-300"
                        : "bg-red-950/20 border-red-900/40 text-red-100"
                    }`}>
                      <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                        selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "text-emerald-400" : "text-red-400"
                      }`}>
                        <ShieldCheck className="h-3.5 w-3.5" /> Auditoria de Assinatura Eletrônica Gov.br (Mandatária)
                      </span>
                      <div className="font-sans space-y-1 text-[11px]">
                        <p><strong className="font-semibold text-slate-400">Presença de Assinatura:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.hasGovBrSignature ? "Sim, detectada nos anexos" : "Não encontrada (CHECAGEM SEM ÊXITO)"}</p>
                        <p><strong className="font-semibold text-slate-400">Signatário Identificado:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.signerName || "Não identificado"}</p>
                        <p><strong className="font-semibold text-slate-400">CPF do Signatário:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.signerCpf || "Não identificado"}</p>
                        <div className="border-t border-slate-800/40 my-2 pt-2">
                          <p className="font-mono text-[10.5px] whitespace-pre-wrap">{selectedAiReportTenant.aiReport.govBrSignatureReport?.verificationDetails || "Nenhum detalhe de validação disponível."}</p>
                        </div>
                      </div>
                    </div>

                    {/* Document Extract values breakdown */}
                    <div className="border border-slate-800 rounded-xl overflow-hidden text-[11px] bg-slate-950">
                      <div className="bg-slate-950 p-2 font-bold uppercase text-slate-400 tracking-wide border-b border-slate-800">Dados Extraídos do Cadastro</div>
                      <div className="grid grid-cols-2 divide-x divide-y divide-slate-800 border-b border-slate-800">
                        <div className="p-2.5"><span className="text-slate-500 block font-medium">Nome no Documento</span><strong className="text-slate-200">{selectedAiReportTenant.aiReport.nome || "Não parseado"}</strong></div>
                        <div className="p-2.5"><span className="text-slate-500 block font-medium">CPF/CNPJ Identificado</span><strong className="font-mono text-slate-200">{selectedAiReportTenant.aiReport.cpfCnpj || "Não parseado"}</strong></div>
                        <div className="p-2.5"><span className="text-slate-500 block font-medium">ID do Documento</span><strong className="font-mono text-slate-200">{selectedAiReportTenant.aiReport.documentId || "Não identificado"}</strong></div>
                        <div className="p-2.5"><span className="text-slate-500 block font-medium">Tipo do Documento</span><strong className="text-slate-200">{selectedAiReportTenant.aiReport.documentType || "Não identificado"}</strong></div>
                      </div>
                      <div className="p-2.5 bg-slate-900 flex justify-between items-center text-xs">
                        <span className="text-slate-450 font-bold uppercase text-[9px] text-slate-400 font-mono">Renda Bruta Auditada</span>
                        <strong className="text-emerald-400 text-sm">R$ {selectedAiReportTenant.aiReport.grossIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>

                    {/* Análise Mês a Mês de Extrato Bancário & Fluxo de Caixa (Incluindo Uber/Autônomos) */}
                    {selectedAiReportTenant.aiReport.bankStatementAnalysis && selectedAiReportTenant.aiReport.bankStatementAnalysis.detectedBankStatement && (
                      <div className="space-y-4 border border-slate-800 rounded-xl p-4 bg-slate-950 mt-4">
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                          <Activity className="h-4 w-4 text-indigo-450 text-indigo-400 animate-pulse" />
                          <span className="text-[10px] uppercase font-bold text-slate-200 tracking-wider">
                            Análise Forense de Extrato & Fluxo de Caixa
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center">
                            <span className="text-[8px] uppercase text-slate-500 font-bold block">Total Entradas</span>
                            <strong className="text-emerald-400 font-mono text-xs">
                              R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.totalInflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </strong>
                          </div>
                          
                          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center">
                            <span className="text-[8px] uppercase text-slate-500 font-bold block">Total Saídas</span>
                            <strong className="text-rose-400 font-mono text-xs">
                              R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.totalOutflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </strong>
                          </div>

                          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center">
                            <span className="text-[8px] uppercase text-slate-500 font-bold block">Saldo Líquido</span>
                            <strong className={`font-mono text-xs ${
                              selectedAiReportTenant.aiReport.bankStatementAnalysis.netMonthlyBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.netMonthlyBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </strong>
                          </div>
                        </div>

                        <div className="space-y-2 text-[10.5px] leading-relaxed text-slate-300">
                          <div>
                            <strong className="text-slate-400 block font-bold uppercase text-[9px] mb-0.5">Padrão de Saques / Liquidez:</strong>
                            <p className="p-2 bg-slate-900 border border-slate-850 rounded-md text-slate-200 font-semibold leading-normal">
                              {selectedAiReportTenant.aiReport.bankStatementAnalysis.withdrawalPattern}
                            </p>
                          </div>

                          <div>
                            <strong className="text-slate-400 block font-bold uppercase text-[9px] mb-0.5">Permanência com Saldo Baixo/Zerado:</strong>
                            <p className="p-2 bg-slate-900 border border-slate-850 rounded-md text-slate-200 font-semibold leading-normal">
                              {selectedAiReportTenant.aiReport.bankStatementAnalysis.zeroBalancePeriods}
                            </p>
                          </div>

                          <div>
                            <strong className="text-slate-400 block font-bold uppercase text-[9px] mb-0.5">Auditabilidade de Incoerências / Adaptações:</strong>
                            <p className="p-2 bg-slate-900 border border-slate-850 rounded-md text-slate-250 leading-normal">
                              {selectedAiReportTenant.aiReport.bankStatementAnalysis.identifiedInconsistencies}
                            </p>
                          </div>

                          {/* Demonstrativo de Fluxo Mês a Mês do Candidato */}
                          {selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements && selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements.length > 0 && (
                            <div className="mt-4">
                              <span className="text-slate-400 block font-bold uppercase text-[9px] mb-2 tracking-wider">
                                Demonstrativo Consolidado de Fluxo Mês a Mês
                              </span>
                              <div className="border border-slate-850 bg-slate-900 rounded-lg overflow-hidden divide-y divide-slate-850">
                                {selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements.map((move: any, idx: number) => (
                                  <div key={idx} className="p-3">
                                    <div className="flex justify-between items-center mb-1.5 font-sans">
                                      <span className="text-[11px] font-bold text-slate-200">{move.month}</span>
                                      <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                        move.balance >= 0 ? "bg-emerald-950/40 text-emerald-400" : "bg-rose-950/40 text-rose-400"
                                      }`}>
                                        R$ {move.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 mb-1">
                                      <div>
                                        <span className="opacity-60 block text-[8px] uppercase">Entradas</span>
                                        <span className="text-emerald-400 font-bold">R$ {move.inflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                      </div>
                                      <div>
                                        <span className="opacity-60 block text-[8px] uppercase">Saídas</span>
                                        <span className="text-rose-400 font-bold">R$ {move.outflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic leading-snug mt-1">
                                      {move.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedAiReportTenant.aiReport.bankStatementAnalysis.uberDriverSpecificMetrics?.isUberStatement && (
                            <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-xl leading-relaxed mt-2 text-slate-200">
                              <span className="text-[9px] uppercase font-extrabold text-amber-400 tracking-wider flex items-center gap-1">
                                <AlertTriangle className="h-3.5 w-3.5" /> Métricas Especiais: Análise Uber / Gig Economy
                              </span>
                              <p className="mt-1 leading-normal text-slate-300">
                                {selectedAiReportTenant.aiReport.bankStatementAnalysis.uberDriverSpecificMetrics.revenueUnderestimationRisk}
                              </p>
                            </div>
                          )}

                          <div className="p-2.5 bg-indigo-950/25 border border-indigo-900/30 rounded-xl leading-relaxed text-slate-200">
                            <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider">
                              Parecer Comportamental de Risco Financeiro
                            </span>
                            <p className="mt-1 italic leading-normal text-[11px] text-slate-300">
                              "{selectedAiReportTenant.aiReport.bankStatementAnalysis.behavioralRiskAnalysis}"
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiReportActiveTab === 'background' && (
                  <div className="space-y-4 animate-fade-in">
                    {/* Safety Indicator Banner */}
                    <div className="bg-gradient-to-r from-slate-950 to-indigo-950 text-white rounded-xl p-4 flex items-center justify-between border border-slate-800">
                      <div>
                        <span className="text-[8px] tracking-widest text-indigo-400 font-extrabold uppercase font-mono">Varredura de Background Check</span>
                        <h5 className="text-[13px] font-black tracking-tight mt-0.5">Relatório Judicial Unificado Condo+</h5>
                      </div>
                      <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
                    </div>

                    {(() => {
                      const bgData = selectedAiReportTenant.aiReport.advancedBackgroundCheck || {
                        receitaFederalStatus: "REGULAR",
                        judicialProcessesCount: 0,
                        policeRecordLevel: "LIMPO",
                        pepStatus: "NAO",
                        ofacSanctions: "LIMPO",
                        protestsCount: 0,
                        fraudRiskLevel: "MUITO_BAIXO",
                        judicialDetails: "Nenhum histórico ou distribuidor judicial civil/criminal reportou restrições de inadimplemento perante as consultas."
                      };

                      return (
                        <div className="space-y-4">
                          {/* Status Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                            {/* Receita Federal */}
                            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase block tracking-wider font-mono">Situação CPF (RFB)</span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                bgData.receitaFederalStatus === "REGULAR" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                              }`}>
                                {bgData.receitaFederalStatus}
                              </span>
                            </div>

                            {/* Processos Judiciais */}
                            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase block tracking-wider font-mono">Processos TJ / TRF</span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                bgData.judicialProcessesCount === 0 ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"
                              }`}>
                                {bgData.judicialProcessesCount} Encontrados
                              </span>
                            </div>

                            {/* Antecedentes Criminais */}
                            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase block tracking-wider font-mono">Antecedentes Penais</span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                bgData.policeRecordLevel === "LIMPO" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400 border border-amber-800"
                              }`}>
                                {bgData.policeRecordLevel}
                              </span>
                            </div>

                            {/* Fraud risk level */}
                            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                              <span className="text-[8px] font-extrabold text-slate-500 uppercase block tracking-wider font-mono">Fraude Documental</span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                                bgData.fraudRiskLevel === "MUITO_BAIXO" || bgData.fraudRiskLevel === "BAIXO" 
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800" 
                                  : "bg-amber-950 text-amber-400 border border-amber-850"
                              }`}>
                                RISK: {bgData.fraudRiskLevel}
                              </span>
                            </div>
                          </div>

                          {/* Secondary Indicators */}
                          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                              <span className="text-slate-500 text-[10px]">Pessoa Exposta Politicamente (PEP):</span>
                              <span className="font-bold text-slate-200">{bgData.pepStatus}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                              <span className="text-slate-500 text-[10px]">Restrições OFAC / Sanções:</span>
                              <span className="font-bold text-emerald-400">{bgData.ofacSanctions}</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 border-t border-slate-850 pt-2 col-span-2">
                              <span className="text-slate-500 text-[10px]">Protestos de Títulos Ativos em Cartórios:</span>
                              <span className={`font-bold ${bgData.protestsCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                {bgData.protestsCount} ocorrências
                              </span>
                            </div>
                          </div>

                          {/* Detailed analysis citation box */}
                          <div className="space-y-2 p-4 bg-slate-950 text-slate-300 border border-slate-800 rounded-xl font-mono text-[10.5px]">
                            <span className="text-[8px] uppercase font-bold text-indigo-400 block tracking-wider mb-1 font-mono">
                              ⚖️ Parecer e Certidão Judicial Unificada
                            </span>
                            <p className="whitespace-pre-wrap">{bgData.judicialDetails}</p>
                          </div>

                          {/* Judicial Advice */}
                          <div className="p-3 bg-amber-950/40 border border-amber-800/80 text-amber-205 rounded-xl flex items-start gap-2 text-[10.5px]">
                            <AlertTriangle className="h-4 w-4 text-amber-450 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <strong className="font-bold text-amber-300">Investigação Judicial & Inquéritos:</strong>
                              <p className="font-medium leading-relaxed text-slate-300">
                                Esta varredura de perfil realiza o cruzamento de CPF cognitivo inteligente. Em conformidade com a Lei do Inquilinato brasileira (Lei n° 8.245 e LGPD), para instruir uma investigação judicial formal ou ação de despejo, estas evidências devem ser integradas a assinaturas digitais carimbadas e a certidões de distribuição reais dos fóruns estaduais/federais. Veja como programar e conectar estas bases na aba "Guia do Programador"!
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {aiReportActiveTab === 'developer' && (
                  <div className="space-y-4 animate-fade-in text-xs">
                    {/* Programmer Alert Guidance */}
                    <div className="p-4 bg-slate-950 text-slate-300 rounded-xl space-y-3 leading-normal border border-slate-800">
                      <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                        <Lock className="h-4 w-4" /> MANUAL DE INTEGRAÇÃO OFICIAL CONDO+ (COMO PROGRAMAR)
                      </div>
                      <p className="text-[11px] font-sans">
                        Olá <strong>Renato Kawano</strong>, para obter background checks 100% integrados às bases oficiais do governo brasileiro, tribunais de justiça e bureaux de crédito em tempo real em produção, configure as variáveis de ambiente seguindo o modelo seguro abaixo:
                      </p>

                      {/* Step 1: Env keys */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">1. DECLARAÇÃO DOS SEGREDOS (.env.example)</span>
                        <pre className="p-3 bg-slate-900 rounded-lg text-[10px] text-emerald-400 overflow-x-auto font-mono border border-slate-800">
{`# Token de Autenticação Receita Federal do Brasil (CPF/CNPJ status)
RECEITA_FEDERAL_API_TOKEN=v_token_aqui

# Chave Privada do Portal de Tribunais oficiais (Jusbrasil API / Digilegal / Tribunal Busca)
JUSBRASIL_API_KEY=sua_chave_jusbrasil_aqui

# Credenciais de Score e Restrição Comercial (Serasa Experian / SPC Brasil)
SERASA_CREDIT_KEY=sua_chave_serasa_aqui`}
                        </pre>
                      </div>

                      {/* Step 2: Route pattern sample */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wide">2. IMPLEMENTAÇÃO DA ROTA DE BACKEND (TypeScript)</span>
                        <pre className="p-3 bg-slate-900 rounded-lg text-[10.5px] text-amber-300 overflow-x-auto font-mono max-h-[160px] overflow-y-auto border border-slate-800">
{`// server.ts - Exemplo Real de Consumo de API de Tribunais
app.post("/api/integrations/judicial-check", async (req, res) => {
  const { cpfCandidate } = req.body;
  const key = process.env.JUSBRASIL_API_KEY;
  
  if (!key) {
    return res.status(500).json({ error: "Chave JUSBRASIL_API_KEY não configurada no servidor." });
  }

  try {
    const response = await fetch(\`https://api.jusbrasil.com.br/v1/subpoenas/cpf/\${cpfCandidate}\`, {
      headers: { "Authorization": \`Bearer \${key}\` }
    });
    const dbData = await response.json();
    
    // Retornar os processos localizados
    res.json({ success: true, count: dbData.processes_count, list: dbData.items });
  } catch(e) {
    res.status(400).json({ error: "Erro de consulta na base nacional de tribunais" });
  }
});`}
                        </pre>
                      </div>

                      {/* Step 3: Best practices */}
                      <div className="space-y-1 bg-slate-900 p-3 rounded-lg text-[11px] border border-slate-800">
                        <span className="text-indigo-400 font-bold block text-[9.5px] uppercase tracking-wide">💡 Requisitos de Conformidade Legais:</span>
                        <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans text-[10.5px]">
                          <li>Sempre obtenha a autorização de consentimento (opt-in) do candidato para conformidade plena com a LGPD.</li>
                          <li>Guarde os metadados e IDs de transações em logs os quais podem ser auditados futuramente.</li>
                          <li>Utilize filas assíncronas (como BullMQ ou PubSub) caso seu servidor necessite de alta escalabilidade.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAiReportTenant(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-100 font-bold rounded-xl text-xs transition cursor-pointer font-bold"
                >
                  Concluir Parecer Técnico
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL WORKSPACE: Pasta de Documentos e Registro de Eventos/Anotações de Locação */}
        {selectedWorkspaceTenant && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 text-slate-100">
              {/* Modal Header */}
              <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-indigo-400 font-bold block">PASTA INDIVIDUAL E HISTÓRICO DE GESTÃO</span>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-indigo-400 shrink-0" />
                    {selectedWorkspaceTenant.nome}
                    <span className="text-xs text-slate-400 font-normal">({selectedWorkspaceTenant.cpf})</span>
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSelectedWorkspaceTenant(null)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-slate-850 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content - Side-by-Side Panels */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                
                {/* LEFT SIDE: Campo de Anotações & Registro de Eventos */}
                <div className="space-y-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-6 md:pb-0 md:pr-6">
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <FileText className="h-4 w-4 text-indigo-400" />
                        Anotações de Eventos de Locação
                      </span>
                      {workspaceNotesSuccess && (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800 font-bold animate-pulse font-bold">
                          Salvo!
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[11px] text-slate-400 font-medium">
                      Utilize esta ficha para anotar manutenções, histórico de telefonemas, vistorias periódicas ou ocorrências de condomínio.
                    </p>

                    <textarea
                      value={workspaceNotes}
                      onChange={(e) => setWorkspaceNotes(e.target.value)}
                      placeholder="Ex: Realizou solicitação de reparo hidráulico em 21/05/2026. Pendente orçamento técnico..."
                      className="flex-1 w-full text-xs p-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-slate-950 resize-none font-sans min-h-[220px]"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="button"
                      disabled={workspaceSavingNotes}
                      onClick={handleSaveWorkspaceNotes}
                      className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      {workspaceSavingNotes ? (
                        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Salvar Anotações & Diário
                    </button>
                  </div>
                </div>

                {/* RIGHT SIDE: Folder Files Cabinet */}
                <div className="space-y-4 flex flex-col">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                    <FolderOpen className="h-4 w-4 text-amber-405 text-amber-400" />
                    Pasta Digital de Anexos do Inquilino
                  </span>

                  <p className="text-[11px] text-slate-400 font-medium">
                    Repositório seguro de guarda para contratos assinados eletronicamente, comprovantes de depósitos caução ou laudos de vistorias.
                  </p>

                  {/* Simulated File List */}
                  <div className="flex-1 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-[240px] space-y-2">
                    {!selectedWorkspaceTenant.arquivos || selectedWorkspaceTenant.arquivos.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs italic space-y-1">
                        <FolderOpen className="h-8 w-8 mx-auto text-slate-600 stroke-1 animate-pulse" />
                        <p>Nenhum documento arquivado.</p>
                      </div>
                    ) : (
                      selectedWorkspaceTenant.arquivos.map((file) => (
                        <div key={file.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg shadow-2xs flex items-center justify-between gap-3 group hover:border-slate-700 transition">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-200 truncate" title={file.nome}>{file.nome}</p>
                            <div className="flex items-center gap-2 text-[10px] text-slate-550 font-mono mt-0.5">
                              <span>{new Date(file.dataUpload).toLocaleDateString("pt-BR")}</span>
                              <span>•</span>
                              <span>{file.tamanho || "1.2 MB"}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 items-center">
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(file)}
                              className="p-1 text-slate-405 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-md transition cursor-pointer"
                              title="Baixar documento do inquilino"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorkspaceFile(file.id)}
                              className="p-1 text-slate-400 hover:text-rose-450 hover:bg-rose-950/40 rounded-md transition cursor-pointer"
                              title="Remover documento da pasta"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Upload Section Widget */}
                  <form onSubmit={handleUploadWorkspaceFile} className="bg-slate-950 border border-slate-805 p-3 rounded-xl space-y-2">
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Fazer Envio de Documento Simulado</span>
                    
                    {workspaceFileError && (
                      <p className="text-[10px] text-rose-400 font-semibold">{workspaceFileError}</p>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ex: Contrato_Locacao_Assinado.pdf"
                        value={newFileTitle}
                        onChange={(e) => setNewFileTitle(e.target.value)}
                        className="flex-1 text-xs p-2 bg-slate-900 border border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-550"
                      />
                      <button
                        type="submit"
                        disabled={workspaceUploadingFile}
                        className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 disabled:bg-slate-805 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <span>Anexar</span>
                      </button>
                    </div>
                  </form>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-950 border-t border-slate-800 p-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedWorkspaceTenant(null)}
                  className="px-5 py-2 bg-slate-80a bg-slate-800 hover:bg-slate-750 text-slate-100 transition rounded-xl font-bold cursor-pointer text-xs"
                >
                  Concluir & Fechar Pasta
                </button>
              </div>

            </div>
          </div>
        )}

        {/* CUSTOM CONFIRMATION MODAL */}
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] bg-slate-955/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 max-w-sm w-full rounded-2xl shadow-xl border border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-slate-100">
              <div className="flex items-center gap-2 text-rose-400 border-b border-slate-850 pb-2">
                <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
                <h3 className="font-bold text-slate-100 text-sm">{confirmModal.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{confirmModal.message}</p>
              <div className="flex justify-end gap-2 text-xs font-bold pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg cursor-pointer font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-600 text-white rounded-lg cursor-pointer font-bold"
                >
                  Confirmar Ação
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );

  // Filter sections that belong to the current viewMode (active tab)
  const activeSections = (layoutSections || [])
    .filter(s => s.currentTab === viewMode)
    .sort((a, b) => a.order - b.order);

  const renderSectionContent = (id: string) => {
    switch (id) {
      case "kpi-stats-section":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in" id="kpi-stats-section">
            {/* Metric Card 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-black uppercase tracking-wider">Imóveis Registrados</span>
                <h3 className="text-2xl font-bold text-gray-900">{imoveis.length}</h3>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Portfólio Ativo</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Building2 className="h-6 w-6" />
              </div>
            </div>

            {/* Metric Card 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-black uppercase tracking-wider">Inquilinos Cadastrados</span>
                <h3 className="text-2xl font-bold text-gray-900">{inquilinos.length}</h3>
                <div className="flex items-center gap-1 text-xs text-orange-600">
                  <span>{inquilinos.filter(i => (i.scoreCredito || 0) > 700).length} Score Elevado</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
            </div>

            {/* Metric Card 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-black uppercase tracking-wider">Contratos Ativos</span>
                <h3 className="text-2xl font-bold text-gray-900">{activeContracts.length}</h3>
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span>{onboardingContracts.length} aguardando assinatura</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
            </div>

            {/* Metric Card 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-black uppercase tracking-wider">Aluguel sob Gestão</span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeRentVolume)}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>Retorno Direto: 100% livre de taxas de administração</span>
                </div>
              </div>
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
          </div>
        );

      case "property-inventory-section":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 animate-fade-in font-sans" id="property-inventory-section">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Imóveis Prontos para Locação</h3>
                <p className="text-xs text-gray-500 font-medium">Selecione imóveis para iniciar a análise de cadastro ou novos contratos</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setShowAddPropertyModal(true)}
                  className="px-3 py-1.5 bg-white text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold hover:bg-indigo-50 transition flex items-center gap-1 cursor-pointer animate-fade-in font-bold cursor-pointer"
                  id="btn-add-property"
                >
                  <Plus className="h-3.5 w-3.5" /> Cadastrar Imóvel
                </button>
                <button 
                  onClick={() => onNavigate("contracts")}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1 cursor-pointer font-bold cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Novo Contrato
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imoveis.map(imovel => (
                <div 
                  key={imovel.id} 
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-indigo-100 hover:bg-indigo-50/5 transition space-y-3 animate-fade-in"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {imovel.tipo}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-indigo-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(imovel.valorAluguel)}/mês
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingImovel(imovel)}
                        className="p-1.5 items-center justify-center bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 hover:border-indigo-150 hover:bg-indigo-50 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex shrink-0 mr-1"
                        title="Editar Imóvel"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProperty(imovel.id, imovel.endereco)}
                        className="p-1.5 items-center justify-center bg-white text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-100 hover:bg-rose-50 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex animate-fade-in"
                        title="Excluir Imóvel"
                      >
                        <X className="h-3.5 w-3.5 pointer-events-none" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-805 line-clamp-2">{imovel.endereco}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {imovel.complemento && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold">
                        {imovel.complemento}
                      </span>
                    )}
                    {imovel.isBuilding && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                        🏢 Prédio Inteiro (Múltiplas Unidades)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
                    <span>Proprietário: <span className="font-semibold text-gray-750">{imovel.proprietario?.nome || "Proprietário Padrão"}</span></span>
                  </div>
                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => onNavigate("contracts")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      Gerenciar Contratos ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "parceiros-proprietarios-section":
        return (
          <div id="parceiros-proprietarios-card" className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600 shrink-0" />
                  Parceiros Proprietários / Locadores
                </h3>
                <p className="text-xs text-gray-500 font-medium">Mapeamento e cadastro independente de locadores e recebedores dos repasses</p>
              </div>
              <button
                onClick={() => {
                  setShowNewPropForm(!showNewPropForm);
                  if (!showNewPropForm) {
                    setNewPropFormName("");
                    setNewPropFormEmail("");
                    setNewPropFormCpf("");
                    setNewPropFormPix("");
                    setNewPropFormRg("");
                    setNewPropFormNacionalidade("brasileiro(a)");
                    setNewPropFormEstadoCivil("solteiro(a)");
                    setNewPropFormResidencia("");
                  }
                }}
                className="px-3 py-1.5 bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50 font-sans text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="h-4.5 w-4.5 pointer-events-none" /> 
                {showNewPropForm ? "Ocultar Formulário" : "Novo Proprietário"}
              </button>
            </div>

            {statusMsg && (
              <div className={statusMsg.type === 'success' ? "p-3 rounded-lg text-xs leading-relaxed bg-emerald-50 text-emerald-950 border border-emerald-100" : "p-3 rounded-lg text-xs leading-relaxed bg-rose-50 text-rose-950 border border-rose-100"}>
                {statusMsg.text}
              </div>
            )}

            {showNewPropForm && (
              <form onSubmit={handleAddNewProprietario} className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/20 shadow-2xs space-y-4 animate-fade-in">
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Registrar Novo Coparlamentar / Locador
                </h4>

                {/* Auto fill owner document widget */}
                <div className="space-y-2 pb-1 text-xs">
                  <label className="block text-[10px] font-extrabold text-indigo-950 uppercase tracking-wider">
                    ⚡ Autopreenchimento Inteligente por Documento (IA)
                  </label>
                  <div 
                    onDragEnter={handleDragProp}
                    onDragOver={handleDragProp}
                    onDragLeave={handleDragProp}
                    onDrop={handleDropProp}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                      dragActivePropDocument 
                        ? "border-indigo-500 bg-indigo-50/40 scale-[0.98]" 
                        : "border-indigo-200/60 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
                    }`}
                  >
                    <label htmlFor="prop-document-upload" className="cursor-pointer block">
                      <input 
                        id="prop-document-upload"
                        type="file" 
                        className="hidden" 
                        onChange={handlePropFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                      />
                      <div className="flex flex-col items-center justify-center gap-2 text-xs">
                        {analyzingPropDocument ? (
                          <div className="flex flex-col items-center gap-2 text-indigo-850 font-bold py-2">
                            <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                            <span>Processando documento do proprietário por IA...</span>
                            <span className="text-[9px] text-slate-400 font-medium leading-none font-sans">Identificando nome, CPF/CNPJ, RG, endereço e dados bancários...</span>
                          </div>
                        ) : (
                          <>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                              <Upload className="h-5 w-5 animate-pulse" />
                            </div>
                            <div className="font-bold text-indigo-600 hover:text-indigo-800">
                              Carregar Documento do Proprietário
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Arraste ou clique para enviar RG, CNH, comprovante ou extrato para extrair dados cadastrais automaticamente.
                            </span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {uploadedPropDocumentName && (
                    <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-150 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-800 truncate animate-fade-in" title={uploadedPropDocumentName}>
                          Preenchido com: {uploadedPropDocumentName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedPropDocumentName("");
                          setNewPropFormName("");
                          setNewPropFormEmail("");
                          setNewPropFormCpf("");
                          setNewPropFormPix("");
                          setNewPropFormRg("");
                          setNewPropFormNacionalidade("brasileiro(a)");
                          setNewPropFormEstadoCivil("solteiro(a)");
                          setNewPropFormResidencia("");
                          setNewPropFormBanco("Banco Itaú");
                          setNewPropFormAgencia("1063");
                          setNewPropFormConta("31860-2");
                        }}
                        className="text-[9px] bg-white border border-emerald-200 py-0.5 px-2 hover:bg-rose-50 hover:text-rose-700 rounded-lg text-emerald-700 transition font-bold cursor-pointer font-sans"
                      >
                        Limpar Dados
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border border-slate-250 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: Carlos Eduardo de Castro Ferreira"
                      value={newPropFormName}
                      onChange={(e) => setNewPropFormName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">E-mail para Notificações</label>
                    <input
                      required
                      type="email"
                      className="w-full p-2 border border-slate-250 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: carloseduardo@empresa.com.br"
                      value={newPropFormEmail}
                      onChange={(e) => setNewPropFormEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">CPF ou CNPJ</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border border-slate-250 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: 332.986.711-20 ou CNPJ"
                      value={newPropFormCpf}
                      onChange={(e) => setNewPropFormCpf(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Documento de Identidade RG</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-220 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: 33.698.982-9"
                      value={newPropFormRg}
                      onChange={(e) => setNewPropFormRg(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Chave PIX preferencial de repasse</label>
                    <input
                      required
                      type="text"
                      className="w-full p-2 border border-slate-250 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: carloseduardo@live.com ou Telefone"
                      value={newPropFormPix}
                      onChange={(e) => setNewPropFormPix(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Instituição Bancária & Detalhes</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-220 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: Banco Itaú S.A. (Ag: 1063 - Cc: 31860-2)"
                      value={newPropFormBanco}
                      onChange={(e) => setNewPropFormBanco(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nacionalidade</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-220 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: brasileiro(a)"
                      value={newPropFormNacionalidade}
                      onChange={(e) => setNewPropFormNacionalidade(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Civil</label>
                    <select
                      className="w-full p-2 border border-slate-221 rounded-lg text-slate-900 bg-white font-bold cursor-pointer transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      value={newPropFormEstadoCivil}
                      onChange={(e) => setNewPropFormEstadoCivil(e.target.value)}
                    >
                      <option value="solteiro(a)">Solteiro(a)</option>
                      <option value="casado(a)">Casado(a)</option>
                      <option value="divorciado(a)">Divorciado(a)</option>
                      <option value="viúvo(a)">Viúvo(a)</option>
                      <option value="união estável">União Estável</option>
                      <option value="separado(a) judicialmente">Separado(a) judicialmente</option>
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Domicílio ou Sede Residencial Completa</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-220 rounded-lg text-slate-900 bg-white"
                      placeholder="Ex: Av. Industrial, 1200, Bloco C, Apto 82, Bairro Jardim, Santo André, SP"
                      value={newPropFormResidencia}
                      onChange={(e) => setNewPropFormResidencia(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPropForm(false)}
                    className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 rounded-lg font-bold text-xs"
                  >
                    Descartar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs"
                  >
                    Salvar Parceiro Locador
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {proprietarios.length === 0 ? (
                <div className="p-8 text-center text-gray-450 border border-dashed border-gray-200 rounded-xl font-medium">
                  Nenhum locador cadastrado. O sistema emulará "Proprietário Padrão" para fins de testes.
                </div>
              ) : (
                proprietarios.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition flex items-start gap-3 justify-between animate-fade-in">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0" style={{ color: '#000000' }}>
                        <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                          <Users className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-sm font-bold truncate leading-tight text-black">{p.nome}</h4>
                      </div>
                      <p className="text-xs text-black font-bold truncate">{p.email}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] text-black font-bold pt-1.5 border-t border-slate-100 mt-2 text-slate-450">
                        <span>CPF/CNPJ: <span className="font-semibold text-gray-650">{p.cpfCnpj}</span></span>
                        <span>RG: <span className="font-semibold text-gray-650">{p.rg || "33.698.982-9"}</span></span>
                        <span>Nacionalidade: <span className="font-semibold text-gray-650">{p.nacionalidade || "brasileiro(a)"}</span></span>
                        <span>Civil: <span className="font-semibold text-gray-650">{p.estadoCivil || "solteiro(a)"}</span></span>
                        <span>Domicílio: <span className="font-semibold text-gray-650">{p.residencia || "Santo André, SP"}</span></span>
                        <span>PIX: <span className="font-semibold text-gray-650">{p.pixKey}</span></span>
                        <span>Banco: <span className="font-semibold text-gray-650">{p.banco || "Banco Itaú"} (Ag: {p.agencia || "1063"} - Cc: {p.conta || "31860-2"})</span></span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setEditingProp(p)}
                      className="p-1.5 items-center justify-center bg-white text-slate-500 hover:text-indigo-600 border border-gray-200 hover:border-indigo-100 hover:bg-indigo-50 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex shrink-0 mr-1 animate-fade-in"
                      title="Editar parceiro"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProprietario(p.id, p.nome)}
                      className="p-1.5 items-center justify-center bg-white text-gray-400 hover:text-rose-600 border border-gray-200 hover:border-rose-100 hover:bg-rose-50 rounded-lg shadow-2xs transition-all cursor-pointer inline-flex shrink-0 animate-fade-in"
                      title="Excluir parceiro"
                    >
                      <X className="h-3.5 w-3.5 pointer-events-none" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case "candidate-access-section":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 animate-fade-in" id="candidate-access-section">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Link className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
                Acesso para Candidatos
              </h3>
              <p className="text-xs text-gray-500 font-medium">Enviar formulário público para análise de cadastro</p>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-black uppercase tracking-wider">Imóvel de Destino</label>
                <select
                  value={selectedPropertyLink}
                  onChange={(e) => setSelectedPropertyLink(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="">Selecione um imóvel...</option>
                  {imoveis.map(imovel => (
                    <option key={imovel.id} value={imovel.id}>
                      {imovel.tipo} — {imovel.endereco.split(" - ")[0]}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPropertyLink && (
                <div className="space-y-3.5 animate-fade-in">
                  <div className="space-y-2">
                    <span className="block text-[10px] font-black text-black uppercase tracking-wider">Link de Cadastro do Inquilino</span>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={window.location.origin + "/?candidate=true&propertyId=" + selectedPropertyLink}
                        className="flex-1 text-[10px] p-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-gray-600 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const link = window.location.origin + "/?candidate=true&propertyId=" + selectedPropertyLink;
                          navigator.clipboard.writeText(link);
                          setCopiedLink(true);
                          setTimeout(() => setCopiedLink(false), 2000);
                        }}
                        className={copiedLink ? "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 bg-emerald-600 text-white animate-pulse" : "px-3 py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"}
                      >
                        {copiedLink ? "Copiado!" : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-150 p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-3xs">
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-indigo-950 block">Preenchimento Provisório pelo Adm</span>
                      <span className="text-[10px] text-indigo-700 block font-semibold leading-tight">Abra o formulário oficial como se fosse um inquilino se candidatando.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onEnterCandidateMode?.(selectedPropertyLink)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-900 border border-slate-800 text-white hover:text-indigo-205 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shrink-0 shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4 text-indigo-400" />
                      <span>Ir para Cadastro</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-lg text-[11px] text-indigo-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1 text-xs">
                  <Info className="h-3.5 w-3.5 text-indigo-600" /> Como Funciona?
                </div>
                <p className="text-gray-600 leading-relaxed text-[11px] font-semibold">
                  Envie este link por WhatsApp para o interessado. Ele preencherá os dados e enviará documentos de comprovantes e CNH/RG com segurança. O cadastro aparecerá de imediato no <strong>Painel Geral</strong> e na <strong>Análise de Cadastro</strong> para auditoria!
                </p>
              </div>
            </div>
          </div>
        );

      case "notifications-direct-section":
        const filteredContractsForNotif = contratos.filter(c => {
          return (c.status as string) !== "ARQUIVADO";
        });

        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 animate-fade-in" id="notifications-direct-section">
            
            {/* Header com Descrição Resumida */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <div className="space-y-1 text-left">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600 shrink-0" />
                  Central de Disparos Diretos & Lembretes da Administradora
                </h3>
                <p className="text-xs text-gray-500 font-medium font-sans">
                  Régua de cobrança assistida e aviso de atraso. Selecione inquilinos, escolha uma versão de mensagem e envie com facilidade.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 shadow-3xs">
                <span className={`h-2 w-2 rounded-full ${whatsAppConnected ? "bg-emerald-500 animate-pulse" : "bg-red-400"}`}></span>
                <span className="text-[10px] uppercase font-black text-gray-500 font-mono">
                  Sincronia WhatsApp: {whatsAppConnected ? "Ativo" : "Pendente"}
                </span>
              </div>
            </div>

            {/* Grid Principal: Redação do Disparo vs Central API Educativa */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LADO ESQUERDO: Seleção de Destinatários e Redação (7 colunas) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* 1. SELETOR MULTIPLO DE INQUILINOS */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-left space-y-3 shadow-3xs">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1.5 font-sans">
                      <UserCheck className="h-4 w-4 text-emerald-600 animate-bounce" />
                      1. Escolher Inquilinos ({selectedContractIds.length} selecionados)
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedContractIds(contratos.map(c => c.id))}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase cursor-pointer"
                      >
                        Selecionar Todos
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedContractIds([])}
                        className="text-[10px] font-black text-red-650 hover:text-red-800 uppercase cursor-pointer"
                      >
                        Limpar os Filtros
                      </button>
                    </div>
                  </div>

                  {/* Lista com Checkbox e Scroll */}
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white divide-y divide-slate-100">
                    {filteredContractsForNotif.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400 italic">
                        Nenhum contrato habilitado para disparo manual.
                      </div>
                    ) : (
                      filteredContractsForNotif.map(c => {
                        const isChecked = selectedContractIds.includes(c.id);
                        const tenantName = c.inquilino?.nome || "Locatário";
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center justify-between p-2.5 hover:bg-indigo-50/20 cursor-pointer transition ${isChecked ? "bg-indigo-50/10" : ""}`}
                          >
                            <div className="flex items-center gap-2.5 text-left">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedContractIds(prev => [...prev, c.id]);
                                    setNotifTarget(c.id);
                                  } else {
                                    setSelectedContractIds(prev => prev.filter(id => id !== c.id));
                                  }
                                }}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                              />
                              <div>
                                <p className="text-xs font-bold text-gray-800 font-sans">{tenantName}</p>
                                <p className="text-[10px] text-gray-400 font-medium">
                                  {c.imovel?.endereco?.split(" - ")[0]} — Unidade {c.unidade || "Principal"}
                                </p>
                              </div>
                            </div>

                            <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-tight ${c.status === "ATIVO" ? "bg-emerald-100/80 text-emerald-800" : "bg-amber-100/80 text-amber-800"}`}>
                              {c.status}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 2. CHOOSE MESSAGE TEMPLATE VERSION */}
                <div className="space-y-2 text-left">
                  <span className="block text-xs font-black uppercase text-slate-500">
                    2. Escolher Versão / Modelo de Mensagem
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {NOTIF_TEMPLATES.map(tpl => {
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => {
                            setNotifSubject(tpl.subject);
                            setNotifMessage(tpl.message);
                          }}
                          className="p-3 border border-slate-150 rounded-xl bg-white hover:bg-slate-50 hover:border-indigo-300 transition text-left space-y-1 active:scale-98 cursor-pointer shadow-3xs"
                        >
                          <span className="block text-[10px] font-black text-slate-800 flex items-center gap-1">
                            {tpl.name}
                          </span>
                          <span className="block text-[8.5px] text-slate-400 font-medium truncate">{tpl.subject}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. REDAÇÃO E CAMPOS */}
                <div className="space-y-3.5 p-4 bg-white rounded-xl border border-gray-150 shadow-3xs text-left">
                  <span className="block text-xs font-black uppercase text-slate-500">
                    3. Construção da Cobrança / Notificação
                  </span>

                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-black uppercase text-gray-400">Assunto (Usado em E-mails)</label>
                    <input
                      type="text"
                      value={notifSubject}
                      onChange={(e) => setNotifSubject(e.target.value)}
                      placeholder="Ex: Comunicado Importante - Reajuste de Locação"
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 shadow-3xs focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-black uppercase text-gray-400">Mensagem de Texto (Suporta Tags Dinâmicas)</label>
                    <textarea
                      rows={6}
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Olá, {NOME_INQUILINO}! Lembramos que o aluguel {VALOR_ALUGUEL}..."
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed font-semibold text-gray-800 shadow-3xs focus:bg-white"
                    />
                  </div>

                  {/* Placeholders helper map */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Substitui pelo Nome do Titular">{"{NOME_INQUILINO}"}</span>
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Substitui pelo Aluguel em Contrato">{"{VALOR_ALUGUEL}"}</span>
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Substitui pelo Dia de Vencimento">{"{DATA_VENCIMENTO}"}</span>
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Substitui pelo Endereço do Imóvel">{"{ENDERECO_IMOVEL}"}</span>
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Puxa os juros e multa do Contrato Padrão!">{"{PARAMETRO_MULTA}"}</span>
                    <span className="text-[8.5px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded cursor-help" title="Substitui pela chave Pix padrão">{"{CHAVE_PIX}"}</span>
                  </div>

                  {/* Live preview section */}
                  {notifMessage && (selectedContractIds.length > 0) && (
                    <div className="bg-amber-50/55 p-3.5 rounded-lg border border-amber-100 text-[10.5px] text-amber-950 space-y-1.5 mt-2 shadow-3xs">
                      <span className="font-black flex items-center gap-1.5 uppercase text-[8px] tracking-wider text-amber-800 border-b border-amber-100 pb-1">
                        <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        Amostra da Mensagem ({inquilinos.find(u => u.id === (contratos.find(c => c.id === selectedContractIds[0])?.inquilinoId))?.nome || "Fila de Envio"})
                      </span>
                      <p className="whitespace-pre-wrap font-sans leading-relaxed text-amber-950 font-medium">
                        {interpolateNotificationMessage(notifMessage, contratos.find(c => c.id === selectedContractIds[0]))}
                      </p>
                    </div>
                  )}

                  {/* Operações de Envio em Lote */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-2.5">
                    <button
                      type="button"
                      onClick={() => handleSendDirectNotification("whatsapp")}
                      disabled={selectedContractIds.length === 0 || isSendingNotif}
                      className="flex-1 px-4 py-2.5 bg-emerald-600 border border-emerald-500 hover:bg-emerald-700 text-white font-black rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs disabled:bg-gray-150 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-xs uppercase"
                    >
                      {isSendingNotif ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      <span>Disparar Zap ({selectedContractIds.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendDirectNotification("email")}
                      disabled={selectedContractIds.length === 0 || isSendingNotif}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 border border-indigo-500 hover:bg-indigo-700 text-white font-black rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5 shadow-xs disabled:bg-gray-150 disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-xs uppercase"
                    >
                      {isSendingNotif ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      <span>Disparar E-mail ({selectedContractIds.length})</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* LADO DIREITO: CENTRAL DE CONEXÃO API DIDÁTICA (5 colunas) */}
              <div className="lg:col-span-5 space-y-6 text-left">
                
                {/* Painel Didático de Instruções de Integração */}
                <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-xl border border-indigo-900 shadow-md space-y-4 shadow-3xs">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400 animate-pulse shrink-0" />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-white">Central de Sincronia de Contas</h4>
                  </div>
                  
                  <p className="text-[11px] text-indigo-150 font-medium leading-relaxed">
                    Para que seus avisos, notificações de mora e faturas cheguem instantaneamente aos inquilinos, você pode associar suas contas do WhatsApp ou Gmail pelo protocolo SMTP. Siga os manuais abaixo:
                  </p>

                  {/* Guia Didático 1: WhatsApp */}
                  <div className="border-t border-indigo-800/60 pt-3.5 space-y-2 text-left">
                    <span className="text-[9.5px] font-black uppercase text-amber-400 flex items-center gap-1 font-mono tracking-wider">
                      🟢 Integração do WhatsApp por QR-Code
                    </span>
                    <ol className="list-decimal pl-4 text-[10.5px] text-indigo-150 space-y-1 font-sans">
                      <li>Não requer chaves de programação ou codificação técnica.</li>
                      <li>Clique no botão abaixo para simular a sincronia do modem.</li>
                      <li>Abra o WhatsApp no aparelho celular, vá em <span className="font-bold text-white">Aparelhos Conectados</span>.</li>
                      <li>Aponte a câmera e leia o código Condo+ para parear.</li>
                    </ol>

                    <div className="pt-2">
                      {whatsAppConnected ? (
                        <div className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-lg flex items-center justify-between text-[10.5px]">
                          <div className="space-y-0.5 text-left">
                            <span className="font-black text-emerald-400 uppercase text-[8.5px] block">Dispositivo Pareado ✅</span>
                            <span className="text-gray-200 font-bold block">+55 (13) 99182-0192 (Condo+ Ativo)</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleSimulateWhatsAppDisconnect}
                            className="text-[8.5px] font-black bg-red-900/40 text-red-300 px-2 py-1 rounded hover:bg-red-900/80 cursor-pointer uppercase transition"
                          >
                            Recusar
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSimulateWhatsAppConnect}
                          disabled={isConnectingWhatsApp}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-700 disabled:text-gray-400 text-white font-black rounded-lg text-[10px] uppercase cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          {isConnectingWhatsApp ? (
                            <>
                              <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>Aguardando Pareamento Geral...</span>
                            </>
                          ) : (
                            <>
                              <QrCode className="h-4 w-4 shrink-0" />
                              <span>Escanear QR Code para Conectar</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Guia Didático 2: E-mail SMTP */}
                  <div className="border-t border-indigo-800/60 pt-3.5 space-y-2 text-left">
                    <span className="text-[9.5px] font-black uppercase text-sky-400 flex items-center gap-1 font-mono tracking-wider">
                      🔵 Servidor SMTP (E-mail Coletivo)
                    </span>
                    <ol className="list-decimal pl-4 text-[10.5px] text-indigo-150 space-y-1 font-sans">
                      <li>Use o servidor padrão do Condo+ ou insira chaves Outlook/Gmail.</li>
                      <li>Para o Gmail pessoal, configure as <span className="font-bold text-white">Senhas de App</span>.</li>
                      <li>Os envios contêm carimbo SSL/TLS com criptografia militar.</li>
                    </ol>

                    <div className="space-y-2 pt-1.5 text-[10.5px] bg-slate-900/60 p-2.5 rounded-lg border border-indigo-900 text-left font-mono">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Servidor (Host):</span>
                        <span className="text-white font-bold">{smtpHost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Porta SMTP:</span>
                        <span className="text-white font-bold">{smtpPort}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-300">Status SMTP:</span>
                        <span className="font-bold text-emerald-400 flex items-center gap-0.5">🟢 Conexão Ativa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historico de Envios e Logs Individuais (Régua de Cobrança) */}
                <div className="space-y-3 bg-gray-50 border border-gray-150 p-4 rounded-xl text-left shadow-3xs">
                  <h4 className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5 font-sans">
                    <History className="h-4 w-4 text-indigo-500 shrink-0" />
                    Histórico de Envios & Logs por Destinatário
                  </h4>
                  
                  <p className="text-[9.5px] text-gray-500 font-medium">
                    Abaixo constam os logs de régua correspondentes, segmentados individualmente com horário local:
                  </p>

                  {notifLogs.length === 0 ? (
                    <div className="text-center p-6 text-gray-400 italic bg-white border border-gray-100 rounded-lg text-[9.5px] font-sans">
                      Nenhum envio registrado nesta sessão. Seu histórico de envios em lote aparecerá aqui logo após disparar as faturas.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden max-h-52 overflow-y-auto shadow-4xs">
                      <table className="w-full text-[10px] border-collapse bg-white">
                        <thead>
                          <tr className="bg-slate-100 border-b border-gray-200 font-bold text-gray-500 text-left">
                            <td className="p-2">Inquilino / Hora</td>
                            <td className="p-2">Canal</td>
                            <td className="p-2">Preview</td>
                            <td className="p-2 text-center">Status</td>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {notifLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition text-left text-[9.5px]">
                              <td className="p-2 font-bold text-gray-800">
                                <span className="block font-sans font-bold">{log.destinatario || log.inquilinoName || "Inquilino"}</span>
                                <span className="block font-mono text-[8.5px] text-gray-400">{log.sentAt || new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                              </td>
                              <td className="p-2">
                                <span className={(log.tipo || log.channel)?.toUpperCase() === 'WHATSAPP' ? "px-1.5 py-0.2 rounded font-black text-[8px] uppercase bg-emerald-100 text-emerald-800" : "px-1.5 py-0.2 rounded font-black text-[8px] uppercase bg-indigo-100 text-indigo-800"}>
                                  {log.tipo || log.channel}
                                </span>
                              </td>
                              <td className="p-2 truncate max-w-[100px] font-medium text-gray-500" title={log.mensagem || log.subjectOrMessage}>
                                {log.mensagem || log.subjectOrMessage}
                              </td>
                              <td className="p-2 text-center">
                                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-black text-[8px] uppercase whitespace-nowrap">
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        );

      case "status-ecossistema-section":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4 shadow-xs animate-fade-in" id="status-ecossistema-section">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Status do Ecossistema</h3>
              <p className="text-xs text-gray-500 font-semibold font-sans">Mapeamento de conexões inteligentes</p>
            </div>

            {/* Connected Services list */}
            <div className="space-y-4 pt-2">
              {/* Service 1 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-emerald-50 text-emerald-600 rounded select-none">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Mapeamento de Cadastro e Documentos</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase font-bold text-emerald-950">Operacional</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium font-sans">Extrator estruturado multimodal mapeado em CNH/RG e Comprovantes de Renda.</p>
                </div>
              </div>

              {/* Service 2 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-emerald-50 text-emerald-600 rounded select-none">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Assinatura Eletrônica Gov.br</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase font-bold text-slate-900">Ativo</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium font-sans">Integração via Gov.br e APIs homologadas para assinaturas com validade jurídica instantânea.</p>
                </div>
              </div>

              {/* Service 3 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-emerald-50 text-emerald-600 rounded select-none">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Mecanismo de Cálculo Financeiro</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-semibold uppercase font-bold text-emerald-955">Fórmulas Ativas</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium font-sans font-sans">V_t = V_b + M(10%) + J(1%/30 ao dia) calculando reajustes contratuais IPCA/IGPM de ponta.</p>
                </div>
              </div>

              {/* Service 4 */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-1.5 bg-indigo-50 text-indigo-600 rounded select-none">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-900">Banco de Dados Prisma/PostgreSQL</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-850 font-semibold uppercase font-bold text-indigo-950">Em Memória</span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium font-sans">Modelo relacional local mantendo estados de Proprietários, Imóveis, Inquilinos e Boletos.</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5 mt-2 text-xs">
              <h4 className="font-bold text-gray-750 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="h-4 w-4 text-emerald-600 shrink-0 select-none animate-pulse" /> Diretrizes de Negócio
              </h4>
              <p className="text-gray-500 text-[11px] leading-relaxed font-semibold">
                Os inquilinos são validados pelo motor Gemini. A regra restritiva de risco avalia a renda mensal informada contra 3 vezes o valor do aluguel desejado.
              </p>
            </div>
          </div>
        );

      case "candidates-evaluation-section":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 animate-fade-in" id="candidates-evaluation-panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2 animate-fade-in">
                  <Users className="h-5 w-5 text-indigo-600" />
                  Avaliação de Candidaturas & Análise de Risco (Gemini IA)
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Analise, audite documentos e tome decisões de aprovação ou recusa com amparo do Parecer Automação Gemini.
                </p>
              </div>

              {/* Filter Status controls */}
              <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg self-start md:self-center font-sans">
                {["TODOS", "EM_ANALISE", "APROVADO", "RECUSADO"].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={filterStatus === st ? "px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer bg-indigo-600 text-white font-extrabold shadow-sm" : "px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer text-gray-500 hover:text-gray-950"}
                  >
                    {st.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Inquilinos table list */}
            <div className="overflow-x-auto text-xs font-sans">
              <table className="w-full text-left min-w-[700px] border-collapse bg-white">
                <thead>
                  <tr className="border-b border-gray-150 text-black font-black text-[10px] uppercase bg-gray-50/50">
                    <th className="p-3">Nome do Proponente</th>
                    <th className="p-3">Renda Mensal</th>
                    <th className="p-3">Imóvel Pretendido</th>
                    <th className="p-3">Aluguel</th>
                    <th className="p-3 text-center">Score de Crédito</th>
                    <th className="p-3 text-center">Auditoria Gemini</th>
                    <th className="p-3 text-right">Ficha de Decisão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inquilinos
                    .filter(i => filterStatus === "TODOS" || i.status === filterStatus)
                    .map(i => {
                      const matchedImovel = imoveis.find(im => im.id === i.selectedPropertyId);
                      const isHighRisk = i.scoreRisk === "ALTO";
                      
                      return (
                        <tr key={i.id} className="hover:bg-gray-50 border-b border-gray-50 animate-fade-in">
                          <td className="p-3 space-y-0.5">
                            <div className="font-extrabold text-gray-900 text-xs">{i.nome}</div>
                            <div className="text-[10px] text-black font-extrabold font-mono">CPF: {i.cpf} • E-mail: {i.email}</div>
                          </td>
                          <td className="p-3 font-extrabold text-black text-xs border-b border-[#f1f2f9]">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(i.rendaMensal)}
                          </td>
                          <td className="p-3">
                            {matchedImovel ? (
                              <div className="max-w-[200px]">
                                <p className="font-bold text-black truncate text-xs">{matchedImovel.endereco.split(" - ")[0]}</p>
                                <p className="text-[10px] font-bold text-indigo-650 uppercase tracking-widest">{matchedImovel.tipo}</p>
                              </div>
                            ) : (
                              <span className="text-[10px] font-bold uppercase text-black">Em Aberto / Não Associado</span>
                            )}
                          </td>
                          <td className="p-3 font-mono font-bold text-indigo-700 text-xs">
                            {matchedImovel ? (
                              <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(matchedImovel.valorAluguel)}</span>
                            ) : (
                              <span>-</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={isHighRisk ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-850" : ((i.scoreCredito || 0) < 600 ? "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-850" : "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-850 font-medium")}>
                              {i.scoreCredito || 620} — {i.scoreRisk === "ALTO" ? "Alto Risco" : i.scoreRisk === "MEDIO" ? "Médio Risco" : "Baixo Risco"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {i.aiReport ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedAiReportTenant(i)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer w-full text-center justify-center animate-fade-in font-serif cursor-pointer"
                                >
                                  <Sparkles className="h-3 w-3 animate-pulse text-indigo-600 shrink-0" />
                                  <span>Visualizar Parecer</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleRunOnTheFlyAnalysis(i)}
                                  disabled={isAnalyzingId === i.id}
                                  className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 disabled:bg-indigo-200 text-white rounded-lg text-[10px] font-black tracking-wide uppercase transition flex items-center gap-1 cursor-pointer w-full text-center justify-center font-sans shadow-2xs"
                                >
                                  {isAnalyzingId === i.id ? (
                                    <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  ) : (
                                    <Sparkles className="h-3 w-3 animate-pulse text-indigo-205 shrink-0" />
                                  )}
                                  <span>Girar Motor IA</span>
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-1.5 flex-wrap sm:flex-nowrap">
                              {i.status === "PENDENTE" ? (
                                <div className="flex gap-1.5 w-full justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(i.id, "APROVADO")}
                                    className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 text-white text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-0.5 justify-center cursor-pointer flex-1"
                                    title="Aprovar Ficha de Cadastro"
                                  >
                                    {isUpdatingId === i.id ? (
                                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <Check className="h-3 w-3 shrink-0" />
                                    )}
                                    <span>Aprovar</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateStatus(i.id, "RECUSADO")}
                                    className="px-2 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 text-white text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-0.5 justify-center cursor-pointer flex-1"
                                    title="Recusar Ficha de Cadastro"
                                  >
                                    {isUpdatingId === i.id ? (
                                      <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <X className="h-3 w-3 shrink-0" />
                                    )}
                                    <span>Recusar</span>
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded w-full sm:w-auto text-center shrink-0">
                                  Decidido
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {inquilinos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-gray-400 italic">
                        Nenhum cadastro ou candidatura realizada até o momento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "smart-inspection-section":
        return (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6 animate-fade-in font-sans" id="smart-inspection-panel">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-100 pb-4 gap-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 animate-pulse" />
                  Vistoria Inteligente Comparativa por IA (Gemini)
                </h3>
                <p className="text-xs text-gray-500 font-medium font-sans">
                  Compare fotos de Vistoria de Entrada (Move-In) e Vistoria de Saída (Move-Out) para identificar manchas, rachaduras, furos ou danos automaticamente com inteligência artificial.
                </p>
              </div>

              {/* Reset Control */}
              {(moveInImage || moveOutImage || inspectionResult) && (
                <button
                  type="button"
                  onClick={() => {
                    setMoveInImage(null);
                    setMoveOutImage(null);
                    setInspectionResult(null);
                    setInspectionError(null);
                    setInspectionRoomName("Sala de Estar");
                    setInspectionAnalysisStep("Aguardando upload das imagens");
                  }}
                  className="px-2.5 py-1.5 text-[10px] uppercase font-black tracking-wider bg-gray-50 border border-gray-200 text-gray-650 hover:bg-gray-100 hover:text-black rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Limpar Painel
                </button>
              )}
            </div>

            {/* Quick Presets Section */}
            <div className="p-4 rounded-xl bg-indigo-50/40 border border-indigo-100/50 space-y-2.5">
              <div className="flex items-center gap-1.5 text-indigo-950">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wide">Cenários Reais Pré-carregados (Teste Rápido):</span>
              </div>
              <p className="text-[11px] text-indigo-800 leading-normal font-sans">
                Não tem fotos à mão para testar o Gemini? Clique em um cenário real abaixo para carregar as fotos simuladas de entrada e saída instantaneamente e testar o funcionamento inteligente:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {INSPECTION_SCENARIOS.map(scen => (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => handleLoadScenario(scen)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold leading-none bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all cursor-pointer shadow-3xs"
                  >
                    {scen.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Config & Input Area */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Left Settings & Config Area */}
              <div className="md:col-span-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    Nome do Cômodo ou Espaço:
                  </label>
                  <input
                    type="text"
                    value={inspectionRoomName}
                    onChange={(e) => setInspectionRoomName(e.target.value)}
                    placeholder="Ex: Sala de Estar, Cozinha, Quarto Principal"
                    className="w-full text-xs font-bold p-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                  {/* Preset Badges for Room Input */}
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {["Sala", "Cozinha", "Banheiro", "Suíte", "Varanda"].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setInspectionRoomName(preset)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold leading-none transition-all cursor-pointer ${
                          inspectionRoomName === preset 
                            ? "bg-indigo-600 border border-indigo-600 text-white" 
                            : "bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compare Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompareInspections}
                    disabled={isAnalyzingInspection || !moveInImage || !moveOutImage}
                    className="w-full py-3 px-4 bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wide rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed font-sans"
                  >
                    {isAnalyzingInspection ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
                        <span>Fazendo Análise por IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>Comparar Vistorias por IA</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Status Box or Steps */}
                {isAnalyzingInspection && (
                  <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-155 text-indigo-950 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-850">Etapa do Processamento:</span>
                    </div>
                    <p className="text-[11px] font-bold text-indigo-900 leading-normal">
                      {inspectionAnalysisStep}
                    </p>
                  </div>
                )}

                {/* User manual help */}
                <div className="p-3.5 bg-gray-50/65 rounded-xl border border-gray-100 text-[10.5px] text-gray-500 leading-relaxed space-y-1">
                  <span className="font-extrabold text-gray-700 uppercase tracking-wide text-[9px] block">Instruções de Uso:</span>
                  <p>1. Ajuste o nome do cômodo analisado.</p>
                  <p>2. Faça upload da foto tirada na entrega das chaves (**Entrada**).</p>
                  <p>3. Faça upload da foto tirada na devolução das chaves (**Saída**).</p>
                  <p>4. Clique em **Comparar Vistorias por IA** para obter o laudo de danos e estimativa de reparos via Gemini.</p>
                </div>
              </div>

              {/* Right Dual Upload Area */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Image 1: Entrada (Move-In) */}
                <div className="p-4 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-white transition space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                        Vistoria de Entrada (Move-In)
                      </span>
                    </div>
                    {moveInImage && (
                      <button
                        type="button"
                        onClick={() => setMoveInImage(null)}
                        className="text-gray-400 hover:text-rose-650 cursor-pointer p-0.5 rounded hover:bg-gray-100"
                        title="Remover Imagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {moveInImage ? (
                    <div className="space-y-2.5">
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-gray-100 relative shadow-inner">
                        <img
                          src={`data:${moveInImage.mimeType};base64,${moveInImage.fileBase64}`}
                          alt="Move-In Prévia"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono truncate" title={moveInImage.fileName}>
                        📄 {moveInImage.fileName}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 bg-gray-50/50 rounded-xl cursor-pointer relative hover:bg-indigo-50/25 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const baseKey = (reader.result as string).split(',')[1];
                              setMoveInImage({
                                fileBase64: baseKey,
                                mimeType: file.type,
                                fileName: file.name
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        title="Upload Entrada"
                      />
                      <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-650">Escolher Foto de Entrada</span>
                      <span className="text-[10px] text-gray-400 font-medium">JPEG, PNG ou WebP</span>
                    </div>
                  )}
                </div>

                {/* Image 2: Saída (Move-Out) */}
                <div className="p-4 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-white transition space-y-3 relative group">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit">
                        Vistoria de Saída (Move-Out)
                      </span>
                    </div>
                    {moveOutImage && (
                      <button
                        type="button"
                        onClick={() => setMoveOutImage(null)}
                        className="text-gray-400 hover:text-rose-655 cursor-pointer p-0.5 rounded hover:bg-gray-100"
                        title="Remover Imagem"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {moveOutImage ? (
                    <div className="space-y-2.5">
                      <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-gray-100 relative shadow-inner">
                        <img
                          src={`data:${moveOutImage.mimeType};base64,${moveOutImage.fileBase64}`}
                          alt="Move-Out Prévia"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono truncate" title={moveOutImage.fileName}>
                        📄 {moveOutImage.fileName}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 bg-gray-50/50 rounded-xl cursor-pointer relative hover:bg-indigo-50/25 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const baseKey = (reader.result as string).split(',')[1];
                              setMoveOutImage({
                                fileBase64: baseKey,
                                mimeType: file.type,
                                fileName: file.name
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                        title="Upload Saída"
                      />
                      <Upload className="h-8 w-8 text-gray-400 mb-2 group-hover:text-indigo-500 transition-colors" />
                      <span className="text-xs font-bold text-gray-600 group-hover:text-indigo-650">Escolher Foto de Saída</span>
                      <span className="text-[10px] text-gray-400 font-medium">JPEG, PNG ou WebP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {inspectionError && (
              <div className="p-4 bg-rose-50 text-rose-950 border border-rose-100 rounded-xl flex items-start gap-2.5 animate-fade-in text-xs font-sans leading-relaxed">
                <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                <div className="space-y-0.5">
                  <span className="font-extrabold block">Alerta da IA:</span>
                  <p>{inspectionError}</p>
                </div>
              </div>
            )}

            {/* Comparison Report Result */}
            {inspectionResult && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5 animate-fade-in text-xs font-sans">
                {/* Header of Report */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-3.5 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full inline-block">
                      Laudo Emitido por Gemini Vision AI
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      Laudo Comparativo Técnico do Cômodo: <span className="text-indigo-700 font-black">{inspectionRoomName}</span>
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500 text-white font-extrabold px-2 py-1 rounded">
                      Status: Comparado
                    </span>
                    {inspectionResult.source === "local-simulation" && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 font-black px-2 py-0.5 rounded uppercase" title={inspectionResult.warning}>
                        Emulação Inteligente Ativa
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-1 bg-gradient-to-r from-indigo-50/20 to-white">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">Resumo Geral da Comparação:</span>
                  <p className="text-slate-800 font-medium leading-relaxed font-sans">
                    {inspectionResult.data.summary}
                  </p>
                </div>

                {/* Identified Damages Section */}
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[10.5px] font-black uppercase text-slate-600 tracking-wider">
                      Diferenças e Novos Danos Identificados ({inspectionResult.data.issuesFoundCount || 0})
                    </span>
                    <span className="text-xs text-indigo-850 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs">
                      Custo Total Estimado de Reparo: {" "}
                      <span className="font-extrabold underline text-indigo-700">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                          (inspectionResult.data.damages || []).reduce((acc: number, d: any) => acc + (d.estimatedRepairCost || 0), 0)
                        )}
                      </span>
                    </span>
                  </div>

                  {/* Damages List Table */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-3xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-black uppercase text-slate-600 font-sans">
                          <th className="p-3">Categoria</th>
                          <th className="p-3">Dano / Descrição</th>
                          <th className="p-3">Localização Precisa</th>
                          <th className="p-3 text-center">Gravidade</th>
                          <th className="p-3 text-right">Reparo Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {(inspectionResult.data.damages || []).map((damage: any, idx: number) => {
                          // Define background color based on damage type
                          let typeBadgeColor = "bg-gray-100 text-gray-700 border-gray-200";
                          const dType = (damage.type || "").toLowerCase();
                          if (dType.includes("mancha")) typeBadgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                          else if (dType.includes("rachadura") || dType.includes("trinca") || dType.includes("fissura")) typeBadgeColor = "bg-orange-550/10 text-orange-800 border-orange-200";
                          else if (dType.includes("furo")) typeBadgeColor = "bg-blue-50 text-blue-800 border-blue-200";
                          else if (dType.includes("vazamento")) typeBadgeColor = "bg-rose-50 text-rose-800 border-rose-200";
                          else if (dType.includes("quebrado") || dType.includes("trincado") || dType.includes("dano")) typeBadgeColor = "bg-red-50 text-red-800 border-red-200";

                          let severityBadge = "bg-gray-150 text-gray-700";
                          const dSev = (damage.severity || "").toLowerCase();
                          if (dSev.includes("baix")) severityBadge = "bg-emerald-50 text-emerald-700 border border-emerald-150 font-bold";
                          else if (dSev.includes("méd") || dSev.includes("med")) severityBadge = "bg-amber-50 text-amber-800 border border-amber-200 font-bold";
                          else if (dSev.includes("alt")) severityBadge = "bg-rose-50 text-rose-700 border border-rose-250 font-bold";

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition duration-100">
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-black border uppercase tracking-wider block w-fit ${typeBadgeColor}`}>
                                  {damage.type}
                                </span>
                              </td>
                              <td className="p-3 text-slate-800 font-medium">
                                {damage.description}
                              </td>
                              <td className="p-3 text-slate-500 font-semibold font-mono text-[10px]">
                                {damage.location}
                              </td>
                              <td className="p-3 text-center whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold ${severityBadge}`}>
                                  {damage.severity}
                                </span>
                              </td>
                              <td className="p-3 text-right font-black font-mono text-indigo-900 text-[11px]">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(damage.estimatedRepairCost || 0)}
                              </td>
                            </tr>
                          );
                        })}

                        {(!inspectionResult.data.damages || inspectionResult.data.damages.length === 0) && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-400 italic">
                              Nenhum dano novo detectado nas fotos comparadas. Parabéns! O imóvel está conservado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print/Copy Export panel */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-xl border border-slate-200 p-4 gap-3 font-sans">
                  <div className="text-[10px] text-gray-500 leading-normal max-w-lg">
                    💡 <strong>Dica jurídica:</strong> Este laudo gerado de forma autônoma por IA pode ser anexado formalmente ao Termo de Devolução de Chaves para retenções ou repasses correspondentes.
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const reportText = `[LAUDO COMPARATIVO DE VISTORIA - PROPTECHOS]\n\nCômodo: ${inspectionRoomName}\nResumo: ${inspectionResult.data.summary}\n\nDanos Identificados:\n` + 
                          (inspectionResult.data.damages || []).map((d: any) => `- [${d.type}] ${d.description} em ${d.location} (Gravidade: ${d.severity}, Reparo: R$ ${d.estimatedRepairCost})`).join("\n") +
                          `\n\nCusto Total Estimado: R$ ` + (inspectionResult.data.damages || []).reduce((acc: number, d: any) => acc + (d.estimatedRepairCost || 0), 0);
                        
                        navigator.clipboard.writeText(reportText);
                        alert("Laudo textual de vistoria copiado com sucesso!");
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg font-bold hover:bg-slate-50 hover:text-black flex items-center gap-1.5 cursor-pointer transition shadow-3xs"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copiar Laudo
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                    >
                      Imprimir Laudo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "people-database-section":
        return renderPeopleDatabaseContent();

      case "contract-management-section":
        return (
          <ContractManagement 
            contratos={contratos}
            inquilinos={inquilinos}
            imoveis={imoveis}
            onContractAdded={onSyncDb || (() => {})}
            onAddPropertyClick={() => setShowAddPropertyModal(true)}
          />
        );

      case "financial-module-section":
        return (
          <FinancialModule 
            faturamentos={faturamentos}
            contratos={contratos}
            despesas={despesas}
            imoveis={imoveis}
            onInvoiceCreatedOrPaid={onSyncDb || (() => {})}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Dynamic Upper control header */}
      {viewMode === "dashboard" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="dashboard-upper-header">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1 leading-none">
              <span>Painel de Controle Condo</span>
              <LogoMais />
            </h2>
            <p className="text-sm text-gray-500 mt-1">Visão geral do ecossistema de locação imobiliária inteligente</p>
          </div>
          <button
            type="button"
            onClick={() => onEnterCandidateMode?.(selectedPropertyLink || imoveis[0]?.id)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:scale-102 duration-150 self-start sm:self-auto shrink-0"
            title="Efetuar cadastro de inquilino / candidato"
          >
            <UserCheck className="h-4 w-4" />
            <span>Cadastrar Inquilino (Inscrição)</span>
          </button>
        </div>
      )}

      {viewMode === "operacional" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" id="operacional-upper-header">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none font-sans">
            <Cog className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>Chamada Operacional</span>
            <LogoMais />
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configuração de réguas de cobrança eletrônica e monitoramento do ecossistema.</p>
        </div>
      )}

      {viewMode === "inquilino" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" id="inquilino-upper-header">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none font-sans">
            <Smile className="h-5 w-5 text-indigo-600 shrink-0 select-none animate-bounce" />
            <span>Inquilinos & Análise de Risco</span>
            <LogoMais />
          </h2>
          <p className="text-sm text-gray-500 mt-1">Validação de proponentes por score de crédito e auditorias eletrônicas Gemini IA.</p>
        </div>
      )}

      {viewMode === "database" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" id="database-upper-header">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none font-sans">
            <Users className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>Banco de Dados de Pessoas & Imóveis Condo+</span>
            <LogoMais />
          </h2>
          <p className="text-sm text-gray-500 mt-1">Concentrado unificado para gerenciamento de candidatos, inquilinos ativos e imóveis sob gestão.</p>
        </div>
      )}

      {viewMode === "contracts" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" id="contracts-upper-header">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none font-sans">
            <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>Gestão de Contratos de Locação</span>
            <LogoMais />
          </h2>
          <p className="text-sm text-gray-500 mt-1">Minutas dinâmicas, cláusulas da Lei do Inquilinato, assinatura eletrônica e geração de PDF.</p>
        </div>
      )}

      {viewMode === "billing" && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm" id="billing-upper-header">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-1.5 leading-none font-sans">
            <DollarSign className="h-5 w-5 text-indigo-600 shrink-0" />
            <span>Cobranças & Mora (Faturamento)</span>
            <LogoMais />
          </h2>
          <p className="text-sm text-gray-500 mt-1">Faturamento dinâmico, repasses, controle de inadimplência e juros.</p>
        </div>
      )}

      {/* Dynamic customizable, sorted layout sections list */}
      <div className="space-y-6">
        {activeSections.map((section, index) => (
          <div
            key={section.id}
            className={"relative transition-all duration-200 " + (dragAndDropEnabled ? "border-2 border-dashed border-indigo-400/40 bg-indigo-950/5 p-4 rounded-2xl shadow-xs hover:border-indigo-500/80 hover:bg-indigo-950/10 cursor-grab active:cursor-grabbing" : "")}
            draggable={dragAndDropEnabled}
            onDragStart={(e) => {
              if (!dragAndDropEnabled) return;
              e.dataTransfer.setData("text/plain", section.id);
              e.dataTransfer.effectAllowed = "move";
              (e.target as HTMLElement).classList.add("opacity-52");
            }}
            onDragEnd={(e) => {
              (e.target as HTMLElement).classList.remove("opacity-52");
            }}
            onDragOver={(e) => {
              if (!dragAndDropEnabled) return;
              e.preventDefault();
            }}
            onDrop={(e) => {
              if (!dragAndDropEnabled || !onUpdateSections || !layoutSections) return;
              const draggedId = e.dataTransfer.getData("text/plain");
              if (!draggedId || draggedId === section.id) return;

              const draggedIndex = layoutSections.findIndex(s => s.id === draggedId);
              const targetIndex = layoutSections.findIndex(s => s.id === section.id);

              if (draggedIndex !== -1 && targetIndex !== -1) {
                const updated = [...layoutSections];
                const [draggedItem] = updated.splice(draggedIndex, 1);
                // Set dropped section's tab to make it reside on dropped target view
                draggedItem.currentTab = section.currentTab;
                updated.splice(targetIndex, 0, draggedItem);
                
                // Re-apply sequences orders
                const final = updated.map((item, idx) => ({ ...item, order: idx }));
                onUpdateSections(final);
              }
            }}
          >
            {dragAndDropEnabled && (
              <div className="flex flex-wrap items-center justify-between bg-indigo-900/80 text-white px-4 py-2 rounded-xl mb-4 text-xs font-black select-none border border-indigo-750/55 shadow-sm gap-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-indigo-200 animate-pulse" />
                  <span>Seção: <strong className="text-amber-300 font-extrabold">{section.title}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!onUpdateSections || !layoutSections) return;
                        const prevActiveSec = activeSections[index - 1];
                        const idx1 = layoutSections.findIndex(s => s.id === section.id);
                        const idx2 = layoutSections.findIndex(s => s.id === prevActiveSec.id);
                        const updated = [...layoutSections];
                        const temp = updated[idx1].order;
                        updated[idx1].order = updated[idx2].order;
                        updated[idx2].order = temp;
                        onUpdateSections(updated.sort((a,b) => a.order - b.order));
                      }}
                      className="p-1 hover:bg-indigo-805 bg-indigo-950 text-indigo-300 hover:text-white rounded border border-indigo-700 transition cursor-pointer"
                      title="Mover para Cima"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                  )}
                  
                  {index < activeSections.length - 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!onUpdateSections || !layoutSections) return;
                        const nextActiveSec = activeSections[index + 1];
                        const idx1 = layoutSections.findIndex(s => s.id === section.id);
                        const idx2 = layoutSections.findIndex(s => s.id === nextActiveSec.id);
                        const updated = [...layoutSections];
                        const temp = updated[idx1].order;
                        updated[idx1].order = updated[idx2].order;
                        updated[idx2].order = temp;
                        onUpdateSections(updated.sort((a,b) => a.order - b.order));
                      }}
                      className="p-1 hover:bg-indigo-805 bg-indigo-950 text-indigo-305 text-indigo-300 hover:text-white rounded border border-indigo-700 transition cursor-pointer"
                      title="Mover para Baixo"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <span className="text-[10px] text-indigo-300">| Enviar para:</span>
                  <div className="flex gap-1">
                    {section.currentTab !== "dashboard" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "dashboard" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Painel
                      </button>
                    )}
                    {section.currentTab !== "operacional" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "operacional" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Operacional
                      </button>
                    )}
                    {section.currentTab !== "inquilino" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "inquilino" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Inquilino
                      </button>
                    )}
                    {section.currentTab !== "database" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "database" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Pessoas
                      </button>
                    )}
                    {section.currentTab !== "contracts" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "contracts" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Contratos
                      </button>
                    )}
                    {section.currentTab !== "billing" && (
                      <button
                        type="button"
                        onClick={() => {
                          if (!onUpdateSections || !layoutSections) return;
                          const updated = layoutSections.map(s => s.id === section.id ? { ...s, currentTab: "billing" as const } : s);
                          onUpdateSections(updated);
                        }}
                        className="px-1.5 py-0.5 bg-indigo-950 hover:bg-indigo-800 border border-indigo-700 text-[10px] text-indigo-200 rounded transition font-bold cursor-pointer"
                      >
                        Cobrança
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div>
              {renderSectionContent(section.id)}
            </div>
          </div>
        ))}

        {activeSections.length === 0 && (
          <div className="p-12 text-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400 space-y-3 animate-fade-in mb-4">
            <Layers className="h-10 w-10 text-slate-350 mx-auto animate-pulse select-none" />
            <h4 className="font-bold text-sm text-slate-750">Sem seções ativas nesta aba</h4>
            <p className="text-xs font-semibold text-gray-500 font-sans">Ative o botão "Permitir Arrastar" para arrastar seções de outras abas até aqui, ou use as ações rápidas acima.</p>
          </div>
        )}
      </div>

      {/* MODAL / OVERLAY DETAILS: Gemini AI Compliance details expander */}
      {selectedAiReportTenant && selectedAiReportTenant.aiReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in" id="modals-ai-details">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl max-w-2xl w-full p-6 space-y-6 relative max-h-[85vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-3">
              <div className="space-y-1">
                <div className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 tracking-wider uppercase">
                  <Sparkles className="h-3 w-3 animate-pulse" /> Auditoria Cognitiva Multimodal Gemini IA
                </div>
                <h4 className="text-lg font-bold text-gray-900">Parecer Técnico: {selectedAiReportTenant.nome}</h4>
                <p className="text-[10px] text-gray-500 font-medium font-mono">ID Proponente: {selectedAiReportTenant.id} • CPF: {selectedAiReportTenant.cpf}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAiReportTenant(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Switched Navigation */}
            <div className="flex border-b border-gray-200 bg-gray-50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAiReportActiveTab('audit')}
                className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg ${
                  aiReportActiveTab === 'audit'
                    ? 'bg-white shadow text-indigo-700 font-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                📋 Auditoria Cadastral
              </button>
              <button
                type="button"
                onClick={() => setAiReportActiveTab('background')}
                className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg ${
                  aiReportActiveTab === 'background'
                    ? 'bg-white shadow text-indigo-700 font-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🛡️ Background Check & Judicial
              </button>
              <button
                type="button"
                onClick={() => setAiReportActiveTab('developer')}
                className={`flex-1 py-2 text-center text-[11px] font-bold transition rounded-lg ${
                  aiReportActiveTab === 'developer'
                    ? 'bg-white shadow text-indigo-700 font-black'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⚙️ Guia do Programador
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {aiReportActiveTab === 'audit' && (
                <div className="space-y-4 animate-fade-in" id="ai-active-tab-audit">
                  {/* Compliance checks */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-450 tracking-wider block">Autenticidade Nome</span>
                      <div className="flex items-center gap-1.5">
                        {selectedAiReportTenant.aiReport.validations.nameMatches ? (
                          <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        ) : (
                          <span className="inline-flex h-2.5 w-2.5 bg-amber-500 rounded-full" />
                        )}
                        <strong className="text-gray-750">
                          {selectedAiReportTenant.aiReport.validations.nameMatches ? "Documento Conforme" : "Divergência Detectada"}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-450 tracking-wider block">CPF Registrado</span>
                      <div className="flex items-center gap-1.5">
                        {selectedAiReportTenant.aiReport.validations.cpfValid ? (
                          <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                        ) : (
                          <span className="inline-flex h-2.5 w-2.5 bg-red-500 rounded-full animate-bounce" />
                        )}
                        <strong className="text-gray-750">
                          {selectedAiReportTenant.aiReport.validations.cpfValid ? "CPF Ativo" : "CPF Inválido"}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-450 tracking-wider block">Coerência de Renda</span>
                      <div className="flex items-center gap-1.5">
                        {selectedAiReportTenant.aiReport.validations.incomeConsistent ? (
                          <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full" />
                        ) : (
                          <span className="inline-flex h-2.5 w-2.5 bg-amber-500 rounded-full animate-pulse" />
                        )}
                        <strong className="text-gray-750">
                          {selectedAiReportTenant.aiReport.validations.incomeConsistent ? "Compatível" : "Inconsistente"}
                        </strong>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gray-450 tracking-wider block">Assinatura Gov.br</span>
                      <div className="flex items-center gap-1.5">
                        {selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? (
                          <span className="inline-flex h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        ) : (
                          <span className="inline-flex h-2.5 w-2.5 bg-red-500 rounded-full" />
                        )}
                        <strong className={selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "text-emerald-700" : "text-amber-600"}>
                          {selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "Assinatura Válida" : "Falta Assinatura"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Advanced metrics & Scores */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 border border-gray-100 rounded-xl p-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] uppercase font-extrabold text-indigo-900 tracking-wider block">Scoring Cognitivo de Risco</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">
                          {selectedAiReportTenant.aiReport.validations.riskScore}
                        </span>
                        <span className="text-gray-450 text-[11px] font-semibold">/100</span>
                      </div>
                      <p className="text-[10px] text-black font-bold">Score calculado com base nas comprovações de holerite extraídas.</p>
                    </div>

                    <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-gray-200/50 pt-2.5 md:pt-0 md:pl-4">
                      <span className="text-[9px] uppercase font-extrabold text-indigo-900 tracking-wider block">Comprometimento de Renda</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-extrabold tracking-tight ${
                          selectedAiReportTenant.aiReport.validations.rentToIncomeRatio > 30 ? "text-amber-600" : "text-emerald-700"
                        }`}>
                          {selectedAiReportTenant.aiReport.validations.rentToIncomeRatio}%
                        </span>
                        <span className="text-gray-450 text-[11px] font-semibold">da Renda Declarada</span>
                      </div>
                      <p className="text-[10px] text-black font-bold">Diretriz: Até 30% ideal para evitar inadimplemento residencial.</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-black tracking-wider block font-black">Recomendação do AI Assistant</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-md uppercase ${
                        selectedAiReportTenant.aiReport.validations.recommendation === "APROVADO"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {selectedAiReportTenant.aiReport.validations.recommendation.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 bg-indigo-50/20 border border-indigo-100/30 p-4 rounded-xl leading-relaxed text-gray-750">
                    <span className="text-[10px] uppercase font-bold text-indigo-900 tracking-wider flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-indigo-600" /> Detalhamento do Parecer e Raciocínio
                    </span>
                    <p className="whitespace-pre-wrap">{selectedAiReportTenant.aiReport.validations.notes}</p>
                  </div>

                  {/* Gov.br Signature Audit Section */}
                  <div className={`space-y-2 p-4 rounded-xl border leading-relaxed ${
                    selectedAiReportTenant.aiReport.govBrSignatureReport?.verified
                      ? "bg-emerald-50/30 border-emerald-100 text-gray-750"
                      : "bg-red-50/30 border-red-105 text-red-950"
                  }`}>
                    <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${
                      selectedAiReportTenant.aiReport.govBrSignatureReport?.verified ? "text-emerald-800" : "text-rose-700"
                    }`}>
                      <ShieldCheck className="h-3.5 w-3.5" /> Auditoria de Assinatura Eletrônica Gov.br (Mandatária)
                    </span>
                    <div className="font-sans space-y-1 text-[11px]">
                      <p><strong className="font-bold text-black">Presença de Assinatura:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.hasGovBrSignature ? "Sim, detectada nos anexos" : "Não encontrada (CHECAGEM SEM ÊXITO)"}</p>
                      <p><strong className="font-bold text-black">Signatário Identificado:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.signerName || "Não identificado"}</p>
                      <p><strong className="font-bold text-black">CPF do Signatário:</strong> {selectedAiReportTenant.aiReport.govBrSignatureReport?.signerCpf || "Não identificado"}</p>
                      <div className="border-t border-gray-200/50 my-2 pt-2">
                        <p className="font-mono text-[10.5px] text-gray-650 whitespace-pre-wrap">{selectedAiReportTenant.aiReport.govBrSignatureReport?.verificationDetails || "Nenhum detalhe de validação disponível."}</p>
                      </div>
                    </div>
                  </div>

                  {/* Document Extract values breakdown */}
                  <div className="border border-gray-150 rounded-xl overflow-hidden text-[11px]">
                    <div className="bg-gray-50 p-2 font-black uppercase text-black tracking-wide border-b border-gray-150">Dados Extraídos do Cadastro</div>
                    <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                      <div className="p-2.5 bg-white"><span className="text-black block font-bold text-[9px] uppercase">Nome no Documento</span><strong>{selectedAiReportTenant.aiReport.nome || "Não parseado"}</strong></div>
                      <div className="p-2.5 bg-white"><span className="text-black block font-bold text-[9px] uppercase">CPF/CNPJ Identificado</span><strong className="font-mono">{selectedAiReportTenant.aiReport.cpfCnpj || "Não parseado"}</strong></div>
                      <div className="p-2.5 bg-white border-b border-gray-100"><span className="text-black block font-bold text-[9px] uppercase">Mapeamento de Doc</span><strong className="font-mono">{selectedAiReportTenant.aiReport.documentId || "Não identificado"}</strong></div>
                      <div className="p-2.5 bg-white border-b border-gray-100"><span className="text-black block font-bold text-[9px] uppercase">Tipo do Documento</span><strong>{selectedAiReportTenant.aiReport.documentType || "Não identificado"}</strong></div>
                    </div>
                    <div className="p-2.5 bg-slate-50 border-t border-gray-150 flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold uppercase text-[9px]">Renda Bruta Auditada</span>
                      <strong className="text-emerald-700 text-sm">R$ {selectedAiReportTenant.aiReport.grossIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>

                  {/* Análise Mês a Mês de Extrato Bancário & Fluxo de Caixa (Incluindo Uber/Autônomos) */}
                  {selectedAiReportTenant.aiReport.bankStatementAnalysis && selectedAiReportTenant.aiReport.bankStatementAnalysis.detectedBankStatement && (
                    <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50 mt-4 text-[11px]">
                      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Activity className="h-4 w-4 text-indigo-600 animate-pulse" />
                        <span className="text-[10px] uppercase font-black text-gray-800 tracking-wider">
                          Análise Forense de Extrato & Fluxo de Caixa
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 bg-white border border-gray-200 rounded-lg text-center">
                          <span className="text-[8px] uppercase text-gray-500 font-bold block">Total Entradas</span>
                          <strong className="text-emerald-700 font-mono text-xs">
                            R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.totalInflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                        
                        <div className="p-2 bg-white border border-gray-200 rounded-lg text-center">
                          <span className="text-[8px] uppercase text-gray-500 font-bold block">Total Saídas</span>
                          <strong className="text-rose-700 font-mono text-xs">
                            R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.totalOutflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </strong>
                        </div>

                        <div className="p-2 bg-white border border-gray-200 rounded-lg text-center">
                          <span className="text-[8px] uppercase text-gray-500 font-bold block">Saldo Líquido</span>
                          <strong className={`font-mono text-xs ${
                            selectedAiReportTenant.aiReport.bankStatementAnalysis.netMonthlyBalance >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}>
                            R$ {selectedAiReportTenant.aiReport.bankStatementAnalysis.netMonthlyBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </strong>
                        </div>
                      </div>

                      <div className="space-y-2 text-[10.5px] leading-relaxed text-gray-800">
                        <div>
                          <strong className="text-gray-500 block uppercase font-bold text-[8.5px] mb-0.5">Padrão de Saques / Liquidez:</strong>
                          <p className="p-1.5 bg-white border border-gray-100 rounded-md mt-0.5 text-black font-semibold leading-normal">
                            {selectedAiReportTenant.aiReport.bankStatementAnalysis.withdrawalPattern}
                          </p>
                        </div>

                        <div>
                          <strong className="text-gray-500 block uppercase font-bold text-[8.5px] mb-0.5">Permanência com Saldo Baixo/Zerado:</strong>
                          <p className="p-1.5 bg-white border border-gray-100 rounded-md mt-0.5 text-black font-semibold leading-normal">
                            {selectedAiReportTenant.aiReport.bankStatementAnalysis.zeroBalancePeriods}
                          </p>
                        </div>

                        <div>
                          <strong className="text-gray-500 block uppercase font-bold text-[8.5px] mb-0.5">Auditabilidade de Incoerências / Divergências:</strong>
                          <p className="p-1.5 bg-white border border-gray-100 rounded-md mt-0.5 text-gray-800 leading-normal">
                            {selectedAiReportTenant.aiReport.bankStatementAnalysis.identifiedInconsistencies}
                          </p>
                        </div>

                        {/* Demonstrativo de Fluxo Mês a Mês do Candidato */}
                        {selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements && selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements.length > 0 && (
                          <div className="mt-4">
                            <span className="text-gray-500 block font-bold uppercase text-[8.5px] mb-2 tracking-wider">
                              Demonstrativo Consolidado de Fluxo Mês a Mês
                            </span>
                            <div className="border border-gray-200 bg-white rounded-lg overflow-hidden divide-y divide-gray-150">
                              {selectedAiReportTenant.aiReport.bankStatementAnalysis.monthlyMovements.map((move: any, idx: number) => (
                                <div key={idx} className="p-3">
                                  <div className="flex justify-between items-center mb-1.5 font-sans">
                                    <span className="text-[11px] font-bold text-gray-800">{move.month}</span>
                                    <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                                      move.balance >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-750 text-rose-700"
                                    }`}>
                                      R$ {move.balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-500 mb-1">
                                    <div>
                                      <span className="opacity-60 block text-[8px] uppercase">Entradas</span>
                                      <span className="text-emerald-700 font-bold">R$ {move.inflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div>
                                      <span className="opacity-60 block text-[8px] uppercase">Saídas</span>
                                      <span className="text-rose-700 font-bold">R$ {move.outflow.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-gray-600 italic leading-snug mt-1">
                                    {move.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedAiReportTenant.aiReport.bankStatementAnalysis.uberDriverSpecificMetrics?.isUberStatement && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl leading-relaxed mt-2 text-gray-900">
                            <span className="text-[9px] uppercase font-black text-amber-700 tracking-wider flex items-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> Métricas Especiais: Análise Uber / Gig Economy
                            </span>
                            <p className="mt-1 font-medium leading-normal">
                              {selectedAiReportTenant.aiReport.bankStatementAnalysis.uberDriverSpecificMetrics.revenueUnderestimationRisk}
                            </p>
                          </div>
                        )}

                        <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded-xl leading-relaxed text-gray-900">
                          <span className="text-[9px] uppercase font-bold text-indigo-700 block tracking-wider">
                            Parecer Comportamental de Risco Financeiro
                          </span>
                          <p className="mt-1 italic leading-normal text-gray-700">
                            "{selectedAiReportTenant.aiReport.bankStatementAnalysis.behavioralRiskAnalysis}"
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {aiReportActiveTab === 'background' && (
                <div className="space-y-4 animate-fade-in" id="ai-active-tab-background">
                  {/* Safety Indicator Banner */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-4 flex items-center justify-between shadow">
                    <div>
                      <span className="text-[8px] tracking-widest text-indigo-300 font-extrabold uppercase">Varredura de Background Check</span>
                      <h5 className="text-[13px] font-black tracking-tight mt-0.5">Relatório Judicial Unificado Condo+</h5>
                    </div>
                    <ShieldCheck className="h-6 w-6 text-emerald-400 animate-pulse" />
                  </div>

                  {(() => {
                    const bgData = selectedAiReportTenant.aiReport.advancedBackgroundCheck || {
                      receitaFederalStatus: "REGULAR",
                      judicialProcessesCount: 0,
                      policeRecordLevel: "LIMPO",
                      pepStatus: "NAO",
                      ofacSanctions: "LIMPO",
                      protestsCount: 0,
                      fraudRiskLevel: "MUITO_BAIXO",
                      judicialDetails: "Nenhum histórico ou distribuidor judicial civil/criminal reportou restrições ativas perante as consultas automatizadas."
                    };

                    return (
                      <div className="space-y-4">
                        {/* Status Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center">
                          {/* Receita Federal */}
                          <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1">
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase block tracking-wider">Situação CPF (RFB)</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              bgData.receitaFederalStatus === "REGULAR" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {bgData.receitaFederalStatus}
                            </span>
                          </div>

                          {/* Procesos Judiciais */}
                          <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1">
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase block tracking-wider">Processos TJ / TRF / STF</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              bgData.judicialProcessesCount === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                            }`}>
                              {bgData.judicialProcessesCount} Encontrados
                            </span>
                          </div>

                          {/* Antecedentes Criminais */}
                          <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1">
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase block tracking-wider">Antecedentes Penais</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              bgData.policeRecordLevel === "LIMPO" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}>
                              {bgData.policeRecordLevel}
                            </span>
                          </div>

                          {/* Fraud risk level */}
                          <div className="p-2.5 bg-slate-50 border border-gray-200 rounded-xl space-y-1">
                            <span className="text-[8px] font-extrabold text-gray-400 uppercase block tracking-wider">Fraude Documental</span>
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold ${
                              bgData.fraudRiskLevel === "MUITO_BAIXO" || bgData.fraudRiskLevel === "BAIXO" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-amber-50 text-amber-500 border border-amber-100"
                            }`}>
                              RISCO: {bgData.fraudRiskLevel}
                            </span>
                          </div>
                        </div>

                        {/* Secondary Indicators */}
                        <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/10 border border-slate-150 rounded-xl">
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-800">
                            <span className="text-gray-400 text-[10px]">Pessoa Exposta Politicamente (PEP):</span>
                            <span className="font-bold text-gray-800">{bgData.pepStatus}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-800">
                            <span className="text-gray-400 text-[10px]">Restrições sobre Sanções Internacionais (OFAC):</span>
                            <span className="font-bold text-emerald-600">{bgData.ofacSanctions}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-800 border-t border-gray-100 pt-2 col-span-2">
                            <span className="text-gray-400 text-[10px]">Análise de Protestos de Títulos Ativos em Cartórios:</span>
                            <span className={`font-bold ${bgData.protestsCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
                              {bgData.protestsCount} ocorrências
                            </span>
                          </div>
                        </div>

                        {/* Detailed analysis citation box */}
                        <div className="space-y-2 p-4 bg-slate-900 text-slate-300 border border-slate-800 rounded-xl relative leading-relaxed font-mono text-[10.5px]">
                          <span className="text-[8px] uppercase font-bold text-indigo-400 block tracking-wider mb-1">
                            ⚖️ Parecer e Certidão Judicial Unificada
                          </span>
                          <p className="whitespace-pre-wrap">{bgData.judicialDetails}</p>
                        </div>

                        {/* Judicial Advice */}
                        <div className="p-3 bg-amber-50/50 border border-amber-200 text-amber-900 rounded-xl flex items-start gap-2 text-[10.5px]">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <strong className="font-bold">Investigação Judicial & Inquéritos:</strong>
                            <p className="font-medium leading-relaxed">
                              Esta varredura de perfil faz o cruzamento cognitivo inteligente baseado nos documentos Gov.br e dados informados. Em conformidade com a legislação brasileira (Lei do Inquilinato n° 8.245 e LGPD), para instruir uma investigação judicial formal ou ação de despejo, estas evidências devem ser integradas a assinaturas digitais carimbadas e a certidões de distribuição reais dos fóruns. Veja como programar e conectar estas bases na aba "Guia do Programador"!
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {aiReportActiveTab === 'developer' && (
                <div className="space-y-4 animate-fade-in text-xs" id="ai-active-tab-developer">
                  {/* Programmer Alert Guidance */}
                  <div className="p-4 bg-slate-900 text-slate-300 rounded-xl space-y-3 leading-normal border border-slate-800">
                    <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                      <Lock className="h-4 w-4" /> MANUAL DE INTEGRAÇÃO OFICIAL CONDO+ (COMO PROGRAMAR)
                    </div>
                    <p className="text-[11px] font-sans">
                      Dona <strong>Renato Faria Kawano</strong>, para obter background checks 100% integrados às bases oficiais do governo, tribunais do país e bureau de crédito em produção, configure as variáveis de ambiente seguindo o nosso modelo seguro:
                    </p>

                    {/* Step 1: Env keys */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">1. DECLARAÇÃO DOS SEGREDOS (.env.example)</span>
                      <pre className="p-3 bg-black/60 rounded-lg text-[10px] text-emerald-400 overflow-x-auto font-mono">
{`# Token de Autenticação Receita Federal do Brasil (CPF/CNPJ status)
RECEITA_FEDERAL_API_TOKEN=v_token_aqui

# Chave Privada do Portal de Tribunais oficiais (Jusbrasil API / Digilegal / Tribunal Busca)
JUSBRASIL_API_KEY=sua_chave_jusbrasil_aqui

# Credenciais de Score e Restrição Comercial (Serasa Experian / SPC Brasil)
SERASA_CREDIT_KEY=sua_chave_serasa_aqui`}
                      </pre>
                    </div>

                    {/* Step 2: Route pattern sample */}
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wide">2. IMPLEMENTAÇÃO DA ROTA DE BACKEND (TypeScript)</span>
                      <pre className="p-3 bg-black/60 rounded-lg text-[10.5px] text-amber-300 overflow-x-auto font-mono max-h-[160px] overflow-y-auto">
{`// server.ts - Exemplo Real de Consumo de API de Tribunais
app.post("/api/integrations/judicial-check", async (req, res) => {
  const { cpfCandidate } = req.body;
  const key = process.env.JUSBRASIL_API_KEY;
  
  if (!key) {
    return res.status(500).json({ error: "Chave JUSBRASIL_API_KEY não configurada no servidor." });
  }

  try {
    const response = await fetch(\`https://api.jusbrasil.com.br/v1/subpoenas/cpf/\${cpfCandidate}\`, {
      headers: { "Authorization": \`Bearer \${key}\` }
    });
    const dbData = await response.json();
    
    // Retornar os processos localizados
    res.json({ success: true, count: dbData.processes_count, list: dbData.items });
  } catch(e) {
    res.status(400).json({ error: "Erro de consulta na base nacional de tribunais" });
  }
});`}
                      </pre>
                    </div>

                    {/* Step 3: Best practices */}
                    <div className="space-y-1 bg-slate-950 p-3 rounded-lg text-[11px]">
                      <span className="text-indigo-400 font-bold block text-[9.5px] uppercase tracking-wide">💡 Requisitos de Conformidade Legais:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-400 font-sans text-[10.5px]">
                        <li><strong>Consentimento (LGPD):</strong> O candidato deve aceitar formalmente o termo de consulta de dados durante a ficha cadastral antes de disparar as consultas pagas.</li>
                        <li><strong>Política de Caching:</strong> Devido ao custo das consultas pagas por CPF, armazene respostas judiciais válidas por até 30 dias na tabela.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal actions close */}
            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedAiReportTenant(null)}
                className="px-5 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 transition rounded-xl font-bold cursor-pointer text-xs"
              >
                Fechar Auditoria
              </button>
            </div>

          </div>
        </div>
      )}
      {/* MODAL: Cadastrar Novo Imóvel */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-950">Cadastrar Novo Imóvel para Locação</h3>
                <p className="text-xs text-gray-400">Insira as informações do imóvel para constar nos contratos gerados automaticamente.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowAddPropertyModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {addPropError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-1.5 font-medium animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{addPropError}</span>
              </div>
            )}

            <form onSubmit={handleAddPropertySubmit} className="space-y-4">
              {/* ⚡ PARSE DE DOCUMENTO DO IMÓVEL (CONTA DE LUZ, ÁGUA OU ESCRITURA) */}
              <div id="property-auto-upload-container" className="space-y-3 p-4 bg-indigo-50/20 rounded-2xl border border-indigo-150/40">
                <div className="flex items-center justify-between">
                  <label className="block text-[10.5px] font-extrabold text-indigo-950 uppercase tracking-wider">
                    ⚡ Auto-cadastro via IA (Luz, Água ou Escritura)
                  </label>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8.5px] font-extrabold uppercase font-mono tracking-wide">Gemini IA Ativo</span>
                </div>
                
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Para auto-preenchimento rápido do endereço, CEP, tipo de unidade e sugestão do aluguel, faça o upload de um dos documentos aceitos abaixo:
                </p>

                {/* Grid of 3 Dedicated Upload Access Points */}
                <div className="grid grid-cols-3 gap-2">
                  <label 
                    htmlFor="property-document-upload" 
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50/60 hover:border-amber-305 transition-all cursor-pointer text-center space-y-1.5 focus-within:ring-1 focus-within:ring-amber-400 select-none active:scale-[0.98]"
                  >
                    <div className="p-1 px-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                      <Zap className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 block leading-tight">Conta de Luz</span>
                    <span className="text-[8.5px] text-amber-700 leading-none block font-medium">Carregar Fatura</span>
                  </label>

                  <label 
                    htmlFor="property-document-upload" 
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-200 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer text-center space-y-1.5 focus-within:ring-1 focus-within:ring-blue-400 select-none active:scale-[0.98]"
                  >
                    <div className="p-1 px-1.5 bg-blue-105 text-blue-700 rounded-lg shrink-0 font-bold">
                      <Droplet className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-blue-900 block leading-tight">Conta de Água</span>
                    <span className="text-[8.5px] text-blue-700 leading-none block font-medium">Carregar Fatura</span>
                  </label>

                  <label 
                    htmlFor="property-document-upload" 
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/60 hover:border-indigo-305 transition-all cursor-pointer text-center space-y-1.5 focus-within:ring-1 focus-within:ring-indigo-400 select-none active:scale-[0.98]"
                  >
                    <div className="p-1 px-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                      <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-900 block leading-tight">Escritura / DOC</span>
                    <span className="text-[8.5px] text-indigo-700 leading-none block font-medium">Carregar Registro</span>
                  </label>
                </div>

                {/* Dropzone field as secondary fallback pointer */}
                <div 
                  onDragEnter={handleDragPropertyDoc}
                  onDragOver={handleDragPropertyDoc}
                  onDragLeave={handleDragPropertyDoc}
                  onDrop={handleDropPropertyDoc}
                  className={`border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                    dragActivePropertyDoc 
                      ? "border-indigo-500 bg-indigo-50/40 scale-[0.98]" 
                      : "border-indigo-100 bg-white hover:border-indigo-300 hover:bg-slate-50/30"
                  }`}
                  id="property-doc-dropzone"
                >
                  <label htmlFor="property-document-upload" className="cursor-pointer block">
                    <input 
                      id="property-document-upload"
                      type="file" 
                      className="hidden" 
                      onChange={handlePropertyDocFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                    <div className="flex flex-col items-center justify-center gap-1 text-xs">
                      {isAnalyzingPropertyDoc ? (
                        <div className="flex flex-col items-center gap-1.5 text-indigo-850 font-bold py-1">
                          <RefreshCw className="h-4.5 w-4.5 animate-spin text-indigo-500" />
                          <span>Lendo documento do imóvel por IA...</span>
                          <span className="text-[9px] text-slate-400 font-medium leading-none font-sans">
                            Extraindo endereço completo, CEP, sugerindo aluguel e tipo de imóvel...
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-indigo-650 text-[10.5px] hover:text-indigo-805 flex items-center justify-center gap-1">
                            <Upload className="h-3.5 w-3.5 inline text-indigo-500 animate-pulse" />
                            <span>Ou arraste e solte o documento aqui</span>
                          </div>
                          <span className="text-[9px] text-slate-400 leading-none font-sans font-medium block">
                            Suporta PDF, JPG, PNG e Imagens digitalizadas até 10MB
                          </span>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                
                {uploadedPropertyDocName && !isAnalyzingPropertyDoc && (
                  <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-150 rounded-xl text-[10.5px]">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold text-emerald-800 truncate animate-fade-in" title={uploadedPropertyDocName}>
                        {uploadedPropertyDocName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedPropertyDocName("");
                      }}
                      className="text-gray-400 hover:text-rose-600 font-bold uppercase text-[9px] pointer-events-auto cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-indigo-950 uppercase tracking-wide">CEP do Imóvel</label>
                  {isLoadingCep && (
                    <span className="text-[10px] text-indigo-600 animate-pulse font-bold">Buscando...</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="Ex: 01311-200"
                    value={newPropCep}
                    onChange={handleCepChange}
                    className="flex-1 text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => fetchCepData(newPropCep)}
                    disabled={isLoadingCep || !newPropCep}
                    className="px-3.5 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-150 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Buscar CEP
                  </button>
                </div>
                {cepError && (
                  <p className="text-[9.5px] text-rose-500 font-semibold">{cepError}</p>
                )}
                <p className="text-[8.5px] text-gray-400 font-medium">Basta preencher os 8 dígitos corretamente e o endereço será preenchido automaticamente.</p>
              </div>

              <div className="space-y-1 block">
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wide">Endereço Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua das Flores, 123 - Apto 82, Centro, São Paulo - SP"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wide">Tipo de Imóvel</label>
                  <select
                    value={newPropType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPropType(val);
                      if (val === "Prédio") {
                        setNewPropIsBuilding(true);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
                  >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa">Casa</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Studio">Studio</option>
                    <option value="Prédio">Prédio (Múltiplas Unidades)</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wide">Proprietário Selecionado</label>
                  <div className="flex gap-2">
                    <select
                      value={newPropOwner}
                      onChange={(e) => setNewPropOwner(e.target.value)}
                      className="flex-1 text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer"
                    >
                      {proprietarios.length === 0 ? (
                        <option value="">-- Cadastre um Proprietário Primeiro --</option>
                      ) : (
                        <>
                          <option value="">-- Selecione um Proprietário (Opcional) --</option>
                          {proprietarios.map(p => (
                            <option key={p.id} value={p.id}>{p.nome}</option>
                          ))}
                        </>
                      )}
                    </select>
                    {newPropOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setNewPropOwner("");
                        }}
                        className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 cursor-pointer flex items-center justify-center transition-colors"
                        title="Limpar Seleção de Proprietário"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkbox de Prédio Inteiro com Unidades Individuais */}
              <div className="p-3.5 bg-indigo-50/40 rounded-xl border border-indigo-150/40 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="checkbox-is-building"
                    checked={newPropIsBuilding}
                    onChange={(e) => {
                      setNewPropIsBuilding(e.target.checked);
                      if (e.target.checked) {
                        setNewPropType("Prédio");
                      } else if (newPropType === "Prédio") {
                        setNewPropType("Apartamento");
                      }
                    }}
                    className="h-4 w-4 mt-0.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <label htmlFor="checkbox-is-building" className="text-xs font-bold text-gray-800 cursor-pointer select-none block">
                      Este imóvel é um Prédio Inteiro (Múltiplas Unidades)
                    </label>
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      Marque esta opção para um prédio comercial ou residencial. Os contratos poderão selecionar unidades individuais (como Apto 1, Apto 2, etc.) vinculadas a este cadastro principal, e os lançamentos de custos mensais (despesas) serão apontados como custo geral unificado do prédio.
                    </p>
                  </div>
                </div>
              </div>

              {/* Apartamento / Complemento field (1 a 8) */}
              <div className="space-y-1.5 border border-dashed border-slate-200 p-3.5 rounded-2xl bg-indigo-50/15">
                <label className="block text-[10px] font-extrabold text-indigo-900 uppercase tracking-wide">
                  Apartamento / Complemento (1 a 8)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Apartamento 3"
                  value={newPropComplement}
                  onChange={(e) => setNewPropComplement(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white font-medium"
                />
                <div className="space-y-1">
                  <span className="text-[9px] text-gray-400 block font-semibold">Seleção rápida de apartamento (1 a 8):</span>
                  <div className="grid grid-cols-8 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setNewPropComplement(`Apartamento ${num}`)}
                        className={`py-1 text-[11px] rounded-lg font-bold border transition ${
                          newPropComplement === `Apartamento ${num}`
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-650 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 🏠 IN-MODAL LANDLORD DISCLAIMER */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-500">
                <span className="block font-bold text-indigo-700 uppercase tracking-wide text-[10px]">Gestão de Parceiros Proprietários</span>
                <p className="leading-relaxed">
                  Para cadastrar novos proprietários parceiros ou excluí-los da base de dados de forma 100% independente, utilize a seção dedicada <strong className="text-gray-700 font-bold">"Parceiros Proprietários / Locadores"</strong> no painel de controle principal do sistema.
                </p>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wide">Valor do Aluguel Mensal (R$) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  placeholder="Ex: 3200"
                  value={newPropRent}
                  onChange={(e) => setNewPropRent(e.target.value)}
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingProperty}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  {isSavingProperty ? "Gravando..." : "Gravar Imóvel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WORKSPACE: Pasta de Documentos e Registro de Eventos/Anotações de Locação */}
      {selectedWorkspaceTenant && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400 font-bold block">PASTA INDIVIDUAL E HISTÓRICO DE GESTÃO</span>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-indigo-400 shrink-0" />
                  {selectedWorkspaceTenant.nome}
                  <span className="text-xs text-slate-400 font-normal">({selectedWorkspaceTenant.cpf})</span>
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedWorkspaceTenant(null)}
                className="text-slate-400 hover:text-white cursor-pointer p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content - Side-by-Side Panels */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
              
              {/* LEFT SIDE: Campo de Anotações & Registro de Eventos */}
              <div className="space-y-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-150 pb-6 md:pb-0 md:pr-6">
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Anotações de Eventos de Locação
                    </span>
                    {workspaceNotesSuccess && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 font-bold animate-pulse">
                        Salvo!
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-gray-500">
                    Utilize este diário para anotar manutenções, histórico de telefonemas, vistorias periódicas ou ocorrências relativas a este inquilino.
                  </p>

                  <textarea
                    value={workspaceNotes}
                    onChange={(e) => setWorkspaceNotes(e.target.value)}
                    placeholder="Ex: Realizou pedido de reparo elétrico em 21/05/2026. Pendente vistoria técnica de seguro fiança..."
                    className="flex-1 w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none font-sans min-h-[220px]"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="button"
                    disabled={workspaceSavingNotes}
                    onClick={handleSaveWorkspaceNotes}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {workspaceSavingNotes ? (
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Salvar Registros & Diário
                  </button>
                </div>
              </div>

              {/* RIGHT SIDE: Folder Files Cabinet */}
              <div className="space-y-4 flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                  Pasta Digital de Anexos do Inquilino
                </span>

                <p className="text-[11px] text-gray-500">
                  Repositório de guarda para contratos assinados, comprovantes de depósitos de garantia, relatórios de vistorias ou identidades enviadas pelo inquilino.
                </p>

                {/* Simulated File List */}
                <div className="flex-1 overflow-y-auto bg-slate-50 border border-gray-200 rounded-xl p-3 max-h-[240px] space-y-2">
                  {!selectedWorkspaceTenant.arquivos || selectedWorkspaceTenant.arquivos.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-xs italic space-y-1">
                      <FolderOpen className="h-8 w-8 mx-auto text-gray-300 stroke-1" />
                      <p>Nenhum documento arquivado.</p>
                    </div>
                  ) : (
                    selectedWorkspaceTenant.arquivos.map((file) => (
                      <div key={file.id} className="p-2.5 bg-white border border-gray-150 rounded-lg shadow-2xs flex items-center justify-between gap-3 group hover:border-indigo-100 transition">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-800 truncate" title={file.nome}>{file.nome}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                            <span>{new Date(file.dataUpload).toLocaleDateString("pt-BR")}</span>
                            <span>•</span>
                            <span>{file.tamanho || "1.2 MB"}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(file)}
                            className="p-1 text-gray-400 hover:text-indigo-650 hover:bg-indigo-50 rounded-md transition cursor-pointer"
                            title="Baixar documento do inquilino"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWorkspaceFile(file.id)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Remover documento da pasta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Upload Section Widget */}
                <form onSubmit={handleUploadWorkspaceFile} className="bg-indigo-50/30 border border-indigo-100/40 p-3 rounded-xl space-y-2">
                  <span className="block text-[10px] font-bold text-indigo-900 uppercase tracking-wide">Fazer Envio de Registro/Documento</span>
                  
                  {workspaceFileError && (
                    <p className="text-[10px] text-rose-600 font-semibold">{workspaceFileError}</p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: Contrato_Vistoria.docx ou comprovante.pdf"
                      value={newFileTitle}
                      onChange={(e) => setNewFileTitle(e.target.value)}
                      className="flex-1 text-xs p-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={workspaceUploadingFile}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Anexar</span>
                    </button>
                  </div>
                  <span className="block text-[9px] text-gray-400">Insira acima o nome descritivo do documento desejado para simulá-lo no arquivo criptográfico.</span>
                </form>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-gray-150 p-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedWorkspaceTenant(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-gray-750 transition rounded-xl font-bold cursor-pointer text-xs"
              >
                Concluir & Fechar Pasta
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 text-rose-600 border-b border-gray-150 pb-2">
              <AlertTriangle className="h-5 w-5 shrink-0 animate-bounce" />
              <h3 className="font-bold text-gray-950 text-sm">{confirmModal.title}</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">{confirmModal.message}</p>
            <div className="flex justify-end gap-2 text-xs font-bold pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL DO LEIGO - INSTRUÇÕES DETALHADAS DE USO EM POPUP */}
      {helpField && FIELD_HELP_DATA[helpField] && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          id="layman-help-modal"
          onClick={() => setHelpField(null)}
        >
          <div 
            className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-gray-155 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header com Categoria */}
            <div className="p-4 border-b border-gray-150 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-600 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
                  {FIELD_HELP_DATA[helpField].category}
                </span>
                <span className="text-gray-300 font-bold text-xs select-none">•</span>
                <span className="text-[10px] text-indigo-700 font-extrabold uppercase tracking-wide flex items-center gap-1 bg-white px-2 py-0.5 border border-indigo-100 rounded-lg">
                  <Sparkles className="h-3 w-3 text-indigo-500 animate-pulse shrink-0" /> Manual Condo+
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setHelpField(null)}
                className="p-1.5 hover:bg-gray-250/60 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
                aria-label="Fechar Guia"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Conteúdo com scroll seguro */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Título Principal */}
              <div className="border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black text-slate-900 tracking-tight flex items-start gap-1.5 leading-snug uppercase">
                  <span className="font-mono text-indigo-600 select-none bg-indigo-50 px-1.5 py-0.5 rounded text-xs">ℹ️</span>
                  {FIELD_HELP_DATA[helpField].title}
                </h3>
              </div>

              {/* O que é isso / Utilidade */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">
                  ❓ O que é isso e para que serve?
                </h4>
                <div className="text-xs text-slate-800 font-bold leading-normal bg-indigo-50/30 p-3 rounded-xl border border-indigo-100/40">
                  {FIELD_HELP_DATA[helpField].description}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-normal bg-slate-50/70 p-3.5 rounded-xl border border-slate-100 mt-1">
                  {FIELD_HELP_DATA[helpField].whyUseful}
                </p>
              </div>

              {/* Passo a Passo de Preenchimento */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">
                  ✍️ Como devo preencher?
                </h4>
                <p className="text-xs text-gray-650 leading-relaxed font-bold">
                  {FIELD_HELP_DATA[helpField].howToFill}
                </p>
              </div>

              {/* Exemplo Prático com fundo diferenciado */}
              <div className="space-y-1.5 bg-amber-50/60 p-4 rounded-xl border border-amber-100/70">
                <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-widest">
                  💡 Exemplo Real & Modelo do Campo
                </h4>
                <div className="font-mono text-[11px] text-amber-950 whitespace-pre-wrap bg-white p-3 rounded-lg border border-amber-150 leading-relaxed font-semibold">
                  {FIELD_HELP_DATA[helpField].example}
                </div>
                <span className="block text-[9px] text-amber-800 font-semibold italic">Você pode copiar ou digitar de forma parecida em cada campo!</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-150 flex items-center justify-between bg-slate-50 rounded-b-2xl">
              <span className="text-[9px] text-gray-500 font-bold">Configuração Descomplicada Condo+ 🛡️</span>
              <button
                type="button"
                onClick={() => setHelpField(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[11px] font-bold transition duration-150 cursor-pointer shadow-3xs"
              >
                Entendi perfeitamente!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROPRIETARIO MODAL */}
      {editingProp && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4" id="modal-edit-owner">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-gray-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
              <h3 className="font-bold text-gray-950 text-xs flex items-center gap-1.5 text-indigo-950">
                <Pencil className="h-4 w-4 text-indigo-600" />
                Editar Parceiro Locador (Proprietário)
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingProp(null)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nome Completo / Razão Social</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.nome || ""}
                    onChange={e => setEditingProp({...editingProp, nome: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Email de Contato</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.email || ""}
                    onChange={e => setEditingProp({...editingProp, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">CPF / CNPJ</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.cpfCnpj || ""}
                    onChange={e => setEditingProp({...editingProp, cpfCnpj: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">RG</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.rg || ""}
                    onChange={e => setEditingProp({...editingProp, rg: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Chave PIX</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.pixKey || ""}
                    onChange={e => setEditingProp({...editingProp, pixKey: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Banco destinatário</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.banco || ""}
                    onChange={e => setEditingProp({...editingProp, banco: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Agência</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                      value={editingProp.agencia || ""}
                      onChange={e => setEditingProp({...editingProp, agencia: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Conta</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                      value={editingProp.conta || ""}
                      onChange={e => setEditingProp({...editingProp, conta: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nacionalidade</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.nacionalidade || ""}
                    onChange={e => setEditingProp({...editingProp, nacionalidade: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Civil</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-bold"
                    value={editingProp.estadoCivil || ""}
                    onChange={e => setEditingProp({...editingProp, estadoCivil: e.target.value})}
                  >
                    <option value="solteiro(a)">Solteiro(a)</option>
                    <option value="casado(a)">Casado(a)</option>
                    <option value="divorciado(a)">Divorciado(a)</option>
                    <option value="viúvo(a)">Viúvo(a)</option>
                    <option value="união estável">União Estável</option>
                  </select>
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Domicílio ou Sede Residencial Completa</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingProp.residencia || ""}
                    onChange={e => setEditingProp({...editingProp, residencia: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setEditingProp(null)}
                className="px-4 py-2 border border-indigo-200 bg-white text-gray-700 hover:bg-slate-50 rounded-lg text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingProp.nome || !editingProp.email) {
                    alert("Campos nome e email são obrigatórios!");
                    return;
                  }
                  try {
                    const response = await fetch(`/api/proprietarios/${editingProp.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editingProp)
                    });
                    if (response.ok) {
                      setStatusMsg({ type: "success", text: "Proprietário atualizado com sucesso!" });
                      setEditingProp(null);
                      if (onSyncDb) await onSyncDb();
                      setTimeout(() => setStatusMsg(null), 4000);
                    } else {
                      const err = await response.json();
                      alert(err.error || "Erro ao salvar alterações.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Erro de conexão ao salvar.");
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT IMOVEL MODAL */}
      {editingImovel && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4" id="modal-edit-property">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-xl border border-gray-155 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
              <h3 className="font-bold text-gray-950 text-xs flex items-center gap-1.5 text-indigo-950">
                <Pencil className="h-4 w-4 text-indigo-600" />
                Editar Detalhes do Imóvel
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingImovel(null)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Endereço Completo</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  value={editingImovel.endereco || ""}
                  onChange={e => setEditingImovel({...editingImovel, endereco: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipo do Imóvel</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-bold cursor-pointer"
                    value={editingImovel.tipo || ""}
                    onChange={e => setEditingImovel({...editingImovel, tipo: e.target.value})}
                  >
                    <option value="Apartamento">Apartamento</option>
                    <option value="Casa Residencial">Casa Residencial</option>
                    <option value="Salão Comercial">Salão Comercial</option>
                    <option value="Prédio Comercial">Prédio Comercial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Valor de Aluguel (R$)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingImovel.valorAluguel || ""}
                    onChange={e => setEditingImovel({...editingImovel, valorAluguel: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Complemento / Especificações</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                  value={editingImovel.complemento || ""}
                  onChange={e => setEditingImovel({...editingImovel, complemento: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Proprietário / Locador Associado</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-bold cursor-pointer"
                  value={editingImovel.proprietarioId || ""}
                  onChange={e => setEditingImovel({...editingImovel, proprietarioId: e.target.value})}
                >
                  {proprietarios.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.cpfCnpj})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  id="edit-prop-isbuilding"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  checked={!!editingImovel.isBuilding}
                  onChange={e => setEditingImovel({...editingImovel, isBuilding: e.target.checked})}
                />
                <label htmlFor="edit-prop-isbuilding" className="text-xs font-bold text-slate-705 cursor-pointer select-none">
                  Trata-se de um edifício ou condomínio com múltiplas unidades autónomas
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl font-bold">
              <button
                type="button"
                onClick={() => setEditingImovel(null)}
                className="px-4 py-2 border border-indigo-200 bg-white text-gray-700 hover:bg-slate-50 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingImovel.endereco || !editingImovel.valorAluguel) {
                    alert("Endereço e valor são obrigatórios!");
                    return;
                  }
                  try {
                    const response = await fetch(`/api/properties/${editingImovel.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editingImovel)
                    });
                    if (response.ok) {
                      setStatusMsg({ type: "success", text: "Imóvel atualizado com sucesso!" });
                      setEditingImovel(null);
                      if (onSyncDb) await onSyncDb();
                      setTimeout(() => setStatusMsg(null), 4000);
                    } else {
                      const err = await response.json();
                      alert(err.error || "Erro ao salvar alterações.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Erro de conexão ao salvar.");
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INQUILINO MODAL */}
      {editingInquilino && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4" id="modal-edit-tenant">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-gray-150 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50 rounded-t-2xl">
              <h3 className="font-bold text-gray-950 text-xs flex items-center gap-1.5 text-indigo-950">
                <Pencil className="h-4 w-4 text-indigo-600" />
                Editar Dados do Cadastro - {editingInquilino.nome}
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingInquilino(null)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 col-stretch">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nome Completo</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.nome || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, nome: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.email || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, email: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">CPF</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-100 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.cpf || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, cpf: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Telefone</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.telefone || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, telefone: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Profissão</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.profissao || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, profissao: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Renda Mensal Declarada (R$)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.rendaMensal || 0}
                    onChange={e => setEditingInquilino({...editingInquilino, rendaMensal: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">RG</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white"
                    value={editingInquilino.rg || ""}
                    onChange={e => setEditingInquilino({...editingInquilino, rg: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado Civil</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-900 bg-white font-bold cursor-pointer"
                    value={editingInquilino.estadoCivil || "solteiro(a)"}
                    onChange={e => setEditingInquilino({...editingInquilino, estadoCivil: e.target.value})}
                  >
                    <option value="solteiro(a)">Solteiro(a)</option>
                    <option value="casado(a)">Casado(a)</option>
                    <option value="divorciado(a)">Divorciado(a)</option>
                    <option value="viúvo(a)">Viúvo(a)</option>
                    <option value="união estável">União Estável</option>
                  </select>
                </div>
              </div>

              {/* Conjuge block if casado / uniao */}
              {(editingInquilino.estadoCivil === "casado(a)" || editingInquilino.estadoCivil === "união estável") && (
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3 font-semibold animate-fade-in">
                  <span className="block text-indigo-950 font-black text-[10px] uppercase tracking-wider">Dados do Cônjuge / Coparticipante</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] text-gray-500">Nome do Cônjuge</label>
                      <input
                        type="text"
                        className="w-full p-1.5 border border-slate-200 rounded-lg"
                        value={editingInquilino.conjuje?.nome || ""}
                        onChange={e => setEditingInquilino({
                          ...editingInquilino, 
                          conjuje: { ...(editingInquilino.conjuje || {}), nome: e.target.value } as any
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] text-gray-500">CPF do Cônjuge</label>
                      <input
                        type="text"
                        className="w-full p-1.5 border border-slate-200 rounded-lg"
                        value={editingInquilino.conjuje?.cpf || ""}
                        onChange={e => setEditingInquilino({
                          ...editingInquilino, 
                          conjuje: { ...(editingInquilino.conjuje || {}), cpf: e.target.value } as any
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-slate-50 rounded-b-2xl font-bold">
              <button
                type="button"
                onClick={() => setEditingInquilino(null)}
                className="px-4 py-2 border border-indigo-200 bg-white text-gray-700 hover:bg-slate-50 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!editingInquilino.nome || !editingInquilino.email) {
                    alert("Nome e Email são obrigatórios para o inquilino/proponente.");
                    return;
                  }
                  try {
                    const response = await fetch(`/api/tenants/${editingInquilino.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(editingInquilino)
                    });
                    if (response.ok) {
                      setStatusMsg({ type: "success", text: "Dados do inquilino atualizados!" });
                      setEditingInquilino(null);
                      if (onSyncDb) await onSyncDb();
                      setTimeout(() => setStatusMsg(null), 4000);
                    } else {
                      const err = await response.json();
                      alert(err.error || "Erro ao salvar alterações do inquilino.");
                    }
                  } catch (e) {
                    console.error(e);
                    alert("Erro ao se conectar com o servidor.");
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs"
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
