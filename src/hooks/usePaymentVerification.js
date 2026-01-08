import { useEffect, useRef, useCallback } from 'react';
import { getPaymentStatus } from '../helpers/getPaymentStatus';

/**
 * Custom hook para verificación de pago con polling mejorado.
 * Resuelve el memory leak del código original implementando:
 * - Cleanup function apropiada
 * - Exponential backoff (5s → 30s)
 * - Máximo de intentos (60 intentos ~ 10-15 min)
 * - setTimeout en vez de setInterval para evitar overlaps
 */
const usePaymentVerification = ({
  invoice,
  enabled = true,
  onPaymentConfirmed,
  onError,
  options = {},
}) => {
  const {
    initialInterval = 5000,
    maxInterval = 30000,
    maxAttempts = 60,
    backoffMultiplier = 1.2,
  } = options;

  const timeoutRef = useRef(null);
  const attemptCountRef = useRef(0);
  const currentIntervalRef = useRef(initialInterval);
  const isRunningRef = useRef(false);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isRunningRef.current = false;
  }, []);

  const resetCounters = useCallback(() => {
    attemptCountRef.current = 0;
    currentIntervalRef.current = initialInterval;
  }, [initialInterval]);

  useEffect(() => {
    // No iniciar si no está habilitado o no hay invoice
    if (!enabled || !invoice) {
      cleanup();
      return;
    }

    // Reset counters cuando cambia el invoice
    resetCounters();
    isRunningRef.current = true;

    const checkPaymentStatus = async () => {
      // Verificar que seguimos activos
      if (!isRunningRef.current) {
        return;
      }

      try {
        attemptCountRef.current += 1;

        // Max attempts alcanzado
        if (attemptCountRef.current > maxAttempts) {
          cleanup();
          onError?.('Tiempo de espera agotado. Por favor genera un nuevo invoice.');
          return;
        }

        const status = await getPaymentStatus(invoice);

        // Verificar nuevamente que seguimos activos después del await
        if (!isRunningRef.current) {
          return;
        }

        if (status) {
          // Pago confirmado
          cleanup();
          onPaymentConfirmed?.();
        } else {
          // Pago no confirmado, programar siguiente check con backoff
          currentIntervalRef.current = Math.min(
            currentIntervalRef.current * backoffMultiplier,
            maxInterval
          );
          scheduleNextCheck();
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        // No detener el polling por errores de red, continuar intentando
        if (isRunningRef.current) {
          scheduleNextCheck();
        }
      }
    };

    const scheduleNextCheck = () => {
      if (!isRunningRef.current) {
        return;
      }
      timeoutRef.current = setTimeout(
        checkPaymentStatus,
        currentIntervalRef.current
      );
    };

    // Iniciar el primer check
    checkPaymentStatus();

    // Cleanup function - CRÍTICO para evitar memory leaks
    return cleanup;
  }, [
    invoice,
    enabled,
    onPaymentConfirmed,
    onError,
    maxAttempts,
    maxInterval,
    backoffMultiplier,
    cleanup,
    resetCounters,
  ]);

  return {
    attemptCount: attemptCountRef.current,
    currentInterval: currentIntervalRef.current,
    stop: cleanup,
  };
};

export default usePaymentVerification;
