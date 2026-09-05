import React, { useState, useEffect } from "react";
import { Smartphone, Download, X, Share, Plus, MoreVertical, Compass, Check } from "lucide-react";

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstallPwaModal({ isOpen, onClose }: InstallPwaModalProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
      setPlatform("ios");
    } else if (/android/.test(ua)) {
      setPlatform("android");
    } else {
      setPlatform("other");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in" id="install-pwa-modal">
      {/* Container */}
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-none border border-gray-150 animate-in slide-in-from-bottom duration-300">
        
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100 shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight uppercase">Instalar no Celular</h3>
              <p className="text-[10px] text-gray-500 font-bold tracking-wider">WEB APP SEM LOJA (PWA)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-full transition cursor-pointer"
            id="close-install-pwa-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-96">
          
          {/* App Icon Demo Card */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-200">
            <div className="relative shrink-0">
              <img 
                src="https://img.icons8.com/color/512/real-estate.png" 
                alt="Condo+" 
                className="h-14 w-14 rounded-2xl shadow-md border border-white"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full p-1 border border-white shadow-sm">
                <Check className="h-2.5 w-2.5 stroke-[4px]" />
              </span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 leading-none mb-1">
                Condo+ <span className="text-[9px] bg-indigo-100 text-indigo-700 font-extrabold px-1 py-0.5 rounded leading-none">PWA</span>
              </h4>
              <p className="text-[10px] text-gray-500 font-medium leading-normal mb-1">
                Oculte a barra do navegador e tenha uma experiência de aplicativo de celular rápida e fluida.
              </p>
              <div className="flex gap-2 text-[9px] font-bold text-gray-400">
                <span>✦ Sem baixar da Google Play/App Store</span>
              </div>
            </div>
          </div>

          {/* Installer Tab Choices */}
          <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl text-[11px] font-bold uppercase text-center text-gray-500">
            <button 
              type="button"
              onClick={() => setPlatform("ios")}
              className={`py-1.5 rounded-lg transition cursor-pointer ${platform === "ios" ? "bg-white text-indigo-700 shadow-2xs font-extrabold" : "hover:text-gray-800"}`}
            >
              iPhone (iOS)
            </button>
            <button 
              type="button"
              onClick={() => setPlatform("android")}
              className={`py-1.5 rounded-lg transition cursor-pointer ${platform === "android" ? "bg-white text-indigo-700 shadow-2xs font-extrabold" : "hover:text-gray-800"}`}
            >
              Android
            </button>
            <button 
              type="button"
              onClick={() => setPlatform("other")}
              className={`py-1.5 rounded-lg transition cursor-pointer ${platform === "other" ? "bg-white text-indigo-700 shadow-2xs font-extrabold" : "hover:text-gray-800"}`}
            >
              Desktop
            </button>
          </div>

          {/* iOS Safari Instructions */}
          {platform === "ios" && (
            <div className="space-y-4 animate-fade-in text-xs text-gray-700">
              <p className="font-medium text-[11.5px] text-gray-500 leading-normal">
                No iOS, o atalho de aplicativo é adicionado rapidamente através do navegador <strong>Safari</strong> de forma integrada:
              </p>
              <div className="space-y-3.5">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Abra o painel de Compartilhamento</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                      Toque no botão de compartilhar <Share className="h-4 w-4 text-indigo-600 shrink-0 inline-block bg-indigo-50 p-0.5 rounded" /> na barra inferior do Safari.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Adicione à Tela de Início</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1 flex-wrap">
                      Role o menu de opções para baixo e clique em <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-bold inline-flex items-center gap-1.5">Adicionar à Tela de Início <Plus className="h-3.5 w-3.5 bg-white p-0.5 border rounded shrink-0 text-gray-700" /></span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">Pronto!</p>
                    <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
                      Confirme no topo direito ("Adicionar") para salvar o ícone definitivo do aplicativo na sua tela de apps.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Android Chrome Instructions */}
          {platform === "android" && (
            <div className="space-y-4 animate-fade-in text-xs text-gray-700">
              <p className="font-medium text-[11.5px] text-gray-500 leading-normal">
                No Android, você instala o aplicativo instantaneamente no Google Chrome ou navegadores compatíveis:
              </p>
              <div className="space-y-3.5">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Acesse o menu do Navegador</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                      Toque no menu de três pontinhos <MoreVertical className="h-4 w-4 text-indigo-600 inline-block bg-indigo-50 p-0.5 rounded shrink-0" /> no topo direito do Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Toque em Instalar ou Adicionar</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5 flex items-center gap-1 flex-wrap">
                      Selecione <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-bold inline-flex items-center gap-1">Instalar Aplicativo</span> ou <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-bold inline-flex items-center gap-1">Adicionar à tela de início</span>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800">Conclua a Configuração</p>
                    <p className="text-[11px] text-emerald-600/80 font-medium mt-0.5">
                      Confirme a caixa de diálogo para fixar Condo+ na sua bandeja de aplicativos nativos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Desktop/Other Instructions */}
          {platform === "other" && (
            <div className="space-y-4 animate-fade-in text-xs text-gray-700">
              <p className="font-medium text-[11.5px] text-gray-500 leading-normal">
                Você sabia que o Condo+ também funciona como um aplicativo de computador independente no Chrome / Edge?
              </p>
              <div className="space-y-3.5">
                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Olhe para a Barra de Endereços</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Clique no ícone de monitor com seta ou no símbolo de "+" na barra de endereços do Chrome na parte extrema direita.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Confirme a Instalação</p>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Clique em "Instalar" para abrir uma janela nativa isolada e criar um atalho no seu desktop de computador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 bg-gray-50/50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-center text-xs font-black shadow-sm tracking-wide transition cursor-pointer"
          >
            Entendi, OK!
          </button>
        </div>

      </div>
    </div>
  );
}
