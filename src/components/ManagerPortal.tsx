import React, { useState } from "react";
import {
  BarChart2, Users, Clock, CheckCircle, AlertTriangle, TrendingUp,
  Map, Activity, Settings, Bell, FileText, Zap, Star, ArrowUpRight,
  ArrowDownRight, Filter, Search, ChevronDown, RefreshCw, Target,
  Calendar, Download, Shield, Eye, Edit2, MoreVertical, XCircle
} from "lucide-react";

interface ManagerPortalProps {
  companies: any[];
  technicians: any[];
  tickets: any[];
  transactions: any[];
  auditLogs: any[];
  onUpdateTicketStatus: (id: string, status: any) => void;
  onReassignTech: (ticketId: string, techId: string) => void;
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

const STATUS_COLORS: Record<string, string> = {
  Finalizado: "text-emerald-400 bg-emerald-500/10",
  Em_Execucao: "text-blue-400 bg-blue-500/10",
  A_Caminho: "text-cyan-400 bg-cyan-500/10",
  Aprovado: "text-indigo-400 bg-indigo-500/10",
  Aberto: "text-yellow-400 bg-yellow-500/10",
  Cancelado: "text-red-400 bg-red-500/10",
  Aguardando_Aprovacao: "text-orange-400 bg-orange-500/10",
  IA_Processando: "text-purple-400 bg-purple-500/10",
};

export default function ManagerPortal({
  companies, technicians, tickets, transactions, auditLogs,
  onUpdateTicketStatus, onReassignTech
}: ManagerPortalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "tickets" | "technicians" | "regions" | "alerts" | "reports">("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const openTickets = tickets.filter(t => !["Finalizado", "Cancelado"].includes(t.status));
  const completedTickets = tickets.filter(t => t.status === "Finalizado");
  const onlineTechs = technicians.filter(t => t.status === "online");
  const avgRating = technicians.length > 0
    ? (technicians.reduce((s, t) => s + (t.rating || 5), 0) / technicians.length).toFixed(1)
    : "5.0";

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchTerm ||
      t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const TABS = [
    { id: "overview", label: "Visão Geral", icon: BarChart2 },
    { id: "tickets", label: "Chamados", icon: FileText },
    { id: "technicians", label: "Técnicos", icon: Users },
    { id: "regions", label: "Regiões", icon: Map },
    { id: "alerts", label: "Alertas", icon: Bell },
    { id: "reports", label: "Relatórios", icon: Download },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <BarChart2 className="h-4 w-4 text-orange-400" />
            </div>
            <span className="text-xs font-mono text-orange-400 uppercase tracking-widest">Portal do Gestor</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">Central de Operações</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gerencie sua equipe, chamados e KPIs em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs transition-all">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
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
            <KPICard title="Chamados Abertos" value={openTickets.length} sub="Aguardando execução" trend="+3" trendUp={false} icon={FileText} color="yellow" />
            <KPICard title="Concluídos Hoje" value={completedTickets.length} sub="Chamados finalizados" trend="+8%" trendUp icon={CheckCircle} color="emerald" />
            <KPICard title="Técnicos Online" value={`${onlineTechs.length}/${technicians.length}`} sub="Disponíveis agora" icon={Users} color="cyan" />
            <KPICard title="Avaliação Média" value={avgRating} sub="Rating da equipe" trend="+0.2" trendUp icon={Star} color="yellow" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ticket status distribution */}
            <div className="md:col-span-2 bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-400" /> Status dos Chamados
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Em Execução", status: "Em_Execucao", color: "bg-blue-500" },
                  { label: "A Caminho", status: "A_Caminho", color: "bg-cyan-500" },
                  { label: "Aprovados", status: "Aprovado", color: "bg-indigo-500" },
                  { label: "Aguardando Aprovação", status: "Aguardando_Aprovacao", color: "bg-orange-500" },
                  { label: "Finalizados", status: "Finalizado", color: "bg-emerald-500" },
                ].map(row => {
                  const count = tickets.filter(t => t.status === row.status).length;
                  const pct = tickets.length > 0 ? (count / tickets.length) * 100 : 0;
                  return (
                    <div key={row.status} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-40 shrink-0">{row.label}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${row.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-white w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Alertas Operacionais
              </h3>
              <div className="space-y-2.5">
                {[
                  { type: "warn", msg: "2 chamados sem resposta há +2h" },
                  { type: "error", msg: "Técnico offline sem justificativa" },
                  { type: "info", msg: "SLA de 3 chamados próximo do limite" },
                  { type: "success", msg: "Meta de chamados do dia atingida" },
                  { type: "warn", msg: "Região Sul com baixa cobertura" },
                ].map((a, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2.5 rounded-xl text-xs ${
                    a.type === "error" ? "bg-red-500/10 border border-red-500/20 text-red-400" :
                    a.type === "warn" ? "bg-yellow-500/10 border border-yellow-500/20 text-yellow-400" :
                    a.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                    "bg-blue-500/10 border border-blue-500/20 text-blue-400"
                  }`}>
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {a.msg}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent tickets */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Chamados Recentes</h3>
              <button onClick={() => setActiveTab("tickets")} className="text-xs text-cyan-400 hover:text-cyan-300">Ver todos →</button>
            </div>
            <div className="divide-y divide-slate-800">
              {tickets.slice(0, 5).map((ticket, i) => {
                const tech = technicians.find(t => t.id === ticket.assignedTechId);
                const statusClass = STATUS_COLORS[ticket.status] || "text-slate-400 bg-slate-800";
                return (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-900/40 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{ticket.title || `Chamado #${i + 1}`}</div>
                      <div className="text-xs text-slate-500">{ticket.category || "Manutenção"} · {ticket.city || "São Paulo"}</div>
                    </div>
                    <div className="text-xs text-slate-400 shrink-0 hidden md:block">
                      {tech?.name || "Não alocado"}
                    </div>
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusClass}`}>
                      {ticket.status?.replace(/_/g, " ") || "Aberto"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TICKETS */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar chamados..."
                className="w-full bg-[#0b0e17] border border-slate-800 focus:border-cyan-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all" />
            </div>
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-[#0b0e17] border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white outline-none appearance-none pr-8">
                <option value="all">Todos os Status</option>
                <option value="Aberto">Aberto</option>
                <option value="Aprovado">Aprovado</option>
                <option value="Em_Execucao">Em Execução</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="col-span-4">Chamado</div>
              <div className="col-span-2">Técnico</div>
              <div className="col-span-2">Valor</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Ações</div>
            </div>
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-sm">Nenhum chamado encontrado</div>
            ) : (
              filteredTickets.map((ticket, i) => {
                const tech = technicians.find(t => t.id === ticket.assignedTechId);
                const statusClass = STATUS_COLORS[ticket.status] || "text-slate-400 bg-slate-800";
                return (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 border-b border-slate-800/50 last:border-0 hover:bg-slate-900/30 transition-all items-center">
                    <div className="col-span-4">
                      <div className="text-sm font-semibold text-white truncate">{ticket.title || `Chamado #${i + 1}`}</div>
                      <div className="text-xs text-slate-500">{ticket.category || "Manutenção"}</div>
                    </div>
                    <div className="col-span-2 text-xs text-slate-400">{tech?.name || <span className="text-slate-600 italic">Não alocado</span>}</div>
                    <div className="col-span-2 text-xs font-mono text-emerald-400">R$ {(ticket.suggestedValue || 0).toLocaleString("pt-BR")}</div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${statusClass}`}>
                        {ticket.status?.replace(/_/g, " ") || "Aberto"}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-1">
                      <button onClick={() => setSelectedTicket(ticket)} className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TECHNICIANS */}
      {activeTab === "technicians" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard title="Total Técnicos" value={technicians.length} sub="Cadastrados" icon={Users} color="cyan" />
            <KPICard title="Online Agora" value={onlineTechs.length} sub="Disponíveis" trend="+2" trendUp icon={Zap} color="emerald" />
            <KPICard title="Rating Médio" value={avgRating} sub="Avaliação da equipe" icon={Star} color="yellow" />
            <KPICard title="Produtividade" value="87%" sub="Meta atingida" trend="+5%" trendUp icon={Target} color="indigo" />
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Equipe Técnica</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {technicians.map((tech, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {tech.name?.[0] || "T"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">{tech.name || `Técnico ${i + 1}`}</div>
                    <div className="text-xs text-slate-500">{(tech.specialties || []).join(", ") || "Generalista"}</div>
                  </div>
                  <div className="text-right shrink-0 hidden md:block">
                    <div className="text-xs font-semibold text-white">{tech.city || "São Paulo"}</div>
                    <div className="text-[10px] text-slate-500">{tech.radiusKm || 30}km de raio</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Star className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-xs font-bold text-white">{(tech.rating || 5).toFixed(1)}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs font-semibold shrink-0 ${tech.status === "online" ? "text-emerald-400" : "text-slate-500"}`}>
                    <span className={`h-2 w-2 rounded-full ${tech.status === "online" ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
                    {tech.status === "online" ? "Online" : "Offline"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REGIONS */}
      {activeTab === "regions" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Região Sudeste", techs: 18, tickets: 42, coverage: 94, color: "cyan" },
              { name: "Região Sul", techs: 8, tickets: 14, coverage: 72, color: "emerald" },
              { name: "Região Centro-Oeste", techs: 6, tickets: 9, coverage: 65, color: "yellow" },
              { name: "Região Nordeste", techs: 11, tickets: 22, coverage: 81, color: "indigo" },
              { name: "Região Norte", techs: 4, tickets: 6, coverage: 58, color: "orange" },
              { name: "Região Interior SP", techs: 14, tickets: 31, coverage: 89, color: "purple" },
            ].map((region, i) => (
              <div key={i} className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{region.name}</h3>
                  <span className={`text-xs font-bold text-${region.color}-400`}>{region.coverage}% cobertura</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-${region.color}-500 rounded-full`} style={{ width: `${region.coverage}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">{region.techs}</div>
                    <div className="text-[10px] text-slate-500">Técnicos</div>
                  </div>
                  <div className="bg-slate-900/60 rounded-xl p-3 text-center">
                    <div className="text-lg font-bold text-white">{region.tickets}</div>
                    <div className="text-[10px] text-slate-500">Chamados/mês</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALERTS */}
      {activeTab === "alerts" && (
        <div className="space-y-4">
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl divide-y divide-slate-800">
            {[
              { type: "error", title: "SLA Crítico", msg: "Chamado #TK-0012 ultrapassou o SLA de 4 horas sem resposta", time: "há 12 min" },
              { type: "warn", title: "Técnico Inativo", msg: "Marcos Pereira está offline há 3 horas sem justificativa", time: "há 3h" },
              { type: "warn", title: "Baixa Cobertura", msg: "Região Norte com apenas 4 técnicos ativos — abaixo da meta", time: "há 5h" },
              { type: "info", title: "Meta Diária", msg: "70% da meta de chamados diários atingida — 35 de 50 concluídos", time: "há 30 min" },
              { type: "success", title: "NPS Positivo", msg: "Avaliação 5 estrelas recebida de cliente VIP — SolarSol S.A.", time: "há 45 min" },
              { type: "error", title: "Fraude Detectada", msg: "IA detectou inconsistência em laudo do chamado #TK-0018", time: "há 1h" },
              { type: "info", title: "Relatório Pronto", msg: "Relatório semanal de operações gerado e disponível para download", time: "há 2h" },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  alert.type === "error" ? "bg-red-500/10 border border-red-500/20" :
                  alert.type === "warn" ? "bg-yellow-500/10 border border-yellow-500/20" :
                  alert.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20" :
                  "bg-blue-500/10 border border-blue-500/20"
                }`}>
                  <AlertTriangle className={`h-4 w-4 ${
                    alert.type === "error" ? "text-red-400" :
                    alert.type === "warn" ? "text-yellow-400" :
                    alert.type === "success" ? "text-emerald-400" : "text-blue-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{alert.title}</span>
                    <span className="text-[10px] text-slate-600">{alert.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.msg}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all">
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-all">
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Relatório de Produtividade Semanal", desc: "Performance dos técnicos nos últimos 7 dias", date: "27/06/2026", type: "PDF" },
              { title: "Relatório de SLA do Mês", desc: "Indicadores de cumprimento de SLA por região", date: "01/06/2026", type: "Excel" },
              { title: "Análise de Chamados por Categoria", desc: "Distribuição e tendências por tipo de serviço", date: "15/06/2026", type: "PDF" },
              { title: "Performance de Técnicos — Junho", desc: "Rating, chamados concluídos e pontuação", date: "01/06/2026", type: "PDF" },
              { title: "Relatório de Fraudes e Inconsistências", desc: "Chamados com alertas detectados pela IA", date: "20/06/2026", type: "PDF" },
              { title: "Dashboard de KPIs Operacionais", desc: "Consolidado mensal de métricas de campo", date: "01/06/2026", type: "Excel" },
            ].map((report, i) => (
              <div key={i} className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-700 transition-all cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.type === "PDF" ? "bg-red-500/10 border border-red-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                  <FileText className={`h-5 w-5 ${report.type === "PDF" ? "text-red-400" : "text-emerald-400"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{report.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{report.desc}</div>
                  <div className="text-[10px] font-mono text-slate-600 mt-1">{report.date} · {report.type}</div>
                </div>
                <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all shrink-0">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket detail modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
          <div className="bg-[#0b0e17] border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">{selectedTicket.title}</h3>
              <button onClick={() => setSelectedTicket(null)} className="text-slate-500 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: "Status", value: selectedTicket.status?.replace(/_/g, " ") },
                { label: "Categoria", value: selectedTicket.category || "Manutenção" },
                { label: "Valor", value: `R$ ${(selectedTicket.suggestedValue || 0).toLocaleString("pt-BR")}` },
                { label: "Cidade", value: selectedTicket.city || "São Paulo" },
              ].map((item, i) => (
                <div key={i} className="bg-slate-900/60 rounded-xl p-3">
                  <div className="text-slate-500">{item.label}</div>
                  <div className="font-semibold text-white mt-0.5">{item.value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { onUpdateTicketStatus(selectedTicket.id, "Cancelado"); setSelectedTicket(null); }}
                className="flex-1 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10 transition-all">
                Cancelar Chamado
              </button>
              <button onClick={() => setSelectedTicket(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-all">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
