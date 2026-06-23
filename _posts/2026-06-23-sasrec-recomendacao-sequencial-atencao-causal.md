---
layout: post
title: "SASRec além do Transformer: dados temporais, leakage e trade-offs"
featured-img: sasrec_attention_unsplash
categories: [Sistemas de Recomendação, Deep Learning, Machine Learning, MLOps]
---

# SASRec além do Transformer

Nos artigos anteriores, apresentei [a arquitetura de um sistema de recomendação]({% post_url 2026-06-22-Sistemas-de-Recomendacao-Introducao %}) e depois discuti os contratos entre [retrieval, ranking e reranking]({% post_url 2026-06-23-retrieval-ranking-reranking-revisado %}). Este artigo entra em uma decisão mais específica:

> quando a sequência recente de interações tem sinal suficiente para justificar um modelo como SASRec?

SASRec, sigla para *Self-Attentive Sequential Recommendation*, foi proposto por Wang-Cheng Kang e Julian McAuley em 2018. O modelo usa self-attention para representar uma sequência de itens e prever o próximo item provável.

A parte importante não é "usar atenção". A parte importante é **manter o tempo honesto**.

Neste texto, "causal" significa máscara autoregressiva: o estado em uma posição só pode usar informações disponíveis até aquele ponto da sequência. Não estou falando de inferência causal no sentido estatístico.

---

## 1) A hipótese: quando a ordem importa

SASRec faz sentido quando a próxima recomendação depende mais da intenção recente do que da preferência média do usuário.

Exemplo fictício:

{% highlight text %}
u_001: aula_de_algebra -> aula_de_derivadas -> aula_de_integrais -> ?
u_002: review_celular -> comparativo_camera -> oferta_smartphone -> ?
{% endhighlight %}

Em uma recomendação estática, o sistema pergunta: "quais itens combinam com este usuário em geral?". Em uma recomendação sequencial, a pergunta muda:

{% highlight text %}
P(proximo_item | itens anteriores em ordem temporal)
{% endhighlight %}

Essa mudança afeta o desenho inteiro do experimento.

| Abordagem | Pergunta principal | Risco se usada fora de contexto |
|---|---|---|
| Popularidade | O que funciona bem para muitos usuários agora? | Ignorar intenção individual |
| Perfil estático | O que combina com o histórico agregado? | Diluir mudanças recentes de interesse |
| Item-item | O que costuma aparecer perto do último item? | Capturar só transições curtas |
| SASRec | O que faz sentido depois desta sequência? | Criar complexidade sem ganho real |

SASRec é hipótese, não garantia. Antes de adotá-lo, vale comparar com baselines simples e responder: existe evidência de que a ordem recente melhora a decisão?

---

## 2) Arquitetura e atenção causal

A entrada básica do SASRec é uma janela com os últimos `L` itens da sequência. Se o histórico for maior que `L`, usa-se o trecho mais recente. Se for menor, é necessário aplicar padding.

Para reduzir ambiguidades de implementação, vou usar **right padding** nos exemplos:

{% highlight text %}
historico real:
i_12 -> i_87 -> i_31 -> i_44 -> i_90 -> i_18 -> i_77

janela com L = 5:
i_31 -> i_44 -> i_90 -> i_18 -> i_77

sequencia curta:
i_12 -> i_87 -> i_31 -> [PAD] -> [PAD]
{% endhighlight %}

Cada posição combina identidade do item e ordem temporal:

{% highlight text %}
entrada_t = embedding_do_item_t + embedding_posicional_t
{% endhighlight %}

Sem posição, `i_12 -> i_87 -> i_31` ficaria muito parecida com `i_31 -> i_87 -> i_12`, embora as duas sequências possam representar intenções diferentes.

![Arquitetura simplificada do SASRec]({{ '/assets/img/posts/sasrec_architecture.svg' | relative_url }})

*Diagrama autoral baseado no artigo de Kang e McAuley (2018), no repositório original SASRec e na documentação RecBole.*

O ponto crítico é a máscara causal. No treino sequencial, o estado após observar itens até `t` deve prever o item `t+1`. Por isso, a diagonal da atenção só é segura quando o alvo está deslocado para o próximo item. Se o alvo fosse o próprio item da posição `t`, permitir a diagonal seria vazamento.

