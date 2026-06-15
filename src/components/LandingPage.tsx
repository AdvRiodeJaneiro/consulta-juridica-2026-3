import React, { useState } from 'react';
import { FIRM_LOGO } from '../constants';
import InputBar from './InputBar';
import { FileAttachment } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface LandingPageProps {
  onStartChat: (text: string, file?: FileAttachment) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const [attachedFile, setAttachedFile] = useState<FileAttachment | null>(null);

  const handleAttachFile = (file: FileAttachment | null) => {
    if (!user && file) {
      // Se não logado, remove o anexo do estado local e deixa o App.tsx disparar o modal ao enviar
      setAttachedFile(null);
      onStartChat('', file); // Dispara para abrir o modal de login preservando o arquivo
      return;
    }
    setAttachedFile(file);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl w-full space-y-8 mb-12">
        <img src={FIRM_LOGO} alt="Logo" className="h-28 mx-auto object-contain" />
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Consulta Jurídica <span className="text-champagne">IA</span>
        </h1>
        <p className="text-lg text-gray-400">Excelência jurídica com a agilidade da inteligência artificial.</p>
      </div>
      <div className="w-full max-w-3xl">
        <InputBar 
          onSend={(text) => onStartChat(text, attachedFile || undefined)} 
          placeholder="Descreva seu caso aqui..." 
          attachedFile={attachedFile} 
          onAttachFile={handleAttachFile} 
        />
      </div>
    </div>
  );
};

export default LandingPage;