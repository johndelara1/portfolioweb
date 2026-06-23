---
layout: post
title: "Retrieval, Ranking e Reranking: contratos e trade-offs entre camadas"
featured-img: recsys_layers_unsplash
categories: [Sistemas de Recomendação, Machine Learning, MLOps, Data Engineering]
---

# Onde cada decisão deveria acontecer?

No [artigo anterior]({% post_url 2026-06-22-Sistemas-de-Recomendacao-Introducao %}), apresentei a arquitetura completa de um sistema de recomendação: dados, geração de candidatos, elegibilidade, ranking, reranking, logging, avaliação e monitoramento.

Este texto parte de outro ponto. A ideia aqui não é redesenhar o pipeline, mas discutir uma pergunta que aparece quando o sistema começa a crescer:

> Como distribuir responsabilidade entre *retrieval*, *ranking* e *reranking* sem transformar as três camadas em versões diferentes do mesmo modelo?

Essa separação parece simples no diagrama, mas fica menos óbvia quando surgem pressão por latência, regras de produto, métricas conflitantes, catálogo grande, itens novos e necessidade de explicar por que uma recomendação apareceu ou não apareceu.

O objetivo deste artigo é tratar essas camadas como **contratos arquiteturais**.

---

## 1) O contrato que cada camada precisa cumprir

Vamos assumir um catálogo fictício de 80 mil itens e uma home que mostra 20 posições.

Uma requisição pode seguir esta redução:

{% highlight text %}
80.000 itens disponíveis
        |
        v
Retrieval: 1.000 candidatos
        |
        v
Ranking: 1.000 candidatos ordenados
        |
        v
Reranking: 20 itens finais
{% endhighlight %}

O ponto importante não é apenas a redução de volume. Cada camada promete algo diferente para a próxima.

| Camada | Contrato principal | Erro mais caro |
|---|---|---|
| Retrieval | Trazer bons candidatos para a disputa | Excluir cedo um item que poderia ser relevante |
| Ranking | Estimar valor individual com contexto | Ordenar mal candidatos que já eram elegíveis |
| Reranking | Montar uma lista final coerente | Criar uma experiência redundante ou incompatível com restrições |

Essa tabela ajuda a evitar uma confusão comum: **um reranker não recupera item que nunca chegou ao ranking**.

Da mesma forma, o ranking pode aprender sinais de contexto, mas normalmente não é a melhor camada para decidir sozinho a composição final da lista. Ele pontua pares usuário-item. A experiência final, por outro lado, é uma sequência de itens, com interações entre eles.

---

## 2) Retrieval: o trade-off é recall versus custo

O retrieval deveria ser cobrado principalmente por cobertura.

A pergunta central é:

> Os itens que mereciam ser avaliados chegaram à lista de candidatos?

Se a resposta for não, o restante do pipeline trabalha com uma lista já empobrecida.

Um erro comum é exigir precisão demais cedo. Por exemplo, reduzir o catálogo para apenas 50 candidatos pode parecer eficiente, mas cria um gargalo: se um item ótimo aparece na posição 180 de uma busca vetorial, ele simplesmente desaparece da disputa.

O trade-off é direto:

{% highlight text %}
Mais candidatos
    -> mais recall
    -> mais custo no ranking
    -> mais latência potencial

Menos candidatos
    -> menos custo
    -> menor latência
    -> maior risco de perder bons itens
{% endhighlight %}

Por isso, a escolha de `K` não deveria ser arbitrária. Ela precisa ser medida por segmento.

Exemplos:

- `Recall@1000` geral;
- `Recall@1000` para usuários novos;
- `Recall@1000` para itens novos;
- `Recall@1000` por tipo de catálogo;
- `Recall@1000` por superfície.

O número agregado pode esconder falhas importantes. Um retrieval pode funcionar bem para usuários frequentes e falhar justamente onde o sistema mais precisa de robustez: *cold start*, nichos de catálogo ou itens recém-publicados.

---

## 3) Retrieval híbrido não é sofisticação gratuita

Quando uma única fonte gera candidatos, ela também herda um único conjunto de vieses.

Popularidade tende a favorecer itens já expostos. Similaridade de conteúdo pode ficar presa em temas muito próximos. Filtragem colaborativa pode sofrer com itens novos. Embeddings podem aproximar itens semanticamente parecidos, mas ainda assim pouco diversos.