Uma leitura simplificada da máscara:

{% highlight text %}
chave ->         1   2   3   4
consulta 1       ok  x   x   x
consulta 2       ok  ok  x   x
consulta 3       ok  ok  ok  x
consulta 4       ok  ok  ok  ok
{% endhighlight %}

Na inferência, normalmente usamos a última posição válida para representar o estado atual da sequência:

{% highlight text %}
score(j) = h_t . e_j
{% endhighlight %}

Onde `h_t` é o estado sequencial atual e `e_j` é o embedding do item candidato. No treino, porém, o usual é aproveitar vários prefixos válidos da sequência: cada posição com alvo disponível contribui para a loss, e posições de padding precisam ser mascaradas.

---

## 3) Dados temporais: o contrato vem antes do modelo

O modelo recebe sequências, mas sequências são produto de decisões de dados.

Uma tabela mínima de eventos pode seguir este contrato:

{% highlight text %}
event_id | user_id | item_id | event_ts            | event_type | strength
---------|---------|---------|---------------------|------------|---------
e_001    | u_001   | i_120   | 2026-01-03 18:22:11 | play       | 1.0
e_002    | u_001   | i_931   | 2026-01-03 19:10:02 | play       | 1.0
e_003    | u_001   | i_401   | 2026-01-04 20:05:18 | complete   | 1.0
{% endhighlight %}

Decisões que precisam ficar explícitas:

| Decisão | Por que muda o experimento |
|---|---|
| Evento usado como interação | Clique, rating, compra e consumo significativo não medem a mesma coisa |
| Tratamento de repetição | Repetir item pode indicar hábito, erro de logging ou continuidade |
| Tamanho `L` | Contexto curto favorece recência; contexto longo aumenta custo e ruído |
| Empate de timestamp | Ordenar por `item_id` inventa transições; prefira `event_id` ou ordem do log |
| Vocabulário de itens | Item fora do vocabulário não recebe score em um SASRec baseado só em ID |
| Disponibilidade histórica | Catálogo atual não representa necessariamente o catálogo disponível no passado |

Para dados públicos, a definição do evento também precisa ser honesta. MovieLens registra ratings com timestamp; Amazon Reviews registra reviews com timestamp. Esses datasets são úteis para estudo, mas não são o mesmo que uma trilha completa de consumo, impressão e exposição.

---

## 4) Split temporal e leakage

Em dados sequenciais, embaralhar interações aleatoriamente entre treino e teste costuma quebrar a causalidade temporal.

Uma estratégia simples é *leave-one-out* por usuário:

{% highlight text %}
sequencia:
i_12 -> i_87 -> i_31 -> i_44 -> i_90

treino:
i_12 -> i_87 -> i_31

validacao:
contexto = i_12 -> i_87 -> i_31
target   = i_44

teste:
contexto = i_12 -> i_87 -> i_31 -> i_44
target   = i_90
{% endhighlight %}

Esse protocolo é aceitável quando a validação é usada apenas para escolher hiperparâmetros. Depois disso, é preciso documentar se o modelo final foi retreinado com treino + validação antes do teste ou se a validação entrou apenas como histórico disponível para formar o contexto.

Em cenários mais próximos de produto, um corte global por data costuma ser mais realista:

{% highlight text %}
treino:    eventos ate 2026-03-31
validacao: eventos de 2026-04-01 a 2026-04-15
teste:     eventos de 2026-04-16 a 2026-04-30
{% endhighlight %}

Regras mínimas contra leakage:

- popularidade, features agregadas e normalizações devem usar apenas dados disponíveis até o ponto de previsão;
- itens que só aparecem no futuro não devem entrar silenciosamente no vocabulário de treino;
- targets fora do vocabulário precisam ser filtrados e reportados como perda de cobertura, ou avaliados em um protocolo específico de cold start;
- catálogo e disponibilidade precisam ser versionados quando influenciam elegibilidade;
- a política de negativos não pode usar rótulos de validação ou teste.

---

## 5) Negativos e avaliação

