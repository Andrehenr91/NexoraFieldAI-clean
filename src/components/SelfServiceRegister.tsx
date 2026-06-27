import React, { useState } from "react";
import {
  Building2, User, CreditCard, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Lock, Mail, Phone, MapPin, Eye, EyeOff, Loader2,
  Shield, Zap, Star, AlertCircle, ChevronDown, HardHat, Wrench,
  Cpu, Bolt, Sun, Wifi, Thermometer, Factory, Plus, X, Check,
  FileText, Camera, BadgeCheck, DollarSign, Landmark, QrCode
} from "lucide-react";

interface SelfServiceRegisterProps {
  onSuccess: (data: { company?: any; user: any; plan: string; type: 'company' | 'tech' }) => void;
  onBack: () => void;
}

const PLANS_SIMPLE = [
  { id: "starter", name: "Starter", price: 297, color: "border-slate-600", badge: "", trial: 14, features: ["50 chamados/mês", "10 técnicos", "IA básica"] },
  { id: "business", name: "Business", price: 697, color: "border-cyan-500", badge: "Mais Popular", trial: 14, features: ["300 chamados/mês", "50 técnicos", "IA avançada", "API + Webhooks"] },
  { id: "enterprise", name: "Enterprise", price: 1497, color: "border-indigo-500", badge: "", trial: 14, features: ["Ilimitado", "Multi-tenant", "Todas as IAs", "Gerente de conta"] },
];

const STATES = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];
const SEGMENTS = ["Telecom & ISP","Segurança Eletrônica","Energia Solar","Elétrica & Facilities","Redes & TI","Climatização HVAC","Automação Industrial","Outros"];

const TECH_SPECIALTIES = [
  { id: "telecom", label: "Telecom & ISP", icon: Wifi },
  { id: "cftv", label: "CFTV & Segurança", icon: Camera },
  { id: "solar", label: "Energia Solar", icon: Sun },
  { id: "eletrica", label: "Elétrica & Facilities", icon: Bolt },
  { id: "redes", label: "Redes & TI", icon: Cpu },
  { id: "hvac", label: "Climatização HVAC", icon: Thermometer },
  { id: "automacao", label: "Automação Industrial", icon: Factory },
  { id: "manutencao", label: "Manutenção Geral", icon: Wrench },
];

const PIX_TYPES = ["CPF", "E-mail", "Telefone", "Chave Aleatória", "CNPJ"];

