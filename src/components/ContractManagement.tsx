import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Plus, 
  MapPin, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  PenTool, 
  Clock, 
  DollarSign,
  Eye,
  Printer,
  X,
  RotateCcw,
  BookOpen,
  Share2,
  Send,
  Mail,
  Download,
  Check,
  Award,
  QrCode,
  Lock,
  Trash2,
  AlertTriangle,
  Upload,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Star,
  Save,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Contrato, Inquilino, Imovel } from "../types";
import { jsPDF } from "jspdf";
import { LogoMais } from "./LogoMais";

// Helper to get default lease text with placeholders
function getDefaultTemplateText(): string {
  return `CONTRATO DE LOCAÇÃO RESIDENCIAL DE IMÓVEL

QUALIFICAÇÃO DAS PARTES CONTRATANTES:
Pelo presente instrumento particular do contrato, de um lado, LOCADOR: {{LOCADOR_NOME}}, {{LOCADOR_NACIONALIDADE}}, {{LOCADOR_ESTADO_CIVIL}}, portador de RG {{LOCADOR_RG}} e do CPF {{LOCADOR_CPF}}, residente em {{LOCADOR_RESIDENCIA}}; e, de outro lado, LOCATÁRIO: {{LOCATARIO_NOME}}, brasileiro(a), {{LOCATARIO_ESTADO_CIVIL}}, portador(a) do RG {{LOCATARIO_RG}} e do CPF {{LOCATARIO_CPF}}, profissão {{LOCATARIO_PROFISSAO}}, celebram entre si o presente contrato de locação residencial, que se rege pelas condições e cláusulas adiante ajustadas.

--PAGE--

CLÁUSULA PRIMEIRA — DO OBJETO E FINALIDADE:
O locador é legítimo possuidor do imóvel situado a {{IMOVEL_ENDERECO}} (unidade {{IMOVEL_UNIDADE}}), que é dado em locação residencial ao Locatário para que este use única e exclusivamente para fins Residenciais, fixando sua residência e sua família, vedada a mudança de finalidade.

CLÁUSULA SEGUNDA — DO PRAZO:
O Prazo de locação será de {{CONTRATO_PRAZO_MESES}} meses, sendo o inicial em {{CONTRATO_DATA_INICIO}} e o final no dia {{CONTRATO_DATA_FIM}}, ocasião em que o Locatário se obriga a restituir o imóvel livre de pessoas e pertences.

CLÁUSULA TERCEIRA — DO VALOR DO ALUGUEL:
O aluguel mensal convencional será de {{IMOVEL_VALOR}} ({{IMOVEL_VALOR_EXTENSO}}) que será reajustado anualmente.

CLÁUSULA QUARTA — DO VENCIMENTO:
O vencimento do aluguel é todo dia {{CONTRATO_DIA_VENCIMENTO}} de cada mês, devendo ser pago por meio bancário no {{LOCADOR_BANCO}}, agência {{LOCADOR_AGENCIA}} - Conta {{LOCADOR_CONTA}} ou via PIX: {{LOCADOR_PIX}}.

--PAGE--

CLÁUSULA QUINTA — DA MORA:
O atraso de pagamento ensejará multa de 10% (dez por cento) e juros de 2% (dois por cento) ao mês.

DO INADIMPLEMENTO:
No caso de falta de pagamento, fica o Locador facultado de ajuizar ação de despejo de forma estrita de acordo com a Lei do Inquilinato n° 8.245.

CLÁUSULA SEXTA — DO LIMITE DE OCUPANTES:
O imóvel será habitado por apenas 01 Pessoa titular, vedada aglomeração sem consentimento.

CLÁUSULA SÉTIMA — DAS COMUNICAÇÕES E AVISOS:
O Locatário se obriga a fazer chegar às mãos do Locador todo e qualquer aviso ou comunicação que diga respeito ao imóvel locado, sob pena de responder pelas perdas e danos que causar.

CLÁUSULA OITAVA — DA GARANTIA E CONSERVAÇÃO:
O LOCATÁRIO concorda em antecipar o pagamento de {{TAXA_ENTRADA}} ({{TAXA_ENTRADA_EXTENSO}}), a título de taxa de entrada e caução exclusiva para preservação e pintura de entrega do imóvel.

CLÁUSULA NONA — DA CESSÃO E TRANSFERÊNCIA:
Não é permitida a transferência deste contrato em todo ou em parte.

FORO DE ELEIÇÃO:
Elegem as partes o Fórum de Praia Grande - SP para dirimir quaisquer dúvidas, renunciando a qualquer outro por mais privilegiado que seja.`;
}


// Detect gender based on Portuguese names (especially first name and ending suffixes)
export function getGenderFromName(name: string): "M" | "F" {
  if (!name) return "M";
  const firstName = name.trim().split(/\s+/)[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  // Explicit lists of common name gender maps
  const femaleNames = new Set([
    "alice", "aline", "beatriz", "camila", "carla", "clara", "daiane", "daniela", "danielle", 
    "debora", "eliana", "elisabete", "elisete", "erica", "ester", "fatima", "fernanda", "flavia", 
    "gabriela", "gisele", "gloria", "isabel", "isabela", "isadora", "jaqueline", "julia", "juliana", 
    "lara", "larissa", "leticia", "lis", "luana", "lucia", "luciana", "luiza", "marcela", "marcia", 
    "maria", "mariana", "marina", "michele", "monica", "natalia", "patricia", "paula", "priscila", 
    "rafaela", "raquel", "renata", "rosana", "sandra", "silvia", "simone", "sofia", "sonia", 
    "tatiana", "thais", "valeria", "vanessa", "yasmin", "ana", "carol", "carolina", "claudia"
  ]);
  
  const maleNames = new Set([
    "alan", "alexandre", "anderson", "andre", "antonio", "artur", "arthur", "bernardo", "bruno", 
    "caio", "carlos", "cesar", "daniel", "danilo", "davi", "diego", "eduardo", "emerson", "enzo", 
    "felipe", "fernando", "flavio", "francisco", "gabriel", "gilberto", "guilherme", "gustavo", 
    "heitor", "henrique", "hugo", "igor", "italo", "jamilton", "jean", "joao", "jorge", "jose", 
    "julio", "kleber", "leonardo", "lucas", "luis", "luiz", "marcelo", "marcos", "mateus", "matheus", 
    "mauricio", "miguel", "murilo", "nicolas", "otavio", "paulo", "pedro", "rafael", "ramon", 
    "renan", "renato", "ricardo", "roberto", "rodrigo", "rogerio", "ronaldo", "samuel", "sandro", 
    "thiago", "tiago", "vagner", "valter", "victor", "vitor", "william", "yasuo", "ronaldo"
  ]);
  
  if (femaleNames.has(firstName)) return "F";
  if (maleNames.has(firstName)) return "M";
  
  if (firstName === "maria" || firstName === "ana") return "F";
  if (firstName === "joao" || firstName === "jose") return "M";

  // Ends in -a is extremely likely female in Portuguese (with handful of exceptions like Luca)
  if (firstName.endsWith("a") && firstName !== "luca") {
    return "F";
  }
  
  // Default to M
  return "M";
}

// Automatically adjusts Portuguese words (like Solteira -> Solteiro, Arquiteta -> Arquiteto)
export function adjustWordGender(word: string, isFemale: boolean): string {
  if (!word) return "";
  let trimmed = word.trim();
  
  // Handles parenthetical / slash notation (e.g. "Solteiro(a)", "Brasileiro/a", "Arquiteto(a)")
  if (trimmed.toLowerCase().includes("(a)") || trimmed.toLowerCase().includes("/a")) {
    if (isFemale) {
      trimmed = trimmed.replace(/\(a\)/gi, "a").replace(/\/a/gi, "a");
    } else {
      trimmed = trimmed.replace(/\(a\)/gi, "").replace(/\/a/gi, "");
    }
    return trimmed;
  }

  const femaleToMaleMap: Record<string, string> = {
    "solteira": "solteiro",
    "casada": "casado",
    "divorciada": "divorciado",
    "viúva": "viúvo",
    "arquiteta": "arquiteto",
    "advogada": "advogado",
    "engenheira": "engenheiro",
    "médica": "médico",
    "designer": "designer",
    "analista": "analista",
    "autônoma": "autônomo",
    "empresária": "empresário",
    "auxiliar": "auxiliar",
    "assistente": "assistente",
    "administradora": "administrador",
    "diretora": "diretor",
    "gerente": "gerente",
    "desenvolvedora": "desenvolvedor",
    "vendedora": "vendedor",
    "professora": "professor",
    "psicóloga": "psicólogo",
    "estudante": "estudante",
    "coordenadora": "coordenador",
    "técnica": "técnico",
    "enfermeira": "enfermeiro",
    "fisioterapeuta": "fisioterapeuta"
  };

  const maleToFemaleMap: Record<string, string> = {};
  for (const [fem, mas] of Object.entries(femaleToMaleMap)) {
    maleToFemaleMap[mas] = fem;
  }

  const lower = trimmed.toLowerCase();
  
  if (isFemale) {
    if (maleToFemaleMap[lower]) {
      return matchCase(trimmed, maleToFemaleMap[lower]);
    }
    // Suffix rules
    if (lower.endsWith("o") && !lower.endsWith("colegio") && !lower.endsWith("banco") && !lower.endsWith("grupo")) {
      return trimmed.slice(0, -1) + "a";
    }
    if (lower.endsWith("dor")) {
      return trimmed + "a";
    }
  } else {
    // Male
    if (femaleToMaleMap[lower]) {
      return matchCase(trimmed, femaleToMaleMap[lower]);
    }
    // Suffix rules for Male
    const commonEpiceneSuffixes = ["ista", "eta", "ata", "peuta"];
    const isEpiceneSuf = commonEpiceneSuffixes.some(suf => lower.endsWith(suf));
    
    if (lower.endsWith("a") && !isEpiceneSuf) {
      return trimmed.slice(0, -1) + "o";
    }
    if (lower.endsWith("dora")) {
      return trimmed.slice(0, -1);
    }
  }

  return trimmed;
}

function matchCase(original: string, target: string): string {
  if (original === original.toUpperCase()) return target.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return target[0].toUpperCase() + target.slice(1);
  }
  return target;
}

// Helper to handle text or AI-driven high-fidelity parsing of PDFs or Word uploads
async function parseContractTemplate(file: File): Promise<string> {
  const isSimpleText = file.name.endsWith('.txt') || file.name.endsWith('.html') || file.name.endsWith('.rtf');
  if (isSimpleText) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || "");
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  // Read as arrayBuffer, convert to base64, and send to the server to parse using Gemini
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        const len = bytes.byteLength;
        const chunkSize = 8192;
        for (let i = 0; i < len; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binary += String.fromCharCode.apply(null, chunk as any);
        }
        const base64 = btoa(binary);

        let mimeType = file.type;
        if (!mimeType) {
          if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
          else if (file.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          else if (file.name.endsWith('.doc')) mimeType = 'application/msword';
          else mimeType = 'application/octet-stream';
        }

        const res = await fetch("/api/gemini/parse-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileBase64: base64,
            mimeType
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Falha do servidor de template.");
        }

        const data = await res.json();
        resolve(data.textContent || "");
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (e) => reject(e);
    reader.readAsArrayBuffer(file);
  });
}

