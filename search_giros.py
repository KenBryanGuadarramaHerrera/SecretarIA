import re

content = open('src/radar_demo/catalogoGiros.js', encoding='utf-8').read()
matches = re.findall(r'\{\s*"clave":\s*"([^"]*)",\s*"clasificacion":\s*"([^"]*)",\s*"descripcion":\s*"([^"]*)",\s*"sector":\s*"([^"]*)",\s*"categoria":\s*"([^"]*)",\s*"condicion":\s*"([^"]*)"\s*\}', content)

for m in matches:
    if m[0].startswith('722') or 'bebida' in m[1].lower() or 'alcoh' in m[1].lower() or 'bar' in m[1].lower() or 'servicios de prepar' in m[1].lower():
        print(f"Clave: {m[0]} | Clasificacion: {m[1]} | Categoria: {m[4]}")
