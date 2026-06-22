---
layout: post
title: "Análise de crimes em Swindon usando Regras de Associação, R e Spark"
featured-img: bandeira_inglaterra
categories: [Regras de Associação, Data Analysis, R, Spark]
---

# Você já ouviu falar de regras de associação?

> *O tema deste artigo são regras de associação: uma técnica para encontrar padrões frequentes de coocorrência em bases transacionais ou categóricas. O objetivo é identificar relações úteis para investigação exploratória, sem confundir associação com causalidade.*
> 
> **Então aperte o cinto e vamos nessa!**

---
### Vamos para uma breve apresentação desta fantástica ferramenta já consolidada e difundida:

As **regras de associação** buscam padrões do tipo `A => B`, em que a ocorrência de um conjunto de itens ou atributos aparece frequentemente junto de outro conjunto. Em vez de afirmar que A causa B, a técnica mede a força da coocorrência por métricas como **suporte**, **confiança** e **lift**.


Um exemplo clássico é o "quem comprou este item também comprou aquele". Nesse caso, cada compra é uma transação e cada produto é um item. A mesma ideia pode ser adaptada para outros domínios, desde que as variáveis sejam tratadas de forma categórica e a interpretação respeite os limites da técnica.

> As métricas de **suporte**, **confiança** e **lift** ajudam a filtrar regras frequentes e potencialmente relevantes. Por isso, regras de associação aparecem em sistemas de recomendação, análise de cestas de compra, segmentação exploratória e investigação de padrões em bases categóricas.
>
> Neste estudo, usaremos regras de associação para explorar padrões em registros de crimes no Reino Unido.
>
> Mais precisamente, a análise foca em **Swindon**, com dados públicos da polícia do Reino Unido, usando **R**, **RStudio** e **SparkR**.

---

A maioria das empresas atualmente possuem uma grande massa de dados e informações
sendo produzidas diariamente, armazenadas em bancos de dados estruturados e não
estruturados, consumidas por softwares e sistemas de gerenciamento que trazem algumas
ações para auxiliar no **aumento de suas vendas, ações de marketing, promoções** ou até mesmo
informações sobre a **saúde financeira da organização.** 

Quando falamos em dados das empresas, também vale colocar no radar dados externos que não são gerenciados diretamente pela organização,
podendo carregar conhecimentos valiosos e extremamente úteis que **quando cruzados** com outras informações 
**auxiliam na tomada de decisões** de gestores, investidores ou clientes envolvidos.

Existem diversas técnicas de regras de associação, destacamos então o algoritmo
**Apriori**, que trabalha com **análises combinatórias** de diversos atributos, tendo um bom
desempenho de processamento. Outro destaque se formula em cima do algoritmo FP-Growth que foi projetado
com base nas limitações do Apriori.

### ALGORITMO APRIORI E SEU FUNCIONAMENTO 

   O algoritmo foi proposto em 1994, por Agrawal e Srikant, foi o pioneiro, um dos mais
famosos e utilizado em regras de associação levando em consideração a eficácia em encontrar
itemsets frequentes em grandes bancos de dados, **gerando regras fortes de associação.**
Podemos dividir o funcionamento do Apriori em duas etapas: **geração de itemsets frequentes** e **geração das regras**.

O algoritmo gera **k-itemsets candidatos** e verifica, por varreduras na base, quais deles possuem suporte maior ou igual ao **minSup** definido. A partir dos itemsets frequentes com k ≥ 2, são geradas regras de associação. Como exemplo, podemos avaliar a regra:

    AB ⇒ CD

O cálculo da confiança, sendo:

    conf(AB ⇒ CD) = sup(ABCD)/sup(AB)
    
Se o valor da confiança for maior ou igual ao **minConf** definido, a regra passa no filtro de confiança.

Pela propriedade anti-monotônica do suporte, se um itemset é frequente, todos os seus subconjuntos não vazios também são frequentes. De forma equivalente, se um itemset não é frequente, nenhum de seus superconjuntos pode ser frequente.
 
