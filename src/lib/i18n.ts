'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Supported languages
export type Locale = 'en' | 'hi'

// Translation keys
interface Translations {
  [key: string]: string | Record<string, string>
}

// English translations
const en: Translations = {
  // Navigation
  'nav.features': 'Features',
  'nav.aiChat': 'AI Chat',
  'nav.technology': 'Technology',
  'nav.dashboard': 'Dashboard',
  'nav.pricing': 'Pricing',
  'nav.settings': 'Settings',
  'nav.signIn': 'Sign In',
  'nav.getStarted': 'Get Started',
  
  // Hero Section
  'hero.title': 'Next Generation AI Experience',
  'hero.subtitle': 'NEXUS AI pushes the boundaries of artificial intelligence with advanced neural networks and cyberpunk-inspired design.',
  'hero.cta': 'Start Chatting',
  'hero.secondaryCta': 'Explore Features',
  
  // Features
  'features.title': 'Powerful Capabilities',
  'features.subtitle': 'Experience the future of AI interaction',
  'features.chat.title': 'Intelligent Chat',
  'features.chat.description': 'Advanced conversational AI with context awareness and personalized responses.',
  'features.vision.title': 'Vision Analysis',
  'features.vision.description': 'Upload images for detailed analysis, OCR, and visual understanding.',
  'features.code.title': 'Code Generation',
  'features.code.description': 'Generate, debug, and optimize code in any programming language.',
  'features.voice.title': 'Voice Input',
  'features.voice.description': 'Speak naturally and let AI convert your voice to text instantly.',
  
  // Chat Interface
  'chat.placeholder': 'Ask NEXUS AI anything...',
  'chat.send': 'Send',
  'chat.typing': 'NEXUS is thinking...',
  'chat.newChat': 'New Chat',
  'chat.history': 'History',
  'chat.settings': 'Settings',
  
  // Theme
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.system': 'System',
  
  // Auth
  'auth.login': 'Login',
  'auth.signup': 'Sign Up',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.noAccount': "Don't have an account?",
  'auth.hasAccount': 'Already have an account?',
  'auth.google': 'Continue with Google',
  
  // Pricing
  'pricing.title': 'Choose Your Plan',
  'pricing.free': 'Free',
  'pricing.pro': 'Pro',
  'pricing.enterprise': 'Enterprise',
  'pricing.monthly': '/month',
  'pricing.currentPlan': 'Current Plan',
  'pricing.upgrade': 'Upgrade',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.totalChats': 'Total Chats',
  'dashboard.activeToday': 'Active Today',
  'dashboard.totalUsers': 'Total Users',
  'dashboard.revenue': 'Revenue',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Retry',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.close': 'Close',
}

