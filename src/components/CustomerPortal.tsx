import React, { useState } from "react";
import {
  Ticket, MessageSquare, FileText, DollarSign, Star, Clock,
  CheckCircle, AlertTriangle, ArrowRight, HelpCircle, Download,
  Bell, Settings, LogOut, Sparkles, Phone, Mail, Globe, ChevronDown,
  Package, Zap, Shield, XCircle, ArrowUpRight
} from "lucide-react";

interface CustomerPortalProps {
  companies: any[];
  tickets: any[];
  technicians: any[];
  transactions: any[];
  onAddTicket: (ticket: any) => void;
  onUpdateTicketStatus: (id: string, status: any) => void;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  Aberto: { label: "Aberto", color: "text-yellow-400 bg-yellow-500/10" },
  Aprovado: { label: "Aprovado", color: "text-indigo-400 bg-indigo-500/10" },
  IA_Processando: { label: "Processando IA", color: "text-purple-400 bg-purple-500/10" },
  Convites_Enviados: { label: "Buscando Técnico", color: "text-cyan-400 bg-cyan-500/10" },
  A_Caminho: { label: "Técnico a Caminho", color: "text-blue-400 bg-blue-500/10" },
  Em_Execucao: { label: "Em Execução", color: "text-orange-400 bg-orange-500/10" },
  Aguardando_Aprovacao: { label: "Aguardando Aprovação", color: "text-orange-400 bg-orange-500/10" },
  Finalizado: { label: "Concluído", color: "text-emerald-400 bg-emerald-500/10" },
  Cancelado: { label: "Cancelado", color: "text-red-400 bg-red-500/10" },
};

