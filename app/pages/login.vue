<script setup lang="ts">
definePageMeta({
    layout: 'auth' // layout khusus tanpa navbar/sidebar
})

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginResponse } from '~/types';
// import { UButton, UInput, UCard } from '@nuxt/ui';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const auth = useAuth();

const login = async () => {
    error.value = '';
    loading.value = true;

    try {
        const res = await $fetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: { email: email.value, password: password.value },
        });

        if (!res.success) {
            error.value = res.error ?? 'Login failed';
            return;
        }

        // pakai useAuth
        auth.login(res.data!);

        router.push('/');
    } catch (e: any) {
        error.value = e.message;
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
        <UCard class="w-full max-w-md p-8 shadow-lg rounded-xl">
            <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Sign in to Dashboard</h1>

            <div v-if="error" class="mb-4 text-red-500 text-sm text-center">{{ error }}</div>

            <div class="flex flex-col gap-4">
                <UInput v-model="email" label="Email" placeholder="your@email.com" />
                <UInput v-model="password" type="password" label="Password" placeholder="••••••••" />

                <UButton :loading="loading" @click="login" color="primary" size="md">
                    {{ loading ? 'Logging in...' : 'Login' }}
                </UButton>
            </div>

            <div class="mt-6 text-center text-gray-500 text-sm">
                Don't have an account?
                <a href="/register" class="text-primary-600 hover:underline">Sign up</a>
            </div>
        </UCard>
    </div>
</template>
