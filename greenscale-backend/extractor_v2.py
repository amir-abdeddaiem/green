"""Intelligent extractor v2 (environmental data & carbon accounting).

This module provides a structured extraction pipeline that can be used as a
fallback when table-oriented parsing fails (OCR noise, missing headers, etc.).

Public API:
- extraire_donnees_environnementales(texte_ocr) -> ResultatExtraction
"""

from __future__ import annotations

import json
import re
from abc import ABC, abstractmethod
from collections import Counter
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple


EMISSION_FACTORS: Dict[str, Dict[str, Any]] = {
    "electricite": {
        "facteur_kg_co2_par_kwh": 0.475,
        "source": "ANME / IEA 2024 — mix électrique Tunisie",
        "unite": "kWh",
    },
    "gaz_naturel": {
        "facteur_kg_co2_par_m3": 2.0,
        "facteur_kg_co2_par_kwh": 0.205,
        "source": "ADEME Base Carbone 2024",
        "unite": "kWh ou m³",
    },
    "eau": {
        "facteur_kg_co2_par_m3": 0.344,
        "source": "Water UK / ADEME 2024 — traitement + distribution",
        "unite": "m³",
    },
    "essence": {
        "facteur_kg_co2_par_litre": 2.31,
        "source": "ADEME Base Carbone 2024",
        "unite": "litres",
    },
    "diesel": {
        "facteur_kg_co2_par_litre": 2.68,
        "source": "ADEME Base Carbone 2024",
        "unite": "litres",
    },
    "gpl": {
        "facteur_kg_co2_par_litre": 1.66,
        "source": "ADEME Base Carbone 2024",
        "unite": "litres",
    },
}


_TYPE_KEYWORDS: Dict[str, List[str]] = {
    "electricite": [
        "steg",
        "électricité",
        "electricite",
        "electricity",
        "kwh",
        "kilowatt",
        "compteur électrique",
        "consommation electrique",
        "tarif electricite",
        "puissance souscrite",
        "heures pleines",
        "heures creuses",
        "كهرباء",
        "استهلاك الكهرباء",
        "فاتورة كهرباء",
        "عداد كهربائي",
        "كيلوواط",
        "طاقة",
    ],
    "gaz_naturel": [
        "gaz naturel",
        "natural gas",
        "m³ gaz",
        "thermie",
        "consommation gaz",
        "compteur gaz",
        "total gaz",
        "gaz-natur",
        "gaz-naturel",
        "غاز",
        "غاز طبيعي",
        "استهلاك الغاز",
        "فاتورة غاز",
    ],
    "eau": [
        "eau",
        "sonede",
        "eau potable",
        "water",
        "consommation eau",
        "m³ eau",
        "assainissement",
        "compteur eau",
        "facture eau",
        "tarif eau",
        "ماء",
        "مياه",
        "استهلاك الماء",
        "فاتورة ماء",
        "صرف صحي",
    ],
    "essence": [
        "essence",
        "gasoline",
        "sans plomb",
        "sp95",
        "sp98",
        "بنزين",
        "وقود",
    ],
    "diesel": [
        "diesel",
        "gasoil",
        "gazole",
        "ديزل",
        "مازوت",
    ],
    "gpl": [
        "gpl",
        "lpg",
        "butane",
        "propane",
        "غاز مسال",
        "بوتان",
        "بروبان",
    ],
}


@dataclass
class DonneeEnvironnementale:
    champ: str
    valeur: Optional[str] = None
    unite: Optional[str] = None
    confiance: float = 0.0


@dataclass
class ResultatExtraction:
    type_facture: str = "inconnu"
    fournisseur: Optional[str] = None
    periode: Optional[str] = None
    donnees: List[DonneeEnvironnementale] = field(default_factory=list)
    emission_co2_kg: Optional[float] = None
    facteur_emission_utilise: Optional[str] = None
    source_facteur: Optional[str] = None
    resume: str = ""

    reference_facture: Optional[str] = None
    reference_client: Optional[str] = None
    adresse: Optional[str] = None
    types_energie: List[str] = field(default_factory=list)
    detail_co2: List[Dict[str, Any]] = field(default_factory=list)
    score_global: float = 0.0
    alertes: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        d = asdict(self)
        if d.get("emission_co2_kg") is not None:
            d["emission_co2_kg"] = round(d["emission_co2_kg"], 3)
        return d

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), ensure_ascii=False, indent=indent)


