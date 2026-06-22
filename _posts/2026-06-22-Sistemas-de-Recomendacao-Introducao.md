---
layout: post
title: "O que transforma um modelo em um sistema de recomendação?"
featured-img: recommendation_system
categories: [Sistemas de Recomendação, Machine Learning, MLOps, Data Engineering]
---

# Vamos começar entendendo o que será construído

> *O tema deste artigo é sistemas de recomendação: soluções que combinam dados, regras, modelos e monitoramento para decidir quais itens mostrar a cada pessoa em um determinado contexto.*
>
> *Um modelo de Machine Learning pode estimar a relevância de um item. Um sistema de recomendação precisa ir além: obter candidatos, filtrar itens indisponíveis, ordenar resultados, respeitar restrições do produto, registrar exposições e aprender continuamente com o comportamento observado.*
>
> **Então aperte o cinto e vamos nessa!**

---

## Breve apresentação

Quando falamos em recomendação, é comum imaginar que todo o problema se resume a treinar um algoritmo que responda à pergunta: *"qual item este usuário provavelmente vai consumir?"*.

Esse algoritmo é importante, mas está longe de ser o sistema inteiro.

Imagine uma plataforma fictícia de conteúdo chamada **StreamBox**. Ela possui milhares de filmes, séries, documentários e programas. Ao abrir a página inicial, uma pessoa espera encontrar uma seleção relevante em poucos segundos. Para isso acontecer, a plataforma precisa responder simultaneamente a perguntas diferentes:

- Quais itens podem ser considerados para esta pessoa agora?
- Quais desses itens já foram vistos, estão indisponíveis ou não são adequados ao contexto?
- Como estimar a chance de interesse de cada item?
- Como evitar uma página inteira composta por itens quase idênticos?
- Como medir se a recomendação realmente melhorou a experiência?
- Como saber se os dados e o modelo continuam confiáveis ao longo do tempo?

A resposta não é apenas "um modelo". É uma **arquitetura de decisão**.

Neste artigo, vamos montar uma visão prática de um sistema de recomendação genérico e publicável, usando exemplos fictícios. O objetivo não é descrever uma solução de uma empresa específica, mas apresentar os componentes que costumam transformar um protótipo de notebook em uma solução confiável de produto.

## Recomendação:

Antes de implementar qualquer sistema, vale adotar três cuidados:

- Comece com dados públicos, simulados ou anonimizados. Não use eventos, tabelas, nomes de projetos ou métricas internas.
- Defina primeiro o objetivo de produto. Clique, consumo, retenção, descoberta e diversidade podem levar a soluções diferentes.
- Construa uma linha de base simples antes de usar modelos complexos. Um ranking por popularidade segmentada pode ser uma referência útil para medir evolução.

---

## O problema: escolher poucos itens entre muitos

Em um catálogo grande, comparar cada pessoa com todos os itens disponíveis pode ser caro demais para uma experiência em tempo real. Além disso, nem todo item é elegível: alguns já foram consumidos, outros podem estar temporariamente indisponíveis, e alguns não fazem sentido naquele contexto.

Por isso, uma arquitetura comum separa o problema em etapas:

{% highlight text %}
Eventos e catálogo
        |
        v
Preparação de dados e features
        |
        v
Geração de candidatos (retrieval)
        |
        v
Filtros de elegibilidade e regras
        |
        v
Modelo de ranking
        |
        v
Reranking com diversidade e restrições
        |
        v
Exposição na interface + logging
        |
        v
Métricas, experimentação e monitoramento
{% endhighlight %}

A separação de responsabilidades é importante. Cada camada resolve uma parte específica do problema e pode evoluir em velocidade diferente.

---

## 1) Dados: o sistema aprende a partir de sinais de comportamento

Um recomendador não começa pelo modelo. Ele começa pela definição dos eventos que representam comportamento.

Em uma plataforma de conteúdo, alguns sinais possíveis seriam:

