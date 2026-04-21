"use client";

import { SUPPORTED_LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/use-i18n";

interface StepBasicsProps {
  name: string;
  audience: string;
  language: Locale;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function StepBasics({
  name,
  audience,
  language,
  onChange,
  onNext,
}: StepBasicsProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          {t("onboarding.headingBasics")}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {t("onboarding.subBasics")}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("onboarding.name")}{" "}
            <span className="text-gray-400">({t("common.optional")})</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("onboarding.language")}
          </label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {SUPPORTED_LOCALES.map((lang) => (
              <button
                key={lang}
                onClick={() => onChange("language", lang)}
                className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  language === lang
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {LOCALE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("onboarding.audience")}{" "}
            <span className="text-gray-400">({t("common.optional")})</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            {t("onboarding.audienceHint")}
          </p>
          <input
            type="text"
            value={audience}
            onChange={(e) => onChange("audience", e.target.value)}
            placeholder={t("onboarding.audiencePlaceholder")}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        {t("common.continue")}
      </button>
    </div>
  );
}
