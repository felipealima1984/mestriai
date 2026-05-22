from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

for section in doc.sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

title = doc.add_heading('Estuda.AI — Roadmap de Melhorias e Correcoes', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
for run in title.runs:
    run.font.size = Pt(18)
    run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)

meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = meta.add_run('Levantamento: 22/05/2026  |  Disponibilidade: 15h/dia  |  Total estimado: ~96h = 6,5 dias')
run.font.size = Pt(9)
run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

doc.add_paragraph()


def add_tier_heading(doc, text, color_rgb):
    h = doc.add_heading(text, level=1)
    for run in h.runs:
        run.font.color.rgb = RGBColor(*color_rgb)
        run.font.size = Pt(13)


def shade_cell(cell, fill_hex):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)


def add_table(doc, headers, rows, col_widths):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = 'Table Grid'
    hdr_row = table.rows[0]
    for i, h in enumerate(headers):
        cell = hdr_row.cells[i]
        cell.text = h
        p = cell.paragraphs[0]
        p.runs[0].bold = True
        p.runs[0].font.size = Pt(9)
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        shade_cell(cell, '1a1a2e')
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
    for ri, row_data in enumerate(rows):
        row = table.rows[ri + 1]
        for ci, val in enumerate(row_data):
            cell = row.cells[ci]
            cell.text = str(val)
            sz = Pt(7.5) if ci == len(headers) - 1 else Pt(8)
            cell.paragraphs[0].runs[0].font.size = sz
        if ri % 2 == 0:
            for ci in range(len(headers)):
                shade_cell(row.cells[ci], 'f0f4ff')
    for i, w in enumerate(col_widths):
        for cell in table.columns[i].cells:
            cell.width = Inches(w)


# TIER 1
add_tier_heading(doc, 'TIER 1 - Critico  (bugs + divida de produto)  |  30h = 2 dias', (0xc0, 0x39, 0x2b))
p = doc.add_paragraph('Prioridade maxima. Bloqueiam monetizacao ou causam erros visiveis ao usuario.')
p.runs[0].font.size = Pt(8)
p.runs[0].italic = True

add_table(doc,
    ['#', 'Atividade', 'Horas', 'Notas'],
    [
        ['1', 'Fix bug progId is not defined ao duplicar aba de Materias', '1h',
         'switchMatTab() referencia progId como variavel livre em onclick'],
        ['2', 'Unificar os dois rows de botoes de programa no painel Materias', '1h',
         'Remover duplicidade de renderizacao'],
        ['3', 'Integracao Stripe real (substituir ativarPremiumDemo())', '16h',
         'Checkout session, webhook, atualizacao de plano no Supabase'],
        ['4', 'Proxy API via Supabase Edge Function', '8h',
         'Plataforma chama Anthropic com chave propria; controle por plano; fim da dependencia da chave do usuario'],
        ['5', 'Rate limiting real no backend (Supabase)', '4h',
         'Contador de geracoes via RLS/trigger - nao so frontend; impede burla via console'],
    ],
    [0.25, 3.2, 0.6, 2.9]
)

doc.add_paragraph()

# TIER 2
add_tier_heading(doc, 'TIER 2 - Roadmap pendente  |  34h = 2,3 dias', (0xe6, 0x7e, 0x22))
p = doc.add_paragraph('Features prometidas ou planejadas que aumentam retencao e percepcao de valor.')
p.runs[0].font.size = Pt(8)
p.runs[0].italic = True

add_table(doc,
    ['#', 'Atividade', 'Horas', 'Notas'],
    [
        ['6', 'PWA: manifest.json + Service Worker offline', '6h',
         'Instalacao na tela inicial do celular; funciona offline real'],
        ['7', 'Push notifications para revisao SM-2', '8h',
         'Lembrete no dia correto de revisar; SM-2 perde metade do valor sem alerta'],
        ['8', 'Onboarding wizard para novos usuarios', '6h',
         'Wizard 3 passos: criar programa > materia > primeira historinha'],
        ['9', 'Historico de notas das redacoes com grafico', '4h',
         'Chart.js ja disponivel; salvar nota por redacao no Supabase'],
        ['10', 'Exportacao de historinhas e flashcards para PDF', '6h',
         'window.print() + CSS de impressao ou jsPDF'],
        ['11', 'Estatisticas por materia e por periodo', '4h',
         'Breakdown de acertos/erros por materia no simulado'],
    ],
    [0.25, 3.2, 0.6, 2.9]
)