@dataclass
class TextZones:
    texte_complet: str
    texte_lower: str
    entete: str = ""
    consommation: str = ""
    electricite: str = ""
    gaz: str = ""
    montants: str = ""
    taxes: str = ""
    pied: str = ""


def _normalize(text: str) -> str:
    return text.lower().replace("\n", " ").replace("\r", " ")


def _parse_zones_steg(text: str, text_lower: str) -> TextZones:
    zones = TextZones(texte_complet=text, texte_lower=text_lower)

    m_conso = re.search(r"consommation", text, re.IGNORECASE)
    if m_conso:
        zones.entete = text[: m_conso.start()]
        rest = text[m_conso.start() :]
    else:
        zones.entete = text[:300]
        rest = text

    zones.consommation = rest

    elec_match = re.search(
        r"(electricit[ée].*?)(?=total\s*gaz|redevances?\s*fixes.*?gaz|\bgaz\b\s+redevance)",
        rest,
        re.IGNORECASE | re.DOTALL,
    )
    if elec_match:
        zones.electricite = elec_match.group(1)

    gaz_match = re.search(
        r"(?:total\s*electricit[ée]|مجموع\s*الكهرباء)(.*?)(?:total\s*gaz|مجموع\s*الغاز|total\s*services)",
        rest,
        re.IGNORECASE | re.DOTALL,
    )
    if gaz_match:
        zones.gaz = gaz_match.group(1)

    montant_match = re.search(
        r"(montant\s*total.*?)(?:bulletin|versement|fermer|$)",
        rest,
        re.IGNORECASE | re.DOTALL,
    )
    if montant_match:
        zones.montants = montant_match.group(1)

    pied_match = re.search(r"(bulletin\s*de\s*versement.*)", rest, re.IGNORECASE | re.DOTALL)
    if pied_match:
        zones.pied = pied_match.group(1)

    taxes_match = re.search(
        r"((?:contribution|taxe|tva|fte|redevance).*?)(?:montant\s*total|bulletin|$)",
        rest,
        re.IGNORECASE | re.DOTALL,
    )
    if taxes_match:
        zones.taxes = taxes_match.group(1)

    return zones


def _parse_zones_sonede(text: str, text_lower: str) -> TextZones:
    zones = TextZones(texte_complet=text, texte_lower=text_lower)
    m_conso = re.search(r"consommation", text, re.IGNORECASE)
    if m_conso:
        zones.entete = text[: m_conso.start()]
    else:
        zones.entete = text[:300]
    zones.consommation = text
    montant_match = re.search(r"((?:montant|total|net).*)", text, re.IGNORECASE | re.DOTALL)
    if montant_match:
        zones.montants = montant_match.group(1)
    return zones


def _parse_zones_generic(text: str, text_lower: str) -> TextZones:
    zones = TextZones(texte_complet=text, texte_lower=text_lower)
    zones.entete = text[: min(500, len(text))]
    zones.consommation = text
    zones.montants = text
    return zones


class ExtractionStrategy(ABC):
    def __init__(self, zones: TextZones):
        self.zones = zones
        self.text = zones.texte_complet
        self.text_lower = zones.texte_lower

    @abstractmethod
    def extract_consumption(self) -> List[DonneeEnvironnementale]:
        raise NotImplementedError

    @abstractmethod
    def extract_amounts(self) -> List[DonneeEnvironnementale]:
        raise NotImplementedError

    def extract_period(self) -> Optional[str]:
        return _extract_period_generic(self.text)

    def extract_reference(self) -> Tuple[Optional[str], Optional[str]]:
        return _extract_references_generic(self.text, self.text_lower)

    def extract_address(self) -> Optional[str]:
        return _extract_address_generic(self.text)

    def detect_energy_types(self) -> List[str]:
        return _detect_all_types(self.text_lower)