export default function SelfServiceRegister({ onSuccess, onBack }: SelfServiceRegisterProps) {
  // Account type selector
  const [accountType, setAccountType] = useState<'company' | 'tech' | null>(null);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // ── COMPANY FIELDS ──
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [segment, setSegment] = useState("");
  const [city, setCity] = useState("");
  const [companyState, setCompanyState] = useState("SP");
  const [companyPhone, setCompanyPhone] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptLgpd, setAcceptLgpd] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("business");
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card" | "boleto">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // ── TECHNICIAN FIELDS ──
  const [techName, setTechName] = useState("");
  const [techCpf, setTechCpf] = useState("");
  const [techBirthDate, setTechBirthDate] = useState("");
  const [techPhone, setTechPhone] = useState("");
  const [techEmail, setTechEmail] = useState("");
  const [techPassword, setTechPassword] = useState("");
  const [techConfirmPassword, setTechConfirmPassword] = useState("");
  const [techCity, setTechCity] = useState("");
  const [techState, setTechState] = useState("SP");
  const [techSpecialties, setTechSpecialties] = useState<string[]>([]);
  const [techRadiusKm, setTechRadiusKm] = useState("50");
  const [techExperience, setTechExperience] = useState("");
  const [techVehicle, setTechVehicle] = useState<"proprio" | "nao">("proprio");
  const [techPixKey, setTechPixKey] = useState("");
  const [techPixType, setTechPixType] = useState("CPF");
  const [techBankName, setTechBankName] = useState("");
  const [techSmsCode, setTechSmsCode] = useState("");
  const [techSmsSent, setTechSmsSent] = useState(false);
  const [techSmsVerified, setTechSmsVerified] = useState(false);
  const [techAcceptTerms, setTechAcceptTerms] = useState(false);
  const [techAcceptLgpd, setTechAcceptLgpd] = useState(false);
  const [techAcceptPlatformTerms, setTechAcceptPlatformTerms] = useState(false);

  // Shared SMS
  const [smsCode, setSmsCode] = useState("");
  const [smsSent, setSmsSent] = useState(false);
  const [smsVerified, setSmsVerified] = useState(false);

  const formatCnpj = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 14);
    return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };
  const formatCpf = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };
  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 10) return n.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    return n.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  // ── COMPANY STEPS CONFIG ──
  const COMPANY_STEPS = [
    { n: 1, label: "Empresa", icon: Building2 },
    { n: 2, label: "Usuário", icon: User },
    { n: 3, label: "Verificação", icon: Phone },
    { n: 4, label: "Plano", icon: Star },
    { n: 5, label: "Pagamento", icon: CreditCard },
    { n: 6, label: "Pronto!", icon: CheckCircle },
  ];

  // ── TECH STEPS CONFIG ──
  const TECH_STEPS = [
    { n: 1, label: "Dados Pessoais", icon: User },
    { n: 2, label: "Especialidades", icon: HardHat },
    { n: 3, label: "Dados Bancários", icon: Landmark },
    { n: 4, label: "Verificação", icon: Phone },
    { n: 5, label: "Termos", icon: FileText },
    { n: 6, label: "Pronto!", icon: CheckCircle },
  ];

  const STEPS = accountType === 'tech' ? TECH_STEPS : COMPANY_STEPS;

  // ── VALIDATION ──
  const validateCompany = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!companyName.trim()) e.companyName = "Nome da empresa obrigatório";
      if (cnpj.replace(/\D/g, "").length < 14) e.cnpj = "CNPJ inválido";
      if (!segment) e.segment = "Selecione o segmento";
      if (!city.trim()) e.city = "Cidade obrigatória";
    }
    if (s === 2) {
      if (!adminName.trim()) e.adminName = "Nome obrigatório";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) e.adminEmail = "E-mail inválido";
      if (adminPassword.length < 8) e.adminPassword = "Senha mínima de 8 caracteres";
      if (adminPassword !== confirmPassword) e.confirmPassword = "Senhas não coincidem";
      if (!acceptTerms) e.terms = "Aceite os Termos de Uso";
      if (!acceptLgpd) e.lgpd = "Aceite a Política de Privacidade (LGPD)";
    }
    if (s === 3) {
      if (!smsVerified) e.sms = "Verifique seu número de telefone para continuar";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateTech = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!techName.trim()) e.techName = "Nome obrigatório";
      if (techCpf.replace(/\D/g, "").length < 11) e.techCpf = "CPF inválido";
      if (!techBirthDate) e.techBirthDate = "Data de nascimento obrigatória";
      if (techPhone.replace(/\D/g, "").length < 10) e.techPhone = "Telefone inválido";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(techEmail)) e.techEmail = "E-mail inválido";
      if (techPassword.length < 8) e.techPassword = "Senha mínima de 8 caracteres";
      if (techPassword !== techConfirmPassword) e.techConfirmPassword = "Senhas não coincidem";
      if (!techCity.trim()) e.techCity = "Cidade obrigatória";
    }
    if (s === 2) {
      if (techSpecialties.length === 0) e.techSpecialties = "Selecione ao menos uma especialidade";
    }
    if (s === 3) {
      if (!techPixKey.trim()) e.techPixKey = "Chave PIX obrigatória";
    }
    if (s === 4) {
      if (!techSmsVerified) e.techSms = "Verifique seu número de telefone para continuar";
    }
    if (s === 5) {
      if (!techAcceptTerms) e.techTerms = "Aceite os Termos de Uso";
      if (!techAcceptLgpd) e.techLgpd = "Aceite a Política de Privacidade (LGPD)";
      if (!techAcceptPlatformTerms) e.techPlatformTerms = "Aceite os Termos da Plataforma de Prestadores";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate = (s: number) => accountType === 'tech' ? validateTech(s) : validateCompany(s);

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => { setErrors({}); setStep(s => s - 1); };

  const handleSendSms = () => { setSmsSent(true); setErrors({}); };
  const handleVerifySms = () => {
    if (smsCode.length === 6) { setSmsVerified(true); setErrors({}); }
    else setErrors({ sms: "Código inválido. Use 6 dígitos (ex: 123456 para demo)" });
  };

  const handleTechSendSms = () => { setTechSmsSent(true); setErrors({}); };
  const handleTechVerifySms = () => {
    if (techSmsCode.length === 6) { setTechSmsVerified(true); setErrors({}); }
    else setErrors({ techSms: "Código inválido. Use 6 dígitos (ex: 123456 para demo)" });
  };

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "NEXORA30") setCouponApplied(true);
    else setErrors({ coupon: "Cupom inválido ou expirado" });
  };

  const handleSubmitCompany = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    setLoading(false);
    setStep(6);
    setTimeout(() => {
      onSuccess({
        type: 'company',
        company: { name: companyName, cnpj, segment, city, state: companyState, phone: companyPhone },
        user: { name: adminName, email: adminEmail, role: "admin" },
        plan: selectedPlan,
      });
    }, 2000);
  };

  const handleSubmitTech = async () => {
    if (!validate(step)) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2400));
    setLoading(false);
    setStep(6);
    setTimeout(() => {
      onSuccess({
        type: 'tech',
        user: {
          name: techName,
          email: techEmail,
          role: "tech",
          cpf: techCpf,
          phone: techPhone,
          city: techCity,
          state: techState,
          specialties: techSpecialties,
          radiusKm: parseInt(techRadiusKm),
          pixKey: techPixKey,
          pixType: techPixType,
          bankName: techBankName,
          vehicle: techVehicle,
        },
        plan: "free",
      });
    }, 2000);
  };

  const plan = PLANS_SIMPLE.find(p => p.id === selectedPlan)!;
  const discount = couponApplied ? 0.3 : 0;
  const finalPrice = Math.round((plan?.price || 0) * (1 - discount));

  // ── TYPE SELECTOR ──
  if (!accountType) {
    return (
      <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-10">
            <button onClick={onBack} className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-all">
              <ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1.5 rounded-lg">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white font-display">NexoraField</span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white font-display mb-3">Como você quer começar?</h1>
            <p className="text-slate-400 text-sm">Escolha o tipo de conta para iniciar seu cadastro na plataforma</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* EMPRESA */}
            <button onClick={() => { setAccountType('company'); setStep(1); }}
              className="group relative p-8 bg-[#0b0e17] border-2 border-slate-800 hover:border-cyan-500 rounded-3xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-all">
                <Building2 className="h-7 w-7 text-cyan-400" />
              </div>
              <h2 className="text-lg font-bold text-white font-display mb-2">Sou Empresa</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                Contrate técnicos especializados, gerencie chamados e automatize suas operações de campo com IA.
              </p>
              <div className="space-y-1.5">
                {["Gestão de chamados técnicos", "Despacho automático com IA", "Dashboard executivo", "Trial gratuito de 14 dias"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-cyan-400 text-xs font-semibold group-hover:gap-3 transition-all">
                Criar conta empresa <ArrowRight className="h-4 w-4" />
              </div>
            </button>

            {/* TÉCNICO */}
            <button onClick={() => { setAccountType('tech'); setStep(1); }}
              className="group relative p-8 bg-[#0b0e17] border-2 border-slate-800 hover:border-emerald-500 rounded-3xl text-left transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full">GRATUITO</div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:bg-emerald-500/20 transition-all">
                <HardHat className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white font-display mb-2">Sou Técnico</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">
                Receba chamados na sua região, aumente sua renda e gerencie seus serviços de forma profissional.
              </p>
              <div className="space-y-1.5">
                {["Chamados na sua região", "Pagamento via PIX em 24h", "Gamificação e badges", "Cadastro 100% gratuito"].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-2 text-emerald-400 text-xs font-semibold group-hover:gap-3 transition-all">
                Cadastrar como técnico <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-slate-600 mt-8">Já tem conta? <button onClick={onBack} className="text-cyan-400 hover:text-cyan-300 hover:underline">Fazer login</button></p>
        </div>
      </div>
    );
  }

  // ── SHARED HEADER ──
  const accentColor = accountType === 'tech' ? 'emerald' : 'cyan';

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setAccountType(null); setStep(0); setErrors({}); }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-all">
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </button>
          <div className="flex items-center gap-2">
            <div className={`bg-gradient-to-tr ${accountType === 'tech' ? 'from-emerald-500 to-cyan-600' : 'from-cyan-500 to-indigo-600'} p-1.5 rounded-lg`}>
              {accountType === 'tech' ? <HardHat className="h-4 w-4 text-white" /> : <Sparkles className="h-4 w-4 text-white" />}
            </div>
            <span className="font-bold text-white font-display">NexoraField</span>
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${accountType === 'tech' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'}`}>
              {accountType === 'tech' ? 'TÉCNICO' : 'EMPRESA'}
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = step > s.n;
            const active = step === s.n;
            return (
              <React.Fragment key={s.n}>
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                    done ? "bg-emerald-500 border-emerald-500"
                      : active ? `${accountType === 'tech' ? 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-cyan-600 border-cyan-500 shadow-lg shadow-cyan-500/30'}`
                      : "bg-slate-900 border-slate-700"
                  }`}>
                    {done ? <CheckCircle className="h-4 w-4 text-white" /> : <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-600"}`} />}
                  </div>
                  <span className={`text-[9px] font-mono uppercase tracking-wide hidden sm:block ${
                    active ? (accountType === 'tech' ? "text-emerald-400" : "text-cyan-400")
                      : done ? "text-emerald-400" : "text-slate-600"
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? "bg-emerald-500" : "bg-slate-800"}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${accountType === 'tech' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-cyan-500 to-indigo-500'}`}
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-[#0b0e17] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">

        {/* ══════════════════════════════════════════════════════ */}
        {/* EMPRESA STEPS */}
        {/* ══════════════════════════════════════════════════════ */}

        {accountType === 'company' && step === 1 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Dados da Empresa</h2>
              <p className="text-xs text-slate-500 mt-1">Informações do seu CNPJ e operação</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Razão Social / Nome da Empresa *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Ex: Telefônica Brasil Ltda"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.companyName ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.companyName && <p className="text-red-400 text-[10px] mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">CNPJ *</label>
                <input value={cnpj} onChange={e => setCnpj(formatCnpj(e.target.value))} placeholder="00.000.000/0001-00"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.cnpj ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.cnpj && <p className="text-red-400 text-[10px] mt-1">{errors.cnpj}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Telefone *</label>
                <input value={companyPhone} onChange={e => setCompanyPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999"
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Segmento *</label>
                <div className="relative">
                  <select value={segment} onChange={e => setSegment(e.target.value)}
                    className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all ${errors.segment ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`}>
                    <option value="">Selecionar...</option>
                    {SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
                {errors.segment && <p className="text-red-400 text-[10px] mt-1">{errors.segment}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cidade *</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="São Paulo"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.city ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.city && <p className="text-red-400 text-[10px] mt-1">{errors.city}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Estado *</label>
                <div className="relative">
                  <select value={companyState} onChange={e => setCompanyState(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {accountType === 'company' && step === 2 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Cadastro do Administrador</h2>
              <p className="text-xs text-slate-500 mt-1">Crie o acesso principal da sua conta</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nome completo *</label>
                <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Seu nome completo"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.adminName ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.adminName && <p className="text-red-400 text-[10px] mt-1">{errors.adminName}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">E-mail corporativo *</label>
                <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@suaempresa.com.br"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.adminEmail ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.adminEmail && <p className="text-red-400 text-[10px] mt-1">{errors.adminEmail}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Senha *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                    className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.adminPassword ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.adminPassword && <p className="text-red-400 text-[10px] mt-1">{errors.adminPassword}</p>}
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      adminPassword.length > i * 3 ? (adminPassword.length < 6 ? "bg-red-500" : adminPassword.length < 10 ? "bg-yellow-500" : "bg-emerald-500") : "bg-slate-800"
                    }`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Confirmar senha *</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a senha"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.confirmPassword ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                {errors.confirmPassword && <p className="text-red-400 text-[10px] mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="mt-0.5 accent-cyan-500" />
                <span className="text-xs text-slate-400">Li e aceito os <a href="#" className="text-cyan-400 hover:underline">Termos de Uso</a> e o <a href="#" className="text-cyan-400 hover:underline">Contrato de Licença de Software</a></span>
              </label>
              {errors.terms && <p className="text-red-400 text-[10px]">{errors.terms}</p>}
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={acceptLgpd} onChange={e => setAcceptLgpd(e.target.checked)} className="mt-0.5 accent-cyan-500" />
                <span className="text-xs text-slate-400">Consinto com o tratamento dos meus dados pessoais conforme a <a href="#" className="text-cyan-400 hover:underline">Política de Privacidade (LGPD)</a></span>
              </label>
              {errors.lgpd && <p className="text-red-400 text-[10px]">{errors.lgpd}</p>}
            </div>
          </div>
        )}

        {accountType === 'company' && step === 3 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Verificação de Telefone</h2>
              <p className="text-xs text-slate-500 mt-1">Confirmamos que você é você — segurança da sua conta</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Verificação por SMS</div>
                  <div className="text-xs text-slate-500">Enviaremos um código para {companyPhone || "(11) 9xxxx-xxxx"}</div>
                </div>
              </div>
              {!smsSent ? (
                <button onClick={handleSendSms} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> Enviar código por SMS
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 text-center">
                    ✓ SMS enviado · Use <strong>qualquer código de 6 dígitos</strong> no modo demo
                  </div>
                  {smsVerified ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-1">
                      <div className="text-2xl">✅</div>
                      <div className="text-sm font-bold text-emerald-400">Número verificado com sucesso!</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-400 block">Código de 6 dígitos</label>
                      <div className="flex gap-2">
                        <input value={smsCode} onChange={e => setSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"
                          className={`flex-1 bg-[#05070c] border rounded-xl px-3.5 py-3 text-center text-xl font-mono tracking-[0.5em] text-white placeholder-slate-700 outline-none transition-all ${errors.sms ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                        <button onClick={handleVerifySms} className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all">Verificar</button>
                      </div>
                      {errors.sms && <p className="text-red-400 text-[10px]">{errors.sms}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {accountType === 'company' && step === 4 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Escolha seu Plano</h2>
              <p className="text-xs text-slate-500 mt-1">14 dias de trial gratuito em todos os planos</p>
            </div>
            <div className="space-y-3">
              {PLANS_SIMPLE.map(p => (
                <label key={p.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === p.id ? `${p.color} bg-slate-900/50` : "border-slate-800 hover:border-slate-700"}`}
                  onClick={() => setSelectedPlan(p.id)}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === p.id ? "border-cyan-500 bg-cyan-500" : "border-slate-600"}`}>
                    {selectedPlan === p.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{p.name}</span>
                      {p.badge && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-mono">{p.badge}</span>}
                    </div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {p.features.map(f => <span key={f} className="text-[10px] text-slate-500">• {f}</span>)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-white">R$ {p.price.toLocaleString("pt-BR")}</div>
                    <div className="text-[10px] text-slate-500">/mês</div>
                  </div>
                </label>
              ))}
            </div>
            <div className="border-t border-slate-800 pt-4">
              <label className="text-xs font-semibold text-slate-400 block mb-2">Cupom de desconto</label>
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="Ex: NEXORA30"
                  className={`flex-1 bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.coupon ? "border-red-500" : "border-slate-800 focus:border-cyan-500"}`} />
                <button onClick={handleApplyCoupon} className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-all">Aplicar</button>
              </div>
              {couponApplied && <p className="text-emerald-400 text-[10px] mt-1">✓ Desconto de 30% aplicado!</p>}
              {errors.coupon && <p className="text-red-400 text-[10px] mt-1">{errors.coupon}</p>}
            </div>
          </div>
        )}

        {accountType === 'company' && step === 5 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Forma de Pagamento</h2>
              <p className="text-xs text-slate-500 mt-1">Trial de 14 dias grátis. Cobrança apenas após o período.</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Plano {plan?.name}</div>
                <div className="text-xs text-slate-400">Próxima cobrança em 14 dias</div>
              </div>
              <div className="text-right">
                {couponApplied && <div className="text-[10px] text-slate-500 line-through">R$ {plan?.price.toLocaleString("pt-BR")}</div>}
                <div className="font-bold text-xl text-white">R$ {finalPrice.toLocaleString("pt-BR")}</div>
                <div className="text-[10px] text-slate-500">/mês</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(["pix", "card", "boleto"] as const).map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`p-3 rounded-xl border-2 transition-all text-xs font-semibold flex flex-col items-center gap-1.5 ${paymentMethod === m ? "border-cyan-500 bg-cyan-500/10 text-cyan-400" : "border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                  {m === "pix" ? <QrCode className="h-5 w-5" /> : m === "card" ? <CreditCard className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                  {m === "pix" ? "PIX" : m === "card" ? "Cartão" : "Boleto"}
                </button>
              ))}
            </div>
            {paymentMethod === "pix" && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                <QrCode className="h-10 w-10 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">PIX será gerado após confirmação</div>
                <div className="text-xs text-slate-500">Você receberá o QR Code por e-mail. Expira em 30 minutos.</div>
              </div>
            )}
            {paymentMethod === "card" && (
              <div className="space-y-3">
                <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="0000 0000 0000 0000"
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono" />
                <input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Nome no cartão"
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA"
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono" />
                  <input value={cardCvv} onChange={e => setCardCvv(e.target.value)} placeholder="CVV"
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono" />
                </div>
              </div>
            )}
            {paymentMethod === "boleto" && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center space-y-3">
                <FileText className="h-10 w-10 text-blue-400 mx-auto" />
                <div className="text-sm font-bold text-white">Boleto gerado após confirmação</div>
                <div className="text-xs text-slate-500">Prazo de pagamento: 3 dias úteis. Vencimento após o trial.</div>
              </div>
            )}
            <button onClick={handleSubmitCompany} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Processando...</> : <><Lock className="h-4 w-4" /> Confirmar e Iniciar Trial</>}
            </button>
          </div>
        )}

        {accountType === 'company' && step === 6 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle className="h-10 w-10 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-display mb-2">Conta criada com sucesso!</h2>
              <p className="text-sm text-slate-400">Seu trial de 14 dias foi iniciado. Configurando sua plataforma...</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Empresa", value: companyName.split(" ")[0] || "Sua Empresa", color: "text-cyan-400" },
                { label: "Plano", value: plan?.name || "Business", color: "text-indigo-400" },
                { label: "Trial", value: "14 dias", color: "text-emerald-400" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                  <div className={`font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-xs text-slate-600">Iniciando o assistente de configuração...</p>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* TÉCNICO STEPS */}
        {/* ══════════════════════════════════════════════════════ */}

        {accountType === 'tech' && step === 1 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Dados Pessoais</h2>
              <p className="text-xs text-slate-500 mt-1">Informações básicas para criar seu perfil de técnico</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Nome completo *</label>
                <input value={techName} onChange={e => setTechName(e.target.value)} placeholder="Seu nome completo"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.techName ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techName && <p className="text-red-400 text-[10px] mt-1">{errors.techName}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">CPF *</label>
                <input value={techCpf} onChange={e => setTechCpf(formatCpf(e.target.value))} placeholder="000.000.000-00"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.techCpf ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techCpf && <p className="text-red-400 text-[10px] mt-1">{errors.techCpf}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Data de Nascimento *</label>
                <input type="date" value={techBirthDate} onChange={e => setTechBirthDate(e.target.value)}
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all ${errors.techBirthDate ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techBirthDate && <p className="text-red-400 text-[10px] mt-1">{errors.techBirthDate}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Telefone / WhatsApp *</label>
                <input value={techPhone} onChange={e => setTechPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.techPhone ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techPhone && <p className="text-red-400 text-[10px] mt-1">{errors.techPhone}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">E-mail *</label>
                <input type="email" value={techEmail} onChange={e => setTechEmail(e.target.value)} placeholder="seu@email.com"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.techEmail ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techEmail && <p className="text-red-400 text-[10px] mt-1">{errors.techEmail}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Senha *</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={techPassword} onChange={e => setTechPassword(e.target.value)} placeholder="Mínimo 8 caracteres"
                    className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.techPassword ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.techPassword && <p className="text-red-400 text-[10px] mt-1">{errors.techPassword}</p>}
                <div className="flex gap-1 mt-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                      techPassword.length > i * 3 ? (techPassword.length < 6 ? "bg-red-500" : techPassword.length < 10 ? "bg-yellow-500" : "bg-emerald-500") : "bg-slate-800"
                    }`} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Confirmar senha *</label>
                <input type="password" value={techConfirmPassword} onChange={e => setTechConfirmPassword(e.target.value)} placeholder="Repita a senha"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.techConfirmPassword ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techConfirmPassword && <p className="text-red-400 text-[10px] mt-1">{errors.techConfirmPassword}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Cidade *</label>
                <input value={techCity} onChange={e => setTechCity(e.target.value)} placeholder="Sua cidade"
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all ${errors.techCity ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techCity && <p className="text-red-400 text-[10px] mt-1">{errors.techCity}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Estado *</label>
                <div className="relative">
                  <select value={techState} onChange={e => setTechState(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {accountType === 'tech' && step === 2 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Especialidades & Área de Atuação</h2>
              <p className="text-xs text-slate-500 mt-1">Selecione suas habilidades para receber chamados compatíveis</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-3">Especialidades Técnicas * <span className="text-slate-600">(selecione todas que se aplicam)</span></label>
              <div className="grid grid-cols-2 gap-2">
                {TECH_SPECIALTIES.map(spec => {
                  const Icon = spec.icon;
                  const selected = techSpecialties.includes(spec.id);
                  return (
                    <button key={spec.id}
                      onClick={() => setTechSpecialties(prev => selected ? prev.filter(s => s !== spec.id) : [...prev, spec.id])}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${selected ? "border-emerald-500 bg-emerald-500/10" : "border-slate-800 hover:border-slate-700"}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${selected ? "bg-emerald-500/20" : "bg-slate-900"}`}>
                        <Icon className={`h-4 w-4 ${selected ? "text-emerald-400" : "text-slate-500"}`} />
                      </div>
                      <span className={`text-xs font-medium ${selected ? "text-emerald-300" : "text-slate-400"}`}>{spec.label}</span>
                      {selected && <Check className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {errors.techSpecialties && <p className="text-red-400 text-[10px] mt-2">{errors.techSpecialties}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Raio de Atuação</label>
                <div className="flex items-center gap-3">
                  <input type="range" min={10} max={200} value={techRadiusKm} onChange={e => setTechRadiusKm(e.target.value)} className="flex-1 accent-emerald-500" />
                  <span className="text-sm font-bold text-emerald-400 w-16 text-right">{techRadiusKm} km</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>10km</span><span>200km</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Anos de Experiência</label>
                <div className="relative">
                  <select value={techExperience} onChange={e => setTechExperience(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all">
                    <option value="">Selecionar...</option>
                    {["Menos de 1 ano", "1 a 2 anos", "3 a 5 anos", "5 a 10 anos", "Mais de 10 anos"].map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Possui veículo próprio?</label>
              <div className="flex gap-3">
                {(["proprio", "nao"] as const).map(v => (
                  <button key={v} onClick={() => setTechVehicle(v)}
                    className={`flex-1 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${techVehicle === v ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-800 text-slate-500 hover:border-slate-700"}`}>
                    {v === "proprio" ? "✓ Sim, tenho veículo" : "✗ Não tenho"}
                  </button>
                ))}
              </div>
            </div>

            {techSpecialties.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                <div className="text-xs font-semibold text-emerald-400 mb-2">Especialidades selecionadas ({techSpecialties.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {techSpecialties.map(s => {
                    const spec = TECH_SPECIALTIES.find(t => t.id === s);
                    return <span key={s} className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">{spec?.label}</span>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {accountType === 'tech' && step === 3 && (
          <div className="p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Dados Bancários</h2>
              <p className="text-xs text-slate-500 mt-1">Para receber seus pagamentos em até 24h após aprovação do serviço</p>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
              <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400">
                <strong className="text-emerald-400">Pagamento via PIX em 24h!</strong><br />
                Assim que o serviço for aprovado pela empresa contratante, o pagamento é liberado automaticamente para sua chave PIX.
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Tipo de Chave PIX *</label>
                <div className="relative">
                  <select value={techPixType} onChange={e => setTechPixType(e.target.value)}
                    className="w-full bg-[#05070c] border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none appearance-none transition-all">
                    {PIX_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Chave PIX *</label>
                <input value={techPixKey} onChange={e => setTechPixKey(e.target.value)}
                  placeholder={techPixType === "CPF" ? "000.000.000-00" : techPixType === "E-mail" ? "seu@email.com" : techPixType === "Telefone" ? "(11) 99999-9999" : "Cole sua chave aqui"}
                  className={`w-full bg-[#05070c] border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none font-mono transition-all ${errors.techPixKey ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                {errors.techPixKey && <p className="text-red-400 text-[10px] mt-1">{errors.techPixKey}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">Banco (opcional)</label>
                <input value={techBankName} onChange={e => setTechBankName(e.target.value)} placeholder="Ex: Nubank, Itaú, Bradesco..."
                  className="w-full bg-[#05070c] border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all" />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-slate-400">Estrutura de Comissão</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Sua remuneração por chamado</span>
                <span className="text-sm font-bold text-emerald-400">85% do valor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Taxa da plataforma</span>
                <span className="text-sm font-bold text-slate-400">15% do valor</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full w-[85%] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              </div>
            </div>
          </div>
        )}

        {accountType === 'tech' && step === 4 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Verificação de Telefone</h2>
              <p className="text-xs text-slate-500 mt-1">Confirmamos que você é você — segurança da sua conta</p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Verificação por SMS</div>
                  <div className="text-xs text-slate-500">Enviaremos um código para {techPhone || "(11) 9xxxx-xxxx"}</div>
                </div>
              </div>
              {!techSmsSent ? (
                <button onClick={handleTechSendSms} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> Enviar código por SMS
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-400 text-center">
                    ✓ SMS enviado para {techPhone} · Use <strong>qualquer código de 6 dígitos</strong> no modo demo
                  </div>
                  {techSmsVerified ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-1">
                      <div className="text-2xl">✅</div>
                      <div className="text-sm font-bold text-emerald-400">Número verificado com sucesso!</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold text-slate-400 block">Código de 6 dígitos</label>
                      <div className="flex gap-2">
                        <input value={techSmsCode} onChange={e => setTechSmsCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"
                          className={`flex-1 bg-[#05070c] border rounded-xl px-3.5 py-3 text-center text-xl font-mono tracking-[0.5em] text-white placeholder-slate-700 outline-none transition-all ${errors.techSms ? "border-red-500" : "border-slate-800 focus:border-emerald-500"}`} />
                        <button onClick={handleTechVerifySms} className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all">Verificar</button>
                      </div>
                      {errors.techSms && <p className="text-red-400 text-[10px]">{errors.techSms}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400">
                  <strong className="text-white">Por que verificamos seu telefone?</strong><br />
                  A verificação via SMS protege sua conta contra acessos não autorizados e é exigida pela regulamentação de proteção de dados (LGPD).
                </div>
              </div>
            </div>
          </div>
        )}

        {accountType === 'tech' && step === 5 && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-display">Termos & Documentos</h2>
              <p className="text-xs text-slate-500 mt-1">Leia e aceite os termos para completar seu cadastro</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 max-h-32 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-300 mb-2">Termos de Uso da Plataforma</div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Ao se cadastrar como prestador de serviços na NexoraField, você concorda em fornecer serviços técnicos com qualidade e profissionalismo, 
                  manter suas informações atualizadas, respeitar os prazos acordados com as empresas contratantes, seguir os protocolos de segurança definidos, 
                  e utilizar a plataforma de acordo com as diretrizes estabelecidas. A NexoraField atua como intermediadora entre empresas e prestadores, 
                  não caracterizando vínculo empregatício.
                </p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 max-h-32 overflow-y-auto">
                <div className="text-xs font-semibold text-slate-300 mb-2">Termos da Plataforma de Prestadores</div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Como técnico credenciado NexoraField, você autoriza a plataforma a: realizar a correspondência automática com chamados compatíveis com seu perfil, 
                  processar pagamentos de forma intermediária, coletar dados de localização durante execução de serviços para fins de auditoria, 
                  exibir seu perfil (sem dados sensíveis) para empresas contratantes, e gerar relatórios de desempenho e qualidade.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div onClick={() => setTechAcceptTerms(!techAcceptTerms)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${techAcceptTerms ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"}`}>
                  {techAcceptTerms && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-slate-400 cursor-pointer" onClick={() => setTechAcceptTerms(!techAcceptTerms)}>
                  Li e aceito os <span className="text-emerald-400 hover:underline">Termos de Uso</span> da NexoraField
                </span>
              </label>
              {errors.techTerms && <p className="text-red-400 text-[10px] ml-8">{errors.techTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setTechAcceptLgpd(!techAcceptLgpd)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${techAcceptLgpd ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"}`}>
                  {techAcceptLgpd && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-slate-400 cursor-pointer" onClick={() => setTechAcceptLgpd(!techAcceptLgpd)}>
                  Consinto com o tratamento dos meus dados conforme a <span className="text-emerald-400 hover:underline">Política de Privacidade (LGPD)</span>
                </span>
              </label>
              {errors.techLgpd && <p className="text-red-400 text-[10px] ml-8">{errors.techLgpd}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <div onClick={() => setTechAcceptPlatformTerms(!techAcceptPlatformTerms)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${techAcceptPlatformTerms ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"}`}>
                  {techAcceptPlatformTerms && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="text-xs text-slate-400 cursor-pointer" onClick={() => setTechAcceptPlatformTerms(!techAcceptPlatformTerms)}>
                  Aceito os <span className="text-emerald-400 hover:underline">Termos da Plataforma de Prestadores</span> e autorizo o intermediação de serviços
                </span>
              </label>
              {errors.techPlatformTerms && <p className="text-red-400 text-[10px] ml-8">{errors.techPlatformTerms}</p>}
            </div>

            <button onClick={handleSubmitTech} disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-60">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Criando perfil...</> : <><BadgeCheck className="h-4 w-4" /> Finalizar Cadastro</>}
            </button>
          </div>
        )}

        {accountType === 'tech' && step === 6 && (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <HardHat className="h-10 w-10 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white font-display mb-2">Cadastro realizado!</h2>
              <p className="text-sm text-slate-400">Bem-vindo à NexoraField, {techName.split(" ")[0]}! Seu perfil está sendo configurado.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Especialidades", value: techSpecialties.length, color: "text-emerald-400" },
                { label: "Raio de Ação", value: `${techRadiusKm}km`, color: "text-cyan-400" },
                { label: "Pagamento", value: "PIX 24h", color: "text-indigo-400" },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
                  <div className={`font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-left space-y-2">
              <div className="text-xs font-semibold text-emerald-400">Próximos passos</div>
              {["Acesse seu portal de técnico", "Configure horários de disponibilidade", "Aguarde chamados na sua região", "Receba e aceite oportunidades"].map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  {step}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-xs text-slate-600">Redirecionando para o seu portal...</p>
          </div>
        )}

        {/* Navigation footer — show for all non-final steps */}
        {step > 0 && step < STEPS.length && (
          <div className="px-6 pb-6 flex justify-between items-center border-t border-slate-800 pt-4">
            <button onClick={back} disabled={step === 1}
              className="text-xs text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Anterior
            </button>
            <div className="text-[10px] font-mono text-slate-600">Etapa {step} de {STEPS.length}</div>
            {/* Company: steps 1-3 use next(), step 4 uses next(), step 5 handled by submit button */}
            {accountType === 'company' && step < 5 && (
              <button onClick={next}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg transition-all">
                Próximo <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Tech: steps 1-4 use next(), step 5 has submit button */}
            {accountType === 'tech' && step < 5 && (
              <button onClick={next}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-all">
                Próximo <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
            {/* step 5 for both: button is inside the step content */}
            {step === 5 && <div />}
          </div>
        )}
      </div>

      {/* Trust badges */}
      {step > 0 && step < STEPS.length && (
        <div className="flex items-center gap-6 mt-6">
          {[
            { icon: Lock, text: "SSL 256-bit" },
            { icon: Shield, text: "LGPD Compliant" },
            { icon: BadgeCheck, text: "Dados Criptografados" },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Icon className="h-3 w-3" /> {b.text}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