doc.add_paragraph()

# TIER 3
add_tier_heading(doc, 'TIER 3 - Novas features de valor  |  29h = 2 dias', (0x27, 0x6e, 0x48))
p = doc.add_paragraph('Diferenciam o produto; aumentam engajamento e conversao para premium.')
p.runs[0].font.size = Pt(8)
p.runs[0].italic = True

add_table(doc,
    ['#', 'Atividade', 'Horas', 'Notas'],
    [
        ['12', 'Diagnostico de lacunas de conhecimento', '8h',
         'Identifica topicos com mais erros no simulado > sugere historinha ou revisao SM-2'],
        ['13', 'Compartilhamento de programas de estudo', '6h',
         'Export/import de programa com materias e topicos (JSON)'],
        ['14', 'Estimativa de prontidao para a prova', '4h',
         '"Com seu ritmo atual, cobrira X% do conteudo ate a data da prova"'],
        ['15', 'Suporte a LaTeX/MathJax nas respostas', '3h',
         'Essencial para Economia (formulas em texto puro degradam o conteudo)'],
        ['16', 'Testes automatizados basicos (assertions no console)', '8h',
         'Arquivo tests.js separado com smoke tests; 4313 linhas sem teste e risco alto'],
    ],
    [0.25, 3.2, 0.6, 2.9]
)

doc.add_paragraph()

# TECH DEBT
add_tier_heading(doc, 'TECH DEBT - Documentacao e qualidade  |  3h', (0x55, 0x55, 0x55))

add_table(doc,
    ['#', 'Atividade', 'Horas', 'Notas'],
    [
        ['17', 'Atualizar README.md (v1.4 + freemium + multiplos programas)', '1h',
         'README ainda descreve v1.1/v1.2; SM-2 listado como pendente mas ja feito'],
        ['18', 'Otimizar max_tokens por tipo de chamada a API', '2h',
         'callClaude() usa 1200 fixo; plano de estudos precisa 3000; historinha 800'],
    ],
    [0.25, 3.2, 0.6, 2.9]
)

doc.add_paragraph()

# RESUMO
doc.add_heading('Resumo Geral', level=2)
add_table(doc,
    ['Tier', 'Horas', 'Dias (15h/dia)'],
    [
        ['Tier 1 - Critico', '30h', '2,0 dias'],
        ['Tier 2 - Roadmap pendente', '34h', '2,3 dias'],
        ['Tier 3 - Novas features', '29h', '1,9 dias'],
        ['Tech Debt', '3h', '0,2 dias'],
        ['TOTAL', '96h', '~6,5 dias'],
    ],
    [3.5, 1.5, 2.0]
)

doc.add_paragraph()

doc.add_heading('Ordem Recomendada de Execucao', level=2)
order_lines = [
    ('Semana 1 - Dias 1-2:', 'Items 1, 2, 17, 18 (bugs + tech debt) | Items 3, 4, 5 (monetizacao real)'),
    ('Semana 2 - Dias 3-4:', 'Items 6, 7, 8 (retencao mobile + onboarding) | Items 9, 10, 11 (roadmap pendente)'),
    ('Semana 3 - Dias 5-7:', 'Items 12, 13, 14 (features diferenciadores) | Items 15, 16 (qualidade)'),
]
for label, content in order_lines:
    p = doc.add_paragraph()
    run_l = p.add_run(label + '  ')
    run_l.bold = True
    run_l.font.size = Pt(9)
    run_c = p.add_run(content)
    run_c.font.size = Pt(9)

doc.add_paragraph()
footer_p = doc.add_paragraph('Gerado automaticamente pela analise do projeto em 22/05/2026.')
footer_p.runs[0].font.size = Pt(7.5)
footer_p.runs[0].italic = True
footer_p.runs[0].font.color.rgb = RGBColor(0xaa, 0xaa, 0xaa)

doc.save('ROADMAP.docx')
print('ROADMAP.docx criado com sucesso')
