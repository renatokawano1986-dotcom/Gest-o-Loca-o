import React, { useState, useEffect } from "react";
import { 
  FileText, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  QrCode, 
  Copy, 
  Printer, 
  LogOut, 
  User, 
  Key, 
  CreditCard,
  Hash,
  ShieldCheck,
  Check,
  Clock,
  ExternalLink,
  ArrowRight,
  FolderOpen,
  Download,
  Eye,
  UploadCloud,
  FileCheck,
  Award,
  Smartphone
} from "lucide-react";
import { Inquilino, Contrato, Faturamento } from "../types";
import { LogoMais } from "./LogoMais";
import { jsPDF } from "jspdf";
import {
  substituteContractVariables,
  getValorAluguelPorExtenso,
  formatarData,
  calcularMeses,
  mesesPorExtenso
} from "./ContractManagement";

interface TenantPortalProps {
  inquilinos: Inquilino[];
  contratos: Contrato[];
  faturamentos: Faturamento[];
  onSyncDb: () => Promise<void>;
  onTriggerInstall?: () => void;
}

export default function TenantPortal({ 
  inquilinos, 
  contratos, 
  faturamentos, 
  onSyncDb,
  onTriggerInstall
}: TenantPortalProps) {
  
  // Credentials / Authentication
  const [username, setUsername] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Authorized Tenant State (persisted in session/state)
  const [currentUser, setCurrentUser] = useState<Inquilino | null>(() => {
    const saved = localStorage.getItem("proptech_tenant_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Simulated Generation Date (Defaults to today in YYYY-MM-DD, non-retroactive)
  const [generationDate, setGenerationDate] = useState<string>(() => {
    return getTodayDateString();
  });

  // UI state for generated payment documents
  const [activePaymentModal, setActivePaymentModal] = useState<{
    faturamento: Faturamento;
    fine: number;
    interest: number;
    total: number;
    daysDelay: number;
    emissionDate: string;
    type: "boleto" | "pix";
  } | null>(null);

  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [activeConsultFile, setActiveConsultFile] = useState<{ id?: string; nome: string; dataUpload: string; tamanho?: string } | null>(null);

  // States for tenant contract devolution flow
  const [devolutivaFile, setDevolutivaFile] = useState<{ fileName: string; fileBase64: string } | null>(null);
  const [devolutivaHash, setDevolutivaHash] = useState<string>("");
  const [devolutivaLoading, setDevolutivaLoading] = useState<boolean>(false);
  const [devolutivaSuccess, setDevolutivaSuccess] = useState<string | null>(null);
  const [devolutivaError, setDevolutivaError] = useState<string | null>(null);

  // Sync logged in user if database updates in the background
  useEffect(() => {
    if (currentUser) {
      const updated = inquilinos.find(i => i.id === currentUser.id);
      if (updated) {
        if (updated.status !== "APROVADO") {
          // If status was revoked by admin, log out
          handleLogout();
        } else {
          setCurrentUser(updated);
          localStorage.setItem("proptech_tenant_user", JSON.stringify(updated));
        }
      }
    }
  }, [inquilinos]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!username.trim() || !cpf.trim()) {
      setLoginError("Por favor, preencha o Usuário (Primeiro Nome) e a Senha (CPF).");
      return;
    }

    // Clean inputs for flexible comparison
    const targetFirstName = username.trim().toLowerCase();
    const targetCpf = cpf.replace(/\D/g, "");

    // Find in existing approved inquilinos
    const matched = inquilinos.find(i => {
      const cleanDbFirstName = i.nome.trim().split(/\s+/)[0].toLowerCase();
      const cleanDbCpf = i.cpf.replace(/\D/g, "");
      return cleanDbFirstName === targetFirstName && cleanDbCpf === targetCpf;
    });

    if (!matched) {
      // Check if credentials match a PENDING or RECUSADO tenant to provide precise guidance
      const pendingMatch = inquilinos.find(i => {
        const cleanDbFirstName = i.nome.trim().split(/\s+/)[0].toLowerCase();
        const cleanDbCpf = i.cpf.replace(/\D/g, "");
        return cleanDbFirstName === targetFirstName && cleanDbCpf === targetCpf;
      });

      if (pendingMatch) {
        if (pendingMatch.status === "PENDENTE") {
          setLoginError("Seu cadastro está em análise. O portal estará disponível assim que sua candidatura for APROVADA.");
        } else if (pendingMatch.status === "RECUSADO") {
          setLoginError("Seu cadastro de candidatura não foi aprovado pela administração. Acesso indisponível.");
        } else {
          setLoginError("Sua candidatura ainda não foi aprovada pela administração imobiliária.");
        }
      } else {
        setLoginError("Dados de acesso incorretos. Verifique se digitou o seu primeiro nome e o CPF cadastrado corretamente.");
      }
      return;
    }

    if (matched.status !== "APROVADO") {
      setLoginError("Sua candidatura ainda não possui status 'APROVADO'.");
      return;
    }

    // Success login
    setCurrentUser(matched);
    localStorage.setItem("proptech_tenant_user", JSON.stringify(matched));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("proptech_tenant_user");
    setActivePaymentModal(null);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadContractPDF = (contract: Contrato) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const leftMargin = 20;
    const rightMargin = 190;
    const contentWidth = 170; // 210 - 20 - 20
    let yPos = 25;

    // Helper to print text paragraphs with auto word wrap & page breaks
    const printParagraph = (text: string, title?: string, isBoldTitle = true) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }

      if (title) {
        doc.setFont("helvetica", isBoldTitle ? "bold" : "normal");
        doc.setFontSize(10);
        doc.text(title, leftMargin, yPos);
        yPos += 5.5;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 5.2;
      });
      yPos += 4; // Spacing after paragraph
    };

    // Header Decoration
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("CONTRATO DE LOCAÇÃO RESIDENCIAL", 105, yPos, { align: "center" });
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Identificação Digital da Minuta: PRTOS-${contract.id.toUpperCase()} • Padrão Renato Faria Kawano`, 105, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPos += 12;

    const prop = contract.imovel?.proprietario;

    const locadorNome = contract.overriddenLocadorNome || prop?.nome || "Renato Faria Kawano";
    const locadorCpf = contract.overriddenLocadorCpf || prop?.cpfCnpj || "341.602.388-90";
    const locadorRg = contract.overriddenLocadorRg || prop?.rg || "33.698.982-9";
    const locadorResidencia = contract.overriddenLocadorResidencia || prop?.residencia || "Santo André, SP";
    const locadorNacionalidade = contract.overriddenLocadorNacionalidade || prop?.nacionalidade || "brasileiro(a)";
    const locadorEstadoCivil = contract.overriddenLocadorEstadoCivil || prop?.estadoCivil || "solteiro(a)";
    const locadorBanco = contract.overriddenLocadorBanco || prop?.banco || "Banco Itaú";
    const locadorAgencia = contract.overriddenLocadorAgencia || prop?.agencia || "1063";
    const locadorConta = contract.overriddenLocadorConta || prop?.conta || "31860-2";
    const locadorPix = contract.overriddenLocadorPix || prop?.pixKey || "341.602.388-90";

    const locatarioNome = contract.overriddenLocatarioNome || contract.inquilino?.nome || currentUser?.nome || "Nome do Locatário";
    const locatarioCpf = contract.overriddenLocatarioCpf || contract.inquilino?.cpf || currentUser?.cpf || "000.000.000-00";
    const locatarioRg = contract.rgLocatario || currentUser?.rg || "00.000.000-0";
    const locatarioEstadoCivil = contract.estadoCivilLocatario || currentUser?.estadoCivil || "Solteiro(a)";
    const locatarioProfissao = contract.profissaoLocatario || currentUser?.profissao || "Profissão";

    const enderecoImovel = contract.overriddenEnderecoImovel || (contract.imovel?.endereco 
      ? `${contract.imovel.endereco}${contract.unidade ? ` - Unidade: ${contract.unidade}` : (contract.imovel.complemento ? ` - ${contract.imovel.complemento}` : "")}`
      : "(Endereço do Imóvel)");
    const valorAluguelNum = contract.overriddenValorAluguel || contract.imovel?.valorAluguel || 1500;
    const valorAluguelExtenso = getValorAluguelPorExtenso(valorAluguelNum);
    const diaVencimento = contract.overriddenDiaVencimento || contract.diaVencimento || 10;
    const dataInicioFormated = formatarData(contract.dataInicio);
    const dataFimFormated = formatarData(contract.dataFim);
    const mesesVigencia = mesesPorExtenso(calcularMeses(contract.dataInicio, contract.dataFim));

    if (contract.customTemplateContent) {
      const substituted = substituteContractVariables(contract.customTemplateContent, contract, {
        locadorNome,
        locadorCpf,
        locadorRg,
        locadorResidencia,
        locadorNacionalidade,
        locadorEstadoCivil,
        locadorBanco,
        locadorAgencia,
        locadorConta,
        locadorPix,
        locatarioNome,
        locatarioCpf,
        locatarioRg,
        locatarioEstadoCivil,
        locatarioProfissao,
        enderecoImovel,
        valorAluguel: valorAluguelNum,
        diaVencimento
      });

      const rawLines = substituted.split("\n");
      
      const printRichLine = (rawLine: string) => {
        const trimmedLine = rawLine.trim();
        
        if (trimmedLine === "--PAGE--") {
          doc.addPage();
          yPos = 25;
          return;
        }

        if (trimmedLine === "") {
          yPos += 4.5;
          return;
        }

        // Parse bold elements in this line
        const normalized = rawLine
          .replace(/<b>/g, "**")
          .replace(/<\/b>/g, "**")
          .replace(/<strong>/g, "**")
          .replace(/<\/strong>/g, "**");

        const chunks = normalized.split("**");
        const segments: Array<{ text: string; isBold: boolean }> = [];
        
        // Detect if the entire line should be bolded as a title fallback
        const isWholeLineBoldTitle = trimmedLine.length < 120 && (
          /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s\d—\-–:]+$/.test(trimmedLine) ||
          trimmedLine.startsWith("CLÁUSULA") ||
          trimmedLine.startsWith("FORO") ||
          trimmedLine.startsWith("QUALIFICAÇÃO") ||
          trimmedLine.startsWith("CONTRATO") ||
          trimmedLine.startsWith("PARÁGRAFO") ||
          trimmedLine.startsWith("DO INADIMPLEMENTO") ||
          trimmedLine.startsWith("DO PRAZO") ||
          trimmedLine.startsWith("DO VALOR") ||
          trimmedLine.startsWith("DO VENCIMENTO")
        );

        chunks.forEach((chunk, index) => {
          const isBold = (index % 2 === 1) || isWholeLineBoldTitle;
          if (chunk) {
            segments.push({ text: chunk, isBold });
          }
        });

        if (segments.length === 0) {
          segments.push({ text: "", isBold: false });
        }

        interface RichToken {
          text: string;
          isBold: boolean;
        }
        const tokens: RichToken[] = [];

        segments.forEach((seg) => {
          const parts = seg.text.split(/([ \t]+)/);
          parts.forEach((part) => {
            if (part) {
              tokens.push({ text: part, isBold: seg.isBold });
            }
          });
        });

        let currentX = leftMargin;
        const lineGap = 4.8;
        const pageLimit = 275;

        type LineDrawCall = { text: string; x: number; isBold: boolean };
        let currentLineCalls: LineDrawCall[] = [];

        tokens.forEach((token) => {
          doc.setFont("times", token.isBold ? "bold" : "normal");
          doc.setFontSize(9.5);
          const tokenWidth = doc.getTextWidth(token.text);

          if (currentX + tokenWidth > rightMargin && currentX > leftMargin) {
            if (yPos > pageLimit) {
              doc.addPage();
              yPos = 25;
            }
            currentLineCalls.forEach((call) => {
              doc.setFont("times", call.isBold ? "bold" : "normal");
              doc.setFontSize(9.5);
              doc.text(call.text, call.x, yPos);
            });
            yPos += lineGap;
            currentX = leftMargin;
            currentLineCalls = [];

            if (token.text.trim() === "") {
              return; // skip leading spaces on line wrapped tokens
            }
          }

          currentLineCalls.push({ text: token.text, x: currentX, isBold: token.isBold });
          currentX += tokenWidth;
        });

        if (currentLineCalls.length > 0) {
          if (yPos > pageLimit) {
            doc.addPage();
            yPos = 25;
          }
          currentLineCalls.forEach((call) => {
            doc.setFont("times", call.isBold ? "bold" : "normal");
            doc.setFontSize(9.5);
            doc.text(call.text, call.x, yPos);
          });
          yPos += lineGap;
        }
      };

      rawLines.forEach((rawLine) => {
        printRichLine(rawLine);
      });
    } else {
      // Qualificação das Partes
      printParagraph(
        `Pelo presente instrumento particular do contrato, de um lado ${locadorNome}, ${locadorNacionalidade}, ${locadorEstadoCivil}, portador de RG ${locadorRg} e do CPF ${locadorCpf} residente em ${locadorResidencia}, como locador e de outro o Sr.(a) ${locatarioNome}, brasileiro(a), ${locatarioEstadoCivil}, portador(a) do RG ${locatarioRg} e do CPF ${locatarioCpf}, como locatário celebrar entre si o presente contrato de locação, que será regido pelas condições abaixo, os quais reciprocamente aceitam.`,
        "QUALIFICAÇÃO DAS PARTES CONTRATANTES"
      );

      // Cláusula Primeira - Do Objeto e Finalidade
      printParagraph(
        `O locador é legítimo possuidor do imóvel situado a ${enderecoImovel}, que é dado em locação ao Locatário para que este use para fins Residenciais, fixando sua residência e seus familiares ficando vedada a desvirtuação da finalidade, sem anuência do Locadores, ou de seu administrador.`,
        "CLÁUSULA PRIMEIRA — DO OBJETO E FINALIDADE"
      );

      // Cláusula Segunda - Do Prazo
      printParagraph(
        `O Prazo de locação será de ${mesesVigencia} meses sendo o inicial em ${dataInicioFormated} e o final no dia ${dataFimFormated}, quando o Locatário se obriga a restituir o imóvel independentemente de qualquer notificação, seja judicial ou extrajudicial, e se houver interesse das partes poderá ser renovável mediante interesse das partes e ou renovável automaticamente se as partes não se pronunciarem a respeito.`,
        "CLÁUSULA SEGUNDA — DO PRAZO"
      );

      // Cláusula Terceira - Do Valor do Aluguel
      printParagraph(
        `O aluguel mensal, livremente convencionado será de R$ ${valorAluguelNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${valorAluguelExtenso}) que será reajustado anualmente segundo a variação, acumulada no índice IGPM/FGV, IGP/FGV, INPC/IBGE, IPC/FIPE, adotando-se uma na falta do outro, pelo índice que o substitua e que supra os efeitos inflacionários.`,
        "CLÁUSULA TERCEIRA — DO VALOR DO ALUGUEL"
      );

      // Cláusula Quarta - Do Vencimento
      printParagraph(
        `O vencimento do aluguel é todo dia ${diaVencimento} de cada mês, devendo ser pago pontualmente por meio de depósito bancário no ${locadorBanco}, agência ${locadorAgencia} - Conta Corrente ${locadorConta} ou via PIX: ${locadorPix}. O pagamento após o prazo de vencimento implicará em multa de 10% (dez por cento) de multa e vencerá juros de 2% (dois por cento) ao mês, mais correção monetária atualizada pelo mesmo critério utilizado pelo Governo Federal para cobrança de mora dos impostos em atraso.`,
        "CLÁUSULA QUARTA — DO VENCIMENTO"
      );

      // Cláusula Quinta - Dos Honorários e Mora
      printParagraph(
        `Além dos juros e encargos acima citados, o Locatário incorrerá em caso de mora no pagamento de aluguéis, em 20% (vinte por cento) referentes a honorários advocatícios. Esta porcentagem será reduzida a 10% (dez por cento) se a dívida for liquidada amigavelmente no escritório do advogado do Locador, anteriormente a qualquer procedimento judicial.`,
        "CLÁUSULA QUINTA"
      );

      // Da emissão de recibos
      printParagraph(
        `Fica obrigado o LOCADOR, a emitir recibo da quantia paga, relacionando pormenorizadamente todos os valores oriundos de Juros, ou outras despesas. Emitir-se-á tal recibo, desde que haja a apresentação, pelo LOCATÁRIO, dos comprovantes de todas as despesas do imóvel devidamente quitado. Caso o LOCATÁRIO venha a efetuar o pagamento do aluguel através de cheque, restará facultado ao LOCADOR emitir os recibos de pagamentos somente após compensação do mesmo.`,
        "DA EMISSÃO DE RECIBOS E COMPROVAÇÃO DE DESPESAS"
      );

      // Do inadimplemento
      printParagraph(
        `No caso de falta de pagamento de aluguéis e demais encargos previstos neste contrato ou infração de qualquer obrigação contratual ou legal ficam o Locador com a faculdade de ajuizar quando lhe parecer conveniente contra o Locatário ação de despejo ou qualquer outra, sem necessidade de comunicação, os quais nem por isso fica exonerado da obrigação de indenizar o Locador das custas processuais, honorários de advogado, multa contratual e de todos os demais encargos decorrentes dos aludidos procedimentos.`,
        "DO INADIMPLEMENTO E PROCEDIMENTOS JUDICIAIS"
      );

      // Cláusula Sexta - Ocupantes
      printParagraph(
        `O Locatário informa que o imóvel será ocupado por (01 Pessoa) não podendo ter mais pessoas do que informado ao Locador, sob pena de rescisão contratual.`,
        "CLÁUSULA SEXTA — DO LIMITE DE OCUPANTES"
      );

      // Cláusula Sétima - Comunicação
      printParagraph(
        `O Locatário se obriga a fazer chegar às mãos do Locador todo e qualquer aviso ou comunicação que diga respeito ao imóvel locado, sob pena de responder pelas perdas e danos que usar.`,
        "CLÁUSULA SÉTIMA — DAS COMUNICAÇÕES E AVISOS"
      );

      // Cláusula Oitava - Depósito/Caução
      printParagraph(
        `O LOCATÁRIO concorda desde já, a antecipar o valor de R$ ${valorAluguelNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${valorAluguelExtenso}), equivalente a 01 (hum) mês de aluguel. E está ciente que o valor pago trata-se apenas do depósito referente exclusivamente para a pintura, não o isentando por qualquer outro dano que venha causar ao imóvel. Valor que possivelmente será devolvido na devolução se a pintura estiver nas mesmas condições que foi entregue.`,
        "CLÁUSULA OITAVA — DA GARANTIA E CONSERVAÇÃO"
      );

      // Cláusula Nona - Transferência
      printParagraph(
        `Não é permitida a transferência deste contrato em todo ou em parte.`,
        "CLÁUSULA NONA — DA CESSÃO E TRANSFERÊNCIA"
      );

      // Cláusula Décima - Sublocação
      printParagraph(
        `É proibido ao locatário fazer sublocação do imóvel, ou empréstimo do imóvel locado sem consentimento do locador/administrador por escrito.`,
        "CLÁUSULA DÉCIMA — DA PROIBIÇÃO DE SUBLOCAÇÃO"
      );

      // Cláusula Décima Primeira - Do Estado
      printParagraph(
        `O Locatário confessa que recebeu o imóvel no estado em que se encontra, e se obriga a mant-lo em perfeito estado de conservação, asseio e higiene.`,
        "CLÁUSULA DÉCIMA PRIMEIRA — DO ESTADO E HIGIENE DO IMÓVEL"
      );

      // Parágrafo primeiro a sexto
      printParagraph(
        `Fica proibido utilizar a água para lavar veículo, sob pena de pagar multa de 20% (vinte por cento) do valor do aluguel. Não possuir animais domésticos a fim de não perturbar vizinhos.`,
        "PARÁGRAFO PRIMEIRO A SEXTO — DAS RESTRIÇÕES DE CONDOMÍNIO"
      );

      // Cláusula Décima Segunda - Vistoria
      printParagraph(
        `O Locatário desde já faculta ao Locador/Administrador, vistoriar o imóvel locado quando entender conveniente, durante a locação para verificar o cumprimento de cláusulas.`,
        "CLÁUSULA DÉCIMA SEGUNDA — DA VISTORIA"
      );

      // Cláusula Décima Terceira - Multa ou Quebra
      printParagraph(
        `As partes que infringir o presente contrato em qualquer de suas cláusulas pagará, multa equivalente a 3 (três) aluguéis vigentes na data da infração.`,
        "CLÁUSULA DÉCIMA TRÊS — DA MULTA OU QUEBRA"
      );

      // Cláusula Décima Quarta a Oitava - Benfeitorias
      printParagraph(
        `Toda e qualquer benfeitoria fica incorporada ao imóvel. O LOCATÁRIO fica obrigado a fazer seguro contra incêndios do imóvel em seguradora idônea.`,
        "CLÁUSULA DÉCIMA QUARTA A OITAVA — INCORPORAÇÃO E SEGUROS"
      );

      // Cláusula Décima Nona a Vigésima Primeira - Foro
      printParagraph(
        `Ambos elegem o Fórum de Praia Grande - SP para dirimir quaisquer dúvidas, e ações que tenham por objeto o presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.`,
        "CLÁUSULA DÉCIMA NONA A VIGÉSIMA PRIMEIRA — DA ELEIÇÃO DO FORO"
      );
    }

    if (yPos > 210) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("DOCUMENTAÇÃO E ASSINATURAS CERTIFICADAS", leftMargin, yPos);
    yPos += 8;

    // Landlord signature box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("ASSINATURA DIGITAL DO LOCADOR:", leftMargin, yPos);
    yPos += 5.5;
    
    if (contract.assinaturaLocadorGovBr) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 118, 110); // Tealy emerald
      doc.text(`[X] RENATO FARIA KAWANO (Locador Proprietário)`, leftMargin + 5, yPos);
      yPos += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`    CPF: *.*.388-90 — Assinado em ${formatarData(contract.assinaturaLocadorData?.split('T')[0] || "2026-05-21")}`, leftMargin + 5, yPos);
      yPos += 4;
      doc.text(`    Plataforma Federal GOV.BR • Validação de Certificado ITI / ICP-Brasil`, leftMargin + 5, yPos);
      yPos += 4;
      doc.text(`    Autenticação ID: ${contract.assinaturaHashGovBr}`, leftMargin + 5, yPos);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(217, 119, 6); // Amber
      doc.text(`[ ] Aguardando Assinatura Digital do Locador ${locadorNome}`, leftMargin + 5, yPos);
      yPos += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(120, 120, 120);
      doc.text("    Minuta aguardando validação eletrônica via integração de login GOV.BR.", leftMargin + 5, yPos);
      doc.setTextColor(0, 0, 0);
    }
    yPos += 10;

    // Tenant signature box
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text("ASSINATURA DIGITAL DO LOCATÁRIO:", leftMargin, yPos);
    yPos += 5.5;

    if (contract.status === "ATIVO" || contract.assinaturaDigitalInquilinoGovBr) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 64, 175); // Indigo
      doc.text(`[X] ${locatarioNome.toUpperCase()} (Locatário Adquirente)`, leftMargin + 5, yPos);
      yPos += 4.5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      doc.text(`    CPF: ${locatarioCpf} — Assinado via plataforma eletrônica Condo+`, leftMargin + 5, yPos);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.setFont("helvetica", "italic");
      doc.setTextColor(217, 119, 6); // Amber
      doc.text(`[ ] Aguardando Assinatura do Inquilino(a) ${locatarioNome}`, leftMargin + 5, yPos);
      doc.setTextColor(0, 0, 0);
    }

    // Official Stamp seal representation at bottom
    if (contract.assinaturaLocadorGovBr) {
      yPos += 10;
      doc.setDrawColor(15, 118, 110);
      doc.setLineWidth(0.4);
      doc.setFillColor(242, 252, 251);
      doc.rect(leftMargin, yPos, 130, 22, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(15, 118, 110);
      doc.text("VALIDADO PELO ASSINADOR FEDERAL GOV.BR (ITI)", leftMargin + 5, yPos + 6);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(80, 80, 80);
      doc.text(`Este documento eletrônico foi assinado por ${locadorNome} com assinatura digital credenciada ICP-Brasil.`, leftMargin + 5, yPos + 11);
      doc.text(`Código de Validação Governamental: ${contract.assinaturaHashGovBr}`, leftMargin + 5, yPos + 16);
      doc.setTextColor(0, 0, 0);
      doc.setDrawColor(0, 0, 0);
    }

    doc.save(`Contrato_Locacao_${contract.id}_GovBr.pdf`);
  };

  const handleDevolutivaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDevolutivaError(null);
    setDevolutivaSuccess(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const base64Chunk = base64.split(",")[1];
      setDevolutivaFile({
        fileName: file.name,
        fileBase64: base64Chunk
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDevolutivaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userContract) return;
    if (!devolutivaFile) {
      setDevolutivaError("Por favor, selecione o arquivo do contrato assinado.");
      return;
    }

    setDevolutivaLoading(true);
    setDevolutivaError(null);
    setDevolutivaSuccess(null);

    try {
      const response = await fetch(`/api/contracts/${userContract.id}/devolutiva`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: devolutivaFile.fileName,
          fileBase64: devolutivaFile.fileBase64,
          hashGovBr: devolutivaHash.trim()
        })
      });

      if (response.ok) {
        setDevolutivaSuccess("Sua devolutiva do contrato assinado foi efetuada com sucesso! Uma cópia foi arquivada em sua pasta digital de consultas. O locador foi notificado para realizar a assinatura complementar dele.");
        setDevolutivaFile(null);
        setDevolutivaHash("");
        await onSyncDb();
      } else {
        const errData = await response.json();
        setDevolutivaError(errData.error || "Ocorreu um erro ao enviar a devolutiva.");
      }
    } catch (err) {
      console.error(err);
      setDevolutivaError("Erro de conexão ou comunicação com o servidor.");
    } finally {
      setDevolutivaLoading(false);
    }
  };

  // Find relevant contract and bills for this resident
  const userContract = currentUser 
    ? contratos.find(c => c.inquilinoId === currentUser.id && c.status !== "ARQUIVADO")
    : null;

  const userFaturamentos = userContract 
    ? faturamentos.filter(f => f.contratoId === userContract.id)
    : [];

  // Recalculates fine & juros for pending invoice based on the specified emission date
  const computeOverdueDetails = (fat: Faturamento, dateString: string) => {
    const todayStr = getTodayDateString();
    const safeDateString = dateString < todayStr ? todayStr : dateString;
    const due = new Date(fat.dataVencimento);
    const gen = new Date(safeDateString);
    
    const isOverdue = gen > due && fat.status === "PENDENTE";
    const delayMs = gen.getTime() - due.getTime();
    const daysDelay = isOverdue ? Math.floor(delayMs / (1000 * 60 * 60 * 24)) : 0;
    
    // Fine formula: 10% of base value
    const fine = isOverdue ? fat.valorBase * 0.10 : 0;
    // Interest (Juros): 1% per month (0.01 / 30 per day) pro-rata die
    const interest = isOverdue ? (0.01 / 30) * daysDelay * fat.valorBase : 0;
    const total = fat.valorBase + fine + interest;

    return {
      isOverdue,
      daysDelay,
      fine: parseFloat(fine.toFixed(2)),
      interest: parseFloat(interest.toFixed(2)),
      total: parseFloat(total.toFixed(2))
    };
  };

  // Triggers simulated payment immediately on the server
  const executeSimulatedPayment = async (fatId: string, updatedAmount: number) => {
    setPaymentLoading(fatId);
    try {
      const response = await fetch(`/api/financial/pay/${fatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valorPago: updatedAmount })
      });
      
      if (response.ok) {
        await onSyncDb();
        setPaymentSuccess(fatId);
        setActivePaymentModal(null);
        setTimeout(() => setPaymentSuccess(null), 3000);
      } else {
        alert("Não foi possível processar o pagamento emulado no gateway.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão com o servidor ao pagar.");
    } finally {
      setPaymentLoading(null);
    }
  };

  // Format Helper for Currency
  const formatBrl = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Format Helper for Date
  const formatDateBr = (dStr: string) => {
    if (!dStr) return "-";
    const [year, month, day] = dStr.split("-");
    if (!year || !month || !day) return dStr;
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="w-full space-y-6" id="tenant-portal-component">
      
      {/* HEADER BAR FOR QUICK VISUAL FEEDBACK */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Operação de Locação
            </span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="text-[10px] text-emerald-300 font-bold uppercase">Conexão Segura</span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Portal do Inquilino & Morador</h2>
          <p className="text-xs text-indigo-200">Acesse seus contratos, emita boletos atualizados com reajuste de mora e obtenha chaves PIX em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-2">
          {onTriggerInstall && (
            <button
              onClick={onTriggerInstall}
              className="px-3 py-1.8 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-3xs"
              title="Instalar Condo+ no Celular"
            >
              <Smartphone className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              <span>Instalar App</span>
            </button>
          )}
          <button
            onClick={() => {
              // Copy access URL to share
              handleCopyText(`${window.location.origin}/?tenant=true`);
            }}
            className="px-3.5 py-1.8 bg-indigo-900/45 hover:bg-slate-800/40 border border-indigo-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Copiar URL direta de acesso para o Portal do Inquilino"
          >
            <Copy className="h-3.5 w-3.5" />
            {copiedText ? "Copiado!" : "Copiar Link do Portal"}
          </button>
        </div>
      </div>

      {/* LOGIN CONTAINER IF NOT AUTHORIZED */}
      {!currentUser ? (
        <div className="max-w-md mx-auto bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden p-6 md:p-8 space-y-6 animate-in fade-in duration-205" id="tenant-login-panel">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <Key className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Acesso do Residente</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Insira seus dados cadastrados para acessar as informações de moradia e faturas atualizadas.
            </p>
          </div>

          {onTriggerInstall && (
            <div className="p-3 bg-gradient-to-r from-indigo-50 to-indigo-100/40 border border-indigo-150 rounded-xl flex items-center justify-between gap-3 shadow-3xs animate-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-600 rounded-lg text-white shrink-0">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 leading-none">Salvar no Celular</h4>
                  <p className="text-[9px] text-gray-500 font-bold tracking-tight uppercase mt-0.5">Clique para Instalar o APP</p>
                </div>
              </div>
              <button
                onClick={onTriggerInstall}
                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase rounded-lg transition shrink-0 cursor-pointer shadow-3xs"
              >
                Instalar
              </button>
            </div>
          )}

          {loginError && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 p-3 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Usuário (Primeiro Nome)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ex: Arthur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none text-black font-bold"
                />
              </div>
              <p className="text-[11px] text-black font-semibold">Insira seu primeiro nome cadastrado (ex: Arthur).</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Senha de Acesso (CPF)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Hash className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="Seu CPF (apenas números ou formatado)"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-gray-50 border border-gray-300 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white outline-none text-black font-bold font-mono"
                />
              </div>
              <p className="text-[11px] text-black font-extrabold">Sua senha padrão é o CPF do titular cadastrado na proposta.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 shadow-sm"
            >
              Entrar no Portal <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : (
        /* PORTAL PANEL FOR AUTHORIZED TENANT */
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* USER WELCOME HEADER */}
          <div className="bg-white rounded-xl border border-gray-150 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold shrink-0">
                {currentUser.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-gray-900">{currentUser.nome}</h3>
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold rounded-md">
                    Inquilino Ativo
                  </span>
                </div>
                <p className="text-xs text-black font-bold">CPF: {currentUser.cpf} • {currentUser.email} {currentUser.telefone && `• ${currentUser.telefone}`}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-gray-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
            >
              <LogOut className="h-4 w-4" />
              Sair do Portal
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: ACTIVE CONTRACT DETAILS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* CONTRACT OVERVIEW CARD */}
              <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-5 space-y-4">
                <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2.5">
                  <FileText className="h-4 w-4" />
                  Meu Contrato de Locação
                </h4>

                {!userContract ? (
                  <div className="py-4 text-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-bold text-gray-700">Contrato sob elaboração</p>
                    <p className="text-[11.5px] text-black font-bold leading-normal">
                      Sua candidatura foi aprovada! A equipe imobiliária está redigindo seu contrato definitivo. Assim que for emitido, os detalhes constarão nesta seção.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-black">Imóvel Locado</span>
                      <p className="font-bold text-gray-800 flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{userContract.imovel?.endereco || "Endereço indisponível"}</span>
                      </p>
                      <p className="text-[11px] text-indigo-600 font-semibold px-4.5">Tipo: {userContract.imovel?.tipo || "Residencial"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-black">Valor Aluguel</span>
                        <p className="font-extrabold text-indigo-700 text-sm">
                          {formatBrl(userContract.overriddenValorAluguel || userContract.imovel?.valorAluguel || 0)}
                          {userContract.overriddenValorAluguel !== undefined && userContract.overriddenValorAluguel !== userContract.imovel?.valorAluguel && (
                            <span className="block text-[8px] bg-indigo-50 text-indigo-600 px-1 py-0.2 rounded font-extrabold mt-0.5 w-max">REAJUSTADO</span>
                          )}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-black">Dia Vencimento</span>
                        <p className="font-bold text-gray-800">
                          Todo dia {userContract.overriddenDiaVencimento || userContract.diaVencimento}
                          {userContract.overriddenDiaVencimento !== undefined && userContract.overriddenDiaVencimento !== userContract.diaVencimento && (
                            <span className="block text-[8px] bg-amber-50 text-amber-700 px-1 py-0.2 rounded font-extrabold mt-0.5 w-max">ALTERADO</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-black">Início Vigência</span>
                        <p className="font-semibold text-gray-800">{formatDateBr(userContract.dataInicio)}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-black">Fim Contrato</span>
                        <p className="font-semibold text-gray-800">{formatDateBr(userContract.dataFim)}</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-black">Status Jurídico</span>
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold pb-0.8 rounded-full border ${
                        userContract.status === "ATIVO" 
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                          : "bg-indigo-50 text-indigo-800 border-indigo-200"
                      }`}>
                        {userContract.status === "ATIVO" ? "✓ CONTRATO ATIVO" : "⏱ EM ASSINATURA"}
                      </span>
                    </div>

                    {userContract.assinaturaLocadorGovBr && (
                      <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-lg text-[11px] text-emerald-800 space-y-1.5 flex items-start gap-1.5 mt-2">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Assinado Via GOV.BR</strong>
                          <span className="text-[9px] font-mono block text-emerald-700 leading-tight">Hash: {userContract.assinaturaHashGovBr}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SHARED DOCUMENTS & CONTRACT SECTION (APENAS CONSULTA) */}
              <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-5 space-y-4">
                <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-widest flex items-center gap-2 border-b border-gray-100 pb-2.5">
                  <FolderOpen className="h-4 w-4 text-amber-500" />
                  Pasta de Documentos & Anexos
                </h4>

                <p className="text-[11.5px] text-black font-bold leading-normal">
                  Consulte os arquivos e a via do contrato definitivo assinada por ambas as partes, cadastrados e guardados na sua pasta digital pelo administrador.
                </p>

                {/* Simulated File List for the Logged-in Tenant */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto">
                  {(!currentUser.arquivos || currentUser.arquivos.length === 0) && (!userContract || userContract.status !== "ATIVO") ? (
                    <div className="py-6 text-center text-gray-400 text-xs italic space-y-1">
                      <FolderOpen className="h-6 w-6 mx-auto text-gray-300 stroke-1" />
                      <p>Nenhum contrato assinado ou documento anexado para consulta.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* If the contract is active/signed, showcase it at the top as an official PDF */}
                      {userContract && userContract.status === "ATIVO" && (
                        <div className="p-2.5 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex items-center justify-between gap-2.5 group hover:bg-emerald-50 transition">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-emerald-950 truncate flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>Contrato_Locacao_Assinado.pdf</span>
                            </p>
                            <span className="text-[9px] text-emerald-700 font-mono block">Oficial • Assinado Gov.br</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveConsultFile({
                              nome: "Contrato_Locacao_Assinado.pdf",
                              dataUpload: userContract.dataInicio,
                              tamanho: "1.4 MB"
                            })}
                            className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Consultar via final assinada"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Consultar</span>
                          </button>
                        </div>
                      )}

                      {/* Display files uploaded by administration */}
                      {currentUser.arquivos && currentUser.arquivos.map((file) => (
                        <div key={file.id} className="p-2.5 bg-slate-50 border border-gray-150 rounded-xl flex items-center justify-between gap-2.5 group hover:bg-indigo-50/30 hover:border-indigo-100 transition">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-800 truncate" title={file.nome}>{file.nome}</p>
                            <div className="flex items-center gap-2 text-[10px] text-gray-450 font-mono mt-0.5">
                              <span>Compartilhado: {new Date(file.dataUpload).toLocaleDateString("pt-BR")}</span>
                              <span>•</span>
                              <span>{file.tamanho || "1.2 MB"}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveConsultFile({
                              id: file.id,
                              nome: file.nome,
                              dataUpload: file.dataUpload,
                              tamanho: file.tamanho
                            })}
                            className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-700 border border-gray-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Consultar documento em modo leitura"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Consultar</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* REGULATION CLAUSES REMINDER */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4.5 space-y-3">
                <span className="block text-[10px] font-bold text-indigo-800 uppercase tracking-wide">Cláusula de Mora Relevante</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Conforme Cláusula Quarta do Contrato de Locação, pagamentos efetuados após a data de vencimento sofrerão aplicação automática de:
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between bg-white px-2 py-1.5 rounded border border-slate-200/60 text-[11px]">
                    <span className="font-semibold text-gray-700">Multa Prevista:</span>
                    <strong className="text-indigo-700 font-extrabold">10% de multa moratória</strong>
                  </div>
                  <div className="flex justify-between bg-white px-2 py-1.5 rounded border border-slate-200/60 text-[11px]">
                    <span className="font-semibold text-gray-700">Juros de Atraso:</span>
                    <strong className="text-indigo-700 font-extrabold">1% ao mês (pro-rata diário)</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: INTERACTIVE PAYMENTS & BOLETO/PIX RE-CALCULATOR */}
            <div className="lg:col-span-2 space-y-6">

              {/* GOV.BR SIGNATURE & DEVOLUTIVA WORKFLOW CARD */}
              {userContract && (
                <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-5 space-y-4 font-sans" id="tenant-signature-devoutive-section">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
                    <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                      <Award className="h-4 w-4 text-indigo-600" />
                      Assinatura Digital & Devolutiva do Contrato (GOV.BR)
                    </h4>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border ${
                      userContract.assinaturaDigitalInquilinoGovBr
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                    }`}>
                      {userContract.assinaturaDigitalInquilinoGovBr ? "✓ DEVOLUTIVA REALIZADA" : "⏱ EXPEDIDO - AGUARDANDO DEVOLUTIVA"}
                    </span>
                  </div>

                  {devolutivaSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 text-[11px] font-semibold rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{devolutivaSuccess}</span>
                    </div>
                  )}

                  {devolutivaError && (
                    <div className="p-3 bg-rose-50 border border-rose-150 text-rose-800 text-[11px] font-semibold rounded-xl flex items-start gap-2">
                      <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>{devolutivaError}</span>
                    </div>
                  )}

                  {!userContract.assinaturaDigitalInquilinoGovBr ? (
                    <div className="space-y-4 leading-relaxed text-xs text-gray-600">
                      <p className="text-gray-500 text-[11px]">
                        Para efetivar a sua locação imobiliária com total amparo legal perante o governo e órgãos oficiais, siga o fluxo de assinatura digital gratuita via <strong>Gov.br</strong> abaixo e realize a entrega do documento assinado:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                        {/* Passo 1 */}
                        <div className="p-3 bg-slate-50 border border-gray-150 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono tracking-wider">Passo 1</span>
                            <h5 className="font-bold text-gray-800 text-[11px] leading-snug">Baixar Contrato</h5>
                            <p className="text-[10.5px] text-gray-500 leading-tight">Baixe a versão oficial do seu contrato de locação residencial em PDF gerado diretamente pela Condo+.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadContractPDF(userContract)}
                            className="mt-2 text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-2xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Baixar PDF</span>
                          </button>
                        </div>

                        {/* Passo 2 */}
                        <div className="p-3 bg-slate-50 border border-gray-150 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono tracking-wider">Passo 2</span>
                            <h5 className="font-bold text-gray-800 text-[11px] leading-snug">Assinar no Gov.br</h5>
                            <p className="text-[10.5px] text-gray-500 leading-tight">Acesse o Assinador ITI do Gov.br, envie o PDF do contrato, realize a assinatura e faça o download do PDF assinado.</p>
                          </div>
                          <a
                            href="https://assinador.iti.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-center py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1.5 w-full cursor-pointer shadow-2xs no-underline"
                          >
                            <span>Assinador Gov.br</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>

                        {/* Passo 3 */}
                        <div className="p-3 bg-slate-50 border border-gray-150 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-indigo-600 font-mono tracking-wider">Passo 3</span>
                            <h5 className="font-bold text-gray-800 text-[11px] leading-snug">Fazer a Devolutiva</h5>
                            <p className="text-[10.5px] text-gray-500 leading-tight">Anexe o arquivo do contrato devidamente assinado no formulário abaixo e efetue o envio para o locador.</p>
                          </div>
                          <div className="inline-block pt-1 text-center font-semibold text-[10px] text-indigo-700">
                            Preencha os campos abaixo ⬇
                          </div>
                        </div>
                      </div>

                      {/* DEVOLUTIVA UPLOAD FORM */}
                      <form onSubmit={handleDevolutivaSubmit} className="border-t border-gray-100 pt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* File input helper */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide">Anexar Contrato Assinado (Devolutiva)</label>
                            
                            <div className="relative">
                              {!devolutivaFile ? (
                                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-slate-100 transition text-xs font-semibold text-gray-600 justify-start">
                                  <UploadCloud className="h-4 w-4 text-indigo-500 shrink-0" />
                                  <span className="truncate">Selecionar arquivo assinado (.pdf)</span>
                                  <input 
                                    type="file" 
                                    accept="application/pdf,image/*" 
                                    className="hidden" 
                                    onChange={handleDevolutivaFileChange} 
                                  />
                                </label>
                              ) : (
                                <div className="flex items-center justify-between px-3 py-2 bg-indigo-50/50 border border-indigo-150 rounded-xl text-xs">
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                    <span className="font-bold text-slate-800 truncate" title={devolutivaFile.fileName}>{devolutivaFile.fileName}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setDevolutivaFile(null)}
                                    className="text-rose-600 hover:text-rose-800 text-[10px] font-mono font-bold ml-1 cursor-pointer"
                                  >
                                    Limpar
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-[10px] text-black font-semibold">Arraste ou clique para anexar a via que você baixou com as assinaturas digitais aplicadas.</p>
                          </div>

                          {/* Hash Validation code */}
                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide">Código Hash / Chave da Assinatura (Opcional)</label>
                            <input
                              type="text"
                              placeholder="Ex: HASH-DE21-8812A"
                              value={devolutivaHash}
                              onChange={(e) => setDevolutivaHash(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                            />
                            <p className="text-[10px] text-black font-semibold">Insira o código verificador do documento assinado gerado pelo Assinador Iti Gov.br (opcional).</p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={devolutivaLoading || !devolutivaFile}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-200 disabled:text-gray-600 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex justify-center items-center gap-2 shadow-xs"
                        >
                          {devolutivaLoading ? (
                            <>
                              <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                              <span>Processando Devisora de Arquivos...</span>
                            </>
                          ) : (
                            <>
                              <FileCheck className="h-4 w-4" />
                              <span>Efetuar Devolutiva do Contrato devidamente Assinado</span>
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* DEVOLUTIVA ALREADY SUBMITTED CONGRATULATIONS BANNER */
                    <div className="space-y-3.5 leading-relaxed text-xs">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-950 text-left space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">
                            <Check className="h-4.5 w-4.5 stroke-3" />
                          </div>
                          <div>
                            <strong className="block text-sm font-bold">Devolutiva Assinada com Sucesso!</strong>
                            <span className="text-[10px] text-emerald-800 font-semibold">Cópia do contrato entregue digitalmente</span>
                          </div>
                        </div>

                        <div className="border-t border-emerald-200/60 pt-2 text-[11px] font-medium space-y-1 text-emerald-800">
                          <p>📄 <strong>Documento devolvido:</strong> {userContract.devolutivaContratoAssinadoFileName || "Contrato_Assinado_Inquilino.pdf"}</p>
                          {userContract.assinaturaInquilinoHashGovBr && (
                            <p>🔑 <strong>Chave Hash Gov.br:</strong> <code className="bg-emerald-100 font-mono px-1.5 rounded text-emerald-900 text-[10px] font-bold">{userContract.assinaturaInquilinoHashGovBr}</code></p>
                          )}
                          <p>📆 <strong>Data de Envio:</strong> {formatDateBr(userContract.assinaturaDigitalInquilinoData?.substring(0, 10) || "")} às {userContract.assinaturaDigitalInquilinoData?.substring(11, 16) || "14:22"}</p>
                        </div>
                      </div>

                      {/* GOV.BR API REALTIME VALIDATION CERTIFICATE DETAILS */}
                      {userContract.govBrVerifiedSignature && userContract.govBrVerificationDetails && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 font-sans space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {/* Small Gov.br styled emblem */}
                              <div className="h-5 w-5 bg-blue-600 rounded-sm flex items-center justify-center text-[8px] font-black text-white px-0.5 tracking-tighter">
                                gov.br
                              </div>
                              <span className="text-[10px] font-extrabold text-blue-950 uppercase tracking-wider">Laudo de Validação da API Gov.br</span>
                            </div>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-350 px-2 py-0.5 rounded-full font-bold">
                              ✓ 100% VÁLIDO (ITI)
                            </span>
                          </div>

                          <p className="text-[10.5px] text-slate-600 leading-normal">
                            Nossa API interligada ao barramento do <strong>Gov.br / ITI (Instituto Nacional de Tecnologia da Informação)</strong> realizou a verificação imediata das assinaturas e da cadeia do certificado eletrônico aplicadas ao arquivo PDF:
                          </p>

                          <div className="bg-white/80 border border-blue-150 rounded-lg p-2.5 text-[10px] space-y-1 font-mono text-slate-700">
                            <div>👥 <strong>Assinante legítimo:</strong> <span className="font-bold text-slate-900">{userContract.govBrVerificationDetails.signerName}</span></div>
                            <div>🪪 <strong>CPF Identificado:</strong> <span className="font-bold text-slate-900">{userContract.govBrVerificationDetails.signerCpf}</span></div>
                            <div>🔒 <strong>Cadeia de Confiança:</strong> <span>{userContract.govBrVerificationDetails.authority}</span></div>
                            <div>📅 <strong>Data de Validação ICP-Brasil:</strong> <span>{formatDateBr(userContract.govBrVerificationDetails.signatureDate.substring(0, 10))} às {userContract.govBrVerificationDetails.signatureDate.substring(11, 16)}</span></div>
                            <div>🔑 <strong>Assinatura Criptográfica:</strong> <span className="text-blue-700 font-bold truncate block">{userContract.govBrVerificationDetails.verificationHash}</span></div>
                            <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-sans font-bold pt-1 border-t border-slate-100">
                              <span className="inline-block h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                              <span>Assinatura Digital de acordo com a MP nº 2.200-2/2001 e Lei nº 14.063/2020.</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1 flex items-start gap-2">
                        <Clock className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-amber-950 text-[11.5px]">Aguardando Assinatura Complementar do Locador</strong>
                          <span className="text-slate-600 leading-normal block">O contrato assinado por você foi anexado e comunicado. Agora, o proprietário (Sr. <strong>Renato Faria Kawano</strong>) realizará o procedimento de assinar eletronicamente para formalização final da locação.</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* INTERACTIVE DATA RE-CALCULATION SELECTOR */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4.5 shadow-3xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-indigo-700" />
                    Data Prática de Pagamento
                  </h4>
                  <p className="text-[11px] text-indigo-700/85 max-w-sm">
                    Informe a data planejada para recalcular na hora o valor atualizado do aluguel com multas e juros de atrasos previstos.
                  </p>
                </div>

                <div className="w-full md:w-auto shrink-0 space-y-1">
                  <label className="block text-[10px] font-bold text-indigo-800 uppercase">Data Planejada</label>
                  <input
                    type="date"
                    min={getTodayDateString()}
                    value={generationDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        const todayStr = getTodayDateString();
                        if (val < todayStr) {
                          setGenerationDate(todayStr);
                        } else {
                          setGenerationDate(val);
                        }
                      }
                    }}
                    className="w-full md:w-auto text-xs p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-600 outline-none"
                  />
                </div>
              </div>

              {/* LIST OF INVOICES */}
              <div className="bg-white border border-gray-150 rounded-xl shadow-2xs p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-xs text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Minhas Faturas & Fluxos Financeiros
                  </h4>
                  <span className="text-[10px] font-mono text-gray-400">Cálculo na data: {formatDateBr(generationDate)}</span>
                </div>

                {!userContract ? (
                  <p className="text-xs text-gray-400 italic text-center py-6">Aguardando emissão do contrato para faturamento.</p>
                ) : userFaturamentos.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-xs text-gray-400 italic">Nenhum faturamento gerado para este contrato ainda.</p>
                    <p className="text-[11px] text-gray-500 leading-normal max-w-sm mx-auto">
                      Os proprietários emitem as cobranças mês a mês. Você receberá avisos no seu e-mail cadastrado quando novas cobranças forem geradas.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userFaturamentos.map(fat => {
                      // Perform calculation relative to selected date
                      const calc = computeOverdueDetails(fat, generationDate);
                      
                      return (
                        <div 
                          key={fat.id} 
                          className={`p-4 rounded-xl border transition-all ${
                            fat.status === "PAGO" 
                              ? "bg-emerald-50/20 border-emerald-100 hover:bg-emerald-50/40" 
                              : calc.isOverdue 
                                ? "bg-rose-50/30 border-rose-150 hover:bg-rose-50/50" 
                                : "bg-slate-50/40 border-gray-200 hover:bg-slate-50/80"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-xs font-bold text-gray-800">Fatura: {fat.externalId || `ID-#${fat.id.split("-")[1]}`}</span>
                                
                                {fat.status === "PAGO" ? (
                                  <span className="px-2 py-0.5 bg-emerald-150 text-emerald-800 text-[9px] font-extrabold pb-0.8 rounded-full">
                                    PAGAMENTO EFETUADO
                                  </span>
                                ) : calc.isOverdue ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[9px] font-extrabold pb-0.8 rounded-full animate-pulse flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> ATRASADO • {calc.daysDelay} DIAS
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] font-extrabold pb-0.8 rounded-full">
                                    PENDENTE DE PAGAMENTO
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-[11px] text-gray-500 font-medium">
                                Vencimento oficial em: <strong className="text-gray-700">{formatDateBr(fat.dataVencimento)}</strong>
                              </p>
                            </div>

                            {/* VALUES SECTION */}
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-gray-400 block uppercase font-bold">Total recalculado</span>
                              <div className="font-extrabold text-base text-gray-900 leading-tight">
                                {fat.status === "PAGO" 
                                  ? formatBrl(fat.valorPago || fat.valorBase) 
                                  : formatBrl(calc.total)}
                              </div>
                              <span className="text-[10px] text-gray-400 leading-none">
                                {fat.status === "PAGO" 
                                  ? `Pago em ${formatDateBr(fat.dataPagamento || "")}` 
                                  : `Base: ${formatBrl(fat.valorBase)}`}
                              </span>
                            </div>
                          </div>

                          {/* PENALTY BREAKDOWN TABLE (Only for unpaid bills that are overdue) */}
                          {fat.status !== "PAGO" && (calc.isOverdue || calc.fine > 0 || calc.interest > 0) && (
                            <div className="mt-3 p-3 bg-white border border-rose-100 rounded-lg text-xs space-y-1.5 animate-in fade-in duration-100">
                              <div className="flex justify-between text-gray-600">
                                <span>Aluguel Base:</span>
                                <span>{formatBrl(fat.valorBase)}</span>
                              </div>
                              <div className="flex justify-between text-rose-600">
                                <span>Multa contratual de atraso (10%):</span>
                                <span className="font-semibold">+ {formatBrl(calc.fine)}</span>
                              </div>
                              <div className="flex justify-between text-rose-600">
                                <span>Juros moratórios (1% ao mês pró-rata - {calc.daysDelay} dias):</span>
                                <span className="font-semibold">+ {formatBrl(calc.interest)}</span>
                              </div>
                              <div className="border-t border-rose-100 pt-1.5 flex justify-between font-bold text-gray-900">
                                <span>Valor Final para {formatDateBr(generationDate)}:</span>
                                <span className="text-indigo-600">{formatBrl(calc.total)}</span>
                              </div>
                            </div>
                          )}

                          {/* ACTION BUTTONS (Only if invoice is pending) */}
                          {fat.status !== "PAGO" ? (
                            <div className="mt-3.5 flex flex-wrap gap-2 pt-3 border-t border-dashed border-gray-200">
                              <button
                                onClick={() => setActivePaymentModal({
                                  faturamento: fat,
                                  fine: calc.fine,
                                  interest: calc.interest,
                                  total: calc.total,
                                  daysDelay: calc.daysDelay,
                                  emissionDate: generationDate,
                                  type: "boleto"
                                })}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-slate-50 text-indigo-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <Printer className="h-3.5 w-3.5" />
                                Imprimir / Gerar Boleto Atualizado
                              </button>

                              <button
                                onClick={() => setActivePaymentModal({
                                  faturamento: fat,
                                  fine: calc.fine,
                                  interest: calc.interest,
                                  total: calc.total,
                                  daysDelay: calc.daysDelay,
                                  emissionDate: generationDate,
                                  type: "pix"
                                })}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-slate-50 text-indigo-700 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                Visualizar PIX atualizado
                              </button>

                              <button
                                onClick={() => executeSimulatedPayment(fat.id, calc.total)}
                                disabled={paymentLoading === fat.id}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm disabled:opacity-50"
                              >
                                {paymentLoading === fat.id ? (
                                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                                ) : (
                                  <CreditCard className="h-3.5 w-3.5" />
                                )}
                                Pagar Fatura (PIX/Boleto)
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3.5 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 bg-emerald-100/40 p-2.5 rounded-lg border border-emerald-200/50">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                              <span>Fatura quitada no sistema em {formatDateBr(fat.dataPagamento || "")}. Código de transação oficial registrado: {fat.externalId || "BOL-77312"}. Copia de recibo arquivada.</span>
                            </div>
                          )}

                          {paymentSuccess === fat.id && (
                            <div className="mt-2.5 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold animate-bounce">
                              🎉 Pagamento processado com sucesso! Seus registros foram liquidados em tempo real no banco de dados.
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

      {/* DOCUMENT PREVIEW DIALOG/MODAL FOR BOLETO & PIX RE-GENERATED */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[88vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 bg-indigo-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                {activePaymentModal.type === "boleto" ? <FileText className="h-5 w-5" /> : <QrCode className="h-5 w-5" />}
                <h3 className="font-extrabold text-sm leading-none">
                  {activePaymentModal.type === "boleto" ? "Boleto de Aluguel Atualizado" : "PIX Dinâmico com Encargos Calificados"}
                </h3>
              </div>
              <button
                onClick={() => setActivePaymentModal(null)}
                className="text-white hover:text-indigo-200 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-800 font-sans">
              
              {/* Alert regarding dynamic generation */}
              <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-lg flex items-start gap-2 text-[11px] text-indigo-800 leading-normal">
                <Clock className="h-4 w-4 shrink-0 text-indigo-600 mt-0.5" />
                <div>
                  <span className="font-bold">Solicitação recalculada com sucesso!</span> Esta guia reflete os encargos moratórios vigentes para o dia de pagamento selecionado <strong className="text-gray-900">{formatDateBr(activePaymentModal.emissionDate)}</strong>. Caso pretenda pagar em data distinta, feche e altere o seletor.
                </div>
              </div>

              {/* Boleto Visualization */}
              {activePaymentModal.type === "boleto" ? (
                <div className="space-y-4 border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                  
                  {/* Bank Header Mocker */}
                  <div className="flex justify-between items-center border-b-2 border-gray-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold font-mono text-indigo-700 text-base italic tracking-widest bg-indigo-100 px-2 py-0.5 border border-indigo-200">341</span>
                      <span className="font-bold text-gray-800 border-l border-gray-300 pl-2">Itaú Repasses</span>
                    </div>
                    <span className="font-mono font-bold tracking-tight text-[11px] text-gray-900 text-right truncate">
                      34191.06307 31860.234164 02388.901103 9 98710000{Math.floor(activePaymentModal.total).toString().padEnd(4, "0")}
                    </span>
                  </div>

                  {/* Factoring Columns Grid */}
                  <div className="grid grid-cols-4 border-b border-gray-300 text-[10px]">
                    <div className="col-span-3 border-r border-gray-300 p-1.5 space-y-0.5">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Local de Pagamento</span>
                      <p className="font-bold text-gray-800">Pagável em qualquer agência bancária ou via canais digitais de seu banco privado.</p>
                    </div>
                    <div className="col-span-1 p-1.5 space-y-0.5 bg-gray-100/40">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Vencimento Original</span>
                      <p className="font-bold text-gray-900">{formatDateBr(activePaymentModal.faturamento.dataVencimento)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-b border-gray-300 text-[10px]">
                    <div className="col-span-3 border-r border-gray-300 p-1.5 space-y-0.5">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Beneficiário Cedente</span>
                      <p className="font-bold text-gray-850 flex items-center gap-1">Condo<LogoMais /> Repasse Imobiliários Ltda • CNPJ 34.160.238/0001-90</p>
                    </div>
                    <div className="col-span-1 p-1.5 space-y-0.5 bg-gray-100/40">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Nosso Número</span>
                      <p className="font-mono text-gray-800 font-semibold">{activePaymentModal.faturamento.id.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-b border-gray-300 text-[10px]">
                    <div className="col-span-1 border-r border-gray-300 p-1.5 space-y-0.5">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Data do Documento</span>
                      <p className="font-semibold text-gray-800">{formatDateBr(activePaymentModal.emissionDate)}</p>
                    </div>
                    <div className="col-span-1 border-r border-gray-300 p-1.5 space-y-0.5">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Nº Documento</span>
                      <p className="font-semibold text-gray-800">{activePaymentModal.faturamento.externalId}</p>
                    </div>
                    <div className="col-span-1 border-r border-gray-300 p-1.5 space-y-0.5">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Carteira / Espécie</span>
                      <p className="font-semibold text-gray-800">109 / RC</p>
                    </div>
                    <div className="col-span-1 p-1.5 space-y-0.5 bg-gray-100/40">
                      <span className="text-[8px] uppercase text-black font-extrabold block">(=) Valor do Aluguel Base</span>
                      <p className="font-bold text-gray-950">{formatBrl(activePaymentModal.faturamento.valorBase)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-b border-gray-300 text-[10px]">
                    <div className="col-span-3 border-r border-gray-300 p-1.5 space-y-1">
                      <span className="text-[8px] uppercase text-black font-extrabold block">Instruções / Instruções de Cobrança ao Caixa</span>
                      <p className="text-gray-600 leading-tight">
                        • Fatura gerada dia {formatDateBr(activePaymentModal.emissionDate)} após o vencimento ordinário de {formatDateBr(activePaymentModal.faturamento.dataVencimento)}.<br />
                        • Cobrança de multa de atraso em vigor (Cláusula Quarta): <strong>10% (R$ {activePaymentModal.fine.toFixed(2)})</strong>.<br />
                        • Cobrança de juros em vigor: <strong>1% ao mês pro-rata die para {activePaymentModal.daysDelay} dias (R$ {activePaymentModal.interest.toFixed(2)})</strong>.<br />
                        • NÃO RECEBER APÓS O LIMITE DE VALOR CALCULADO PARA O DIA DA EMISSÃO.
                      </p>
                    </div>
                    <div className="col-span-1 space-y-1 bg-yellow-50/40">
                      <div className="border-b border-gray-300 p-1.5 space-y-0.5">
                        <span className="text-[8px] uppercase text-rose-600 font-bold block">(+) Multa e Juros</span>
                        <p className="font-semibold text-rose-600">+{formatBrl(activePaymentModal.fine + activePaymentModal.interest)}</p>
                      </div>
                      <div className="p-1.5 space-y-0.5 bg-indigo-50/50">
                        <span className="text-[8px] uppercase text-indigo-800 font-bold block">(=) Valor Total Cobrado</span>
                        <p className="font-extrabold text-indigo-900 text-sm leading-none pt-0.5">{formatBrl(activePaymentModal.total)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Draw mock barcode lines using css to convey highly professional, real look */}
                  <div className="p-3 border border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-1 bg-white">
                    <span className="tracking-[3px] font-mono text-[11px] font-bold select-all leading-none bg-gray-50 px-2 py-1 border border-gray-100 rounded">
                      34191063073186023416402388901103998710000{Math.floor(activePaymentModal.total).toString().padEnd(4, "0")}
                    </span>
                    <div className="flex gap-[1.5px] h-10 w-[90%] items-stretch justify-center opacity-75 pt-1.5">
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[2px] bg-black"></span>
                      <span className="w-[4px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[2px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[4px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[2.5px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[2px] bg-black"></span>
                      <span className="w-[4px] bg-black"></span>
                      <span className="w-[1px] bg-black text-transparent select-none">|</span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[2px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[4px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                      <span className="w-[3px] bg-black"></span>
                      <span className="w-[1.5px] bg-black"></span>
                      <span className="w-[2.5px] bg-black"></span>
                      <span className="w-[1px] bg-black"></span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Sacado: {currentUser.nome} • CPF {currentUser.cpf}</span>
                    <span className="flex items-center gap-1">Autenticação Bancária Itaú • Condo<LogoMais /></span>
                  </div>

                </div>
              ) : (
                /* PIX Visualization */
                <div className="space-y-4 border border-gray-200 rounded-xl p-5 bg-indigo-50/30 flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xs">
                    <QrCode className="h-8 w-8" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-gray-900 text-sm">Pague via Pix Copia e Cola</h4>
                    <p className="text-[11px] text-gray-500 leading-normal max-w-sm">
                      Abra o aplicativo do seu banco, escolha a opção "Pagar via Pix / Ler QR Code" or cole o código abaixo.
                    </p>
                  </div>

                  {/* QR Code Graphic Mocker */}
                  <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-xs">
                    <svg className="h-32 w-32 mx-auto text-indigo-900" viewBox="0 0 100 100" fill="currentColor">
                      {/* Generates stylized QR design block */}
                      <path d="M5,5 h30 v30 h-30 z M13,13 h14 v14 h-14 z" />
                      <path d="M65,5 h30 v30 h-30 z M73,13 h14 v14 h-14 z" />
                      <path d="M5,65 h30 v30 h-30 z M13,73 h14 v14 h-14 z" />
                      
                      <rect x="15" y="45" width="8" height="8" />
                      <rect x="45" y="15" width="8" height="8" />
                      <rect x="45" y="45" width="10" height="10" />
                      <rect x="40" y="70" width="8" height="8" />
                      <rect x="70" y="40" width="8" height="8" />
                      
                      <rect x="65" y="65" width="30" height="30" fill="currentColor" opacity="0.3" />
                      <rect x="70" y="70" width="10" height="10" />
                      <rect x="85" y="85" width="10" height="10" />
                      <rect x="75" y="80" width="5" height="5" />
                    </svg>
                  </div>

                  {/* Pricing Badge detail */}
                  <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-150 inline-block">
                    <span className="text-[9px] uppercase tracking-wider text-gray-400 block font-bold">Valor Atualizado Pix</span>
                    <strong className="text-lg font-black text-indigo-700">{formatBrl(activePaymentModal.total)}</strong>
                  </div>

                  {/* Copy code input */}
                  <div className="w-full space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">Chave Copia e Cola:</label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        readOnly
                        value={`00020101021226870014br.gov.bcb.pix2565pix.condomais.com/repasse/${activePaymentModal.faturamento.id}?v=${activePaymentModal.total.toFixed(2)}`}
                        className="w-full text-[10px] font-mono hover:bg-slate-50 border border-gray-200 bg-white p-2.5 rounded-xl text-gray-655 outline-none truncate select-all"
                      />
                      <button
                        onClick={() => handleCopyText(`00020101021226870014br.gov.bcb.pix2565pix.condomais.com/repasse/${activePaymentModal.faturamento.id}?v=${activePaymentModal.total.toFixed(2)}`)}
                        className="p-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0"
                        title="Copiar código Pix"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    {copiedText && (
                      <p className="text-[10px] text-emerald-600 font-bold">✓ Código Pix Copiado para a Área de Transferência!</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment details bullet recap */}
              <div className="bg-gray-50 p-3 rounded-lg text-[11px] leading-relaxed space-y-1 border border-gray-200">
                <span className="block font-bold">Detalhamento dos Valores Recalculados:</span>
                <div className="flex justify-between">
                  <span>Aluguel de Período Regular</span>
                  <strong>{formatBrl(activePaymentModal.faturamento.valorBase)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Multa Moratória de Atraso (10% fixa)</span>
                  <strong className="text-rose-600">+{formatBrl(activePaymentModal.fine)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Juros Moratórios Ordinários (1% ao mês pro-rata die - {activePaymentModal.daysDelay} dias)</span>
                  <strong className="text-rose-600">+{formatBrl(activePaymentModal.interest)}</strong>
                </div>
                <div className="border-t border-gray-300 my-1"></div>
                <div className="flex justify-between text-indigo-700 font-extrabold text-xs">
                  <span>Total atualizado a recolher:</span>
                  <span>{formatBrl(activePaymentModal.total)}</span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-150 flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActivePaymentModal(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl font-bold cursor-pointer transition text-xs"
              >
                Fechar Painel
              </button>

              <button
                type="button"
                onClick={() => executeSimulatedPayment(activePaymentModal.faturamento.id, activePaymentModal.total)}
                disabled={paymentLoading === activePaymentModal.faturamento.id}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition text-xs flex items-center gap-1.5 min-w-[120px] justify-center"
              >
                {paymentLoading === activePaymentModal.faturamento.id ? (
                  <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0"></span>
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Confirmar Pagamento
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SECURE DOCUMENT CONSULTATION READER MODAL (APENAS CONSULTA) */}
      {activeConsultFile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-3xs flex items-center justify-center p-4" id="consult-file-modal">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-4 shrink-0 flex items-center justify-between text-white border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <div className="text-left">
                  <h3 className="font-bold text-xs tracking-wide uppercase">Modo de Leitura & Consulta de Documentos</h3>
                  <div className="text-[10px] text-slate-300 flex items-center gap-1">
                    <span>Acesso Restrito ao Inquilino cadastrado no Inquilino</span>
                    <LogoMais />
                    <span>— Cópia Não Editável</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setActiveConsultFile(null)}
                className="p-1 px-2.5 bg-white/10 hover:bg-white/20 transition rounded-lg text-white font-extrabold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Document Content Workspace (Mocker of electronic reading mode) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50 font-sans text-xs">
              
              {/* Document Identity Banner */}
              <div className="bg-white border border-gray-150 rounded-xl p-4 shadow-3xs space-y-2 text-left">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase bg-indigo-50 border border-indigo-150/40 text-indigo-700 px-1.5 py-0.5 rounded">Documento Armazenado</span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{activeConsultFile.nome}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Tamanho: {activeConsultFile.tamanho || "1.2 MB"} | Compartilhado em: {new Date(activeConsultFile.dataUpload).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-150 p-1.5 rounded-lg text-[10px] font-bold">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>✓ Assinatura Digital Válida</span>
                  </div>
                </div>
              </div>

              {/* Secure Document Frame simulation */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 md:p-8 font-serif leading-relaxed text-gray-700 min-h-[300px] border-t-4 border-t-indigo-600 relative overflow-hidden select-none text-left">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none rotate-12">
                  <span className="text-5xl font-sans font-black tracking-widest text-slate-950 uppercase">APENAS PARA CONSULTA</span>
                </div>

                {activeConsultFile.nome.includes("Contrato") ? (
                  <div className="space-y-4">
                    <div className="text-center space-y-1 font-sans border-b border-gray-100 pb-3">
                      <h5 className="font-extrabold text-xs text-gray-900 uppercase">Instrumento Particular de Contrato de Locação Residencial</h5>
                      <p className="text-[10px] text-indigo-600 font-bold">Código do Registro Digital: {userContract?.id || "CON-77218"}</p>
                    </div>

                    <p>
                      Pelo presente instrumento particular, as partes de um lado identificadas como <strong>LOCADOR ({userContract?.imovel?.proprietario?.nome || "Renato Faria Kawano"})</strong>, portador do CPF devidamente cadastrado no portal, e de outro lado como <strong>LOCATÁRIO ({currentUser.nome})</strong>, portador do CPF {currentUser.cpf}, resolvem pactuar o presente negócio jurídico, regido pela Lei do Inquilinato n° 8.245 de 18 de Outubro de 1991.
                    </p>

                    <p>
                      <strong>CLÁUSULA PRIMEIRA:</strong> O imóvel locado, do tipo <strong>{userContract?.imovel?.tipo || "Residencial"}</strong>, situado no endereço <strong>{userContract?.imovel?.endereco || "Endereço cadastrado na plataforma"}</strong>, destina-se exclusivamente para moradia regular do locatário e de seus dependentes expressos no onboarding de locação.
                    </p>

                    <p>
                      <strong>CLÁUSULA SEGUNDA:</strong> O preço mensal convencionado para a locação em epígrafe é de <strong>R$ {(userContract?.overriddenValorAluguel || userContract?.imovel?.valorAluguel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês</strong>, reajustado anualmente com base na variação ativa do índice divulgado (IGP-M/FGV ou IPCA/IBGE) nos termos gerais da lei em vigor.
                    </p>

                    <p>
                      <strong>CLÁUSULA TERCEIRA:</strong> O vencimento ocorrerá impreterivelmente no <strong>dia {userContract?.overriddenDiaVencimento || userContract?.diaVencimento}</strong> de cada mês subsequente ao vencido, devendo a quitação ser exercida pelo portal ou canais homologados pela imobiliária.
                    </p>

                    <div className="pt-6 font-sans space-y-2 border-t border-dashed border-gray-200 mt-6 text-[10px]">
                      <span className="block font-extrabold uppercase text-gray-950 tracking-wider">Histórico de Assinatura Digital do Contrato:</span>
                      
                      <div className="p-3 bg-slate-50 border border-gray-150 rounded-lg flex items-start gap-2 text-slate-700">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Assinatura Digital ICP-Brasil Locador:</strong>
                          <p className="text-[9.5px] font-medium leading-normal text-gray-500">Renato Faria Kawano | CPF: ***.907.***-00. Assinado eletronicamente e homologado com carimbo de tempo ICP-Brasil.</p>
                          <p className="text-[9px] font-mono text-indigo-700 font-semibold">Chave Gov.br: {userContract?.assinaturaHashGovBr || "8f7e21a4-9273-4f81-a9e9-026cc3dc7de4"}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 border border-gray-150 rounded-lg flex items-start gap-2 text-slate-700">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Assinatura Digital ICP-Brasil Locatário:</strong>
                          <p className="text-[9.5px] font-medium leading-normal text-gray-500">{currentUser.nome} | CPF: {currentUser.cpf}. Assinado e reconhecido via Gov.br.</p>
                          <p className="text-[9px] font-mono text-indigo-700 font-semibold">Código Hash Verificador: {userContract?.id ? `HASH-${userContract.id.substring(10, 20).toUpperCase()}` : "SUC-TEN-9118"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center space-y-1 font-sans border-b border-gray-100 pb-3">
                      <h5 className="font-extrabold text-xs text-slate-900 uppercase">Documento / Anexo da Pasta Eletrônica</h5>
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 text-[9px] font-bold rounded">Modo de Leitura Ativa</span>
                    </div>

                    <div className="p-4 bg-slate-50 border border-dashed border-gray-200 rounded-xl text-center space-y-2">
                      <FolderOpen className="h-10 w-10 text-indigo-400 mx-auto stroke-1" />
                      <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                        Este documento foi digitalizado com criptografia e inserido na pasta digital do inquilino pelo administrador da propriedade para consulta estrita e preservação de registros.
                      </p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100 font-sans text-[10px]">
                      <span className="block font-bold text-gray-700">Relatório de Conformidade:</span>
                      <div className="bg-slate-50 p-2.5 rounded border border-gray-150 space-y-1">
                        <p><strong>Nome do Arquivo:</strong> {activeConsultFile.nome}</p>
                        <p><strong>Tipo de Documentação:</strong> {activeConsultFile.nome.toLowerCase().endsWith(".pdf") ? "Portable Document Format (PDF)" : "Imagem Criptografada / Registrada"}</p>
                        <p><strong>Tamanho Físico:</strong> {activeConsultFile.tamanho || "1.1 MB"}</p>
                        <p><strong>Aprovador Responsável:</strong> Renato Faria Kawano (Locador/Administrador)</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="p-3 bg-indigo-50/40 text-indigo-900 border border-indigo-150 rounded-xl space-y-1.5 leading-relaxed text-[10.5px] text-left">
                <strong className="font-bold flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-indigo-600" /> Declaração de Proteção de Dados (LGPD)</strong>
                <p className="text-gray-650">
                  A visualização e download de itens de pasta estão resguardados segundo os termos da Lei n° 13.709 (Lei Geral de Proteção de Dados), sendo proibida a reprodução para fins alheios à relação locatícia registrada.
                </p>
              </div>

            </div>

            {/* Modal actions */}
            <div className="p-4 bg-slate-50 border-t border-gray-150 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setActiveConsultFile(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white transition rounded-xl font-bold cursor-pointer text-xs"
              >
                Retornar ao Portal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