Essa propriedade reduz o custo computacional porque permite descartar candidatos sem testar todas as combinações possíveis. O suporte de um itemset nunca excede o suporte de seus subconjuntos.

### ALGORITMO FP-GROWTH E SEU FUNCIONAMENTO

Com a evolução dos algoritmos de regras de associação outros algoritmos surgiram
baseando-se no conceito do Apriori, foram encontradas algumas lacunas, como
a execução de muitos acessos ao banco de dados e no tratamento de uma grande quantidade de
conjuntos de itens candidatos, ocasionados por um grande número de itens frequentes ou caso
o valor do minSup seja muito baixo, e **como resolver este problema?**

Em 2000, Han, Pei e Yin propuseram o algoritmo **FP-Growth (Frequent Pattern Growth)** para reduzir essas limitações. Ele usa uma estrutura de **árvore** baseada em prefixos, a FP-Tree, para compactar padrões frequentes e minerá-los sem gerar explicitamente todos os candidatos como no Apriori.

No primeiro acesso, o algoritmo calcula as frequências dos itens. No segundo, constrói a **FP-Tree (Frequent Pattern Tree)**, que compacta a base em uma estrutura geralmente menor. Depois, a mineração é feita diretamente nessa árvore.

A construção da FP-Tree acontece após a escolha do **minSup**, com a varredura da base, seleção dos itens frequentes e ordenação decrescente por frequência (Araújo, B.; Maciel, 2018).

## MÃO NA MASSA

Para este estudo, vamos analisar registros de ocorrências em **Swindon**, cidade localizada no condado de **Wiltshire**, no sudoeste da Inglaterra. O recorte geográfico é importante porque padrões encontrados em uma localidade não devem ser generalizados automaticamente para todo o país.

O objetivo não é afirmar que determinada ocorrência causa outra, nem medir criminalidade relativa entre cidades. O objetivo é explorar combinações frequentes entre atributos dos registros, como mês, localização, tipo de crime e desfecho registrado.

##### Foram extraídos datasets do website da polícia do Reino Unido

[Dados da polícia do Reino Unido](https://data.police.uk/data)

![mapa](https://dl.dropbox.com/s/0938ovd3ra8u4fa/mapa.png?dl=0)

Referentes a ocorrências criminais registradas no período de **julho de 2015 a junho de
2018**, com variáveis como: o ***número identificador*** do crime, ***mês de ocorrência*** do crime, ***crime
reportado para polícia***, ***longitude***, ***latitude***, ***localização***, ***tipo de crime***, ***última ação de categoria
do crime***.

![dataSet](https://dl.dropbox.com/s/8ko5co5c209v4kt/dataSet.png?dl=0)

Com os dados de ocorrências de crimes, é possível analisar, preparar e minerar os registros
para encontrar **regras de associação**, ou seja, **combinações frequentes** entre determinados atributos no estudo de caso.

Na etapa de **Data Wrangling (limpeza e manipulação de dados)**, tratei valores nulos e inconsistências. Os casos de **comportamento anti-social** foram removidos da modelagem porque o campo de última ação da categoria aparece nulo nesse tipo de registro. Essa decisão evita criar regras com um desfecho ausente, mas também reduz o escopo da análise e deve ser documentada como limitação.

![qtd_comportamento_anti_social](https://dl.dropbox.com/s/arrfn8idl0s1brx/qtd_comportamento_anti_social.png?dl=0)

![describe](https://dl.dropbox.com/s/bn8g5l7urhyq8lk/describe.png?dl=0)

Após a filtragem dos dados, restaram **8 colunas e 124.185 linhas (transações)**. Com o algoritmo FP-Growth em R, foi construído um modelo de regras de associação com **confiança mínima de 0,7** e **suporte mínimo de 0,01**, usando Spark por meio da biblioteca **SparkR**. Para interpretar as regras, também é recomendável observar o **lift**, pois confiança alta pode ocorrer apenas porque o consequente é muito frequente na base.


![mapa_crimes](https://dl.dropbox.com/s/mcyl9lggekvsueh/mapa_crimes.png?dl=0)