Em feedback implícito, ausência de interação não significa rejeição. O usuário pode simplesmente nunca ter visto aquele item. Mesmo assim, o treino precisa contrastar o positivo com alternativas.

{% highlight text %}
contexto:
i_12 -> i_87 -> i_31

positivo:
i_44

negativos amostrados:
i_205, i_770, i_881
{% endhighlight %}

| Tipo de negativo | Benefício | Risco |
|---|---|---|
| Uniforme aleatório | Simples e barato | Pode ser fácil demais |
| Popular | Comparação mais difícil | Pode reforçar viés de exposição |
| Mesma categoria | Discriminação mais fina | Pode penalizar substitutos razoáveis |
| Exposto e não consumido | Mais próximo do produto | Exige logging de exposição confiável |
| In-batch | Eficiente no treino | Depende da composição do batch |

O universo de amostragem precisa ser documentado: catálogo elegível no tempo `t`, exclusão de positivos conhecidos conforme o protocolo, tratamento de itens já consumidos e seed de reprodução.

Na avaliação, a distinção mais importante é esta:

| Avaliação | Interpretação |
|---|---|
| Full-catalog ranking | Mais próxima de ranquear contra todos os itens elegíveis, mas mais cara |
| Negativos amostrados | Mais barata, útil para comparação controlada, mas tende a inflar métricas |
| Candidatos reais do retrieval | Mede o componente dentro do funil de produção, não o modelo isolado |

Use HitRate@K, NDCG@K e MRR, mas não interprete esses números sem baselines e segmentos. Métrica com 100 negativos amostrados não é comparável com métrica contra catálogo completo.

Baselines mínimos:

| Baseline | O que testa |
|---|---|
| Popularidade global | Piso de comparação |
| Popularidade por janela temporal | Sazonalidade e contexto simples |
| Último item / coocorrência | Transições locais |
| Matrix Factorization | Preferência não sequencial |
| SASRec | Ganho específico de ordem e atenção |

Se SASRec melhora apenas em usuários com histórico longo, isso já é uma conclusão. Se perde para item-item em sessões curtas, também.

---

## 6) O contrato mínimo da implementação

O código abaixo não é uma implementação completa. Ele serve para mostrar o contrato que não pode quebrar: embeddings, posição, padding, máscara causal e saída por posição.

{% highlight python %}
import torch
import torch.nn as nn


class SASRecCore(nn.Module):
    def __init__(self, num_items, max_len, dim=64, heads=2, layers=2):
        super().__init__()
        self.item_embedding = nn.Embedding(num_items + 1, dim, padding_idx=0)
        self.position_embedding = nn.Embedding(max_len, dim)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=dim,
            nhead=heads,
            dim_feedforward=dim * 4,
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=layers)

    def forward(self, item_sequence):
        batch_size, seq_len = item_sequence.shape
        positions = torch.arange(seq_len, device=item_sequence.device)
        positions = positions.unsqueeze(0).expand(batch_size, seq_len)

        x = self.item_embedding(item_sequence) + self.position_embedding(positions)
        padding_mask = item_sequence.eq(0)
        causal_mask = torch.triu(
            torch.ones(seq_len, seq_len, device=item_sequence.device, dtype=torch.bool),
            diagonal=1,
        )

        return self.encoder(
            x,
            mask=causal_mask,
            src_key_padding_mask=padding_mask,
        )
{% endhighlight %}

O que ainda precisa existir fora desse núcleo:

- targets deslocados: entrada até `t`, alvo em `t+1`;
- loss mascarada para posições de padding e posições sem alvo;
- teste unitário com sequência curta e padding;
- política de negativos;
- avaliação top-K;
- versionamento de vocabulário;
- filtros de elegibilidade antes de expor recomendação.

Se você usar left padding, valide com cuidado a combinação entre máscara causal e máscara de padding. Algumas combinações podem deixar queries de padding sem chave válida e gerar comportamento numérico indesejado.

---

## 7) Onde SASRec entra em uma arquitetura real

Uma escolha prática é usar SASRec como **gerador de candidatos sequenciais**. Ele não decide a lista final; ele traz candidatos que parecem coerentes com o estado recente do usuário.

