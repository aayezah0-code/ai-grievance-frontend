'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import ta from '../locales/ta.json';
import ml from '../locales/ml.json';
import ur from '../locales/ur.json';

const translations = {
  en,
  hi,
  mr,
  gu,
  ta,
  ml,
  ur,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLang = localStorage.getItem('appLanguage');
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (let i = 0; i < keys.length; i++) {
      if (value && value[keys[i]] !== undefined) {
        value = value[keys[i]];
      } else {
        // Fallback to English if translation is missing
        let enValue = translations['en'];
        for (let j = 0; j < keys.length; j++) {
          if (enValue && enValue[keys[j]] !== undefined) {
            enValue = enValue[keys[j]];
          } else {
            return key; // return key itself if not found even in English
          }
        }
        return enValue;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