class STEGStrategy(ExtractionStrategy):
    def extract_consumption(self) -> List[DonneeEnvironnementale]:
        donnees: List[DonneeEnvironnementale] = []

        elec_kwh = self._extract_steg_electricity()
        if elec_kwh is not None:
            donnees.append(
                DonneeEnvironnementale(
                    champ="Énergie consommée (électricité)",
                    valeur=str(elec_kwh),
                    unite="kWh",
                    confiance=0.90,
                )
            )

        gaz_m3 = self._extract_steg_gas()
        if gaz_m3 is not None:
            donnees.append(
                DonneeEnvironnementale(
                    champ="Volume consommé (gaz)",
                    valeur=str(gaz_m3),
                    unite="m³",
                    confiance=0.85,
                )
            )

        return donnees

    def _extract_steg_electricity(self) -> Optional[int]:
        candidates: List[Tuple[str, int, float]] = []

        for pat in [
            r"quantit[ée]\s*(?:\(\d\))?\s+(\d+)",
            r"[ée]quantit[ée]?\s+(\d+)",
        ]:
            for m in re.finditer(pat, self.text, re.IGNORECASE):
                val = int(m.group(1))
                if 1 <= val <= 100_000:
                    candidates.append(("quantite_label", val, 0.90))

        for m in re.finditer(r"(\d+)\s*kwh", self.text, re.IGNORECASE):
            val = int(m.group(1))
            if 1 <= val <= 100_000:
                candidates.append(("kwh_unit", val, 0.85))

        idx_match = re.search(r"(\d{4,7})\s+(\d{4,7})", self.zones.electricite or self.text)
        if idx_match:
            a, b = int(idx_match.group(1)), int(idx_match.group(2))
            diff = abs(a - b)
            if 1 <= diff <= 100_000:
                candidates.append(("index_diff", diff, 0.80))

        if not candidates:
            return None

        values = [c[1] for c in candidates]
        counts = Counter(values)
        best_val, _best_count = counts.most_common(1)[0]
        return best_val

    def _extract_steg_gas(self) -> Optional[int]:
        ref_numbers = set()
        ref_match = re.search(r"[Rr][ée]f[ée]rence\s*:\s*([\d\s]+\d)", self.text)
        if ref_match:
            for part in re.findall(r"\d+", ref_match.group(1)):
                ref_numbers.add(int(part))

        has_gaz_conso = bool(
            re.search(
                r"gaz[\s-]*natur|sg\d{6,}|\bgaz\b[^a-z]*\d{2,5}\s+\d{3,7}\s+\d{3,7}|"
                r"gaz\b[^a-z]*redevance|غاز\s*طبيعي",
                self.text,
                re.IGNORECASE,
            )
        )
        if not has_gaz_conso:
            return None

        if self.zones.gaz:
            result = self._find_gas_quantity_in_zone(self.zones.gaz, ref_numbers)
            if result is not None:
                return result

        gaz_section = re.search(
            r"(?:total\s*electricit[ée]|مجموع\s*الكهرباء)" r"(.*?)" r"(?:total\s*gaz|مجموع\s*الغاز)",
            self.text,
            re.IGNORECASE | re.DOTALL,
        )
        if gaz_section:
            result = self._find_gas_quantity_in_zone(gaz_section.group(1), ref_numbers)
            if result is not None:
                return result

        return None

    def _find_gas_quantity_in_zone(self, zone_text: str, exclude: Optional[set] = None) -> Optional[int]:
        if exclude is None:
            exclude = set()
        candidates = re.findall(r"(?<![.\d])(\d{2,5})(?!\.\d)", zone_text)
        for c in candidates:
            cv = int(c)
            if 50 <= cv <= 2000 and not (2000 <= cv <= 2100) and cv not in exclude:
                return cv
        return None

    def extract_amounts(self) -> List[DonneeEnvironnementale]:
        return _extract_amounts_generic(self.text)

    def extract_period(self) -> Optional[str]:
        dates = re.findall(r"(\d{4}-\d{2}-\d{2})", self.text)
        if len(dates) >= 2:
            unique = sorted(set(dates))
            if len(unique) >= 2:
                return f"{unique[0]} au {unique[1]}"
            s = sorted(dates[:2])
            return f"{s[0]} au {s[1]}"
        return _extract_period_generic(self.text)

    def extract_reference(self) -> Tuple[Optional[str], Optional[str]]:
        ref_facture = None
        ref_client = None

        m = re.search(r"[Rr][ée]f[ée]rence\s*:\s*([\d\s]+\d)", self.text)
        if m:
            ref_facture = re.sub(r"\s+", "", m.group(1).strip())

        m = re.search(r"(?:d[ée]pannage|district)\s*[:\s]*(\d+)", self.text, re.IGNORECASE)
        if m:
            ref_client = m.group(1).strip()

        return ref_facture, ref_client


