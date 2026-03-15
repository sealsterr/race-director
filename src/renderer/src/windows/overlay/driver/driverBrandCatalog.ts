import ferrariLogo from "../../../assets/driver-logos/ferrari-official.png";
import porscheLogo from "../../../assets/driver-logos/porsche.svg";
import toyotaLogo from "../../../assets/driver-logos/toyota-official.svg";
import cadillacLogo from "../../../assets/driver-logos/cadillac-official.png";
import peugeotLogo from "../../../assets/driver-logos/peugeot.svg";
import alpineLogo from "../../../assets/driver-logos/alpine.svg";
import bmwLogo from "../../../assets/driver-logos/bmw.svg";
import astonMartinLogo from "../../../assets/driver-logos/aston-martin.svg";
import lamborghiniLogo from "../../../assets/driver-logos/lamborghini.svg";
import mclarenLogo from "../../../assets/driver-logos/mclaren.svg";
import lexusLogo from "../../../assets/driver-logos/lexus.svg";
import corvetteLogo from "../../../assets/driver-logos/corvette.svg";
import fordLogo from "../../../assets/driver-logos/ford.svg";
import orecaLogo from "../../../assets/driver-logos/oreca.svg";
import mercedesLogo from "../../../assets/driver-logos/mercedes.svg";
import genericLogo from "../../../assets/driver-logos/generic.svg";

export interface BrandMark {
    readonly label: string;
    readonly shortLabel: string;
    readonly accent: string;
    readonly countryCode: string;
    readonly countryColors: readonly [string, string, string];
    readonly logoTint: string;
    readonly logoSrc: string;
}

export const BRAND_MARKS: Array<{ match: RegExp; brand: BrandMark }> = [
    { match: /ferrari|499p|296/i, brand: { label: "Ferrari", shortLabel: "FR", accent: "#ef4444", countryCode: "FR", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#facc15", logoSrc: ferrariLogo } },
    { match: /porsche|963|911/i, brand: { label: "Porsche", shortLabel: "PO", accent: "#f59e0b", countryCode: "DE", countryColors: ["#111827", "#dc2626", "#facc15"], logoTint: "#f59e0b", logoSrc: porscheLogo } },
    { match: /toyota|gr010/i, brand: { label: "Toyota", shortLabel: "TY", accent: "#ef4444", countryCode: "JP", countryColors: ["#ffffff", "#ef4444", "#ffffff"], logoTint: "#ef4444", logoSrc: toyotaLogo } },
    { match: /cadillac|v-series/i, brand: { label: "Cadillac", shortLabel: "CD", accent: "#60a5fa", countryCode: "US", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#60a5fa", logoSrc: cadillacLogo } },
    { match: /peugeot|9x8/i, brand: { label: "Peugeot", shortLabel: "PG", accent: "#22c55e", countryCode: "FR", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#f8fafc", logoSrc: peugeotLogo } },
    { match: /alpine|a424/i, brand: { label: "Alpine", shortLabel: "AL", accent: "#38bdf8", countryCode: "FR", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#38bdf8", logoSrc: alpineLogo } },
    { match: /bmw|m hybrid|m4/i, brand: { label: "BMW", shortLabel: "BW", accent: "#60a5fa", countryCode: "DE", countryColors: ["#111827", "#dc2626", "#facc15"], logoTint: "#60a5fa", logoSrc: bmwLogo } },
    { match: /aston martin|vantage|valkyrie/i, brand: { label: "Aston Martin", shortLabel: "AM", accent: "#22c55e", countryCode: "UK", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#22c55e", logoSrc: astonMartinLogo } },
    { match: /lamborghini|huracan|sc63/i, brand: { label: "Lamborghini", shortLabel: "LB", accent: "#84cc16", countryCode: "IT", countryColors: ["#16a34a", "#ffffff", "#dc2626"], logoTint: "#84cc16", logoSrc: lamborghiniLogo } },
    { match: /mclaren|720s/i, brand: { label: "McLaren", shortLabel: "MC", accent: "#f97316", countryCode: "UK", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#f97316", logoSrc: mclarenLogo } },
    { match: /lexus|rc f/i, brand: { label: "Lexus", shortLabel: "LX", accent: "#a855f7", countryCode: "JP", countryColors: ["#ffffff", "#ef4444", "#ffffff"], logoTint: "#a855f7", logoSrc: lexusLogo } },
    { match: /corvette|z06|c8\.r/i, brand: { label: "Corvette", shortLabel: "CV", accent: "#f59e0b", countryCode: "US", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#f59e0b", logoSrc: corvetteLogo } },
    { match: /ford|mustang/i, brand: { label: "Ford", shortLabel: "FD", accent: "#2563eb", countryCode: "US", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#2563eb", logoSrc: fordLogo } },
    { match: /mercedes|amg/i, brand: { label: "Mercedes-AMG", shortLabel: "MB", accent: "#cbd5e1", countryCode: "DE", countryColors: ["#111827", "#dc2626", "#facc15"], logoTint: "#cbd5e1", logoSrc: mercedesLogo } },
    { match: /oreca|07|lmp2/i, brand: { label: "Oreca", shortLabel: "OR", accent: "#94a3b8", countryCode: "FR", countryColors: ["#1d4ed8", "#ffffff", "#dc2626"], logoTint: "#cbd5e1", logoSrc: orecaLogo } },
];

export const GENERIC_BRAND_MARK: BrandMark = {
    label: "RaceDirector",
    shortLabel: "RD",
    accent: "#94a3b8",
    countryCode: "INT",
    countryColors: ["#334155", "#cbd5e1", "#334155"],
    logoTint: "#cbd5e1",
    logoSrc: genericLogo,
};
