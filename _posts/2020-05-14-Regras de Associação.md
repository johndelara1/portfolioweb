---
layout: post
title: "REGRAS DE ASSOCIAÇÃO: ANÁLISES SOBRE CRIMES NA INGLATERRA
UTILIZANDO R E CLUSTER SPARK"
featured-img: bandeira_inglaterra
categories: [Machine Learning, Data Analysis, Rstudio, Big Data]
---

# Você já ouviu falar de regras de associação?

> *Tema que iremos abordar neste artigo são a regras de associação, entenda como é possível identificar forte ligação matemática de alguns fenômenos e que podem ajudar a explicar seus acontecimentos.*
> 
> **Então aperte o cinto e vamos nessa!**

---
## Vamos para uma breve apresentação desta fantástica ferramenta já consolidada e difundida:

As **regras de associação** utilizam características que mais se assemelham entre itens para descrever o ***comportamento*** que um item possui em decorrência do outro, esse comportamento é medido de acordo com o número de dados transacionais existentes no banco de dados.


Este algoritmo conhecido por quem comprou, comprou também, ***utiliza como conceito básico o perfil*** como exemplo, clientes que compram os itens semelhantes. 

> Nós teremos o **nível de confiança e suporte** para comprar os itens semelhantes, 
> surgem então sistemas de recomendação de produtos largamente utilizado em websites, redes sociais entre outros. Porém não se restringe apenas a essas aplicações.
>
> Vamos apresentar a utilização de regras de associação para descobrir impactos de crimes na Inglaterra.
>
> Mais precisamente em **Swindow e Wiltshire**, a análise será realizada com o **dataset da polícia da Inglaterra**, desenvolvimento do projeto foi realizado em cima da **linguagem R**, utilizando a **IDE Rstudio.**

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

## ALGORITMO APRIORI

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

