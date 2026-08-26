/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthModal } from './AuthModal';
import { AuthModalMode } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  return <AuthModal isOpen={isOpen} onClose={onClose} initialMode={initialMode} />;
};