| Evento | Exemplo de interpretação | Observação |
|---|---|---|
| Impressão | O item foi exibido ao usuário | Não significa interesse; é um sinal de exposição |
| Clique | A pessoa demonstrou curiosidade | Pode representar intenção inicial |
| Início de consumo | O conteúdo foi iniciado | Sinal mais forte que impressão |
| Tempo consumido | Houve permanência no conteúdo | Precisa ser normalizado conforme duração do item |
| Conclusão | A pessoa chegou perto do final | Pode indicar satisfação, mas depende do tipo de conteúdo |
| Like, salvar ou adicionar à lista | Ação explícita | Geralmente é um sinal forte, porém menos frequente |

A tabela de eventos precisa preservar o tempo. Em recomendação, saber **quando** algo aconteceu é tão importante quanto saber **o que** aconteceu. Um item consumido ontem costuma carregar um significado diferente de um item consumido há dois anos.

Um esquema mínimo de interações pode ser assim:

{% highlight text %}
user_id | item_id | event_type | event_ts            | watch_seconds
--------|---------|------------|---------------------|--------------
u_101   | m_801   | play       | 2026-06-20 20:15:00 | 1380
u_101   | s_210   | click      | 2026-06-21 09:02:00 | null
u_205   | d_020   | complete   | 2026-06-21 22:37:00 | 3240
{% endhighlight %}

Além do comportamento, o sistema normalmente precisa de **atributos do catálogo**: gênero, tipo, duração, idioma, data de lançamento, classificação indicativa, disponibilidade e outras informações que ajudem a representar o item.

> *Ponto crítico:* uma **impressão precisa ser registrada**. Sem ela, o sistema confunde "o usuário não se interessou" com "o usuário nunca teve a oportunidade de ver o item".

---

## 2) Geração de candidatos: reduzir milhares de itens a uma lista possível

A etapa de *retrieval* ou geração de candidatos busca responder: *"quais itens merecem ser avaliados com mais cuidado?"*.

Em vez de classificar todo o catálogo, ela traz uma lista menor, por exemplo, algumas centenas de candidatos. Esses candidatos podem vir de várias fontes:

- itens populares para o contexto atual;
- itens semelhantes ao último conteúdo consumido;
- itens de categorias recorrentes no histórico da pessoa;
- vizinhos de usuários com comportamentos parecidos;
- busca vetorial usando embeddings de usuários e itens;
- itens editoriais ou estratégicos, quando aplicável.

É útil combinar fontes diferentes porque elas cobrem necessidades diferentes. Popularidade melhora cobertura para usuários novos; similaridade ajuda em continuidade; modelos comportamentais capturam padrões mais personalizados.

Uma forma simples de pensar é:

{% highlight text %}
candidatos finais =
    populares_contextuais
    + similares_ao_histórico
    + candidatos_personalizados
    + itens_de_exploração
{% endhighlight %}

Depois, os itens duplicados são consolidados e as regras de elegibilidade são aplicadas.

