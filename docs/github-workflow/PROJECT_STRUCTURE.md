# Estrutura do Projeto - Morty Enlightenment

## Visao Geral

Aplicacao desenvolvida com Nuxt 3 e Vue 3.

## Diretorios

```
MortyEnlightenment/
├── app.vue                 # Componente raiz
├── components/             # Componentes Vue
│   └── *.vue               # Componentes auto-importados
├── layouts/                # Layouts Nuxt
│   └── default.vue         # Layout padrao
├── pages/                  # Rotas (auto-import)
│   └── index.vue           # Pagina inicial
├── composables/            # Composables Vue
│   └── use*.ts             # Composables auto-importados
├── models/                 # Modelos de dados
├── assets/                 # Assets processados
├── public/                 # Arquivos estaticos
├── docs/                   # Documentacao
│   └── github-workflow/    # Padroes GitHub
└── .github/                # Templates e CI/CD
```

## Convencoes

### Nomenclatura
- Componentes: PascalCase (UserCard.vue)
- Composables: camelCase com prefixo use (useAuth.ts)
- Paginas: kebab-case (user-profile.vue)

### Auto-imports
Nuxt auto-importa:
- Componentes de components/
- Composables de composables/
- Utilitarios de utils/

## Stack

| Camada | Tecnologia |
|--------|------------|
| Framework | Nuxt 3 |
| UI | Vue 3 |
| Estilos | TailwindCSS |
| Linguagem | TypeScript |
