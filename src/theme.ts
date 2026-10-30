import { Platform } from 'react-native';

export const colors = {
  bg: '#F6F8FC',
  surface: '#FFFFFF',
  glass: 'rgba(255,255,255,0.72)',
  border: 'rgba(15,40,90,0.08)',
  text: '#0B1B3A',
  muted: '#5B6B88',
  primary: '#2558E8',
  primaryDark: '#1C47C4',
  cyan: '#19C3E6',
  softBlue: '#E8F0FF',
  softCyan: '#E3F8FD',
  whatsapp: '#25D366',
};

export const WHATSAPP_NUMBER = '16469348752';

export const waLink = (text: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const shadow = Platform.select({
  web: { boxShadow: '0 10px 30px rgba(15,40,90,0.08)' } as object,
  default: {
    shadowColor: '#0F285A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
});

export const glass = Platform.select({
  web: { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' } as object,
  default: {},
});
