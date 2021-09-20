---
layout: post
title: "Uma forma de começar com Object Detection!"
featured-img: object_detection
categories: [Object Detection, Visão Computacional, Inteligência Artificial, Deep Learning]
---

# Vamos começar entendendo sobre o que vamos aprender antes!

> *Tema que iremos abordar neste artigo é sobre detecção de objetos, entenda como é possível identificar objetos que podem auxiliar na tomada de decisão de uma empresa ou até mesmo auxiliar um carro autônomo.*
> 
> **Então aperte o cinto e vamos nessa!**

---
### Vamos para uma breve apresentação sobre o que vamos apresentar aqui:

Sobre **object detection** vamos utilizar o modelo ***YOLOv4***, a estrutura do ***Darknet***, mas sobre as anotações utilizaremos o tolkit chamado ***OIDv4_ToolKit*** para baixar anotações públicas do ***Google's Open Images Dataset*** .


Este algoritmo possui um base no script ***https://github.com/AlexeyAB/darknet*** Vamos utilizar o Google Colab disponibilizado por ele: ***https://colab.research.google.com/drive/12QusaaRj_lUwCGDvQNfICpa7kA7_a2dE***. 

> Nós teremos o **nível de confiança e suporte** para comprar os itens semelhantes, 
> surgem então sistemas de recomendação de produtos largamente utilizado em websites, redes sociais entre outros. Porém não se restringe apenas a essas aplicações.
>
> Vamos apresentar a utilização de regras de associação para descobrir impactos de crimes na Inglaterra.
>
> Mais precisamente em **Swindow**, a análise será realizada com o **dataset da polícia da Inglaterra**, desenvolvimento do projeto foi realizado em cima da **linguagem R**, utilizando a **IDE Rstudio.**

---

A maioria das empresas atualmente possuem uma grande massa de dados e informações
sendo produzidas diariamente, armazenadas em bancos de dados estruturados e não
estruturados, consumidas por softwares e sistemas de gerenciamento que trazem algumas
ações para auxiliar no **aumento de suas vendas, ações de marketing, promoções** ou até mesmo
informações sobre a **saúde financeira da organização.** 

Quando falamos em dados das empresa, temos a preocupação de colocar em nosso radar os **dados não gerenciaveis** pela organização, 
podendo carregar conhecimentos valiosos e extremamente úteis que **quando cruzados** com outras informações 
**auxiliam na tomada de deciões** dos gestores, investidores ou clientes  envolvidos.

Existem diversas técnicas de regras de associação, destacamos então o algoritmo
**Apriori**, que trabalhar com **análises combinatórias** de diversos atributos, tendo um bom
desempenho de processamento. Outro destaque se formula em cima do algoritmo FP-Growth que foi projetado
baseado-se no funcionamento do apriori.

### ALGORITMO APRIORI E SEU FUNCIONAMENTO 

   O algoritmo foi proposto em 1994, por Agrawal e Srikant, foi o pioneiro, um dos mais
famosos e utilizado em regras de associação levando em consideração a eficácia em encontrar
itemsets frequentes em grandes bancos de dados, **gerando regras fortes de associação.**
Podemos dividir em duas estruturas de funcionamento do Apriori, a **geração do conjunto**
**de itens frequentes e geração das regras**, vez ou outra uma economia de custo computacional.

Uma geração de um conjunto de **k-itemsets candidatos**, após o processo anterior, ele faz
verificação dos candidatos que são mais frequentes através de uma **varredura de toda base de dados**,
ou seja, aqueles que possuem o suporte com valor maior do que o **minSup determinado**, gerando
um conjunto de itens frequentes. Agora com um conjunto de k-itemsets frequentes, com k ≥ 2,
as regras de associação são instituídas, de forma que os itens AB e ABCD sejam frequentes,
como exemplo vamos avaliar a regra:

    AB ⇒ CD

O cálculo da confiança, sendo:

    conf(AB ⇒ CD) = sup(ABCD)/sup(AB)
    
Se valor da confiança for maior ou igual ao **minConf determinado**, a regra é considerada válida.

Consideramos um itemset frequente, caso todos os seus subconjuntos não vazios
também sejam frequentes, então se o itemset que não é frequente, da mesma forma seus
subconjuntos também não são frequentes.
 
Esta regra só é válida de acordo com a propriedade
anti-monotônica do suporte, com garantia de que o suporte de um conjunto frequente nunca
exceda o suporte de seus subconjuntos.

### ALGORITMO FP-GROWTH E SEU FUNCIONAMENTO

Com a evolução dos algoritmos de regras de associação outros algoritmos surgiram
baseando-se no conceito do Apriori, foram encontradas algumas lacunas, como
a execução de muitos acessos ao banco de dados e no tratamento de uma grande quantidade de
conjuntos de itens candidatos, ocasionados por um grande número de itens frequentes ou caso
o valor do minSup seja muito baixo, e **como resolver este problema?**

