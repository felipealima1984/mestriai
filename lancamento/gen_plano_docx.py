from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.text import WD_BREAK
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

doc = Document()

for section in doc.sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

DARK = RGBColor(0x1a, 0x1a, 0x2e)
GREY = RGBColor(0x55, 0x55, 0x55)
ACCENT = RGBColor(0x0f, 0x6e, 0x63)

title = doc.add_heading('Mestriai — Plano de Lancamento', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
for run in title.runs:
    run.font.size = Pt(18)
    run.font.color.rgb = DARK

meta = doc.add_paragraph()
meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = meta.add_run(
    'Escrito em: 08/09/2026  |  Parado ha 3,5 meses  |  Fases 1-3 do ROADMAP.md: 100% feitas\n'
    'O que falta nao e produto, e cobranca.'
)
run.font.size = Pt(9)
run.font.color.rgb = GREY

doc.add_paragraph()


def shade_cell(cell, fill_hex):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)


def add_section_heading(text, color_rgb=DARK, level=1, size=13):
    if isinstance(color_rgb, tuple):
        color_rgb = RGBColor(*color_rgb)
    h = doc.add_heading(text, level=level)
    for run in h.runs:
        run.font.color.rgb = color_rgb
        run.font.size = Pt(size)
    return h


def add_note(text, italic=True, size=8.5, color=None):
    p = doc.add_paragraph(text)
    p.runs[0].font.size = Pt(size)
    p.runs[0].italic = italic
    if color:
        p.runs[0].font.color.rgb = color


def add_table(headers, rows, col_widths, header_fill='1a1a2e'):
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
        shade_cell(cell, header_fill)
        p.runs[0].font.color.rgb = RGBColor(0xff, 0xff, 0xff)
    for ri, row_data in enumerate(rows):
        row = table.rows[ri + 1]
        for ci, val in enumerate(row_data):
            cell = row.cells[ci]
            cell.text = str(val)
            run = cell.paragraphs[0].runs[0]
            run.font.size = Pt(8.5)
        if ri % 2 == 0:
            for ci in range(len(headers)):
                shade_cell(row.cells[ci], 'f0f4ff')
    for i, w in enumerate(col_widths):
        for cell in table.columns[i].cells:
            cell.width = Inches(w)
    return table


def add_checklist(items, size=9.5):
    for item in items:
        p = doc.add_paragraph(style='List Bullet')
        run = p.add_run('☐  ' + item)
        run.font.size = Pt(size)


# ---------------------------------------------------------------
# ESTIMATIVA DE PRAZO
# ---------------------------------------------------------------
add_section_heading('Estimativa de prazo', ACCENT, level=1, size=14)

add_table(
    ['Marco', 'Data alvo'],
    [
        ['Volta a mexer no codigo, ambiente confirmado', '08-14/set (semana 0)'],
        ['Fim do BYOK + proxy funcionando', '~28/set (semana 3)'],
        ['Stripe funcionando ponta a ponta', '~05/out (semana 4)'],
        ['Primeiro pagante real', '~13-20/out (semana 5-6)'],
        ['Lancamento aberto a comunidades de concurso', '~09-16/nov (semana 9-10)'],
    ],
    [4.2, 2.3],
)

doc.add_paragraph()
add_note(
    'Resumo: da pra ter o primeiro real de receita em ~5-6 semanas, e um lancamento publico de '
    'verdade em ~9-10 semanas -- outubro e novembro, com folga confortavel antes de janeiro/2027.',
    italic=False, size=10,
)
add_note(
    'Essa conta assume ritmo realista de projeto paralelo (algumas horas por dia, nao as "15h/dia" '
    'otimistas do ROADMAP.md de maio) e ~40h de trabalho tecnico ao todo. Se voce conseguir dedicar '
    'mais horas por semana, os marcos acima puxam pra tras -- mas nao force: o gargalo real e validar '
    'com gente de verdade, nao escrever codigo mais rapido.'
)

doc.add_paragraph()

# ---------------------------------------------------------------
# POR QUE ESSA ORDEM
# ---------------------------------------------------------------
add_section_heading('Por que essa ordem (e nao outra)', ACCENT, level=1, size=14)

p = doc.add_paragraph()
p.add_run('O pre-mortem identificou dois problemas, nao um:').font.size = Pt(9.5)

items = [
    'Friccao de ativacao -- hoje, pra gerar um unico flashcard, o usuario precisa criar conta na '
    'Anthropic, cadastrar cartao e colar uma API key (callClaude(), index.html:2535 -- chama '
    'api.anthropic.com direto do navegador com apiKey do usuario). Ninguem do publico-alvo '
    '(concurseiro, nao-dev) passa por isso.',
    'Sem cobranca nenhuma -- isPremium(), contarGeracao(), ativarPremiumDemo() '
    '(index.html:4147-4193) vivem so no localStorage do navegador. Qualquer pessoa abre o '
    'DevTools, digita plano.tipo = \'premium\' e tem tudo liberado de graca, pra sempre.',
]
for it in items:
    pp = doc.add_paragraph(it, style='List Number')
    pp.runs[0].font.size = Pt(9)