Por isso, uma composição de fontes costuma ser mais estável:

{% highlight text %}
candidatos =
    400 por embeddings
    + 250 por comportamento semelhante
    + 200 por popularidade contextual
    + 100 por conteúdo semelhante
    + 50 por exploração
{% endhighlight %}

Os valores são ilustrativos. A decisão real depende de latência, catálogo, superfície, perfil de usuários e capacidade do ranking de processar candidatos.

O contrato do retrieval híbrido não é "acertar a ordem final". É **não deixar que um único ponto cego defina tudo o que o ranking pode ver**.

---

## 4) Ranking: estime valor individual, não política final

Depois que o catálogo foi reduzido, o ranking pode usar features mais caras e mais específicas.

A pergunta muda de:

> Este item merece entrar na disputa?

para:

> Qual é o valor esperado deste item para esta pessoa, neste contexto?

O ranking pode combinar sinais como afinidade, recência, sessão, tendência, histórico e contexto da superfície. Mas ele precisa ter uma função objetivo clara.

Se o modelo otimiza apenas clique, tende a favorecer itens chamativos. Se otimiza apenas consumo longo, pode penalizar conteúdos curtos que cumprem bem seu papel. Se ignora retorno, pode gerar consumo imediato e piorar satisfação depois.

Uma forma simples de pensar é:

{% highlight text %}
valor_esperado =
    probabilidade_de_iniciar
    * probabilidade_de_consumir_de_forma_significativa
{% endhighlight %}

Isso ainda é uma simplificação. O ponto é que o ranking precisa refletir a ação que a superfície quer incentivar, e não apenas a métrica mais fácil de coletar.

---

## 5) Regras determinísticas não deveriam morar dentro do score

Algumas decisões não são probabilísticas.

Exemplos:

- item indisponível;
- conteúdo bloqueado para determinado perfil;
- item já consumido recentemente;
- restrição editorial obrigatória;
- limite de frequência;
- duplicidade de catálogo.

Essas regras devem ficar em políticas explícitas de elegibilidade ou restrição, não escondidas como features no ranking.

Isso melhora três pontos:

| Benefício | Por que importa |
|---|---|
| Auditoria | Dá para explicar por que um item foi removido |
| Segurança operacional | Uma mudança no modelo não quebra uma regra obrigatória |
| Manutenção | A regra evolui sem exigir retreinamento |

Uma boa arquitetura separa:

{% highlight text %}
Elegibilidade: pode aparecer?
Ranking: qual é o valor individual?
Reranking: como compor a lista final?
{% endhighlight %}

Misturar essas perguntas torna o sistema mais difícil de debugar.

---

## 6) Por que o ranking não resolve diversidade sozinho

O ranking pontua itens individualmente. A lista final, porém, é coletiva.

Imagine uma saída ordenada assim:

{% highlight text %}
1. Série policial A
2. Série policial B
3. Série policial C
4. Série policial D
5. Série policial E
6. Documentário de natureza F
{% endhighlight %}

Cada série policial pode ter score alto. Mesmo assim, a experiência final pode ficar pobre porque quase não oferece alternativas.

O reranking muda a pergunta:

> Depois de selecionar este item, qual é o melhor próximo item para a lista?

Uma formulação clássica é combinar relevância individual com penalidade por similaridade aos itens já selecionados:

{% highlight text %}
score_final(item) =
    relevancia_individual(item)
    - lambda * similaridade(item, itens_ja_selecionados)
{% endhighlight %}

O parâmetro `lambda` controla o peso da diversidade.

- `lambda = 0`: a lista vira o ranking puro.
- `lambda` muito alto: a lista fica diversa, mas pode perder relevância.
- valor intermediário: busca equilíbrio entre qualidade individual e composição.

Diversidade também não é uma obrigação abstrata. Em uma home geral, variedade costuma ser desejável. Em uma busca explícita por "filmes de terror", diversidade temática demais pode atrapalhar. Em uma página de continuação de série, itens muito próximos podem ser exatamente o que o usuário espera.

Ou seja: diversidade depende de superfície, intenção e momento da jornada.

---

## 7) Um exemplo integrado: contrato, ranking, reranking e diagnóstico

O exemplo abaixo não tenta simular um sistema de produção. Ele concentra uma ideia: preservar o estado de cada camada para conseguir explicar onde um item foi perdido.

