import React, { useState } from "react";
import {
  Globe, Users, TrendingUp, DollarSign, Package, Star, BarChart2,
  FileText, Settings, Bell, ArrowUpRight, ArrowDownRight, Target,
  CheckCircle, Clock, Zap, Shield, Download, RefreshCw, ChevronRight,
  Building2, Map, Award, Activity, AlertTriangle, Mail, Phone
} from "lucide-react";

interface DistributorPortalProps {
  companies: any[];
  technicians: any[];
  tickets: any[];
  transactions: any[];
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

const DISTRIBUTOR_CLIENTS = [
  { name: "TeleSP Fibra", region: "Grande São Paulo", plan: "Enterprise", mrr: 1497, status: "Ativo", health: 88, tickets: 42 },
  { name: "SolarNordeste Ltda", region: "Nordeste", plan: "Business", mrr: 697, status: "Ativo", health: 74, tickets: 18 },
  { name: "EletroSul Facilities", region: "Sul", plan: "Business", mrr: 697, status: "Trial", health: 61, tickets: 9 },
  { name: "NetRio ISP", region: "Rio de Janeiro", plan: "Enterprise", mrr: 1497, status: "Ativo", health: 92, tickets: 67 },
  { name: "ClimaCentro HVAC", region: "Centro-Oeste", plan: "Starter", mrr: 297, status: "Ativo", health: 55, tickets: 11 },
  { name: "SecurityNorte Ltda", region: "Norte", plan: "Business", mrr: 697, status: "Inativo", health: 32, tickets: 3 },
];

export default function DistributorPortal({ companies, technicians, tickets, transactions }: DistributorPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "clients" | "commissions" | "onboarding" | "support">("overview");
  const [period, setPeriod] = useState("30d");

  const totalMrr = DISTRIBUTOR_CLIENTS.reduce((s, c) => s + c.mrr, 0);
  const activeClients = DISTRIBUTOR_CLIENTS.filter(c => c.status === "Ativo").length;
  const trialClients = DISTRIBUTOR_CLIENTS.filter(c => c.status === "Trial").length;
  const commissionRate = 0.20; // 20% commission
  const monthlyCommission = totalMrr * commissionRate;

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: BarChart2 },
    { id: "clients", label: "Clientes", icon: Building2 },
    { id: "commissions", label: "Comissões", icon: DollarSign },
    { id: "onboarding", label: "Onboarding", icon: Zap },
    { id: "support", label: "Suporte", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Globe className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest">Portal do Distribuidor</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Painel de Distribuição</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie seus clientes e comissões em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {["7d", "30d", "90d"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period === p ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"}`}>
                {p}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all">
            <Download className="h-3.5 w-3.5" /> Relatório
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
            <KPICard title="MRR Gerenciado" value={`R$ ${totalMrr.toLocaleString("pt-BR")}`} sub="Receita recorrente total" trend="+18%" trendUp icon={TrendingUp} color="purple" />
            <KPICard title="Comissão do Mês" value={`R$ ${monthlyCommission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="20% sobre MRR" trend="+18%" trendUp icon={DollarSign} color="emerald" />
            <KPICard title="Clientes Ativos" value={activeClients} sub={`${trialClients} em trial`} icon={Building2} color="cyan" />
            <KPICard title="Health Score Médio" value="72/100" sub="Saúde dos clientes" trend="+4pts" trendUp icon={Activity} color="yellow" />
          </div>

          {/* Client distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Distribuição por Plano</h3>
              <div className="space-y-3">
                {[
                  { plan: "Enterprise", count: DISTRIBUTOR_CLIENTS.filter(c => c.plan === "Enterprise").length, color: "bg-indigo-500", mrr: 2994 },
                  { plan: "Business", count: DISTRIBUTOR_CLIENTS.filter(c => c.plan === "Business").length, color: "bg-cyan-500", mrr: 2091 },
                  { plan: "Starter", count: DISTRIBUTOR_CLIENTS.filter(c => c.plan === "Starter").length, color: "bg-slate-500", mrr: 297 },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-20 shrink-0">{row.plan}</span>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${row.color} rounded-full`} style={{ width: `${(row.count / DISTRIBUTOR_CLIENTS.length) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white w-6 text-right">{row.count}</span>
                    <span className="text-xs font-mono text-slate-400 w-20 text-right">R$ {row.mrr.toLocaleString("pt-BR")}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4">Evolução de Receita</h3>
              <div className="flex items-end gap-1.5 h-20">
                {[32, 38, 42, 45, 48, 52, 55, 58, 61, 65, 72, 75].map((v, i) => (
                  <div key={i} className="flex-1">
                    <div className="w-full rounded-t-sm bg-gradient-to-t from-purple-600 to-purple-400 transition-all"
                      style={{ height: `${(v / 75) * 100}%`, minHeight: "4px" }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-600 mt-2">
                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(m => <span key={m}>{m}</span>)}
              </div>
            </div>
          </div>

          {/* Risk alerts */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-400" /> Clientes em Risco
            </h3>
            <div className="space-y-3">
              {DISTRIBUTOR_CLIENTS.filter(c => c.health < 65).map((client, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white">{client.name}</div>
                    <div className="text-[10px] text-slate-500">{client.region} · {client.plan}</div>
                  </div>
                  <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${client.health < 50 ? "bg-red-500" : "bg-yellow-500"} rounded-full`}
                      style={{ width: `${client.health}%` }} />
                  </div>
                  <span className={`text-xs font-bold w-10 text-right ${client.health < 50 ? "text-red-400" : "text-yellow-400"}`}>{client.health}</span>
                  <button className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-400 font-semibold hover:bg-purple-500/30 transition-all shrink-0">
                    Acionar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div className="space-y-4">
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Carteira de Clientes</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {DISTRIBUTOR_CLIENTS.map((client, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{client.name}</div>
                    <div className="text-xs text-slate-500">{client.region} · {client.tickets} chamados/mês</div>
                  </div>
                  <div className="text-right hidden md:block shrink-0">
                    <div className="text-xs font-bold text-white">{client.plan}</div>
                    <div className="text-xs font-mono text-emerald-400">R$ {client.mrr.toLocaleString("pt-BR")}/mês</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${client.health >= 75 ? "bg-emerald-500" : client.health >= 55 ? "bg-yellow-500" : "bg-red-500"} rounded-full`}
                        style={{ width: `${client.health}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-6">{client.health}</span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${
                    client.status === "Ativo" ? "text-emerald-400 bg-emerald-500/10" :
                    client.status === "Trial" ? "text-yellow-400 bg-yellow-500/10" :
                    "text-red-400 bg-red-500/10"
                  }`}>{client.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* COMMISSIONS */}
      {activeTab === "commissions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Comissão do Mês" value={`R$ ${monthlyCommission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="20% sobre MRR" trend="+18%" trendUp icon={DollarSign} color="emerald" />
            <KPICard title="Comissão Anual" value={`R$ ${(monthlyCommission * 12).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`} sub="Projeção anual" icon={TrendingUp} color="cyan" />
            <KPICard title="Clientes Pagantes" value={activeClients} sub="Gerando comissão" icon={Building2} color="purple" />
            <KPICard title="Ticket Médio" value={`R$ ${Math.round(totalMrr / DISTRIBUTOR_CLIENTS.length).toLocaleString("pt-BR")}`} sub="Por cliente/mês" icon={BarChart2} color="yellow" />
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Detalhamento por Cliente</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {DISTRIBUTOR_CLIENTS.filter(c => c.status === "Ativo").map((client, i) => {
                const commission = Math.round(client.mrr * commissionRate);
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white">{client.name}</div>
                      <div className="text-xs text-slate-500">{client.plan} · {client.region}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-slate-400">MRR: R$ {client.mrr.toLocaleString("pt-BR")}</div>
                      <div className="text-sm font-bold text-emerald-400">Comissão: R$ {commission.toLocaleString("pt-BR")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-5 border-t border-slate-800 bg-slate-900/30">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">Total do Mês</span>
                <span className="text-lg font-bold text-emerald-400">R$ {monthlyCommission.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING */}
      {activeTab === "onboarding" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { client: "EletroSul Facilities", step: "Configuração Inicial", pct: 35, status: "Em andamento" },
              { client: "Novo Cliente SP", step: "Cadastro CNPJ", pct: 15, status: "Aguardando" },
            ].map((onb, i) => (
              <div key={i} className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <div className="text-sm font-bold text-white">{onb.client}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{onb.step}</div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${onb.pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{onb.pct}% completo</span>
                  <span className="text-purple-400 font-semibold">{onb.status}</span>
                </div>
              </div>
            ))}

            <div className="bg-[#0b0e17] border border-dashed border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-500/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Zap className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-sm font-semibold text-white text-center">Iniciar Novo Onboarding</div>
              <div className="text-xs text-slate-500 text-center">Cadastre um novo cliente e acompanhe a implantação</div>
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Checklist de Onboarding</h3>
            <div className="space-y-2">
              {[
                { step: "Cadastro e validação de CNPJ", done: true },
                { step: "Criação do administrador", done: true },
                { step: "Seleção e configuração do plano", done: true },
                { step: "Configuração de técnicos iniciais", done: false },
                { step: "Configuração de regiões e filiais", done: false },
                { step: "Treinamento do administrador", done: false },
                { step: "Treinamento dos gestores", done: false },
                { step: "Primeiro chamado de teste", done: false },
                { step: "Go-live validado", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/40 transition-all">
                  <CheckCircle className={`h-4 w-4 shrink-0 ${item.done ? "text-emerald-400" : "text-slate-700"}`} />
                  <span className={`text-sm ${item.done ? "text-slate-300 line-through" : "text-white"}`}>{item.step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT */}
      {activeTab === "support" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Contato Nexora</h3>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: "WhatsApp Parceiros", value: "+55 (11) 9 9999-0000", color: "emerald" },
                  { icon: Mail, label: "E-mail Parceiros", value: "parceiros@nexorafield.com.br", color: "cyan" },
                  { icon: Globe, label: "Portal de Parceiros", value: "parceiros.nexorafield.com.br", color: "indigo" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl">
                      <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center`}>
                        <Icon className={`h-4 w-4 text-${item.color}-400`} />
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">{item.label}</div>
                        <div className="text-xs font-semibold text-white">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Recursos do Distribuidor</h3>
              <div className="space-y-2">
                {[
                  "Kit de Apresentação Comercial",
                  "Guia de Onboarding para Clientes",
                  "Tabela de Comissões Atualizada",
                  "Materiais de Marketing",
                  "Templates de Contrato",
                  "FAQ para Distribuidores",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-900/40 cursor-pointer transition-all">
                    <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                    <span className="text-sm text-white flex-1">{item}</span>
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
