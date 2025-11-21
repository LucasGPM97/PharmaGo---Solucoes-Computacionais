## instalar as dependencias


```bash
cd backend
npm install

cd frontend
npm install
```

## Criar o banco de dados



```markdown
cd utilidades 
cmd -c "mysql -u [usuario] -p < sqlcreate.sql"
cmd /c "chcp 65001 > nul && mysql -u [usuario] -p [nome_do_banco] --default-character-set=utf8 < inserts_produto_atualizado.sql"
cmd /c "chcp 65001 > nul && mysql -u [usuario] -p [nome_do_banco] --default-character-set=utf8 < updates_precos.sql"
```

## Ajustar o .env
```bash
DB_HOST=[ip do host]
DB_USER=[usuario do db]
DB_PASSWORD=[senha do db]
DB_NAME=[nome do db]
DB_PORT=[porta do db]
NODE_ENV=development

JWT_SECRET=[chave jwt]
```


## Rodar o backend
```bash
npm start
```

## Rodar o frontend

```bash
npx expo start -c
```

## Conectar Frontend ao Backend
```bash
frontend > src > api > api.ts 
modificar o linha para o ip do seu backend.
export const API_URL = 'https://e85313154d2c.ngrok-free.app';

```