{% highlight python %}
items = [
    {"id": "s_101", "genre": "crime", "source": "embedding", "rank_score": 0.95},
    {"id": "s_102", "genre": "crime", "source": "embedding", "rank_score": 0.93},
    {"id": "s_103", "genre": "crime", "source": "similar_users", "rank_score": 0.91},
    {"id": "d_201", "genre": "documentary", "source": "popular", "rank_score": 0.84},
    {"id": "c_301", "genre": "comedy", "source": "exploration", "rank_score": 0.82},
    {"id": "a_401", "genre": "action", "source": "content", "rank_score": 0.80},
    {"id": "s_999", "genre": "crime", "source": "embedding", "rank_score": 0.79},
]

blocked_items = {"s_999"}

def retrieve(catalog, k=6):
    retrieved = catalog[:k]
    return retrieved, {item["id"]: "retrieved" for item in retrieved}

def apply_eligibility(candidates):
    eligible = []
    state = {}

    for item in candidates:
        if item["id"] in blocked_items:
            state[item["id"]] = "removed_by_eligibility"
            continue

        state[item["id"]] = "eligible"
        eligible.append(item)

    return eligible, state

def rank(candidates):
    ranked = sorted(
        candidates,
        key=lambda item: item["rank_score"],
        reverse=True
    )

    return ranked, {item["id"]: position for position, item in enumerate(ranked, start=1)}

def similarity(candidate, selected_item):
    return float(candidate["genre"] == selected_item["genre"])

def rerank(ranked, limit=4, diversity_weight=0.20):
    selected = []
    remaining = ranked.copy()

    while remaining and len(selected) < limit:
        def final_score(candidate):
            if not selected:
                return candidate["rank_score"]

            max_similarity = max(
                similarity(candidate, selected_item)
                for selected_item in selected
            )

            return candidate["rank_score"] - diversity_weight * max_similarity

        best = max(remaining, key=final_score)
        selected.append(best)
        remaining.remove(best)

    return selected

retrieved, retrieval_state = retrieve(items, k=7)
eligible, eligibility_state = apply_eligibility(retrieved)
ranked, ranking_positions = rank(eligible)
final_list = rerank(ranked, limit=4)

print("Final list:")
for position, item in enumerate(final_list, start=1):
    print(position, item["id"], item["genre"], item["rank_score"])

def diagnose(item_id):
    if item_id not in retrieval_state:
        return "not_retrieved"
    if eligibility_state.get(item_id) == "removed_by_eligibility":
        return "removed_by_eligibility"
    if item_id not in ranking_positions:
        return "not_ranked"
    if item_id not in {item["id"] for item in final_list}:
        return "removed_or_displaced_by_reranking"
    return "shown"

for item_id in ["s_101", "d_201", "s_999", "x_404"]:
    print(item_id, diagnose(item_id))
{% endhighlight %}

Esse exemplo junta quatro preocupações:

- o retrieval define o que entra na disputa;
- a elegibilidade remove itens por regra explícita;
- o ranking ordena por valor individual;
- o reranking altera a lista considerando os itens já selecionados.

O ponto mais importante é o diagnóstico. Quando alguém pergunta por que um item não apareceu, a resposta não deveria ser apenas "o modelo não escolheu". A arquitetura precisa dizer se o item:

- nunca foi recuperado;
- foi removido por regra;
- ficou mal posicionado no ranking;
- foi deslocado pelo reranking;
- apareceu, mas não gerou interação.

Essa decomposição evita a reação comum de retreinar o ranking para todo problema observado.

---

## 8) Como saber em qual camada mexer?

Uma forma prática é transformar sintomas em hipóteses de camada.

| Sintoma | Hipótese principal | Primeira investigação |
|---|---|---|
| Bons itens nunca aparecem como candidatos | Retrieval com baixo recall | Recall@K por segmento e por fonte |
| Itens chegam, mas ficam sempre abaixo | Ranking fraco ou objetivo desalinhado | NDCG@K, análise de features e labels |
| Lista final é repetitiva | Reranking insuficiente | Métricas de diversidade e repetição |
| Lista final parece diversa demais | Penalidade excessiva | Sensibilidade do `lambda` por superfície |
| Regras removem muitos itens | Elegibilidade agressiva | Taxa de remoção por regra |
| Métrica offline sobe e experiência piora | Viés histórico ou objetivo incompleto | Experimento online e métricas de proteção |

