/**
 * catalogoGiros.js
 * Catálogo oficial de Giros Comerciales y de Servicios de BAJO IMPACTO del SIAPEM
 * (Secretaría de Desarrollo Económico CDMX). Fuente:
 * https://www.sedeco.cdmx.gob.mx/storage/app/media/Siapem/catalogo-de-giros-comerciales-y-de-servicios-de-bajo-impacto-del-siapem.pdf
 *
 * Cada giro incluye:
 *  - clave        : clave SCIAN (6 dígitos)
 *  - clasificacion: nombre oficial del giro
 *  - descripcion  : descripción SCIAN (resumida)
 *  - sector       : sector SCIAN (para agrupar en el selector)
 *  - categoria    : categoría gruesa para la lógica existente (uso de suelo / competencia)
 *  - condicion    : término de búsqueda sugerido para la API DENUE
 *
 * Al pertenecer a este catálogo, el giro es de BAJO IMPACTO por definición
 * (sujeto a escalamiento por superficie/aforo/alcohol en siapemEngine.js).
 */
export const CATALOGO_GIROS = [
{
"clave": "238222",
"clasificacion": "Instalaciones de sistemas centrales de aire acondicionado y calefacción",
"descripcion": "Unidades económicas dedicadas principalmente a la instalación de sistemas centrales de aire acondicionado y calefacción.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "instalaciones sistemas centrales"
},
{
"clave": "512230",
"clasificacion": "Editoras de música",
"descripcion": "Unidades económicas dedicadas principalmente a administrar los derechos de autor de obras musicales.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "editoras musica"
},
{
"clave": "512240",
"clasificacion": "Grabación de discos compactos (CD) y de video digital (DVD) o casetes musicales",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar las instalaciones y la experiencia técnica para la grabación.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "grabacion discos compactos"
},
{
"clave": "532210",
"clasificacion": "Alquiler de aparatos eléctricos y electrónicos para el hogar y personales",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de aparatos eléctricos y electrónicos para el hogar.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "aparatos electricos electronicos"
},
{
"clave": "532281",
"clasificacion": "Alquiler de prendas de vestir",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de prendas de vestir, disfraces y vestuario artístico.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "prendas vestir"
},
{
"clave": "532282",
"clasificacion": "Alquiler de mesas, sillas, vajillas y similares",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de mesas, sillas, vajillas y similares, para ocasiones especiales.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "mesas sillas vajillas"
},
{
"clave": "532289",
"clasificacion": "Alquiler de otros artículos para el hogar y personales",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de otros artículos para el hogar y personales.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "articulos hogar personales"
},
{
"clave": "532310",
"clasificacion": "Centros generales de alquiler",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de equipo diverso.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "centros generales alquiler"
},
{
"clave": "532420",
"clasificacion": "Alquiler de equipo de cómputo y de otras máquinas y mobiliario de oficina",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de equipo de cómputo y mobiliario de oficina.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "equipo computo otras"
},
{
"clave": "533110",
"clasificacion": "Servicios de alquiler de marcas registradas, patentes y franquicias",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de marcas registradas, patentes y franquicias.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "alquiler marcas registradas"
},
{
"clave": "541370",
"clasificacion": "Servicios de elaboración de mapas",
"descripcion": "Unidades económicas dedicadas principalmente a la elaboración de mapas.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "elaboracion mapas"
},
{
"clave": "541410",
"clasificacion": "Diseño y decoración de interiores",
"descripcion": "Unidades económicas dedicadas principalmente a la planeación, diseño y decoración de espacios interiores.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "diseno decoracion interiores"
},
{
"clave": "541420",
"clasificacion": "Diseño industrial",
"descripcion": "Unidades económicas dedicadas principalmente a la creación y desarrollo de procesos industriales y productos.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "diseno industrial"
},
{
"clave": "541430",
"clasificacion": "Diseño gráfico",
"descripcion": "Unidades económicas dedicadas principalmente al diseño de mensajes visuales.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "diseno grafico"
},
{
"clave": "541490",
"clasificacion": "Diseño de modas y otros diseños especializados",
"descripcion": "Unidades económicas dedicadas principalmente a la creación y desarrollo de productos de moda.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "diseno modas disenos"
},
{
"clave": "551111",
"clasificacion": "Corporativos",
"descripcion": "Unidades económicas dedicadas principalmente a dirigir y controlar a otras unidades económicas de un mismo grupo.",
"sector": "Corporativos",
"categoria": "servicios",
"condicion": "corporativos"
},
{
"clave": "561432",
"clasificacion": "Servicios de acceso a computadoras",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar acceso a computadoras (cibercafé).",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "acceso a computadoras"
},
{
"clave": "561440",
"clasificacion": "Agencias de cobranza",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar servicios de cobro de deudas.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "cobranza"
},
{
"clave": "561510",
"clasificacion": "Agencias de viajes",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar servicios de asesoría y organización de viajes.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "viajes"
},
{
"clave": "561520",
"clasificacion": "Organización de excursiones y paquetes turísticos para agencias de viajes",
"descripcion": "Unidades económicas dedicadas principalmente a la organización de excursiones y paquetes turísticos.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "organizacion excursiones paquetes"
},
{
"clave": "561920",
"clasificacion": "Organizadores de convenciones y ferias comerciales e industriales",
"descripcion": "Unidades económicas dedicadas principalmente a la organización y promoción de congresos y ferias.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "organizadores convenciones ferias"
},
{
"clave": "541810",
"clasificacion": "Agencias de publicidad",
"descripcion": "Unidades económicas dedicadas principalmente a la creación de campañas publicitarias.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "publicidad"
},
{
"clave": "541820",
"clasificacion": "Agencias de relaciones públicas",
"descripcion": "Unidades económicas dedicadas principalmente al diseño e implementación de campañas de relaciones públicas.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "relaciones publicas"
},
{
"clave": "541830",
"clasificacion": "Agencias de compra de medios a petición del cliente",
"descripcion": "Unidades económicas dedicadas principalmente a la compra de tiempo o espacio publicitario.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "compra medios a"
},
{
"clave": "541840",
"clasificacion": "Agencias de representación de medios",
"descripcion": "Unidades económicas dedicadas principalmente a la representación de medios masivos de comunicación.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "representacion medios"
},
{
"clave": "541850",
"clasificacion": "Agencias de anuncios publicitarios",
"descripcion": "Unidades económicas dedicadas principalmente a la renta de espacios publicitarios.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "anuncios publicitarios"
},
{
"clave": "541860",
"clasificacion": "Agencias de correo directo",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de campañas de publicidad por correo directo.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "correo directo"
},
{
"clave": "237211",
"clasificacion": "División de terrenos",
"descripcion": "Unidades económicas dedicadas principalmente a la división o fraccionamiento de terrenos en lotes.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "division terrenos"
},
{
"clave": "431110",
"clasificacion": "Comercio al por mayor de abarrotes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de abarrotes.",
"sector": "Comercio al por mayor",
"categoria": "abarrotes",
"condicion": "abarrotes"
},
{
"clave": "431121",
"clasificacion": "Comercio al por mayor de carnes rojas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de carnes rojas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "carnes rojas"
},
{
"clave": "431122",
"clasificacion": "Comercio al por mayor de carne de aves",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de carne de aves.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "carne aves"
},
{
"clave": "431123",
"clasificacion": "Comercio al por mayor de pescados y mariscos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de pescados y mariscos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "pescados mariscos"
},
{
"clave": "431130",
"clasificacion": "Comercio al por mayor de frutas y verduras frescas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de frutas y verduras.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "frutas verduras frescas"
},
{
"clave": "431140",
"clasificacion": "Comercio al por mayor de huevo",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de huevo.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "huevo"
},
{
"clave": "431150",
"clasificacion": "Comercio al por mayor de semillas y granos alimenticios, especias y chiles secos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de semillas y granos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "semillas granos alimenticios"
},
{
"clave": "431160",
"clasificacion": "Comercio al por mayor de leche y otros productos lácteos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de leche y lácteos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "leche productos lacteos"
},
{
"clave": "431170",
"clasificacion": "Comercio al por mayor de embutidos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de embutidos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "embutidos"
},
{
"clave": "431180",
"clasificacion": "Comercio al por mayor de dulces y materias primas para repostería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de dulces y repostería.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "dulces materias primas"
},
{
"clave": "431191",
"clasificacion": "Comercio al por mayor de pan y pasteles",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de pan y pasteles.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "pan pasteles"
},
{
"clave": "431192",
"clasificacion": "Comercio al por mayor de botanas y frituras",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de botanas y frituras.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "botanas frituras"
},
{
"clave": "432111",
"clasificacion": "Comercio al por mayor de fibras, hilos y telas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de fibras, hilos y telas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "fibras hilos telas"
},
{
"clave": "432112",
"clasificacion": "Comercio al por mayor de blancos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de blancos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "blancos"
},
{
"clave": "432113",
"clasificacion": "Comercio al por mayor de cueros y pieles",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de cueros y pieles.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "cueros pieles"
},
{
"clave": "432119",
"clasificacion": "Comercio al por mayor de otros productos textiles",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de otros productos textiles.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "productos textiles"
},
{
"clave": "432120",
"clasificacion": "Comercio al por mayor de ropa, bisutería y accesorios de vestir",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de ropa y accesorios.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "ropa bisuteria accesorios"
},
{
"clave": "432130",
"clasificacion": "Comercio al por mayor de calzado",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de calzado.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "calzado"
},
{
"clave": "433210",
"clasificacion": "Comercio al por mayor de artículos de perfumería y cosméticos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de perfumería y cosméticos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos perfumeria cosmeticos"
},
{
"clave": "433220",
"clasificacion": "Comercio al por mayor de artículos de joyería y relojes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de joyería y relojes.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos joyeria relojes"
},
{
"clave": "433311",
"clasificacion": "Comercio al por mayor de discos y casetes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de discos y casetes.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "discos casetes"
},
{
"clave": "433312",
"clasificacion": "Comercio al por mayor de juguetes y bicicletas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de juguetes y bicicletas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "juguetes bicicletas"
},
{
"clave": "433313",
"clasificacion": "Comercio al por mayor de artículos y aparatos deportivos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de artículos deportivos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos aparatos deportivos"
},
{
"clave": "433410",
"clasificacion": "Comercio al por mayor de artículos de papelería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de artículos de papelería.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos papeleria"
},
{
"clave": "433420",
"clasificacion": "Comercio al por mayor de libros",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de libros.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "libros"
},
{
"clave": "433430",
"clasificacion": "Comercio al por mayor de revistas y periódicos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de revistas y periódicos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "revistas periodicos"
},
{
"clave": "433510",
"clasificacion": "Comercio al por mayor de electrodomésticos menores y aparatos de línea blanca",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de electrodomésticos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "electrodomesticos menores aparatos"
},
{
"clave": "434111",
"clasificacion": "Comercio al por mayor de fertilizantes, plaguicidas y semillas para siembra",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de fertilizantes y semillas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "fertilizantes plaguicidas semillas"
},
{
"clave": "434112",
"clasificacion": "Comercio al por mayor de medicamentos veterinarios y alimentos para animales, excepto mascotas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de medicamentos veterinarios.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "medicamentos veterinarios alimentos"
},
{
"clave": "434223",
"clasificacion": "Comercio al por mayor de envases en general, papel y cartón para la industria",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de envases, papel y cartón.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "envases general papel"
},
{
"clave": "434225",
"clasificacion": "Comercio al por mayor de equipo y material eléctrico",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de equipo y material eléctrico.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "equipo material electrico"
},
{
"clave": "434226",
"clasificacion": "Comercio al por mayor de pintura",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de pintura.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "pintura"
},
{
"clave": "434227",
"clasificacion": "Comercio al por mayor de vidrios y espejos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de vidrios y espejos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "vidrios espejos"
},
{
"clave": "434228",
"clasificacion": "Comercio al por mayor de ganado y aves en pie",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de ganado y aves en pie.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "ganado aves pie"
},
{
"clave": "434229",
"clasificacion": "Comercio al por mayor de otras materias primas para otras industrias",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de otras materias primas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "otras materias primas"
},
{
"clave": "434240",
"clasificacion": "Comercio al por mayor de artículos desechables",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de artículos desechables.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos desechables"
},
{
"clave": "434311",
"clasificacion": "Comercio al por mayor de desechos metálicos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de desechos metálicos.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "desechos metalicos"
},
{
"clave": "434312",
"clasificacion": "Comercio al por mayor de desechos de papel y de cartón",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de desechos de papel.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "desechos papel carton"
},
{
"clave": "434313",
"clasificacion": "Comercio al por mayor de desechos de vidrio",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de desechos de vidrio.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "desechos vidrio"
},
{
"clave": "434314",
"clasificacion": "Comercio al por mayor de desechos de plástico",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de desechos de plástico.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "desechos plastico"
},
{
"clave": "434319",
"clasificacion": "Comercio al por mayor de otros materiales de desecho",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de otros materiales de desecho.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "materiales desecho"
},
{
"clave": "435110",
"clasificacion": "Comercio al por mayor de maquinaria y equipo agropecuario, forestal y para la pesca",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de maquinaria agropecuaria.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "maquinaria equipo agropecuario"
},
{
"clave": "435220",
"clasificacion": "Comercio al por mayor de maquinaria y equipo para la industria manufacturera",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de maquinaria para manufactura.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "maquinaria equipo industria"
},
{
"clave": "435311",
"clasificacion": "Comercio al por mayor de equipo de telecomunicaciones, fotografía y cinematografía",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de equipo de telecomunicaciones.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "equipo telecomunicaciones fotografia"
},
{
"clave": "435312",
"clasificacion": "Comercio al por mayor de artículos y accesorios para diseño y pintura artística",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de artículos para diseño artístico.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "articulos accesorios diseno"
},
{
"clave": "435313",
"clasificacion": "Comercio al por mayor de mobiliario, equipo e instrumental médico y de laboratorio",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de instrumental médico.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "mobiliario equipo e"
},
{
"clave": "435319",
"clasificacion": "Comercio al por mayor de maquinaria y equipo para otros servicios y para actividades comerciales",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de maquinaria para servicios.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "maquinaria equipo servicios"
},
{
"clave": "435411",
"clasificacion": "Comercio al por mayor de mobiliario, equipo, y accesorios de cómputo",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de equipo de cómputo.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "mobiliario equipo accesorios"
},
{
"clave": "435412",
"clasificacion": "Comercio al por mayor de mobiliario y equipo de oficina",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de mobiliario de oficina.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "mobiliario equipo oficina"
},
{
"clave": "435419",
"clasificacion": "Comercio al por mayor de otra maquinaria y equipo de uso general",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de maquinaria de uso general.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "maquinaria equipo uso"
},
{
"clave": "436111",
"clasificacion": "Comercio al por mayor de camiones",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de camiones.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "camiones"
},
{
"clave": "436112",
"clasificacion": "Comercio al por mayor de partes y refacciones nuevas para automóviles, camionetas y camiones",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por mayor de refacciones nuevas.",
"sector": "Comercio al por mayor",
"categoria": "servicios",
"condicion": "partes refacciones nuevas"
},
{
"clave": "462210",
"clasificacion": "Comercio al por menor en tiendas departamentales",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor en tiendas departamentales.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "tiendas departamentales"
},
{
"clave": "463111",
"clasificacion": "Comercio al por menor de telas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de telas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "telas"
},
{
"clave": "463112",
"clasificacion": "Comercio al por menor de blancos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de blancos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "blancos"
},
{
"clave": "463113",
"clasificacion": "Comercio al por menor de artículos de mercería y bonetería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de mercería y bonetería.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos merceria boneteria"
},
{
"clave": "463211",
"clasificacion": "Comercio al por menor de ropa, excepto de bebé y lencería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de ropa.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "ropa excepto bebe"
},
{
"clave": "463212",
"clasificacion": "Comercio al por menor de ropa de bebé",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de ropa de bebé.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "ropa bebe"
},
{
"clave": "463213",
"clasificacion": "Comercio al por menor de lencería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de lencería.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "lenceria"
},
{
"clave": "463214",
"clasificacion": "Comercio al por menor de disfraces, vestimenta regional y vestidos de novia",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de disfraces y vestidos de novia.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "disfraces vestimenta regional"
},
{
"clave": "463215",
"clasificacion": "Comercio al por menor de bisutería y accesorios de vestir",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de bisutería y accesorios.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "bisuteria accesorios vestir"
},
{
"clave": "463216",
"clasificacion": "Comercio al por menor de ropa de cuero y piel y de otros artículos de estos materiales",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de ropa de cuero y piel.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "ropa cuero piel"
},
{
"clave": "463217",
"clasificacion": "Comercio al por menor de pañales desechables",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de pañales desechables.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "panales desechables"
},
{
"clave": "463218",
"clasificacion": "Comercio al por menor de sombreros",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de sombreros.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "sombreros"
},
{
"clave": "463310",
"clasificacion": "Comercio al por menor de calzado",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de calzado.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "calzado"
},
{
"clave": "465111",
"clasificacion": "Comercio al por menor de artículos de perfumería y cosméticos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de perfumería y cosméticos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos perfumeria cosmeticos"
},
{
"clave": "465112",
"clasificacion": "Comercio al por menor de artículos de joyería y relojes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de joyería y relojes.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos joyeria relojes"
},
{
"clave": "465211",
"clasificacion": "Comercio al por menor de discos y casetes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de discos y casetes.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "discos casetes"
},
{
"clave": "465212",
"clasificacion": "Comercio al por menor de juguetes",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de juguetes.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "juguetes"
},
{
"clave": "465213",
"clasificacion": "Comercio al por menor de bicicletas y triciclos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de bicicletas y triciclos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "bicicletas triciclos"
},
{
"clave": "465214",
"clasificacion": "Comercio al por menor de equipo y material fotográfico",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de equipo fotográfico.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "equipo material fotografico"
},
{
"clave": "465215",
"clasificacion": "Comercio al por menor de artículos y aparatos deportivos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos deportivos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos aparatos deportivos"
},
{
"clave": "465216",
"clasificacion": "Comercio al por menor de instrumentos musicales",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de instrumentos musicales.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "instrumentos musicales"
},
{
"clave": "465311",
"clasificacion": "Comercio al por menor de artículos de papelería",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos de papelería.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos papeleria"
},
{
"clave": "465312",
"clasificacion": "Comercio al por menor de libros",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de libros.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "libros"
},
{
"clave": "465313",
"clasificacion": "Comercio al por menor de revistas y periódicos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de revistas y periódicos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "revistas periodicos"
},
{
"clave": "465911",
"clasificacion": "Comercio al por menor de mascotas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de mascotas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "mascotas"
},
{
"clave": "465912",
"clasificacion": "Comercio al por menor de regalos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de regalos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "regalos"
},
{
"clave": "465913",
"clasificacion": "Comercio al por menor de artículos religiosos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos religiosos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos religiosos"
},
{
"clave": "465914",
"clasificacion": "Comercio al por menor de artículos desechables",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos desechables.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos desechables"
},
{
"clave": "465915",
"clasificacion": "Comercio al por menor en tiendas de artesanías",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor en tiendas de artesanías.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "tiendas artesanias"
},
{
"clave": "465919",
"clasificacion": "Comercio al por menor de otros artículos de uso personal",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de otros artículos de uso personal.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos uso personal"
},
{
"clave": "466111",
"clasificacion": "Comercio al por menor de muebles para el hogar",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de muebles para el hogar.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "muebles hogar"
},
{
"clave": "466112",
"clasificacion": "Comercio al por menor de electrodomésticos menores y aparatos de línea blanca",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de electrodomésticos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "electrodomesticos menores aparatos"
},
{
"clave": "466113",
"clasificacion": "Comercio al por menor de muebles para jardín",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de muebles para jardín.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "muebles jardin"
},
{
"clave": "466114",
"clasificacion": "Comercio al por menor de cristalería, loza y utensilios de cocina",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de cristalería y utensilios de cocina.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "cristaleria loza utensilios"
},
{
"clave": "466211",
"clasificacion": "Comercio al por menor de mobiliario, equipo y accesorios de cómputo",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de equipo de cómputo.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "mobiliario equipo accesorios"
},
{
"clave": "466212",
"clasificacion": "Comercio al por menor de teléfonos y otros aparatos de comunicación",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de teléfonos y aparatos de comunicación.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "telefonos aparatos comunicacion"
},
{
"clave": "466311",
"clasificacion": "Comercio al por menor de alfombras, cortinas, tapices y similares",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de alfombras y cortinas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "alfombras cortinas tapices"
},
{
"clave": "466312",
"clasificacion": "Comercio al por menor de plantas y flores naturales",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de plantas y flores (florerías).",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "plantas flores naturales"
},
{
"clave": "466313",
"clasificacion": "Comercio al por menor de antigüedades y obras de arte",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de antigüedades y obras de arte.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "antiguedades obras arte"
},
{
"clave": "466314",
"clasificacion": "Comercio al por menor de lámparas ornamentales y candiles",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de lámparas y candiles.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "lamparas ornamentales candiles"
},
{
"clave": "466319",
"clasificacion": "Comercio al por menor de otros artículos para la decoración de interiores",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos para decoración.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos decoracion interiores"
},
{
"clave": "466410",
"clasificacion": "Comercio al por menor de artículos usados",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos usados.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos usados"
},
{
"clave": "467111",
"clasificacion": "Comercio al por menor en ferreterías y tlapalerías",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor en ferreterías y tlapalerías.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "ferreterias tlapalerias"
},
{
"clave": "467112",
"clasificacion": "Comercio al por menor de pisos y recubrimientos cerámicos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de pisos y recubrimientos cerámicos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "pisos recubrimientos ceramicos"
},
{
"clave": "467113",
"clasificacion": "Comercio al por menor de pintura",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de pintura.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "pintura"
},
{
"clave": "467114",
"clasificacion": "Comercio al por menor de vidrios y espejos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de vidrios y espejos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "vidrios espejos"
},
{
"clave": "467115",
"clasificacion": "Comercio al por menor de artículos para la limpieza",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos para la limpieza.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos limpieza"
},
{
"clave": "467116",
"clasificacion": "Comercio al por menor de materiales para la construcción en tiendas de autoservicio especializadas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de materiales para construcción.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "materiales construccion tiendas"
},
{
"clave": "467117",
"clasificacion": "Comercio al por menor de artículos para albercas y otros artículos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de artículos para albercas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "articulos albercas articulos"
},
{
"clave": "468111",
"clasificacion": "Comercio al por menor de automóviles y camionetas nuevos",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de automóviles nuevos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "automoviles camionetas nuevos"
},
{
"clave": "468112",
"clasificacion": "Comercio al por menor de automóviles y camionetas usados",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de automóviles usados.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "automoviles camionetas usados"
},
{
"clave": "468211",
"clasificacion": "Comercio al por menor de partes y refacciones nuevas para automóviles, camionetas y camiones",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de refacciones nuevas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "partes refacciones nuevas"
},
{
"clave": "468212",
"clasificacion": "Comercio al por menor de partes y refacciones usadas para automóviles, camionetas y camiones",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de refacciones usadas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "partes refacciones usadas"
},
{
"clave": "468213",
"clasificacion": "Comercio al por menor de llantas y cámaras para automóviles, camionetas y camiones",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de llantas y cámaras.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "llantas camaras automoviles"
},
{
"clave": "468311",
"clasificacion": "Comercio al por menor de motocicletas",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de motocicletas.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "motocicletas"
},
{
"clave": "468319",
"clasificacion": "Comercio al por menor de otros vehículos de motor",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de otros vehículos de motor.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "vehiculos motor"
},
{
"clave": "468411",
"clasificacion": "Comercio al por menor de gasolina y diésel",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de gasolina y diésel (gasolinerías).",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "gasolina diesel"
},
{
"clave": "468412",
"clasificacion": "Comercio al por menor de gas L.P. en cilindros y para tanques estacionarios",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de gas L.P. en cilindros.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "gas l p"
},
{
"clave": "468413",
"clasificacion": "Comercio al por menor de gas L.P. en estaciones de carburación",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de gas L.P. en estaciones de carburación.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "gas l p"
},
{
"clave": "468414",
"clasificacion": "Comercio al por menor en estaciones de gas natural vehicular",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de gas natural vehicular.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "estaciones gas natural"
},
{
"clave": "468419",
"clasificacion": "Comercio al por menor de otros combustibles",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de otros combustibles.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "combustibles"
},
{
"clave": "468420",
"clasificacion": "Comercio al por menor de aceites y grasas lubricantes, aditivos y similares para vehículos de motor",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor de aceites y lubricantes.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "aceites grasas lubricantes"
},
{
"clave": "469110",
"clasificacion": "Comercio al por menor exclusivamente a través de internet, y catálogos impresos, televisión y similares",
"descripcion": "Unidades económicas dedicadas principalmente al comercio al por menor a través de internet y catálogos.",
"sector": "Comercio al por menor",
"categoria": "servicios",
"condicion": "comercio al por"
},
{
"clave": "493111",
"clasificacion": "Almacenes generales de depósito",
"descripcion": "Unidades económicas dedicadas principalmente al almacenamiento y guarda de bienes o mercancías.",
"sector": "Transportes y almacenamiento",
"categoria": "servicios",
"condicion": "almacenes generales deposito"
},
{
"clave": "493119",
"clasificacion": "Otros servicios de almacenamiento general sin instalaciones especializadas",
"descripcion": "Unidades económicas dedicadas principalmente al almacenamiento general de productos.",
"sector": "Transportes y almacenamiento",
"categoria": "servicios",
"condicion": "servicios almacenamiento general"
},
{
"clave": "493120",
"clasificacion": "Almacenamiento con refrigeración",
"descripcion": "Unidades económicas dedicadas principalmente al almacenamiento en cámaras frigoríficas.",
"sector": "Transportes y almacenamiento",
"categoria": "servicios",
"condicion": "almacenamiento refrigeracion"
},
{
"clave": "493130",
"clasificacion": "Almacenamiento de productos agrícolas que no requieren refrigeración",
"descripcion": "Unidades económicas dedicadas principalmente al almacenamiento de productos agrícolas.",
"sector": "Transportes y almacenamiento",
"categoria": "servicios",
"condicion": "almacenamiento productos agricolas"
},
{
"clave": "493190",
"clasificacion": "Otros servicios de almacenamiento con instalaciones especializadas",
"descripcion": "Unidades económicas dedicadas principalmente al almacenamiento de otro tipo de carga en instalaciones especializadas.",
"sector": "Transportes y almacenamiento",
"categoria": "servicios",
"condicion": "servicios almacenamiento instalaciones"
},
{
"clave": "511111",
"clasificacion": "Edición de periódicos",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de periódicos.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "periodicos"
},
{
"clave": "511112",
"clasificacion": "Edición de periódicos integrada con la impresión",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de periódicos integrada con la impresión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "periodicos integrada impresion"
},
{
"clave": "511121",
"clasificacion": "Edición de revistas y otras publicaciones periódicas",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de revistas y publicaciones periódicas.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "revistas otras publicaciones"
},
{
"clave": "511122",
"clasificacion": "Edición de revistas y otras publicaciones periódicas integrada con la impresión",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de revistas integrada con la impresión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "revistas otras publicaciones"
},
{
"clave": "511131",
"clasificacion": "Edición de libros",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de libros.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "libros"
},
{
"clave": "511132",
"clasificacion": "Edición de libros integrada con la impresión",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de libros integrada con la impresión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "libros integrada impresion"
},
{
"clave": "511141",
"clasificacion": "Edición de directorios y de listas de correo",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de directorios y listas de correo.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "directorios listas correo"
},
{
"clave": "511142",
"clasificacion": "Edición de directorios y de listas de correo integrada con la impresión",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de directorios integrada con la impresión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "directorios listas correo"
},
{
"clave": "511191",
"clasificacion": "Edición de otros materiales",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de otros materiales.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "materiales"
},
{
"clave": "511192",
"clasificacion": "Edición de otros materiales integrada con la impresión",
"descripcion": "Unidades económicas dedicadas principalmente a la edición de otros materiales integrada con la impresión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "materiales integrada impresion"
},
{
"clave": "511210",
"clasificacion": "Edición de software y edición de software integrada con la reproducción",
"descripcion": "Unidades económicas dedicadas principalmente al desarrollo y edición de software.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "software edicion software"
},
{
"clave": "512111",
"clasificacion": "Producción de películas",
"descripcion": "Unidades económicas dedicadas principalmente a la producción de películas.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "peliculas"
},
{
"clave": "512112",
"clasificacion": "Producción de programas para la televisión",
"descripcion": "Unidades económicas dedicadas principalmente a la producción de programas para la televisión.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "programas television"
},
{
"clave": "512113",
"clasificacion": "Producción de videoclips, comerciales y otros materiales audiovisuales",
"descripcion": "Unidades económicas dedicadas principalmente a la producción de videoclips y comerciales.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "videoclips comerciales materiales"
},
{
"clave": "512120",
"clasificacion": "Distribución de películas y de otros materiales audiovisuales",
"descripcion": "Unidades económicas dedicadas principalmente a la distribución de películas.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "distribucion peliculas materiales"
},
{
"clave": "512190",
"clasificacion": "Servicios de postproducción y otros servicios para la industria fílmica y del video",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de postproducción.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "postproduccion servicios industria"
},
{
"clave": "512250",
"clasificacion": "Productoras y distribuidoras discográficas",
"descripcion": "Unidades económicas dedicadas principalmente a la producción de material discográfico.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "productoras distribuidoras discograficas"
},
{
"clave": "519130",
"clasificacion": "Edición y difusión de contenido exclusivamente a través de internet y servicios de búsqueda en la red",
"descripcion": "Unidades económicas dedicadas principalmente a editar y difundir contenido a través de internet.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "edicion difusion contenido"
},
{
"clave": "519190",
"clasificacion": "Otros servicios de suministro de información",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar otros servicios de información.",
"sector": "Información en medios masivos",
"categoria": "servicios",
"condicion": "servicios suministro informacion"
},
{
"clave": "522110",
"clasificacion": "Banca múltiple",
"descripcion": "Unidades económicas dedicadas principalmente a la captación y colocación de recursos del público.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "banca multiple"
},
{
"clave": "522220",
"clasificacion": "Fondos y fideicomisos financieros",
"descripcion": "Unidades económicas sin fines de lucro dedicadas principalmente a la administración de fondos y fideicomisos.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "fondos fideicomisos financieros"
},
{
"clave": "522310",
"clasificacion": "Uniones de crédito",
"descripcion": "Unidades económicas dedicadas principalmente a facilitar el uso de crédito a sus miembros.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "uniones credito"
},
{
"clave": "522320",
"clasificacion": "Cajas de ahorro popular",
"descripcion": "Unidades económicas dedicadas principalmente a la captación de recursos de sus socios.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "cajas ahorro popular"
},
{
"clave": "522390",
"clasificacion": "Otras instituciones de ahorro y préstamo",
"descripcion": "Unidades económicas dedicadas principalmente a la captación de ahorro y otorgamiento de préstamos.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "otras instituciones ahorro"
},
{
"clave": "522451",
"clasificacion": "Montepíos",
"descripcion": "Unidades económicas dedicadas principalmente al otorgamiento de préstamos prendarios.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "montepios"
},
{
"clave": "522452",
"clasificacion": "Casas de empeño",
"descripcion": "Unidades económicas dedicadas principalmente al otorgamiento de préstamos prendarios.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "casas empeno"
},
{
"clave": "522460",
"clasificacion": "Sociedades financieras de objeto múltiple",
"descripcion": "Unidades económicas dedicadas principalmente al otorgamiento de créditos y arrendamiento financiero.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "sociedades financieras objeto"
},
{
"clave": "523910",
"clasificacion": "Asesoría en inversiones",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar servicios de asesoría en inversiones.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "asesoria inversiones"
},
{
"clave": "524220",
"clasificacion": "Administración de fondos para el retiro",
"descripcion": "Unidades económicas dedicadas principalmente a la administración de fondos para el retiro.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "administracion fondos retiro"
},
{
"clave": "525110",
"clasificacion": "Sociedades de inversión especializadas en fondos para el retiro",
"descripcion": "Entidades que tienen por objeto invertir recursos destinados al retiro.",
"sector": "Servicios financieros y de seguros",
"categoria": "servicios",
"condicion": "sociedades inversion especializadas"
},
{
"clave": "531114",
"clasificacion": "Alquiler sin intermediación de oficinas y locales comerciales",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de oficinas y locales comerciales.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "oficinas locales comerciales"
},
{
"clave": "531116",
"clasificacion": "Alquiler sin intermediación de edificios industriales dentro de un parque industrial",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de edificios industriales.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "edificios industriales dentro"
},
{
"clave": "531119",
"clasificacion": "Alquiler sin intermediación de otros bienes raíces",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de otros bienes raíces.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "bienes raices"
},
{
"clave": "531210",
"clasificacion": "Inmobiliarias y corredores de bienes raíces",
"descripcion": "Unidades económicas dedicadas principalmente a la intermediación en venta y alquiler de bienes raíces.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "inmobiliarias corredores bienes"
},
{
"clave": "531311",
"clasificacion": "Servicios de administración de bienes raíces",
"descripcion": "Unidades económicas dedicadas principalmente a la administración de bienes raíces de terceros.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "administracion bienes raices"
},
{
"clave": "531319",
"clasificacion": "Otros servicios relacionados con los servicios inmobiliarios",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de valuación y consultoría inmobiliaria.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "servicios relacionados servicios"
},
{
"clave": "532491",
"clasificacion": "Alquiler de maquinaria y equipo agropecuario, pesquero y para la industria manufacturera",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de maquinaria agropecuaria e industrial.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "maquinaria equipo agropecuario"
},
{
"clave": "532493",
"clasificacion": "Alquiler de maquinaria y equipo comercial y de servicios",
"descripcion": "Unidades económicas dedicadas principalmente al alquiler de maquinaria comercial y de servicios.",
"sector": "Servicios inmobiliarios y de alquiler",
"categoria": "servicios",
"condicion": "maquinaria equipo comercial"
},
{
"clave": "541110",
"clasificacion": "Bufetes jurídicos",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de asesoría y representación jurídica.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "bufetes juridicos"
},
{
"clave": "541120",
"clasificacion": "Notarías públicas",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar servicios notariales y de certificación.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "notarias publicas"
},
{
"clave": "541190",
"clasificacion": "Servicios de apoyo para efectuar trámites legales",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de apoyo para trámites legales.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "apoyo efectuar tramites"
},
{
"clave": "541211",
"clasificacion": "Servicios de contabilidad y auditoría",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de contabilidad y auditoría.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "contabilidad auditoria"
},
{
"clave": "541219",
"clasificacion": "Otros servicios relacionados con la contabilidad",
"descripcion": "Unidades económicas dedicadas principalmente a servicios técnicos de contabilidad.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "servicios relacionados contabilidad"
},
{
"clave": "541310",
"clasificacion": "Servicios de arquitectura",
"descripcion": "Unidades económicas dedicadas principalmente a la planeación y diseño de edificaciones.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "arquitectura"
},
{
"clave": "541320",
"clasificacion": "Servicios de arquitectura de paisaje y urbanismo",
"descripcion": "Unidades económicas dedicadas principalmente a la planeación y diseño de paisajes.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "arquitectura paisaje urbanismo"
},
{
"clave": "541330",
"clasificacion": "Servicios de ingeniería",
"descripcion": "Unidades económicas dedicadas principalmente a la aplicación de los principios de la ingeniería.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "ingenieria"
},
{
"clave": "541340",
"clasificacion": "Servicios de dibujo",
"descripcion": "Unidades económicas dedicadas principalmente a la elaboración de planos e ilustraciones.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "dibujo"
},
{
"clave": "541360",
"clasificacion": "Servicios de levantamiento geofísico",
"descripcion": "Unidades económicas dedicadas principalmente a la adquisición e interpretación de datos geofísicos.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "levantamiento geofisico"
},
{
"clave": "541380",
"clasificacion": "Laboratorios de pruebas",
"descripcion": "Unidades económicas dedicadas principalmente a proporcionar pruebas de productos o sustancias.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "laboratorios pruebas"
},
{
"clave": "541510",
"clasificacion": "Servicios de diseño de sistemas de cómputo y servicios relacionados",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de tecnologías de información.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "diseno sistemas computo"
},
{
"clave": "541610",
"clasificacion": "Servicios de consultoría en administración",
"descripcion": "Unidades económicas dedicadas principalmente a la consultoría en administración.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "consultoria administracion"
},
{
"clave": "541620",
"clasificacion": "Servicios de consultoría en medio ambiente",
"descripcion": "Unidades económicas dedicadas principalmente a la consultoría en medio ambiente.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "consultoria medio ambiente"
},
{
"clave": "541690",
"clasificacion": "Otros servicios de consultoría científica y técnica",
"descripcion": "Unidades económicas dedicadas principalmente a otros servicios de consultoría científica y técnica.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "servicios consultoria cientifica"
},
{
"clave": "541711",
"clasificacion": "Servicios de investigación científica y desarrollo en ciencias naturales y exactas, ingeniería, y ciencias de la vida, prestados por el sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a la investigación científica.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "investigacion cientifica desarrollo"
},
{
"clave": "541721",
"clasificacion": "Servicios de investigación científica y desarrollo en ciencias sociales y humanidades, prestados por el sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a la investigación en ciencias sociales.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "investigacion cientifica desarrollo"
},
{
"clave": "541870",
"clasificacion": "Distribución de material publicitario",
"descripcion": "Unidades económicas dedicadas principalmente a la distribución de material publicitario.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "distribucion material publicitario"
},
{
"clave": "541890",
"clasificacion": "Servicios de rotulación y otros servicios de publicidad",
"descripcion": "Unidades económicas dedicadas principalmente a los servicios de rotulación y publicidad.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "rotulacion servicios publicidad"
},
{
"clave": "541910",
"clasificacion": "Servicios de investigación de mercados y encuestas de opinión pública",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de investigación de mercados.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "investigacion mercados encuestas"
},
{
"clave": "541920",
"clasificacion": "Servicios de fotografía y videograbación",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de fotografía y videograbación.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "fotografia videograbacion"
},
{
"clave": "541930",
"clasificacion": "Servicios de traducción e interpretación",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de traducción e interpretación.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "traduccion e interpretacion"
},
{
"clave": "541990",
"clasificacion": "Otros servicios profesionales, científicos y técnicos",
"descripcion": "Unidades económicas dedicadas principalmente a otros servicios profesionales y técnicos.",
"sector": "Servicios profesionales, científicos y técnicos",
"categoria": "servicios",
"condicion": "servicios profesionales cientificos"
},
{
"clave": "551112",
"clasificacion": "Tenedoras de acciones",
"descripcion": "Unidades económicas dedicadas principalmente a poseer acciones de otras compañías del mismo grupo.",
"sector": "Corporativos",
"categoria": "servicios",
"condicion": "tenedoras acciones"
},
{
"clave": "561110",
"clasificacion": "Servicios de administración de negocios",
"descripcion": "Unidades económicas dedicadas principalmente a servicios administrativos para negocios.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "administracion negocios"
},
{
"clave": "561310",
"clasificacion": "Agencias de colocación",
"descripcion": "Unidades económicas dedicadas principalmente al reclutamiento y colocación de personal.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "colocacion"
},
{
"clave": "561320",
"clasificacion": "Agencias de empleo temporal",
"descripcion": "Unidades económicas dedicadas principalmente a proveer personal temporal.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "empleo temporal"
},
{
"clave": "561330",
"clasificacion": "Suministro de personal permanente",
"descripcion": "Unidades económicas dedicadas principalmente a proveer personal permanente.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "suministro personal permanente"
},
{
"clave": "561410",
"clasificacion": "Servicios de preparación de documentos",
"descripcion": "Unidades económicas dedicadas principalmente a mecanografiar y formatear textos.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "preparacion documentos"
},
{
"clave": "561431",
"clasificacion": "Servicios de fotocopiado, fax y afines",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de fotocopiado y fax.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "fotocopiado fax afines"
},
{
"clave": "561450",
"clasificacion": "Despachos de investigación de solvencia financiera",
"descripcion": "Unidades económicas dedicadas principalmente a investigación de solvencia financiera.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "despachos investigacion solvencia"
},
{
"clave": "561490",
"clasificacion": "Otros servicios de apoyo secretarial y similares",
"descripcion": "Unidades económicas dedicadas principalmente a otros servicios de apoyo secretarial.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "servicios apoyo secretarial"
},
{
"clave": "561610",
"clasificacion": "Servicios de investigación y de protección y custodia, excepto mediante monitoreo",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de protección y custodia.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "investigacion proteccion custodia"
},
{
"clave": "561990",
"clasificacion": "Otros servicios de apoyo a los negocios",
"descripcion": "Unidades económicas dedicadas principalmente a otros servicios de apoyo a los negocios.",
"sector": "Servicios de apoyo a los negocios",
"categoria": "servicios",
"condicion": "servicios apoyo a"
},
{
"clave": "624111",
"clasificacion": "Servicios de orientación y trabajo social para la niñez y la juventud prestados por el sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a orientación y trabajo social para niñez y juventud.",
"sector": "Servicios de salud y asistencia social",
"categoria": "servicios",
"condicion": "orientacion trabajo social"
},
{
"clave": "711111",
"clasificacion": "Compañías de teatro del sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a espectáculos de teatro.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "companias teatro sector"
},
{
"clave": "711121",
"clasificacion": "Compañías de danza del sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a espectáculos de danza.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "companias danza sector"
},
{
"clave": "711131",
"clasificacion": "Cantantes y grupos musicales del sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a espectáculos musicales.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "cantantes grupos musicales"
},
{
"clave": "711191",
"clasificacion": "Otras compañías y grupos de espectáculos artísticos del sector privado",
"descripcion": "Unidades económicas del sector privado dedicadas a otros espectáculos artísticos.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "otras companias grupos"
},
{
"clave": "711211",
"clasificacion": "Deportistas profesionales",
"descripcion": "Unidades económicas dedicadas principalmente a la presentación de espectáculos deportivos.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "deportistas profesionales"
},
{
"clave": "711212",
"clasificacion": "Equipos deportivos profesionales",
"descripcion": "Unidades económicas dedicadas principalmente a la presentación de espectáculos deportivos.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "equipos deportivos profesionales"
},
{
"clave": "711311",
"clasificacion": "Promotores del sector privado de espectáculos artísticos, culturales, deportivos y similares que cuentan con instalaciones para presentarlos",
"descripcion": "Unidades económicas del sector privado dedicadas a la promoción de espectáculos con instalaciones.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "promotores sector privado"
},
{
"clave": "711320",
"clasificacion": "Promotores de espectáculos artísticos, culturales, deportivos y similares que no cuentan con instalaciones para presentarlos",
"descripcion": "Unidades económicas dedicadas a la promoción de espectáculos sin instalaciones.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "promotores espectaculos artisticos"
},
{
"clave": "711410",
"clasificacion": "Agentes y representantes de artistas, deportistas y similares",
"descripcion": "Unidades económicas dedicadas principalmente a la representación y administración de artistas.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "agentes representantes artistas"
},
{
"clave": "711510",
"clasificacion": "Artistas, escritores y técnicos independientes",
"descripcion": "Unidades económicas dedicadas principalmente a la creación y producción de trabajos artísticos.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "artistas escritores tecnicos"
},
{
"clave": "713291",
"clasificacion": "Venta de billetes de lotería, pronósticos deportivos y otros boletos de sorteo",
"descripcion": "Unidades económicas dedicadas principalmente a la venta de billetes de lotería.",
"sector": "Esparcimiento cultural y deportivo",
"categoria": "servicios",
"condicion": "venta billetes loteria"
},
{
"clave": "722310",
"clasificacion": "Servicios de comedor para empresas e instituciones",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación y entrega de alimentos por contrato.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "comedor empresas e"
},
{
"clave": "722512",
"clasificacion": "Restaurantes con servicio de preparación de pescados y mariscos",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de pescados y mariscos.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes servicio preparacion"
},
{
"clave": "722513",
"clasificacion": "Restaurantes con servicio de preparación de antojitos",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de antojitos.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes servicio preparacion"
},
{
"clave": "722514",
"clasificacion": "Restaurantes con servicio de preparación de tacos y tortas",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de tacos y tortas.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes servicio preparacion"
},
{
"clave": "722515",
"clasificacion": "Cafeterías, fuentes de sodas, neverías, refresquerías y similares",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de café, nieves, jugos y bebidas no alcohólicas.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "cafetería",
"condicion": "cafeterias fuentes sodas"
},
{
"clave": "722516",
"clasificacion": "Restaurantes de autoservicio",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de alimentos de autoservicio.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes autoservicio"
},
{
"clave": "722517",
"clasificacion": "Restaurantes con servicio de preparación de pizzas, hamburguesas, hot dogs y pollos rostizados para llevar",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de pizzas y hamburguesas para llevar.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes servicio preparacion"
},
{
"clave": "722518",
"clasificacion": "Restaurantes que preparan otro tipo de alimentos para llevar",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de otro tipo de alimentos para llevar.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "restaurante",
"condicion": "restaurantes que preparan"
},
{
"clave": "722519",
"clasificacion": "Servicios de preparación de otros alimentos para consumo inmediato",
"descripcion": "Unidades económicas dedicadas principalmente a la preparación de otros alimentos para consumo inmediato.",
"sector": "Alojamiento y preparación de alimentos",
"categoria": "servicios",
"condicion": "preparacion alimentos consumo"
},
{
"clave": "811111",
"clasificacion": "Reparación mecánica en general de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación mecánica de automóviles y camiones.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "reparacion mecanica general"
},
{
"clave": "811112",
"clasificacion": "Reparación del sistema eléctrico de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación del sistema eléctrico de automóviles.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "l sistema electrico"
},
{
"clave": "811113",
"clasificacion": "Rectificación de partes de motor de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a la rectificación de partes de motor.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "rectificacion partes motor"
},
{
"clave": "811114",
"clasificacion": "Reparación de transmisiones de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de transmisiones.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "transmisiones automoviles camiones"
},
{
"clave": "811115",
"clasificacion": "Reparación de suspensiones de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de suspensiones.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "suspensiones automoviles camiones"
},
{
"clave": "811119",
"clasificacion": "Otras reparaciones mecánicas de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a otras reparaciones mecánicas.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "otras reparaciones mecanicas"
},
{
"clave": "811122",
"clasificacion": "Tapicería de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente a cubrir con tapices interiores de automóviles.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "tapiceria automoviles camiones"
},
{
"clave": "811191",
"clasificacion": "Reparación menor de llantas",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación menor de llantas.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "reparacion menor llantas"
},
{
"clave": "811192",
"clasificacion": "Lavado y lubricado de automóviles y camiones",
"descripcion": "Unidades económicas dedicadas principalmente al lavado y lubricado de automóviles y camiones.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "lavado lubricado automoviles"
},
{
"clave": "811211",
"clasificacion": "Reparación y mantenimiento de equipo electrónico de uso doméstico",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de equipo electrónico doméstico.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "equipo electronico uso"
},
{
"clave": "811219",
"clasificacion": "Reparación y mantenimiento de otro equipo electrónico y de equipo de precisión",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de equipo de precisión.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "equipo electronico equipo"
},
{
"clave": "811311",
"clasificacion": "Reparación y mantenimiento de maquinaria y equipo agropecuario y forestal",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de maquinaria agropecuaria.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "maquinaria equipo agropecuario"
},
{
"clave": "811313",
"clasificacion": "Reparación y mantenimiento de maquinaria y equipo para mover, levantar y acomodar materiales",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de maquinaria para mover materiales.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "maquinaria equipo mover"
},
{
"clave": "811314",
"clasificacion": "Reparación y mantenimiento de maquinaria y equipo comercial y de servicios",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de maquinaria comercial y de servicios.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "maquinaria equipo comercial"
},
{
"clave": "811410",
"clasificacion": "Reparación y mantenimiento de aparatos eléctricos para el hogar y personales",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de aparatos eléctricos para el hogar.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "aparatos electricos hogar"
},
{
"clave": "811420",
"clasificacion": "Reparación de tapicería de muebles para el hogar",
"descripcion": "Unidades económicas dedicadas principalmente a cubrir con tapices muebles para el hogar.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "tapiceria muebles hogar"
},
{
"clave": "811430",
"clasificacion": "Reparación de calzado y otros artículos de piel y cuero",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de calzado y artículos de piel.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "calzado articulos piel"
},
{
"clave": "811492",
"clasificacion": "Reparación y mantenimiento de motocicletas",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de motocicletas.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "motocicletas"
},
{
"clave": "811493",
"clasificacion": "Reparación y mantenimiento de bicicletas",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de bicicletas.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "bicicletas"
},
{
"clave": "811499",
"clasificacion": "Reparación y mantenimiento de otros artículos para el hogar y personales",
"descripcion": "Unidades económicas dedicadas principalmente a la reparación de otros artículos para el hogar.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "articulos hogar personales"
},
{
"clave": "812110",
"clasificacion": "Salones y clínicas de belleza y peluquerías",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de cuidado y arreglo personal.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "estética",
"condicion": "salones clinicas belleza"
},
{
"clave": "812210",
"clasificacion": "Lavanderías y tintorerías",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de lavado y planchado de ropa.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "lavanderias tintorerias"
},
{
"clave": "812410",
"clasificacion": "Estacionamientos y pensiones para vehículos automotores",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de estacionamiento y pensión.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "estacionamientos pensiones vehiculos"
},
{
"clave": "812910",
"clasificacion": "Servicios de revelado e impresión de fotografías",
"descripcion": "Unidades económicas dedicadas principalmente a servicios de revelado e impresión de fotografías.",
"sector": "Otros servicios (reparación y personales)",
"categoria": "servicios",
"condicion": "revelado e impresion"
},
{
"clave": "236111",
"clasificacion": "Edificación de vivienda unifamiliar",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de vivienda unifamiliar.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion vivienda unifamiliar"
},
{
"clave": "236112",
"clasificacion": "Edificación de vivienda multifamiliar",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de vivienda multifamiliar.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion vivienda multifamiliar"
},
{
"clave": "236113",
"clasificacion": "Supervisión de edificación residencial",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de edificación residencial.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion residencial"
},
{
"clave": "236211",
"clasificacion": "Edificación de naves y plantas industriales, excepto la supervisión",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de naves y plantas industriales.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion naves plantas"
},
{
"clave": "236212",
"clasificacion": "Supervisión de edificación de naves y plantas industriales",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de edificación de naves industriales.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion naves plantas"
},
{
"clave": "236221",
"clasificacion": "Edificación de inmuebles comerciales y de servicios, excepto la supervisión",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de inmuebles comerciales y de servicios.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion inmuebles comerciales"
},
{
"clave": "236222",
"clasificacion": "Supervisión de edificación de inmuebles comerciales y de servicios",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de edificación comercial.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "edificacion inmuebles comerciales"
},
{
"clave": "237111",
"clasificacion": "Construcción de obras para el tratamiento, distribución y suministro de agua y drenaje",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras de agua y drenaje.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras tratamiento distribucion"
},
{
"clave": "237112",
"clasificacion": "Construcción de sistemas de riego agrícola",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de sistemas de riego agrícola.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "sistemas riego agricola"
},
{
"clave": "237113",
"clasificacion": "Supervisión de construcción de obras para el tratamiento, distribución y suministro de agua, drenaje y riego",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de obras de agua y riego.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "construccion obras tratamiento"
},
{
"clave": "237121",
"clasificacion": "Construcción de sistemas de distribución de petróleo y gas",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de sistemas de petróleo y gas.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "sistemas distribucion petroleo"
},
{
"clave": "237122",
"clasificacion": "Construcción de plantas de refinería y petroquímica",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de plantas de refinería.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "plantas refineria petroquimica"
},
{
"clave": "237123",
"clasificacion": "Supervisión de construcción de obras para petróleo y gas",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de obras para petróleo y gas.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "construccion obras petroleo"
},
{
"clave": "237131",
"clasificacion": "Construcción de obras de generación y conducción de energía eléctrica",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras de energía eléctrica.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras generacion conduccion"
},
{
"clave": "237132",
"clasificacion": "Construcción de obras para telecomunicaciones",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras para telecomunicaciones.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras telecomunicaciones"
},
{
"clave": "237133",
"clasificacion": "Supervisión de construcción de obras de generación y conducción de energía eléctrica y de obras para telecomunicaciones",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de obras de energía y telecomunicaciones.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "construccion obras generacion"
},
{
"clave": "237212",
"clasificacion": "Construcción de obras de urbanización",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras de urbanización.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras urbanizacion"
},
{
"clave": "237213",
"clasificacion": "Supervisión de división de terrenos y de construcción de obras de urbanización",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de obras de urbanización.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "division terrenos construccion"
},
{
"clave": "237311",
"clasificacion": "Instalación de señalamientos y protecciones en obras viales",
"descripcion": "Unidades económicas dedicadas principalmente a la instalación de señalamientos en obras viales.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "instalacion senalamientos protecciones"
},
{
"clave": "237312",
"clasificacion": "Construcción de carreteras, puentes y similares",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de carreteras y puentes.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "carreteras puentes similares"
},
{
"clave": "237313",
"clasificacion": "Supervisión de construcción de vías de comunicación",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de construcción de vías de comunicación.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "construccion vias comunicacion"
},
{
"clave": "237991",
"clasificacion": "Construcción de presas y represas",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de presas y represas.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "presas represas"
},
{
"clave": "237992",
"clasificacion": "Construcción de obras marítimas, fluviales y subacuáticas",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras marítimas y fluviales.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras maritimas fluviales"
},
{
"clave": "237993",
"clasificacion": "Construcción de obras para transporte eléctrico y ferroviario",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obras ferroviarias.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "obras transporte electrico"
},
{
"clave": "237994",
"clasificacion": "Supervisión de construcción de otras obras de ingeniería civil",
"descripcion": "Unidades económicas dedicadas principalmente a la supervisión de otras obras de ingeniería civil.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "construccion otras obras"
},
{
"clave": "237999",
"clasificacion": "Otras construcciones de ingeniería civil",
"descripcion": "Unidades económicas dedicadas principalmente a la construcción de obra civil no clasificada en otra parte.",
"sector": "Construcción",
"categoria": "servicios",
"condicion": "otras construcciones ingenieria"
}
];

export const SECTORES_ORDEN = ["Construcción", "Información en medios masivos", "Servicios inmobiliarios y de alquiler", "Servicios profesionales, científicos y técnicos", "Corporativos", "Servicios de apoyo a los negocios", "Comercio al por mayor", "Comercio al por menor", "Transportes y almacenamiento", "Servicios financieros y de seguros", "Servicios de salud y asistencia social", "Esparcimiento cultural y deportivo", "Alojamiento y preparación de alimentos", "Otros servicios (reparación y personales)"];

export function giroPorClave(clave) {
  return CATALOGO_GIROS.find((g) => g.clave === String(clave)) || null;
}

export function girosPorSector() {
  const map = {};
  for (const g of CATALOGO_GIROS) {
    (map[g.sector] = map[g.sector] || []).push(g);
  }
  return map;
}
