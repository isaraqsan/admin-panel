<script setup lang="ts">
import { ref, watch, type PropType } from "vue";

const props = defineProps({
    modelValue: { type: File as PropType<File | null>, default: null },
    preview: { type: String as PropType<string | null>, default: null },
    width: { type: Number, default: 160 },
    height: { type: Number, default: 160 },
    label: { type: String, default: "Upload Image" },
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: File | null): void,
    (e: 'update:preview', value: string | null): void
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const localPreview = ref<string | null>(props.preview);

watch(() => props.preview, (val) => {
    localPreview.value = val;
});

const trigger = () => {
    if (!fileInput.value) {
        console.warn("File input not ready")
        return
    }
    fileInput.value.click()
}

const onFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0] ?? null
    console.log("Selected file:", file)

    emit("update:modelValue", file)

    if (file) {
        if (localPreview.value) URL.revokeObjectURL(localPreview.value)
        const url = URL.createObjectURL(file)
        localPreview.value = url
        emit("update:preview", url)
    } else {
        localPreview.value = null
        emit("update:preview", null)
    }
}

</script>


<template>
    <div class="flex items-center gap-6">
        <!-- Upload Box -->
        <div @click="trigger" class="relative cursor-pointer flex flex-col items-center justify-center
             rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700
             bg-white/40 dark:bg-gray-800/40
             hover:border-primary-500 hover:bg-primary-50/20
             transition-all backdrop-blur-sm group" :style="{ width: width + 'px', height: height + 'px' }">
            <i class="i-heroicons-photo text-4xl text-gray-400 group-hover:text-primary-500"></i>

            <p class="mt-2 text-sm text-gray-500 group-hover:text-primary-500">
                {{ localPreview ? "Change Image" : label }}
            </p>

            <input type="file" ref="fileInput"
                class="absolute inset-0 opacity-0 cursor-pointer z-50 pointer-events-auto" @change="onFileChange" />
        </div>

        <!-- Preview -->
        <transition name="fade">
            <img loading="lazy" v-if="localPreview" :src="localPreview" class="w-32 h-32 rounded-xl object-cover border border-gray-300
               dark:border-gray-700 shadow-lg" />
        </transition>
    </div>
</template>