export default function CustomerPortal({ companies, tickets, technicians, transactions, onAddTicket, onUpdateTicketStatus }: CustomerPortalProps) {
  const [activeTab, setActiveTab] = useState<"home" | "tickets" | "invoices" | "support" | "settings">("home");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("Manutenção Preventiva");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState("normal");
  const [ratingTicketId, setRatingTicketId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);

  const company = companies[0] || { name: "Minha Empresa", cnpj: "00.000.000/0001-00", segment: "Telecom" };
  const myTickets = tickets.slice(0, 8); // Show most recent tickets
  const openTickets = myTickets.filter(t => !["Finalizado", "Cancelado"].includes(t.status));
  const completedTickets = myTickets.filter(t => t.status === "Finalizado");

  const handleSubmitTicket = () => {
    if (!newTicketTitle.trim()) return;
    const ticket = {
      id: `ticket-${Date.now()}`,
      title: newTicketTitle,
      category: newTicketCategory,
      description: newTicketDescription,
      priority: newTicketPriority,
      status: "Aberto",
      companyId: company.id || "comp-1",
      suggestedValue: Math.round(200 + Math.random() * 800),
      photos: [],
      documents: [],
      checklist: [],
      evidencePhotos: [],
      fraudAlerts: [],
      invitedTechIds: [],
      declinedTechIds: [],
      city: company.city || "São Paulo",
      createdAt: new Date().toISOString(),
    };
    onAddTicket(ticket);
    setShowNewTicket(false);
    setNewTicketTitle("");
    setNewTicketDescription("");
    setActiveTab("tickets");
  };

  const TABS = [
    { id: "home", label: "Início", icon: Sparkles },
    { id: "tickets", label: "Chamados", icon: Ticket },
    { id: "invoices", label: "Faturas", icon: DollarSign },
    { id: "support", label: "Suporte", icon: HelpCircle },
    { id: "settings", label: "Configurações", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Globe className="h-4 w-4 text-cyan-400" />
            </div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">Portal do Cliente</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">{company.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{company.segment || "Serviços Técnicos"} · CNPJ: {company.cnpj}</p>
        </div>
        <button onClick={() => setShowNewTicket(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20">
          <Zap className="h-4 w-4" /> Abrir Chamado
        </button>
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

      {/* HOME */}
      {activeTab === "home" && (
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Chamados Abertos", value: openTickets.length, icon: Ticket, color: "yellow" },
              { title: "Concluídos", value: completedTickets.length, icon: CheckCircle, color: "emerald" },
              { title: "Em Andamento", value: myTickets.filter(t => ["Em_Execucao", "A_Caminho"].includes(t.status)).length, icon: Clock, color: "blue" },
              { title: "Avaliações", value: "4.8 ★", icon: Star, color: "yellow" },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`bg-[#0b0e17] border border-slate-800 rounded-2xl p-5`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-slate-500">{s.title}</span>
                    <div className={`w-8 h-8 rounded-xl bg-${s.color}-500/10 border border-${s.color}-500/20 flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 text-${s.color}-400`} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Active tickets */}
          {openTickets.length > 0 && (
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Chamados em Aberto</h3>
                <button onClick={() => setActiveTab("tickets")} className="text-xs text-cyan-400 hover:text-cyan-300">Ver todos →</button>
              </div>
              <div className="divide-y divide-slate-800">
                {openTickets.map((ticket, i) => {
                  const tech = technicians.find(t => t.id === ticket.assignedTechId);
                  const statusInfo = STATUS_LABEL[ticket.status] || { label: ticket.status, color: "text-slate-400 bg-slate-800" };
                  return (
                    <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white truncate">{ticket.title}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{ticket.category} · {tech?.name || "Aguardando técnico"}</div>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Services overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "Abertura Rápida", desc: "Abra chamados em segundos. Nossa IA despacha o técnico ideal automaticamente.", icon: Zap, color: "cyan", action: "Abrir Chamado", onClick: () => setShowNewTicket(true) },
              { title: "Acompanhe em Tempo Real", desc: "Veja a localização do técnico em tempo real e receba atualizações automáticas.", icon: Globe, color: "emerald", action: "Ver Chamados", onClick: () => setActiveTab("tickets") },
              { title: "Histórico e Faturas", desc: "Acesse laudos técnicos, relatórios e faturas de todos os seus chamados.", icon: FileText, color: "indigo", action: "Ver Faturas", onClick: () => setActiveTab("invoices") },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className={`bg-[#0b0e17] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all hover:-translate-y-0.5`}>
                  <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 border border-${card.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${card.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{card.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>
                  <button onClick={card.onClick} className={`flex items-center gap-1.5 text-xs font-semibold text-${card.color}-400 hover:text-${card.color}-300 transition-all`}>
                    {card.action} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TICKETS */}
      {activeTab === "tickets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Todos os Chamados</h3>
            <button onClick={() => setShowNewTicket(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all">
              <Zap className="h-3.5 w-3.5" /> Novo Chamado
            </button>
          </div>
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl divide-y divide-slate-800">
            {myTickets.length === 0 ? (
              <div className="py-16 text-center">
                <Ticket className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Nenhum chamado ainda</p>
                <button onClick={() => setShowNewTicket(true)} className="mt-4 text-xs text-cyan-400 hover:text-cyan-300">Abrir meu primeiro chamado →</button>
              </div>
            ) : (
              myTickets.map((ticket, i) => {
                const tech = technicians.find(t => t.id === ticket.assignedTechId);
                const statusInfo = STATUS_LABEL[ticket.status] || { label: ticket.status, color: "text-slate-400 bg-slate-800" };
                const isCompleted = ticket.status === "Finalizado";
                return (
                  <div key={i} className="px-5 py-4 hover:bg-slate-900/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{ticket.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {ticket.category} · {tech?.name || "Aguardando técnico"} · R$ {(ticket.suggestedValue || 0).toLocaleString("pt-BR")}
                        </div>
                      </div>
                      {isCompleted && !ratingTicketId && (
                        <button onClick={() => setRatingTicketId(ticket.id)} className="text-xs text-yellow-400 hover:text-yellow-300 shrink-0">
                          ★ Avaliar
                        </button>
                      )}
                    </div>
                    {ratingTicketId === ticket.id && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl">
                        <span className="text-xs text-slate-400">Sua avaliação:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setRatingStars(s)}>
                              <Star className={`h-5 w-5 ${s <= ratingStars ? "text-yellow-400 fill-yellow-400" : "text-slate-600"}`} />
                            </button>
                          ))}
                        </div>
                        <button onClick={() => setRatingTicketId(null)}
                          className="ml-auto text-xs px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-semibold">
                          Enviar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-2">Total Gasto</div>
              <div className="text-2xl font-bold text-white">R$ {transactions.reduce((s, t) => s + (t.totalAmount || 0), 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</div>
              <div className="text-xs text-slate-500 mt-1">{transactions.length} transações</div>
            </div>
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-2">Este Mês</div>
              <div className="text-2xl font-bold text-emerald-400">R$ 3.480</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1"><ArrowUpRight className="h-3 w-3" /> +12% vs mês anterior</div>
            </div>
            <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5">
              <div className="text-xs text-slate-500 mb-2">Chamados Finalizados</div>
              <div className="text-2xl font-bold text-white">{completedTickets.length}</div>
              <div className="text-xs text-slate-500 mt-1">Total histórico</div>
            </div>
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Histórico de Faturas</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-600 text-sm">Nenhuma fatura ainda</div>
              ) : (
                transactions.map((tx, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-900/30 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <DollarSign className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{tx.ticketTitle || `Chamado #${i + 1}`}</div>
                      <div className="text-xs text-slate-500">{tx.paymentMethod || "PIX"} · {tx.techName || "Técnico"}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-emerald-400">R$ {(tx.totalAmount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                      <div className="text-[10px] text-slate-500">Pago</div>
                    </div>
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-all shrink-0">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT */}
      {activeTab === "support" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, color: "cyan", title: "Chat ao Vivo", desc: "Fale com nossa equipe agora mesmo via chat integrado", action: "Iniciar Chat" },
              { icon: Phone, color: "emerald", title: "WhatsApp", desc: "Atendimento via WhatsApp Business 24 horas por dia", action: "Abrir WhatsApp" },
              { icon: Mail, color: "indigo", title: "E-mail", desc: "Envie sua solicitação por e-mail e responderemos em até 4h", action: "Enviar E-mail" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className={`bg-[#0b0e17] border border-slate-800 hover:border-slate-700 rounded-2xl p-5 space-y-3 transition-all cursor-pointer`}>
                  <div className={`w-10 h-10 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 text-${item.color}-400`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                  <button className={`text-xs font-semibold text-${item.color}-400 hover:text-${item.color}-300 flex items-center gap-1.5 transition-all`}>
                    {item.action} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Perguntas Frequentes</h3>
            {[
              { q: "Como acompanhar meu chamado em tempo real?", a: "Acesse a aba Chamados e clique no chamado desejado. Você verá o status atualizado e a localização do técnico." },
              { q: "Posso cancelar um chamado?", a: "Sim. Chamados podem ser cancelados enquanto não há técnico a caminho. Acesse o chamado e clique em Cancelar." },
              { q: "Como faço para baixar um laudo técnico?", a: "Após a conclusão do chamado, o laudo técnico fica disponível na aba Faturas para download em PDF." },
              { q: "Qual o prazo de resposta para um chamado urgente?", a: "Nossa IA despacha um técnico em média em 12 minutos para chamados urgentes nos planos Business e Enterprise." },
            ].map((faq, i) => (
              <div key={i} className="border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 text-sm font-semibold text-slate-200">{faq.q}</div>
                <div className="px-4 pb-4 text-xs text-slate-500 leading-relaxed border-t border-slate-800/60 pt-3">{faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="bg-[#0b0e17] border border-slate-800 rounded-2xl divide-y divide-slate-800">
            <div className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Dados da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: "Razão Social", value: company.name || "Minha Empresa" },
                  { label: "CNPJ", value: company.cnpj || "00.000.000/0001-00" },
                  { label: "Segmento", value: company.segment || "Serviços Técnicos" },
                  { label: "Cidade", value: company.city || "São Paulo" },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="text-xs text-slate-500 block mb-1">{field.label}</label>
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white">{field.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Notificações</h3>
              <div className="space-y-3">
                {[
                  { label: "Atualizações de chamados", desc: "Receba notificações quando o status mudar" },
                  { label: "Técnico a caminho", desc: "Alerta quando o técnico sair para seu endereço" },
                  { label: "Faturas geradas", desc: "Notificação quando nova fatura for emitida" },
                  { label: "Pesquisas de satisfação", desc: "NPS e CSAT após conclusão de chamados" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm text-white font-semibold">{item.label}</div>
                      <div className="text-xs text-slate-500">{item.desc}</div>
                    </div>
                    <div className="w-10 h-6 bg-cyan-600 rounded-full cursor-pointer relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-[#0b0e17] border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white font-display">Abrir Novo Chamado</h3>
              <button onClick={() => setShowNewTicket(false)} className="text-slate-500 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Título do Chamado *</label>
                <input value={newTicketTitle} onChange={e => setNewTicketTitle(e.target.value)}
                  placeholder="Ex: Falha na fibra ótica — Bloco B"
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Categoria</label>
                <div className="relative">
                  <select value={newTicketCategory} onChange={e => setNewTicketCategory(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none">
                    {["Manutenção Preventiva", "Manutenção Corretiva", "Instalação", "Reparo Urgente", "Inspeção", "Consultoria"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Prioridade</label>
                <div className="flex gap-2">
                  {[
                    { id: "normal", label: "Normal" },
                    { id: "urgent", label: "Urgente" },
                    { id: "critical", label: "Crítico" },
                  ].map(p => (
                    <button key={p.id} onClick={() => setNewTicketPriority(p.id)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        newTicketPriority === p.id
                          ? p.id === "critical" ? "border-red-500 bg-red-500/10 text-red-400" : p.id === "urgent" ? "border-orange-500 bg-orange-500/10 text-orange-400" : "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                          : "border-slate-800 text-slate-500"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Descrição</label>
                <textarea value={newTicketDescription} onChange={e => setNewTicketDescription(e.target.value)}
                  rows={3} placeholder="Descreva o problema em detalhes..."
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowNewTicket(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold transition-all">
                Cancelar
              </button>
              <button onClick={handleSubmitTicket} disabled={!newTicketTitle.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm transition-all disabled:opacity-50">
                <Zap className="h-4 w-4" /> Abrir Chamado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
