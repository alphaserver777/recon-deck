export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type CompanyStatus = "recon" | "active" | "compromised" | "completed";

export type Company = {
  id: string;
  name: string;
  whiteIp: string;
  vpnLogin: string;
  vpnPassword: string;
  budget: number;
  szi: string[];
  savz: string[];
  notes: string;
  domain: string;
  industry: string;
  employeeCount: number;
  riskLevel: RiskLevel;
  status: CompanyStatus;
  hostsDiscovered: number;
  credsFound: number;
  vulnsFound: number;
  entryPoints: number;
  highValueTargets: number;
  attackPaths: number;
  progress: number;
  startDate: string;
};

export const COMPANY_STATUS_COLORS: Record<CompanyStatus, string> = {
  recon: "var(--risk-low)",
  active: "var(--accent)",
  compromised: "var(--risk-high)",
  completed: "#22c55e",
};

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  recon: "РАЗВЕДКА",
  active: "АКТИВНА",
  compromised: "КОМПРОМЕТАЦИЯ",
  completed: "ЗАВЕРШЕНА",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  CRITICAL: "var(--risk-crit)",
  HIGH: "var(--risk-high)",
  MEDIUM: "var(--risk-med)",
  LOW: "var(--risk-low)",
};

export const MOCK_COMPANIES: Company[] = [
  {
    id: "corp-local",
    name: "АО «КорпТехСервис»",
    whiteIp: "95.84.196.87",
    vpnLogin: "pentest_op1",
    vpnPassword: "Xk9$mR2!vLp@",
    budget: 2800000,
    szi: ["КриптоПро CSP 5.0", "ViPNet Client", "Рутокен ЭЦП"],
    savz: ["Kaspersky Endpoint Security 12", "Kaspersky Security Center"],
    notes: "Основная цель — получение доступа к контроллеру домена corp.local. VPN через OpenVPN, порт 1194. Внутренняя сеть 192.168.16.0/24. Согласовано проведение работ в рабочее время.",
    domain: "corp.local",
    industry: "ИТ-услуги",
    employeeCount: 340,
    riskLevel: "CRITICAL",
    status: "active",
    hostsDiscovered: 24,
    credsFound: 17,
    vulnsFound: 8,
    entryPoints: 3,
    highValueTargets: 6,
    attackPaths: 4,
    progress: 62,
    startDate: "2026-06-17",
  },
  {
    id: "gazneft",
    name: "ПАО «ГазНефтьТранс»",
    whiteIp: "185.145.124.141",
    vpnLogin: "audit_ext",
    vpnPassword: "Qw3$Bn8!zXc#",
    budget: 5500000,
    szi: ["Dallas Lock 8.0-K", "Secret Net Studio", "Аладдин РД"],
    savz: ["Dr.Web Enterprise Security Suite", "Dr.Web CureNet!"],
    notes: "SCADA-сегмент изолирован. Приоритет — офисная сеть и Exchange. Заказчик предупредил о наличии SOC. Окна работ: пн-пт 09:00-18:00 MSK.",
    domain: "gnt.corp",
    industry: "Нефтегаз",
    employeeCount: 1200,
    riskLevel: "HIGH",
    status: "recon",
    hostsDiscovered: 8,
    credsFound: 2,
    vulnsFound: 3,
    entryPoints: 1,
    highValueTargets: 2,
    attackPaths: 0,
    progress: 15,
    startDate: "2026-06-19",
  },
  {
    id: "finbank",
    name: "АО «ФинБанк Капитал»",
    whiteIp: "91.217.83.44",
    vpnLogin: "pt_external",
    vpnPassword: "Mn7@Lk4!pRs%",
    budget: 8200000,
    szi: ["КриптоПро CSP 5.0", "Континент TLS VPN", "Рутокен ЭЦП 3.0", "InfoWatch Traffic Monitor"],
    savz: ["Kaspersky Endpoint Security 12", "Kaspersky Anti Targeted Attack"],
    notes: "Банковская инфраструктура. PCI DSS scope. Разрешена работа только в согласованные окна: 22:00-06:00 MSK. Запрещены деструктивные воздействия на АБС.",
    domain: "finbank.local",
    industry: "Финансы",
    employeeCount: 560,
    riskLevel: "MEDIUM",
    status: "recon",
    hostsDiscovered: 0,
    credsFound: 0,
    vulnsFound: 0,
    entryPoints: 0,
    highValueTargets: 0,
    attackPaths: 0,
    progress: 5,
    startDate: "2026-06-20",
  },
  {
    id: "medsys",
    name: "ООО «МедСистемы Плюс»",
    whiteIp: "77.232.41.18",
    vpnLogin: "sec_test",
    vpnPassword: "Ht5$Wr9!bNm@",
    budget: 1500000,
    szi: ["ViPNet Coordinator", "ViPNet Client"],
    savz: ["Kaspersky Endpoint Security 11"],
    notes: "Медицинская ИС. Содержит персональные данные (ИСПДн). Ограничение — не затрагивать сегмент PACS. Отчёт сдан заказчику.",
    domain: "medsys.local",
    industry: "Медицина",
    employeeCount: 180,
    riskLevel: "HIGH",
    status: "completed",
    hostsDiscovered: 31,
    credsFound: 22,
    vulnsFound: 14,
    entryPoints: 4,
    highValueTargets: 5,
    attackPaths: 7,
    progress: 100,
    startDate: "2026-05-28",
  },
  {
    id: "logistpro",
    name: "ООО «ЛогистПро»",
    whiteIp: "46.173.220.95",
    vpnLogin: "redteam_01",
    vpnPassword: "Zp6@Kd3!mYx$",
    budget: 900000,
    szi: ["Рутокен Lite"],
    savz: ["ESET NOD32 Smart Security"],
    notes: "Небольшая компания. AD без hardening. Предполагается быстрый пентест за 3 дня. Контакт заказчика: Иванов А.С.",
    domain: "logist.local",
    industry: "Логистика",
    employeeCount: 75,
    riskLevel: "LOW",
    status: "recon",
    hostsDiscovered: 0,
    credsFound: 0,
    vulnsFound: 0,
    entryPoints: 0,
    highValueTargets: 0,
    attackPaths: 0,
    progress: 0,
    startDate: "2026-06-22",
  },
];