add_note(
    'Os dois se resolvem com a mesma peca de infraestrutura: uma Supabase Edge Function que guarda a '
    'sua chave Anthropic no servidor (nunca no navegador -- e exatamente o erro que matou o Flashly) e '
    'decide, a cada chamada, se aquele usuario ainda tem geracao disponivel. Por isso ela vem antes do '
    'Stripe: sem isso, integrar pagamento seria cobrar por um controle de acesso que nao existe de verdade.',
    italic=False, size=9.5,
)

doc.add_paragraph()

# ---------------------------------------------------------------
# FASES
# ---------------------------------------------------------------

add_section_heading('Semana 0 (08-14/set) -- Retomada', DARK, level=1, size=12)
add_note('Antes de escrever qualquer codigo novo, confirme que nada apodreceu em 3,5 meses parado.')
add_checklist([
    'Rodar tests.js no console do app publicado (GitHub Pages) -- as 340+ assercoes ainda devem passar',
    'Conferir se o projeto Supabase ainda esta ativo (projetos free ficam inativos apos 1 semana sem uso)',
    'Conferir se a chave Anthropic pessoal usada em testes ainda e valida e tem credito',
    'Reler CLAUDE.md, ROADMAP.md e os 4 skills em .claude/skills/ (estudaai-domain, stripe-monetization, '
    'supabase-patterns, vanilla-js-patterns)',
    'Decidir se o preco continua R$29,90/mes ou se muda antes do primeiro teste real',
    'Criar branch feature/monetizacao a partir de main',
])
doc.add_paragraph()

add_section_heading('Fase A -- Fim do BYOK + proxy (semanas 1-3, ate ~28/set)', (0x27, 0x6e, 0x48), level=1, size=12)
add_note('Substitui o item 17 do ROADMAP.md ("Proxy API via Supabase Edge Function").')
add_checklist([
    'Criar Edge Function no Supabase (Deno) que recebe { prompt, maxTokens, feature } autenticado pelo '
    'JWT do Supabase Auth',
    'A funcao guarda ANTHROPIC_API_KEY como secret do Supabase (supabase secrets set) -- nunca em codigo, '
    'nunca no index.html',
    'Funcao consulta a tabela stats/plano do usuario autenticado, decrementa geracao disponivel, so '
    'entao chama api.anthropic.com com a chave do servidor',
    'Trocar callClaude() (index.html:2535) para chamar essa Edge Function em vez de api.anthropic.com direto',
    'Manter o fluxo de "colar sua propria chave" como opcao avancada/oculta, nao mais obrigatoria no onboarding',
    'Atualizar o wizard de onboarding (initOnboarding) pra nao pedir chave Anthropic no primeiro contato',
])
add_note('Criterio de pronto: uma conta nova, sem colar nenhuma chave, consegue gerar uma historinha.', italic=True, size=8.5, color=GREY)
doc.add_paragraph()

add_section_heading('Fase B -- Cobranca de verdade nao confia no navegador (dentro da Fase A)', (0x27, 0x6e, 0x48), level=1, size=12)
add_note('Substitui o item 18 do ROADMAP.md ("Rate limiting real no backend").')
add_checklist([
    'O contador de geracoes do plano free passa a viver na tabela do Supabase, verificado dentro da '
    'propria Edge Function da Fase A',
    'isPremium() (index.html:4147) passa a ler o plano vindo do Supabase (carregarPlanoDoSupabase(), ja '
    'previsto no skill stripe-monetization) em vez de so plano.tipo do localStorage',
    'localStorage continua existindo como cache de exibicao, nunca mais como fonte da verdade',
])
add_note('Criterio de pronto: digitar plano.tipo = \'premium\' no DevTools nao libera mais nada.', italic=True, size=8.5, color=GREY)
doc.add_paragraph()

add_section_heading('Fase C -- Stripe (semana 4, ate ~05/out)', (0xe6, 0x7e, 0x22), level=1, size=12)
add_note('Substitui o item 16 do ROADMAP.md.')
add_checklist([
    'Criar produto + preco no Stripe (R$29,90/mes) -- considerar o plano anual R$199 do skill '
    'stripe-monetization como segunda opcao, nao bloqueante',
    'Checkout Session via outra Edge Function do Supabase (mesmo projeto da Fase A)',
    'Webhook do Stripe (checkout.session.completed, customer.subscription.deleted) grava/atualiza a '
    'tabela subscriptions no Supabase',
    'ativarPremiumDemo() (index.html:4186) sai de cena -- o botao de upgrade no paywall '
    '(abrirPaywall(), index.html:4174) passa a abrir o Checkout real do Stripe',
    'isPremium() passa a refletir subscriptions (fonte da verdade)',
])
add_note('Criterio de pronto: um pagamento de teste no Stripe (modo test) libera premium sem tocar em '
         'codigo; cancelar a assinatura derruba de volta pro free no proximo login.', italic=True, size=8.5, color=GREY)
