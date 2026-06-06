export type InboxItem = {
  folio: string; name: string; type: string; summary: string; category: string;
  received: string; days: number; priority: "urgente" | "normal" | "bajo";
  status: "nuevo" | "revision" | "pendiente" | "resuelto";
  curp: string; rfc: string; giro: string; area: string;
  legalDays: number; legalUsed: number; featured?: boolean;
  detail: { resumen: string; accion: string; prioridadTxt: string; docs: { name: string; ok: boolean }[] };
};

export type FolioData = {
  tipo: string; estado: string; estadoLabel: string;
  enviado: string; area: string; restante: string;
  pendiente: { titulo: string; desc: string } | null;
  historial: { when: string; what: string }[];
};

export type ConsultaItem = {
  q: string[]; cat: string; answer: string; docs: string[]; costo: string; tiempo: string;
};

export const INBOX: InboxItem[] = [
  {
    folio: "SED-2025-004834", name: "Comercializadora Vértice S.A.", type: "Recurso de inconformidad",
    summary: "Impugna negativa de licencia de funcionamiento emitida el 28 de mayo; solicita revisión.",
    category: "Recurso", received: "Hoy, 8:10am", days: 1, priority: "urgente", status: "nuevo",
    curp: "—", rfc: "CVE180922QX3", giro: "Comercio al mayoreo", area: "—", legalDays: 5, legalUsed: 1,
    detail: {
      resumen: "Persona moral impugna la negativa de su licencia de funcionamiento. Argumenta que la documentación presentada era completa. Requiere revisión jurídica prioritaria por tratarse de un recurso con plazo legal estricto.",
      accion: "Turnar a la Dirección Jurídica para dictamen. Plazo legal de respuesta improrrogable. Verificar expediente original folio SED-2025-004511.",
      prioridadTxt: "MÁXIMA · Recurso con plazo legal",
      docs: [{ name: "Escrito de inconformidad.pdf", ok: true }, { name: "Resolución impugnada.pdf", ok: true }, { name: "Poder notarial.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004833", name: "Bar La Cantina del Centro", type: "Licencia con venta de alcohol",
    summary: "Solicita licencia de funcionamiento con venta de bebidas alcohólicas para bar de 180 m² en Centro Histórico.",
    category: "Alcohol", received: "Hoy, 9:02am", days: 1, priority: "urgente", status: "nuevo",
    curp: "ROML900512HDFXXX08", rfc: "ROML900512JK2", giro: "Bar / bebidas alcohólicas", area: "180 m² — Impacto vecinal", legalDays: 10, legalUsed: 1,
    detail: {
      resumen: "Solicitud de licencia con venta de alcohol para bar de 180 m² en Centro Histórico. Giro de impacto vecinal: requiere dictamen de Protección Civil y opinión de uso de suelo. Documentación parcialmente completa.",
      accion: "Verificar anuencia vecinal y dictamen de Protección Civil antes de continuar. Giro con alcohol requiere visita de verificación.",
      prioridadTxt: "ALTA · Giro con alcohol",
      docs: [{ name: "Identificación oficial.pdf", ok: true }, { name: "Comprobante domicilio.pdf", ok: true }, { name: "Dictamen Protección Civil.pdf", ok: false }, { name: "Uso de suelo.jpg", ok: true }]
    }
  },
  {
    folio: "SED-2025-004828", name: "Restaurante El Fogón", type: "Licencia con venta de alcohol",
    summary: "Renovación de licencia con venta de alcohol para restaurante de 220 m² en Roma Norte.",
    category: "Alcohol", received: "Ayer, 5:40pm", days: 2, priority: "urgente", status: "revision",
    curp: "SAGT820114MDFXXX01", rfc: "SAGT820114PP9", giro: "Restaurante / bebidas alcohólicas", area: "220 m² — Impacto vecinal", legalDays: 10, legalUsed: 2,
    detail: {
      resumen: "Renovación de licencia con venta de alcohol para restaurante en Roma Norte. Antecedente sin observaciones. Documentación completa y vigente.",
      accion: "Proceder con renovación. Validar que no existan adeudos ni reportes vecinales en el último periodo.",
      prioridadTxt: "ALTA · Giro con alcohol",
      docs: [{ name: "Licencia anterior.pdf", ok: true }, { name: "Identificación oficial.pdf", ok: true }, { name: "Dictamen Protección Civil.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004821", name: "Juan García Pérez", type: "Aviso de funcionamiento",
    summary: "Solicita aviso de funcionamiento para cafetería de 85 m² sin venta de alcohol en Col. Del Valle.",
    category: "Bajo impacto", received: "3 jun, 2:00pm", days: 2, priority: "normal", status: "revision",
    curp: "GAPJ850312HDFRCN02", rfc: "GAPJ850312AB1", giro: "Cafetería / alimentos sin alcohol", area: "85 m² — Bajo impacto", legalDays: 5, legalUsed: 3, featured: true,
    detail: {
      resumen: "El ciudadano Juan García solicita aviso de funcionamiento para cafetería de 85 m² sin venta de alcohol en Col. Del Valle. Documentación completa. Sin observaciones.",
      accion: "Proceder con aprobación. Todos los documentos están en orden. No se requieren visitas de verificación para giros de bajo impacto sin alcohol.",
      prioridadTxt: "BAJA · Documentación completa",
      docs: [{ name: "Identificación oficial (INE).pdf", ok: true }, { name: "Comprobante de domicilio.pdf", ok: true }, { name: "CURP.pdf", ok: true }, { name: "Croquis del local.jpg", ok: true }]
    }
  },
  {
    folio: "SED-2025-004815", name: "Panadería La Espiga", type: "Aviso de funcionamiento",
    summary: "Aviso de funcionamiento para panadería de 60 m² en Iztacalco, giro de bajo impacto.",
    category: "Bajo impacto", received: "3 jun, 11:20am", days: 2, priority: "normal", status: "revision",
    curp: "MEHL880420MDFXXX04", rfc: "MEHL880420Q2A", giro: "Panadería / alimentos", area: "60 m² — Bajo impacto", legalDays: 5, legalUsed: 2,
    detail: {
      resumen: "Aviso de funcionamiento para panadería de 60 m² en Iztacalco. Giro de bajo impacto sin venta de alcohol. Documentación completa.",
      accion: "Proceder con aprobación. Giro de bajo impacto, no requiere verificación presencial.",
      prioridadTxt: "BAJA · Documentación completa",
      docs: [{ name: "Identificación oficial.pdf", ok: true }, { name: "Comprobante domicilio.pdf", ok: true }, { name: "CURP.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004809", name: "Estética Glamour", type: "Aviso de funcionamiento",
    summary: "Aviso de funcionamiento para estética de 45 m² en Benito Juárez.",
    category: "Bajo impacto", received: "2 jun, 4:05pm", days: 3, priority: "normal", status: "pendiente",
    curp: "RUVA950708MDFXXX09", rfc: "RUVA950708LL5", giro: "Estética / servicios", area: "45 m² — Bajo impacto", legalDays: 5, legalUsed: 3,
    detail: {
      resumen: "Aviso de funcionamiento para estética de 45 m² en Benito Juárez. Falta comprobante de domicilio legible.",
      accion: "Solicitar al ciudadano comprobante de domicilio legible. El documento subido es ilegible.",
      prioridadTxt: "BAJA · Pendiente documento",
      docs: [{ name: "Identificación oficial.pdf", ok: true }, { name: "Comprobante domicilio.jpg", ok: false }, { name: "CURP.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004802", name: "Tecnologías Maya S.C.", type: "Apoyo económico FONDESO",
    summary: "Solicita crédito para mipyme tecnológica por $150,000 a través de FONDESO.",
    category: "Apoyo PyME", received: "2 jun, 10:30am", days: 3, priority: "normal", status: "revision",
    curp: "—", rfc: "TMA190305RT7", giro: "Servicios tecnológicos", area: "—", legalDays: 15, legalUsed: 3,
    detail: {
      resumen: "Mipyme del sector tecnológico solicita crédito FONDESO por $150,000 para capital de trabajo. Plan de negocio adjunto. Empresa con 2 años de operación.",
      accion: "Validar estados financieros y antigüedad fiscal. Turnar a comité de evaluación FONDESO.",
      prioridadTxt: "NORMAL · Evaluación financiera",
      docs: [{ name: "Plan de negocio.pdf", ok: true }, { name: "Estados financieros.pdf", ok: true }, { name: "Acta constitutiva.pdf", ok: true }, { name: "RFC.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004788", name: "Carlos Mendoza Ruiz", type: "Solicitud de transparencia",
    summary: "Solicita información sobre número de licencias otorgadas en la alcaldía Cuauhtémoc en 2025.",
    category: "Transparencia", received: "31 may, 9:00am", days: 5, priority: "bajo", status: "pendiente",
    curp: "—", rfc: "—", giro: "—", area: "—", legalDays: 9, legalUsed: 5,
    detail: {
      resumen: "Solicitud de acceso a la información pública sobre licencias otorgadas en Cuauhtémoc durante 2025. Requiere compilación de datos estadísticos.",
      accion: "Turnar a la Unidad de Transparencia. Compilar datos del periodo solicitado.",
      prioridadTxt: "INFORMATIVO · Transparencia",
      docs: [{ name: "Solicitud INAI.pdf", ok: true }]
    }
  },
  {
    folio: "SED-2025-004780", name: "Tortillería El Comal", type: "Consulta general",
    summary: "Pregunta requisitos para regularizar un negocio que ya opera sin aviso de funcionamiento.",
    category: "Consulta", received: "30 may, 3:40pm", days: 6, priority: "bajo", status: "nuevo",
    curp: "—", rfc: "—", giro: "Tortillería", area: "—", legalDays: 9, legalUsed: 6,
    detail: {
      resumen: "Consulta sobre regularización de negocio en operación sin aviso de funcionamiento. No constituye trámite formal, requiere orientación.",
      accion: "Responder con orientación sobre el proceso de regularización y los requisitos aplicables.",
      prioridadTxt: "INFORMATIVO · Consulta",
      docs: []
    }
  },
  {
    folio: "SED-2025-004771", name: "Laura Jiménez", type: "Consulta general",
    summary: "Pregunta si necesita permiso para vender comida en un tianguis los fines de semana.",
    category: "Consulta", received: "29 may, 12:10pm", days: 7, priority: "bajo", status: "nuevo",
    curp: "—", rfc: "—", giro: "Comercio en vía pública", area: "—", legalDays: 9, legalUsed: 7,
    detail: {
      resumen: "Consulta sobre permisos para comercio en tianguis. Requiere orientación sobre la dependencia competente y los requisitos.",
      accion: "Orientar sobre el trámite de comercio en mercados sobre ruedas y canalizar a la alcaldía correspondiente.",
      prioridadTxt: "INFORMATIVO · Consulta",
      docs: []
    }
  }
];

export const FOLIOS: Record<string, FolioData> = {
  "SED-2025-004821": {
    tipo: "Aviso de Funcionamiento — Bajo Impacto", estado: "revision", estadoLabel: "En revisión",
    enviado: "3 de junio, 2025", area: "Dirección de Establecimientos Mercantiles", restante: "2 días hábiles",
    pendiente: null,
    historial: [
      { when: "Hoy 9:30am", what: "Asignado a revisión de documentos" },
      { when: "3 jun 4:15pm", what: "Documentos recibidos y validados" },
      { when: "3 jun 2:00pm", what: "Solicitud enviada correctamente" }
    ]
  },
  "SED-2025-004798": {
    tipo: "Licencia de Funcionamiento — Venta de alcohol", estado: "pendiente", estadoLabel: "Pendiente de ti",
    enviado: "1 de junio, 2025", area: "Dirección de Giros de Impacto Vecinal", restante: "En espera de documento",
    pendiente: { titulo: "Se requiere documento adicional", desc: "Por favor adjunta el contrato de arrendamiento del local." },
    historial: [
      { when: "Hoy 11:00am", what: "Se solicitó documento adicional" },
      { when: "1 jun 5:20pm", what: "Documentos en revisión" },
      { when: "1 jun 3:10pm", what: "Solicitud enviada correctamente" }
    ]
  },
  "SED-2025-004756": {
    tipo: "Apoyo PyME — FONDESO", estado: "completado", estadoLabel: "Aprobado",
    enviado: "28 de mayo, 2025", area: "Fondo para el Desarrollo Económico (FONDESO)", restante: "Concluido",
    pendiente: null,
    historial: [
      { when: "2 jun 10:00am", what: "Solicitud aprobada — notificación enviada" },
      { when: "30 may 1:00pm", what: "Evaluación del comité completada" },
      { when: "29 may 9:30am", what: "Documentos validados" },
      { when: "28 may 4:00pm", what: "Solicitud enviada correctamente" }
    ]
  }
};

export const CONSULTAS: ConsultaItem[] = [
  {
    q: ["taquería", "taqueria", "tacos", "taco"], cat: "Aviso de Funcionamiento · Bajo impacto",
    answer: "Para abrir una taquería de bajo impacto (menos de 100 m², sin venta de alcohol) necesitas presentar un Aviso de Funcionamiento. Es un trámite gratuito y la respuesta es inmediata.",
    docs: ["Identificación oficial (INE/pasaporte)", "Comprobante de domicilio del local", "CURP", "Croquis del local"],
    costo: "Gratuito", tiempo: "Respuesta inmediata"
  },
  {
    q: ["tortillería", "tortilleria", "tortilla"], cat: "Aviso de Funcionamiento · Bajo impacto",
    answer: "Una tortillería es un giro de bajo impacto. Requiere un Aviso de Funcionamiento. Si usas maquinaria de gas, podrías necesitar también un visto bueno de Protección Civil según el tamaño del local.",
    docs: ["Identificación oficial", "Comprobante de domicilio del local", "CURP", "Visto bueno de Protección Civil (si aplica)"],
    costo: "Gratuito", tiempo: "Respuesta inmediata"
  },
  {
    q: ["alcohol", "bar", "cantina", "cerveza", "vinos"], cat: "Licencia de Funcionamiento · Impacto vecinal",
    answer: "Vender bebidas alcohólicas requiere una Licencia de Funcionamiento de Impacto Vecinal. Es un giro regulado: necesitas dictamen de Protección Civil, anuencia vecinal y opinión de uso de suelo.",
    docs: ["Identificación oficial", "Comprobante de domicilio", "Dictamen de Protección Civil", "Anuencia vecinal", "Opinión de uso de suelo"],
    costo: "Variable según superficie", tiempo: "Hasta 10 días hábiles"
  },
  {
    q: ["apoyo", "crédito", "credito", "fondeso", "pyme", "financiamiento"], cat: "Apoyo económico · FONDESO",
    answer: "FONDESO ofrece créditos y microcréditos para micro y pequeñas empresas de la CDMX. El monto y las condiciones dependen de tu giro y antigüedad. Se evalúa caso por caso.",
    docs: ["Identificación oficial", "Comprobante de ingresos o estados financieros", "RFC", "Plan de negocio (para montos mayores)"],
    costo: "Sujeto a evaluación", tiempo: "Hasta 15 días hábiles"
  }
];
