import React from 'react';
import { DashaPeriod, YoginiPeriod, Language } from '../../types';
import { DashaDashboard } from './DashaDashboard';

interface VimshottariDashaSectionProps {
  dashaHierarchy: DashaPeriod[];
  tribhagiDashaHierarchy?: DashaPeriod[];
  yoginiDashaHierarchy?: YoginiPeriod[];
  unDeductedDashas?: {
    vimshottari120: DashaPeriod[];
    tribhagi80: DashaPeriod[];
    yogini72: YoginiPeriod[];
  };
  birthDate?: string;
  lang: Language;
}

export const VimshottariDashaSection: React.FC<VimshottariDashaSectionProps> = ({
  dashaHierarchy,
  tribhagiDashaHierarchy,
  yoginiDashaHierarchy,
  unDeductedDashas,
  birthDate,
  lang
}) => {
  return (
    <DashaDashboard
      dashaHierarchy={dashaHierarchy}
      tribhagiDashaHierarchy={tribhagiDashaHierarchy}
      yoginiDashaHierarchy={yoginiDashaHierarchy}
      unDeductedDashas={unDeductedDashas}
      birthDate={birthDate}
      lang={lang}
    />
  );
};