![Visualização de filtragem colaborativa](https://upload.wikimedia.org/wikipedia/commons/b/bc/Collaborative_filtering_network.gif)

> *Exemplo clássico de filtragem colaborativa: usuários são conectados por padrões de avaliação parecidos, e o sistema usa essas conexões para sugerir itens ainda não consumidos. Imagem disponível no [verbete "Recommender system" da Wikipedia](https://en.wikipedia.org/wiki/Recommender_system) (Wikimedia Commons).*

### Exemplo simples de geração de candidatos

Abaixo está um exemplo didático usando dicionários Python. Ele não substitui um motor de busca vetorial nem um modelo de produção; serve para visualizar a composição de fontes de candidatos.

{% highlight python %}
from collections import Counter

popular_by_genre = {
    "drama": ["m_101", "m_102", "m_103"],
    "comedy": ["m_201", "m_202", "m_203"],
    "documentary": ["m_301", "m_302"]
}

similar_items = {
    "m_900": ["m_101", "m_104", "m_305"],
    "m_901": ["m_201", "m_204", "m_102"]
}

user_profile = {
    "recent_items": ["m_900", "m_901"],
    "preferred_genres": ["drama", "comedy"],
    "consumed_items": {"m_900", "m_901", "m_102"}
}

candidates = []

for genre in user_profile["preferred_genres"]:
    candidates.extend(popular_by_genre.get(genre, []))

for item_id in user_profile["recent_items"]:
    candidates.extend(similar_items.get(item_id, []))

candidate_counts = Counter(candidates)

eligible_candidates = [
    item_id
    for item_id in candidate_counts
    if item_id not in user_profile["consumed_items"]
]

print(eligible_candidates)
{% endhighlight %}

Mesmo nesse exemplo simples, dois cuidados aparecem:

- O histórico de consumo é usado para filtrar repetição indesejada.
- Itens que chegam por mais de uma fonte podem receber maior prioridade inicial, pois possuem evidência de relevância por caminhos diferentes.

---

## 3) Elegibilidade: relevância não substitui regras de produto

Um candidato pode ser relevante e, ainda assim, não poder ser exibido.

A camada de elegibilidade centraliza critérios que não deveriam ficar escondidos dentro do modelo. Alguns exemplos genéricos:

- item não está disponível para o contexto atual;
- item já foi consumido recentemente;
- classificação indicativa incompatível com o perfil;
- item não está ativo no catálogo;
- item está duplicado em relação a outro candidato;
- item precisa respeitar uma janela de negócio ou editorial.

Essa separação é saudável porque torna as decisões **auditáveis**. O modelo aprende padrões estatísticos; a camada de regras protege condições explícitas de produto e operação.

---

## 4) Ranking: estimar o valor de cada candidato

Depois de reduzir o catálogo a uma lista elegível, entra o modelo de ranking. Ele recebe pares de usuário e item, mais o contexto, e produz um score.

Esse score pode estimar uma probabilidade, um valor esperado ou uma combinação de objetivos. Por exemplo:

{% highlight text %}
score(usuario, item, contexto) =
    relevância comportamental
    + afinidade de conteúdo
    + recência
    + contexto de sessão
    + sinais de popularidade
{% endhighlight %}

Na prática, as features podem incluir:

- afinidade entre gêneros preferidos e gênero do item;
- similaridade entre embeddings;
- recência das últimas interações;
- posição do item na jornada do usuário;
- duração do conteúdo;
- tendência recente do item;
- dispositivo, horário ou tipo de superfície.

O detalhe central é que o score **não deve ser interpretado automaticamente como "qualidade absoluta"**. Ele é uma estimativa produzida a partir de dados históricos e de uma função objetivo definida. Um item com score alto pode ser muito parecido com outros itens já selecionados. É aí que o reranking se torna necessário.

---

## 5) Reranking: montar uma boa lista, não apenas escolher os melhores scores

Se ordenarmos os candidatos apenas pelo score do ranking, a lista pode ficar monotônica:

{% highlight text %}
1. Drama policial A
2. Drama policial B
3. Drama policial C
4. Drama policial D
5. Drama policial E
{% endhighlight %}

Mesmo que todos tenham alta relevância individual, essa experiência pode limitar descoberta, cobertura e sensação de variedade.

O reranker atua sobre a lista já pontuada. Ele tenta formar um conjunto que mantenha relevância, mas incorpore outras propriedades desejáveis, como **diversidade, novidade e controle de repetição**.

Uma função conceitual pode ser representada assim:

{% highlight text %}
valor_final =
    peso_relevância      * score_do_modelo
    + peso_novidade      * novidade
    + peso_diversidade   * ganho_de_diversidade
    - peso_repetição     * similaridade_com_itens_já_selecionados
{% endhighlight %}

### Exemplo didático de reranking guloso

{% highlight python %}
candidates = [
    {"item_id": "m_101", "genre": "drama",       "score": 0.94},
    {"item_id": "m_102", "genre": "drama",       "score": 0.91},
    {"item_id": "m_201", "genre": "comedy",      "score": 0.87},
    {"item_id": "m_301", "genre": "documentary", "score": 0.82},
    {"item_id": "m_103", "genre": "drama",       "score": 0.80},
]

selected = []
selected_genres = set()

while candidates and len(selected) < 4:
    def adjusted_score(candidate):
        diversity_bonus = 0.08 if candidate["genre"] not in selected_genres else 0.0
        return candidate["score"] + diversity_bonus

    best = max(candidates, key=adjusted_score)
    selected.append(best)
    selected_genres.add(best["genre"])
    candidates.remove(best)

for position, item in enumerate(selected, start=1):
    print(position, item["item_id"], item["genre"], item["score"])
{% endhighlight %}

O algoritmo é propositalmente simples. Em soluções reais, o reranking pode usar otimização com restrições, aprendizado multiobjetivo, políticas de exploração ou regras específicas por superfície. Ainda assim, a ideia permanece: **a qualidade de uma lista não é apenas a soma das qualidades individuais de seus itens**.

---

## 6) Logging: o sistema precisa lembrar o que mostrou

O ciclo de aprendizado de um recomendador depende de registros confiáveis.

Para cada recomendação exibida, é recomendável registrar ao menos:

{% highlight text %}
request_id
user_id
surface
model_version
candidate_source
item_id
position
score
exposure_ts
{% endhighlight %}

Quando uma pessoa interage com um item, esse evento deve poder ser associado à exposição que o originou. Isso permite responder perguntas importantes:

- O item foi clicado porque estava em posição alta ou porque era realmente relevante?
- Uma nova versão do modelo aumentou consumo sem reduzir diversidade?
- Quais fontes de candidatos contribuem mais para cada tipo de usuário?
- O modelo está concentrando exposição em poucos itens?

Sem logging, o sistema perde rastreabilidade. E sem rastreabilidade, não existe avaliação confiável.

---

## 7) Avaliação: offline, online e monitoramento

Avaliar recomendação exige mais de uma perspectiva.

### Avaliação offline

Usa histórico de interações para simular se o sistema teria recuperado ou priorizado itens que uma pessoa consumiu depois. Métricas comuns incluem Precision@K, Recall@K, NDCG@K, MRR e cobertura de catálogo.

A avaliação offline é útil para comparar versões rapidamente, mas possui limitações: ela observa apenas comportamentos que já aconteceram e pode reproduzir vieses de exposição do sistema anterior.

### Avaliação online

Compara experiências reais, normalmente por experimentos controlados. Aqui é possível avaliar métricas de produto, como consumo, retorno, satisfação ou continuidade de uso, sempre com métricas de proteção para evitar ganhos locais que prejudiquem a experiência geral.

### Monitoramento contínuo

Mesmo depois de aprovado, o sistema deve ser observado. Alguns sinais úteis:

- atraso ou ausência de dados;
- mudança no volume de eventos;
- queda de cobertura de candidatos;
- aumento excessivo de repetição;
- concentração de exposição em poucos itens;
- mudança no perfil de usuários ou catálogo;
- degradação de métricas de negócio e de qualidade.

Um modelo em produção não é uma entrega final. É parte de um ciclo contínuo de dados, decisão, feedback e melhoria.

---

## MÃO NA MASSA

Vamos resumir o fluxo de uma requisição de recomendação para a StreamBox fictícia:

{% highlight text %}
1. Receber a requisição: usuário, superfície e contexto.
2. Buscar histórico, perfil e restrições aplicáveis.
3. Gerar candidatos de múltiplas fontes.
4. Remover itens inelegíveis e duplicados.
5. Calcular scores do modelo de ranking.
6. Reranquear para equilibrar relevância e variedade.
7. Retornar os itens com posição e metadados necessários à interface.
8. Registrar a exposição para fechamento do ciclo de feedback.
{% endhighlight %}

Uma implementação inicial pode seguir este pseudocódigo:

{% highlight python %}
def recommend(user_id, context, limit=20):
    user_features = get_user_features(user_id)

    candidates = generate_candidates(
        user_features=user_features,
        context=context,
        sources=["popular", "similar", "personalized"],
    )

    eligible = apply_eligibility_rules(
        candidates=candidates,
        user_id=user_id,
        context=context,
    )

    scored = rank_candidates(
        user_features=user_features,
        candidates=eligible,
        context=context,
    )

    final_list = rerank(
        candidates=scored,
        objectives={
            "relevance": 1.0,
            "diversity": 0.2,
            "novelty": 0.1,
            "repetition_penalty": 0.3,
        },
        limit=limit,
    )

    log_exposure(
        user_id=user_id,
        context=context,
        items=final_list,
        model_version="baseline-v1",
    )

    return final_list
{% endhighlight %}

O código mostra um princípio importante: **cada etapa possui uma responsabilidade explícita**. Isso facilita testes, auditoria, substituição de componentes e evolução gradual do sistema.

---

## Uma arquitetura mínima para começar

Não é necessário iniciar com embeddings, deep learning ou infraestrutura complexa. Uma primeira versão segura pode ter:

- ranking por popularidade segmentada;
- filtros de itens já consumidos e indisponíveis;
- regras simples de diversidade por categoria;
- logging consistente de exposição e interação;
- avaliação offline com split temporal;
- painel básico de cobertura, repetição e consumo.

Com essa base, a evolução pode acontecer de forma incremental:

{% highlight text %}
popularidade segmentada
        -> similaridade baseada em conteúdo
        -> collaborative filtering
        -> embeddings e retrieval vetorial
        -> ranking supervisionado
        -> reranking multiobjetivo
{% endhighlight %}

A maturidade vem menos de "usar o modelo mais avançado" e mais de saber exatamente por que cada componente existe, como ele é medido e quais limitações ele possui.

---

## Conclusão

Um modelo é apenas uma peça dentro de um sistema de recomendação.

Para entregar recomendações confiáveis, é preciso pensar em dados, elegibilidade, geração de candidatos, ranking, diversidade, logging, avaliação e monitoramento. Essa visão evita dois erros comuns: tratar recomendação como uma tarefa isolada de classificação e acreditar que um ganho de métrica offline é suficiente para provar valor em produto.

O primeiro passo prático não é escolher um algoritmo. É **definir o objetivo, registrar bem as exposições e criar uma linha de base que possa ser medida com honestidade**.

Nos próximos artigos, pretendo detalhar as três camadas centrais dessa arquitetura: *retrieval*, *ranking* e *reranking*.

---

## Referências

- Covington, Paul; Adams, Jay; Sargin, Emre. *Deep Neural Networks for YouTube Recommendations*. RecSys, 2016. [ACM Digital Library](https://dl.acm.org/doi/10.1145/2959100.2959190)
- Ricci, Francesco; Rokach, Lior; Shapira, Bracha (eds.). *Recommender Systems Handbook*. Springer, 2022. [Springer](https://link.springer.com/book/10.1007/978-1-0716-2197-4)
- Manning, Christopher; Raghavan, Prabhakar; Schütze, Hinrich. *Introduction to Information Retrieval*. Cambridge University Press, 2008. [Stanford NLP](https://nlp.stanford.edu/IR-book/)
- TensorFlow Recommenders. *Retrieval, ranking and recommendation workflows*. [tensorflow.org/recommenders](https://www.tensorflow.org/recommenders)
- Wikipedia. *Recommender system*. [en.wikipedia.org/wiki/Recommender_system](https://en.wikipedia.org/wiki/Recommender_system)
- Google Developers. *Recommendation Systems Crash Course*. [developers.google.com](https://developers.google.com/machine-learning/recommendation)

### Créditos das imagens

- Imagem de abertura: *Sistema de recomanació* por usuário A1606e, Wikimedia Commons, licença [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). [Página original](https://commons.wikimedia.org/wiki/File:Sistema_de_recomanaci%C3%B3.jpg).
- Animação de filtragem colaborativa: arquivo *Collaborative_filtering_network.gif*, disponível no verbete [Recommender system](https://en.wikipedia.org/wiki/Recommender_system) da Wikipedia (Wikimedia Commons).
