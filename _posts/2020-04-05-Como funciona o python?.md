---
layout: post
title: "COMO FUNCIONA A LINGUAGEM PYTHON?"
featured-img: python
categories: [Regras de Assiciação, Data Analysis, Rstudio]
---

> O código fonte de uma linguagem de programação pode ser executado
> usando um intérprete ou um **compilador**. Em uma linguagem compilada,
> um compilador converterá o código-fonte diretamente em código de
> máquina binário. Esse código de máquina é específico para essa
> máquina de destino, pois cada máquina pode ter um sistema operacional
> e hardware diferentes. Após a compilação, a máquina de destino executará
> diretamente o código da máquina.
>
> Em uma linguagem interpretada, o código fonte não é executado diretamente
> pela máquina de destino. Há outro programa chamado intérprete que lê e executa
> o código-fonte diretamente. O intérprete, específico da máquina de destino,
> converte cada instrução do código-fonte em código de máquina e a executa.
> 

O Python é geralmente chamado de linguagem interpretada, no entanto, 
combina compilação e interpretação. Quando executamos um 
código fonte (um arquivo com uma .pyextensão), o Python primeiro o compila 
em um **bytecode**. O bytecode é uma representação independente de plataforma 
de baixo nível do seu código-fonte, no entanto, não é o código de máquina binário 
e não pode ser executado diretamente pela máquina de destino. De fato, 
é um conjunto de instruções para uma máquina virtual chamada 
Python Virtual Machine (PVM).

