export interface Proprietario {
  id: string;
  nome: string;
  email: string;
  cpfCnpj: string;
  rg?: string;
  nacionalidade?: string;
  estadoCivil?: string;
  residencia?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  pixKey: string;
}

export interface Imovel {
  id: string;
  endereco: string;
  tipo: string; // "Apartamento" | "Casa" | "Comercial" etc.
  valorAluguel: number;
  proprietarioId: string;
  proprietario?: Proprietario;
  complemento?: string; // Apartamento/Kitnet de 1 a 8 ou customizado
  isBuilding?: boolean; // Indica se é um prédio inteiro com múltiplos aptos alugados individualmente
}

export interface Inquilino {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  rendaMensal: number;
  scoreCredito?: number;
  scoreRisk?: 'BAIXO' | 'MEDIO' | 'ALTO';
  validatedDocs?: {
    cnhRg?: boolean;
    paystub?: boolean;
    incomeProof?: boolean;
  };
  rg?: string;
  estadoCivil?: string;
  profissao?: string;
  telefone?: string;
  selectedPropertyId?: string;
  status?: 'PENDENTE' | 'APROVADO' | 'RECUSADO';
  aiReport?: OnboardingExtractedResult;
  anotacoes?: string;
  arquivos?: Array<{
    id: string;
    nome: string;
    dataUpload: string;
    tamanho?: string;
    url?: string;
    base64?: string;
    mimeType?: string;
  }>;
  conjuge?: {
    nome: string;
    cpf: string;
    rg?: string;
    email?: string;
    telefone?: string;
    profissao?: string;
    rendaMensal?: number;
    arquivos?: Array<{
      id: string;
      nome: string;
      dataUpload: string;
      tamanho?: string;
      url?: string;
      base64?: string;
      mimeType?: string;
    }>;
  };
  rendaConjunta?: number;
}

export interface Contrato {
  id: string;
  inquilinoId: string;
  imovelId: string;
  dataInicio: string;
  dataFim: string;
  diaVencimento: number;
  taxaEntrada?: number;
  status: 'EM_ONBOARDING' | 'ATIVO' | 'FINALIZADO' | 'ARQUIVADO';
  rgLocatario?: string;
  estadoCivilLocatario?: string;
  profissaoLocatario?: string;
  inquilino?: Inquilino;
  imovel?: Imovel;
  faturamentos?: Faturamento[];
  assinaturaLocadorGovBr?: boolean;
  assinaturaLocadorData?: string;
  assinaturaHashGovBr?: string;
  observacoesInterrupcao?: string;
  unidade?: string; // Indica a unidade vinculada ao contrato se for prédio inteiro (Ex: Apto 101, Unidade 3)
  customTemplateName?: string;
  customTemplateContent?: string;
  isDraftManuallyEdited?: boolean;
  devolutivaContratoAssinadoFileName?: string;
  devolutivaContratoAssinadoFileBase64?: string;
  assinaturaDigitalInquilinoGovBr?: boolean;
  assinaturaDigitalInquilinoData?: string;
  assinaturaInquilinoHashGovBr?: string;
  govBrVerifiedSignature?: boolean;
  govBrVerificationDetails?: {
    signerName: string;
    signerCpf: string;
    signatureDate: string;
    certificateStatus: string;
    verificationHash: string;
    authority: string;
    integrityVerified: boolean;
  };
  overriddenLocadorNome?: string;
  overriddenLocadorCpf?: string;
  overriddenLocadorRg?: string;
  overriddenLocadorResidencia?: string;
  overriddenLocadorNacionalidade?: string;
  overriddenLocadorEstadoCivil?: string;
  overriddenLocadorBanco?: string;
  overriddenLocadorAgencia?: string;
  overriddenLocadorConta?: string;
  overriddenLocadorPix?: string;
  overriddenEnderecoImovel?: string;
  overriddenValorAluguel?: number;
  overriddenDiaVencimento?: number;
  overriddenTaxaEntrada?: number;
  overriddenLocatarioNome?: string;
  overriddenLocatarioCpf?: string;
  overriddenConjugeNome?: string;
  overriddenConjugeCpf?: string;
  overriddenConjugeRg?: string;
  overriddenConjugeProfissao?: string;
  overriddenConjugeEmail?: string;
  overriddenConjugeTelefone?: string;
}

export interface Faturamento {
  id: string;
  contratoId: string;
  valorBase: number;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  multaAplicada: number;
  jurosAplicados: number;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO';
  externalId?: string; // Gateway ticket/boleto ID
}

