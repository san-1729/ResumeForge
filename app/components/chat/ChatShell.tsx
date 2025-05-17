import React from 'react';
import { ResumeBackground } from '~/components/ui/ResumeBackground.client';
import { classNames } from '~/utils/classNames';

export const ChatShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResumeBackground>
    <div className={classNames('flex h-full w-full')}>{children}</div>
  </ResumeBackground>
);