doc.add_paragraph()

add_section_heading('Fase D -- QA + instrumentacao minima (semana 5, ate ~12/out)', (0xc0, 0x39, 0x2b), level=1, size=12)
add_checklist([
    'Fluxo ponta a ponta: cadastro -> 10 geracoes gratis -> paywall -> checkout -> premium liberado -> '
    'cancelamento -> volta a free',
    'Registrar 3 eventos simples (tabela nova eventos no Supabase): cadastro, primeira_geracao, retorno_d7',
    'Rodar tests.js de novo depois de todas as mudancas',
])
doc.add_paragraph()

add_section_heading('Fase E -- Lancamento fechado (semana 6, ~13-20/out)', (0xc0, 0x39, 0x2b), level=1, size=12)
add_checklist([
    'Convidar 15-20 pessoas do seu circulo direto de estudos (CACD/concurso -- pastas estudos_cacd e '
    'cronogramaEstudos na workspace)',
    'Acompanhar os 3 eventos da Fase D diariamente nessa semana',
    'Meta realista: 1-3 pagantes reais saindo desse grupo fechado',
])
doc.add_paragraph()

add_section_heading('Fase F -- Iteracao (semanas 7-8, ~20/out-02/nov)', (0xc0, 0x39, 0x2b), level=1, size=12)
add_checklist([
    'Ajustar onboarding/preco com base no que travou no grupo fechado -- usar os eventos registrados, nao adivinhar',
    'Corrigir qualquer atrito real relatado antes de abrir pra mais gente',
])
doc.add_paragraph()

add_section_heading('Fase G -- Abertura publica (semanas 9-10, ~03-16/nov)', (0xc0, 0x39, 0x2b), level=1, size=12)
add_checklist([
    'Levar para comunidades de concurso alem do seu circulo direto (WhatsApp/Telegram de CACD, foruns, '
    'Instagram de aprovados)',
    'Manter o app restrito a esse nicho no lancamento -- "qualquer concurso ou materia" e ambicao pra '
    'depois de ter tracao, nao para o dia 1',
])
doc.add_paragraph()

# ---------------------------------------------------------------
# CHECKLIST FINAL
# ---------------------------------------------------------------
add_section_heading('Checklist final antes de cobrar de estranhos', RGBColor(0xc0, 0x39, 0x2b), level=1, size=13)
add_note('Nao avance pra Fase G sem marcar os tres:', italic=False, size=9.5)
add_checklist([
    'Nenhuma chave paga (Anthropic, Supabase service role) aparece em qualquer arquivo servido pelo '
    'GitHub Pages -- confira com "Exibir codigo-fonte" no site publicado, nao so no editor',
    'isPremium() foi testado tentando burlar pelo console do navegador e nao libera nada',
    'Um cancelamento de assinatura no Stripe realmente derruba o acesso premium no app',
], size=10)

doc.add_paragraph()

# ---------------------------------------------------------------
# FORA DO ESCOPO
# ---------------------------------------------------------------
add_section_heading('O que fica fora deste plano de proposito', DARK, level=2, size=12)
for it in [
    'Suporte a "qualquer concurso" alem de CACD/Direito -- so depois de validar com o nicho inicial',
    'Plano anual, cupons, periodo de teste gratuito de X dias -- vem depois do primeiro sinal real de conversao',
    'Qualquer feature nova de produto -- Fases 1-3 ja estao completas; a proxima linha de codigo que vale '
    'a pena e a que cobra, nao a que soma mais uma funcionalidade',
]:
    pp = doc.add_paragraph(it, style='List Bullet')
    pp.runs[0].font.size = Pt(9)

doc.add_paragraph()
footer_p = doc.add_paragraph(
    'Este arquivo acompanha o ROADMAP.md (que mapeia o "o que") -- aqui esta o "quando" e o "em que '
    'ordem". Atualize os checkboxes conforme for avancando.'
)
footer_p.runs[0].font.size = Pt(7.5)
footer_p.runs[0].italic = True
footer_p.runs[0].font.color.rgb = RGBColor(0xaa, 0xaa, 0xaa)

doc.save('PLANO-LANCAMENTO.docx')
print('PLANO-LANCAMENTO.docx gerado com sucesso.')
