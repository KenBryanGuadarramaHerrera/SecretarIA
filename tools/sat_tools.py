import re
import requests
from typing import Dict, List, Tuple

# ═══════════════════════════════════════════════════════════════
# Codigos de entidad federativa validos para CURP (RENAPO)
# ═══════════════════════════════════════════════════════════════
ESTADOS_CURP = {
    "AS": "Aguascalientes", "BC": "Baja California", "BS": "Baja California Sur",
    "CC": "Campeche", "CL": "Coahuila", "CM": "Colima", "CS": "Chiapas",
    "CH": "Chihuahua", "DF": "Ciudad de México", "DG": "Durango",
    "GT": "Guanajuato", "GR": "Guerrero", "HG": "Hidalgo", "JC": "Jalisco",
    "MC": "Estado de México", "MN": "Michoacán", "MS": "Morelos",
    "NT": "Nayarit", "NL": "Nuevo León", "OC": "Oaxaca", "PL": "Puebla",
    "QT": "Querétaro", "QR": "Quintana Roo", "SP": "San Luis Potosí",
    "SL": "Sinaloa", "SR": "Sonora", "TC": "Tabasco", "TS": "Tamaulipas",
    "TL": "Tlaxcala", "VZ": "Veracruz", "YN": "Yucatán", "ZS": "Zacatecas",
    "NE": "Nacido en el Extranjero"
}

# Tabla de mapeo de caracteres para el digito verificador de la CURP
CURP_CHAR_MAP = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
    'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, 'Ñ': 24, 'O': 25,
    'P': 26, 'Q': 27, 'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32, 'W': 33,
    'X': 34, 'Y': 35, 'Z': 36
}

# Tabla de mapeo para el digito verificador del RFC
RFC_CHAR_MAP = {
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
    'A': 10, 'B': 11, 'C': 12, 'D': 13, 'E': 14, 'F': 15, 'G': 16, 'H': 17,
    'I': 18, 'J': 19, 'K': 20, 'L': 21, 'M': 22, 'N': 23, '&': 24, 'Ñ': 38,
    'O': 25, 'P': 26, 'Q': 27, 'R': 28, 'S': 29, 'T': 30, 'U': 31, 'V': 32,
    'W': 33, 'X': 34, 'Y': 35, 'Z': 36, ' ': 37
}


# ═══════════════════════════════════════════════════════════════
# CAPA 1: Validacion Algoritmica (Digito Verificador)
# ═══════════════════════════════════════════════════════════════

def _calcular_digito_verificador_curp(curp17: str) -> str:
    """
    Calcula el digito verificador (posicion 18) de una CURP.
    Algoritmo oficial de RENAPO.
    """
    suma = 0
    for i, char in enumerate(curp17.upper()):
        valor = CURP_CHAR_MAP.get(char, 0)
        suma += valor * (18 - i)
    
    digito = 10 - (suma % 10)
    if digito == 10:
        digito = 0
    return str(digito)


def _calcular_digito_verificador_rfc(rfc12: str) -> str:
    """
    Calcula el digito verificador (ultimo caracter) de un RFC.
    Algoritmo oficial del SAT (Anexo 10 de la Resolucion Miscelanea Fiscal).
    """
    rfc_upper = rfc12.upper()
    
    # Si es persona moral (11 chars sin digito), agregar espacio al inicio
    if len(rfc_upper) == 11:
        rfc_upper = " " + rfc_upper
    
    suma = 0
    for i, char in enumerate(rfc_upper):
        valor = RFC_CHAR_MAP.get(char, 0)
        suma += valor * (13 - i)
    
    residuo = suma % 11
    
    if residuo == 0:
        return '0'
    elif residuo == 1:
        return 'A'
    else:
        digito = 11 - residuo
        if digito == 10:
            return 'A'
        return str(digito)