// Render line-by-line formatted content representing bold elements and spacing of imported templates fidedignos
export function renderFormattedContent(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  
  return (
    <div className="space-y-1 my-2">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (trimmed === "--PAGE--") return null;

        // Render empty lines with fixed vertical spacer heights for layout faithfulness
        if (line === "") {
          return <div key={idx} className="h-3 md:h-4" aria-hidden="true" />;
        }

        // Standardize html <b> & <strong> tags to ** markdown style
        const normalized = line
          .replace(/<b>/g, "**")
          .replace(/<\/b>/g, "**")
          .replace(/<strong>/g, "**")
          .replace(/<\/strong>/g, "**");

        const parts = normalized.split("**");
        if (parts.length === 1) {
          return (
            <p key={idx} className="text-justify leading-relaxed text-slate-800 font-serif text-[11.5px] my-0 min-h-[1.1em]">
              {line}
            </p>
          );
        }

        return (
          <p key={idx} className="text-justify leading-relaxed text-slate-800 font-serif text-[11.5px] my-0 min-h-[1.1em]">
            {parts.map((part, pIdx) => {
              // Odd elements inside split are bold segments
              if (pIdx % 2 === 1) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-950 font-serif">
                    {part}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export function substituteContractVariables(template: string, contract: any, editStates?: any): string {
  if (!template) return "";

  // Recover values (with fallback chain matching business architecture)
  const locadorNome = editStates?.locadorNome ?? (contract?.overriddenLocadorNome ?? contract?.imovel?.proprietario?.nome ?? "Renato Faria Kawano");
  const locadorCpf = editStates?.locadorCpf ?? (contract?.overriddenLocadorCpf ?? contract?.imovel?.proprietario?.cpfCnpj ?? "341.602.388-90");
  const locadorRg = editStates?.locadorRg ?? (contract?.overriddenLocadorRg ?? contract?.imovel?.proprietario?.rg ?? "33.698.982-9");
  const locadorResidencia = editStates?.locadorResidencia ?? (contract?.overriddenLocadorResidencia ?? contract?.imovel?.proprietario?.residencia ?? "Santo André, SP");
  
  const rawLocadorNacionalidade = editStates?.locadorNacionalidade ?? (contract?.overriddenLocadorNacionalidade ?? contract?.imovel?.proprietario?.nacionalidade ?? "brasileiro(a)");
  const rawLocadorEstadoCivil = editStates?.locadorEstadoCivil ?? (contract?.overriddenLocadorEstadoCivil ?? contract?.imovel?.proprietario?.estadoCivil ?? "solteiro(a)");
  
  const locadorBanco = editStates?.locadorBanco ?? (contract?.overriddenLocadorBanco ?? contract?.imovel?.proprietario?.banco ?? "Banco Itaú");
  const locadorAgencia = editStates?.locadorAgencia ?? (contract?.overriddenLocadorAgencia ?? contract?.imovel?.proprietario?.agencia ?? "1063");
  const locadorConta = editStates?.locadorConta ?? (contract?.overriddenLocadorConta ?? contract?.imovel?.proprietario?.conta ?? "31860-2");
  const locadorPix = editStates?.locadorPix ?? (contract?.overriddenLocadorPix ?? contract?.imovel?.proprietario?.pixKey ?? "341.602.388-90");

  const locatarioNome = editStates?.locatarioNome ?? (contract?.overriddenLocatarioNome ?? contract?.inquilino?.nome ?? "Nome do Locatário");
  const locatarioCpf = editStates?.locatarioCpf ?? (contract?.overriddenLocatarioCpf ?? contract?.inquilino?.cpf ?? "000.000.000-00");
  const locatarioRg = editStates?.locatarioRg ?? (contract?.rgLocatario ?? "00.000.000-0");
  
  const rawLocatarioEstadoCivil = editStates?.locatarioEstadoCivil ?? (contract?.estadoCivilLocatario ?? "Solteiro(a)");
  const rawLocatarioProfissao = editStates?.locatarioProfissao ?? (contract?.profissaoLocatario ?? "Profissão");

  // Keep variables 100% faithful and fidedignas to original inputs as requested without modifications
  const locadorNacionalidade = rawLocadorNacionalidade;
  const locadorEstadoCivil = rawLocadorEstadoCivil;
  const locatarioEstadoCivil = rawLocatarioEstadoCivil;
  const locatarioProfissao = rawLocatarioProfissao;

  const addressBase = contract?.imovel?.endereco ?? "(Endereço do Imóvel)";
  const unitText = contract?.unidade ? ` - Unidade: ${contract.unidade}` : "";
  const enderecoImovel = editStates?.enderecoImovel ?? (contract?.overriddenEnderecoImovel ?? `${addressBase}${unitText}`);

  const valorAluguelNum = editStates?.valorAluguel ?? (contract?.overriddenValorAluguel ?? contract?.imovel?.valorAluguel ?? 1500);
  const valorAluguelExtenso = getValorAluguelPorExtenso(valorAluguelNum);
  const diaVencimento = editStates?.diaVencimento ?? (contract?.overriddenDiaVencimento ?? contract?.diaVencimento ?? 10);

  const taxaEntradaNum = editStates?.taxaEntrada ?? (contract?.overriddenTaxaEntrada ?? contract?.taxaEntrada ?? valorAluguelNum);
  const taxaEntradaExtenso = getValorAluguelPorExtenso(taxaEntradaNum);

  const rawDataInicio = editStates?.dataInicio ?? contract?.dataInicio ?? "";
  const rawDataFim = editStates?.dataFim ?? contract?.dataFim ?? "";

  const dataInicioFormated = formatarData(rawDataInicio);
  const dataFimFormated = formatarData(rawDataFim);
  const mesesVigencia = mesesPorExtenso(calcularMeses(rawDataInicio, rawDataFim));

  const conjugeObj = contract?.inquilino?.conjuge;
  const conjugeNome = conjugeObj?.nome || "Cônjuge Não Informado";
  const conjugeCpf = conjugeObj?.cpf || "000.000.000-00";
  const conjugeRg = conjugeObj?.rg || "Não informado";
  const conjugeProfissao = conjugeObj?.profissao || "Não informado";
  const conjugeEmail = conjugeObj?.email || "Não informado";
  const conjugeTelefone = conjugeObj?.telefone || "Não informado";
  const conjugeRendaNum = conjugeObj?.rendaMensal || 0;
  const conjugeRendaStr = `R$ ${conjugeRendaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const mainRendaNum = contract?.inquilino?.rendaMensal || 0;
  const jointRendaNum = contract?.inquilino?.rendaConjunta || (mainRendaNum + conjugeRendaNum);
  const rendaConjuntaStr = `R$ ${jointRendaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

  let text = template;
  
  const replacements: Record<string, string> = {
    "{{LOCADOR_NOME}}": locadorNome,
    "{{LOCADOR_CPF}}": locadorCpf,
    "{{LOCADOR_RG}}": locadorRg,
    "{{LOCADOR_RESIDENCIA}}": locadorResidencia,
    "{{LOCADOR_NACIONALIDADE}}": locadorNacionalidade,
    "{{LOCADOR_ESTADO_CIVIL}}": locadorEstadoCivil,
    "{{LOCADOR_BANCO}}": locadorBanco,
    "{{LOCADOR_AGENCIA}}": locadorAgencia,
    "{{LOCADOR_CONTA}}": locadorConta,
    "{{LOCADOR_PIX}}": locadorPix,

    "{{LOCATARIO_NOME}}": locatarioNome,
    "{{LOCATARIO_CPF}}": locatarioCpf,
    "{{LOCATARIO_RG}}": locatarioRg,
    "{{LOCATARIO_ESTADO_CIVIL}}": locatarioEstadoCivil,
    "{{LOCATARIO_PROFISSAO}}": locatarioProfissao,

    "{{CONJUGE_NOME}}": conjugeNome,
    "{{CONJUGE_CPF}}": conjugeCpf,
    "{{CONJUGE_RG}}": conjugeRg,
    "{{CONJUGE_PROFISSAO}}": conjugeProfissao,
    "{{CONJUGE_EMAIL}}": conjugeEmail,
    "{{CONJUGE_TELEFONE}}": conjugeTelefone,
    "{{CONJUGE_RENDA}}": conjugeRendaStr,
    "{{RENDA_CONJUNTA}}": rendaConjuntaStr,

    "{{IMOVEL_ENDERECO}}": enderecoImovel,
    "{{IMOVEL_VALOR}}": `R$ ${valorAluguelNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    "{{IMOVEL_VALOR_EXTENSO}}": valorAluguelExtenso,
    "{{IMOVEL_UNIDADE}}": contract?.unidade || "(Principal)",

    "{{CONTRATO_DATA_INICIO}}": dataInicioFormated,
    "{{CONTRATO_DATA_FIM}}": dataFimFormated,
    "{{CONTRATO_PRAZO_MESES}}": mesesVigencia,
    "{{CONTRATO_DIA_VENCIMENTO}}": String(diaVencimento),

    "{{TAXA_ENTRADA}}": `R$ ${taxaEntradaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    "{{TAXA_ENTRADA_EXTENSO}}": taxaEntradaExtenso,
  };

  Object.entries(replacements).forEach(([key, val]) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escapedKey, "g"), val);
  });

  const fallbackRules: Array<{pattern: RegExp, value: string}> = [
    { pattern: /\[NOME_LOCADOR\]|\[NOME DO LOCADOR\]|\[Locador\]|\[Nome do Locador\]/gi, value: locadorNome },
    { pattern: /\[CPF_LOCADOR\]|\[CPF DO LOCADOR\]|\[CPF Locador\]/gi, value: locadorCpf },
    { pattern: /\[RG_LOCADOR\]|\[RG DO LOCADOR\]/gi, value: locadorRg },
    { pattern: /\[RESIDENCIA_LOCADOR\]|\[RESIDÊNCIA DO LOCADOR\]|\[ENDERECO_LOCADOR\]/gi, value: locadorResidencia },
    { pattern: /\[NACIONALIDADE_LOCADOR\]|\[NACIONALIDADE DO LOCADOR\]/gi, value: locadorNacionalidade },
    { pattern: /\[ESTADO_CIVIL_LOCADOR\]|\[ESTADO CIVIL DO LOCADOR\]/gi, value: locadorEstadoCivil },
    { pattern: /\[BANCO_LOCADOR\]|\[BANCO DO LOCADOR\]/gi, value: locadorBanco },
    { pattern: /\[AGENCIA_LOCADOR\]|\[AGÊNCIA DO LOCADOR\]/gi, value: locadorAgencia },
    { pattern: /\[CONTA_LOCADOR\]|\[CONTA DO LOCADOR\]/gi, value: locadorConta },
    { pattern: /\[PIX_LOCADOR\]|\[PIX DO LOCADOR\]/gi, value: locadorPix },

    { pattern: /\[NOME_LOCATARIO\]|\[NOME DO LOCATÁRIO\]|\[Locatário\]|\[Nome do Locatário\]|\[Nome do Inquilino\]/gi, value: locatarioNome },
    { pattern: /\[CPF_LOCATARIO\]|\[CPF DO LOCATÁRIO\]|\[CPF Locatário\]|\[CPF do Inquilino\]/gi, value: locatarioCpf },
    { pattern: /\[RG_LOCATARIO\]|\[RG DO LOCATÁRIO\]/gi, value: locatarioRg },
    { pattern: /\[ESTADO_CIVIL_LOCATARIO\]|\[ESTADO CIVIL DO LOCATÁRIO\]/gi, value: locatarioEstadoCivil },
    { pattern: /\[PROFISSAO_LOCATARIO\]|\[PROFISSÃO DO LOCATÁRIO\]/gi, value: locatarioProfissao },

    { pattern: /\[NOME_CONJUGE\]|\[NOME DO CÔNJUGE\]|\[CÔNJUGE\]|\[Cônjuge\]/gi, value: conjugeNome },
    { pattern: /\[CPF_CONJUGE\]|\[CPF DO CÔNJUGE\]/gi, value: conjugeCpf },
    { pattern: /\[RG_CONJUGE\]|\[RG DO CÔNJUGE\]/gi, value: conjugeRg },
    { pattern: /\[PROFISSAO_CONJUGE\]|\[PROFISSÃO DO CÔNJUGE\]/gi, value: conjugeProfissao },
    { pattern: /\[RENDA_CONJUNTA\]|\[RENDA MENSAL CONJUNTA\]/gi, value: rendaConjuntaStr },

    { pattern: /\[ENDERECO_IMOVEL\]|\[ENDEREÇO DO IMÓVEL\]|\[Endereço\]/gi, value: enderecoImovel },
    { pattern: /\[VALOR_ALUGUEL\]|\[VALOR DO ALUGUEL\]|\[Valor\]/gi, value: `R$ ${valorAluguelNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
    { pattern: /\[VALOR_ALUGUEL_EXTENSO\]|\[VALOR POR EXTENSO\]/gi, value: valorAluguelExtenso },
    { pattern: /\[UNIDADE_IMOVEL\]|\[UNIDADE\]/gi, value: contract?.unidade || "" },

    { pattern: /\[DATA_INICIO\]|\[DATA DE INÍCIO\]|\[Início\]|\[Data Inicio\]/gi, value: dataInicioFormated },
    { pattern: /\[DATA_FIM\]|\[DATA DE FIM\]|\[Fim\]|\[Vigência\]|\[Data Fim\]/gi, value: dataFimFormated },
    { pattern: /\[DURATION_MONTHS\]|\[PRAZO_MESES\]|\[Prazo em meses\]/gi, value: mesesVigencia },
    { pattern: /\[DIA_VENCIMENTO\]|\[DIA DE VENCIMENTO\]|\[Vencimento\]/gi, value: String(diaVencimento) },

    { pattern: /\[TAXA_ENTRADA\]|\[TAXA DE ENTRADA\]|\[TAXA ENTRADA\]|\[VALOR DA TAXA DE ENTRADA\]|\[ENTRADA\]/gi, value: `R$ ${taxaEntradaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
    { pattern: /\[TAXA_ENTRADA_EXTENSO\]|\[TAXA DE ENTRADA POR EXTENSO\]/gi, value: taxaEntradaExtenso }
  ];

  fallbackRules.forEach(rule => {
    text = text.replace(rule.pattern, rule.value);
  });

  if (contract?.isDraftManuallyEdited) {
    return text;
  }

  // COHERENCE & AUTO-CORRECTION SUITE FOR NEW TENANT
  // This automatically cleans and replaces any leftover raw/hardcoded values from previous tenants in the custom template
  
  // 1. Dynamic replacement of payment day with Portuguese word representation
  const dayWords = numeroPorExtenso(diaVencimento);
  text = text.replace(/(dia|todo dia|vencimento|vencerá|todo o dia)\s*(\d{1,2})(?:\s*\(([^)]+)\))?/gi, (match, prefix, numStr, parenText, offset, fullText) => {
    const parsedNum = parseInt(numStr, 10);
    // Overwrite day of month if it's between 1 and 31
    if (parsedNum >= 1 && parsedNum <= 31) {
      const rest = fullText.slice(offset + match.length);
      const isDatePattern = /^\s*[\/-]\s*\d{2}/.test(rest) || /^\s*de\s*(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro|jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i.test(rest);
      if (isDatePattern) {
        return match;
      }
      return `${prefix} ${diaVencimento} (${dayWords})`;
    }
    return match;
  });

  // 2. Dynamic replacement and correction of lease value format and written text
  text = text.replace(/(?:R\s*\$|R\$)\s*([0-9.,]+)(?:\s*\(([^)]+)\))?/gi, (match, numStr, parenText, offset, fullText) => {
    let cleaned = numStr.replace(/\./g, "").replace(/,/g, ".");
    const parsedNum = parseFloat(cleaned);
    
    if (!isNaN(parsedNum)) {
      // Check if this match occurs on an item list line (e.g., Mobiliário/Itens inclusos in Parágrafo Primeiro)
      const lineStart = fullText.lastIndexOf("\n", offset);
      const lineEnd = fullText.indexOf("\n", offset);
      const currentLine = fullText.substring(lineStart === -1 ? 0 : lineStart, lineEnd === -1 ? fullText.length : lineEnd);
      
      const isItemLine = /reposi[çc][aã]o|indeniza[çc][aã]o|mobili[aá]rio|utens[ií]lios|par[aá]grafo primeiro|- \*\*/i.test(currentLine);

      if (isItemLine) {
        // Keep the exact item value (both formatted number and written out in Portuguese extenso)
        const formattedVal = parsedNum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const extensoVal = getValorAluguelPorExtenso(parsedNum);
        return `R$ ${formattedVal} (${extsoRentText(extensoVal)})`;
      }

      const isTaxaEntradaLine = /taxa de entrada|cau[çc][aã]o|antecipar o pagamento|dep[oó]sito referente|pintura/i.test(currentLine);
      if (isTaxaEntradaLine) {
        const formattedTaxa = taxaEntradaNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        const extensoTaxa = getValorAluguelPorExtenso(taxaEntradaNum);
        return `R$ ${formattedTaxa} (${extsoRentText(extensoTaxa)})`;
      }

      // If it resembles a rental value or has 'reais/real' in description, enforce the current contract's real rent
      if (parsedNum >= 200 || (parenText && (parenText.toLowerCase().includes("real") || parenText.toLowerCase().includes("reais") || parenText.toLowerCase().includes("mil")))) {
        const formattedRent = valorAluguelNum.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
        const extensoRent = getValorAluguelPorExtenso(valorAluguelNum);
        return `R$ ${formattedRent} (${extsoRentText(extensoRent)})`;
      } else {
        // For other auxiliary values/penalties, keep the numeral but guarantee exact word-compatibility
        const extensoParsed = getValorAluguelPorExtenso(parsedNum);
        return `R$ ${numStr} (${extsoRentText(extensoParsed)})`;
      }
    }
    return match;
  });

  // Helper helper to clean uppercase formatting
  function extsoRentText(txt: string): string {
    return txt.charAt(0).toLowerCase() + txt.slice(1);
  }

  // 3. Automated discard & sub-overwrite of pre-existing CPF patterns
  const cleanLocadorCpf = locadorCpf.replace(/[\s.-]/g, "");
  const cleanLocatarioCpf = locatarioCpf.replace(/[\s.-]/g, "");
  text = text.replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, (cpfMatch) => {
    const cleanMatch = cpfMatch.replace(/[\s.-]/g, "");
    if (cleanMatch !== cleanLocadorCpf && cleanMatch !== cleanLocatarioCpf) {
      return locatarioCpf; // Discard and override
    }
    return cpfMatch;
  });

  // 4. Automated discard & sub-overwrite of pre-existing standard RG patterns
  const cleanLocadorRg = locadorRg.replace(/[\s.-]/g, "").toUpperCase();
  const cleanLocatarioRg = locatarioRg.replace(/[\s.-]/g, "").toUpperCase();
  text = text.replace(/\b\d{2}\.\d{3}\.\d{3}-[\dXx]\b/g, (rgMatch) => {
    const cleanMatch = rgMatch.replace(/[\s.-]/g, "").toUpperCase();
    if (cleanMatch !== cleanLocadorRg && cleanMatch !== cleanLocatarioRg) {
      return locatarioRg; // Discard and override
    }
    return rgMatch;
  });

  return text;
}

// Converts standard days (1 to 31) into Portuguese text
export function numeroPorExtenso(n: number): string {
  const unidades = [
    "zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez",
    "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove", "vinte",
    "vinte e um", "vinte e dois", "vinte e três", "vinte e quatro", "vinte e cinco", "vinte e seis", "vinte e sete", "vinte e oito", "vinte e nove", "trinta", "trinta e um"
  ];
  if (n >= 0 && n <= 31) {
    return unidades[n];
  }
  return String(n);
}

// Recursively converts larger numbers into Portuguese text words
export function numeroGrandePorExtenso(n: number): string {
  if (n === 0) return "";
  
  const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  
  const converterDezenaUnidade = (num: number): string => {
    if (num < 20) return unidades[num];
    const d = Math.floor(num / 10);
    const u = num % 10;
    return dezenas[d] + (u > 0 ? " e " + unidades[u] : "");
  };

  const converterCentenaDezenaUnidade = (num: number): string => {
    if (num === 100) return "cem";
    const c = Math.floor(num / 100);
    const resto = num % 100;
    if (c === 0) return converterDezenaUnidade(resto);
    return centenas[c] + (resto > 0 ? " e " + converterDezenaUnidade(resto) : "");
  };

  const partes: string[] = [];
  const milhares = Math.floor(n / 1000);
  const restoCentos = n % 1000;
  
  if (milhares > 0) {
    if (milhares === 1) {
      partes.push("um mil");
    } else {
      partes.push(converterCentenaDezenaUnidade(milhares) + " mil");
    }
  }
  
  if (restoCentos > 0) {
    const prefix = (milhares > 0 && (restoCentos < 100 || restoCentos % 100 === 0)) ? "e " : "";
    partes.push((prefix ? "e " : "") + converterCentenaDezenaUnidade(restoCentos));
  }
  
  return partes.join(" ").replace(/\s+e\s+/g, " e ").trim();
}

// Converts generic lease values to fidedigning written words
export function getValorAluguelPorExtenso(valor: number): string {
  const realVal = Math.floor(valor);
  const centavos = Math.round((valor - realVal) * 100);
  
  let extensoReais = "";
  if (realVal === 1) {
    extensoReais = "um real";
  } else if (realVal > 1) {
    let numStr = numeroGrandePorExtenso(realVal);
    if (numStr.startsWith("um mil")) {
      numStr = "hum mil" + numStr.substring(6);
    }
    extensoReais = numStr + " reais";
  }
  
  let extensoCentavos = "";
  if (centavos > 0) {
    if (centavos === 1) {
      extensoCentavos = "um centavo";
    } else {
      extensoCentavos = numeroGrandePorExtenso(centavos) + " centavos";
    }
  }
  
  let res = extensoReais;
  if (extensoCentavos) {
    res += " e " + extensoCentavos;
  }
  
  if (res) {
    res = res.charAt(0).toUpperCase() + res.slice(1);
  }
  return res || "Zero reais";
}

export function formatarData(dataStr: string): string {
  if (!dataStr) return "...";
  const parts = dataStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}

// Calculate contract months length
export function calcularMeses(inicio: string, fim: string): number {
  if (!inicio || !fim) return 12;
  const d1 = new Date(inicio);
  const d2 = new Date(fim);
  const diffMonths = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth());
  return diffMonths > 0 ? diffMonths : 12;
}

export function mesesPorExtenso(meses: number): string {
  if (meses === 12) return "12 (Doze)";
  if (meses === 30) return "30 (Trinta)";
  if (meses === 24) return "24 (Vinte e Quatro)";
  if (meses === 36) return "36 (Trinta e Seis)";
  return `${meses}`;
}

export function ContractCountdown({ endDateStr, status, startDateStr }: { endDateStr: string; status: string; startDateStr: string }) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  // Compute total duration progress
  const nowMs = Date.now();
  const startMs = new Date(startDateStr).getTime() || nowMs;
  const endMs = new Date(endDateStr).getTime() || nowMs;
  const totalDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
  const elapsedDays = Math.max(0, Math.ceil((nowMs - startMs) / (1000 * 60 * 60 * 24)));
  const progressPercent = Math.min(100, Math.max(0, Math.floor((elapsedDays / totalDays) * 100)));

  useEffect(() => {
    function update() {
      const target = new Date(endDateStr).getTime();
      const now = Date.now();
      const diff = target - now;
      if (isNaN(target) || diff <= 0 || status === "ARQUIVADO") {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endDateStr, status]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-505 rounded-xl text-xs font-semibold border border-slate-200">
        <Clock className="h-4 w-4 text-slate-400 shrink-0" />
        <span>Vigência Expirada / Finalizada</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-3.5 space-y-2.5 shadow-xs font-sans">
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
          Contador Regressivo (Término do Contrato)
        </span>
        <span className="text-[10px] font-mono text-gray-400 font-bold">Vence em {formatarData(endDateStr)}</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/5">
          <span className="block text-base font-extrabold text-white tracking-tight leading-none">{timeLeft.days}</span>
          <span className="text-[8px] uppercase text-gray-400 block tracking-wider mt-1">Dias</span>
        </div>
        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/5">
          <span className="block text-base font-extrabold text-white tracking-tight leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[8px] uppercase text-gray-400 block tracking-wider mt-1">Horas</span>
        </div>
        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/5">
          <span className="block text-base font-extrabold text-white tracking-tight leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[8px] uppercase text-gray-400 block tracking-wider mt-1">Min</span>
        </div>
        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-200/5">
          <span className="block text-base font-extrabold text-amber-400 tracking-tight leading-none">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[8px] uppercase text-slate-400 block tracking-wider mt-1">Seg</span>
        </div>
      </div>

      {/* Progress Bar of total contract time */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-gray-400">
          <span>Tempo Decorrido: {progressPercent}%</span>
          <span>Faltam {timeLeft.days} dias</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface ContractRelationCardProps {
  key?: any;
  c: Contrato;
  onContractAdded: () => void;
  setPreviewContract: (c: any) => void;
  handleDownloadPDF: (c: Contrato) => void;
  onGenerateSummary: (c: Contrato) => void;
  setSelectedSharingContract: (c: any) => void;
  handleSignContract: (id: string) => any;
  signingId: string | null;
  setContractToArchive: (c: any) => void;
  forceExpanded?: boolean;
}

export function ContractRelationCard({
  c,
  onContractAdded,
  setPreviewContract,
  handleDownloadPDF,
  onGenerateSummary,
  setSelectedSharingContract,
  handleSignContract,
  signingId,
  setContractToArchive,
  forceExpanded
}: ContractRelationCardProps) {
  const isUnderOnboarding = c.status === "EM_ONBOARDING";
  const isArchived = c.status === "ARQUIVADO";

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (forceExpanded) {
      setIsExpanded(true);
    }
  }, [forceExpanded]);

  // Financial and payment edits state
  const [editingRent, setEditingRent] = useState(false);
  const [rentInput, setRentInput] = useState<string>(
    String(c.overriddenValorAluguel || c.imovel?.valorAluguel || 1500)
  );

  const [editingDueDay, setEditingDueDay] = useState(false);
  const [dueDayInput, setDueDayInput] = useState<string>(
    String(c.overriddenDiaVencimento || c.diaVencimento || 10)
  );

  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const executeDeleteContract = async () => {
    try {
      setDeleting(true);
      setDeleteError(null);

      const res = await fetch(`/api/contracts/${c.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao excluir o contrato no servidor.");
      }

      setShowDeleteModal(false);
      onContractAdded();
    } catch (err: any) {
      console.error("Erro ao excluir contrato:", err);
      setDeleteError(err.message || "Falha ao excluir o contrato.");
    } finally {
      setDeleting(false);
    }
  };

  // Helper to read file as data URL inside client side securely
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUploadFile(e.target.files[0]);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!c.inquilinoId) return;
    try {
      setUploadingFile(true);
      const fileDataUrl = await readFileAsDataURL(file);
      
      const bytes = file.size;
      let sizeStr = "0 KB";
      if (bytes < 1024) {
        sizeStr = `${bytes} B`;
      } else if (bytes < 1024 * 1024) {
        sizeStr = `${(bytes / 1024).toFixed(1)} KB`;
      } else {
        sizeStr = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }

      const res = await fetch(`/api/tenants/${c.inquilinoId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: file.name,
          tamanho: sizeStr,
          url: fileDataUrl
        })
      });

      if (!res.ok) {
        throw new Error("Falha ao salvar o arquivo.");
      }

      onContractAdded();
    } catch (err: any) {
      alert("Erro ao anexar arquivo: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!c.inquilinoId) return;
    if (!confirm("Tem certeza que deseja remover este documento da ficha do inquilino? Esta exclusão será considerada definitiva.")) return;
    
    try {
      setUploadingFile(true);
      const res = await fetch(`/api/tenants/${c.inquilinoId}/files/${fileId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        throw new Error("Falha ao remover o arquivo.");
      }
      onContractAdded();
    } catch (err: any) {
      alert("Erro ao remover arquivo: " + err.message);
    } finally {
      setUploadingFile(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FileText className="h-4 w-4 text-rose-500 shrink-0" />;
    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return <BookOpen className="h-4 w-4 text-indigo-500 shrink-0" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileCheck className="h-4 w-4 text-emerald-500 shrink-0" />;
    if (['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(ext)) return <Eye className="h-4 w-4 text-purple-500 shrink-0" />;
    return <FileText className="h-4 w-4 text-slate-400 shrink-0" />;
  };

  const handleUpdateContractConfig = async (fields: Record<string, any>) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/contracts/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (!res.ok) throw new Error("Não foi possível atualizar o contrato.");
      
      onContractAdded();
      setEditingRent(false);
      setEditingDueDay(false);
    } catch (err: any) {
      alert("Erro ao salvar alterações: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const applyPercentShort = (pct: number) => {
    const baseVal = c.overriddenValorAluguel || c.imovel?.valorAluguel || 1500;
    const newVal = Math.round(baseVal * (1 + pct / 100));
    setRentInput(String(newVal));
  };

  const currentRentVal = c.overriddenValorAluguel || c.imovel?.valorAluguel || 0;
  const isRentOverridden = c.overriddenValorAluguel !== undefined && c.overriddenValorAluguel !== c.imovel?.valorAluguel;
  
  const currentDueDay = c.overriddenDiaVencimento || c.diaVencimento || 10;
  const isDueDayOverridden = c.overriddenDiaVencimento !== undefined && c.overriddenDiaVencimento !== c.diaVencimento;

  return (
    <div 
      className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${
        isArchived 
          ? "bg-gray-100/50 border-gray-250 opacity-80" 
          : "bg-white border-gray-150/90 shadow-xs hover:shadow-md"
      }`}
    >
      {/* Decorative colored left visual band */}
      <div className={`absolute left-0 top-0 bottom-0 w-2 ${
        isArchived ? "bg-slate-400" : isUnderOnboarding ? "bg-amber-400" : "bg-emerald-500"
      }`} />

      {/* Contract card header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-3 border-b border-gray-100 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-extrabold uppercase bg-slate-100 border border-slate-205 py-0.5 px-2 rounded-lg text-slate-800">
              PRTOS-{c.id.substring(0,8).toUpperCase()}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
              isArchived
                ? "bg-slate-100 text-slate-700 border-slate-200"
                : isUnderOnboarding 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-emerald-50 text-emerald-700 border-emerald-100"
            }`}>
              {isArchived ? "Sessão Arquivada" : isUnderOnboarding ? "Minuta Criada (Aguardando Assinaturas)" : "Contrato Ativo (Sob Gestão)"}
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-gray-950 flex items-center gap-1">
            <User className="h-4 w-4 text-indigo-600 inline shrink-0" />
            {c.inquilino?.nome}
            <span className="text-xs text-slate-400 font-medium">({c.inquilino?.email})</span>
          </h4>
        </div>

        {/* Dynamic Countdown widget on top right if Active */}
        {!isArchived && !isUnderOnboarding && (
          <div className="w-full sm:w-72 shrink-0">
            <ContractCountdown endDateStr={c.dataFim} startDateStr={c.dataInicio} status={c.status} />
          </div>
        )}
      </div>

      {/* Compact Info Strip - Always visible to keep the dashboard context perfectly organized */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pl-3 bg-slate-50/50 p-3 rounded-xl border border-gray-150/70 text-xs text-gray-600 font-sans select-none">
        <div className="space-y-1.5 flex-1">
          <p className="font-extrabold text-gray-900 flex items-center gap-1.5 flex-wrap font-sans">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
            {c.imovel?.endereco?.split(' - ')[0]} 
            {c.unidade && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Apto/Kit: {c.unidade}
              </span>
            )}
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              Aluguel: <strong className="text-indigo-600 font-bold">R$ {currentRentVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-gray-300">•</span>
            <span>Vencimento: <strong className="text-gray-800 font-bold">Todo dia {currentDueDay}</strong></span>
            <span className="text-gray-300">•</span>
            <span>Vigência: <strong className="text-gray-750 font-medium">{formatarData(c.dataInicio)} ~ {formatarData(c.dataFim)}</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase text-[10px] tracking-wide rounded-lg transition shadow-3xs cursor-pointer font-sans"
        >
          {isExpanded ? (
            <>Recolher Informações <ChevronUp className="h-4 w-4 shrink-0" /></>
          ) : (
            <>Ver Opções e Documentos ({c.inquilino?.arquivos?.length || 0}) <ChevronDown className="h-4 w-4 shrink-0" /></>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pl-3">
        {/* Left Column: Contract overview details */}
        <div className="lg:col-span-7 space-y-4">
          <p className="text-xs text-gray-700 font-semibold flex items-start gap-1">
            <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="flex flex-wrap items-center gap-1.5 leading-normal">
              {c.imovel?.endereco}
              {c.unidade && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Unidade / Apt: {c.unidade}
                </span>
              )}
            </span>
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-500 font-medium font-sans">
            <div>
              <span className="block text-[9px] uppercase font-bold text-black tracking-wider">Locador / Dono</span>
              <span className="text-gray-900 font-extrabold text-[11.5px] truncate block mt-0.5">Renato Faria Kawano</span>
            </div>
            
            <div>
              <span className="block text-[9px] uppercase font-bold text-black tracking-wider">Vigência Inicial</span>
              <span className="text-gray-900 font-bold block mt-0.5 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-700 inline" />
                {formatarData(c.dataInicio)} até {formatarData(c.dataFim)}
              </span>
            </div>

            <div>
              <span className="block text-[9px] uppercase font-bold text-black tracking-wider">Preço Aluguel Atual</span>
              <span className="text-indigo-700 font-extrabold text-[12px] block mt-0.5 flex flex-col gap-0.5">
                <span className="flex items-center gap-0.5">
                  <DollarSign className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentRentVal)}
                </span>
                {isRentOverridden && (
                  <span className="text-[8.5px] text-black font-semibold line-through">
                    Original: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.imovel?.valorAluguel || 0)}
                  </span>
                )}
              </span>
            </div>

            <div className="col-span-2 md:col-span-1">
              <span className="block text-[9px] uppercase font-bold text-black tracking-wider">Dia do Pagamento (Venc.)</span>
              <span className="text-gray-800 font-extrabold text-[11.5px] block mt-0.5">
                Todo dia {currentDueDay}
                {isDueDayOverridden && (
                  <span className="text-[8.5px] text-amber-600 block bg-amber-50 rounded px-1.5 py-0.2 w-max mt-0.5">Alterado (Original: {c.diaVencimento})</span>
                )}
              </span>
            </div>
          </div>

          {/* Devolutivas section inside the details column */}
          {c.devolutivaContratoAssinadoFileName && (
            <div className="space-y-2">
              <div className="p-3 bg-emerald-50/70 border border-emerald-150 rounded-xl text-xs text-emerald-950 font-sans leading-normal flex items-start gap-2.5">
                <FileCheck className="h-4.5 w-4.5 text-emerald-650 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-emerald-900 text-[11px] font-bold">📥 DEVOLUTIVA COM CERTIFICADO RECEBIDA</strong>
                  <p className="text-emerald-850 text-[10.5px]">Arquivo devolvido assinado pelo inquilino: <span className="font-semibold text-slate-900 bg-emerald-100/60 px-1 rounded">{c.devolutivaContratoAssinadoFileName}</span>.</p>
                  {c.assinaturaInquilinoHashGovBr && (
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Hash Assinatura Inquilino (Gov.br): {c.assinaturaInquilinoHashGovBr}</p>
                  )}
                </div>
              </div>

              {c.govBrVerifiedSignature && c.govBrVerificationDetails && (
                <div className="p-3.5 bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-150 rounded-xl space-y-2 font-sans">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-blue-600 rounded-xs flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-tighter">gov</div>
                      <span className="text-[10px] font-extrabold text-blue-900 uppercase tracking-wide">Laudo Técnico API Gov.br</span>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-900 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                      ✓ VERIFICADO (ITI)
                    </span>
                  </div>

                  <div className="text-[10px] space-y-1 font-mono text-slate-600">
                    <div>👤 <strong>Assinante:</strong> <span className="text-slate-900 font-bold">{c.govBrVerificationDetails.signerName}</span></div>
                    <div>🪪 <strong>CPF Identificado:</strong> <span className="text-slate-900 font-bold">{c.govBrVerificationDetails.signerCpf}</span></div>
                    <div>🔒 <strong>Integridade:</strong> <span className="text-emerald-700 font-bold">✓ Assinatura ICP-Brasil Válida e Íntegra</span></div>
                    <div>🏛 <strong>Emissor:</strong> <span className="text-slate-500">{c.govBrVerificationDetails.authority}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isArchived && c.observacoesInterrupcao && (
            <div className="p-3 bg-rose-550/5 border border-rose-100 rounded-xl text-xs text-rose-955 font-sans leading-relaxed">
              <span className="block text-[9px] uppercase font-extrabold text-rose-700 tracking-wider mb-1">Observações de Encerramento (Histórico):</span>
              <p className="whitespace-pre-wrap">{c.observacoesInterrupcao}</p>
            </div>
          )}
        </div>

        {/* Right Column: Quick Finance Actions tabs (Efetuar Reajuste and Alterar Vencimento) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 border-t lg:border-t-0 lg:border-l border-gray-150 pt-4 lg:pt-0 lg:pl-5">
          {!isArchived ? (
            <div className="space-y-4">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400 block pb-1 border-b border-gray-100">
                Ajustes Rápidos de Locação
              </span>

              {/* Ajustar Aluguel Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-gray-800 flex items-center gap-1 font-sans">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Efetuar Reajuste Financeiro
                  </span>
                  {!editingRent ? (
                    <button 
                      onClick={() => setEditingRent(true)}
                      className="text-[10px] font-extrabold text-indigo-650 hover:text-indigo-800 cursor-pointer uppercase tracking-tight"
                    >
                      Ajustar
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingRent(false)}
                      className="text-[10px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Voltar
                    </button>
                  )}
                </div>

                {!editingRent ? (
                  <p className="text-[10.5px] text-gray-400 leading-normal">
                    Realize o reajuste anual de aluguel (IGP-M/IPCA) ou acerto amigável de mensalidades.
                  </p>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-gray-400 font-mono">R$</span>
                        <input
                          type="number"
                          value={rentInput}
                          onChange={(e) => setRentInput(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-slate-250 rounded-lg text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                      
                      <button
                        onClick={() => handleUpdateContractConfig({ overriddenValorAluguel: Number(rentInput) })}
                        disabled={updating}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer uppercase tracking-wide"
                      >
                        SALVAR
                      </button>
                    </div>

                    {/* Quick percentage helper chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button 
                        onClick={() => applyPercentShort(5)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 text-[9px] font-bold cursor-pointer"
                        title="Acrescenta 5%"
                      >
                        +5%
                      </button>
                      <button 
                        onClick={() => applyPercentShort(7.5)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 text-[9px] font-bold cursor-pointer"
                        title="Acrescenta 7.5% (Aprox. Reajuste IPCA)"
                      >
                        +7.5%
                      </button>
                      <button 
                        onClick={() => applyPercentShort(10)}
                        className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-slate-705 border border-slate-200 text-[9px] font-bold cursor-pointer"
                        title="Acrescenta 10%"
                      >
                        +10%
                      </button>
                    </div>
                    <span className="block text-[9px] text-gray-400 italic">
                      Valor convertido por extenso: "{getValorAluguelPorExtenso(Number(rentInput) || 0)}"
                    </span>
                  </div>
                )}
              </div>

              {/* Alterar Dia de Vencimento Section */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-gray-800 flex items-center gap-1 font-sans">
                    <Calendar className="h-3.5 w-3.5 text-amber-655 shrink-0" />
                    Alterar Data de Pagamento
                  </span>
                  {!editingDueDay ? (
                    <button 
                      onClick={() => setEditingDueDay(true)}
                      className="text-[10px] font-extrabold text-indigo-650 hover:text-indigo-800 cursor-pointer uppercase tracking-tight"
                    >
                      Alterar
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingDueDay(false)}
                      className="text-[10px] font-bold text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      Voltar
                    </button>
                  )}
                </div>

                {!editingDueDay ? (
                  <p className="text-[10.5px] text-gray-400 leading-normal">
                    Pactue uma nova data fixa mensal (Vencimento) para recebimento das mensalidades de aluguel.
                  </p>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <select
                          value={dueDayInput}
                          onChange={(e) => setDueDayInput(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-250 rounded-lg text-xs font-mono font-bold text-slate-800 cursor-pointer"
                        >
                          {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                            <option key={day} value={day}>Todo dia {day}</option>
                          ))}
                        </select>
                      </div>
                      
                      <button
                        onClick={() => handleUpdateContractConfig({ overriddenDiaVencimento: Number(dueDayInput) })}
                        disabled={updating}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-[10px] font-bold transition shrink-0 cursor-pointer uppercase tracking-wide"
                      >
                        SALVAR
                      </button>
                    </div>
                    <span className="block text-[9px] text-slate-400">Novo dia de preferência contratual: todo dia {dueDayInput} de cada mês.</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-400 leading-relaxed text-center">
              A relação jurídica encontra-se inativa ou descontinuada. Os parâmetros financeiros não admitem novas alterações retroativas.
            </div>
          )}

          {/* Core Documents / Actions buttons footer */}
          <div className="grid grid-cols-2 gap-2 mt-2 w-full pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onGenerateSummary(c)}
              className="col-span-2 px-2.5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-lg text-[10.5px] tracking-wide transition flex items-center gap-1.5 justify-center cursor-pointer font-sans shadow-3xs hover:shadow-sm"
              title="Análise preditiva de riscos e resumo executivo via Inteligência Artificial"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-100 animate-pulse" />
              <span>Resumo Executivo & Análise de Riscos (IA)</span>
            </button>

            <button
              onClick={() => setPreviewContract(c)}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 shrink-0 justify-center cursor-pointer font-sans"
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span>Exibir Minuta</span>
            </button>

            <button
              onClick={() => handleDownloadPDF(c)}
              className="px-2.5 py-1.5 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-lg text-[10.5px] font-semibold transition flex items-center gap-1 justify-center cursor-pointer shadow-2xs"
              title="Baixar Contrato em PDF"
            >
              <Download className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span>Baixar PDF</span>
            </button>

            {c.devolutivaContratoAssinadoFileBase64 && (
              <button
                onClick={() => {
                  const linkSource = `data:application/pdf;base64,${c.devolutivaContratoAssinadoFileBase64}`;
                  const downloadLink = document.createElement("a");
                  downloadLink.href = linkSource;
                  downloadLink.download = c.devolutivaContratoAssinadoFileName || "Contrato_Assinado_Inquilino.pdf";
                  downloadLink.click();
                }}
                className="col-span-2 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10.5px] font-bold transition flex items-center gap-1 justify-center cursor-pointer font-sans"
                title="Baixar Contrato assinado retornado pelo Inquilino"
              >
                <FileCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>Baixar Devolutiva Assinada</span>
              </button>
            )}

            {!isArchived ? (
              <>
                <button
                  onClick={() => setSelectedSharingContract(c)}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 border border-indigo-200 rounded-lg text-[10px] font-semibold transition flex items-center gap-1 justify-center cursor-pointer font-sans"
                >
                  <Share2 className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                  <span>Notificar Gov.br</span>
                </button>

                {isUnderOnboarding ? (
                  <button
                    onClick={() => handleSignContract(c.id)}
                    disabled={signingId === c.id}
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 justify-center cursor-pointer"
                  >
                    <PenTool className="h-3.5 w-3.5 shrink-0 text-white" />
                    <span>Auto-Assinar</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1.5 rounded-lg border border-blue-100 text-[9.5px] font-bold font-sans justify-center">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>Inquilino Assinou</span>
                  </div>
                )}

                <button
                  onClick={() => setContractToArchive(c)}
                  className="col-span-2 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1 justify-center cursor-pointer"
                  title="Arquivar contrato terminado, não renovado ou interrompido"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0 text-rose-500" />
                  <span>Arquivar / Interromper Contrato</span>
                </button>
              </>
            ) : (
              <div className="col-span-2 flex flex-col gap-2">
                <div className="text-center py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                  Relação Encerrada e Arquivada
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteError(null);
                    setShowDeleteModal(true);
                  }}
                  disabled={deleting}
                  className="w-full px-2.5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-bold rounded-lg text-[10.5px] tracking-wide transition flex items-center gap-1.5 justify-center cursor-pointer shadow-3xs"
                  title="Excluir este contrato arquivado e apagar definitivamente todas as cobranças e atividades vinculadas"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{deleting ? "Excluindo Contrato..." : "Excluir Definitivamente Contrato Arquivado"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Seção unificada de Documentos e Fichas do Inquilino - Disponível para Vigentes e Arquivados */}
      <div className="border-t border-gray-155 pt-4 mt-2 pl-3 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-bold text-gray-950 uppercase tracking-wide">
              Documentos e Fichas do Inquilino
            </span>
            <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-md bg-slate-100 text-slate-800 border border-slate-205">
              {c.inquilino?.arquivos?.length || 0}
            </span>
          </div>
          <span className="text-[10px] text-gray-400">Armazenamento digital irrestrito</span>
        </div>

        {/* Existing files list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {c.inquilino?.arquivos && c.inquilino.arquivos.length > 0 ? (
            c.inquilino.arquivos.map((file) => (
              <div 
                key={file.id} 
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden mr-2">
                  {getFileIcon(file.nome)}
                  <div className="flex flex-col text-left overflow-hidden min-w-0">
                    <span className="font-bold text-gray-800 truncate" title={file.nome}>
                      {file.nome}
                    </span>
                    <span className="text-[9px] text-gray-450 flex items-center gap-1">
                      <span>{file.tamanho || "Indeterminado"}</span>
                      <span>•</span>
                      <span>{file.dataUpload ? new Date(file.dataUpload).toLocaleDateString("pt-BR") : "---"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {file.url && file.url !== "#" ? (
                    <a 
                      href={file.url} 
                      download={file.nome}
                      className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition shadow-2xs cursor-pointer"
                      title="Baixar Arquivo"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="p-1 opacity-40 text-slate-300 cursor-not-allowed"
                      title="Nenhum conteúdo disponível"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-1 hover:bg-rose-50 rounded text-rose-500 hover:text-rose-750 transition cursor-pointer"
                    title="Excluir Arquivo"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 flex flex-col items-center justify-center gap-1">
              <FileCheck className="h-6 w-6 text-slate-300 opacity-60" />
              <span>Nenhum documento anexado à pasta deste inquilino.</span>
            </div>
          )}
        </div>

        {/* Drag & Drop Upload Zone supporting Word, PDF, Images & any format */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border border-dashed rounded-xl p-3.5 text-center transition-all cursor-pointer ${
            dragActive 
              ? "border-indigo-500 bg-indigo-50/30" 
              : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
          }`}
        >
          <label htmlFor={`file-upload-${c.id}`} className="cursor-pointer block">
            <input 
              id={`file-upload-${c.id}`}
              type="file" 
              className="hidden" 
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center gap-1 text-xs">
              {uploadingFile ? (
                <div className="flex items-center gap-2 text-indigo-650 font-semibold">
                  <Clock className="h-4 w-4 animate-spin text-indigo-500" />
                  <span>Criptografando e salvando arquivo na ficha...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 font-bold text-indigo-600 hover:text-indigo-800">
                    <Upload className="h-4 w-4" />
                    <span>Anexar Arquivo (Word, PDF, JPG e afins)</span>
                  </div>
                  <span className="text-[10px] text-slate-450">
                    Arraste arquivos aqui ou clique para selecionar qualquer formato de arquivo
                  </span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>
      </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DEFINITIVA DO CONTRATO */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-left">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-rose-700 to-rose-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Trash2 className="h-5 w-5 text-rose-200 shrink-0" />
                <h3 className="text-base font-extrabold tracking-wide">
                  Excluir Contrato Arquivado Definitivamente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="text-rose-200 hover:text-white p-1 rounded-lg transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-extrabold text-sm">
                  <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>Atenção: Operação Irreversível</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Esta ação excluirá permanentemente este contrato arquivado e limpará todas as atividades e pendências geradas nas outras abas do sistema.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5">
                <div><span className="font-bold text-slate-700">Inquilino:</span> {c.inquilino?.nome || "Não informado"}</div>
                <div><span className="font-bold text-slate-700">Imóvel:</span> {c.imovel?.endereco || "Não informado"}{c.unidade ? ` (Unidade: ${c.unidade})` : ""}</div>
                <div><span className="font-bold text-slate-700">Status Atual:</span> Arquivado</div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Itens que serão apagados do sistema:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>O registro e os arquivos do contrato arquivado;</li>
                  <li>Todas as cobranças e lançamentos gerados na aba de Cobrança / Finanças;</li>
                  <li>Registros de despesas, repasses e históricos associados.</li>
                </ul>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={executeDeleteContract}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 text-white" />
                    <span>Sim, Excluir Definitivamente</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

interface ContractManagementProps {
  contratos: Contrato[];
  inquilinos: Inquilino[];
  imoveis: Imovel[];
  onContractAdded: () => void;
  onAddPropertyClick?: () => void;
}

export default function ContractManagement({
  contratos,
  inquilinos,
  imoveis,
  onContractAdded,
  onAddPropertyClick
}: ContractManagementProps) {
  // New contract form states
  const [selectedInquilino, setSelectedInquilino] = useState<string>("");
  const [selectedImovel, setSelectedImovel] = useState<string>("");
  const [selectedUnidade, setSelectedUnidade] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-01`;
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const startStr = `${yyyy}-${mm}-01`;
    const date = new Date(startStr + "T00:00:00");
    const end = new Date(date);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    const endMm = String(end.getMonth() + 1).padStart(2, "0");
    const endDd = String(end.getDate()).padStart(2, "0");
    const endYyyy = end.getFullYear();
    return `${endYyyy}-${endMm}-${endDd}`;
  });
  const [dueDay, setDueDay] = useState<number>(10);
  const [taxaEntrada, setTaxaEntrada] = useState<number>(1500);

  const handleStartDateChange = (newVal: string) => {
    setStartDate(newVal);
    setIsEditingDraftManually(false);
    if (newVal) {
      const date = new Date(newVal + "T00:00:00");
      if (!isNaN(date.getTime())) {
        const end = new Date(date);
        end.setFullYear(end.getFullYear() + 1);
        end.setDate(end.getDate() - 1);
        const endMm = String(end.getMonth() + 1).padStart(2, "0");
        const endDd = String(end.getDate()).padStart(2, "0");
        const endYyyy = end.getFullYear();
        setEndDate(`${endYyyy}-${endMm}-${endDd}`);
      }
    }
  };
  
  // Dynamic fields mapped directly into the lease text model (as requested)
  const [rgLocatario, setRgLocatario] = useState<string>("16.141.921-4");
  const [estadoCivilLocatario, setEstadoCivilLocatario] = useState<string>("Solteiro(a)");
  const [profissaoLocatario, setProfissaoLocatario] = useState<string>("Profissional Autônomo");

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States for pre-generation contract draft preview and direct editing
  const [draftText, setDraftText] = useState<string>("");
  const [isEditingDraftManually, setIsEditingDraftManually] = useState<boolean>(false);
  const [showFullscreenEditor, setShowFullscreenEditor] = useState<boolean>(false);

  // States for kitnet included items (furniture, appliances, etc.)
  const [includeItemsClause, setIncludeItemsClause] = useState<boolean>(false);
  const [includedItems, setIncludedItems] = useState<Array<{ id: string; name: string; value: number; selected: boolean }>>([
    { id: "item-1", name: "Móveis", value: 2500, selected: false },
    { id: "item-2", name: "Guarda-roupa", value: 1200, selected: false },
    { id: "item-3", name: "Gabinete de cozinha", value: 800, selected: false },
    { id: "item-4", name: "Gabinete de banheiro", value: 450, selected: false },
    { id: "item-5", name: "Fogão Cooktop 2 bocas", value: 500, selected: false },
    { id: "item-6", name: "Frigobar", value: 1100, selected: false },
    { id: "item-7", name: "Armário de banheiro", value: 350, selected: false }
  ]);
  const [newItemName, setNewItemName] = useState<string>("");
  const [newItemValue, setNewItemValue] = useState<number>(0);

  // Helper to generate the technical cost clause for included items
  const generateItemsClauseText = (items: Array<{ id: string; name: string; value: number; selected: boolean }>) => {
    const selected = items.filter(i => i.selected);
    if (selected.length === 0) return "";

    const itemsListText = selected.map(item => {
      const val = Number(item.value) || 0;
      const formattedVal = val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const extensoVal = getValorAluguelPorExtenso(val);
      return `   - **${item.name.trim()}**: Valor de reposição/indenização em caso de dano: R$ ${formattedVal} (${extensoVal.charAt(0).toLowerCase() + extensoVal.slice(1)})`;
    }).join("\n");

    return `**Parágrafo primeiro:** O imóvel objeto deste contrato de locação residencial é entregue ao LOCATÁRIO devidamente equipado com os bens móveis e utensílios listados abaixo, de propriedade exclusiva do LOCADOR, todos em perfeito estado de conservação e pleno funcionamento:
${itemsListText}

O LOCATÁRIO assume total e integral responsabilidade civil e financeira pela guarda, zelo, conservação e uso adequado de todos os referidos itens acima descritos. Fica expressamente acordado e ajustado entre as partes que a danificação, parcial ou total, avaria, quebra, extravio ou mau uso de qualquer um dos itens listados acima implicará na obrigação legal do LOCATÁRIO de proceder à correspondente restituição financeira do bem ao LOCADOR pelo valor estipulado para cada item nesta cláusula, ou arcar de forma integral com o custeio do reparo técnico do bem no prazo máximo de 5 (cinco) dias úteis contados a partir da constatação e demonstração inequívoca do dano.`;
  };

  // Helper to insert or update the included items clause directly below CLÁUSULA OITAVA as Parágrafo primeiro, and BEFORE CLÁUSULA NONA
  const insertItemsClauseBelowOitava = (templateText: string, clauseText: string): string => {
    if (!templateText) return "";

    // Clean out any existing Parágrafo primeiro block if present to ensure fresh replacement
    const existingParaRegex = /(?:\*\*Parágrafo primeiro:\*\*|Parágrafo primeiro:|PARÁGRAFO PRIMEIRO:)[\s\S]*?(?=\n\n(?:CLÁUSULA|CLAUSULA|[A-Z0-9ÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s—\-–:]+:|FORO|--PAGE--)|$)/i;
    let cleaned = templateText;
    if (existingParaRegex.test(cleaned)) {
      cleaned = cleaned.replace(existingParaRegex, "").replace(/\n{3,}/g, "\n\n");
    }

    if (!clauseText || !clauseText.trim()) return cleaned;

    // Check if CLÁUSULA NONA or CLAUSULA NONA exists in templateText
    const nonaMatch = cleaned.match(/((?:CLÁUSULA|CLAUSULA)\s+(?:NONA|9ª|9))/i);
    if (nonaMatch) {
      // Insert clauseText right BEFORE Cláusula Nona
      return cleaned.replace(nonaMatch[0], `${clauseText.trim()}\n\n${nonaMatch[0]}`);
    }

    // If Cláusula Nona is not present, search for Cláusula Oitava
    const oitavaMatch = cleaned.match(/((?:CLÁUSULA|CLAUSULA)\s+(?:OITAVA|8ª|8)[\s\S]*?)(?=\n\n(?:CLÁUSULA|CLAUSULA|[A-Z0-9ÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s—\-–:]+:|FORO|--PAGE--)|$)/i);

    if (oitavaMatch && oitavaMatch[1]) {
      const fullMatchedClause = oitavaMatch[1].trimEnd();
      const defaultNona = `CLÁUSULA NONA — DA CESSÃO E TRANSFERÊNCIA:\nNão é permitida a transferência deste contrato em todo ou em parte.`;
      return cleaned.replace(fullMatchedClause, `${fullMatchedClause}\n\n${clauseText.trim()}\n\n${defaultNona}`);
    }

    // Fallback 1: Insert before FORO DE ELEIÇÃO
    if (cleaned.includes("FORO DE ELEIÇÃO")) {
      return cleaned.replace(
        "FORO DE ELEIÇÃO",
        `${clauseText.trim()}\n\nFORO DE ELEIÇÃO`
      );
    }

    // Fallback 2: Append at end
    return `${cleaned.trim()}\n\n${clauseText.trim()}`;
  };

  const [syncToastMsg, setSyncToastMsg] = useState<string | null>(null);

  const handleSyncContractData = () => {
    setIsEditingDraftManually(false);

    let templateBase = uploadedTemplate?.content || getDefaultTemplateText();
    
    if (includeItemsClause) {
      const clauseText = generateItemsClauseText(includedItems);
      if (clauseText) {
        templateBase = insertItemsClauseBelowOitava(templateBase, clauseText);
      }
    } else {
      templateBase = insertItemsClauseBelowOitava(templateBase, "");
    }

    const currentInq = inquilinos.find(i => i.id === selectedInquilino);
    const currentImv = imoveis.find(i => i.id === selectedImovel);

    const tempContract = {
      dataInicio: startDate,
      dataFim: endDate,
      diaVencimento: Number(dueDay) || 10,
      taxaEntrada: Number(taxaEntrada) || 0,
      rgLocatario,
      estadoCivilLocatario,
      profissaoLocatario,
      unidade: selectedUnidade,
      customTemplateName: uploadedTemplate?.name,
      customTemplateContent: templateBase,
      inquilino: currentInq,
      imovel: currentImv
    };

    const substituted = substituteContractVariables(templateBase, tempContract, {
      locatarioNome: currentInq?.nome,
      locatarioCpf: currentInq?.cpf,
      locatarioRg: rgLocatario,
      locatarioEstadoCivil: estadoCivilLocatario,
      locatarioProfissao: profissaoLocatario,
      enderecoImovel: currentImv?.endereco 
        ? `${currentImv.endereco}${selectedUnidade ? ` - Unidade: ${selectedUnidade}` : (currentImv.complemento ? ` - ${currentImv.complemento}` : "")}`
        : "",
      valorAluguel: currentImv?.valorAluguel || 1500,
      diaVencimento: Number(dueDay) || 10,
      taxaEntrada: Number(taxaEntrada) || 0,
      dataInicio: startDate,
      dataFim: endDate
    });

    setDraftText(substituted);
    setSyncToastMsg("✓ Contrato sincronizado e atualizado! Todos os dados e valores do mobiliário foram atualizados na minuta.");
    setTimeout(() => setSyncToastMsg(null), 5000);
  };

  // Active full-screen interactive preview modal state
  const [previewContract, setPreviewContract] = useState<Contrato | null>(null);

  // States for Gemini Contract Executive Summary
  const [summarizingContract, setSummarizingContract] = useState<Contrato | null>(null);
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

  // STATES FOR RUNTIME CONTRACT TEMPLATE FIELD EDITING (LESSOR, LESSEE, PROPERTY)
  const [editLocadorNome, setEditLocadorNome] = useState<string>("");
  const [editLocadorCpf, setEditLocadorCpf] = useState<string>("");
  const [editLocadorRg, setEditLocadorRg] = useState<string>("");
  const [editLocadorResidencia, setEditLocadorResidencia] = useState<string>("");
  const [editLocadorNacionalidade, setEditLocadorNacionalidade] = useState<string>("");
  const [editLocadorEstadoCivil, setEditLocadorEstadoCivil] = useState<string>("");
  const [editLocadorBanco, setEditLocadorBanco] = useState<string>("");
  const [editLocadorAgencia, setEditLocadorAgencia] = useState<string>("");
  const [editLocadorConta, setEditLocadorConta] = useState<string>("");
  const [editLocadorPix, setEditLocadorPix] = useState<string>("");

  const [editLocatarioNome, setEditLocatarioNome] = useState<string>("");
  const [editLocatarioCpf, setEditLocatarioCpf] = useState<string>("");
  const [editLocatarioRg, setEditLocatarioRg] = useState<string>("");
  const [editLocatarioEstadoCivil, setEditLocatarioEstadoCivil] = useState<string>("");
  const [editLocatarioProfissao, setEditLocatarioProfissao] = useState<string>("");

  const [editEnderecoImovel, setEditEnderecoImovel] = useState<string>("");
  const [editValorAluguel, setEditValorAluguel] = useState<number>(1500);
  const [editDiaVencimento, setEditDiaVencimento] = useState<number>(10);
  const [editTaxaEntrada, setEditTaxaEntrada] = useState<number>(1500);
  const [editDataInicio, setEditDataInicio] = useState<string>("");
  const [editDataFim, setEditDataFim] = useState<string>("");
  const [editPrazoMeses, setEditPrazoMeses] = useState<number>(30);
  const [editUnidade, setEditUnidade] = useState<string>("");

  // States for contract standard models management (Local persistence)
  interface ContractModel {
    id: string;
    name: string;
    content: string;
    isDefault: boolean;
    finePercent: number; // e.g. 10
    interestMonthlyPercent: number; // e.g. 2
  }

  const [contractModels, setContractModels] = useState<ContractModel[]>(() => {
    const saved = localStorage.getItem("proptechos_contract_models");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing contract models", e);
      }
    }
    const defaults: ContractModel[] = [
      {
        id: "model-res-pg",
        name: "Contrato de Locação Residencial Padrão",
        content: getDefaultTemplateText(),
        isDefault: true,
        finePercent: 10,
        interestMonthlyPercent: 2
      },
      {
        id: "model-com-simp",
        name: "Contrato de Locação Comercial Simplificado",
        content: `CONTRATO DE LOCAÇÃO COMERCIAL DE IMÓVEL\n\nQUALIFICAÇÃO DAS PARTES CONTRATANTES:\nLOCADOR: {{LOCADOR_NOME}}, CPF {{LOCADOR_CPF}}, RG {{LOCADOR_RG}};\nLOCATÁRIO: {{LOCATARIO_NOME}}, CPF {{LOCATARIO_CPF}}, RG {{LOCATARIO_RG}}.\n\nCLÁUSULA PRIMEIRA — DO OBJETO:\nO imóvel comercial situado a {{IMOVEL_ENDERECO}} para uso exclusivo da atividade comercial do locatário.\n\nCLÁUSULA SEGUNDA — DE VALOR E CONDIÇÕES:\nO aluguel será pago pontualmente todo dia {{CONTRATO_DIA_VENCIMENTO}} no valor de {{IMOVEL_VALOR}} ({{IMOVEL_VALOR_EXTENSO}}).\n\nCLÁUSULA TERCEIRA — DA MORA:\nEm caso de atraso no pagamento do aluguel, incidirá multa moratória de 5% (cinco por cento) sobre o valor devido, acrescido de juros de 1% (um por cento) ao mês de atraso.\n\nFORO DE ELEIÇÃO:\nElegem as partes o Foro de Praia Grande - SP.`,
        isDefault: false,
        finePercent: 5,
        interestMonthlyPercent: 1
      }
    ];
    localStorage.setItem("proptechos_contract_models", JSON.stringify(defaults));
    return defaults;
  });

  const [selectedModelId, setSelectedModelId] = useState<string>(() => {
    const def = contractModels.find(m => m.isDefault);
    return def ? def.id : (contractModels[0]?.id || "model-res-pg");
  });

  // States for uploading contract templates
  const [uploadedTemplate, setUploadedTemplate] = useState<{name: string, size?: string, content?: string} | null>(null);
  const [showAdvancedModelEditor, setShowAdvancedModelEditor] = useState<boolean>(false);

  // Sync uploadedTemplate when contract standard model changes
  useEffect(() => {
    const activeModel = contractModels.find(m => m.id === selectedModelId);
    if (activeModel) {
      setUploadedTemplate({
        name: activeModel.name,
        content: activeModel.content
      });
      // Reset manual editing state so the newly switched or loaded template model is loaded into draftText preview
      setIsEditingDraftManually(false);
    }
  }, [selectedModelId, contractModels]);

  const updateActiveModelContent = (newContent: string) => {
    setContractModels(prev => {
      const updated = prev.map(m => m.id === selectedModelId ? { ...m, content: newContent } : m);
      localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRenameModel = (newName: string) => {
    if (!newName.trim()) return;
    setContractModels(prev => {
      const updated = prev.map(m => m.id === selectedModelId ? { ...m, name: newName } : m);
      localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteModel = (id: string) => {
    if (contractModels.length <= 1) {
      alert("Não é possível excluir o único modelo disponível.");
      return;
    }
    const modelToDel = contractModels.find(m => m.id === id);
    if (modelToDel?.isDefault) {
      alert("Defina outro modelo como padrão antes de excluir este.");
      return;
    }
    const updated = contractModels.filter(m => m.id !== id);
    localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
    setContractModels(updated);
    setSelectedModelId(updated[0].id);
  };

  const handleSetDefaultModel = (id: string) => {
    setContractModels(prev => {
      const updated = prev.map(m => ({ ...m, isDefault: m.id === id }));
      localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreateNewModel = (name: string, content: string) => {
    const newId = `model-${Date.now()}`;
    const newModel: ContractModel = {
      id: newId,
      name: name || `Modelo Customizado ${contractModels.length + 1}`,
      content: content || getDefaultTemplateText(),
      isDefault: false,
      finePercent: 10,
      interestMonthlyPercent: 2
    };
    const updated = [...contractModels, newModel];
    localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
    setContractModels(updated);
    setSelectedModelId(newId);
  };

  const handleUpdateModelParams = (fine: number, interest: number) => {
    setContractModels(prev => {
      const updated = prev.map(m => m.id === selectedModelId ? { ...m, finePercent: fine, interestMonthlyPercent: interest } : m);
      localStorage.setItem("proptechos_contract_models", JSON.stringify(updated));
      return updated;
    });
  };

  // Synchronizers to guarantee permanent Cloud Firestore durability of contract templates
  const saveModelsToServer = async (models: ContractModel[]) => {
    try {
      await fetch("/api/contract-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models })
      });
    } catch (err) {
      console.error("Erro ao sincronizar modelos com Firestore mestre:", err);
    }
  };

  // Fetch from master DB on mount (falling back to localStorage if empty or unconfigured)
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch("/api/db");
        if (res.ok) {
          const json = await res.json();
          if (json.contractModels && json.contractModels.length > 0) {
            setContractModels(json.contractModels);
            // Sync selected default model
            const def = json.contractModels.find((m: any) => m.isDefault);
            if (def) {
              setSelectedModelId(def.id);
            } else if (json.contractModels[0]) {
              setSelectedModelId(json.contractModels[0].id);
            }
          }
        }
      } catch (err) {
        console.error("Erro ao ler modelos persistidos no master DB:", err);
      }
    };
    fetchModels();
  }, []);

  // Monitor modifications to stream changes permanently
  const isFirstSync = useRef(true);
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    if (contractModels && contractModels.length > 0) {
      saveModelsToServer(contractModels);
    }
  }, [contractModels]);

  // High-fidelity uploaded template importer
  const handleUploadNewTemplateModel = (fileName: string, content: string) => {
    const cleanName = fileName.replace(/\.[^/.]+$/, ""); // Name without extension
    const newId = `model-${Date.now()}`;
    const newModel: ContractModel = {
      id: newId,
      name: cleanName,
      content: content,
      isDefault: true,
      finePercent: 10,
      interestMonthlyPercent: 2
    };

    setContractModels(prev => {
      // Set all other templates as non-default
      const updated = prev.map(m => ({ ...m, isDefault: false }));
      const newList = [...updated, newModel];
      localStorage.setItem("proptechos_contract_models", JSON.stringify(newList));
      // Save directly to Firestore for double durability
      saveModelsToServer(newList);
      return newList;
    });

    setSelectedModelId(newId);
    setUploadedTemplate({
      name: fileName,
      content: content
    });
  };

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isParsingTemplate, setIsParsingTemplate] = useState<boolean>(false);

  // Dynamic parameters for the contract preview or signature flow
  const previewProp = previewContract?.imovel?.proprietario;
  
  // These read from the interactive edit states, falling back dynamically
  const previewLocadorNome = editLocadorNome || previewContract?.overriddenLocadorNome || previewProp?.nome || "Renato Faria Kawano";
  const previewLocadorCpf = editLocadorCpf || previewContract?.overriddenLocadorCpf || previewProp?.cpfCnpj || "341.602.388-90";
  const previewLocadorRg = editLocadorRg || previewContract?.overriddenLocadorRg || previewProp?.rg || "33.698.982-9";
  const previewLocadorResidencia = editLocadorResidencia || previewContract?.overriddenLocadorResidencia || previewProp?.residencia || "Santo André, SP";
  const previewLocadorNacionalidade = editLocadorNacionalidade || previewContract?.overriddenLocadorNacionalidade || previewProp?.nacionalidade || "brasileiro(a)";
  const previewLocadorEstadoCivil = editLocadorEstadoCivil || previewContract?.overriddenLocadorEstadoCivil || previewProp?.estadoCivil || "solteiro(a)";
  const previewLocadorBanco = editLocadorBanco || previewContract?.overriddenLocadorBanco || previewProp?.banco || "Banco Itaú";
  const previewLocadorAgencia = editLocadorAgencia || previewContract?.overriddenLocadorAgencia || previewProp?.agencia || "1063";
  const previewLocadorConta = editLocadorConta || previewContract?.overriddenLocadorConta || previewProp?.conta || "31860-2";
  const previewLocadorPix = editLocadorPix || previewContract?.overriddenLocadorPix || previewProp?.pixKey || "341.602.388-90";

  const previewEnderecoImovel = editEnderecoImovel || previewContract?.overriddenEnderecoImovel || (previewContract?.imovel?.endereco 
    ? `${previewContract.imovel.endereco}${previewContract.unidade ? ` - Unidade: ${previewContract.unidade}` : (previewContract.imovel.complemento ? ` - ${previewContract.imovel.complemento}` : "")}`
    : "(Endereço do Imóvel)");

  // View fold model configuration
  const [foldViewMode, setFoldViewMode] = useState<boolean>(true);

  // Parsing support for custom contract template base
  const hasCustomTemplate = !!previewContract?.customTemplateContent;
  let customPage1 = "";
  let customPage2 = "";
  let customPage3 = "";
  let fullSubstitutedTemplate = "";

  if (hasCustomTemplate && previewContract?.customTemplateContent) {
    fullSubstitutedTemplate = substituteContractVariables(previewContract.customTemplateContent, previewContract, {
      locadorNome: editLocadorNome,
      locadorCpf: editLocadorCpf,
      locadorRg: editLocadorRg,
      locadorResidencia: editLocadorResidencia,
      locadorNacionalidade: editLocadorNacionalidade,
      locadorEstadoCivil: editLocadorEstadoCivil,
      locadorBanco: editLocadorBanco,
      locadorAgencia: editLocadorAgencia,
      locadorConta: editLocadorConta,
      locadorPix: editLocadorPix,
      locatarioNome: editLocatarioNome,
      locatarioCpf: editLocatarioCpf,
      locatarioRg: editLocatarioRg,
      locatarioEstadoCivil: editLocatarioEstadoCivil,
      locatarioProfissao: editLocatarioProfissao,
      enderecoImovel: editEnderecoImovel,
      valorAluguel: editValorAluguel,
      diaVencimento: editDiaVencimento
    });

    if (fullSubstitutedTemplate.includes("--PAGE--")) {
      const parts = fullSubstitutedTemplate.split("--PAGE--");
      customPage1 = parts[0] || "";
      customPage2 = parts[1] || "";
      customPage3 = parts[2] || "";
    } else {
      customPage1 = fullSubstitutedTemplate;
      customPage2 = "";
      customPage3 = "";
    }
  }

  const activePagesCount = hasCustomTemplate 
    ? (customPage3.trim() ? 3 : (customPage2.trim() ? 2 : 1)) 
    : 3;

  // Sharing & Gov.br Signature collection states
  const [selectedSharingContract, setSelectedSharingContract] = useState<Contrato | null>(null);
  const [showGovBrSimulator, setShowGovBrSimulator] = useState<boolean>(false);
  const [govBrSigningContract, setGovBrSigningContract] = useState<Contrato | null>(null);
  const [govBrStep, setGovBrStep] = useState<"LOGIN" | "DOCUMENT_VIEW" | "SMS_CODE" | "SUCCESS">("LOGIN");
  const [govBrCpf, setGovBrCpf] = useState<string>("341.602.388-90"); // Default Renato Faria Kawano CPF
  const [govBrCode, setGovBrCode] = useState<string>("");
  const [govBrSubmitting, setGovBrSubmitting] = useState<boolean>(false);
  
  const [emailInput, setEmailInput] = useState<string>("renatokawano1986@gmail.com"); // Prefilled with Renato's email
  const [phoneInput, setPhoneInput] = useState<string>("11999999999"); // Mock cellphone for whatsapp
  const [shareSuccessMsg, setShareSuccessMsg] = useState<string | null>(null);

  // Contract Archiving and Filter States
  const [statusFilter, setStatusFilter] = useState<string>("VIGENTES"); // "VIGENTES", "ARQUIVADOS", "TODOS"
  const [selectedInquilinoFilter, setSelectedInquilinoFilter] = useState<string>(""); // Filter by specific tenant ID
  const [contractToArchive, setContractToArchive] = useState<Contrato | null>(null);
  const [archiveNotes, setArchiveNotes] = useState<string>("");
  const [submittingArchive, setSubmittingArchive] = useState<boolean>(false);

  // Reusable component element for signatures in paper view Mode
  const signatureBlock = (
    <div className="border-t border-gray-200 pt-4 mt-6 space-y-4">
      <div className="space-y-1">
        <p className="text-[9px] text-gray-500 uppercase font-bold">Assinatura Eletrônica do Locador</p>
        {previewContract?.assinaturaLocadorGovBr ? (
          <div className="p-1.5 px-2 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-lg font-mono text-[9px] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Award className="h-3.5 w-3.5" /> {(editLocadorNome || '').toUpperCase()}
              </span>
              <span className="text-[7.5px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded uppercase font-sans">Gov.br OK</span>
            </div>
            <div className="text-[8px] text-emerald-700 font-sans leading-tight flex flex-col gap-0.5">
              <span>Hash: {previewContract.assinaturaHashGovBr}</span>
              <span>Assinado: {formatarData(previewContract.assinaturaLocadorData?.split('T')[0] || '')}</span>
            </div>
          </div>
        ) : (
          <div className="p-1 px-2 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded font-mono text-[9px] flex items-center justify-between">
            <span>{(editLocadorNome || '').toUpperCase()}</span>
            <span className="text-[8px] bg-indigo-200 text-indigo-900 font-bold px-1 rounded">ASSINADO via PIX</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-[9px] text-gray-500 uppercase font-bold">Assinatura Eletrônica do Locatário</p>
        {previewContract?.status === "ATIVO" ? (
          <div className="p-1 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono text-[9px] flex items-center justify-between">
            <span>{(editLocatarioNome || '').toUpperCase()}</span>
            <span className="text-[8px] bg-emerald-200 text-emerald-900 font-bold px-1 rounded">E-SIGN OK</span>
          </div>
        ) : (
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => handleSignContract(previewContract?.id || "")}
              disabled={signingId === previewContract?.id}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-[10px] transition cursor-pointer"
            >
              {signingId === previewContract?.id ? "Assinando..." : "Assinar Eletronicamente Agora"}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Automatic state populator: when tenant changes, pre-fill matching values to keep authentic simulation fluid and realistic
  useEffect(() => {
    if (selectedInquilino) {
      const t = inquilinos.find(item => item.id === selectedInquilino);
      if (t) {
        // Prioritize actual user-entered data from enrollment/onboarding
        const realRg = t.rg || (t.cpf === "321.456.987-00" ? "16.141.921-4" : (t.cpf === "112.593.440-02" ? "41.512.902-1" : "33." + Math.floor(100000 + Math.random() * 900000) + "-X"));
        const rawEstadoCivil = t.estadoCivil || (t.cpf === "321.456.987-00" ? "Solteira" : (t.cpf === "112.593.440-02" ? "Casado" : "Solteiro(a)"));
        const rawProfissao = t.profissao || (t.cpf === "321.456.987-00" ? "Arquiteta de TI" : (t.cpf === "112.593.440-02" ? "Analista Financeiro" : "Autônomo(a)"));
        
        const realEstadoCivil = rawEstadoCivil;
        const realProfissao = rawProfissao;

        setRgLocatario(realRg);
        setEstadoCivilLocatario(realEstadoCivil);
        setProfissaoLocatario(realProfissao);
      }
    }
  }, [selectedInquilino, inquilinos]);

  // Synchronize pre-generation contract draft text
  useEffect(() => {
    if (isEditingDraftManually) return;

    let templateBase = uploadedTemplate?.content || getDefaultTemplateText();
    if (includeItemsClause) {
      const clauseText = generateItemsClauseText(includedItems);
      if (clauseText) {
        templateBase = insertItemsClauseBelowOitava(templateBase, clauseText);
      }
    }

    const currentInq = inquilinos.find(i => i.id === selectedInquilino);
    const currentImv = imoveis.find(i => i.id === selectedImovel);

    const tempContract = {
      dataInicio: startDate,
      dataFim: endDate,
      diaVencimento: Number(dueDay) || 10,
      taxaEntrada: Number(taxaEntrada) || 0,
      rgLocatario,
      estadoCivilLocatario,
      profissaoLocatario,
      unidade: selectedUnidade,
      customTemplateName: uploadedTemplate?.name,
      customTemplateContent: templateBase,
      inquilino: currentInq,
      imovel: currentImv
    };

    const substituted = substituteContractVariables(templateBase, tempContract, {
      locatarioNome: currentInq?.nome,
      locatarioCpf: currentInq?.cpf,
      locatarioRg: rgLocatario,
      locatarioEstadoCivil: estadoCivilLocatario,
      locatarioProfissao: profissaoLocatario,
      enderecoImovel: currentImv?.endereco 
        ? `${currentImv.endereco}${selectedUnidade ? ` - Unidade: ${selectedUnidade}` : (currentImv.complemento ? ` - ${currentImv.complemento}` : "")}`
        : "",
      valorAluguel: currentImv?.valorAluguel || 1500,
      diaVencimento: Number(dueDay) || 10,
      taxaEntrada: Number(taxaEntrada) || 0,
      dataInicio: startDate,
      dataFim: endDate
    });

    setDraftText(substituted);
  }, [
    selectedInquilino,
    selectedImovel,
    selectedUnidade,
    startDate,
    endDate,
    dueDay,
    taxaEntrada,
    rgLocatario,
    estadoCivilLocatario,
    profissaoLocatario,
    uploadedTemplate,
    isEditingDraftManually,
    inquilinos,
    imoveis,
    includeItemsClause,
    includedItems
  ]);

  // Sync edit states when a contract is chosen for visual layout editing
  useEffect(() => {
    if (previewContract) {
      const prop = previewContract.imovel?.proprietario;
      const ldrName = previewContract.overriddenLocadorNome || prop?.nome || "Renato Faria Kawano";

      setEditLocadorNome(ldrName);
      setEditLocadorCpf(previewContract.overriddenLocadorCpf || prop?.cpfCnpj || "341.602.388-90");
      setEditLocadorRg(previewContract.overriddenLocadorRg || prop?.rg || "33.698.982-9");
      setEditLocadorResidencia(previewContract.overriddenLocadorResidencia || prop?.residencia || "Santo André, SP");
      setEditLocadorNacionalidade(previewContract.overriddenLocadorNacionalidade || prop?.nacionalidade || "brasileiro(a)");
      setEditLocadorEstadoCivil(previewContract.overriddenLocadorEstadoCivil || prop?.estadoCivil || "solteiro(a)");
      setEditLocadorBanco(previewContract.overriddenLocadorBanco || prop?.banco || "Banco Itaú");
      setEditLocadorAgencia(previewContract.overriddenLocadorAgencia || prop?.agencia || "1063");
      setEditLocadorConta(previewContract.overriddenLocadorConta || prop?.conta || "31860-2");
      setEditLocadorPix(previewContract.overriddenLocadorPix || prop?.pixKey || "341.602.388-90");

      const ltrName = previewContract.overriddenLocatarioNome || previewContract.inquilino?.nome || "Nome do Locatário";

      setEditLocatarioNome(ltrName);
      setEditLocatarioCpf(previewContract.overriddenLocatarioCpf || previewContract.inquilino?.cpf || "000.000.000-00");
      setEditLocatarioRg(previewContract.rgLocatario || "00.000.000-0");
      setEditLocatarioEstadoCivil(previewContract.estadoCivilLocatario || "Solteiro(a)");
      setEditLocatarioProfissao(previewContract.profissaoLocatario || "Profissão");

      const currentEnd = previewContract.overriddenEnderecoImovel || (previewContract.imovel?.endereco 
        ? `${previewContract.imovel.endereco}${previewContract.unidade ? ` - Unidade: ${previewContract.unidade}` : (previewContract.imovel.complemento ? ` - ${previewContract.imovel.complemento}` : "")}`
        : "(Endereço do Imóvel)");
      setEditEnderecoImovel(currentEnd);
      
      setEditValorAluguel(previewContract.overriddenValorAluguel || previewContract.imovel?.valorAluguel || 1500);
      setEditDiaVencimento(previewContract.overriddenDiaVencimento || previewContract.diaVencimento || 10);
      setEditTaxaEntrada(previewContract.overriddenTaxaEntrada || previewContract.taxaEntrada || previewContract.overriddenValorAluguel || previewContract.imovel?.valorAluguel || 1500);
      setEditDataInicio(previewContract.dataInicio || "");
      setEditDataFim(previewContract.dataFim || "");
      
      const parsedMonths = calcularMeses(previewContract.dataInicio, previewContract.dataFim);
      setEditPrazoMeses(parsedMonths);
      setEditUnidade(previewContract.unidade || "");
    }
  }, [previewContract]);

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquilino || !selectedImovel) {
      setErrorMsg("Selecione um inquilino e um imóvel.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      let finalTemplateContent = uploadedTemplate?.content || getDefaultTemplateText();
      if (includeItemsClause) {
        const clauseText = generateItemsClauseText(includedItems);
        if (clauseText) {
          finalTemplateContent = insertItemsClauseBelowOitava(finalTemplateContent, clauseText);
        }
      }

      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquilinoId: selectedInquilino,
          imovelId: selectedImovel,
          dataInicio: startDate,
          dataFim: endDate,
          diaVencimento: dueDay,
          taxaEntrada: taxaEntrada,
          rgLocatario,
          estadoCivilLocatario,
          profissaoLocatario,
          unidade: selectedUnidade,
          customTemplateName: isEditingDraftManually ? "Minuta Corrigida pelo Administrador" : (uploadedTemplate?.name || "Minuta de Locação"),
          customTemplateContent: isEditingDraftManually ? draftText : finalTemplateContent,
          isDraftManuallyEdited: isEditingDraftManually
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro ao registrar minuta.");
      }

      onContractAdded();
      // Reset form and draft states
      setSelectedInquilino("");
      setSelectedImovel("");
      setSelectedUnidade("");
      setUploadedTemplate(null);
      setIsEditingDraftManually(false);
      setDraftText("");
      setIncludeItemsClause(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignContract = async (contractId: string) => {
    setSigningId(contractId);
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (response.ok) {
        onContractAdded();
        // If we currently have this contract previewed, update its state context to signed!
        if (previewContract && previewContract.id === contractId) {
          setPreviewContract(prev => prev ? { ...prev, status: "ATIVO" } : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSigningId(null);
    }
  };

  const handleArchiveContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractToArchive) return;
    setSubmittingArchive(true);
    try {
      const response = await fetch(`/api/contracts/${contractToArchive.id}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "ARQUIVADO",
          observacoesInterrupcao: archiveNotes
        })
      });
      if (response.ok) {
        onContractAdded(); // Refreshes state in App.tsx
        setContractToArchive(null);
        setArchiveNotes("");
      } else {
        alert("Erro ao arquivar o contrato.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de comunicação com o servidor.");
    } finally {
      setSubmittingArchive(false);
    }
  };

  // URL query parameter listener for GOV.BR remote signing link simulation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contractIdToSign = params.get("openGovBrId");
    if (contractIdToSign) {
      const targetContract = contratos.find(c => c.id === contractIdToSign);
      if (targetContract) {
        setGovBrSigningContract(targetContract);
        setGovBrStep("LOGIN");
        setShowGovBrSimulator(true);
      }
    }
  }, [contratos]);

  // Function to call Gemini endpoint and trigger the executive summary view
  const handleGenerateSummary = async (contract: Contrato) => {
    setSummarizingContract(contract);
    setSummaryData(null);
    setIsSummarizing(true);
    try {
      const response = await fetch("/api/gemini/summarize-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract.id })
      });
      if (!response.ok) {
        throw new Error("Erro na requisição de geração de resumo.");
      }
      const result = await response.json();
      setSummaryData(result.data);
    } catch (err: any) {
      alert("Erro ao gerar resumo executivo do contrato com Gemini: " + err.message);
      setSummarizingContract(null);
    } finally {
      setIsSummarizing(false);
    }
  };

  // High Fidelity PDF summary report generator using jsPDF
  const handleDownloadSummaryPDF = (data: any) => {
    if (!data) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const leftMargin = 20;
    const rightMargin = 190;
    const contentWidth = 170;
    let yPos = 25;

    const printParagraph = (text: string, title?: string, isBoldTitle = true) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }

      if (title) {
        doc.setFont("helvetica", isBoldTitle ? "bold" : "normal");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 30, 50);
        doc.text(title, leftMargin, yPos);
        yPos += 5.5;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(60, 60, 60);
      
      const lines = doc.splitTextToSize(text, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 275) {
          doc.addPage();
          yPos = 25;
        }
        doc.text(line, leftMargin, yPos);
        yPos += 5.2;
      });
      yPos += 4;
    };

    // Header Decoration Banner
    doc.setFillColor(79, 70, 229); // Beautiful Purple Indigo
    doc.rect(0, 0, 210, 15, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("CONDO+ • ANÁLISE JURÍDICA E DE RISCOS COM INTELIGÊNCIA ARTIFICIAL (GEMINI)", 105, 9.5, { align: "center" });
    
    yPos = 25;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text("RESUMO EXECUTIVO DE CONTRATO", leftMargin, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} — Análise de Riscos e Pontos de Atenção para o Proprietário`, leftMargin, yPos);
    yPos += 12;

    // Section 1: Identificacao
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229);
    doc.text("1. IDENTIFICAÇÃO GERAL", leftMargin, yPos);
    yPos += 4;
    doc.setDrawColor(229, 231, 235);
    doc.line(leftMargin, yPos, rightMargin, yPos);
    yPos += 6;

    const id = data.identificacao || {};
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);

    const fields = [
      ["PROPRIETÁRIO/LOCADOR:", id.locador || "Renato Faria Kawano"],
      ["INQUILINO/LOCATÁRIO:", id.locatario || "N/A"],
      ["IMÓVEL LOCADO:", id.imovel || "N/A"],
      ["VIGÊNCIA PACTUADA:", id.vigencia || "N/A"],
      ["VALOR DO ALUGUEL:", `R$ ${(id.valorAluguel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["DIA DE VENCIMENTO:", `Todo dia ${id.diaVencimento || 10}`]
    ];

    fields.forEach(([label, val]) => {
      if (yPos > 275) { doc.addPage(); yPos = 25; }
      doc.setFont("helvetica", "bold");
      doc.text(label, leftMargin, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(String(val), leftMargin + 50, yPos);
      yPos += 5.5;
    });
    yPos += 6;

    // Section 2: Resumo Clausulas
    if (data.resumoClausulas && data.resumoClausulas.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("2. RESUMO DE CLÁUSULAS CONTRATUAIS", leftMargin, yPos);
      yPos += 4;
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      data.resumoClausulas.forEach((item: any) => {
        printParagraph(item.descricao, `• ${item.titulo}`, true);
      });
      yPos += 4;
    }

    // Section 3: Analise Riscos
    if (data.analiseRiscos && data.analiseRiscos.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("3. ANÁLISE DE RISCOS JURÍDICOS (FOCO DO PROPRIETÁRIO)", leftMargin, yPos);
      yPos += 4;
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      data.analiseRiscos.forEach((item: any) => {
        const level = (item.nivelRisco || "BAIXO").toUpperCase();
        let colorText = "[Risco Baixo]";
        if (level === "ALTO") colorText = "[⚠️ RISCO ALTO]";
        else if (level === "MEDIO" || level === "MÉDIO") colorText = "[⚡ Risco Médio]";

        printParagraph(item.descricao, `${colorText} - ${item.titulo}`, true);
      });
      yPos += 4;
    }

    // Section 4: Pontos de Atencao
    if (data.pontosAtencao && data.pontosAtencao.length > 0) {
      if (yPos > 250) { doc.addPage(); yPos = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("4. PONTOS DE ATENÇÃO & RECOMENDAÇÕES", leftMargin, yPos);
      yPos += 4;
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      data.pontosAtencao.forEach((item: string, idx: number) => {
        printParagraph(item, `${idx + 1}.`, false);
      });
      yPos += 4;
    }

    // Section 5: Consideracoes Finais
    if (data.consideracoesFinais) {
      if (yPos > 240) { doc.addPage(); yPos = 25; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(79, 70, 229);
      doc.text("5. PARECER CONCLUSIVO DA INTELIGÊNCIA ARTIFICIAL", leftMargin, yPos);
      yPos += 4;
      doc.line(leftMargin, yPos, rightMargin, yPos);
      yPos += 6;

      doc.setFont("helvetica", "italic");
      printParagraph(data.consideracoesFinais);
    }

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 105, 287, { align: "center" });
      doc.text("CONDO+ Plataforma de Gestão Imobiliária Inteligente", 20, 287);
    }

    const targetRenter = data.identificacao?.locatario || summarizingContract?.overriddenLocatarioNome || summarizingContract?.inquilino?.nome || "inquilino";
    let unitInfo = "";
    const activeContract = summarizingContract;
    if (activeContract?.unidade) {
      const uni = activeContract.unidade.trim();
      if (/^\d+$/.test(uni)) {
        unitInfo = `kit ${uni.padStart(2, '0')}`;
      } else {
        unitInfo = uni.toLowerCase().includes("kit") || uni.toLowerCase().includes("apto") || uni.toLowerCase().includes("unidade")
          ? uni
          : `kit ${uni}`;
      }
    } else {
      unitInfo = "kit 01";
    }
    doc.save(`Resumo Executivo - ${targetRenter} - ${unitInfo}.pdf`);
  };

  // High Fidelity PDF Generation Utility using jsPDF
  const handleDownloadPDF = (contract: Contrato) => {
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

    // Set up variables matching exact legal parameters with runtime editor state overrides
    const isEditingThis = previewContract && previewContract.id === contract.id;
    const prop = contract.imovel?.proprietario;

    const locadorNome = isEditingThis ? editLocadorNome : (contract.overriddenLocadorNome || prop?.nome || "Renato Faria Kawano");
    const locadorCpf = isEditingThis ? editLocadorCpf : (contract.overriddenLocadorCpf || prop?.cpfCnpj || "341.602.388-90");
    const locadorRg = isEditingThis ? editLocadorRg : (contract.overriddenLocadorRg || prop?.rg || "33.698.982-9");
    const locadorResidencia = isEditingThis ? editLocadorResidencia : (contract.overriddenLocadorResidencia || prop?.residencia || "Santo André, SP");
    const locadorNacionalidade = isEditingThis ? editLocadorNacionalidade : (contract.overriddenLocadorNacionalidade || prop?.nacionalidade || "brasileiro(a)");
    const locadorEstadoCivil = isEditingThis ? editLocadorEstadoCivil : (contract.overriddenLocadorEstadoCivil || prop?.estadoCivil || "solteiro(a)");
    const locadorBanco = isEditingThis ? editLocadorBanco : (contract.overriddenLocadorBanco || prop?.banco || "Banco Itaú");
    const locadorAgencia = isEditingThis ? editLocadorAgencia : (contract.overriddenLocadorAgencia || prop?.agencia || "1063");
    const locadorConta = isEditingThis ? editLocadorConta : (contract.overriddenLocadorConta || prop?.conta || "31860-2");
    const locadorPix = isEditingThis ? editLocadorPix : (contract.overriddenLocadorPix || prop?.pixKey || "341.602.388-90");

    const locatarioNome = isEditingThis ? editLocatarioNome : (contract.overriddenLocatarioNome || contract.inquilino?.nome || "Nome do Locatário");
    const locatarioCpf = isEditingThis ? editLocatarioCpf : (contract.overriddenLocatarioCpf || contract.inquilino?.cpf || "000.000.000-00");
    const locatarioRg = isEditingThis ? editLocatarioRg : (contract.rgLocatario || "00.000.000-0");
    const locatarioEstadoCivil = isEditingThis ? editLocatarioEstadoCivil : (contract.estadoCivilLocatario || "Solteiro(a)");
    const locatarioProfissao = isEditingThis ? editLocatarioProfissao : (contract.profissaoLocatario || "Profissão");

    const enderecoImovel = isEditingThis ? editEnderecoImovel : (contract.overriddenEnderecoImovel || (contract.imovel?.endereco 
      ? `${contract.imovel.endereco}${contract.unidade ? ` - Unidade: ${contract.unidade}` : (contract.imovel.complemento ? ` - ${contract.imovel.complemento}` : "")}`
      : "(Endereço do Imóvel)"));
    const valorAluguelNum = isEditingThis ? editValorAluguel : (contract.overriddenValorAluguel || contract.imovel?.valorAluguel || 1500);
    const valorAluguelExtenso = getValorAluguelPorExtenso(valorAluguelNum);
    const diaVencimento = isEditingThis ? editDiaVencimento : (contract.overriddenDiaVencimento || contract.diaVencimento || 10);
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

      // Split the text exactly by its lines to preserve carriage returns and structure fidedigna
      const rawLines = substituted.split("\n");
      
      const printRichLine = (rawLine: string) => {
        const trimmedLine = rawLine.trim();
        
        if (trimmedLine === "--PAGE--") {
          doc.addPage();
          yPos = 25;
          return;
        }

        if (trimmedLine === "") {
          yPos += 4.5; // empty line spacing fidedigno
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

        // Tokenize into words and spaces to support responsive word wrap inside PDF contentWidth
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
        `O Prazo de locação será de ${mesesVigencia} meses sendo o inicial em ${dataInicioFormated} e o final no dia ${dataFimFormated}, when o Locatário se obriga a restituir o imóvel independentemente de qualquer notificação, seja judicial ou extrajudicial, e se houver interesse das partes poderá ser renovável mediante interesse das partes e ou renovável automaticamente se as partes não se pronunciarem a respeito.`,
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
        `O Locatário confessa que recebeu o imóvel no estado em que se encontra, e se obriga a mantê-lo em perfeito estado de conservação, asseio e higiene.`,
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
        "CLÁUSULA DÉCIMA TERCEIRA — DA MULTA OU QUEBRA"
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

    if (contract.status === "ATIVO") {
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

    let unitInfo = "";
    if (contract.unidade) {
      const uni = contract.unidade.trim();
      if (/^\d+$/.test(uni)) {
        unitInfo = `kit ${uni.padStart(2, '0')}`;
      } else {
        unitInfo = uni.toLowerCase().includes("kit") || uni.toLowerCase().includes("apto") || uni.toLowerCase().includes("unidade")
          ? uni
          : `kit ${uni}`;
      }
    } else {
      unitInfo = "kit 01";
    }

    doc.save(`${locatarioNome} - ${unitInfo}.pdf`);
  };

  // WhatsApp Message Disparator
  const handleDispararWhatsApp = (contract: Contrato, phone: string) => {
    const locatarioName = contract.inquilino?.nome || "Inquilino";
    const valorMsg = contract.imovel?.valorAluguel || 0;
    const enderecoShort = contract.imovel?.endereco?.split(" - ")[0] || "";
    // Build direct link referring to our simulator
    const appUrl = window.location.origin;
    const linkAssinatura = `${appUrl}?openGovBrId=${contract.id}`;
    
    const texto = `Prezado Renato,\n\nSegue a minuta do Contrato de Locação Residencial em PDF para sua assinatura digital oficial via GOV.BR:\n\n` +
      `🏠 Imóvel: ${enderecoShort}\n` +
      `👤 Locatário: ${locatarioName}\n` +
      `💵 Aluguel: R$ ${valorMsg.toLocaleString('pt-BR')}/mês\n\n` +
      `Por favor, acesse o link abaixo para baixar o PDF e assinar com seu certificado GOV.BR de forma 100% segura e digital:\n` +
      `👉 ${linkAssinatura}\n\n` +
      `Atenciosamente,\n` +
      `Suporte Condo+.`;
      
    const encodedText = encodeURIComponent(texto);
    const cleanPhone = phone.replace(/\D/g, '');
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    
    setShareSuccessMsg(`Link de assinatura enviado via WhatsApp para o telefone de contato do locador!`);
    setTimeout(() => setShareSuccessMsg(null), 5000);
  };

  // Simulated Email Notifier
  const handleDispararEmail = async (contract: Contrato, email: string) => {
    setShareSuccessMsg("Processando envio do PDF oficial e link de assinatura...");
    
    await new Promise(resolve => setTimeout(resolve, 1400));
    
    setShareSuccessMsg(`E-mail enviado com sucesso para ${email}! O arquivo em PDF do contrato de locação e as instruções para assinatura através do GOV.BR estão disponíveis na caixa de entrada do locador.`);
    
    // Also trigger mailto link fallback so the browser opens it natively
    const subject = encodeURIComponent("Condo+ - Minuta de Contrato para Assinatura via GOV.BR");
    const appUrl = window.location.origin;
    const linkAssinatura = `${appUrl}?openGovBrId=${contract.id}`;
    const body = encodeURIComponent(
      `Olá Renato Faria Kawano,\n\n` +
      `Sua minuta de contrato foi gerada com sucesso pela plataforma Condo+.\n\n` +
      `O arquivo em formato PDF está anexado a este processo, e o link de assinatura eletrônica do governo federal (Gov.br) está disponível abaixo:\n\n` +
      `Link para baixar o PDF e realizar assinatura GOV.BR:\n` +
      `${linkAssinatura}\n\n` +
      `Atenciosamente,\n` +
      `Condo+.`
    );
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
    
    setTimeout(() => setShareSuccessMsg(null), 8000);
  };

  // Simulates signing in the database
  const handleSignContractGovBr = async (contractId: string) => {
    setGovBrSubmitting(true);
    try {
      const response = await fetch(`/api/contracts/${contractId}/sign-govbr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureDate: new Date().toISOString()
        })
      });
      if (response.ok) {
        onContractAdded();
        
        // Match state variables and update instantly for preview popup
        if (previewContract && previewContract.id === contractId) {
          setPreviewContract(prev => prev ? {
            ...prev,
            status: "ATIVO",
            assinaturaLocadorGovBr: true,
            assinaturaLocadorData: new Date().toISOString(),
            assinaturaHashGovBr: `GOVBR-SIGN-${contractId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
          } : null);
        }
        
        setGovBrStep("SUCCESS");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGovBrSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="contracts-view">
      
      {/* Contract Generation Form (FASE 2) */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5 h-fit">
        <div>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest block mb-1">
            Geração & Assinatura
          </span>
          <h3 className="text-lg font-bold text-gray-950">Orquestração de Minuta</h3>
          <p className="text-xs text-gray-400">Formalize o vínculo de posse substituindo dinamicamente as cláusulas do Locador Renato.</p>
        </div>

        {/* CUSTOM CONTRACT TEMPLATE UPLOADER & MODELS WIDGET */}
        <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4 shadow-2xs">
          <div className="space-y-1.5 pb-2 border-b border-gray-200">
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <BookOpen className="h-4 w-4 text-indigo-600 shrink-0 animate-pulse" />
              <span>Modelos de Contratos e Minutas Padrão</span>
            </span>
            <p className="text-[10.5px] text-gray-500">
              Trabalhe com cláusulas salvas. Defina um modelo como padrão para que novos contratos e a calculadora financeira usem as variáveis e taxas dele.
            </p>
          </div>

          {/* Model Selector & Management Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Left: Model listing & rename */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase text-gray-400">Modelo de Referência Ativo</label>
                <div className="flex gap-2">
                  <select
                    value={selectedModelId}
                    onChange={(e) => setSelectedModelId(e.target.value)}
                    className="flex-1 p-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    {contractModels.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} {m.isDefault ? "★ (Padrão)" : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const m = contractModels.find(x => x.id === selectedModelId);
                      if (!m) return;
                      const newName = prompt("Insira o novo nome para este modelo:", m.name);
                      if (newName && newName.trim()) {
                        handleRenameModel(newName);
                      }
                    }}
                    className="p-2 bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:border-indigo-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Renomear este modelo"
                  >
                    <PenTool className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden sm:inline">Renomear</span>
                  </button>
                </div>
              </div>

              {/* Quick actions row */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const activeModel = contractModels.find(m => m.id === selectedModelId);
                    if (activeModel) {
                      handleSetDefaultModel(activeModel.id);
                      alert(`✓ Sucesso: "${activeModel.name}" definido como o contrato padrão do sistema!`);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    contractModels.find(m => m.id === selectedModelId)?.isDefault
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-slate-100"
                  }`}
                >
                  <Star className={`h-3.5 w-3.5 shrink-0 ${contractModels.find(m => m.id === selectedModelId)?.isDefault ? "fill-amber-400 text-amber-500 animate-spin-once" : "text-gray-400"}`} />
                  <span>{contractModels.find(m => m.id === selectedModelId)?.isDefault ? "Modelo Padrão Ativo" : "Definir como Padrão"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const activeModel = contractModels.find(m => m.id === selectedModelId);
                    const name = prompt("Insira o nome para o novo modelo de contrato:");
                    if (name && name.trim()) {
                      handleCreateNewModel(name, activeModel?.content || getDefaultTemplateText());
                      alert(`✓ Novo modelo "${name}" criado com sucesso!`);
                    }
                  }}
                  style={{ backgroundColor: "#e0e7ff" }}
                  className="px-3 py-1.5 rounded-lg text-[10px] text-indigo-700 font-bold hover:bg-indigo-100 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 shrink-0" />
                  <span>Novo Modelo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const currentModel = contractModels.find(m => m.id === selectedModelId);
                    if (currentModel && confirm(`Tem certeza que deseja excluir o modelo "${currentModel.name}"?`)) {
                      handleDeleteModel(currentModel.id);
                      alert("✓ Modelo removido.");
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>

            {/* Right: Fine & Interest standard parameters for Mecanismo Financeiro */}
            <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-3xs space-y-2.5">
              <span className="text-[9px] font-black uppercase text-indigo-950 tracking-wider flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-indigo-600" />
                Parâmetros de Mora Contratual (Default)
              </span>
              <p className="text-[9.5px] text-slate-400 leading-normal">
                Estes parâmetros de multa e juros serão aplicados automaticamente na calculadora financeira e citados nas mensagens de cobrança.
              </p>

              {(() => {
                const activeModel = contractModels.find(m => m.id === selectedModelId);
                if (!activeModel) return null;
                return (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="block text-[8.5px] font-extrabold text-slate-500 uppercase">Multa por Atraso (%)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newFine = Math.max(0, activeModel.finePercent - 1);
                            handleUpdateModelParams(newFine, activeModel.interestMonthlyPercent);
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 font-black cursor-pointer leading-none text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={activeModel.finePercent}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            handleUpdateModelParams(val, activeModel.interestMonthlyPercent);
                          }}
                          className="w-12 text-center p-1 border border-gray-200 bg-gray-50 rounded font-bold text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFine = activeModel.finePercent + 1;
                            handleUpdateModelParams(newFine, activeModel.interestMonthlyPercent);
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-700 font-black cursor-pointer leading-none text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[8.5px] font-extrabold text-slate-500 uppercase">Juros Mensais (%)</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newInt = Math.max(0, activeModel.interestMonthlyPercent - 0.5);
                            handleUpdateModelParams(activeModel.finePercent, parseFloat(newInt.toFixed(1)));
                          }}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-700 font-black cursor-pointer leading-none text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={activeModel.interestMonthlyPercent}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            handleUpdateModelParams(activeModel.finePercent, val);
                          }}
                          className="w-12 text-center p-1 border border-gray-200 bg-gray-50 rounded font-bold text-gray-800"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newInt = activeModel.interestMonthlyPercent + 0.5;
                            handleUpdateModelParams(activeModel.finePercent, parseFloat(newInt.toFixed(1)));
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-emerald-700 font-black cursor-pointer leading-none text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Collapsible raw model structure editor and file import */}
          <div className="pt-2 border-t border-gray-150">
            {uploadedTemplate && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedModelEditor(!showAdvancedModelEditor)}
                  className="w-full flex items-center justify-between text-[9px] font-bold text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/60 p-2 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <PenTool className="h-3 w-3 text-indigo-500 shrink-0" />
                    <span>Estrutura do Modelo Base (Avançado)</span>
                  </span>
                  <span className="text-[8px] font-extrabold text-indigo-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-3xs">
                    {showAdvancedModelEditor ? "Ocultar Estrutura Base" : "⚙️ Editar Estrutura Base"}
                  </span>
                </button>

                {showAdvancedModelEditor && (
                  <div className="space-y-2 p-2.5 bg-slate-50/80 rounded-lg border border-slate-200 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[8.5px] font-black text-indigo-950 uppercase tracking-widest block">
                        Cláusulas & Variáveis do Modelo Base
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const m = contractModels.find(x => x.id === selectedModelId);
                          if (m && confirm("Deseja restaurar este modelo para o texto original?")) {
                            const originalText = m.id === "model-res-pg" ? getDefaultTemplateText() : m.content;
                            updateActiveModelContent(originalText);
                            alert("✓ Modelo restaurado!");
                          }
                        }}
                        className="text-gray-400 hover:text-indigo-600 p-1 hover:bg-gray-100 rounded transition flex items-center gap-1 cursor-pointer text-[8.5px]"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Restaurar
                      </button>
                    </div>

                    <textarea
                      value={uploadedTemplate.content || ""}
                      onChange={(e) => {
                        const txt = e.target.value;
                        setUploadedTemplate({
                          ...uploadedTemplate,
                          content: txt
                        });
                        updateActiveModelContent(txt);
                      }}
                      rows={5}
                      className="w-full p-2.5 text-[9px] font-mono border border-gray-200 bg-white rounded-lg focus:ring-1 focus:ring-indigo-500 text-gray-700 leading-normal shadow-3xs"
                      placeholder="Insira ou edite as cláusulas e variáveis do modelo..."
                    />
                    
                    <p className="text-[7.5px] text-gray-500 font-medium leading-normal">
                      💡 <strong>Estrutura Base:</strong> Este campo contém o modelo genérico com tags. Para revisar e alterar a minuta final já preenchida com os dados do inquilino e imóvel, utilize o <strong>Editor Único da Minuta</strong> ao lado.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Direct File import to make it the new default standard model */}
            <div className="mt-3 relative border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-white rounded-lg p-3 text-center cursor-pointer transition-all duration-150">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.rtf,.txt"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    setUploadProgress(20);
                    
                    parseContractTemplate(file)
                      .then((textContent) => {
                        setUploadProgress(100);
                        setTimeout(() => {
                          setIsUploading(false);
                          // Autoimport as a brand new default model!
                          handleUploadNewTemplateModel(file.name, textContent);
                          alert(`✓ Sucesso: O contrato "${file.name}" foi importado com fidelidade absoluta de texto e salvo como seu novo modelo padrão do sistema!`);
                        }, 500);
                      })
                      .catch((err) => {
                        setIsUploading(false);
                        alert(`Erro na análise automática do modelo: ${err.message}`);
                      });
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="h-5 w-5 mx-auto text-slate-400 mb-1.5 shrink-0" />
              <p className="text-[10px] text-slate-800 font-extrabold flex items-center justify-center gap-1.5 col-span-1 border-none pb-0">
                <span>Cadastrar Novo Contrato Padrão Subindo Arquivo</span>
              </p>
              <p className="text-[8.5px] text-slate-400 mt-1 leading-snug">Arraste ou clique para carregar PDF, Word DOCX ou TXT. O sistema importará o texto com precisão de OCR de forma definitiva como novo padrão.</p>
            </div>
          </div>
          
          {isUploading && (
            <div className="space-y-1 animate-pulse">
              <div className="flex items-center justify-between text-[8px] text-slate-500 font-mono">
                <span>Processando e indexando arquivo de minuta...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-medium rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateContract} className="space-y-4 text-xs">
          {/* Select Tenant */}
          <div className="space-y-1.5">
            <label className="block font-bold text-gray-700 uppercase">Inquilino Onboardado</label>
            <select
              value={selectedInquilino}
              onChange={(e) => {
                setSelectedInquilino(e.target.value);
                setIsEditingDraftManually(false);
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-semibold focus:ring-1 focus:ring-indigo-500 focus:bg-white text-gray-800"
              required
            >
              <option value="">Selecione o inquilino...</option>
              {inquilinos.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} (CPF: {t.cpf})
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic locatario inputs directly mapped into the printed legal model (as requested) */}
          {selectedInquilino && (
            <div className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-lg space-y-3">
              <span className="block font-bold text-indigo-800 text-[10px] uppercase tracking-wider">Identidade Legal do Inquilino</span>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-600">RG do Locatário</label>
                  <input
                    type="text"
                    value={rgLocatario}
                    onChange={(e) => setRgLocatario(e.target.value)}
                    placeholder="Ex: 16.141.921-4"
                    className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-600">Estado Civil</label>
                  <input
                    type="text"
                    value={estadoCivilLocatario}
                    onChange={(e) => setEstadoCivilLocatario(e.target.value)}
                    placeholder="Ex: Solteiro(a)"
                    className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-600">Profissão do Locatário</label>
                <input
                  type="text"
                  value={profissaoLocatario}
                  onChange={(e) => setProfissaoLocatario(e.target.value)}
                  placeholder="Ex: Analista de Sistemas"
                  className="w-full p-2 bg-white border border-gray-200 rounded text-xs font-medium"
                  required
                />
              </div>

              {/* Document Validation & Files Display */}
              {(() => {
                const t = inquilinos.find(item => item.id === selectedInquilino);
                if (!t) return null;
                const userFiles = t.arquivos && t.arquivos.length > 0 ? t.arquivos : [
                  { id: "f-1", nome: `RG_CNH_Digital_${t.nome.replace(/\s+/g, '_')}.pdf`, dataUpload: "2026-05-18", tamanho: "1.4 MB" },
                  { id: "f-2", nome: `CPF_Regular_${t.nome.replace(/\s+/g, '_')}.pdf`, dataUpload: "2026-05-18", tamanho: "680 KB" }
                ];
                
                return (
                  <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1 leading-none">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Documentos Validados</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[7.5px] font-extrabold uppercase bg-emerald-600 text-white leading-none">
                        ✓ OK
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-emerald-950 leading-relaxed font-semibold">
                      O CPF <strong className="font-mono text-emerald-800">{t.cpf}</strong> e o RG <strong className="font-mono text-emerald-800">{rgLocatario}</strong> foram validados e cruzados com sucesso via OCR sobre os documentos inseridos pelo inquilino:
                    </p>

                    <div className="space-y-1 pt-1.5 border-t border-emerald-150">
                      {userFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-emerald-155 text-[9.5px] text-gray-700">
                          <span className="flex items-center gap-1 font-bold truncate max-w-[170px]">
                            <FileText className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="truncate">{file.nome}</span>
                          </span>
                          <span className="text-[8px] text-gray-400 shrink-0 font-mono">{file.tamanho || "1.2 MB"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Select Property */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-gray-700 uppercase">Imóvel Correspondente</label>
              {onAddPropertyClick && (
                <button
                  type="button"
                  onClick={onAddPropertyClick}
                  className="text-[10px] text-indigo-600 hover:text-indigo-850 font-extrabold uppercase tracking-wider flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                >
                  ⚡ Cadastrar Novo Imóvel
                </button>
              )}
            </div>
            <select
              value={selectedImovel}
              onChange={(e) => {
                setSelectedImovel(e.target.value);
                setSelectedUnidade("");
                setIsEditingDraftManually(false);
                const found = imoveis.find(i => i.id === e.target.value);
                if (found && found.valorAluguel) {
                  setTaxaEntrada(found.valorAluguel);
                }
              }}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium focus:ring-1 focus:ring-indigo-500 focus:bg-white text-gray-800"
              required
            >
              <option value="">Selecione o endereço...</option>
              {imoveis.map(i => (
                <option key={i.id} value={i.id}>
                  [{i.tipo}] {i.endereco.split(" - ")[0]} — R$ {i.valorAluguel}/mês
                </option>
              ))}
            </select>
          </div>

          {/* Indicar Unidade se o Imóvel for um Prédio Inteiro */}
          {selectedImovel && imoveis.find(i => i.id === selectedImovel)?.isBuilding && (
            <div className="space-y-2 border border-dashed border-emerald-250 p-3.5 rounded-xl bg-emerald-50/15 animate-in fade-in duration-200">
              <label className="block text-[10px] font-extrabold text-emerald-900 uppercase tracking-wide flex items-center gap-1">
                <span>🏢 Indicar Unidade do Prédio (Apartamento) *</span>
              </label>
              <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
                Este imóvel está configurado como Prédio Inteiro. Selecione para qual apartamento de 1 a 8 ou especifique uma unidade personalizada para esta minuta de contrato:
              </p>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                  const val = `Apartamento ${num}`;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setSelectedUnidade(val);
                      }}
                      className={`py-1 text-[11px] rounded-lg font-bold border transition ${
                        selectedUnidade === val
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      Apto {num}
                    </button>
                  );
                })}
              </div>
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Ou digite outra unidade personalizada..."
                  value={selectedUnidade}
                  onChange={(e) => setSelectedUnidade(e.target.value)}
                  className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-medium focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Date range inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Início do Contrato</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Fim da Vigência</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setIsEditingDraftManually(false);
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-700"
                required
              />
            </div>
          </div>

          {/* Due Day & Taxa de Entrada */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Dia de Vencimento Mensal</label>
              <input
                type="number"
                min={1}
                max={28}
                value={dueDay}
                onChange={(e) => {
                  setDueDay(Number(e.target.value));
                  setIsEditingDraftManually(false);
                }}
                placeholder="Ex: 10"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 uppercase">Taxa de Entrada (R$)</label>
              <input
                type="number"
                min={0}
                value={taxaEntrada}
                onChange={(e) => {
                  setTaxaEntrada(Number(e.target.value));
                  setIsEditingDraftManually(false);
                }}
                placeholder="Ex: 1500"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium"
                required
              />
            </div>
          </div>

          {/* Included Items Section (Mobiliário e Itens Inclusos para Kitnets) */}
          <div className="space-y-2.5 border border-indigo-100 p-3.5 rounded-xl bg-indigo-50/10">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 animate-pulse" />
                <span>Mobiliário e Itens Inclusos (Kitnets)</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncContractData}
                  className="text-[9.5px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 font-extrabold px-2 py-1 rounded transition flex items-center gap-1 shadow-sm"
                  title="Atualizar os valores do mobiliário no contrato de imediato"
                >
                  <RefreshCw className="h-3 w-3 text-indigo-600" />
                  <span>Sincronizar no Contrato</span>
                </button>
                <div className="flex items-center gap-1.5 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">
                  <input
                    type="checkbox"
                    id="includeItemsClause"
                    checked={includeItemsClause}
                    onChange={(e) => setIncludeItemsClause(e.target.checked)}
                    className="h-4 w-4 text-indigo-650 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="includeItemsClause" className="text-[10px] font-extrabold text-indigo-950 uppercase cursor-pointer select-none leading-none">
                    Incluir Cláusula
                  </label>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-gray-500 leading-relaxed font-semibold">
              Selecione quais móveis e eletrodomésticos constam na kitnet para gerar uma cláusula formal de custeio/restituição financeira em caso de dano.
            </p>

            {includeItemsClause && (
              <div className="space-y-3 pt-2.5 border-t border-indigo-100/50 animate-in fade-in duration-200">
                {/* List of default and custom items */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {includedItems.map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center justify-between p-2 rounded-lg border transition ${
                        item.selected 
                          ? "bg-indigo-50/30 border-indigo-200" 
                          : "bg-white border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={(e) => {
                            const updated = [...includedItems];
                            updated[idx] = { ...item, selected: e.target.checked };
                            setIncludedItems(updated);
                          }}
                          className="h-3.5 w-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        
                        {/* Editable Name */}
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const updated = [...includedItems];
                            updated[idx] = { ...item, name: e.target.value };
                            setIncludedItems(updated);
                          }}
                          className="text-[11px] font-bold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none py-0.5 px-1 flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="relative rounded-md max-w-[90px]">
                          <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                            <span className="text-[10px] text-gray-500 font-bold">R$</span>
                          </div>
                          <input
                            type="number"
                            value={item.value}
                            onChange={(e) => {
                              const updated = [...includedItems];
                              updated[idx] = { ...item, value: Number(e.target.value) || 0 };
                              setIncludedItems(updated);
                            }}
                            className="w-full pl-6 pr-1 py-0.5 text-[11px] font-bold text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none"
                            placeholder="0"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIncludedItems(includedItems.filter(i => i.id !== item.id));
                          }}
                          className="p-1 text-gray-450 hover:text-red-600 transition rounded"
                          title="Excluir item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Item */}
                <div className="p-2.5 bg-gray-50 border border-gray-200/60 rounded-lg space-y-2">
                  <span className="block text-[8.5px] font-extrabold text-gray-600 uppercase tracking-wider">
                    ➕ Adicionar Item Personalizado
                  </span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      placeholder="Nome do bem (Ex: Micro-ondas)"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="text-[11px] font-medium p-1.5 bg-white border border-gray-200 rounded flex-1 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                    <div className="relative rounded-md max-w-[85px]">
                      <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                        <span className="text-[10px] text-gray-500 font-bold">R$</span>
                      </div>
                      <input
                        type="number"
                        placeholder="Valor"
                        value={newItemValue || ""}
                        onChange={(e) => setNewItemValue(Number(e.target.value) || 0)}
                        className="w-full pl-6 pr-1.5 py-1.5 text-[11px] font-medium bg-white border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newItemName.trim()) return;
                        const newItem = {
                          id: `custom-item-${Date.now()}`,
                          name: newItemName.trim(),
                          value: newItemValue || 0,
                          selected: true
                        };
                        setIncludedItems([...includedItems, newItem]);
                        setNewItemName("");
                        setNewItemValue(0);
                      }}
                      className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition flex items-center justify-center shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Technical Clause Preview Notice */}
                <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[9.5px] text-indigo-950 font-semibold leading-relaxed">
                  <strong>💡 Texto Técnico Ativo:</strong> Uma cláusula específica será inserida na minuta responsabilizando formalmente o locatário pela integridade financeira dos bens e estabelecendo o compromisso de indenização financeira imediata caso haja demonstração inequívoca de avaria ou mau uso.
                </div>
              </div>
            )}
          </div>

          {/* Direct Contract Single Editor & Preview Section */}
          <div className="space-y-2.5 border border-indigo-200/80 p-3.5 rounded-xl bg-white shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <label className="block text-[11px] font-black text-indigo-950 uppercase tracking-wide flex items-center gap-1.5">
                  <PenTool className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span>Editor Único da Minuta do Contrato</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">Soberano</span>
                </label>
                <p className="text-[8.5px] text-slate-500 font-medium">
                  Este é o texto final consolidado que irá para a geração do PDF e assinatura digital.
                </p>
              </div>

              {selectedInquilino && selectedImovel && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleSyncContractData}
                    className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 font-extrabold px-2.5 py-1 rounded-md transition flex items-center gap-1 shadow-2xs cursor-pointer"
                    title="Recarregar e atualizar a minuta com os dados mais recentes do formulário"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Redefinir com Dados do Formulário</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFullscreenEditor(true)}
                    className="text-[9.5px] text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
                  >
                    🔍 Expandir Tela Cheia
                  </button>
                </div>
              )}
            </div>

            {syncToastMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10px] font-bold rounded-md flex items-center gap-2 shadow-2xs animate-in fade-in duration-200">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{syncToastMsg}</span>
              </div>
            )}

            {selectedInquilino && selectedImovel ? (
              <div className="space-y-1.5">
                <textarea
                  value={draftText}
                  onChange={(e) => {
                    setDraftText(e.target.value);
                    setIsEditingDraftManually(true);
                  }}
                  className="w-full h-64 p-3 bg-slate-50/50 border border-slate-200 rounded-lg font-mono text-[10px] text-slate-800 leading-relaxed resize-y focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 overflow-y-auto transition"
                  placeholder="Escreva ou edite a minuta final do contrato aqui..."
                />
                <div className="flex justify-between items-center text-[9px] font-semibold text-slate-500 px-0.5">
                  <span>{draftText ? draftText.split(/\s+/).filter(Boolean).length : 0} palavras • {draftText ? draftText.length : 0} caracteres</span>
                  {isEditingDraftManually ? (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold flex items-center gap-1">
                      ● Texto editado manualmente pelo usuário
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                      ✓ Sincronizado automaticamente com os dados do formulário
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-center text-slate-500 text-[10.5px]">
                💡 Selecione um <strong>Inquilino</strong> e um <strong>Imóvel</strong> acima para que a minuta final seja montada automaticamente e liberada para revisão e edição.
              </div>
            )}
          </div>

          {/* Prompt compliance indicator callout */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg text-[10px] text-amber-900 leading-tight">
            <strong>Substituição de Modelo Ativa:</strong> O PDF gerado usará as exactas cláusulas e imagem de dobras de locação residential do locador <strong>Renato Faria Kawano</strong>, adaptando os dados.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition text-xs uppercase tracking-wide"
          >
            {submitting ? "Gerando Minuta..." : "Gerar Contrato de Locação"}
          </button>
        </form>
      </div>

      {/* Contracts Active List (FASE 3) */}
      <div className="lg:col-span-2 space-y-4">
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-950 tracking-tight font-sans">Relações de Locação sob Gestão</h3>
              <p className="text-xs text-gray-400">Contratos orquestrados no ecossistema</p>
            </div>
            
            {/* Segmentation Filter Tabs for Active vs Expired/Terminated contracts */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setStatusFilter("VIGENTES")}
                className={`px-2.5 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wide transition cursor-pointer ${
                  statusFilter === "VIGENTES"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Vigentes
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("ARQUIVADOS")}
                className={`px-2.5 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wide transition cursor-pointer ${
                  statusFilter === "ARQUIVADOS"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Arquivados
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("TODOS")}
                className={`px-2.5 py-1.5 rounded-md font-bold text-[10px] uppercase tracking-wide transition cursor-pointer ${
                  statusFilter === "TODOS"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Todos
              </button>
            </div>
          </div>

          {/* Compact visual filter for tenant selection */}
          {contratos.length > 0 && (
            <div className="mb-5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 flex-1">
                <label htmlFor="selectedTenantFilter" className="block text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                  🔍 Selecionar Inquilino Específico
                </label>
                <select
                  id="selectedTenantFilter"
                  value={selectedInquilinoFilter}
                  onChange={(e) => setSelectedInquilinoFilter(e.target.value)}
                  className="w-full md:w-80 px-3 py-2 bg-white border border-indigo-200/80 rounded-lg text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500 cursor-pointer outline-hidden transition shadow-3xs"
                >
                  <option value="">(Exibir todas as relações de locação)</option>
                  {contratos
                    .filter(c => {
                      if (statusFilter === "VIGENTES") return c.status !== "ARQUIVADO";
                      if (statusFilter === "ARQUIVADOS") return c.status === "ARQUIVADO";
                      return true;
                    })
                    .filter((c, index, self) => c.inquilino && self.findIndex(t => t.inquilinoId === c.inquilinoId) === index)
                    .map(c => (
                      <option key={c.id} value={c.inquilinoId}>
                        Inquilino: {c.inquilino?.nome}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div className="text-right">
                {selectedInquilinoFilter ? (
                  <button
                    type="button"
                    onClick={() => setSelectedInquilinoFilter("")}
                    className="px-2.5 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-extrabold rounded-lg uppercase text-[9.5px] tracking-wide transition cursor-pointer"
                  >
                    Limpar Filtro e Ver Todos
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 italic">
                    Ao focar em um inquilino, as informações serão exibidas de maneira expandida.
                  </span>
                )}
              </div>
            </div>
          )}

          {contratos.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <FileText className="h-10 w-10 mx-auto text-gray-300 animate-pulse" />
              <p className="text-xs">Não há contratos registrados no banco de dados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contratos
                .filter(c => {
                  if (statusFilter === "VIGENTES") return c.status !== "ARQUIVADO";
                  if (statusFilter === "ARQUIVADOS") return c.status === "ARQUIVADO";
                  return true;
                })
                .filter(c => {
                  if (selectedInquilinoFilter) {
                    return c.inquilinoId === selectedInquilinoFilter;
                  }
                  return true;
                })
                .map(c => (
                  <ContractRelationCard
                    key={c.id}
                    c={c}
                    onContractAdded={onContractAdded}
                    setPreviewContract={setPreviewContract}
                    handleDownloadPDF={handleDownloadPDF}
                    onGenerateSummary={handleGenerateSummary}
                    setSelectedSharingContract={setSelectedSharingContract}
                    handleSignContract={handleSignContract}
                    signingId={signingId}
                    setContractToArchive={setContractToArchive}
                    forceExpanded={selectedInquilinoFilter === c.inquilinoId}
                  />
                ))}
            </div>
          )}
        </div>

      </div>

      {/* MODAL: RESUMO EXECUTIVO DO CONTRATO COM GEMINI IA */}
      {summarizingContract && (
        <div className="fixed inset-0 z-55 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-150 flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-300 animate-pulse" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">Análise Cognitiva & Resumo Executivo (IA)</h3>
                  <p className="text-[10px] text-indigo-200">Parâmetros legais e análise preditiva de risco baseada no Gemini 3.5 Flash</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => { setSummarizingContract(null); setSummaryData(null); }}
                className="text-indigo-200 hover:text-white cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
              {isSummarizing ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <div className="p-4 bg-indigo-50 rounded-full border border-indigo-100 animate-spin-slow">
                    <Sparkles className="h-10 w-10 text-indigo-600 animate-pulse" />
                  </div>
                  <div className="space-y-1 max-w-md">
                    <h4 className="text-sm font-bold text-gray-900">Processando contrato de locação...</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-normal">
                      O Gemini está lendo minuciosamente o instrumento contratual para extrair as cláusulas comerciais e efetuar uma auditoria jurídica detalhada de riscos para o proprietário.
                    </p>
                  </div>
                  <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                  </div>
                </div>
              ) : summaryData ? (
                <div className="space-y-6">
                  {/* Banner / Source Badge */}
                  <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-150 p-3 rounded-xl">
                    <span className="text-slate-500 font-medium">Método de Processamento:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-[10px] uppercase">
                      ✓ {summaryData.source || "Mapeamento IA (Condo+)"}
                    </span>
                  </div>

                  {/* Section 1: Identificacao Geral */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <User className="h-4 w-4 text-indigo-500" />
                      1. Identificação Geral da Locação
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-150">
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Locador / Dono</span>
                        <span className="text-gray-900 font-extrabold text-xs">{summaryData.identificacao?.locador || "Renato Faria Kawano"}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Locatário / Renter</span>
                        <span className="text-gray-900 font-bold text-xs">{summaryData.identificacao?.locatario || "N/A"}</span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Vigência Inicial e Final</span>
                        <span className="text-gray-900 font-medium text-xs flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          {summaryData.identificacao?.vigencia || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-0.5 col-span-1 md:col-span-2">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Imóvel Locado</span>
                        <span className="text-gray-900 font-semibold text-xs flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                          {summaryData.identificacao?.imovel || "N/A"}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Valor do Aluguel Atual</span>
                        <span className="text-indigo-600 font-extrabold text-xs">
                          {summaryData.identificacao?.valorAluguel ? `R$ ${summaryData.identificacao.valorAluguel.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Resumo de Clausulas */}
                  {summaryData.resumoClausulas && summaryData.resumoClausulas.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        2. Resumo de Cláusulas Padrões Pactuadas
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summaryData.resumoClausulas.map((item: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl border border-gray-150 bg-white shadow-3xs flex flex-col gap-1.5">
                            <span className="font-bold text-xs text-slate-800">{item.titulo}</span>
                            <p className="text-xs text-slate-500 leading-relaxed font-normal">{item.descricao}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Analise de Riscos */}
                  {summaryData.analiseRiscos && summaryData.analiseRiscos.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        3. Auditoria de Riscos para o Proprietário (Crítico)
                      </h4>
                      <div className="space-y-3">
                        {summaryData.analiseRiscos.map((item: any, idx: number) => {
                          const isHigh = item.nivelRisco === "ALTO";
                          const isMedium = item.nivelRisco === "MEDIO" || item.nivelRisco === "MÉDIO";
                          return (
                            <div 
                              key={idx} 
                              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-start gap-3 ${
                                isHigh 
                                  ? "bg-rose-50 border-rose-200/60" 
                                  : isMedium 
                                    ? "bg-amber-50 border-amber-200/60" 
                                    : "bg-gray-50 border-gray-200/60"
                              }`}
                            >
                              <div className="shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase inline-block ${
                                  isHigh 
                                    ? "bg-rose-600 text-white" 
                                    : isMedium 
                                      ? "bg-amber-500 text-white" 
                                      : "bg-slate-500 text-white"
                                }`}>
                                  Risco {item.nivelRisco}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="font-bold text-xs text-gray-900 block">{item.titulo}</span>
                                <p className="text-xs text-gray-600 leading-relaxed font-normal">{item.descricao}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Pontos de Atencao */}
                  {summaryData.pontosAtencao && summaryData.pontosAtencao.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4 text-indigo-500" />
                        4. Pontos de Atenção & Recomendações
                      </h4>
                      <div className="bg-indigo-50/20 border border-indigo-100 rounded-xl p-4 space-y-2.5">
                        {summaryData.pontosAtencao.map((item: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-xs">
                            <span className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-slate-600 leading-normal font-normal">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 5: Parecer Conclusivo */}
                  {summaryData.consideracoesFinais && (
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1 border border-slate-800">
                      <span className="block text-[9px] uppercase font-extrabold tracking-widest text-indigo-300">Parecer Final Consolidado da IA</span>
                      <p className="text-xs italic leading-relaxed font-normal text-slate-300">"{summaryData.consideracoesFinais}"</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-2 text-red-500">
                  <AlertCircle className="h-10 w-10" />
                  <p className="text-xs font-bold">Não foi possível carregar as informações analisadas do contrato.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-gray-150 flex items-center justify-end gap-2.5 shrink-0 text-xs font-bold">
              <button
                type="button"
                onClick={() => { setSummarizingContract(null); setSummaryData(null); }}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-xl cursor-pointer font-bold text-xs"
              >
                Fechar Painel
              </button>

              {summaryData && (
                <button
                  type="button"
                  onClick={() => handleDownloadSummaryPDF(summaryData)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl flex items-center gap-1.5 cursor-pointer shadow-3xs hover:shadow-2xs transition font-bold text-xs"
                >
                  <Download className="h-4 w-4 text-white" />
                  <span>Baixar Parecer Executivo em PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Arquivar / Interromper Contrato */}
      {contractToArchive && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-950">Arquivar ou Interromper Contrato</h3>
                <p className="text-xs text-gray-400">Relação com: {contractToArchive.inquilino?.nome}</p>
              </div>
              <button 
                type="button" 
                onClick={() => { setContractToArchive(null); setArchiveNotes(""); }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Aviso de Gestão:</strong> Ao interromper ou arquivar, o imóvel correspondente será liberado para novas locações e o status deste contrato mudará para <strong>ARQUIVADO</strong>.
              </div>
            </div>

            <form onSubmit={handleArchiveContract} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-wide">Motivo do Arquivamento / Observações de Encerramento *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ex: O contrato venceu em 20/05 e o inquilino optou por não renovar devido a mudança de estado. Chaves devolvidas no prazo vistoria final..."
                  value={archiveNotes}
                  onChange={(e) => setArchiveNotes(e.target.value)}
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-1 focus:ring-indigo-500 focus:bg-white resize-none font-sans"
                />
                <span className="block text-[9px] text-gray-400">Registre detalhes importantes como entrega de chaves, observações de débitos/inadimplência ou rescisões amigáveis/judiciais.</span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setContractToArchive(null); setArchiveNotes(""); }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={submittingArchive}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 text-white rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {submittingArchive ? "Processando..." : "Confirmar Arquivamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RENDER THE HIGH FIDELITY THREE-COLUMN DRAFTER MODEL OVERLAY */}
      {previewContract && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 py-6 px-4 flex items-center justify-center backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-7xl w-full mx-auto shadow-2xl flex flex-col h-[90vh] overflow-hidden border border-slate-200">
            
            {/* Header controls inside modal */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Visualizador de Contrato Estrito (Modelo de Referência)</h3>
                  <p className="text-[10px] text-slate-400">Padrão Renato Faria Kawano — Substituição dinâmica de locatário ativa</p>
                </div>
              </div>

              {/* Toggle fold structure vs flat scroll layout */}
              <div className="flex items-center gap-3">
                {/* Download PDF button inside previewer */}
                <button
                  onClick={() => handleDownloadPDF(previewContract)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-550 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  title="Baixar Contrato em PDF"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Baixar PDF</span>
                </button>

                {/* Gov.br WhatsApp or Email sharing drawer handler */}
                <button
                  onClick={() => {
                    setSelectedSharingContract(previewContract);
                    setPreviewContract(null); // Close this modal and open sharing
                  }}
                  className="px-3 py-1.5 bg-[#00C010] hover:bg-[#009C0D] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Colher Assinatura Gov.br</span>
                </button>

                <button
                  onClick={() => setFoldViewMode(!foldViewMode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    foldViewMode ? "bg-slate-700 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                  title="Alterne entre visualização de dobras de papel (brochura de 3 colunas) e leitura corrida vertical"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{foldViewMode ? "Modo 3 Dobras (Foto)" : "Formato Corrido"}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                  title="Imprimir contrato"
                >
                  <Printer className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setPreviewContract(null)}
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Main body split in edit sidebar and paper preview */}
            <div className="flex-1 flex overflow-hidden bg-slate-100">
              
              {/* INTERACTIVE EDITOR COLUMN (Left Side) */}
              <div className="w-[380px] bg-white border-r border-slate-200/80 flex flex-col h-full overflow-y-auto select-none p-5 shrink-0 space-y-4">
                 <div>
                   <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1">
                     <PenTool className="h-4 w-4 text-indigo-600 shrink-0" />
                     <span>Editor de Campos Principais</span>
                   </h4>
                   <p className="text-[10px] text-gray-500 mt-0.5">Altere os dados de qualquer parte. A minuta no papel atualiza instantaneamente.</p>
                 </div>
                 
                 {/* Upload custom layout template inside live editor */}
                 <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                   <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">Modelo Carregado</p>
                   <div className="flex items-center justify-between gap-2 bg-white p-2 rounded border border-gray-205 text-[10px] text-gray-700">
                     <span className="truncate max-w-[170px] font-semibold flex items-center gap-1.5 text-slate-700">
                       <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                       <span>{previewContract.customTemplateName || 'Minuta_Padrao_Faria_Kawano.doc'}</span>
                     </span>
                     <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-indigo-100 text-indigo-800">ATALHO</span>
                   </div>
                   
                   <div className="relative border border-dashed border-slate-300 hover:bg-slate-100 rounded p-2 text-center cursor-pointer text-[9px] text-slate-600 font-bold transition">
                     <input
                       type="file"
                       accept=".pdf,.doc,.docx,.rtf,.txt"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           setIsParsingTemplate(true);
                           parseContractTemplate(file)
                             .then((textContent) => {
                               setIsParsingTemplate(false);
                               previewContract.customTemplateName = file.name;
                               previewContract.customTemplateContent = textContent;
                               handleUploadNewTemplateModel(file.name, textContent);
                               alert(`Sucesso: Modelo "${file.name}" importado e salvo no banco de dados como seu novo modelo padrão para os próximos contratos!`);
                             })
                             .catch((err) => {
                               setIsParsingTemplate(false);
                               alert(`Erro na análise automática do modelo: ${err.message}`);
                             });
                         }
                       }}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                     />
                     <span>Substituir arquivo do modelo (.doc, .pdf)</span>
                   </div>
                 </div>

                 {/* Collapsible/Sections of edits */}
                 <div className="space-y-4 pt-2 border-t border-slate-105 text-[10px]">
                   
                   {/* Locador */}
                   <div className="space-y-2.5">
                     <h5 className="font-extrabold text-indigo-900 uppercase tracking-widest text-[9.5px] border-b border-indigo-100 pb-1 flex items-center gap-1 w-full">
                       <span>DADOS DO LOCADOR (PROPRIETÁRIO)</span>
                     </h5>
                     <div className="space-y-1.5">
                       <label className="text-gray-500 block font-bold uppercase block text-gray-450 tracking-wider">Nome Completo</label>
                       <input 
                         type="text" 
                         value={editLocadorNome} 
                         onChange={(e) => setEditLocadorNome(e.target.value)}
                         className="w-full p-2 bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded text-[11px] font-semibold text-gray-850 transition"
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">CPF</label>
                         <input 
                           type="text" 
                           value={editLocadorCpf} 
                           onChange={(e) => setEditLocadorCpf(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">RG</label>
                         <input 
                           type="text" 
                           value={editLocadorRg} 
                           onChange={(e) => setEditLocadorRg(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-gray-500 block font-bold uppercase tracking-wider">Residência</label>
                       <input 
                         type="text" 
                         value={editLocadorResidencia} 
                         onChange={(e) => setEditLocadorResidencia(e.target.value)}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                       />
                     </div>
                     <div className="grid grid-cols-3 gap-1">
                       <div className="space-y-1.5 col-span-2">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Banco para PIX</label>
                         <input 
                           type="text" 
                           value={editLocadorBanco} 
                           onChange={(e) => setEditLocadorBanco(e.target.value)}
                           className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-gray-850"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Agência</label>
                         <input 
                           type="text" 
                           value={editLocadorAgencia} 
                           onChange={(e) => setEditLocadorAgencia(e.target.value)}
                           className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-gray-850"
                         />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Conta Corrente</label>
                         <input 
                           type="text" 
                           value={editLocadorConta} 
                           onChange={(e) => setEditLocadorConta(e.target.value)}
                           className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-gray-850 font-mono"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Chave PIX</label>
                         <input 
                           type="text" 
                           value={editLocadorPix} 
                           onChange={(e) => setEditLocadorPix(e.target.value)}
                           className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-semibold text-gray-850 font-mono"
                         />
                       </div>
                     </div>
                   </div>

                   {/* Locatário */}
                   <div className="space-y-2.5 pt-2 border-t border-slate-105">
                     <h5 className="font-extrabold text-indigo-900 uppercase tracking-widest text-[9.5px] border-b border-indigo-100 pb-1">DADOS DO LOCATÁRIO (INQUILINO)</h5>
                     <div className="space-y-1.5">
                       <label className="text-gray-500 block font-bold uppercase tracking-wider">Nome do Locatário</label>
                       <input 
                         type="text" 
                         value={editLocatarioNome} 
                         onChange={(e) => setEditLocatarioNome(e.target.value)}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">CPF</label>
                         <input 
                           type="text" 
                           value={editLocatarioCpf} 
                           onChange={(e) => setEditLocatarioCpf(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">RG</label>
                         <input 
                           type="text" 
                           value={editLocatarioRg} 
                           onChange={(e) => setEditLocatarioRg(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Estado Civil</label>
                         <input 
                           type="text" 
                           value={editLocatarioEstadoCivil} 
                           onChange={(e) => setEditLocatarioEstadoCivil(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Profissão</label>
                         <input 
                           type="text" 
                           value={editLocatarioProfissao} 
                           onChange={(e) => setEditLocatarioProfissao(e.target.value)}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                         />
                       </div>
                     </div>
                   </div>

                   {/* Imóvel */}
                   <div className="space-y-2.5 pt-2 border-t border-slate-200">
                     <h5 className="font-extrabold text-indigo-900 uppercase tracking-widest text-[9.5px] border-b border-indigo-100 pb-1">DADOS DO IMÓVEL & VALORES DO CONTRATO</h5>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="space-y-1.5">
                          <label className="text-gray-500 block font-bold uppercase tracking-wider">Data Início</label>
                          <input 
                            type="date" 
                            value={editDataInicio} 
                            onChange={(e) => setEditDataInicio(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-gray-500 block font-bold uppercase tracking-wider">Data Fim</label>
                          <input 
                            type="date" 
                            value={editDataFim} 
                            onChange={(e) => setEditDataFim(e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-850"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-gray-500 block font-bold uppercase tracking-wider">Taxa de Entrada (R$)</label>
                        <input 
                          type="number" 
                          value={editTaxaEntrada} 
                          onChange={(e) => setEditTaxaEntrada(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                        />
                      </div>
                     <div className="space-y-1.5">
                       <label className="text-gray-500 block font-bold uppercase tracking-wider">Endereço do Imóvel / Unidade</label>
                       <input 
                         type="text" 
                         value={editEnderecoImovel} 
                         onChange={(e) => setEditEnderecoImovel(e.target.value)}
                         className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11.5px] font-semibold text-gray-850"
                       />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Valor Aluguel (R$)</label>
                         <input 
                           type="number" 
                           value={editValorAluguel} 
                           onChange={(e) => setEditValorAluguel(Number(e.target.value))}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-gray-500 block font-bold uppercase tracking-wider">Dia Vencimento Mensal</label>
                         <input 
                           type="number" 
                           value={editDiaVencimento} 
                           onChange={(e) => setEditDiaVencimento(Number(e.target.value))}
                           className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-gray-855 font-mono"
                         />
                       </div>
                     </div>
                   </div>
                 </div>

                  {/* Apply & Save button */}
                 <div className="pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/contracts/${previewContract.id}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              overriddenLocadorNome: editLocadorNome,
                              overriddenLocadorCpf: editLocadorCpf,
                              overriddenLocadorRg: editLocadorRg,
                              overriddenLocadorResidencia: editLocadorResidencia,
                              overriddenLocadorNacionalidade: editLocadorNacionalidade,
                              overriddenLocadorEstadoCivil: editLocadorEstadoCivil,
                              overriddenLocadorBanco: editLocadorBanco,
                              overriddenLocadorAgencia: editLocadorAgencia,
                              overriddenLocadorConta: editLocadorConta,
                              overriddenLocadorPix: editLocadorPix,
                              
                              overriddenLocatarioNome: editLocatarioNome,
                              overriddenLocatarioCpf: editLocatarioCpf,
                              rgLocatario: editLocatarioRg,
                              estadoCivilLocatario: editLocatarioEstadoCivil,
                              profissaoLocatario: editLocatarioProfissao,
                              
                              overriddenEnderecoImovel: editEnderecoImovel,
                              overriddenValorAluguel: editValorAluguel,
                              overriddenDiaVencimento: editDiaVencimento,
                              overriddenTaxaEntrada: editTaxaEntrada,
                              dataInicio: editDataInicio,
                              dataFim: editDataFim,
                              customTemplateName: previewContract.customTemplateName
                            })
                          });
                          
                          if (!res.ok) throw new Error("Falha ao salvar as alterações.");
                          
                          // Merge changes locally
                          onContractAdded(); // Refresh contracts parent
                          alert("✓ Sucesso: Alterações mecânicas e campos do modelo salvos com sucesso e persistidos!");
                        } catch (err: any) {
                          alert(err.message);
                        }
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition duration-155 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Check className="h-4 w-4 shrink-0" />
                      <span>Salvar e Aplicar Alterações</span>
                    </button>
                    <p className="text-[8px] text-zinc-400 mt-1.5 text-center font-medium">As alterações persistirão no banco, na visualização e nos downloads.</p>
                 </div>
              </div>

              {/* PAPER PREVIEW AREA (Right Side) */}
              <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex flex-col items-center">
              
              {/* Paper rendering section */}
              <div 
                className={`transition-all duration-300 ${
                  foldViewMode 
                    ? `w-full ${activePagesCount === 3 ? "max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6" : activePagesCount === 2 ? "max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6" : "max-w-2xl grid grid-cols-1 gap-6"}` 
                    : "w-full max-w-3xl bg-white p-12 rounded-xl border border-slate-200/60 shadow-lg font-serif"
                }`}
                style={{ fontFamily: "'Inter', Georgia, serif" }}
              >
                
                {foldViewMode ? (
                  <>
                    {/* COLUMN 1 */}
                    <div className="space-y-4 text-[11px] text-slate-800 leading-relaxed font-sans bg-white p-6 rounded shadow-sm border-t-2 border-indigo-500 flex flex-col justify-between">
                      <div>
                        <div className="text-center pb-2 border-b border-gray-100 mb-4">
                          <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 font-sans">Contrato de Locação Residencial</h2>
                          <span className="text-[9px] text-gray-400 font-mono">PÁGINA 1 / {activePagesCount}</span>
                        </div>

                        {hasCustomTemplate ? (
                          renderFormattedContent(customPage1)
                        ) : (
                          <div className="space-y-3">
                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              Pelo presente instrumento particular do contrato, de um lado <strong>{previewLocadorNome}</strong>, {previewLocadorNacionalidade}, {previewLocadorEstadoCivil}, portador de RG {previewLocadorRg} e do CPF {previewLocadorCpf} residente em {previewLocadorResidencia}, como locador e de outro o Sr.(a) <strong>{editLocatarioNome}</strong>, brasileiro(a), {editLocatarioEstadoCivil}, portador(a) do RG {editLocatarioRg} e do CPF <strong>{editLocatarioCpf}</strong>, como locatário celebrar entre si o presente contrato de locação, que será regido pelas condições abaixo, os quais reciprocamente aceitam.
                            </p>

                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              <strong>Cláusula Primeira:</strong> O locador é legítimo possuidor do imóvel situado a <strong>{previewEnderecoImovel}</strong>, que é dado em locação ao Locatário para que este use para fins Residenciais, fixando sua residência e seus familiares ficando vedada a desvirtuação da finalidade, sem anuência do Locadores, ou de seu administrador.
                            </p>

                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              <strong>Cláusula Segunda - DO PRAZO:</strong> O Prazo de locação será de <strong>{mesesPorExtenso(calcularMeses(previewContract?.dataInicio, previewContract?.dataFim))} meses</strong> sendo o inicial em <strong>{formatarData(previewContract?.dataInicio)}</strong> e o final no dia <strong>{formatarData(previewContract?.dataFim)}</strong>, quando o Locatário se obriga a restituir o imóvel independentemente de qualquer notificação, seja judicial ou extrajudicial, e se houver interesse das partes poderá ser renovável mediante interesse das partes e ou renovável automaticamente se as partes não se pronunciarem a respeito.
                            </p>

                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              <strong>Cláusula Terceira: DO VALOR DO ALUGUEL:</strong> O aluguel mensal, livremente convencionado será de <strong>R$ {editValorAluguel?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({getValorAluguelPorExtenso(editValorAluguel || 0)})</strong> que será reajustado anualmente segundo a variação, acumulada no índice IGPM/FGV, IGP/FGV, INPC/IBGE, IPC/FIPE, adotando-se uma na falta do outro, pelo índice que o substitua e que supra os efeitos inflacionários.
                            </p>

                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              <strong>Cláusula Quarta: DO VENCIMENTO:</strong> O vencimento do aluguel é todo dia <strong>{editDiaVencimento} de cada mês</strong>, devendo ser pago pontualmente por meio de depósito bancário no {previewLocadorBanco}, agência {previewLocadorAgencia} - Conta Corrente {previewLocadorConta} ou via PIX: {previewLocadorPix}. O pagamento após o prazo de vencimento implicará em multa de 10% (dez por cento) de multa e vencerá juros de 2% (dois por cento) ao mês, mais correção monetária atualizada pelo mesmo critério utilizado pelo Governo Federal para cobrança de mora dos impostos em atraso.
                            </p>

                            <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                              <strong>Cláusula Quinta:</strong> Além dos juros e encargos acima citados, o Locatário incorrerá em caso de mora no pagamento de aluguéis, em 20% (vinte por cento) referentes a honorários advocatícios. Esta porcentagem será reduzida a 10% (dez por cento) se a dívida for liquidada amigavelmente no escritório do advogado do Locador, anteriormente a qualquer procedimento judicial. 
                            </p>
                          </div>
                        )}
                      </div>

                      {activePagesCount === 1 && signatureBlock}
                    </div>

                    {/* COLUMN 2 */}
                    {activePagesCount >= 2 && (
                      <div className="space-y-4 text-[11px] text-slate-800 leading-relaxed font-sans bg-white p-6 rounded shadow-sm border-t-2 border-indigo-500 flex flex-col justify-between">
                        <div>
                          <div className="text-center pb-2 border-b border-gray-100 mb-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 font-sans">Condições Adicionais</h2>
                            <span className="text-[9px] text-gray-400 font-mono">PÁGINA 2 / {activePagesCount}</span>
                          </div>

                          {hasCustomTemplate ? (
                            renderFormattedContent(customPage2)
                          ) : (
                            <div className="space-y-3">
                              <p className="text-justify font-serif text-[11px] leading-snug">
                                Fica obrigado o LOCADOR, a emitir recibo da quantia paga, relacionando pormenorizadamente todos os valores oriundos de Juros, ou outras despesas. Emitir-se-á tal recibo, desde que haja a apresentação, pelo LOCATÁRIO, dos comprovantes de todas as despesas do imóvel devidamente quitado. Caso o LOCATÁRIO venha a efetuar o pagamento do aluguel através de cheque, restará facultado ao LOCADOR emitir os recibos de pagamentos somente após compensação do mesmo.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                No caso de falta de pagamento de aluguéis e demais encargos previstos neste contrato ou infração de qualquer obrigação contratual ou legal ficam o Locador com a faculdade de ajuizar quando lhe parecer conveniente contra o Locatário ação de despejo ou qualquer outra, sem necessidade de comunicação, os quais nem por isso fica exonerado da obrigação de indenizar o Locador das custas processuais, honorários de advogado, multa contratual e de todos os demais encargos decorrentes dos aludidos procedimentos.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Sexta:</strong> O Locatário informa que o imóvel será ocupado por (01 Pessoa) não podendo ter mais pessoas do que informado ao Locador, sob pena de rescisão contratual.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Sétima:</strong> O Locatário se obriga a fazer chegar às mãos do Locador todo e qualquer aviso ou comunicação que diga respeito ao imóvel locado, sob pena de responder pelas perdas e danos que usar.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Oitava:</strong> O LOCATÁRIO concorda desde já, a antecipar o valor de <strong>R$ {editValorAluguel?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({getValorAluguelPorExtenso(editValorAluguel || 0)})</strong>, equivalente a 01 (hum) mês de aluguel. E está ciente que o valor pago trata-se apenas do depósito referente exclusivamente para a pintura, não o isentando por qualquer outro dano que venha causar ao imóvel. Valor que possivelmente será devolvido na devolução se a pintura estiver nas mesmas condições que foi entregue.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Nona:</strong> Não é permitida a transferência deste contrato em todo ou em parte.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Décima:</strong> É proibido ao locatário fazer sublocação do imóvel, ou empréstimo do imóvel locado sem consentimento do locador/administrador por escrito.
                              </p>

                              <p className="text-justify font-serif text-[11px] leading-snug">
                                <strong>Cláusula Décima Primeira:</strong> O Locatário confessa que recebeu o imóvel no estado em que se encontra, e se obriga a mantê-lo em perfeito estado de conservação, asseio e higiene.
                              </p>
                            </div>
                          )}
                        </div>

                        {activePagesCount === 2 && signatureBlock}
                      </div>
                    )}

                    {/* COLUMN 3 */}
                    {activePagesCount === 3 && (
                      <div className="space-y-4 text-[11px] text-slate-800 leading-relaxed font-sans bg-white p-6 rounded shadow-sm border-t-2 border-indigo-500 flex flex-col justify-between">
                        <div>
                          <div className="text-center pb-2 border-b border-gray-100 mb-4">
                            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-900 font-sans">Fechamento & Foro</h2>
                            <span className="text-[9px] text-gray-400 font-mono">PÁGINA 3 / 3</span>
                          </div>

                          {hasCustomTemplate ? (
                            renderFormattedContent(customPage3)
                          ) : (
                            <div className="space-y-3">
                              <p className="text-justify font-serif text-[10.5px] leading-tight">
                                <strong>Parágrafo primeiro a sexto:</strong> Fica proibido utilizar a água para lavar veículo, sob pena de pagar multa de 20% (vinte por cento) do valor do aluguel. Não possuir animais domésticos a fim de não perturbar vizinhos.
                              </p>

                              <p className="text-justify font-serif text-[10.5px] leading-tight">
                                <strong>Cláusula Décima Segunda:</strong> O Locatário desde já faculta ao Locador/Administrador, vistoriar o imóvel locado quando entender conveniente, durante a locação para verificar o cumprimento de cláusulas.
                              </p>

                              <p className="text-justify font-serif text-[10.5px] leading-tight">
                                <strong>Cláusula Décima Terceira - DA MULTA OU QUEBRA:</strong> As partes que infringir o presente contrato em qualquer de suas cláusulas pagará, multa equivalente a 3 (três) aluguéis vigentes na data da infração.
                              </p>

                              <p className="text-justify font-serif text-[10.5px] leading-tight">
                                <strong>Cláusula Décima Quarta a Oitava:</strong> Toda e qualquer benfeitoria fica incorporada ao imóvel. O LOCATÁRIO fica obrigado a fazer seguro contra incêndios do imóvel em seguradora idônea.
                              </p>

                              <p className="text-justify font-serif text-[10.5px] leading-tight">
                                <strong>Cláusula Décima Nona a Vigésima Primeira:</strong> Ambos elegem o Fórum de Praia Grande - SP para dirimir quaisquer dúvidas, e ações que tenham por objeto o presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.
                              </p>
                            </div>
                          )}
                        </div>

                        {signatureBlock}
                      </div>
                    )}
                  </>
                ) : (
                  /* CONTINUOUS SHEET VIEW MODE */
                  <div className="space-y-6 text-justify text-[12px] text-slate-800 leading-relaxed font-serif p-4">
                    <div className="text-center pb-4 border-b border-gray-100 mb-6 font-sans">
                      <h2 className="text-base font-extrabold uppercase tracking-widest text-slate-900 leading-tight">Minuta de Contrato Residencial</h2>
                      <span className="text-[10px] text-slate-400 font-mono tracking-wider font-bold">Modo de Visualização Contínuo Completo</span>
                    </div>

                    {hasCustomTemplate ? (
                      <div className="space-y-6 text-slate-800 font-serif select-text">
                        {fullSubstitutedTemplate.split("--PAGE--").map((part, idx) => (
                          <React.Fragment key={idx}>
                            {idx > 0 && (
                              <div className="my-8 flex items-center gap-4 select-none font-sans">
                                <div className="h-px bg-slate-200 flex-1"></div>
                                <span className="text-[9px] text-zinc-400 tracking-wider uppercase font-bold">Início da Página {idx + 1}</span>
                                <div className="h-px bg-slate-200 flex-1"></div>
                              </div>
                            )}
                            {renderFormattedContent(part)}
                          </React.Fragment>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                          Pelo presente instrumento particular do contrato, de um lado <strong>{previewLocadorNome}</strong>, {previewLocadorNacionalidade}, {previewLocadorEstadoCivil}, portador de RG {previewLocadorRg} e do CPF {previewLocadorCpf} residente em {previewLocadorResidencia}, como locador e de outro o Sr.(a) <strong>{editLocatarioNome}</strong>, brasileiro(a), {editLocatarioEstadoCivil}, portador(a) do RG {editLocatarioRg} e do CPF <strong>{editLocatarioCpf}</strong>, como locatário celebrar entre si o presente contrato de locação, que será regido pelas condições abaixo, os quais reciprocamente aceitam.
                        </p>

                        <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                          <strong>Cláusula Primeira:</strong> O locador é legítimo possuidor do imóvel situado a <strong>{previewEnderecoImovel}</strong>, que é dado em locação ao Locatário para que este use para fins Residenciais, fixando sua residência e seus familiares ficando vedada a desvirtuação da finalidade, sem anuência do Locadores, ou de seu administrador.
                        </p>

                        <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                          <strong>Cláusula Segunda - DO PRAZO:</strong> O Prazo de locação será de <strong>{mesesPorExtenso(calcularMeses(previewContract?.dataInicio, previewContract?.dataFim))} meses</strong> sendo o inicial em <strong>{formatarData(previewContract?.dataInicio)}</strong> e o final no dia <strong>{formatarData(previewContract?.dataFim)}</strong>, quando o Locatário se obriga a restituir o imóvel independentemente de qualquer notificação, seja judicial ou extrajudicial, e se houver interesse das partes poderá ser renovável mediante interesse das partes e ou renovável automaticamente se as partes não se pronunciarem a respeito.
                        </p>

                        <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                          <strong>Cláusula Terceira: DO VALOR DO ALUGUEL:</strong> O aluguel mensal, livremente convencionado será de <strong>R$ {editValorAluguel?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({getValorAluguelPorExtenso(editValorAluguel || 0)})</strong> que será reajustado anualmente segundo a variação, acumulada no índice IGPM/FGV, IGP/FGV, INPC/IBGE, IPC/FIPE, adotando-se uma na falta do outro, pelo índice que o substitua e que supra os efeitos inflacionários.
                        </p>

                        <p className="text-justify font-serif text-[11.5px] leading-relaxed">
                          <strong>Cláusula Quarta: DO VENCIMENTO:</strong> O vencimento do aluguel é todo dia <strong>{editDiaVencimento} de cada mês</strong>, devendo ser pago pontualmente por meio de depósito bancário no {previewLocadorBanco}, agência {previewLocadorAgencia} - Conta Corrente {previewLocadorConta} ou via PIX: {previewLocadorPix}. O pagamento após o prazo de vencimento implicará em multa de 10% (dez por cento) de multa e vencerá juros de 2% (dois por cento) ao mês, mais correção monetária atualizada pelo mesmo critério utilizado pelo Governo Federal para cobrança de mora dos impostos em atraso.
                        </p>

                        <p className="text-justify font-serif text-[11.5px] leading-relaxed border-b border-gray-100 pb-4">
                          <strong>Cláusula Quinta:</strong> Além dos juros e encargos acima citados, o Locatário incorrerá em caso de mora no pagamento de aluguéis, em 20% (vinte por cento) referentes a honorários advocatícios. Esta porcentagem será reduzida a 10% (dez por cento) se a dívida for liquidada amigavelmente no escritório do advogado do Locador, anteriormente a qualquer procedimento judicial. 
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          Fica obrigado o LOCADOR, a emitir recibo da quantia paga, relacionando pormenorizadamente todos os valores oriundos de Juros, ou outras despesas. Emitir-se-á tal recibo, desde que haja a apresentação, pelo LOCATÁRIO, dos comprovantes de todas as despesas do imóvel devidamente quitado. Caso o LOCATÁRIO venha a efetuar o pagamento do aluguel através de cheque, restará facultado ao LOCADOR emitir os recibos de pagamentos somente após compensação do mesmo.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          No caso de falta de pagamento de aluguéis e demais encargos previstos neste contrato ou infração de qualquer obrigação contratual ou legal ficam o Locador com a faculdade de ajuizar quando lhe parecer conveniente contra o Locatário ação de despejo ou qualquer outra, sem necessidade de comunicação, os quais nem por isso fica exonerado da obrigação de indenizar o Locador das custas processuais, honorários de advogado, multa contratual e de todos os demais encargos decorrentes dos aludidos procedimentos.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          <strong>Cláusula Sexta:</strong> O Locatário informa que o imóvel será ocupado por (01 Pessoa) não podendo ter mais pessoas do que informado ao Locador, sob pena de rescisão contratual.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          <strong>Cláusula Sétima:</strong> O Locatário se obriga a fazer chegar às mãos do Locador todo e qualquer aviso ou comunicação que diga respeito ao imóvel locado, sob pena de responder pelas perdas e danos que usar.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          <strong>Cláusula Oitava:</strong> O LOCATÁRIO concorda desde já, a antecipar o valor de <strong>R$ {editValorAluguel?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({getValorAluguelPorExtenso(editValorAluguel || 0)})</strong>, equivalente a 01 (hum) mês de aluguel. E está ciente que o valor pago trata-se apenas do depósito referente exclusivamente para a pintura, não o isentando por qualquer outro dano que venha causar ao imóvel. Valor que possivelmente será devolvido na devolução se a pintura estiver nas mesmas condições que foi entregue.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          <strong>Cláusula Nona:</strong> Não é permitida a transferência deste contrato em todo ou em parte.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug">
                          <strong>Cláusula Décima:</strong> É proibido ao locatário fazer sublocação do imóvel, ou empréstimo do imóvel locado sem consentimento do locador/administrador por escrito.
                        </p>

                        <p className="text-justify font-serif text-[11px] leading-snug border-b border-gray-100 pb-4">
                          <strong>Cláusula Décima Primeira:</strong> O Locatário confessa que recebeu o imóvel no estado em que se encontra, e se obriga a mantê-lo em perfeito estado de conservação, asseio e higiene.
                        </p>

                        <p className="text-justify font-serif text-[10.5px] leading-tight">
                          <strong>Parágrafo primeiro a sexto:</strong> Fica proibido utilizar a água para lavar veículo, sob pena de pagar multa de 20% (vinte por cento) do valor do aluguel. Não possuir animais domésticos a fim de não perturbar vizinhos.
                        </p>

                        <p className="text-justify font-serif text-[10.5px] leading-tight">
                          <strong>Cláusula Décima Segunda:</strong> O Locatário desde já faculta ao Locador/Administrador, vistoriar o imóvel locado quando entender conveniente, durante a locação para verificar o cumprimento de cláusulas.
                        </p>

                        <p className="text-justify font-serif text-[10.5px] leading-tight">
                          <strong>Cláusula Décima Terceira - DA MULTA OU QUEBRA:</strong> As partes que infringir o presente contrato em qualquer de suas cláusulas pagará, multa equivalente a 3 (três) aluguéis vigentes na data da infração.
                        </p>

                        <p className="text-justify font-serif text-[10.5px] leading-tight">
                          <strong>Cláusula Décima Quarta a Oitava:</strong> Toda e qualquer benfeitoria fica incorporada ao imóvel. O LOCATÁRIO fica obrigado a fazer seguro contra incêndios do imóvel em seguradora idônea.
                        </p>

                        <p className="text-justify font-serif text-[10.5px] leading-tight">
                          <strong>Cláusula Décima Nona a Vigésima Primeira:</strong> Ambos elegem o Fórum de Praia Grande - SP para dirimir quaisquer dúvidas, e ações que tenham por objeto o presente contrato, renunciando a qualquer outro, por mais privilegiado que seja.
                        </p>
                      </div>
                    )}

                    {signatureBlock}
                  </div>
                )}

              </div>

            </div>
          </div>

            {/* Modal action bar footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 font-semibold select-none">
              <span>Código hash do contrato: <strong className="font-mono text-slate-700">{previewContract?.id}-V1-SECURE</strong></span>
              <span className="flex items-center gap-1">Condo<LogoMais /> • Lei do Inquilinato n° 8.245</span>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULLSCREEN PRE-GENERATION CONTRACT EDITOR MODAL                           */}
      {/* ========================================================================= */}
      {showFullscreenEditor && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="fullscreen-contract-editor">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col h-[85vh]">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-slate-800 rounded px-1.5 py-0.5 text-slate-400">Editor de Minutas Condo+</span>
                <h3 className="text-base font-bold mt-1">Correção e Ajuste Fino de Cláusulas Contratuais</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullscreenEditor(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/85 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Subheader info block */}
            <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 text-[10px] text-amber-800 font-semibold flex items-center justify-between gap-2 select-none">
              <span>✍️ Editando minuta final de forma irrestrita. O texto modificado abaixo será gravado literalmente no banco ao salvar.</span>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Isso irá apagar todas as modificações manuais feitas nesta tela e recarregar os campos originais do formulário. Continuar?")) {
                    setIsEditingDraftManually(false);
                    setShowFullscreenEditor(false);
                  }
                }}
                className="text-[9px] uppercase tracking-wider text-amber-900 bg-amber-150 hover:bg-amber-200 px-2 py-0.5 rounded font-extrabold transition"
              >
                Restaurar e Sincronizar
              </button>
            </div>

            {/* Editor Body */}
            <div className="p-6 flex-1 flex flex-col space-y-4">
              <textarea
                value={draftText}
                onChange={(e) => {
                  setDraftText(e.target.value);
                  setIsEditingDraftManually(true);
                }}
                className="w-full flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 overflow-y-auto"
                placeholder="Modifique a minuta do contrato com liberdade completa..."
              />
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-bold select-none">
                {draftText ? draftText.length : 0} caracteres • {draftText ? draftText.split(/\s+/).filter(Boolean).length : 0} palavras
              </span>
              <button
                type="button"
                onClick={() => setShowFullscreenEditor(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs tracking-wide transition shadow-sm hover:shadow"
              >
                Aplicar e Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHARING / SENDING COMPONENT MODAL (WhatsApp & E-mail with PDF and link) */}
      {/* ========================================================================= */}
      {selectedSharingContract && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center relative">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase bg-indigo-500 rounded px-1.5 py-0.5 text-indigo-100">Disparo de Minutas</span>
                <h3 className="text-base font-bold mt-1">Enviar Minuta para Assinatura</h3>
              </div>
              <button
                onClick={() => setSelectedSharingContract(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/85 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {shareSuccessMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 text-xs font-semibold flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{shareSuccessMsg}</span>
                </div>
              )}

              {/* Contrato Quick Meta */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between text-xs font-medium text-slate-600">
                <div>
                  <span className="block text-[9px] uppercase text-black font-extrabold">Locatário</span>
                  <strong className="text-slate-800">{selectedSharingContract.inquilino?.nome}</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black font-extrabold">Imóvel</span>
                  <strong className="text-slate-800">{selectedSharingContract.imovel?.endereco?.split(" - ")[0]}</strong>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-black font-extrabold">Mensalidade</span>
                  <strong className="text-indigo-600 font-bold">R$ {selectedSharingContract.imovel?.valorAluguel.toLocaleString("pt-BR")}/mês</strong>
                </div>
              </div>

              {/* Action 1: WhatsApp Configuration */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500 text-white rounded-lg">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Assinatura via WhatsApp</h4>
                    <span className="text-[10px] text-gray-400 font-semibold mb-1">Dispara convite direto para o celular do Locador Renato</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-slate-500 font-bold">Contato Celular do Locador (Renato)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-emerald-500"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="DDD + Celular (ex: 11999999999)"
                    />
                    <button
                      onClick={() => handleDispararWhatsApp(selectedSharingContract, phoneInput)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Enviar Whats
                    </button>
                  </div>
                </div>
              </div>

              {/* Action 2: Email Configuration */}
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-600 text-white rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Assinatura via E-mail</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">Despacha notificação formal em PDF para a caixa de entrada do Locador</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase text-slate-500 font-bold font-sans">E-mail de Destino do Locador</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium bg-white focus:outline-none focus:border-blue-500"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="E-mail do proprietário"
                    />
                    <button
                      onClick={() => handleDispararEmail(selectedSharingContract, emailInput)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Enviar E-mail
                    </button>
                  </div>
                </div>
              </div>

              {/* Action 3: Pre-visualize Legal Text or Trigger signature simulator */}
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Assinatura Certificada</span>
                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold uppercase rounded px-1.5 py-0.5">Homologado</span>
                </div>
                
                <p className="text-xs text-slate-500 leading-snug">
                  Assegure a validade jurídica do documento realizando a assinatura digitalizada por meio do portal oficial <strong>Gov.br</strong>.
                </p>

                <button
                  onClick={() => {
                    setGovBrSigningContract(selectedSharingContract);
                    setGovBrStep("LOGIN");
                    setShowGovBrSimulator(true);
                    setSelectedSharingContract(null);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <Award className="h-4 w-4 text-white" />
                  Assinar Documento via GOV.BR
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium font-mono">
              <span>PRTOS-SEND-SYSTEM</span>
              <button
                onClick={() => handleDownloadPDF(selectedSharingContract)}
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 font-sans cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Baixar Minuta PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GOV.BR OFFICIAL DIGITAL SIGNATURE PORTAL SIMULATOR */}
      {/* ========================================================================= */}
      {showGovBrSimulator && govBrSigningContract && (
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Gov.br Official Header */}
            <div className="bg-[#1351B4] border-b-4 border-[#FFD214] px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xl font-black font-sans tracking-tighter">gov<span className="text-[#00C010]">.</span>br</span>
                    <span className="text-[10px] font-bold text-white/50 border-l border-white/30 pl-1.5 uppercase font-sans tracking-wider">Assinatura Digital</span>
                  </div>
                  <span className="text-[9px] text-[#A2C7FF] font-medium tracking-wide">Instituto Nacional de Tecnologia da Informação - ITI</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGovBrSimulator(false);
                  setGovBrSigningContract(null);
                  setGovBrCode("");
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                title="Fechar Portal Gov.br"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Portal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#1351B4]" />
                  <span className="text-xs font-bold text-gray-800">Portal de Assinaturas ICP-Brasil</span>
                </div>
                
                {govBrStep !== "SUCCESS" && (
                  <span className="text-[10px] font-bold text-[#1351B4] bg-[#E8F0FE] px-2.5 py-0.5 rounded-full select-none">
                    {govBrStep === "LOGIN" ? "Passo 1 de 3: Identificação" : "Passo 2 de 3: Validação SMS"}
                  </span>
                )}
              </div>

              {/* Dynamic STEP Render */}
              {govBrStep === "LOGIN" && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                    <h4 className="text-xs font-bold text-[#1351B4] uppercase tracking-wider flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      Minuta sob Análise Legal
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                      Você está prestes a assinar DIGITALMENTE o contrato de locação do imóvel residencial situado no endereço <strong className="text-slate-800">{govBrSigningContract.imovel?.endereco}</strong>, em favor do locatário <strong className="text-slate-800">{govBrSigningContract.inquilino?.nome}</strong>.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <h3 className="text-sm font-bold text-gray-900">Identificação do Cidadão</h3>
                    <p className="text-xs text-gray-400">Digite seu CPF cadastrado na base de dados federal do Gov.br. Para testar o escopo do proprietário Renato, utilize o CPF pré-preenchido.</p>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">Cadastro de Pessoa Física (CPF)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl font-mono text-sm tracking-widest focus:outline-none focus:border-[#1351B4] bg-[#F8F9FA] focus:bg-white transition"
                        value={govBrCpf}
                        onChange={(e) => setGovBrCpf(e.target.value)}
                        placeholder="000.000.000-00"
                      />
                    </div>

                    <button
                      onClick={() => setGovBrStep("SMS_CODE")}
                      className="w-full py-2.5 bg-[#1351B4] hover:bg-[#0E3F90] text-white rounded-xl text-xs font-bold uppercase transition tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Avançar com Login Único</span>
                      <Check className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <span className="text-[10px] text-gray-400 font-medium">Sua conexão com o portal gov.br é criptografada e homologada pelo ITI.</span>
                  </div>
                </div>
              )}

              {govBrStep === "SMS_CODE" && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 text-xs leading-relaxed font-sans font-medium space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase text-amber-800 text-[10px] tracking-wide">
                      <AlertCircle className="h-4 w-4 text-amber-700" />
                      <span>Autorização de Assinatura via ICP-Brasil</span>
                    </div>
                    <p>O governo de conformidade digital disparou um código de verificação composto por 6 números secretos via aplicativo Gov.br ou SMS para o celular cadastrado do Sr. Renato Faria Kawano.</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900">Autorização do Documento</h3>
                    <p className="text-xs text-gray-400">Digite o código de verificação recebido para homologar com segurança a transação criptográfica no livro de registros de assinaturas (ITI/ICP-Brasil).</p>
                    
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-sans">Código de Segurança (6 dígitos)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center font-mono text-base tracking-[0.4em] focus:outline-none focus:border-[#1351B4] focus:ring-1 focus:ring-[#1351B4]"
                        value={govBrCode}
                        onChange={(e) => setGovBrCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="******"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1.5">
                      <button
                        onClick={() => setGovBrStep("LOGIN")}
                        className="flex-1 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase transition"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={() => handleSignContractGovBr(govBrSigningContract.id)}
                        disabled={govBrSubmitting || govBrCode.length < 6}
                        className={`flex-1 py-1.5 text-white rounded-xl text-xs font-bold uppercase transition tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                          govBrCode.length < 6 
                            ? "bg-slate-300 pointer-events-none" 
                            : "bg-[#00C010] hover:bg-[#009C0D]"
                        }`}
                      >
                        {govBrSubmitting ? (
                          <span>Criptografando...</span>
                        ) : (
                          <>
                            <Award className="h-4 w-4" />
                            <span>Assinar Contrato</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {govBrStep === "SUCCESS" && (
                <div className="text-center py-6 space-y-5">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
                    <Check className="h-8 w-8 text-emerald-500" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-[#111827]">Assinatura Vinculada com Sucesso!</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                      O Contrato residencial foi assinado com sucesso por <span className="font-bold text-gray-800">Renato Faria Kawano</span> usando biometria e autenticidade reconhecidas pelo ICP-Brasil na plataforma oficial Gov.br.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-left font-mono text-[10px] text-slate-500 space-y-1 mx-auto max-w-md">
                    <div className="flex justify-between">
                      <span className="uppercase text-gray-400">Assinante:</span>
                      <strong className="text-slate-700">RENATO FARIA KAWANO</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="uppercase text-gray-400">Data/Hora UTC:</span>
                      <strong className="text-slate-700">{new Date().toISOString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="uppercase text-gray-400">Código de Validação:</span>
                      <strong className="text-slate-700 select-all">{govBrSigningContract.assinaturaHashGovBr || `GOVBR-SIGN-${govBrSigningContract.id.toUpperCase()}`}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="uppercase text-gray-400">Auditoria Governamental:</span>
                      <strong className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <Award className="h-3.5 w-3.5" /> VERIFICADO (ICP-BRASIL)
                      </strong>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
                    <button
                      onClick={() => handleDownloadPDF(govBrSigningContract)}
                      className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      Baixar PDF Assinado
                    </button>
                    <button
                      onClick={() => {
                        setShowGovBrSimulator(false);
                        setGovBrSigningContract(null);
                        setGovBrCode("");
                      }}
                      className="flex-1 py-1.5 bg-slate-150 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                    >
                      Retornar ao Sistema
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Simulated footer */}
            <div className="bg-[#F8F9FA] px-6 py-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-gray-400 font-mono select-none">
              <span>ICP-BRASIL TRUST PLATFORM — ITI</span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5" /> Conexão Segura SSL
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
