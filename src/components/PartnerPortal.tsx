import React, { useState } from "react";
import {
  Handshake, TrendingUp, DollarSign, Users, Star, Award, BarChart2,
  FileText, Settings, Globe, ArrowUpRight, ArrowDownRight, Target,
  CheckCircle, Zap, Shield, Download, Link, Copy, Share2, ChevronRight,
  Building2, Map, Bell, MessageSquare, Lightbulb, Gift, Activity, Mail
} from "lucide-react";

interface PartnerPortalProps {
  companies: any[];
  technicians: any[];
}

function KPICard({ title, value, sub, trend, trendUp, color = "cyan", icon: Icon }: any) {
  return (
    <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <div className={`w-8 h-8 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center`}>
          <Icon className={`h-4 w-4 text-${color}-400`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold font-display text-white">{value}</div>
          {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
            {trendUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}

const PARTNER_REFERRALS = [
  { company: "TeleRede Fibra SP", date: "15/06/2026", plan: "Business", status: "Convertido", commission: 697 * 0.15 },
  { company: "SolarMinas Ltda", date: "22/06/2026", plan: "Enterprise", status: "Trial", commission: 0 },
  { company: "NetCuritiba ISP", date: "01/06/2026", plan: "Business", status: "Convertido", commission: 697 * 0.15 },
  { company: "EletroNorte Facilities", date: "10/06/2026", plan: "Starter", status: "Convertido", commission: 297 * 0.15 },
  { company: "ClimaRio HVAC", date: "25/06/2026", plan: "Enterprise", status: "Negociação", commission: 0 },
];

const TIERS = [
  { name: "Bronze", min: 0, max: 4, rate: "10%", color: "orange", badge: "🥉" },
  { name: "Silver", min: 5, max: 14, rate: "15%", color: "slate", badge: "🥈" },
  { name: "Gold", min: 15, max: 29, rate: "20%", color: "yellow", badge: "🥇" },
  { name: "Platinum", min: 30, max: Infinity, rate: "25%", color: "indigo", badge: "💎" },
];

export default function PartnerPortal({ companies, technicians }: PartnerPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "referrals" | "commissions" | "materials" | "settings">("overview");
  const [copied, setCopied] = useState(false);
  const referralLink = "https://nexorafield.com.br/ref/PARTNER2026";

  const convertedReferrals = PARTNER_REFERRALS.filter(r => r.status === "Convertido");
  const totalCommissions = convertedReferrals.reduce((s, r) => s + r.commission, 0);
  const currentTier = TIERS[1]; // Silver

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: BarChart2 },
    { id: "referrals", label: "Indicações", icon: Share2 },
    { id: "commissions", label: "Comissões", icon: DollarSign },
    { id: "materials", label: "Materiais", icon: FileText },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Handshake className="h-4 w-4 text-yellow-400" />
            </div>
            <span className="text-xs font-mono text-yellow-400 uppercase tracking-widest">Portal do Parceiro</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Programa de Parceria</h1>
          <p className="text-xs text-slate-500 mt-0.5">Indique clientes · Ganhe comissões recorrentes · Cresça com a NexoraField</p>
        </div>
        {/* Tier badge */}
        <div className="flex items-center gap-3 bg-[#0b0e17] border border-yellow-500/30 rounded-2xl px-4 py-3">
          <span className="text-2xl">{currentTier.badge}</span>
          <div>
            <div className="text-sm font-bold text-white">Parceiro {currentTier.name}</div>
            <div className="text-xs text-slate-500">Comissão de {currentTier.rate} sobre MRR</div>
          </div>
        </div>
      </div>

      {/* Referral link */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white mb-1">Seu link de indicação</div>
          <div className="font-mono text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 truncate">
            {referralLink}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-yellow-500/30 text-yellow-400 text-xs font-semibold hover:bg-yellow-500/10 transition-all">
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Copiado!" : "Copiar"}
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold transition-all">
            <Share2 className="h-3.5 w-3.5" /> Compartilhar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-1 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id ? "bg-slate-700 text-white shadow" : "text-slate-500 hover:text-white"
              }`}>
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Indicações Totais" value={PARTNER_REFERRALS.length} sub="Clientes indicados" trend="+3" trendUp icon={Share2} color="yellow" />
            <KPICard title="Convertidos" value={convertedReferrals.length} sub="Clientes ativos" trend="+1" trendUp icon={CheckCircle} color="emerald" />
            <KPICard title="Comissão Acumulada" value={`R$ ${totalCommissions.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="Total recebido" trend="+R$ 315" trendUp icon={DollarSign} color="cyan" />
            <KPICard title="Tx. Conversão" value="60%" sub="Indicações → Clientes" trend="+10%" trendUp icon={Target} color="indigo" />
          </div>

          {/* Tier progression */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-400" /> Progressão de Nível
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TIERS.map((tier, i) => (
                <div key={i} className={`p-4 rounded-2xl border text-center space-y-2 ${
                  tier.name === currentTier.name
                    ? "border-yellow-500/40 bg-yellow-500/10"
                    : "border-slate-800 bg-slate-900/40"
                }`}>
                  <div className="text-2xl">{tier.badge}</div>
                  <div className={`text-sm font-bold ${tier.name === currentTier.name ? "text-yellow-400" : "text-slate-400"}`}>{tier.name}</div>
                  <div className="text-xs text-slate-500">
                    {tier.max === Infinity ? `+${tier.min} clientes` : `${tier.min}–${tier.max} clientes`}
                  </div>
                  <div className={`text-lg font-bold font-display ${tier.name === currentTier.name ? "text-white" : "text-slate-600"}`}>{tier.rate}</div>
                  {tier.name === currentTier.name && (
                    <div className="text-[9px] bg-yellow-500/20 text-yellow-400 rounded-full px-2 py-0.5 font-semibold">SEU NÍVEL</div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-400 rounded-full" style={{ width: "60%" }} />
              </div>
              <span className="text-xs text-slate-400 shrink-0">3 indicações para Gold</span>
            </div>
          </div>

          {/* Recent activity */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Atividade Recente</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {PARTNER_REFERRALS.slice(0, 3).map((ref, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {ref.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{ref.company}</div>
                    <div className="text-xs text-slate-500">{ref.plan} · {ref.date}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    ref.status === "Convertido" ? "text-emerald-400 bg-emerald-500/10" :
                    ref.status === "Trial" ? "text-yellow-400 bg-yellow-500/10" :
                    "text-blue-400 bg-blue-500/10"
                  }`}>{ref.status}</span>
                  {ref.commission > 0 && (
                    <span className="text-xs font-bold text-emerald-400 shrink-0">+R$ {ref.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REFERRALS */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Todas as Indicações</h3>
              <button className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300">
                <Gift className="h-3.5 w-3.5" /> Nova Indicação
              </button>
            </div>
            <div className="divide-y divide-slate-800">
              {PARTNER_REFERRALS.map((ref, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {ref.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{ref.company}</div>
                    <div className="text-xs text-slate-500">{ref.plan} · Indicado em {ref.date}</div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    ref.status === "Convertido" ? "text-emerald-400 bg-emerald-500/10" :
                    ref.status === "Trial" ? "text-yellow-400 bg-yellow-500/10" :
                    "text-blue-400 bg-blue-500/10"
                  }`}>{ref.status}</span>
                  <span className="text-xs font-bold text-right shrink-0 w-20">
                    {ref.commission > 0 ? <span className="text-emerald-400">+R$ {ref.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês</span> : <span className="text-slate-600">Pendente</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMMISSIONS */}
      {activeTab === "commissions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard title="Comissão do Mês" value={`R$ ${totalCommissions.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="Já creditado" trend="+15%" trendUp icon={DollarSign} color="emerald" />
            <KPICard title="Comissão Anual" value={`R$ ${(totalCommissions * 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="Projeção anual" icon={TrendingUp} color="cyan" />
            <KPICard title="Taxa Atual" value={currentTier.rate} sub={`Nível ${currentTier.name}`} icon={Award} color="yellow" />
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Extrato de Comissões</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {convertedReferrals.map((ref, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{ref.company}</div>
                    <div className="text-xs text-slate-500">{ref.plan} · {ref.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-emerald-400">+R$ {ref.commission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}/mês</div>
                    <div className="text-[10px] text-slate-500">Recorrente</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 bg-slate-900/30 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total Mensal</span>
                <span className="text-lg font-bold text-emerald-400">R$ {totalCommissions.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Pago via PIX todo dia 15 do mês seguinte</p>
            </div>
          </div>
        </div>
      )}

      {/* MATERIALS */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Apresentação Comercial", desc: "Slides para apresentar a NexoraField a clientes potenciais", type: "PPT", icon: "📊" },
              { title: "Proposta Comercial Template", desc: "Template editável de proposta para clientes", type: "DOCX", icon: "📝" },
              { title: "Catálogo de Produtos", desc: "Descrição completa de planos e funcionalidades", type: "PDF", icon: "📋" },
              { title: "Kit de Imagens e Logos", desc: "Assets visuais da NexoraField para suas apresentações", type: "ZIP", icon: "🎨" },
              { title: "Vídeo Institucional", desc: "Vídeo de apresentação da plataforma em 2 minutos", type: "MP4", icon: "🎬" },
              { title: "FAQ para Vendas", desc: "Respostas prontas para as objeções mais comuns", type: "PDF", icon: "❓" },
              { title: "Cases de Sucesso", desc: "Histórias de empresas que adotaram a NexoraField", type: "PDF", icon: "🏆" },
              { title: "ROI Calculator", desc: "Planilha para calcular ROI junto ao cliente", type: "XLSX", icon: "💰" },
              { title: "Treinamento de Vendas", desc: "Curso completo de como vender NexoraField", type: "Curso", icon: "🎓" },
            ].map((mat, i) => (
              <div key={i} className="bg-[#0b0e17] border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5">
                <div className="text-2xl shrink-0">{mat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{mat.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{mat.desc}</div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">{mat.type}</div>
                </div>
                <Download className="h-4 w-4 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Dados do Parceiro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Nome / Empresa", value: "Agência Digital SP" },
                { label: "E-mail", value: "contato@agenciasp.com.br" },
                { label: "Telefone", value: "(11) 9 9999-8888" },
                { label: "Nível de Parceria", value: "Silver" },
                { label: "Código de Referência", value: "PARTNER2026" },
                { label: "Conta PIX para Comissão", value: "11.999.888/0001-00" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono">{field.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Notificações</h3>
            {[
              { label: "Nova conversão de indicação", desc: "Alerta quando um cliente indicado converter" },
              { label: "Comissão creditada", desc: "Confirmação de pagamento de comissão" },
              { label: "Atualização de nível", desc: "Quando subir de nível no programa" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm text-white font-semibold">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.desc}</div>
                </div>
                <div className="w-10 h-6 bg-yellow-600 rounded-full cursor-pointer relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