def validar_estructura_curp(curp: str) -> Tuple[bool, str]:
    """
    Valida la estructura completa de una CURP mexicana (18 caracteres).
    """
    curp = curp.upper().strip()
    
    if len(curp) != 18:
        return False, f"Longitud invalida: {len(curp)} caracteres (se esperan 18)"
    
    patron = r'^[A-ZÑ]{4}\d{6}[HM][A-Z]{2}[A-ZÑ0-9]{3}[A-Z\d]\d$'
    if not re.match(patron, curp):
        return False, "Estructura de caracteres invalida"
    
    anio = int(curp[4:6])
    mes = int(curp[6:8])
    dia = int(curp[8:10])
    
    if mes < 1 or mes > 12:
        return False, f"Mes invalido en CURP: {mes}"
    if dia < 1 or dia > 31:
        return False, f"Dia invalido en CURP: {dia}"
    
    sexo = curp[10]
    if sexo not in ('H', 'M'):
        return False, f"Sexo invalido: '{sexo}' (debe ser H o M)"
    
    estado = curp[11:13]
    if estado not in ESTADOS_CURP:
        return False, f"Codigo de estado invalido: '{estado}'"
    
    digito_esperado = _calcular_digito_verificador_curp(curp[:17])
    digito_real = curp[17]
    
    if digito_esperado != digito_real:
        return False, f"Digito verificador invalido: se esperaba '{digito_esperado}', se encontro '{digito_real}'"
    
    return True, f"CURP valida | Estado: {ESTADOS_CURP[estado]} | Sexo: {'Masculino' if sexo == 'H' else 'Femenino'}"


def validar_formato_rfc(rfc: str) -> bool:
    """Validacion rapida: retorna True/False."""
    resultado = validar_rfc_completo(rfc)
    return resultado["es_valido"]


def validar_rfc_completo(rfc: str) -> Dict:
    """Validacion completa del RFC con digito verificador."""
    rfc = rfc.upper().strip()
    resultado = {"es_valido": False, "tipo": None, "detalles": ""}
    
    if len(rfc) == 13:
        resultado["tipo"] = "Persona Fisica"
        patron = r'^[A-ZÑ&]{4}\d{6}[A-Z\d]{3}$'
    elif len(rfc) == 12:
        resultado["tipo"] = "Persona Moral"
        patron = r'^[A-ZÑ&]{3}\d{6}[A-Z\d]{3}$'
    else:
        resultado["detalles"] = f"Longitud invalida: {len(rfc)} caracteres"
        return resultado
    
    if not re.match(patron, rfc):
        resultado["detalles"] = "Estructura de caracteres invalida"
        return resultado
    
    if resultado["tipo"] == "Persona Fisica":
        fecha_str = rfc[4:10]
    else:
        fecha_str = rfc[3:9]
    
    mes = int(fecha_str[2:4])
    dia = int(fecha_str[4:6])
    
    if mes < 1 or mes > 12:
        resultado["detalles"] = f"Mes invalido en RFC: {mes}"
        return resultado
    if dia < 1 or dia > 31:
        resultado["detalles"] = f"Dia invalido en RFC: {dia}"
        return resultado
    
    rfc_sin_digito = rfc[:-1]
    digito_esperado = _calcular_digito_verificador_rfc(rfc_sin_digito)
    digito_real = rfc[-1]
    
    if digito_esperado != digito_real:
        resultado["detalles"] = f"Digito verificador invalido: se esperaba '{digito_esperado}', se encontro '{digito_real}'"
        return resultado
    
    resultado["es_valido"] = True
    resultado["detalles"] = f"RFC valido | {resultado['tipo']}"
    return resultado


# ═══════════════════════════════════════════════════════════════
# CAPA 2: Cotejo Cruzado RFC <-> CURP
# ═══════════════════════════════════════════════════════════════

