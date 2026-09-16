---
name: estudaai-domain
description: Ativar quando trabalhar com logica de dominio do Estuda.AI — programas de estudo, materias, topicos, periodos, geracoes de conteudo via Claude, revisao espacada, gamificacao, planos de estudo ou qualquer regra de negocio da plataforma.
---

# Dominio Estuda.AI

## Hierarquia de dados
Programa > Materia > Topicos (N1/N2/N3) > Conteudo gerado (historinhas, flashcards, questoes)

## Tipos de programa
- concurso: CACD, OAB, etc — tem unidades (1a fase, 2a fase)
- disciplina: Direito Civil, Historia, etc — materia continua sem fases

## Tipos de conteudo gerado pela IA
- historinha: texto narrativo que ensina o topico como uma historia
- flashcards: pares pergunta/resposta para revisao
- questoes: simulado com alternativas e gabarito
- redacao: tema + correcao pela IA
- plano: cronograma semanal de estudos (premium)

## Algoritmo SM2 (revisao espacada)
Implementado em sm2(card, qualidade) — qualidade de 0 a 5:
- 0-2: nao lembrou — resetar intervalo
- 3: lembrou com dificuldade — intervalo minimo
- 4: lembrou bem — intervalo normal
- 5: lembrou perfeitamente — intervalo maximo

## Gamificacao
- XP ganho por: gerar conteudo, revisar flashcards, completar simulado, enviar redacao
- Niveis baseados em XP acumulado
- Streak: dias consecutivos de estudo
- getNivel(xp) retorna o nivel atual

## Funcoes principais por funcionalidade
- gerarHistorinha(tipo): gera texto narrativo via Claude
- gerarSimulado(): gera questoes via Claude
- gerarDoMaterial(): processa PDF/texto e gera conteudo
- gerarTemaRedacao(): sugere tema de redacao
- corrigirRedacao(): corrige redacao enviada
- gerarPlanoPremium(): gera plano de estudos semanal (premium)
- iniciarRevisao(): inicia sessao de revisao espacada SM2

## Contexto enviado ao Claude em cada geracao
getContextoMateria(materiaId, unidade) monta o contexto com:
- Nome da materia e programa
- Topicos N1/N2/N3 cadastrados
- Unidade/fase ativa

## Limites e controles
- contarGeracao() — retorna false e abre paywall se limite atingido
- isPremium() — verifica se usuario tem plano premium
- Plano free: 20 geracoes/mes, 1 programa de estudos