Um contrato possível:

{% highlight text %}
event stream / historico recente
        |
        v
sequencia online do usuario
        |
        v
SASRec: estado h_t
        |
        v
top-N por embeddings de itens ou indice ANN
        |
        v
elegibilidade de catalogo
        |
        v
ranking com contexto, features e objetivos de produto
        |
        v
reranking: diversidade, regras, limites e composicao final
{% endhighlight %}

Essa decisão deixa responsabilidades mais claras:

| Camada | Responsabilidade |
|---|---|
| SASRec retrieval | Capturar intenção sequencial recente |
| Elegibilidade | Remover itens indisponíveis, bloqueados ou incompatíveis |
| Ranking | Estimar valor individual com features mais ricas |
| Reranking | Compor a lista final com diversidade, deduplicação e restrições |
| Monitoramento | Medir qualidade, cobertura, latência, fallback e drift |

Em catálogo grande, pontuar tudo online pode ser caro. Alternativas comuns:

- pré-computar embeddings de itens;
- usar ANN para recuperar candidatos;
- cachear o estado sequencial do usuário ou da sessão;
- limitar `L` por latência e memória;
- aplicar fallback para usuário novo, sessão vazia ou histórico indisponível;
- combinar SASRec com popularidade contextual e candidatos de conteúdo.

Métricas operacionais importam junto com métricas offline: latência p95/p99, taxa de fallback, cobertura de catálogo, repetição, diversidade, itens inelegíveis retornados, distribuição de scores e queda por segmento.

---

## 8) Bibliotecas Python que facilitam a implementação

Implementar SASRec do zero é útil para estudar, mas não deveria ser a primeira opção para comparar modelos com rigor. Bibliotecas maduras reduzem erro de boilerplate e ajudam a focar no protocolo experimental.