// Hindi translations
const hi: Translations = {
  // Navigation
  'nav.features': 'विशेषताएं',
  'nav.aiChat': 'AI चैट',
  'nav.technology': 'तकनीक',
  'nav.dashboard': 'डैशबोर्ड',
  'nav.pricing': 'मूल्य निर्धारण',
  'nav.settings': 'सेटिंग्स',
  'nav.signIn': 'साइन इन करें',
  'nav.getStarted': 'शुरू करें',
  
  // Hero Section
  'hero.title': 'अगली पीढ़ी का AI अनुभव',
  'hero.subtitle': 'NEXUS AI उन्नत न्यूरल नेटवर्क और साइबरपंक-प्रेरित डिज़ाइन के साथ कृत्रिम बुद्धिमत्ता की सीमाओं को आगे बढ़ाता है।',
  'hero.cta': 'चैटिंग शुरू करें',
  'hero.secondaryCta': 'विशेषताएं देखें',
  
  // Features
  'features.title': 'शक्तिशाली क्षमताएं',
  'features.subtitle': 'AI इंटरैक्शन का भविष्य अनुभव करें',
  'features.chat.title': 'बुद्धिमान चैट',
  'features.chat.description': 'संदर्भ जागरूकता और व्यक्तिगत प्रतिक्रियाओं के साथ उन्नत संवादात्मक AI.',
  'features.vision.title': 'विज़न विश्लेषण',
  'features.vision.description': 'विस्तृत विश्लेषण, OCR और विज़ुअल समझ के लिए इमेज अपलोड करें.',
  'features.code.title': 'कोड जनरेशन',
  'features.code.description': 'किसी भी प्रोग्रामिंग भाषा में कोड जनरेट, डीबग और ऑप्टिमाइज़ करें.',
  'features.voice.title': 'वॉइस इनपुट',
  'features.voice.description': 'स्वाभाविक रूप से बोलें और AI को आपकी आवाज़ को तुरंत टेक्स्ट में बदलने दें.',
  
  // Chat Interface
  'chat.placeholder': 'NEXUS AI से कुछ भी पूछें...',
  'chat.send': 'भेजें',
  'chat.typing': 'NEXUS सोच रहा है...',
  'chat.newChat': 'नई चैट',
  'chat.history': 'इतिहास',
  'chat.settings': 'सेटिंग्स',
  
  // Theme
  'theme.dark': 'डार्क',
  'theme.light': 'लाइट',
  'theme.system': 'सिस्टम',
  
  // Auth
  'auth.login': 'लॉगिन',
  'auth.signup': 'साइन अप करें',
  'auth.email': 'ईमेल',
  'auth.password': 'पासवर्ड',
  'auth.forgotPassword': 'पासवर्ड भूल गए?',
  'auth.noAccount': 'खाता नहीं है?',
  'auth.hasAccount': 'पहले से खाता है?',
  'auth.google': 'Google के साथ जारी रखें',
  
  // Pricing
  'pricing.title': 'अपना प्लान चुनें',
  'pricing.free': 'मुफ्त',
  'pricing.pro': 'प्रो',
  'pricing.enterprise': 'एंटरप्राइज़',
  'pricing.monthly': '/माह',
  'pricing.currentPlan': 'मौजूदा प्लान',
  'pricing.upgrade': 'अपग्रेड करें',
  
  // Dashboard
  'dashboard.title': 'डैशबोर्ड',
  'dashboard.totalChaps': 'कुल चैट्स',
  'dashboard.activeToday': 'आज सक्रिय',
  'dashboard.totalUsers': 'कुल उपयोगकर्ता',
  'dashboard.revenue': 'राजस्व',
  
  // Common
  'common.loading': 'लोड हो रहा है...',
  'common.error': 'कुछ गलत हो गया',
  'common.retry': 'पुन: प्रयास करें',
  'common.save': 'सहेजें',
  'common.cancel': 'रद्द करें',
  'common.delete': 'हटाएं',
  'common.edit': 'संपादित करें',
  'common.close': 'बंद करें',
}

// All translations
const translations: Record<Locale, Translations> = { en, hi }

// Context type
interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  availableLocales: { code: Locale; name: string; nativeName: string }[]
}

// Create context
const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Available locales info
const availableLocales = [
  { code: 'en' as Locale, name: 'English', nativeName: 'English' },
  { code: 'hi' as Locale, name: 'Hindi', nativeName: 'हिंदी' },
]

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus-locale') as Locale
      if (saved && translations[saved]) return saved
    }
    return 'en'
  })

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('nexus-locale', newLocale)
  }, [])

  const t = useCallback((key: string): string => {
    const translation = translations[locale]?.[key]
    
    if (typeof translation === 'string') {
      return translation
    }
    
    // Fallback to English
    const fallback = translations.en?.[key]
    if (typeof fallback === 'string') {
      return fallback
    }
    
    // Return key if no translation found
    return key
  }, [locale])

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, availableLocales }}>
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext)
  
  // Return default values during SSR or if not in provider
  if (!context) {
    return {
      locale: 'en' as Locale,
      setLocale: () => {},
      t: (key: string) => {
        // Fallback to English translations
        const translation = en[key]
        return typeof translation === 'string' ? translation : key
      },
      availableLocales,
    }
  }
  
  return context
}

export { translations, availableLocales }