export interface Repasse {
  id: string;
  faturamentoId: string;
  contratoId: string;
  proprietarioId: string;
  valorOriginal: number;             // Valor pago pelo inquilino (base + juros + multa)
  taxaAdministrativaPercent: number; // Porcentagem (ex: 10)
  valorTaxaAdm: number;              // Valor retido pela administração (10% do valorOriginal)
  valorLiquido: number;              // Valor líquido repassado ao proprietário (valorOriginal - valorTaxaAdm)
  pixKey: string;                    // Chave Pix do proprietário usada para transferência
  dataPagamentoInquilino: string;    // Data em que o boleto foi pago
  status: 'PAGO' | 'AGENDADO' | 'PENDENTE' | 'FALHO';
  dataRepasse?: string;              // Data da liquidação do repasse
  hashTransacao?: string;            // Hash da transação simulada ou ID do log
  errorMessage?: string;             // Mensagem de erro caso o pagamento falhe / esteja incompleto
  bancoDestino?: string;
  agenciaDestino?: string;
  contaDestino?: string;
  nomeProprietario?: string;
}

export interface OnboardingExtractedResult {
  nome: string;
  cpfCnpj: string;
  birthDate: string;
  grossIncome: number;
  documentId: string;
  documentType: 'RG' | 'CNH' | 'OUTRO';
  profissao?: string;
  estadoCivil?: string;
  email?: string;
  telefone?: string;
  conjugeNome?: string;
  conjugeCpf?: string;
  conjugeRg?: string;
  conjugeEmail?: string;
  conjugeTelefone?: string;
  conjugeProfissao?: string;
  validations: {
    nameMatches: boolean;
    cpfValid: boolean;
    incomeConsistent: boolean;
    riskScore: number; // 0 - 100
    rentToIncomeRatio: number; // e.g. 25%
    recommendation: 'APROVADO' | 'REVISAO_MANUAL' | 'RECUSADO';
    notes: string;
  };
  advancedBackgroundCheck?: {
    receitaFederalStatus: 'REGULAR' | 'SUSPENSO' | 'PENDENTE' | 'NAO_ENCONTRADO';
    judicialProcessesCount: number;
    policeRecordLevel: 'LIMPO' | 'RISCO_MODERADO' | 'REVISAO_CRITERIOSA' | 'RESTRIÇÃO_CONSTATADA';
    pepStatus: 'SIM' | 'NAO';
    ofacSanctions: 'LIMPO' | 'AVISO';
    protestsCount: number;
    fraudRiskLevel: 'MUITO_BAIXO' | 'BAIXO' | 'MEDIO' | 'ALTO';
    judicialDetails: string;
  };
  govBrSignatureReport?: {
    verified: boolean;
    hasGovBrSignature: boolean;
    signerName: string;
    signerCpf: string;
    verificationDetails: string;
  };
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
}

export interface AdvancedFinancialCalculation {
  baseRent: number;
  delayInDays: number;
  fine: number; // Fine/Multa (10% of base)
  interest: number; // Interest/Juros (1%/30 * d * base)
  totalDue: number;
}

export interface Despesa {
  id: string;
  imovelId: string;
  mesAno: string; // e.g. "2026-05"
  categoria: 'AGUA' | 'LUZ' | 'INTERNET' | 'MANUTENCAO' | 'OUTROS';
  valor: number;
  dataDespesa: string;
  descricao: string;
  arquivoNome?: string;
  arquivoBase64?: string;
  aiComentario?: string;
}

export interface AIAprendizadoPattern {
  id: string;
  tipoDocumento: 'RG' | 'CNH' | 'COMPROVANTE_RENDA' | 'FATURA_DESPESA' | 'OUTRO';
  nomeArquivoPattern: string; // Ex: "contrato_maria" or "cnh_renato"
  conteudoTextoPattern: string; // Ex: "Renato Faria Kawano" or search strings
  dadosSaneados: {
    nome?: string;
    rg?: string;
    cpf?: string;
    email?: string;
    endereco?: string;
    rendaMensal?: number;
    banco?: string;
    agencia?: string;
    conta?: string;
    pixKey?: string;
    valor?: number;
    categoria?: string;
    descricao?: string;
    aiComentario?: string;
    [key: string]: any;
  };
  observacoesTreinamento: string;
  createdAt: string;
}

export interface ContractModel {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
  finePercent: number;
  interestMonthlyPercent: number;
}



