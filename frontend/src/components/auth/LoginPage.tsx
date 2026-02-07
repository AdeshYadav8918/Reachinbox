import { authAPI } from '../../services/api';
import { CardBody, CardContainer, CardItem } from '../ui/3d-card';
import { Mail } from 'lucide-react';

export const LoginPage = () => {
    const handleGoogleLogin = () => {
        window.location.href = authAPI.loginUrl;
    };

    const handleGuestLogin = async () => {
        try {
            // Attempt to hit the guest login route. 
            // If backend is online, it might redirect (which axios follows or we handle).
            // If offline, our interceptor returns mock data.
            await authAPI.guestLogin();
            // Force navigation to dashboard since we are "logged in" (either real or mock)
            window.location.href = '/dashboard';
        } catch (error) {
            console.error("Guest login failed", error);
            // Fallback for offline if interceptor didn't catch it
            window.location.href = '/dashboard';
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4">
            <CardContainer className="inter-var">
                <CardBody className="bg-white relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-auto sm:w-[30rem] h-auto rounded-xl p-8 border">
                    <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-neutral-600 dark:text-white"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <Mail className="h-5 w-5 text-white" />
                            </div>
                            <span>ReachInbox</span>
                        </div>
                    </CardItem>
                    <CardItem
                        as="p"
                        translateZ="60"
                        className="text-neutral-500 text-sm max-w-sm mt-2 dark:text-neutral-300"
                    >
                        The ultimate AI-driven email outreach platform.
                        Sign in to manage your campaigns.
                    </CardItem>

                    <div className="mt-8 space-y-4">
                        <CardItem translateZ="100" className="w-full">
                            <button
                                onClick={handleGoogleLogin}
                                className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-xl hover:bg-gray-800 transition-colors"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21.81-.63z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Sign in with Google
                            </button>
                        </CardItem>

                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-2 text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <CardItem translateZ="80" className="w-full">
                            <button
                                onClick={handleGuestLogin}
                                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 duration-200 hover:bg-gray-200 transition-colors"
                            >
                                Guest Access (Skip Login)
                            </button>
                        </CardItem>

                        <CardItem translateZ="90" className="w-full mt-4">
                            <button
                                onClick={() => {
                                    localStorage.setItem('demo_mode', 'true');
                                    window.location.href = '/dashboard';
                                }}
                                className="w-full rounded-xl border border-indigo-600 px-4 py-3 text-sm font-semibold text-indigo-600 duration-200 hover:bg-indigo-50 transition-colors dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                            >
                                View Demo (Frontend Only)
                            </button>
                        </CardItem>
                    </div>
                </CardBody>
            </CardContainer>
        </div>
    );
};
