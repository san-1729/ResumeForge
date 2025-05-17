import React from 'react';
import { Menu } from '~/components/sidebar/Menu.client';
import { LinkedInToggle } from '~/components/linkedin/LinkedInToggle.client';

export const HeaderMenu: React.FC = () => (
  <div className="flex items-center gap-2 px-4 py-2">
    <Menu />
    <LinkedInToggle />
  </div>
);