Em 2000 foi desenvolvido por Han, Pey e Yin, em 2000, o algoritmo **FP-Growth (Frequent Pattern Growth)** 
para suprir essas necessidades. Fazendo uso de estruturas de dados de **árvore** através de prefixos para padrões 
frequentes, usada para extração dos conjuntos de itens constantes na própria estrutura, compactada onde armazena
informações permitindo Data Mining eficaz sem a necessidade de vários acessos a base de dados. 

No primeiro acesso encontra e ordena os itemsets frequentes e no segundo e último
constrói a árvore, chamada de **FP-Tree (Frequent Pattern Tree),** que por sua vez, fica responsável por Compactar
o banco de dados e transformar em uma estrutura geralmente menor em formato de árvore FP-Tree, 
posteriormente o algoritmo realiza a **mineração na árvore** em busca de evitar uma grande geração de conjuntos
de itens candidatos. 

Decomposição em tarefas menores usando o **método particional** é por fim o último processo realizado pelo algoritmo.
Para construção da FP-Tree que acontece após a seleção do valor do **minSup**, com a varredura da base de dados 
e o armazenamento e **ordenação decrescente dos conjuntos de itens frequentes**  encontrados (Araújo, B.; Maciel, 2018).

## MÃO NA MASSA

Para realização deste estudo, vamos analisar as regiões de **Swindon** dentro do condado de Wiltshire que
possuem os índices de criminalidades menos latentes na Inglaterra como descrições abaixo:

> **Swindon é uma cidade do Sudoeste da Inglaterra.Fundada em 1663.Swindon é a maior cidade**
> **do condado de Wiltshire. é o maior pólo industrial do sudoeste da Inglaterra, Sendo a décima maior da**
> **Inglaterra.O seu pólo financeiro é o segundo maior do sudoeste da Inglaterra. A cidade possui uma das**
> **economias mais diversificadas da Inglaterra,com a maior concentração de sedes de empresas, instituições**
> **culturais e a maior comunidade artística do sudoeste da Inglaterra. Em janeiro de 2005, Swindon foi**
> **escolhida pelo governo inglês como uma das capitais culturais da Inglaterra. É uma das cidades mais**
> **seguras da Inglaterra - sua taxa de criminalidade é menor do que qualquer grande cidade inglesa, e a menor**
> **do Sudoeste da Inglaterra (wikipédia).**


> Wiltshire é um condado cerimonial da Inglaterra, situado na parte sudoeste da ilha. Ocupa uma
área de 3 481 km² e seu centro administrativo é localizado em uma região de terras altas, dotada de colinas
(como as de Marlborough), Wiltshire tem como limítrofes ao norte o condado de Gloucestershire, ao sul o
de Dorset, a oeste o de Somerset, a leste o de Berkshire, a nordeste o de Oxfordshire e a sudeste, o de
Hampshire. Sua economia se baseia na agricultura, pecuária e na indústria de tapetes e têxteis. Aí se
encontra o famoso monumento neolítico de Stonehenge, entre outros sítios arqueológicos, por possuírem
índices baixos de criminalidade em Londres. (wikipédia).

##### Foram extraídos datasets do website da polícia do Reino Unido

[Dados da polícia do Reino Unido](https://data.police.uk/data)

![mapa](https://dl.dropbox.com/s/0938ovd3ra8u4fa/mapa.png?dl=0)

Referentes a ocorrências criminais registradas no período de **julho de 2015 a junho de
2018**, com variáveis como: o ***número identificador*** do crime, ***mês de ocorrência*** do crime, ***crime
reportado para polícia***, ***longitude***, ***latitude***, ***localização***, ***tipo de crime***, ***última ação de categoria
do crime***.

![dataSet](https://dl.dropbox.com/s/8ko5co5c209v4kt/dataSet.png?dl=0)

Com os dados de ocorrências de crimes, é possível analisar, preparar e minerar os dados
para encontrar **regras de associação** entre os registros, ou seja, **relacionamentos frequentes** entre
determinados atributos em nosso estudo de caso.

**Data Wrangling (limpeza e manipulação de dados)**, com a base limpa após as análises
sendo realizadas as tratativas de **dados nulos** como exemplo casos de **comportamento anti-social**
precisou ser excluído, por conta do campo última ação de categoria do crime constar como nulo
infelizmente, pode haver vários resultados associados ao Anti Social Behavior, porém não pode
ser inferido que eles não estão resolvidos, anulando a análise para esse tipo de crime.

![qtd_comportamento_anti_social](https://dl.dropbox.com/s/arrfn8idl0s1brx/qtd_comportamento_anti_social.png?dl=0)

![describe](https://dl.dropbox.com/s/bn8g5l7urhyq8lk/describe.png?dl=0)

Após a filtragem dos dados, restaram **8 colunas e 124,185 mil linhas (transações)**, com 
a utilização do algoritmo FP-Growth utilizando a linguagem R, construiu-se um modelo de regras de associação 
especificando um nível de **confiança mínima de 0.7** e de **suporte mínimo de 0.01**, utilizando o framework 
spark, dentro da biblioteca Sparkr.


![mapa_crimes](https://dl.dropbox.com/s/mcyl9lggekvsueh/mapa_crimes.png?dl=0)

