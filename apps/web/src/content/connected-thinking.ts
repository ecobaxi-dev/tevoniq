import type { Locale } from '@tevoniq/types';

export const connectedThinkingCopy: Record<
  Locale,
  { ecosystem: string; prompt: string; core: string; detail: string }
> = {
  en: {
    ecosystem: 'An integrated ecosystem',
    prompt: 'Open a layer demo. See the idea in motion.',
    core: 'Your business',
    detail: 'Inside the connection',
  },
  tr: {
    ecosystem: 'Bütünleşik bir ekosistem',
    prompt: 'Bir katman demosu açın. Fikri hareket halinde görün.',
    core: 'İşletmeniz',
    detail: 'Bağlantının içinde',
  },
  ar: {
    ecosystem: 'منظومة متكاملة',
    prompt: 'افتح عرضاً توضيحياً وشاهد الفكرة تتحرك.',
    core: 'أعمالك',
    detail: 'داخل هذا الترابط',
  },
};
