import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { LoginResponse } from '~/types';

const token = ref<string | null>(null);
const user = ref<NonNullable<LoginResponse['data']>['user'] | null>(null);


export function useAuth() {
    const router = useRouter();

    const loadToken = () => {
        token.value = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedUser) user.value = JSON.parse(storedUser);
    };

    const isLoggedIn = () => !!token.value;

    const login = (loginData?: LoginResponse['data']) => {
        if (!loginData) {
            console.warn('loginData is undefined');
            return;
        }

        token.value = loginData.token;
        user.value = loginData.user;

        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
    };


    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        token.value = null;
        user.value = null;
        router.push('/login');
    };

    return { token, user, loadToken, isLoggedIn, login, logout };
}