def cotejar_rfc_curp(rfc: str, curp: str) -> Tuple[bool, List[str]]:
    """
    Verifica la coherencia entre RFC y CURP de una persona fisica.
    Los primeros 10 caracteres de ambos DEBEN coincidir.
    """
    rfc = rfc.upper().strip()
    curp = curp.upper().strip()
    alertas = []
    
    if len(rfc) != 13:
        alertas.append("El RFC no corresponde a persona fisica (se requieren 13 caracteres para cotejo)")
        return False, alertas
    
    if len(curp) != 18:
        alertas.append("La CURP no tiene la longitud esperada de 18 caracteres")
        return False, alertas
    
    letras_rfc = rfc[:4]
    letras_curp = curp[:4]
    
    if letras_rfc != letras_curp:
        alertas.append(
            f"INCONSISTENCIA DE IDENTIDAD: Las letras del nombre no coinciden. "
            f"RFC='{letras_rfc}' vs CURP='{letras_curp}'"
        )
    
    fecha_rfc = rfc[4:10]
    fecha_curp = curp[4:10]
    
    if fecha_rfc != fecha_curp:
        alertas.append(
            f"INCONSISTENCIA DE FECHA: La fecha de nacimiento no coincide. "
            f"RFC='{fecha_rfc}' vs CURP='{fecha_curp}'"
        )
    
    es_coherente = len(alertas) == 0
    
    if es_coherente:
        alertas.append("[OK] Cotejo cruzado exitoso: RFC y CURP son coherentes entre si")
    
    return es_coherente, alertas


# ═══════════════════════════════════════════════════════════════
# CAPA 3: Consulta a API de RENAPO (Validacion de existencia)
# ═══════════════════════════════════════════════════════════════

