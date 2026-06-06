import type { DocCategory } from "./saptiva";

export const SEDECO_CATEGORIES: DocCategory[] = [
  {
    label: "Solicitud de Apoyo Económico",
    description: "Petición de financiamiento, crédito, subsidio o apoyo económico para negocio o empresa",
    examples: "apoyo financiero, crédito PyME, subsidio, fondo emprendedor, capital semilla",
  },
  {
    label: "Queja o Denuncia",
    description: "Reporte de irregularidades, quejas sobre trámites, denuncias de corrupción o mal servicio",
    examples: "queja, denuncia, irregularidad, mal servicio, funcionario, corrupción",
  },
  {
    label: "Solicitud de Información",
    description: "Petición de datos, estadísticas, informes o transparencia sobre programas de SEDECO",
    examples: "solicitud de información, transparencia, datos, estadísticas, programas, informe",
  },
  {
    label: "Registro de Empresa o Negocio",
    description: "Trámite para registrar, constituir o formalizar un negocio o empresa en CDMX",
    examples: "registro, constitución, empresa, negocio, persona moral, persona física, RFC, apertura",
  },
  {
    label: "Solicitud de Licencia o Permiso",
    description: "Petición para obtener licencias de funcionamiento, permisos de operación comercial",
    examples: "licencia, permiso, funcionamiento, operación, establecimiento, giro comercial",
  },
  {
    label: "Recurso de Inconformidad",
    description: "Impugnación o recurso contra una resolución, multa o sanción emitida por SEDECO",
    examples: "recurso, inconformidad, impugnación, multa, sanción, resolución, apelación",
  },
  {
    label: "Solicitud de Asesoría",
    description: "Petición de orientación, consultoría o asesoramiento sobre trámites y programas",
    examples: "asesoría, orientación, consulta, información, guía, apoyo técnico",
  },
  {
    label: "Otro",
    description: "Documento que no encaja en las categorías anteriores",
    examples: "otro, misceláneo, general",
  },
];
