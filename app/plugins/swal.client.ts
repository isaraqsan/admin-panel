import Swal from 'sweetalert2'

// Plugin ini akan membuat $swal tersedia di mana saja
export default defineNuxtPlugin(() => {
    return {
        provide: {
            swal: Swal
        }
    }
})
