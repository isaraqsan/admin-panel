// ~/composables/useAuthHelpers.ts
import { useAuth } from './useAuth'

export function getCurrentCompanyId(): number | null {
    const { user } = useAuth()

    // pakai yang ada di ref user (sudah login sebelumnya)
    if (user.value?.company?.id) return user.value.company.id

    // fallback: baca langsung dari localStorage kalau ref user belum di-set
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        const parsed = JSON.parse(storedUser)
        return parsed.company?.id ?? null
    }

    return null
}