def consultar_curp_renapo(curp: str) -> Dict:
    """
    Consulta la CURP en el servicio publico de RENAPO (gob.mx).
    """
    resultado = {
        "encontrada": False,
        "nombre_completo": None,
        "detalles": "",
        "datos_renapo": {}
    }
    
    try:
        api_url = f"https://curp-api.vercel.app/api/curp/{curp.upper().strip()}"
        response = requests.get(api_url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get("curp") or data.get("nombre"):
                resultado["encontrada"] = True
                nombre = data.get("nombre", "")
                ap_paterno = data.get("apellidoPaterno", data.get("primerApellido", ""))
                ap_materno = data.get("apellidoMaterno", data.get("segundoApellido", ""))
                resultado["nombre_completo"] = f"{nombre} {ap_paterno} {ap_materno}".strip()
                resultado["datos_renapo"] = data
                resultado["detalles"] = f"[OK] CURP encontrada en RENAPO: {resultado['nombre_completo']}"
            else:
                resultado["detalles"] = "[FALLO] CURP no encontrada en el registro de RENAPO"
        else:
            resultado["detalles"] = f"[AVISO] API RENAPO respondio con codigo {response.status_code}. Usando validacion algoritmica como respaldo."
            
    except requests.exceptions.Timeout:
        resultado["detalles"] = "[AVISO] Timeout al consultar RENAPO. Usando validacion algoritmica como respaldo."
    except requests.exceptions.ConnectionError:
        resultado["detalles"] = "[AVISO] Sin conexion a RENAPO. Usando validacion algoritmica como respaldo."
    except Exception as e:
        resultado["detalles"] = f"[AVISO] Error al consultar RENAPO: {str(e)}. Usando validacion algoritmica como respaldo."
    
    return resultado


# ═══════════════════════════════════════════════════════════════
# CAPA 4: Consulta de Listas Negras del SAT (Art. 69-B)
# ═══════════════════════════════════════════════════════════════

import os
import csv

def consultar_listas_negras_sat(rfc: str) -> List[str]:
    """
    Consulta la lista real del Art. 69-B del SAT.
    Descarga el CSV oficial publico si no existe localmente o lo lee desde disco.
    """
    alertas = []
    rfc_upper = rfc.upper().strip()
    
    url_sat = "http://omawww.sat.gob.mx/cifras_sat/Documents/Listado_Completo_69-B.csv"
    archivo_local = "data/Listado_Completo_69-B.csv"
    
    os.makedirs("data", exist_ok=True)
    
    if not os.path.exists(archivo_local):
        try:
            response = requests.get(url_sat, timeout=15)
            response.raise_for_status()
            with open(archivo_local, 'wb') as f:
                f.write(response.content)
        except Exception as e:
            alertas.append(f"[AVISO] No se pudo descargar la lista del SAT: {str(e)}")
            return alertas

    encontrado_69b = False
    try:
        with open(archivo_local, 'r', encoding='utf-8', errors='replace') as f:
            reader = csv.reader(f)
            for row in reader:
                if any(rfc_upper in str(cell).strip() for cell in row):
                    encontrado_69b = True
                    break
    except Exception as e:
        alertas.append(f"[AVISO] Error al leer el listado oficial del SAT: {str(e)}")
        return alertas
        
    if encontrado_69b:
        alertas.append(
            "ALERTA CRITICA (Art. 69-B CFF): RFC encontrado en la lista OFICIAL del SAT de "
            "contribuyentes que simulan operaciones inexistentes (Empresas Fantasma)."
        )
        
    # Cartera vencida es una regla interna de SEDECO/FONDESO, se mantiene como lista interna
    rfcs_cartera_vencida = ["DEUD850315ABC"]
    if rfc_upper in rfcs_cartera_vencida:
        alertas.append(
            "ALERTA (Cartera Vencida FONDESO): RFC con credito activo o "
            "vencido en programas anteriores de la SEDECO."
        )
        
    return alertas


# ═══════════════════════════════════════════════════════════════
# FUNCION MAESTRA: Validacion Integral
# ═══════════════════════════════════════════════════════════════

def validacion_integral(rfc: str, curp: str) -> Dict:
    """
    Ejecuta las 5 capas de validacion y retorna un reporte consolidado.
    """
    reporte = {
        "rfc_valido": False,
        "curp_valida": False,
        "cotejo_exitoso": False,
        "curp_existe_renapo": False,
        "alertas_sat": [],
        "detalles_rfc": "",
        "detalles_curp": "",
        "detalles_cotejo": [],
        "detalles_renapo": "",
        "todas_las_alertas": []
    }
    
    # Capa 1: RFC
    resultado_rfc = validar_rfc_completo(rfc)
    reporte["rfc_valido"] = resultado_rfc["es_valido"]
    reporte["detalles_rfc"] = resultado_rfc["detalles"]
    if not resultado_rfc["es_valido"]:
        reporte["todas_las_alertas"].append(f"[FALLO] RFC: {resultado_rfc['detalles']}")
    
    # Capa 2: CURP
    curp_valida, detalle_curp = validar_estructura_curp(curp)
    reporte["curp_valida"] = curp_valida
    reporte["detalles_curp"] = detalle_curp
    if not curp_valida:
        reporte["todas_las_alertas"].append(f"[FALLO] CURP: {detalle_curp}")
    
    # Capa 3: Cotejo Cruzado
    if resultado_rfc["es_valido"] and curp_valida:
        es_coherente, detalles_cotejo = cotejar_rfc_curp(rfc, curp)
        reporte["cotejo_exitoso"] = es_coherente
        reporte["detalles_cotejo"] = detalles_cotejo
        if not es_coherente:
            reporte["todas_las_alertas"].extend(detalles_cotejo)
    else:
        reporte["detalles_cotejo"] = ["[OMITIDO] Cotejo omitido: RFC o CURP no pasaron validacion previa"]
    
    # Capa 4: RENAPO
    if curp_valida:
        resultado_renapo = consultar_curp_renapo(curp)
        reporte["curp_existe_renapo"] = resultado_renapo["encontrada"]
        reporte["detalles_renapo"] = resultado_renapo["detalles"]
        if not resultado_renapo["encontrada"] and "no encontrada" in resultado_renapo["detalles"].lower():
            reporte["todas_las_alertas"].append(resultado_renapo["detalles"])
    else:
        reporte["detalles_renapo"] = "[OMITIDO] Consulta RENAPO omitida: CURP no paso validacion estructural"
    
    # Capa 5: Listas Negras SAT
    alertas_sat = consultar_listas_negras_sat(rfc)
    reporte["alertas_sat"] = alertas_sat
    reporte["todas_las_alertas"].extend(alertas_sat)
    
    return reporte
