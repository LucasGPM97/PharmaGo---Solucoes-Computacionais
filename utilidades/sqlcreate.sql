CREATE DATABASE IF NOT EXISTS pharmago_db;
USE pharmago_db;
CREATE USER IF NOT EXISTS 'app'@'localhost' IDENTIFIED BY 'app';
GRANT SELECT, INSERT, UPDATE, DELETE ON pharmago_db.* TO 'app'@'localhost';
FLUSH PRIVILEGES;

CREATE TABLE IF NOT EXISTS cliente (
    idcliente int PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    documento_identificacao VARCHAR(100) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    numero_contato VARCHAR(45) NOT NULL,
    imagem_perfil_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estabelecimento (
    idestabelecimento int PRIMARY KEY AUTO_INCREMENT,
    cnpj VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    razao_social VARCHAR(100) NOT NULL,
    registro_anvisa VARCHAR(100) NOT NULL,
    responsavel_tecnico VARCHAR(100) NOT NULL,
    telefone_contato VARCHAR(20) NOT NULL,
    conta_bancaria VARCHAR(255) NOT NULL,
    raio_cobertura DECIMAL(10,2) NOT NULL,
    valor_minimo_entrega DECIMAL(10,2) NOT NULL,
    taxa_entrega DECIMAL(10,2) NOT NULL,
    logo_url VARCHAR(255),
    senha VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS endereco_cliente (
    idendereco_cliente int PRIMARY KEY AUTO_INCREMENT,
    cliente_idcliente int NOT NULL,
    uf VARCHAR(2) NOT NULL,
    nome_endereco VARCHAR(100) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    cep VARCHAR(8) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    latitude VARCHAR(100) NOT NULL,
    longitude VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_idcliente) REFERENCES cliente(idcliente)  
);


CREATE TABLE IF NOT EXISTS endereco_estabelecimento(
    idendereco_estabelecimento int PRIMARY KEY AUTO_INCREMENT,
    estabelecimento_idestabelecimento int NOT NULL,
    uf VARCHAR(2) NOT NULL,
    logradouro VARCHAR(100) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    cep VARCHAR(8) NOT NULL,
    latitude VARCHAR(100) NOT NULL,
    longitude VARCHAR(100) NOT NULL,
    ativo Boolean DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estabelecimento_idestabelecimento) REFERENCES estabelecimento(idestabelecimento)  
);

CREATE TABLE IF NOT EXISTS forma_pagamento (
    idforma_pagamento int PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);

INSERT INTO forma_pagamento (idforma_pagamento, nome, ativo) VALUES
(1, 'Cartão de Crédito/Débito', TRUE),
(2, 'PIX', TRUE),
(3, 'Pagamento na Entrega (Dinheiro/Máquina)', TRUE);

ALTER TABLE forma_pagamento AUTO_INCREMENT = 4;

CREATE TABLE IF NOT EXISTS produto (
    idproduto int PRIMARY KEY AUTO_INCREMENT,
    nome_comercial VARCHAR(255) NOT NULL,
    substancia_ativa VARCHAR(1600) NOT NULL,
    apresentacao VARCHAR(255) NOT NULL,
    registro_anvisa VARCHAR(100) NOT NULL,
    detentor_registro VARCHAR(100) NOT NULL,
    link_bula VARCHAR(255),
    preco_cmed DECIMAL(10,2),
    requer_receita BOOLEAN NOT NULL, 
    classe_terapeutica VARCHAR(100) NOT NULL,
    tipo_produto VARCHAR(100) NOT NULL,
    tarja VARCHAR(100) NOT NULL,
    forma_terapeutica VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catalogo(
    idcatalogo int PRIMARY KEY AUTO_INCREMENT,
    estabelecimento_idestabelecimento int NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estabelecimento_idestabelecimento) REFERENCES estabelecimento(idestabelecimento)
);

CREATE TABLE IF NOT EXISTS catalogo_produto (
    idcatalogo_produto int PRIMARY KEY AUTO_INCREMENT,
    produto_idproduto int NOT NULL,
    catalogo_idcatalogo int NOT NULL,
    disponibilidade BOOLEAN DEFAULT TRUE,
    valor_venda DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_catalogo_produto (produto_idproduto, catalogo_idcatalogo),
    FOREIGN KEY (catalogo_idcatalogo) REFERENCES catalogo(idcatalogo)  ,
    FOREIGN KEY (produto_idproduto) REFERENCES produto(idproduto)  
);

