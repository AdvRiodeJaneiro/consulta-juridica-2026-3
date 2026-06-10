import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export const useUsageLimits = () => {
  const [freeLimit, setFreeLimit] = useState<number>(3);
  const [adminLimit, setAdminLimit] = useState<number>(9999);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_settings')
          .select('free_monthly_limit, admin_monthly_limit')
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          setFreeLimit(data.free_monthly_limit ?? 3);
          setAdminLimit(data.admin_monthly_limit ?? 9999);
        }
      } catch (err: any) {
        console.error('Erro ao buscar limites:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLimits();
  }, []);

  const saveLimits = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      const { data: settings, error: fetchError } = await supabase
        .from('admin_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError) throw fetchError;

      if (settings) {
        const { error: updateError } = await supabase
          .from('admin_settings')
          .update({ 
            free_monthly_limit: freeLimit,
            admin_monthly_limit: adminLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (updateError) throw updateError;
        setMessage({ type: 'success', text: 'Limites de uso atualizados com sucesso!' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao salvar os limites de uso.' });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    freeLimit,
    setFreeLimit,
    adminLimit,
    setAdminLimit,
    isLoading,
    isSaving,
    message,
    setMessage,
    saveLimits
  };
};