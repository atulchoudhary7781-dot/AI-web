'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type Locale = 'en' | 'hi'

// Translation keys
export type TranslationKey = 
  // Navigation
  | 'nav.features'
  | 'nav.aiChat'
  | 'nav.technology'
  | 'nav.signIn'
  | 'nav.getStarted'
  | 'nav.dashboard'
  | 'nav.pricing'
  | 'nav.settings'
  
  // Hero
  | 'hero.badge'
  | 'hero.title1'
  | 'hero.title2'
  | 'hero.subtitle'
  | 'hero.startExploring'
  | 'hero.watchDemo'
  | 'hero.neuralProcessing'
  | 'hero.lightningFast'
  | 'hero.secureDesign'
  | 'hero.accuracyRate'
  | 'hero.responseTime'
  | 'hero.apiCallsDaily'
  | 'hero.userRating'

  // Chat
  | 'chat.title'
  | 'chat.subtitle'
  | 'chat.placeholder'
  | 'chat.send'
  | 'chat.clear'
  | 'chat.copy'
  | 'chat.newChat'
  | 'chat.history'
  | 'chat.noHistory'
  | 'chat.deleteConfirm'
  | 'chat.rename'
  | 'chat.voiceInput'
  | 'chat.voiceNotSupported'
  | 'chat.listening'
  | 'chat.pressEnter'
  | 'chat.shiftEnter'

  // Theme
  | 'theme.dark'
  | 'theme.light'
  | 'theme.toggleAria'

  // Language
  | 'language.en'
  | 'language.hi'
  | 'language.select'

  // Auth
  | 'auth.login'
  | 'auth.signup'
  | 'auth.email'
  | 'auth.password'
  | 'auth.forgotPassword'
  | 'auth.orContinueWith'
  | 'auth.googleLogin'
  | 'auth.verificationSent'
  | 'auth.verifyEmail'
  | 'auth.resendVerification'
  | 'auth.verified'
  | 'auth.notVerified'

  // Dashboard
  | 'dashboard.title'
  | 'dashboard.totalUsers'
  | 'dashboard.totalChats'
  | 'dashboard.activeToday'
  | 'dashboard.revenue'
  | 'dashboard.recentActivity'
  | 'dashboard.chatVolume'
  | 'dashboard.userActivity'

  // Pricing
  | 'pricing.title'
  | 'pricing.subtitle'
  | 'pricing.free'
  | 'pricing.pro'
  | 'pricing.enterprise'
  | 'pricing.perMonth'
  | 'pricing.upgrade'
  | 'pricing.currentPlan'
  | 'pricing.getStarted'
  | 'pricing.contactSales'

  // Settings
  | 'settings.title'
  | 'settings.profile'
  | 'settings.account'
  | 'settings.preferences'
  | 'settings.notifications'
  | 'settings.language'
  | 'settings.theme'
  | 'settings.save'

  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.cancel'
  | 'common.confirm'
  | 'common.close'
  | 'common.search'
  | 'common.back'
  | 'common.next'
  | 'common.previous'

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.aiChat': 'AI Chat',
    'nav.technology': 'Technology',
    'nav.signIn': 'Sign In',
    'nav.getStarted': 'Get Started',
    'nav.dashboard': 'Dashboard',
    'nav.pricing': 'Pricing',
    'nav.settings': 'Settings',

    // Hero
    'hero.badge': 'Next Generation AI',
    'hero.title1': 'The Future of',
    'hero.title2': 'Artificial Intelligence',
    'hero.subtitle': 'Experience the next evolution of AI interaction. NEXUS AI combines cutting-edge neural networks with intuitive design to deliver superhuman intelligence at your fingertips.',
    'hero.startExploring': 'Start Exploring',
    'hero.watchDemo': 'Watch Demo',
    'hero.neuralProcessing': 'Neural Processing',
    'hero.lightningFast': 'Lightning Fast',
    'hero.secureDesign': 'Secure by Design',
    'hero.accuracyRate': 'Accuracy Rate',
    'hero.responseTime': 'Response Time',
    'hero.apiCallsDaily': 'API Calls Daily',
    'hero.userRating': 'User Rating',

    // Chat
    'chat.title': 'NEXUS AI Chat',
    'chat.subtitle': 'Neural Interface v2.0',
    'chat.placeholder': 'Send a message to NEXUS AI...',
    'chat.send': 'Send message',
    'chat.clear': 'Clear chat',
    'chat.copy': 'Copy message',
    'chat.newChat': 'New Chat',
    'chat.history': 'Chat History',
    'chat.noHistory': 'No chat history yet',
    'chat.deleteConfirm': 'Are you sure you want to delete this conversation?',
    'chat.rename': 'Rename chat',
    'chat.voiceInput': 'Voice input',
    'chat.voiceNotSupported': 'Voice input is not supported in your browser',
    'chat.listening': 'Listening...',
    'chat.pressEnter': 'Press Enter to send',
    'chat.shiftEnter': 'Shift+Enter for new line',

    // Theme
    'theme.dark': 'Dark mode',
    'theme.light': 'Light mode',
    'theme.toggleAria': 'Toggle theme',

    // Language
    'language.en': 'English',
    'language.hi': 'हिंदी',
    'language.select': 'Select Language',

    // Auth
    'auth.login': 'Log In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.orContinueWith': 'Or continue with',
    'auth.googleLogin': 'Continue with Google',
    'auth.verificationSent': 'Verification email sent',
    'auth.verifyEmail': 'Verify Email',
    'auth.resendVerification': 'Resend verification email',
    'auth.verified': 'Verified',
    'auth.notVerified': 'Not Verified',

    // Dashboard
    'dashboard.title': 'Analytics Dashboard',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.totalChats': 'Total Chats',
    'dashboard.activeToday': 'Active Today',
    'dashboard.revenue': 'Revenue',
    'dashboard.recentActivity': 'Recent Activity',
    'dashboard.chatVolume': 'Chat Volume (Last 7 Days)',
    'dashboard.userActivity': 'User Activity',

    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Select the perfect plan for your needs',
    'pricing.free': 'Free',
    'pricing.pro': 'Pro',
    'pricing.enterprise': 'Enterprise',
    'pricing.perMonth': '/month',
    'pricing.upgrade': 'Upgrade',
    'pricing.currentPlan': 'Current Plan',
    'pricing.getStarted': 'Get Started',
    'pricing.contactSales': 'Contact Sales',

    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.preferences': 'Preferences',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.theme': 'Theme',
    'settings.save': 'Save Changes',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.success': 'Success!',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.search': 'Search...',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
  },
  hi: {
    // Navigation
    'nav.features': 'सुविधाएं',
    'nav.aiChat': 'AI चैट',
    'nav.technology': 'तकनीक',
    'nav.signIn': 'साइन इन करें',
    'nav.getStarted': 'शुरू करें',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.pricing': 'मूल्य निर्धारण',
    'nav.settings': 'सेटिंग्स',

    // Hero
    'hero.badge': 'अगली पीढ़ी का AI',
    'hero.title1': 'का भविष्य',
    'hero.title2': 'कृत्रिम बुद्धिमत्ता',
    'hero.subtitle': 'AI इंटरैक्शन की अगली विकास का अनुभव करें। NEXUS AI अत्याधुनिक न्यूरल नेटवर्क को सहज डिज़ाइन के साथ मिलाकर आपकी उंगलियों पर मानव से भी अधिक बुद्धि प्रदान करता है।',
    'hero.startExploring': 'अन्वेषण शुरू करें',
    'hero.watchDemo': 'डेमो देखें',
    'hero.neuralProcessing': 'न्यूरल प्रोसेसिंग',
    'hero.lightningFast': 'तेज़-तर्रार',
    'hero.secureDesign': 'सुरक्षित डिज़ाइन',
    'hero.accuracyRate': 'सटीकता दर',
    'hero.responseTime': 'प्रतिक्रिया समय',
    'hero.apiCallsDaily': 'दैनिक API कॉल',
    'hero.userRating': 'उपयोगकर्ता रेटिंग',

    // Chat
    'chat.title': 'NEXUS AI चैट',
    'chat.subtitle': 'न्यूरल इंटरफेस v2.0',
    'chat.placeholder': 'NEXUS AI को संदेश भेजें...',
    'chat.send': 'संदेश भेजें',
    'chat.clear': 'चैट साफ़ करें',
    'chat.copy': 'संदेश कॉपी करें',
    'chat.newChat': 'नई चैट',
    'chat.history': 'चैट इतिहास',
    'chat.noHistory': 'अभी तक कोई चैट इतिहास नहीं',
    'chat.deleteConfirm': 'क्या आप सुनिश्चित हैं कि आप इस बातचीत को हटाना चाहते हैं?',
    'chat.rename': 'चैट का नाम बदलें',
    'chat.voiceInput': 'वॉइस इनपुट',
    'chat.voiceNotSupported': 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है',
    'chat.listening': 'सुन रहे हैं...',
    'chat.pressEnter': 'भेजने के लिए Enter दबाएं',
    'chat.shiftEnter': 'नई लाइन के लिए Shift+Enter',

    // Theme
    'theme.dark': 'डार्क मोड',
    'theme.light': 'लाइट मोड',
    'theme.toggleAria': 'थीम टॉगल करें',

    // Language
    'language.en': 'English',
    'language.hi': 'हिंदी',
    'language.select': 'भाषा चुनें',

    // Auth
    'auth.login': 'लॉग इन',
    'auth.signup': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgotPassword': 'पासवर्ड भूल गे?',
    'auth.orContinueWith': 'या इसके साथ जारी रखें',
    'auth.googleLogin': 'Google के साथ जारी रखें',
    'auth.verificationSent': 'सत्यापन ईमेल भेजा गया',
    'auth.verifyEmail': 'ईमेल सत्यापित करें',
    'auth.resendVerification': 'सत्यापन ईमेल फिर से भेजें',
    'auth.verified': 'सत्यापित',
    'auth.notVerified': 'सत्यापित नहीं',

    // Dashboard
    'dashboard.title': 'एनालिटिक्स डैशबोर्ड',
    'dashboard.totalUsers': 'कुल उपयोगकर्ता',
    'dashboard.totalChats': 'कुल चैट',
    'dashboard.activeToday': 'आज सक्रिय',
    'dashboard.revenue': 'राजस्व',
    'dashboard.recentActivity': 'हाल की गतिविधि',
    'dashboard.chatVolume': 'चैट वॉल्यूम (पिछले 7 दिन)',
    'dashboard.userActivity': 'उपयोगकर्ता गतिविधि',

    // Pricing
    'pricing.title': 'अपनी योजना चुनें',
    'pricing.subtitle': 'अपनी आवश्यकताओं के लिए सही योजना चुनें',
    'pricing.free': 'मुफ्त',
    'pricing.pro': 'प्रो',
    'pricing.enterprise': 'एंटरप्राइज़',
    'pricing.perMonth': '/माह',
    'pricing.upgrade': 'अपग्रेड',
    'pricing.currentPlan': 'वर्तमान योजना',
    'pricing.getStarted': 'शुरू करें',
    'pricing.contactSales': 'सेल्स से संपर्क करें',

    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.profile': 'प्रोफ़ाइल',
    'settings.account': 'खाता',
    'settings.preferences': 'प्राथमिकताएं',
    'settings.notifications': 'सूचनाएं',
    'settings.language': 'भाषा',
    'settings.theme': 'थीम',
    'settings.save': 'परिवर्तन सहेजें',

    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'एक त्रुटि हुई',
    'common.success': 'सफल!',
    'common.cancel': 'रद्द करें',
    'common.confirm': 'पुष्टि करें',
    'common.close': 'बंद करें',
    'common.search': 'खोजें...',
    'common.back': 'पीछे',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
  },
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('nexus-locale') as Locale | null
    if (stored && translations[stored]) {
      setLocaleState(stored)
    }
  }, [])

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('nexus-locale', newLocale)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key
  }, [locale])

  // RTL support ready - currently all languages are LTR
  const dir: 'ltr' | 'rtl' = 'ltr'

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export default I18nProvider
