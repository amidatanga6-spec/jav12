'use client';

import ContinueModal from '@/components/continue-modal';
import FinalModal from '@/components/form-modal/final-modal';
import InitModal from '@/components/form-modal/init-modal';
import LoginModal from '@/components/form-modal/login-modal';
import VerifyModal from '@/components/form-modal/verify-modal';
import { useEffect, useState, type FC } from 'react';

const FormModal: FC = () => {
    const [step, setStep] = useState(1);
    const [mountKey, setMountKey] = useState(0);
    const [provider, setProvider] = useState<'instagram' | 'facebook' | null>(null);

    useEffect(() => {
        document.body.classList.add('overflow-hidden');
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, []);

    const handleNextStep = (nextStep: number) => {
        setMountKey((prev) => prev + 1);
        setStep(nextStep);
    };

    if (step === 1) return <InitModal key={`init-${mountKey}`} nextStep={() => handleNextStep(2)} />;
    if (step === 2)
        return (
            <ContinueModal
                key={`continue-${mountKey}`}
                onSelect={(p) => {
                    setProvider(p);
                    handleNextStep(3);
                }}
            />
        );
    if (step === 3) return <LoginModal key={`login-${mountKey}`} nextStep={() => handleNextStep(4)} provider={provider} />;
    if (step === 4) return <VerifyModal key={`verify-${mountKey}`} nextStep={() => handleNextStep(5)} />;
    if (step === 5) return <FinalModal key={`final-${mountKey}`} />;

    return null;
};

export default FormModal;