class SONEDEStrategy(ExtractionStrategy):
    def extract_consumption(self) -> List[DonneeEnvironnementale]:
        return _extract_consumption_generic(self.text, self.text_lower)

    def extract_amounts(self) -> List[DonneeEnvironnementale]:
        return _extract_amounts_generic(self.text)


class GenericStrategy(ExtractionStrategy):
    def extract_consumption(self) -> List[DonneeEnvironnementale]:
        return _extract_consumption_generic(self.text, self.text_lower)

    def extract_amounts(self) -> List[DonneeEnvironnementale]:
        return _extract_amounts_generic(self.text)


def _detect_all_types(text_lower: str) -> List[str]:
    scores: Dict[str, int] = {}
    for type_name, keywords in _TYPE_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[type_name] = score

    if not scores:
        return ["inconnu"]

    sorted_types = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    max_score = sorted_types[0][1]
    threshold = max(1, int(max_score * 0.3))
    return [t for t, s in sorted_types if s >= threshold]


def _detect_fournisseur(text_lower: str) -> Optional[str]:
    if "steg" in text_lower or "للكهرباء والغاز" in text_lower:
        return "STEG"
    if "sonede" in text_lower or "توزيع المياه" in text_lower:
        return "SONEDE"
    return None


def _extract_period_generic(text: str) -> Optional[str]:
    period_patterns = [
        r"(?:du|from|période|periode)\s*[:\s]?\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})\s*(?:au|to|[-–])\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})",
        r"(?:من)\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})\s*(?:إلى|الى)\s*(\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4})",
        r"(\d{4}-\d{2}-\d{2})\s*[:\s]*(?:إل[يى]|à|au|to)?\s*[:\s]*(\d{4}-\d{2}-\d{2})",
    ]
    for pat in period_patterns:
        match = re.search(pat, text, re.IGNORECASE)
        if match:
            groups = [g for g in match.groups() if g]
            if len(groups) > 1:
                sorted_dates = sorted(groups[:2])
                return f"{sorted_dates[0]} au {sorted_dates[1]}"
            return groups[0]
    return None


