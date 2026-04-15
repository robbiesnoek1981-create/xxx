import { useState, useCallback, useMemo } from 'react';
import type {
  FormState,
  ValidationResult,
  Wijk,
  Doelgroep,
  Leefdomein,
  KortContactMet,
} from '../types/form';

const INITIAL_STATE: FormState = {
  wijk: null,
  doelgroep: null,
  leefdomeinen: new Set<Leefdomein>(),
  kortContactMet: null,
};

export function useFormState() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const setWijk = useCallback((value: Wijk) => {
    setForm(prev => ({ ...prev, wijk: value }));
  }, []);

  const setDoelgroep = useCallback((value: Doelgroep) => {
    setForm(prev => ({ ...prev, doelgroep: value }));
  }, []);

  const setKortContactMet = useCallback((value: KortContactMet) => {
    setForm(prev => ({ ...prev, kortContactMet: value }));
  }, []);

  const toggleLeefdomein = useCallback((item: Leefdomein) => {
    setForm(prev => {
      const next = new Set(prev.leefdomeinen);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return { ...prev, leefdomeinen: next };
    });
  }, []);

  const resetForm = useCallback(() => {
    setForm({ ...INITIAL_STATE, leefdomeinen: new Set<Leefdomein>() });
    setShowSuccess(false);
    setShowConfirmation(false);
    setIsSubmitting(false);
  }, []);

  const validation = useMemo((): ValidationResult => {
    const errors: ValidationResult['errors'] = {};
    if (!form.wijk) errors.wijk = 'Selecteer een wijk';
    if (!form.doelgroep) errors.doelgroep = 'Selecteer een doelgroep';
    if (form.leefdomeinen.size === 0)
      errors.leefdomeinen = 'Selecteer minimaal één leefdomein';
    if (!form.kortContactMet)
      errors.kortContactMet = 'Selecteer wie het contact betrof';
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }, [form]);

  const emailBody = useMemo((): string => {
    const date = new Date().toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = new Date().toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const leefdomeinen =
      form.leefdomeinen.size > 0
        ? Array.from(form.leefdomeinen).join(', ')
        : '(geen geselecteerd)';

    return [
      'Korte Contacten Registratie',
      `Datum: ${date} om ${time}`,
      '',
      `Wijk: ${form.wijk ?? '(niet ingevuld)'}`,
      `Doelgroep: ${form.doelgroep ?? '(niet ingevuld)'}`,
      `Leefdomeinen: ${leefdomeinen}`,
      `Kort contact met: ${form.kortContactMet ?? '(niet ingevuld)'}`,
    ].join('\n');
  }, [form]);

  return {
    form,
    validation,
    emailBody,
    isSubmitting,
    setIsSubmitting,
    showConfirmation,
    setShowConfirmation,
    showSuccess,
    setShowSuccess,
    setWijk,
    setDoelgroep,
    setKortContactMet,
    toggleLeefdomein,
    resetForm,
  };
}
