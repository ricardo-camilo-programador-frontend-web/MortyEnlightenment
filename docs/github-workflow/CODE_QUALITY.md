# Padroes de Qualidade - Nuxt

## Stack

| Tecnologia | Uso |
|------------|-----|
| Nuxt | Framework |
| Vue 3 | UI |
| TypeScript | Linguagem |
| TailwindCSS | Estilos |

## TypeScript

```typescript
// BOM
interface User {
  id: number
  name: string
}

const users = ref<User[]>([])
const isLoading = ref(false)
```

## Nuxt Patterns

### Pages
```vue
<!-- pages/users/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: user } = await useFetch<User>(`/api/users/${route.params.id}`)
</script>

<template>
  <div v-if="user">
    <h1>{{ user.name }}</h1>
  </div>
</template>
```

### Composables
```typescript
// composables/useUser.ts
export const useUser = () => {
  const user = useState<User | null>('user', () => null)
  
  async function fetchUser() {
    user.value = await $fetch('/api/user')
  }
  
  return { user, fetchUser }
}
```

### Server Routes
```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const users = await db.users.findMany()
  return users
})
```

## Comandos

```bash
npm run dev      # Dev server
npm run build    # Build
npm run preview  # Preview
npm run lint     # ESLint
```

## Checklist

- [ ] Composition API
- [ ] Auto-imports
- [ ] useFetch/useAsyncData
- [ ] Server routes tipados
- [ ] useState para estado global