CREATE TABLE IF NOT EXISTS carrinho (
    idcarrinho int PRIMARY KEY AUTO_INCREMENT,
    cliente_idcliente int UNIQUE NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_idcliente) REFERENCES cliente(idcliente)  
);

CREATE TABLE IF NOT EXISTS carrinho_item (
    idcarrinho_item int PRIMARY KEY AUTO_INCREMENT,
    carrinho_idcarrinho int NOT NULL,
    catalogo_produto_idcatalogo_produto int NOT NULL,
    quantidade INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (carrinho_idcarrinho) REFERENCES carrinho(idcarrinho)  ,
    FOREIGN KEY (catalogo_produto_idcatalogo_produto) REFERENCES catalogo_produto(idcatalogo_produto)  
);

CREATE TABLE IF NOT EXISTS pedido (
    idpedido int PRIMARY KEY AUTO_INCREMENT,
    cliente_idcliente int NOT NULL,
    estabelecimento_idestabelecimento int NOT NULL,
    endereco_cliente_idendereco_cliente int NOT NULL,
    forma_pagamento_idforma_pagamento int NOT NULL,
    data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(100) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_idcliente) REFERENCES cliente(idcliente)  ,
    FOREIGN KEY (estabelecimento_idestabelecimento) REFERENCES estabelecimento(idestabelecimento)  ,
    FOREIGN KEY (endereco_cliente_idendereco_cliente) REFERENCES endereco_cliente(idendereco_cliente)  ,
    FOREIGN KEY (forma_pagamento_idforma_pagamento) REFERENCES forma_pagamento(idforma_pagamento)  ,
);

CREATE TABLE IF NOT EXISTS pedido_item (
    idpedido_item INT PRIMARY KEY AUTO_INCREMENT,
    pedido_idpedido INT NOT NULL,
    catalogo_produto_idcatalogo_produto INT NOT NULL, 
    quantidade INT NOT NULL,
    valor_unitario_venda DECIMAL(10,2) NOT NULL,
    valor_subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pedido_idpedido) 
        REFERENCES pedido(idpedido),
    FOREIGN KEY (catalogo_produto_idcatalogo_produto) 
        REFERENCES catalogo_produto(idcatalogo_produto)
);


CREATE TABLE IF NOT EXISTS receita_medica (
    idreceita_medica int PRIMARY KEY AUTO_INCREMENT,
    pedido_idpedido int NOT NULL,
    caminho_documento VARCHAR(255) NOT NULL,
    status_receita VARCHAR(8) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pedido_idpedido) REFERENCES pedido(idpedido)  
);


CREATE TABLE IF NOT EXISTS imagem_produto (
    idimagem_produto int PRIMARY KEY AUTO_INCREMENT,
    catalogo_produto_idcatalogo_produto int NOT NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (catalogo_produto_idcatalogo_produto) REFERENCES catalogo_produto(idcatalogo_produto)  
);

CREATE TABLE IF NOT EXISTS horario_funcionamento(
    idhorario_funcionamento int PRIMARY KEY AUTO_INCREMENT,
    estabelecimento_idestabelecimento int NOT NULL,
    dia INT NOT NULL,
    horario_abertura TIME NOT NULL,
    horario_fechamento TIME NOT NULL,
    fechado boolean default true NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estabelecimento_idestabelecimento) REFERENCES estabelecimento(idestabelecimento)  
);


CREATE TABLE IF NOT EXISTS farmacia_permissoes(
    idfarmacia_permissoes int PRIMARY KEY AUTO_INCREMENT,
    estabelecimento_idestabelecimento int NOT NULL,
    lista_anvisa VARCHAR(10) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo boolean default false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (estabelecimento_idestabelecimento) REFERENCES estabelecimento(idestabelecimento)  
);

CREATE TABLE IF NOT EXISTS substancia_controlada(
    idsubstancia_controlada int PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    lista_anvisa VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS produto_substancia_controlada(
    substancia_controlada_idsubstancia_controlada int NOT NULL,
    produto_idproduto int NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (substancia_controlada_idsubstancia_controlada, produto_idproduto),
    FOREIGN KEY (produto_idproduto) REFERENCES produto(idproduto),
    FOREIGN KEY (substancia_controlada_idsubstancia_controlada) REFERENCES substancia_controlada(idsubstancia_controlada)  
);