Esse tipo de tabela ajuda a proteger o sistema contra soluções reflexas.

Se o problema é baixo recall no retrieval, melhorar o modelo de ranking pode esconder a falha, mas não resolve a causa. Se o problema é uma regra determinística agressiva, aumentar diversidade no reranking também não corrige. Se o problema é objetivo de ranking desalinhado, um reranker sofisticado apenas reorganiza uma lista já ruim.

---

## Mão na massa: um experimento para comparar camadas

Um projeto prático pode usar MovieLens ou dados sintéticos. A proposta não é montar uma plataforma completa, mas responder perguntas específicas:

1. Um retrieval híbrido melhora `Recall@K` em relação a uma única fonte?
2. Um ranking contextual melhora `NDCG@K` em relação à popularidade segmentada?
3. Um reranker reduz repetição sem destruir relevância?
4. Em quais segmentos cada ganho ou perda acontece?

Uma estrutura simples:

{% highlight text %}
recsys-layer-contracts/
├── data/
│   ├── raw/
│   └── processed/
├── src/
│   ├── retrieval/
│   │   ├── popularity.py
│   │   ├── content_similarity.py
│   │   └── hybrid.py
│   ├── ranking/
│   │   ├── baseline.py
│   │   └── features.py
│   ├── reranking/
│   │   └── mmr.py
│   ├── evaluation/
│   │   ├── retrieval_metrics.py
│   │   ├── ranking_metrics.py
│   │   └── list_metrics.py
│   └── pipeline.py
├── notebooks/
│   └── analysis.ipynb
├── tests/
├── README.md
└── requirements.txt
{% endhighlight %}

Checklist mínimo:

| Camada | Métrica | Pergunta |
|---|---|---|
| Retrieval | `Recall@K` | O item relevante entrou na disputa? |
| Ranking | `NDCG@K` | Os itens mais promissores foram para o topo? |
| Reranking | diversidade, repetição e perda de score | A lista ficou menos redundante sem perder qualidade demais? |
| Elegibilidade | taxa de remoção por regra | Alguma regra está eliminando candidatos demais? |

O projeto fica mais útil quando apresenta resultado por segmento, e não apenas um número agregado.

---

## Conclusão

Retrieval, ranking e reranking não são três nomes para a mesma tarefa.

- **Retrieval** protege cobertura: bons itens precisam chegar à disputa.
- **Ranking** estima valor individual: candidatos precisam ser ordenados com contexto.
- **Reranking** protege a composição: a lista final precisa equilibrar relevância, diversidade e restrições.
- **Elegibilidade** protege decisões determinísticas: regras obrigatórias precisam ser explícitas e auditáveis.

O ganho dessa separação não é apenas escalabilidade. É capacidade de diagnosticar falhas, testar hipóteses e evoluir o sistema sem colocar toda a responsabilidade em um único modelo.

No próximo artigo, quero sair da arquitetura de decisão e entrar em uma peça central desse tipo de sistema: **como avaliar se embeddings de usuários e itens realmente carregam informação útil**.

---

## Referências

- Covington, Paul; Adams, Jay; Sargin, Emre. *Deep Neural Networks for YouTube Recommendations*. RecSys, 2016. [ACM Digital Library](https://dl.acm.org/doi/10.1145/2959100.2959190)
- Carbonell, Jaime; Goldstein, Jade. *The Use of MMR, Diversity-Based Reranking for Reordering Documents and Producing Summaries*. SIGIR, 1998. [ACM Digital Library](https://dl.acm.org/doi/10.1145/290941.291025)
- Ricci, Francesco; Rokach, Lior; Shapira, Bracha (eds.). *Recommender Systems Handbook*. Springer, 2022. [Springer](https://link.springer.com/book/10.1007/978-1-0716-2197-4)
- Kula, Maciej. *Metadata Embeddings for User and Item Cold-start Recommendations*. RecSys, 2015. [arXiv](https://arxiv.org/abs/1507.08439)
- TensorFlow Recommenders. *Retrieval, ranking and recommendation workflows*. [tensorflow.org/recommenders](https://www.tensorflow.org/recommenders)

## Créditos das imagens

- Imagem de capa: foto de painel de analytics em laptop por [Luke Chesser](https://unsplash.com/@lukechesser), disponível no [Unsplash](https://unsplash.com/). Uso conforme a [Unsplash License](https://unsplash.com/license).
