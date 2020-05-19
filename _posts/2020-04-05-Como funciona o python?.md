---
layout: post
title: "COMO FUNCIONA A LINGUAGEM PYTHON?"
featured-img: python
categories: [Regras de Assiciação, Data Analysis, Rstudio]
---

O código fonte de uma linguagem de programação pode ser executado
usando um intérprete ou um **compilador**. Em uma linguagem compilada,
um compilador converterá o código-fonte diretamente em código de
máquina binário. Esse código de máquina é específico para essa
máquina de destino, pois cada máquina pode ter um sistema operacional
e hardware diferentes. Após a compilação, a máquina de destino executará
diretamente o código da máquina.

Em uma linguagem interpretada, o código fonte não é executado diretamente
pela máquina de destino. Há outro programa chamado intérprete que lê e executa
o código-fonte diretamente. O intérprete, específico da máquina de destino,
converte cada instrução do código-fonte em código de máquina e a executa.

O Python é geralmente chamado de linguagem interpretada, no entanto, 
combina compilação e interpretação. Quando executamos um 
código fonte (um arquivo com uma .pyextensão), o Python primeiro o compila 
em um **bytecode**. O bytecode é uma representação independente de plataforma 
de baixo nível do seu código-fonte, no entanto, não é o código de máquina binário 
e não pode ser executado diretamente pela máquina de destino. De fato, 
é um conjunto de instruções para uma máquina virtual chamada 
**Python Virtual Machine (PVM)**.

Após a compilação, o bytecode é enviado para execução no PVM. O PVM é um 
intérprete que executa o bytecode e faz parte do sistema Python. O bytecode 
é independente da plataforma, mas o PVM é específico para a máquina de destino. 
A implementação padrão da linguagem de programação Python é CPython, 
que é escrita na linguagem de programação C. O CPython compila o código-fonte 
python no bytecode, e esse bytecode é então executado pela 
máquina virtual CPython.

## Gerando arquivos de bytecode

No Python, o bytecode é armazenado em um ```.pyc```arquivo. No Python 3, 
os arquivos de bytecode são armazenados em uma pasta chamada 
```__pycache__```. Esta pasta é criada automaticamente quando você tenta 
importar outro arquivo que você criou:

```bash
import file_name 
```
No entanto, ele não será criado se não importarmos outro arquivo no código-fonte. 
Nesse caso, ainda podemos criá-lo manualmente. Para compilar os arquivos individuais 
```file_1.py``` a ```file_n.py``` partir da linha de comando, podemos escrever:

```bash 
python -m compileall file_1.py ... file_n.py
```