def _extract_references_generic(text: str, text_lower: str) -> Tuple[Optional[str], Optional[str]]:
    ref_facture = None
    ref_client = None

    for pat in [
        r"(?:r[ée]f[ée]rence|n[°o\.]\s*facture|invoice\s*(?:no?|#)|رقم\s*الفاتورة)\s*[:\s]*([\w\d/\-]+)",
        r"(?:facture\s*n[°o])\s*[:\s]*([\w\d/\-]+)",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            ref_facture = m.group(1).strip()
            break

    for pat in [
        r"(?:r[ée]f[ée]rence\s*client|n[°o\.]\s*client|n[°o\.]\s*abonn[ée]|n[°o\.]\s*compteur|customer\s*(?:no?|#|ref)|رقم\s*العميل|رقم\s*المشترك)\s*[:\s]*([\w\d/\-]+)",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            ref_client = m.group(1).strip()
            break

    return ref_facture, ref_client


def _extract_address_generic(text: str) -> Optional[str]:
    for pat in [
        r"(?:adresse|address|عنوان)\s*[:\s]*(.{10,80}?)(?:\n|$)",
        r"((?:نهج|شارع|حي|طريق)\s+.{5,60})",
        r"((?:rue|avenue|boulevard|bd|impasse)\s+.{5,60})",
    ]:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            addr = re.sub(r"\s+", " ", m.group(0).strip())
            if len(addr) > 10:
                return addr
    return None


def _extract_consumption_generic(text: str, text_lower: str) -> List[DonneeEnvironnementale]:
    donnees: List[DonneeEnvironnementale] = []

    for match in re.finditer(r"([\d\s.,]+)\s*(kwh)", text, re.IGNORECASE):
        val = match.group(1).replace(" ", "").replace(",", ".")
        try:
            fv = float(val)
            if 1 <= fv <= 100_000:
                donnees.append(
                    DonneeEnvironnementale(
                        champ="Énergie consommée",
                        valeur=val,
                        unite="kWh",
                        confiance=0.80,
                    )
                )
                break
        except ValueError:
            pass

    for match in re.finditer(r"([\d\s.,]+)\s*(m[³3]|m\s*cube)", text, re.IGNORECASE):
        val = match.group(1).replace(" ", "").replace(",", ".")
        try:
            fv = float(val)
            if 0.1 <= fv <= 100_000:
                label = (
                    "Volume consommé (eau)"
                    if ("eau" in text_lower or "sonede" in text_lower)
                    else "Volume consommé (gaz)"
                )
                donnees.append(
                    DonneeEnvironnementale(
                        champ=label,
                        valeur=val,
                        unite="m³",
                        confiance=0.80,
                    )
                )
                break
        except ValueError:
            pass

    return donnees


def _extract_amounts_generic(text: str) -> List[DonneeEnvironnementale]:
    donnees: List[DonneeEnvironnementale] = []

    amount_patterns = [
        (r"montant\s*(?:à|a)\s*payer[:\s]*([\d\s.,]+)", "Montant à payer", 0.90),
        (r"total\s*ttc[:\s]*([\d\s.,]+)", "Total TTC", 0.85),
        (r"montant\s*total[:\s]*([\d\s.,]*\d)", "Montant total", 0.80),
    ]

    seen: set[str] = set()
    for pat, champ, conf in amount_patterns:
        for match in re.finditer(pat, text, re.IGNORECASE):
            val = match.group(1).replace(" ", "").replace(",", ".")
            try:
                fval = float(val)
                if fval < 0.01:
                    continue
            except ValueError:
                continue
            if val not in seen:
                seen.add(val)
                donnees.append(
                    DonneeEnvironnementale(
                        champ=champ,
                        valeur=val,
                        unite="DT",
                        confiance=conf,
                    )
                )

    return donnees


def _calculate_co2_combined(
    donnees: List[DonneeEnvironnementale],
    types_energie: List[str],
) -> Tuple[Optional[float], List[Dict[str, Any]], Optional[str], Optional[str]]:
    total_co2 = 0.0
    detail: List[Dict[str, Any]] = []

    for d in donnees:
        try:
            val = float(d.valeur) if d.valeur else 0
        except (ValueError, TypeError):
            continue
        if val <= 0:
            continue

        if d.unite == "kWh" and "electricite" in types_energie:
            f = EMISSION_FACTORS["electricite"]
            co2 = val * f["facteur_kg_co2_par_kwh"]
            detail.append(
                {
                    "type": "electricite",
                    "consommation": val,
                    "unite": "kWh",
                    "facteur": f["facteur_kg_co2_par_kwh"],
                    "co2_kg": round(co2, 3),
                    "source": f["source"],
                }
            )
            total_co2 += co2

        elif d.unite == "m³" and "gaz" in d.champ.lower():
            f = EMISSION_FACTORS["gaz_naturel"]
            co2 = val * f["facteur_kg_co2_par_m3"]
            detail.append(
                {
                    "type": "gaz_naturel",
                    "consommation": val,
                    "unite": "m³",
                    "facteur": f["facteur_kg_co2_par_m3"],
                    "co2_kg": round(co2, 3),
                    "source": f["source"],
                }
            )
            total_co2 += co2

    if total_co2 == 0:
        return None, [], None, None

    sources = list({d["source"] for d in detail})
    facteurs = " + ".join(f"{d['facteur']} kg CO₂/{d['unite']}" for d in detail)
    return round(total_co2, 3), detail, facteurs, " ; ".join(sources)


def _cross_validate(result: ResultatExtraction) -> List[str]:
    alertes: List[str] = []

    conso_kwh: Optional[float] = None
    best_montant: Optional[float] = None

    for d in result.donnees:
        try:
            val = float(d.valeur) if d.valeur else 0
        except (ValueError, TypeError):
            continue
        if d.unite == "kWh" and val > 0:
            conso_kwh = val
        if "payer" in d.champ.lower() and val > 0:
            best_montant = val

    if conso_kwh and best_montant:
        tarif = best_montant / conso_kwh
        if tarif < 0.05 or tarif > 2.0:
            alertes.append(f"⚠ Tarif estimé ({tarif:.3f} DT/kWh) hors plage [0.05-2.0]")

    if result.periode:
        dates = re.findall(r"(\d{4})-(\d{2})-(\d{2})", result.periode)
        if len(dates) >= 2:
            try:
                d1 = datetime(int(dates[0][0]), int(dates[0][1]), int(dates[0][2]))
                d2 = datetime(int(dates[1][0]), int(dates[1][1]), int(dates[1][2]))
                delta = (d2 - d1).days
                if delta < 0:
                    alertes.append("⚠ Période inversée")
            except ValueError:
                pass

    return alertes


def _calculate_global_score(result: ResultatExtraction) -> float:
    score = 0.0
    if result.type_facture != "inconnu":
        score += 0.2
    if result.fournisseur:
        score += 0.2
    if result.periode:
        score += 0.2
    if any(d.unite in ("kWh", "m³", "litres") for d in result.donnees):
        score += 0.2
    if any("montant" in d.champ.lower() or "payer" in d.champ.lower() for d in result.donnees):
        score += 0.2
    return round(min(1.0, score), 2)


def extraire_donnees_environnementales(texte_ocr: str) -> ResultatExtraction:
    if not texte_ocr or not texte_ocr.strip():
        return ResultatExtraction(resume="Aucun texte à analyser.")

    text_lower = _normalize(texte_ocr)
    result = ResultatExtraction()

    result.fournisseur = _detect_fournisseur(text_lower)
    result.types_energie = _detect_all_types(text_lower)
    result.type_facture = result.types_energie[0] if result.types_energie else "inconnu"

    if result.fournisseur == "STEG":
        zones = _parse_zones_steg(texte_ocr, text_lower)
        strategy: ExtractionStrategy = STEGStrategy(zones)
    elif result.fournisseur == "SONEDE":
        zones = _parse_zones_sonede(texte_ocr, text_lower)
        strategy = SONEDEStrategy(zones)
    else:
        zones = _parse_zones_generic(texte_ocr, text_lower)
        strategy = GenericStrategy(zones)

    result.periode = strategy.extract_period()

    ref_f, ref_c = strategy.extract_reference()
    result.reference_facture = ref_f
    result.reference_client = ref_c

    result.adresse = strategy.extract_address()

    result.donnees.extend(strategy.extract_consumption())
    result.donnees.extend(strategy.extract_amounts())

    total_co2, detail, facteur_str, source = _calculate_co2_combined(result.donnees, result.types_energie)
    if total_co2 is not None:
        result.emission_co2_kg = total_co2
        result.facteur_emission_utilise = facteur_str
        result.source_facteur = source
        result.detail_co2 = detail

    result.alertes = _cross_validate(result)
    result.score_global = _calculate_global_score(result)

    return result


def result_to_consumption_rows(res: ResultatExtraction) -> List[Dict[str, Any]]:
    """Map v2 result to the UI's consumptionRows shape.

    Output rows: {libelle, consommation, montant, periode}
    Strategy:
    - If we have electricity kWh -> row libelle='ELECTRICITE'
    - If we have gas m³ -> row libelle='GAZ-NATUR'
    - Montant: use 'Montant à payer' if available else first amount
    - Periode: use res.periode
    """

    montant: Optional[str] = None
    for d in res.donnees:
        if d.valeur and "payer" in d.champ.lower():
            montant = d.valeur
            break
    if montant is None:
        for d in res.donnees:
            if d.valeur and "montant" in d.champ.lower():
                montant = d.valeur
                break

    elec: Optional[str] = None
    gaz: Optional[str] = None
    for d in res.donnees:
        if not d.valeur or not d.unite:
            continue
        if d.unite.lower() == "kwh" and "electric" in d.champ.lower():
            elec = d.valeur
        if d.unite in ("m³", "m3") and "gaz" in d.champ.lower():
            gaz = d.valeur

    rows: List[Dict[str, Any]] = []
    if elec is not None:
        rows.append(
            {
                "libelle": "ELECTRICITE",
                "consommation": elec,
                "montant": montant,
                "periode": res.periode,
            }
        )
    if gaz is not None:
        rows.append(
            {
                "libelle": "GAZ-NATUR",
                "consommation": gaz,
                "montant": montant,
                "periode": res.periode,
            }
        )

    return rows
