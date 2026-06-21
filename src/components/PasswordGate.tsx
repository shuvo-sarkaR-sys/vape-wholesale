import { useEffect } from 'react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  useEffect(() => {
    onSuccess();
  }, [onSuccess]);

  return null;
}