| Biblioteca | Quando usar | Observação |
|---|---|---|
| [RecTools](https://github.com/MTSWebServices/RecTools) | Experimentos em Python com interface `fit` / `recommend` | Inclui `SASRecModel`, modelos sequenciais e baselines como Popular, ALS e ItemKNN |
| [RecBole](https://recbole.io/docs/user_guide/model/sequential/sasrec.html) | Benchmark acadêmico reproduzível | Possui SASRec, BERT4Rec, GRU4Rec e configuração padronizada de treino/avaliação |
| [KerasRS](https://keras.io/keras_rs/examples/sas_rec/) | Stack Keras/JAX/TensorFlow | Traz exemplo de sequential retrieval com SASRec usando MovieLens |
| [Transformers4Rec](https://nvidia-merlin.github.io/Transformers4Rec/stable/README.html) | Pipelines sequenciais com features tabulares e serving mais pesado | Integra componentes do ecossistema NVIDIA Merlin e suporta recomendação session-based |
| [implicit](https://benfred.github.io/implicit/) | Baselines fortes para feedback implícito | Não é SASRec, mas ajuda a comparar contra ALS, BPR e item-item |

O critério não deveria ser "qual biblioteca tem o modelo mais moderno?". O critério deveria ser: qual biblioteca facilita reproduzir dados, split, negativos, métricas, baselines e integração com o pipeline que você quer testar?

---

## 9) Limites práticos

SASRec não resolve sozinho os problemas de recomendação.

**Cold start de itens:** se o modelo usa apenas IDs, itens novos têm pouco ou nenhum sinal. Metadados, embeddings de conteúdo e exploração continuam necessários.

**Cold start de usuários:** sessões vazias ou usuários novos precisam de fallback: popularidade contextual, onboarding, conteúdo recente, exploração ou regras de superfície.

**Custo de sequência longa:** a atenção tem custo e memória quadráticos em `L`. O bloco completo também inclui projeções e feed-forward com termos dependentes de `L` e `d`.

**Feedback loop:** recomendações geram exposição; exposição gera interação; interação vira treino. Sem logging de impressão, exploração e análise por segmento, o sistema pode reforçar popularidade e estreitar catálogo.

**Próximo item não é satisfação:** prever a próxima interação não garante diversidade, retenção ou valor de longo prazo. Em produção, o score sequencial precisa conviver com objetivos de produto e restrições explícitas.

---

## 10) Um experimento público bem definido

Um projeto complementar para este artigo poderia se chamar `sasrec-sequential-recommendation-lab`.

Escopo recomendado:

{% highlight text %}
Pergunta:
quando a sequencia recente melhora next-item prediction?

Dataset:
MovieLens 1M ou Amazon Reviews, declarando que o evento modelado é rating/review.

Protocolos:
1. split temporal reproduzivel
2. popularidade global e temporal
3. item-item / coocorrencia
4. matrix factorization
5. SASRec variando L, dimensao, heads e negativos

Metricas:
HitRate@10, NDCG@10, MRR, cobertura e latencia
{% endhighlight %}

Checklist mínimo:

- eventos ordenados por timestamp e desempate confiável;
- vocabulário congelado por período de treino;
- targets OOV filtrados e reportados;
- avaliação full-catalog ou sampled-negative declarada;
- negativos de treino documentados;
- padding e loss mascarados;
- baselines simples implementados;
- análise por tamanho de histórico, item recorrente/novo e densidade de sequência;
- nenhuma métrica inventada ou extrapolada.

O objetivo não é provar que SASRec sempre vence. Um bom resultado de portfólio também pode mostrar onde ele perde.

---

## Leitura relacionada

- [O que transforma um modelo em um sistema de recomendação?]({% post_url 2026-06-22-Sistemas-de-Recomendacao-Introducao %})
- [Retrieval, Ranking e Reranking: contratos e trade-offs entre camadas]({% post_url 2026-06-23-retrieval-ranking-reranking-revisado %})
- [Análise de crimes em Swindon usando Regras de Associação, R e Spark]({% post_url 2020-05-14-Regras de Associação %})

---

## Conclusão

SASRec é útil quando a ordem recente carrega sinal real para a próxima recomendação. O ganho não vem apenas da atenção; vem de tratar tempo, padding, negativos, split, vocabulário e avaliação como contratos técnicos.

Se esses contratos forem frágeis, o modelo aprende um problema que não existe em produção. Se forem bem definidos, SASRec vira uma forma objetiva de testar se a dinâmica sequencial merece entrar na arquitetura de recomendação.

---

## Referências

- Wang-Cheng Kang e Julian McAuley. [Self-Attentive Sequential Recommendation](https://arxiv.org/abs/1808.09781). ICDM, 2018.
- Implementação original dos autores: [kang205/SASRec](https://github.com/kang205/SASRec).
- RecTools. [Repositório do projeto](https://github.com/MTSWebServices/RecTools).
- RecBole. [Documentação do modelo SASRec](https://recbole.io/docs/user_guide/model/sequential/sasrec.html).
- Keras. [Exemplo de sequential retrieval com SASRec](https://keras.io/keras_rs/examples/sas_rec/).
- NVIDIA Merlin. [Transformers4Rec](https://nvidia-merlin.github.io/Transformers4Rec/stable/README.html).
- Implicit. [Fast Python Collaborative Filtering for Implicit Datasets](https://benfred.github.io/implicit/).
- Ashish Vaswani et al. [Attention Is All You Need](https://arxiv.org/abs/1706.03762). NeurIPS, 2017.
- Foto de capa por [Chris Ried](https://unsplash.com/@cdr6934), via [Unsplash](https://unsplash.com/s/photos/source-code). Uso conforme a [licença Unsplash](https://unsplash.com/license).
- Diagrama de arquitetura criado para este artigo, baseado nas referências técnicas acima.

---

## O que foi melhorado

- O artigo foi reposicionado como guia de decisão e avaliação, não como tutorial genérico de Transformer.
- A explicação de máscara causal foi corrigida para diferenciar treino deslocado, inferência e risco de leakage.
- A avaliação passou a distinguir full-catalog, negativos amostrados e candidatos reais do retrieval.
- O papel de SASRec foi definido em uma arquitetura de referência como gerador de candidatos sequenciais.
- Foram adicionadas bibliotecas Python úteis para implementação e comparação: RecTools, RecBole, KerasRS, Transformers4Rec e implicit.
